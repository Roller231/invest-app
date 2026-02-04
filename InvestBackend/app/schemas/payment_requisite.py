from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class PaymentRequisiteBase(BaseModel):
    name: str
    type: str  # card, sbp, crypto
    details: str
    holder_name: Optional[str] = None
    bank_name: Optional[str] = None
    icon: Optional[str] = None
    color: Optional[str] = None
    is_active: bool = True
    sort_order: int = 0


class PaymentRequisiteCreate(PaymentRequisiteBase):
    pass


class PaymentRequisiteUpdate(BaseModel):
    name: Optional[str] = None
    type: Optional[str] = None
    details: Optional[str] = None
    holder_name: Optional[str] = None
    bank_name: Optional[str] = None
    icon: Optional[str] = None
    color: Optional[str] = None
    is_active: Optional[bool] = None
    sort_order: Optional[int] = None


class PaymentRequisiteResponse(PaymentRequisiteBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True


class PaymentRequisitePublic(BaseModel):
    """Public view for users (without sensitive admin info)"""
    id: int
    name: str
    type: str
    details: str
    holder_name: Optional[str] = None
    bank_name: Optional[str] = None
    icon: Optional[str] = None
    color: Optional[str] = None
    
    class Config:
        from_attributes = True
