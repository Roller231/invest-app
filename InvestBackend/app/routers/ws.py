from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from app.live_ws import live_ws_manager


router = APIRouter(tags=["WebSocket"])


@router.websocket("/ws/live")
async def ws_live(ws: WebSocket):
    await live_ws_manager.connect(ws)
    try:
        while True:
            # Keep connection alive; client may send pings
            await ws.receive_text()
    except WebSocketDisconnect:
        await live_ws_manager.disconnect(ws)
    except Exception:
        await live_ws_manager.disconnect(ws)
