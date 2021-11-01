from fastapi_mail import FastMail, MessageSchema, ConnectionConfig
from pydantic import BaseModel, EmailStr
from typing import List


class EmailSchema(BaseModel):
    email: List[EmailStr]


conf = ConnectionConfig(
    MAIL_FROM="play.lasertactics@gmail.com",
    MAIL_USERNAME="play.lasertactics@gmail.com",
    MAIL_PASSWORD="chesswithlasers",
    MAIL_PORT=587,
    MAIL_SERVER="smtp.gmail.com",
    MAIL_TLS=True,
    MAIL_SSL=False,
    USE_CREDENTIALS=True,
    VALIDATE_CERTS=True
)

testtemplate = """
    Fast api test
        """


def verification_template(username: str, verification_url: str):
    return f"""
    Hello {username}! 
    
    Your registration at LaserTactics is almost over.
    All you need to do now is click the link below to verify your account.
    
    {verification_url}
    
    Thank you for using LaserTactics and have fun playing!
    Best regards,
    LaserTactics Team
    """
