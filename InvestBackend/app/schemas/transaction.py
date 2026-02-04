from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class TransactionResponse(BaseModel):
    id: int
    type: str
    amount: float
    status: str
    description: Optional[str]
    hash_code: Optional[str]
    created_at: datetime
    
    class Config:
        from_attributes = True


class LiveTransactionResponse(BaseModel):
    id: int
    type: str
    title: str
    user_name: str
    amount: float
    hash_code: str
    time: str
    is_fake: bool = False
