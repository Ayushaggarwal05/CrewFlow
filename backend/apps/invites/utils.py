import secrets

def generate_join_code(prefix: str) -> str:
    """Generates a unique, secure join code like ORG-9XK3P"""
    return f"{prefix}{secrets.token_urlsafe(6).upper()}"
