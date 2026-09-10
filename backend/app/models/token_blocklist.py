from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from app.core.database import Base

class TokenBlocklist(Base):
    __tablename__ = "token_blocklist"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    token = Column(Text, unique=True, index=True, nullable=False)
    token_type = Column(String(20), nullable=False)  # 'access' or 'refresh'
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
