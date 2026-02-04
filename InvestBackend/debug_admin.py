import traceback
from fastapi.testclient import TestClient

from main import app
from app.config import settings

c = TestClient(app, raise_server_exceptions=True)

r = c.post("/admin/login", data={"username": "admin", "password": settings.SECRET_KEY})
print("login", r.status_code)

try:
    r2 = c.get("/admin/user/list")
    print("list", r2.status_code)
    print(r2.text[:800])
except Exception as e:
    print("EXC", type(e).__name__, e)
    traceback.print_exc()
