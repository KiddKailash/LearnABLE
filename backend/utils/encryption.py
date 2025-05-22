from cryptography.fernet import Fernet, InvalidToken
from decouple import config

FERNET_KEY = config("FERNET_KEY").encode()
fernet = Fernet(FERNET_KEY)


def encrypt(text: str) -> str:
    return fernet.encrypt(text.encode()).decode()


def decrypt(token: str) -> str:
    try:
        return fernet.decrypt(token.encode()).decode()
    except InvalidToken:
        return "[Invalid Encrypted Data]"
