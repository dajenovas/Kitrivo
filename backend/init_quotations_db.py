from app.core.database import engine, Base
from app.models.quotation import Quotation

def create_quotations_table():
    print("Creating quotations database table if not exists...")
    Base.metadata.create_all(bind=engine)
    print("Quotations table verified/created successfully!")

if __name__ == "__main__":
    create_quotations_table()
