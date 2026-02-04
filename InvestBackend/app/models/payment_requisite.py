from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.sql import func
from app.database import Base


class PaymentRequisite(Base):
    __tablename__ = "payment_requisites"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(100), nullable=False, comment="Название метода (СБП, Сбербанк, Тинькофф)")
    type = Column(String(50), nullable=False, comment="Тип: card, sbp, crypto")
    details = Column(String(500), nullable=False, comment="Реквизиты (номер карты, телефон, кошелек)")
    holder_name = Column(String(200), nullable=True, comment="Имя держателя")
    bank_name = Column(String(100), nullable=True, comment="Название банка")
    icon = Column(String(50), nullable=True, comment="Иконка/эмодзи")
    color = Column(String(20), nullable=True, comment="Цвет для UI")
    is_active = Column(Boolean, default=True, comment="Активен ли метод")
    sort_order = Column(Integer, default=0, comment="Порядок сортировки")
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    def __repr__(self):
        return f"<PaymentRequisite #{self.id} - {self.name}>"
