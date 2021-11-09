from sqlalchemy import and_, or_
from sqlalchemy.orm import Session

from app.core import models
from app.user import user_schemas
from . import friends_schemas


def get_users_friends(user: user_schemas.User, db: Session):
    friends_right = [d['user_two_username'] for d in db.query(models.FriendRequests.user_two_username).filter(and_(
        user.username == models.FriendRequests.user_one_username,
        models.FriendRequests.status == friends_schemas.FriendRequestStatus.ACCEPTED))]
    friends_left = [d['user_one_username'] for d in db.query(models.FriendRequests.user_one_username).filter(and_(
        user.username == models.FriendRequests.user_two_username,
        models.FriendRequests.status == friends_schemas.FriendRequestStatus.ACCEPTED))]
    return friends_left + friends_right


def get_friend_request(id: int, db: Session):
    return db.query(models.FriendRequests).filter(models.FriendRequests.id == id).first()


def get_friend_record(user: user_schemas.User, friend: user_schemas.User, db: Session):
    return db.query(models.FriendRequests).filter(or_(and_(models.FriendRequests.user_two_username == friend.username,
                                                           models.FriendRequests.user_one_username == user.username),
                                                      and_((models.FriendRequests.user_two_username == user.username,
                                                            models.FriendRequests.user_one_username == friend.username)))).first()


def get_pending_friend_request(id: int, db: Session):
    return db.query(models.FriendRequests).filter(and_(
        models.FriendRequests.id == id, models.FriendRequests.status == friends_schemas.FriendRequestStatus.PENDING)).first()


def get_users_pending_friend_requests(user: user_schemas.User, db: Session):
    return list(db.query(models.FriendRequests).filter(
        and_(models.FriendRequests.user_two_username == user.username,
             models.FriendRequests.status == friends_schemas.FriendRequestStatus.PENDING)))


def create_friend_request(user_sending: user_schemas.User, user_sent_to: user_schemas.User, db: Session):
    request = models.FriendRequests(user_one_username=user_sending.username, user_two_username=user_sent_to.username,
                                    status=friends_schemas.FriendRequestStatus.PENDING)
    db.add(request)
    db.commit()
    db.refresh(request)
    return request


def accept_friend_request(friend_request: friends_schemas.FriendRequest, db: Session):
    friend_request.status = friends_schemas.FriendRequestStatus.ACCEPTED
    db.commit()
    db.refresh(friend_request)
    return friend_request


def decline_friend_request(friend_request: friends_schemas.FriendRequest, db: Session):
    friend_request.status = friends_schemas.FriendRequestStatus.REJECTED
    db.commit()
    db.refresh(friend_request)
    return friend_request


def delete_friend_record(user: user_schemas.User, friend: user_schemas.User, db: Session):
    record = get_friend_record(user, friend, db)
    if record:
        db.delete(record)
        db.commit()
        return {f"msg": f"Friend {friend.username} of user {user.username} removed"}
    return {"msg": "No friend record to delete found"}


def get_blocked_users(user: user_schemas.User, db: Session):
    return [d.blocked_user for d in db.query(models.BlockedUsers).filter(models.BlockedUsers.user == user.username)]


def get_block_record(user: user_schemas.User, blocked: user_schemas.User, db: Session):
    return db.query(models.BlockedUsers).filter(and_(models.BlockedUsers.user == user.username,
                                                     models.BlockedUsers.blocked_user == blocked.username)).first()


def create_block_record(user: user_schemas.User, user_to_block: user_schemas.User, db: Session):
    record = models.BlockedUsers(user=user.username, blocked_user=user_to_block.username)
    db.add(record)
    db.commit()
    db.refresh(record)
    return record


def remove_block_record(user: user_schemas.User, blocked_user: user_schemas.User, db: Session):
    record = get_block_record(user=user, blocked=blocked_user, db=db)
    if record:
        db.delete(record)
        db.commit()
        return {f"msg": f"Blocked user {blocked_user.username} of user {user.username} removed"}
    return {"msg": "No blocked record to delete found"}