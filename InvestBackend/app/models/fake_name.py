from sqlalchemy import Column, Integer, String, Boolean
from app.database import Base


class FakeName(Base):
    __tablename__ = "fake_names"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(100), nullable=False, comment="Имя для фейковых транзакций")
    is_active = Column(Boolean, default=True, comment="Используется")
    
    def __repr__(self):
        return f"<FakeName {self.name}>"
    
    def __str__(self):
        return self.name
