from fastapi import Depends, HTTPException, APIRouter
from fastapi_mail import MessageSchema, FastMail
from sqlalchemy.orm import Session

from app.core.dependecies import generate_verification_token, VERIFICATION_URL, get_db, generate_change_password_token, \
    CHANGE_PASSWORD_URL
from app.core.internal import crud
from app.core.internal.email import EmailSchema, verification_template, conf, change_password_template
from app.core.internal.schemas import  Username

router = APIRouter(
    prefix="/email",
    tags=["email"],
    responses={404: {"description": "Not found"}},
)


@router.post("/send_verification_email")
async def send_verification_email(usernameSchema: Username, db: Session = Depends(get_db)):
    username = usernameSchema.username
    db_user = crud.get_user(db, username=username)
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    if db_user.is_verified:
        raise HTTPException(status_code=400, detail="User already verified")

    token = generate_verification_token(db_user.email)
    verification_url = VERIFICATION_URL + token
    email = EmailSchema(email=[db_user.email])
    message = MessageSchema(
        subject="Verify your LaserTactics account",
        recipients=email.dict().get("email"),
        body=verification_template(username=username, verification_url=verification_url),
        subtype="html"
    )

    fm = FastMail(conf)
    await fm.send_message(message)
    return {'detail': "Verification email sent"}


# TODO should always return 200?
@router.post("/send_password_change_request")
async def send_password_change_email(usernameSchema: Username, db: Session = Depends(get_db)):
    username = usernameSchema.username
    db_user = crud.get_user(db, username=username)
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")

    token = generate_change_password_token(username)
    url = CHANGE_PASSWORD_URL + token
    email = EmailSchema(email=[db_user.email])
    message = MessageSchema(
        subject="Your LaserTactics account password change",
        recipients=email.dict().get("email"),
        body=change_password_template(username=username, url=url),
        subtype="html"
    )

    fm = FastMail(conf)
    await fm.send_message(message)
    return {'detail': "Verification email sent"}
