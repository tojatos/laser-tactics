from typing import List

from fastapi import Depends, HTTPException, APIRouter
from fastapi import status
from sqlalchemy.orm import Session

from app.core.dependecies import get_current_active_user, get_db
from app.core.internal import schemas, crud

router = APIRouter(
    prefix="/users/me/friends",
    tags=["friends"],
    responses={404: {"description": "Not found"}},
)


@router.get("")
async def get_users_friends(current_user: schemas.User = Depends(get_current_active_user),
                            db: Session = Depends(get_db)):
    return crud.get_users_friends(user=current_user, db=db)


# TODO: think about: refactor response>
@router.get("/requests")
async def get_pending_requests(current_user: schemas.User = Depends(get_current_active_user),
                               db: Session = Depends(get_db)):
    return crud.get_users_pending_friend_requests(user=current_user, db=db)


@router.post("/requests/send", status_code=status.HTTP_201_CREATED)
async def send_friend_request(usernameSchema: schemas.Username, current_user: schemas.User = Depends(get_current_active_user),
                              db: Session = Depends(get_db)):
    friend_username = usernameSchema.username
    if friend_username == current_user.username:
        raise HTTPException(status_code=404, detail="Cannot send request to yourself")
    friend_to_be = crud.get_user(username=friend_username, db=db)
    if friend_to_be is None:
        raise HTTPException(status_code=404, detail="User not found")
    friends = crud.get_users_friends(current_user, db)
    if friend_username in friends:
        raise HTTPException(status_code=403, detail="User already in friends")
    pending = filter(lambda d: d.user_one_username, crud.get_users_pending_friend_requests(user=current_user, db=db))
    if current_user.username in pending:
        raise HTTPException(status_code=403, detail="There already is pending friend request for that user")
    blocked = crud.get_blocked_users(user=friend_to_be, db=db)
    # ???? do this better?
    if current_user.username in blocked:
        raise HTTPException(status_code=403, detail="That user has blocked this user")
    return crud.create_friend_request(user_sending=current_user, user_sent_to=friend_to_be, db=db)


@router.post("/requests/accept")
async def accept_friend_request(request_id: schemas.FriendRequestId, current_user: schemas.User = Depends(get_current_active_user),
                                db: Session = Depends(get_db)):
    request = crud.get_pending_friend_request(id=request_id.id, db=db)
    if request is None:
        raise HTTPException(status_code=404, detail="No pending friend request with such id")
    if request.user_two_username != current_user.username:
        raise HTTPException(status_code=401, detail="Cannot accept non-own friend request")
    return crud.accept_friend_request(friend_request=request, db=db)


@router.post("/requests/decline")
async def decline_friend_request(request_id: schemas.FriendRequestId, current_user: schemas.User = Depends(get_current_active_user),
                                 db: Session = Depends(get_db)):
    request = crud.get_pending_friend_request(id=request_id.id, db=db)
    if request is None:
        raise HTTPException(status_code=404, detail="No pending friend request with such id")
    if request.user_two_username != current_user.username:
        raise HTTPException(status_code=401, detail="Cannot decline non-own friend request")
    return crud.decline_friend_request(friend_request=request, db=db)


@router.delete("/unfriend")
async def remove_friend(usernameSchema: schemas.Username, current_user: schemas.User = Depends(get_current_active_user),
                        db: Session = Depends(get_db)):
    friend_username = usernameSchema.username
    friend = crud.get_user(db=db, username=friend_username)
    if friend is None:
        raise HTTPException(status_code=404, detail="User does not exists")
    friends = crud.get_users_friends(current_user, db)
    if friends is None or friend_username not in friends:
        raise HTTPException(status_code=404, detail="User not in friends")
    return crud.delete_friend_record(user=current_user, friend=friend, db=db)
