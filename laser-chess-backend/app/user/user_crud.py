from passlib.context import CryptContext
from pydantic import EmailStr
from sqlalchemy.orm import Session

from app.core import models
from ..user import user_schemas

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def get_password_hash(password):
    return pwd_context.hash(password)


def get_user(db: Session, username: str):
    return db.query(models.User).filter(models.User.username == username).first()


def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == EmailStr(email)).first()


def get_users(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.User).offset(skip).limit(limit).all()


def create_user(db: Session, user: user_schemas.UserCreate):
    hashed_password = get_password_hash(user.password)
    db_user = models.User(username=user.username, email=user.email, hashed_password=hashed_password)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user
