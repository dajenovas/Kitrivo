import logging
from sqlalchemy.orm import Session
from app.core.database import SessionLocal, engine, Base
from app.core.security import get_password_hash
from app.models import User, Role, Permission, Product, ProductCategory, TokenBlocklist, Company

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Sample SVG icons for sidebar menus
DASHBOARD_SVG = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="9"/><rect x="14" y="3" width="7" height="5"/><rect x="14" y="12" width="7" height="9"/><rect x="3" y="16" width="7" height="5"/></svg>'
USERS_SVG = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>'
ROLES_SVG = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>'
PERMISSIONS_SVG = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>'
PRODUCT_SVG = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>'
SHOWCASE_SVG = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>'
LAB_MANUAL_SVG = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path><path d="M8 7h8"></path><path d="M8 11h8"></path></svg>'
DEMO_VIDEO_SVG = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="23 7 16 12 23 17 23 7"></polygon><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect></svg>'
COMPANY_SVG = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"/><line x1="9" y1="6" x2="9" y2="6.01"/><line x1="15" y1="6" x2="15" y2="6.01"/><line x1="9" y1="10" x2="9" y2="10.01"/><line x1="15" y1="10" x2="15" y2="10.01"/><line x1="9" y1="14" x2="9" y2="14.01"/><line x1="15" y1="14" x2="15" y2="14.01"/><path d="M10 22v-4h4v4"/></svg>'
STOCK_SVG = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>'
QUOTATION_SVG = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>'
BILL_SVG = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>'





def seed_db(db: Session) -> None:
    # 1. Seed Permissions
    permissions_data = [
        {
            "name": "Dashboard",
            "code": "DASHBOARD_VIEW",
            "module": "Dashboard",
            "description": "Dashboard sidebar menu access",
            "is_menu": True,
            "icon": DASHBOARD_SVG,
            "path": "/dashboard",
            "sort_order": 1,
        },
        {
            "name": "User Management",
            "code": "USER_READ",
            "module": "User & Access Management",
            "description": "View user accounts and list menu",
            "is_menu": True,
            "icon": USERS_SVG,
            "path": "/users",
            "sort_order": 1,
        },
        {
            "name": "Create User",
            "code": "USER_CREATE",
            "module": "User & Access Management",
            "description": "Permission to create new user accounts",
            "is_menu": False,
            "icon": None,
            "path": None,
            "sort_order": 0,
        },
        {
            "name": "Update User",
            "code": "USER_UPDATE",
            "module": "User & Access Management",
            "description": "Permission to edit existing users",
            "is_menu": False,
            "icon": None,
            "path": None,
            "sort_order": 0,
        },
        {
            "name": "Delete User",
            "code": "USER_DELETE",
            "module": "User & Access Management",
            "description": "Permission to delete user accounts",
            "is_menu": False,
            "icon": None,
            "path": None,
            "sort_order": 0,
        },
        {
            "name": "Reset User Password",
            "code": "USER_PASSWORD_RESET",
            "module": "User & Access Management",
            "description": "Permission to reset user passwords without knowing the original password",
            "is_menu": False,
            "icon": None,
            "path": None,
            "sort_order": 0,
        },
        {
            "name": "Role Management",
            "code": "ROLE_READ",
            "module": "User & Access Management",
            "description": "View system roles and list menu",
            "is_menu": True,
            "icon": ROLES_SVG,
            "path": "/roles",
            "sort_order": 2,
        },
        {
            "name": "Create Role",
            "code": "ROLE_CREATE",
            "module": "User & Access Management",
            "description": "Permission to create new system roles",
            "is_menu": False,
            "icon": None,
            "path": None,
            "sort_order": 0,
        },
        {
            "name": "Update Role",
            "code": "ROLE_UPDATE",
            "module": "User & Access Management",
            "description": "Permission to edit roles and assign permissions",
            "is_menu": False,
            "icon": None,
            "path": None,
            "sort_order": 0,
        },
        {
            "name": "Delete Role",
            "code": "ROLE_DELETE",
            "module": "User & Access Management",
            "description": "Permission to delete system roles",
            "is_menu": False,
            "icon": None,
            "path": None,
            "sort_order": 0,
        },
        {
            "name": "Permission Management",
            "code": "PERMISSION_READ",
            "module": "User & Access Management",
            "description": "View system permissions list menu",
            "is_menu": True,
            "icon": PERMISSIONS_SVG,
            "path": "/permissions",
            "sort_order": 3,
        },
        {
            "name": "Create Permission",
            "code": "PERMISSION_CREATE",
            "module": "User & Access Management",
            "description": "Permission to create new permissions",
            "is_menu": False,
            "icon": None,
            "path": None,
            "sort_order": 0,
        },
        {
            "name": "Update Permission",
            "code": "PERMISSION_UPDATE",
            "module": "User & Access Management",
            "description": "Permission to update existing permissions",
            "is_menu": False,
            "icon": None,
            "path": None,
            "sort_order": 0,
        },
        {
            "name": "Delete Permission",
            "code": "PERMISSION_DELETE",
            "module": "User & Access Management",
            "description": "Permission to delete permissions",
            "is_menu": False,
            "icon": None,
            "path": None,
            "sort_order": 0,
        },
        {
            "name": "Products",
            "code": "PRODUCT_READ",
            "module": "Product & Catalog Management",
            "description": "View product catalog and inventory menu",
            "is_menu": True,
            "icon": PRODUCT_SVG,
            "path": "/products",
            "sort_order": 1,
        },
        {
            "name": "Stock Management",
            "code": "STOCK_READ",
            "module": "Product & Catalog Management",
            "description": "View and manage inventory stock levels",
            "is_menu": True,
            "icon": STOCK_SVG,
            "path": "/stock",
            "sort_order": 2,
        },
        {
            "name": "Product Showcase",
            "code": "PRODUCT_SHOWCASE_VIEW",
            "module": "Product & Catalog Management",
            "description": "Client-facing product showcase and catalog view",
            "is_menu": True,
            "icon": SHOWCASE_SVG,
            "path": "/showcase",
            "sort_order": 3,
        },
        {
            "name": "Quotation History",
            "code": "QUOTATIONS_READ",
            "module": "Sales & Billing",
            "description": "View generated quotation history and soft copies",
            "is_menu": True,
            "icon": QUOTATION_SVG,
            "path": "/quotations",
            "sort_order": 1,
        },
        {
            "name": "Billing History",
            "code": "BILLS_READ",
            "module": "Sales & Billing",
            "description": "View generated tax invoices and billing history",
            "is_menu": True,
            "icon": BILL_SVG,
            "path": "/bills",
            "sort_order": 2,
        },

        {
            "name": "Create Product",
            "code": "PRODUCT_CREATE",
            "module": "Product & Catalog Management",
            "description": "Permission to create new products",
            "is_menu": False,
            "icon": None,
            "path": None,
            "sort_order": 0,
        },
        {
            "name": "Update Product",
            "code": "PRODUCT_UPDATE",
            "module": "Product & Catalog Management",
            "description": "Permission to edit existing products",
            "is_menu": False,
            "icon": None,
            "path": None,
            "sort_order": 0,
        },
        {
            "name": "Delete Product",
            "code": "PRODUCT_DELETE",
            "module": "Product & Catalog Management",
            "description": "Permission to delete products",
            "is_menu": False,
            "icon": None,
            "path": None,
            "sort_order": 0,
        },
        {
            "name": "Lab Manuals",
            "code": "LAB_MANUAL_READ",
            "module": "Digital Resources",
            "description": "View, search, and download product lab manuals",
            "is_menu": True,
            "icon": LAB_MANUAL_SVG,
            "path": "/lab-manuals",
            "sort_order": 1,
        },
        {
            "name": "Demo Videos",
            "code": "DEMO_VIDEO_READ",
            "module": "Digital Resources",
            "description": "View, search, and watch product demo videos",
            "is_menu": True,
            "icon": DEMO_VIDEO_SVG,
            "path": "/demo-videos",
            "sort_order": 2,
        },
        {
            "name": "Company Management",
            "code": "COMPANY_READ",
            "module": "Organization",
            "description": "View company details and manage organization profile",
            "is_menu": True,
            "icon": COMPANY_SVG,
            "path": "/companies",
            "sort_order": 1,
        },
        {
            "name": "Create Company",
            "code": "COMPANY_CREATE",
            "module": "Organization",
            "description": "Permission to add new companies",
            "is_menu": False,
            "icon": None,
            "path": None,
            "sort_order": 0,
        },
        {
            "name": "Update Company",
            "code": "COMPANY_UPDATE",
            "module": "Organization",
            "description": "Permission to edit existing company details",
            "is_menu": False,
            "icon": None,
            "path": None,
            "sort_order": 0,
        },
        {
            "name": "Delete Company",
            "code": "COMPANY_DELETE",
            "module": "Organization",
            "description": "Permission to delete companies",
            "is_menu": False,
            "icon": None,
            "path": None,
            "sort_order": 0,
        },
        {
            "name": "Set Active Company",
            "code": "COMPANY_SET_ACTIVE",
            "module": "Organization",
            "description": "Permission to set active company for quotations",
            "is_menu": False,
            "icon": None,
            "path": None,
            "sort_order": 0,
        },
    ]



    perm_map = {}
    for p_data in permissions_data:
        perm = db.query(Permission).filter(Permission.code == p_data["code"]).first()
        if not perm:
            perm = Permission(**p_data)
            db.add(perm)
            db.commit()
            db.refresh(perm)
            logger.info(f"Seeded Permission: {perm.code}")
        else:
            perm.name = p_data.get("name")
            perm.module = p_data.get("module")
            perm.description = p_data.get("description")
            perm.is_menu = p_data.get("is_menu")
            perm.icon = p_data.get("icon")
            perm.path = p_data.get("path")
            perm.sort_order = p_data.get("sort_order")
            db.commit()
        perm_map[perm.code] = perm

    all_permissions = list(perm_map.values())

    # 2. Seed Roles
    roles_definition = [
        {
            "name": "SuperAdmin",
            "code": "ROLE_SUPERADMIN",
            "description": "Full access to all system resources",
            "permissions": all_permissions
        },
        {
            "name": "Admin",
            "code": "ROLE_ADMIN",
            "description": "Full administrative permissions",
            "permissions": all_permissions
        },
        {
            "name": "Standard User",
            "code": "ROLE_USER",
            "description": "Basic user access with Dashboard view",
            "permissions": [perm_map["DASHBOARD_VIEW"]] if "DASHBOARD_VIEW" in perm_map else []
        }
    ]

    super_admin_role = None
    for r_data in roles_definition:
        role = db.query(Role).filter(Role.code == r_data["code"]).first()
        if not role:
            role = Role(
                name=r_data["name"],
                code=r_data["code"],
                description=r_data["description"],
                permissions=r_data["permissions"]
            )
            db.add(role)
            db.commit()
            db.refresh(role)
            logger.info(f"Seeded Role: {role.code}")
        else:
            role.permissions = r_data["permissions"]
            db.commit()

        if role.code == "ROLE_SUPERADMIN":
            super_admin_role = role

    # 3. Seed Default SuperAdmin User
    admin_user = db.query(User).filter(User.email == "admin@example.com").first()
    if not admin_user:
        admin_user = User(
            email="admin@example.com",
            username="admin",
            employee_id="EMP001",
            full_name="System Administrator",
            hashed_password=get_password_hash("Admin@123!"),
            is_active=True,
            roles=[super_admin_role] if super_admin_role else []
        )
        db.add(admin_user)
        db.commit()
        logger.info("Seeded default SuperAdmin user: admin@example.com / Admin@123!")

    # 4. Seed Product Categories
    categories_data = [
        {
            "name": "Digital Trainers",
            "code": "CAT-DIGITAL-TRAINERS",
            "description": "Digital IC and Microcontroller Training Equipment"
        },
        {
            "name": "Signal Generators",
            "code": "CAT-SIGNAL-GEN",
            "description": "Function, Arbitrary, and Pulse Signal Generators"
        },
        {
            "name": "Test & Measurement",
            "code": "CAT-TEST-MEASURE",
            "description": "Oscilloscopes, Multimeters, and Power Supplies"
        }
    ]

    cat_map = {}
    for c_data in categories_data:
        cat = db.query(ProductCategory).filter(ProductCategory.code == c_data["code"]).first()
        if not cat:
            cat = ProductCategory(**c_data)
            db.add(cat)
            db.commit()
            db.refresh(cat)
            logger.info(f"Seeded Product Category: {cat.name}")
        cat_map[cat.code] = cat

    # 5. Seed Sample Products with Dynamic Specifications & Dimensions
    sample_products = [
        {
            "product_id": "PRD-DIG-001",
            "product_name": "Advanced Digital IC Trainer Kit",
            "category_id": cat_map["CAT-DIGITAL-TRAINERS"].id,
            "hsn_code": "8542.31.00",
            "model_number": "DICT-9000X",
            "description": "Comprehensive Digital Electronics Training Kit for engineering institutions and R&D labs.",
            "price": 24500.0,
            "stock_quantity": 15,
            "status": "ACTIVE",

            "images": [
                "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80",
                "https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=800&q=80",
                "https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?auto=format&fit=crop&w=800&q=80"
            ],
            "specifications": {
                "Input Voltage": "230V AC ±10%, 50Hz",
                "IC Support": "74 Series TTL & 4000 Series CMOS",
                "Number of Inputs": "16 Logic Level Inputs with LED Status",
                "Number of Outputs": "16 Logic Level Indicators",
                "Display Type": "7-Segment LED Display (4 Output Digits)",
                "Logic Family": "TTL / CMOS"
            },
            "catalog_document": {
                "title": "Digital IC Trainer Datasheet 2026",
                "url": "https://example.com/catalogs/dict-9000x.pdf",
                "file_type": "pdf"
            },
            "lab_manual": {
                "title": "Advanced Digital IC Trainer Practical Lab Manual & Experiment Guide",
                "url": "http://localhost:8000/uploads/sample_lab_manual.pdf",
                "file_type": "pdf"
            },
            "demo_video": {
                "title": "DICT-9000X Equipment Overview & Practical Setup Demo Video",
                "url": "http://localhost:8000/uploads/sample_demo_video.mp4",
                "file_type": "mp4"
            },
            "warranty_service": {
                "warranty_period": "2 Years",
                "service_type": "Onsite & Technical Support",
                "terms": "Full replacement of defective logic board within warranty period."
            },
            "dimensions": {
                "height": 12.5,
                "height_unit": "cm",
                "width": 38.0,
                "width_unit": "cm",
                "length": 28.0,
                "length_unit": "cm",
                "weight": 4.2,
                "weight_unit": "kg"
            }
        },
        {
            "product_id": "PRD-FGEN-002",
            "product_name": "Precision DDS Function Generator",
            "category_id": cat_map["CAT-SIGNAL-GEN"].id,
            "hsn_code": "9030.84.00",
            "model_number": "FG-DDS-20M",
            "description": "High-precision Direct Digital Synthesis function generator with dual output channels.",
            "price": 18900.0,
            "stock_quantity": 12,
            "status": "ACTIVE",

            "images": [
                "https://images.unsplash.com/photo-1581092334651-ddf26d9a09d0?auto=format&fit=crop&w=800&q=80",
                "https://images.unsplash.com/photo-1581092162384-8987c1d64718?auto=format&fit=crop&w=800&q=80",
                "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=800&q=80"
            ],
            "specifications": {
                "Frequency Range": "0.1 Hz to 20 MHz",
                "Waveform": "Sine, Square, Triangle, Ramp, Pulse, TTL",
                "Amplitude": "0 to 20V p-p (Open Circuit)",
                "DC Offset": "±10V adjustable",
                "Frequency Accuracy": "±0.005% (50 ppm)",
                "Output Impedance": "50 Ohms ±10%"
            },
            "catalog_document": {
                "title": "FG-DDS-20M Technical Brochure",
                "url": "https://example.com/catalogs/fg-dds-20m.pdf",
                "file_type": "pdf"
            },
            "warranty_service": {
                "warranty_period": "1 Year",
                "service_type": "Carry-in Calibration Service",
                "terms": "Includes annual free calibration certificate."
            },
            "dimensions": {
                "height": 10.0,
                "height_unit": "cm",
                "width": 26.0,
                "width_unit": "cm",
                "length": 22.0,
                "length_unit": "cm",
                "weight": 2.8,
                "weight_unit": "kg"
            }
        }
    ]

    for p_data in sample_products:
        p = db.query(Product).filter(Product.product_id == p_data["product_id"]).first()
        if not p:
            p = Product(**p_data)
            db.add(p)
            db.commit()
            logger.info(f"Seeded Product: {p.product_name} ({p.product_id})")

    # 6. Seed Default Active Company
    existing_company = db.query(Company).first()
    if not existing_company:
        default_comp = Company(
            company_name="Kitrivo Equipment Systems",
            logo_url=None,
            gst_number="33AAACK1234F1Z9",
            pan_number="AAACK1234F",
            address="Plot No. 45, Technology Park, Industrial Estate, Chennai, Tamil Nadu - 600032",
            billing_address="Plot No. 45, Technology Park, Industrial Estate, Chennai, Tamil Nadu - 600032",
            email="info@kitrivo.com",
            phone="+91 44 2345 6789",
            website="https://www.kitrivo.com",
            is_active=True
        )
        db.add(default_comp)
        db.commit()
        logger.info(f"Seeded default active Company: {default_comp.company_name}")



def run_migrations():
    from sqlalchemy import text
    try:
        with engine.begin() as conn:
            conn.execute(text("ALTER TABLE products ADD COLUMN IF NOT EXISTS lab_manual JSON;"))
            conn.execute(text("ALTER TABLE products ADD COLUMN IF NOT EXISTS demo_video JSON;"))
            conn.execute(text("ALTER TABLE products ADD COLUMN IF NOT EXISTS stock_quantity INTEGER DEFAULT 0 NOT NULL;"))
            logger.info("Database migrations applied successfully (lab_manual, demo_video & stock_quantity columns verified).")
    except Exception as e:
        logger.warning(f"Database migration notice: {e}")


def init_db():
    run_migrations()
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        seed_db(db)

    finally:
        db.close()


if __name__ == "__main__":
    init_db()
