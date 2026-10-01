from dataclasses import dataclass
from backend.models import SmstUser, SmstUserPushSubscription as PushModel
from django.contrib.auth.hashers import check_password, make_password
from django.db import transaction
import logging
from django.utils.translation import gettext as _

logger = logging.getLogger('smst')

@dataclass
class Account:
    username: str
    account_id: int | None = None
    email: str | None = None

@dataclass
class PushSub:
    endpoint: str
    p256dh: str
    auth: str
    user: int    

class AccountRepository:
    def check_username(self, account:Account)->str:
        user = SmstUser.objects.filter(username=account.username)
        if user:
            return "exists"
        return "valid"
    @transaction.atomic
    def change_username(self, account:Account)->bool:
        try:
            SmstUser.objects.filter(id=account.account_id).update(username=account.username)
            return True
        except:
            return False
    
    @transaction.atomic
    def create_account(self, email, password)->bool:
        try:
            SmstUser.objects.get_or_create(
                email= email,
                defaults={
                    "password": make_password(password),
                    'first_name': email.split("@")[0],
                    'social_acc': False
                }
            )
            return True
        except:
            return False
    
    @transaction.atomic
    def change_password(self, email, password)->bool:
        try:
            SmstUser.objects.filter(email=email).update(password=make_password(password))
            return True
        except:
            return False
    
    @transaction.atomic
    def enable_notifications(self, pushSub:PushSub)->bool:
        from core.tasks import send_notification
        try:
            user = SmstUser.objects.get(id=pushSub.user)
            PushModel.objects.get_or_create(
                user=user,
                endpoint=pushSub.endpoint,
                defaults={
                    'p256dh': pushSub.p256dh,
                    'auth': pushSub.auth
                }
            )
            send_notification.delay(user.username, _('Notification'), _('Here is a message'))
            return True
        except Exception as e:
            logger.critical(f'PushSub Model Error {e}')
            return False
            
    
class BaseAccount:
    def __init__(self):
        self.repo = AccountRepository()

class CheckUsername(BaseAccount):
    def execute(self, username):
        account = Account(username=username)
        return self.repo.check_username(account)

def check_username(username):
    return CheckUsername().execute(username)

class ChangeUsername(BaseAccount):
    def execute(self, username, user_id):
        account = Account(username=username, account_id=user_id)
        return self.repo.change_username(account)

def change_username(new_username, user_id):
    return ChangeUsername().execute(new_username, user_id)

class CreateAccount(BaseAccount):
    def execute(self, email, password):
        return self.repo.create_account(email, password)

def create_account(email, passsword):
    return CreateAccount().execute(email, passsword)

class ChangePassword(BaseAccount):
    def execute(self, email, new_password):
        return self.repo.change_password(email, new_password)

def change_password(email, new_password):
    return ChangePassword().execute(email, new_password)

class EnableNotifications(BaseAccount):
    def execute(self, endpoint, p256dh, auth, user):
        pushSub = PushSub(
            endpoint=endpoint,
            p256dh=p256dh,
            auth=auth,
            user=user
        )
        return self.repo.enable_notifications(pushSub)
    
def enable_notifications(endpoint, p256dh, auth, user):
    return EnableNotifications().execute(endpoint, p256dh, auth, user)