from pydantic import BaseModel
from typing import Optional


class TariffResponse(BaseModel):
    id: int
    name: str
    label: Optional[str]
    daily_percent: float
    min_amount: float
    max_amount: float
    color: str
    is_active: bool
    
    class Config:
        from_attributes = True
