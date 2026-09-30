from celery import shared_task
from django.core.mail import EmailMultiAlternatives, get_connection
from django.template.loader import render_to_string
from .utils import *
from django.core.cache import cache
connection = get_connection()
from_email = "support@smartstock.africa"

def send_configured_email(subject, text_content, emails, html_content):
    email_msg = EmailMultiAlternatives(subject, text_content, from_email, emails)
    email_msg.attach_alternative(html_content, 'text/html')
    
    try:
        email_msg.send(fail_silently=False)
        print("Email Sent")
    except Exception as e:
        print(f"Error sending email: {e}")

@shared_task
def send_email(email):
    if not check_email(email):
        return
    emails = [email]
    unsubscribe_url = f"https://smst.smartstock.africa/users/?action=unsubscribe_newsletter&email={email}"
    html_content = render_to_string('email/base_email.html', {'unsubscribe_newsletter_url': unsubscribe_url})
    text_content = "Welcome to Smartstock! (Use an HTML-compatible email viewer to see full content)"
    subject = "Welcome to SmSt"
    send_configured_email(subject, text_content, emails, html_content)


@shared_task
def send_otp_email(email):
    from backend.models import SmstUser
    if not check_email(email):
        return
    user_model = SmstUser.objects.filter(email=email).only('id')
    user = email.split("@")[0]

    if not user_model.exists():
        cache.set(f'new_user_{email}', True)

    cache_key = f'smst_otp_{user}'
    stored_otp = cache.get(cache_key)
    if stored_otp:
        return
    otp, hashed_otp = create_otp()
    cache.set(cache_key, hashed_otp, timeout=180)
    emails = [email]
    html_content = render_to_string('email/otp_email.html', {'otp': otp})
    text_content = "Verify your email! (Use an HTML-compatible email viewer to see full content)"
    subject = "Your verification OTP"
    send_configured_email(subject, text_content, emails, html_content)
        
@shared_task
def send_link_email(email):
    if not check_email(email):
        return
    emails = [email]
    user_model = SmstUser.objects.filter(email=email)
    if not user_model.exists():
        return
    
    token, hashed_token = generate_link(email)
    html_content = render_to_string('email/link_email.html', {'token': token})
    
    text_content = "Reset your email! (Use an HTML-compatible email viewer to see full content)"
    subject = "Reset your password"
    send_configured_email(subject, text_content, emails, html_content)