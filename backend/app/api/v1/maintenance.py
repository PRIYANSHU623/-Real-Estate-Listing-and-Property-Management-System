"""Maintenance ticket endpoints."""
from typing import Optional

from fastapi import APIRouter, Depends, Query

from app.core.constants import TicketPriority, TicketStatus
from app.core.dependencies import DB, CurrentUser, require_tenant
from app.schemas.maintenance import TicketAssign, TicketCreate, TicketOut, TicketStatusUpdate, TicketUpdate
from app.services import maintenance_service
from app.utils.pagination import Page, PaginationParams

router = APIRouter(prefix="/maintenance", tags=["Maintenance"])


@router.post("", response_model=TicketOut, status_code=201)
async def create_ticket(data: TicketCreate, db: DB, tenant=Depends(require_tenant)):
    ticket = await maintenance_service.create_ticket(db, tenant, data)
    await db.commit()
    await db.refresh(ticket)
    return ticket


@router.get("", response_model=Page[TicketOut])
async def list_tickets(
    db: DB,
    user: CurrentUser,
    pagination: PaginationParams = Depends(),
    status_filter: Optional[TicketStatus] = Query(None, alias="status"),
    priority: Optional[TicketPriority] = None,
    property_id: Optional[int] = None,
):
    items, total = await maintenance_service.list_tickets(
        db, user, status_filter, priority, property_id, pagination.page_size, pagination.offset
    )
    return Page[TicketOut].create(items, total, pagination.page, pagination.page_size)


@router.get("/{ticket_id}", response_model=TicketOut)
async def get_ticket(ticket_id: int, db: DB, user: CurrentUser):
    ticket = await maintenance_service.get_ticket_or_404(db, ticket_id)
    prop = await maintenance_service.load_property(db, ticket)
    maintenance_service.assert_can_view(user, ticket, prop)
    return ticket


@router.put("/{ticket_id}", response_model=TicketOut)
async def update_ticket(ticket_id: int, data: TicketUpdate, db: DB, user: CurrentUser):
    ticket = await maintenance_service.update_ticket(db, user, ticket_id, data)
    await db.commit()
    await db.refresh(ticket)
    return ticket


@router.put("/{ticket_id}/status", response_model=TicketOut)
async def update_ticket_status(ticket_id: int, data: TicketStatusUpdate, db: DB, user: CurrentUser):
    ticket = await maintenance_service.update_ticket_status(db, user, ticket_id, data.status)
    await db.commit()
    await db.refresh(ticket)
    return ticket


@router.put("/{ticket_id}/assign", response_model=TicketOut)
async def assign_ticket(ticket_id: int, data: TicketAssign, db: DB, user: CurrentUser):
    ticket = await maintenance_service.assign_ticket(db, user, ticket_id, data.vendor_id)
    await db.commit()
    await db.refresh(ticket)
    return ticket
