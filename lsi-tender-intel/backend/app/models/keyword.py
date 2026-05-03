from app.core.database import Base
from sqlalchemy import Column, Integer, String, Boolean, DateTime
from datetime import datetime


class Keyword(Base):
    __tablename__ = "keywords"

    id = Column(Integer, primary_key=True, index=True)
    keyword_text = Column(String(200), nullable=False)
    subporto = Column(String(10), nullable=False)  # FLP / SDA / FITI
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
