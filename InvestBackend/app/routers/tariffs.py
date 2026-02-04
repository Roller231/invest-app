from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

from app.database import get_db
from app.schemas.tariff import TariffResponse
from app.services.tariff_service import TariffService

router = APIRouter(prefix="/tariffs", tags=["Tariffs"])


@router.get("/", response_model=List[TariffResponse])
async def get_tariffs(db: AsyncSession = Depends(get_db)):
    """Get all active tariffs"""
    service = TariffService(db)
    tariffs = await service.get_all_active()
    return tariffs


@router.get("/{tariff_id}", response_model=TariffResponse)
async def get_tariff(tariff_id: int, db: AsyncSession = Depends(get_db)):
    """Get tariff by ID"""
    service = TariffService(db)
    tariff = await service.get_by_id(tariff_id)
    if not tariff:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Tariff not found")
    return tariff
