from fastapi import Depends, HTTPException
from fastapi import status, APIRouter
from jose import JWTError, jwt
from sqlalchemy.orm import Session

from app.core.dependecies import get_db, SECRET_KEY, ALGORITHM, TokenPurpose, get_current_active_user, get_current_user, \
    verify_password
from app.core.internal import schemas, crud
from app.game_engine.models import *

router = APIRouter(
    prefix="/users",
    tags=["users"],
    responses={404: {"description": "Not found"}},
)


# TODO: test
@router.post("/verify/{token}")
def verify_user(token: str, db: Session = Depends(get_db)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        purpose = payload.get("purpose")
        if email is None or purpose != TokenPurpose.ACCOUNT_VERIFICATION:
            raise HTTPException(status_code=400, detail="The verification link is invalid or has expired.")
        token_data = schemas.VerificationTokenData(email=email, purpose=purpose)
    except JWTError:
        raise HTTPException(status_code=400, detail="The verification link is invalid or has expired.")
    user = crud.get_user_by_email(db, token_data.email)
    if user is None:
        raise HTTPException(status_code=400, detail="The verification link is invalid or has expired.")
    if user.is_verified:
        raise HTTPException(status_code=200, detail='Account already confirmed. Please login.')
    else:
        crud.verify_user(user=user, db=db)
    return {"detail": "Account verified successfully"}


# TODO: test
@router.post("/change_password")
def change_password(change_password_schema: schemas.EmergencyChangePasswordSchema, db: Session = Depends(get_db)):
    try:
        token = change_password_schema.token
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        purpose = payload.get("purpose")
        if username is None or purpose != TokenPurpose.CHANGE_PASSWORD:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Could not validate credentials")
        token_data = schemas.TokenData(username=username, purpose=purpose)
    except JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Could not validate credentials")
    user = crud.get_user(db, token_data.username)
    if user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Could not validate credentials")
    return crud.change_password(user, change_password_schema.newPassword, db)


@router.post("", response_model=schemas.User)
def create_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = crud.get_user_by_email(db, email=user.email)
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    db_user_1 = crud.get_user(db, username=user.username)
    if db_user_1:
        raise HTTPException(status_code=400, detail="This name is taken")
    return crud.create_user(db=db, user=user)


@router.get("", response_model=List[schemas.User])
def read_users(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    users = crud.get_users(db, skip=skip, limit=limit)
    return users


@router.get("/{username}", response_model=schemas.UserGet)
def read_user(username: str, db: Session = Depends(get_db)):
    db_user = crud.get_user(db, username=username)
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return db_user


@router.get("/me/blocked", response_model=List[str])
async def get_users_blocked(current_user: schemas.User = Depends(get_current_active_user),
                            db: Session = Depends(get_db)):
    return crud.get_blocked_users(user=current_user, db=db)


@router.post("/me/block", response_model=schemas.BlockedUsers)
async def block_user(usernameSchema: schemas.Username, current_user: schemas.User = Depends(get_current_active_user),
                     db: Session = Depends(get_db)):
    username = usernameSchema.username
    user_to_block = crud.get_user(username=username, db=db)
    if not user_to_block:
        raise HTTPException(status_code=404, detail="User not found")
    blocked = crud.get_blocked_users(current_user, db)
    if username in blocked:
        raise HTTPException(status_code=403, detail="User already blocked")
    return crud.create_block_record(user=current_user, user_to_block=user_to_block, db=db)


# TODO: test
@router.delete("/me/unblock")
async def unblock_user(usernameSchema: schemas.Username, current_user: schemas.User = Depends(get_current_active_user),
                       db: Session = Depends(get_db)):
    username = usernameSchema.username
    user_to_unblock = crud.get_user(username=username, db=db)
    blocked = crud.get_blocked_users(user=current_user, db=db)
    if not user_to_unblock:
        raise HTTPException(status_code=404, detail="User not found")
    if user_to_unblock.username not in blocked:
        raise HTTPException(status_code=403, detail="User not blocked")
    return crud.remove_block_record(user=current_user, blocked_user=user_to_unblock, db=db)


@router.get("/me/info", response_model=schemas.User)
async def read_users_me(current_user: schemas.User = Depends(get_current_active_user)):
    return current_user


@router.post("/me/change_password")
def change_password(change_password_schema: schemas.ChangePasswordSchema,
                    current_user: schemas.User = Depends(get_current_user), db: Session = Depends(get_db)):
    db_user = crud.get_user(db=db, username=current_user.username)
    if not verify_password(change_password_schema.oldPassword, db_user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid old password")
    return crud.change_password(user=current_user, new_password=change_password_schema.newPassword, db=db)


@router.get("/{username}/history", response_model=List[schemas.GameHistoryEntry])
def get_users_game_history(username: str, db: Session = Depends(get_db)):
    db_user = crud.get_user(db, username=username)
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    history = crud.get_last_20_matches(db=db, user=db_user)
    return history


# TODO: test
@router.get("/{username}/stats", response_model=schemas.Stats)
def get_stats(username: str, db: Session = Depends(get_db)):
    db_user = crud.get_user(db, username=username)
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return crud.get_stats(db=db, user=db_user)


@router.get("/me/settings", response_model=schemas.Settings)
def get_settings(current_user: schemas.User = Depends(get_current_active_user), db: Session = Depends(get_db)):
    return crud.get_settings(db=db, user=current_user)


@router.patch("/me/settings", response_model=schemas.Settings)
def update_settings(settings: schemas.Settings, current_user: schemas.User = Depends(get_current_active_user),
                    db: Session = Depends(get_db)):
    return crud.update_settings(settings=settings, db=db, user=current_user)


@router.get("/ranking/top", response_model=List[schemas.User])
def get_top_ranked(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    users = crud.get_users_by_rating(db, skip=skip, limit=limit)
    return users
