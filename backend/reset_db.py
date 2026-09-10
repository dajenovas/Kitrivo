import logging
import sys
import os
from sqlalchemy import text

# Ensure backend root is in sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.core.database import engine, Base, SessionLocal
from app.seed import seed_db

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def reset_database():
    logger.info("Dropping all existing database tables...")

    with engine.connect() as conn:
        if engine.name == "postgresql":
            # Cascade drop schema in PostgreSQL to handle foreign key dependencies cleanly
            conn.execute(text("DROP SCHEMA public CASCADE;"))
            conn.execute(text("CREATE SCHEMA public;"))
            conn.commit()
            logger.info("PostgreSQL schema reset completed.")
        else:
            Base.metadata.drop_all(bind=engine)

    logger.info("Creating fresh database tables...")
    Base.metadata.create_all(bind=engine)
    logger.info("Tables created successfully.")

    logger.info("Seeding initial database data...")
    db = SessionLocal()
    try:
        seed_db(db)
        logger.info("Database reset & seeding completed successfully!")
    finally:
        db.close()


if __name__ == "__main__":
    reset_database()
