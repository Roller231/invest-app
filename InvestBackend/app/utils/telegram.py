import hashlib
import hmac
import json
import urllib.parse
from typing import Any, Optional


def verify_init_data(init_data: str, bot_token: str) -> bool:
    if not init_data or not bot_token:
        return False

    parsed = urllib.parse.parse_qsl(init_data, keep_blank_values=True)
    data = {k: v for k, v in parsed}

    received_hash = data.pop("hash", None)
    if not received_hash:
        return False

    data_check_string = "\n".join(f"{k}={data[k]}" for k in sorted(data.keys()))

    secret_key = hmac.new(
        key=b"WebAppData",
        msg=bot_token.encode("utf-8"),
        digestmod=hashlib.sha256,
    ).digest()

    calculated_hash = hmac.new(
        key=secret_key,
        msg=data_check_string.encode("utf-8"),
        digestmod=hashlib.sha256,
    ).hexdigest()

    return hmac.compare_digest(calculated_hash, received_hash)


def extract_user_from_init_data(init_data: str) -> Optional[dict[str, Any]]:
    if not init_data:
        return None

    parsed = urllib.parse.parse_qsl(init_data, keep_blank_values=True)
    data = {k: v for k, v in parsed}
    user_raw = data.get("user")
    if not user_raw:
        return None

    try:
        return json.loads(user_raw)
    except Exception:
        return None
