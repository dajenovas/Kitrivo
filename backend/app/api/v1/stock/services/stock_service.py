from typing import Optional, Tuple, List
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import or_
from fastapi import HTTPException, status
from app.models.product import Product
from app.models.stock import StockTransaction
from app.api.v1.stock.schemas import StockAdjustmentRequest, StockOverviewItem, StockSummaryResponse, StockTransactionResponse

class StockService:

    @staticmethod
    def get_stock_overview(
        db: Session,
        q: Optional[str] = None,
        category_id: Optional[int] = None,
        status_filter: Optional[str] = None,
        low_stock_threshold: int = 5
    ) -> StockSummaryResponse:
        query = db.query(Product).options(joinedload(Product.category))

        if category_id:
            query = query.filter(Product.category_id == category_id)

        if status_filter:
            query = query.filter(Product.status == status_filter)

        if q:
            pattern = f"%{q}%"
            query = query.filter(
                or_(
                    Product.product_name.ilike(pattern),
                    Product.product_id.ilike(pattern)
                )
            )

        products = query.order_by(Product.product_name.asc()).all()

        total_products = len(products)
        total_stock_units = sum(p.stock_quantity for p in products)
        out_of_stock_count = sum(1 for p in products if p.stock_quantity <= 0 or p.status == "OUT_OF_STOCK")
        low_stock_count = sum(1 for p in products if 0 < p.stock_quantity <= low_stock_threshold)

        items = [
            StockOverviewItem(
                product_id=p.id,
                sku=p.product_id,
                product_name=p.product_name,
                category_name=p.category.name if p.category else None,
                price=p.price,
                stock_quantity=p.stock_quantity,
                status=p.status,
                updated_at=p.updated_at
            )
            for p in products
        ]

        return StockSummaryResponse(
            total_products=total_products,
            total_stock_units=total_stock_units,
            out_of_stock_count=out_of_stock_count,
            low_stock_count=low_stock_count,
            items=items
        )

    @staticmethod
    def adjust_stock(db: Session, request: StockAdjustmentRequest) -> StockOverviewItem:
        product = db.query(Product).filter(Product.id == request.product_id).first()
        if not product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Product with ID {request.product_id} not found."
            )

        previous_quantity = product.stock_quantity

        if request.is_absolute:
            new_quantity = max(0, request.quantity_change)
            change_amount = new_quantity - previous_quantity
        else:
            new_quantity = max(0, previous_quantity + request.quantity_change)
            change_amount = new_quantity - previous_quantity

        product.stock_quantity = new_quantity

        # Automatic status logic: 0 or less -> OUT_OF_STOCK; > 0 -> ACTIVE
        if new_quantity <= 0:
            product.status = "OUT_OF_STOCK"
        elif product.status == "OUT_OF_STOCK":
            product.status = "ACTIVE"

        # Log transaction
        tx = StockTransaction(
            product_id=product.id,
            change_amount=change_amount,
            previous_quantity=previous_quantity,
            new_quantity=new_quantity,
            transaction_type="STOCK_ADJUST" if not request.is_absolute else "STOCK_SET",
            notes=request.notes or "Manual stock adjustment"
        )
        db.add(tx)
        db.commit()
        db.refresh(product)

        return StockOverviewItem(
            product_id=product.id,
            sku=product.product_id,
            product_name=product.product_name,
            category_name=product.category.name if product.category else None,
            price=product.price,
            stock_quantity=product.stock_quantity,
            status=product.status,
            updated_at=product.updated_at
        )

    @staticmethod
    def get_transactions(db: Session, limit: int = 50) -> List[StockTransactionResponse]:
        txs = db.query(StockTransaction).order_by(StockTransaction.created_at.desc()).limit(limit).all()
        res = []
        for t in txs:
            res.append(
                StockTransactionResponse(
                    id=t.id,
                    product_id=t.product_id,
                    product_name=t.product.product_name if t.product else f"Product #{t.product_id}",
                    change_amount=t.change_amount,
                    previous_quantity=t.previous_quantity,
                    new_quantity=t.new_quantity,
                    transaction_type=t.transaction_type,
                    reference_id=t.reference_id,
                    notes=t.notes,
                    created_at=t.created_at
                )
            )
        return res
