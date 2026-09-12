from fastapi import APIRouter
from app.api.v1.auth.router import router as auth_router
from app.api.v1.users.router import router as users_router
from app.api.v1.roles.router import router as roles_router
from app.api.v1.permissions.router import router as permissions_router
from app.api.v1.products.routers.product_router import router as product_router
from app.api.v1.resources.router import router as resources_router
from app.api.v1.quotations.router import router as quotations_router
from app.api.v1.upload_router import router as upload_router
from app.api.v1.companies.router import router as companies_router
from app.api.v1.stock.routers.stock_router import router as stock_router
from app.api.v1.payments.routers.payment_router import router as payment_router
from app.api.v1.bills.router import router as bills_router

api_v1_router = APIRouter()

api_v1_router.include_router(auth_router)
api_v1_router.include_router(users_router)
api_v1_router.include_router(roles_router)
api_v1_router.include_router(permissions_router)
api_v1_router.include_router(product_router)
api_v1_router.include_router(resources_router)
api_v1_router.include_router(quotations_router)
api_v1_router.include_router(upload_router)
api_v1_router.include_router(companies_router)
api_v1_router.include_router(stock_router)
api_v1_router.include_router(payment_router)
api_v1_router.include_router(bills_router)






