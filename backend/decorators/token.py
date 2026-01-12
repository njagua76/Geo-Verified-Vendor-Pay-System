import os
import jwt
from datetime import datetime, timedelta, timezone

secret = os.getenv("JWT_SECRET", "supersecretkey")

payload = {
    "id": 1,
    "role_name": "Administrator",
    "exp": datetime.now(timezone.utc) + timedelta(hours=1)
}

token = jwt.encode(payload, secret, algorithm="HS256")
print(token)
