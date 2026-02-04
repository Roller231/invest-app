from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List

from app.database import get_db
from app.models import PaymentRequisite
from app.schemas.payment_requisite import (
    PaymentRequisiteCreate,
    PaymentRequisiteUpdate,
    PaymentRequisiteResponse,
    PaymentRequisitePublic,
)

router = APIRouter(prefix="/payment-requisites", tags=["Payment Requisites"])


@router.get("/", response_model=List[PaymentRequisitePublic])
async def get_active_requisites(db: AsyncSession = Depends(get_db)):
    """Get all active payment requisites for users"""
    result = await db.execute(
        select(PaymentRequisite)
        .where(PaymentRequisite.is_active == True)
        .order_by(PaymentRequisite.sort_order.asc())
    )
    return list(result.scalars().all())


@router.get("/admin", response_model=List[PaymentRequisiteResponse])
async def get_all_requisites(db: AsyncSession = Depends(get_db)):
    """Get all payment requisites (admin)"""
    result = await db.execute(
        select(PaymentRequisite)
        .order_by(PaymentRequisite.sort_order.asc())
    )
    return list(result.scalars().all())


@router.post("/admin", response_model=PaymentRequisiteResponse)
async def create_requisite(
    data: PaymentRequisiteCreate,
    db: AsyncSession = Depends(get_db)
):
    """Create a new payment requisite (admin)"""
    requisite = PaymentRequisite(
        name=data.name,
        type=data.type,
        details=data.details,
        holder_name=data.holder_name,
        bank_name=data.bank_name,
        icon=data.icon,
        color=data.color,
        is_active=data.is_active,
        sort_order=data.sort_order,
    )
    db.add(requisite)
    await db.commit()
    await db.refresh(requisite)
    return requisite


@router.put("/admin/{requisite_id}", response_model=PaymentRequisiteResponse)
async def update_requisite(
    requisite_id: int,
    data: PaymentRequisiteUpdate,
    db: AsyncSession = Depends(get_db)
):
    """Update a payment requisite (admin)"""
    requisite = await db.get(PaymentRequisite, requisite_id)
    if not requisite:
        raise HTTPException(status_code=404, detail="Requisite not found")
    
    update_data = data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(requisite, field, value)
    
    await db.commit()
    await db.refresh(requisite)
    return requisite


@router.delete("/admin/{requisite_id}")
async def delete_requisite(
    requisite_id: int,
    db: AsyncSession = Depends(get_db)
):
    """Delete a payment requisite (admin)"""
    requisite = await db.get(PaymentRequisite, requisite_id)
    if not requisite:
        raise HTTPException(status_code=404, detail="Requisite not found")
    
    await db.delete(requisite)
    await db.commit()
    return {"success": True}
