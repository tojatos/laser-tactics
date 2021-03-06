from fastapi import Depends, HTTPException, APIRouter
from fastapi_mail import MessageSchema, FastMail
from sqlalchemy.orm import Session

from app.core.dependecies import generate_verification_token, VERIFICATION_URL, get_db, generate_change_password_token, \
    CHANGE_PASSWORD_URL, get_current_active_user
from app.core.internal import crud, schemas
from app.core.internal.email import EmailSchema, verification_template, conf, change_password_template, verify_conf

router = APIRouter(
    prefix="/email",
    tags=["email"],
    responses={404: {"description": "Not found"}},
)


@router.post("/send_verification_email")
async def send_verification_email(current_user: schemas.User = Depends(get_current_active_user), db: Session = Depends(get_db)):
    return {'detail': "Feature temporary disabled"}
    """
    username = current_user.username
    db_user = crud.get_user(db, username=username)
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    if db_user.is_verified:
        raise HTTPException(status_code=400, detail="User already verified")

    token = generate_verification_token(db_user.email, db_user.is_verified)
    verification_url = VERIFICATION_URL + token
    email = EmailSchema(email=[db_user.email], body={
          "username": username,
          "verification_url": verification_url
        })
    message = MessageSchema(
        subject="Verify your LaserTactics account",
        recipients=email.dict().get("email"),
        template_body=email.dict().get("body"),
        subtype="html"
    )

    fm = FastMail(verify_conf)
    await fm.send_message(message, template_name=verification_template())
    return {'detail': "Verification email sent"}
"""

@router.post("/send_password_change_request")
async def send_password_change_email(emailSchema: schemas.EmailSchema, db: Session = Depends(get_db)):
    return {'detail': "Feature temporary disabled"}
    """
    email = emailSchema.email
    db_user = crud.get_user_by_email(db, email=email)
    if not db_user:
        return {'detail': "Verification email sent"}

    username = db_user.username
    token = generate_change_password_token(username, db_user.hashed_password)
    url = CHANGE_PASSWORD_URL + token
    email = EmailSchema(email=[db_user.email], body={
          "username": username,
          "url": url
        })
    message = MessageSchema(
        subject="Your LaserTactics account password change",
        recipients=email.dict().get("email"),
        template_body=email.dict().get("body"),
        subtype="html"
    )

    fm = FastMail(conf)
    await fm.send_message(message, template_name=change_password_template())
    return {'detail': "Verification email sent"}
"""