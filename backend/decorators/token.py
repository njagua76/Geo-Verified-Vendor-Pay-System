import os
import jwt
from datetime import datetime, timedelta, timezone
from backend.config import Config

# Use the same JWT_SECRET_KEY from Config to ensure consistency
secret = Config.JWT_SECRET_KEY

payload = {
    "id": 1,
    "role_name": "Administrator",
    "exp": datetime.now(timezone.utc) + timedelta(hours=1)
}

token = jwt.encode(payload, secret, algorithm="HS256")
print(token)
