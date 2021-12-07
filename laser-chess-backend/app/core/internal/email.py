from pathlib import Path
from typing import Dict, List

from fastapi_mail import ConnectionConfig
from pydantic import BaseModel, EmailStr

from app.core.dependecies import MAIL_FROM, MAIL_PASSWORD, MAIL_PORT, MAIL_SERVER, MAIL_USERNAME, VERIFY_MAIL_FROM, \
    VERIFY_MAIL_PASSWORD, VERIFY_MAIL_PORT, VERIFY_MAIL_SERVER, VERIFY_MAIL_USERNAME


class EmailSchema(BaseModel):
    email: List[EmailStr]
    body: Dict


verify_conf = ConnectionConfig(
    MAIL_FROM=VERIFY_MAIL_FROM,
    MAIL_USERNAME=VERIFY_MAIL_USERNAME,
    MAIL_PASSWORD=VERIFY_MAIL_PASSWORD,
    MAIL_PORT=VERIFY_MAIL_PORT,
    MAIL_SERVER=VERIFY_MAIL_SERVER,
    MAIL_TLS=True,
    MAIL_SSL=False,
    USE_CREDENTIALS=True,
    VALIDATE_CERTS=True,
    TEMPLATE_FOLDER=Path(__file__).parent / 'mail' / 'templates',
)

conf = ConnectionConfig(
    MAIL_FROM=MAIL_FROM,
    MAIL_USERNAME=MAIL_USERNAME,
    MAIL_PASSWORD=MAIL_PASSWORD,
    MAIL_PORT=MAIL_PORT,
    MAIL_SERVER=MAIL_SERVER,
    MAIL_TLS=True,
    MAIL_SSL=False,
    USE_CREDENTIALS=True,
    VALIDATE_CERTS=True,
    TEMPLATE_FOLDER=Path(__file__).parent / 'mail' / 'templates',
)

testtemplate = """
    Fast api test
        """


def verification_template():
    return "verify.html"


def change_password_template():
    return "change_password.html"
