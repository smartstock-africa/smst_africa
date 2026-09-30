from django.core.validators import validate_email
from django.core.exceptions import ValidationError

def check_email(email):
    try:
        validate_email(email)
        return True
    except:
        return False

import secrets, hashlib

def create_otp():
    otp =  str(secrets.randbelow(1_000_000)).zfill(6)
    hashed_otp = hashlib.sha256(otp.encode()).hexdigest()
    return ( otp, hashed_otp)

def generate_link(email):
    token = secrets.token_urlsafe(32)
    hashed_token = hashlib.sha256(token.encode()).hexdigest()
    cache_key = f'smst_reset_{hashed_token}'
    cache.set(cache_key, email, timeout=30*60)
    return (token, hashed_token)    

def confirm_link(token):
    clean_token = hashlib.sha256(token.encode()).hexdigest()
    email = cache.get(f'smst_reset_{clean_token}')
    if email:
        return email
    return False


def delete_stored_link(token):
    clean_token = hashlib.sha256(token.encode()).hexdigest()
    email = cache.delete(f'smst_reset_{clean_token}')

from django.core.cache import cache
def confirm_otp(otp, id):
    encoded_otp = cache.get(f'smst_otp_{id}')
    otp_clean = hashlib.sha256(otp.encode()).hexdigest()
    if secrets.compare_digest(otp_clean, encoded_otp):
        return True
    return False

from backend.models import SmstUser
def confirm_user(email):
    return SmstUser.objects.filter(email=email).exists()

def confirm_social(email):
    return SmstUser.objects.filter(email=email, social_acc=True).exists()