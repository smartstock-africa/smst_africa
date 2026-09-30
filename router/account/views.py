from django.shortcuts import render
from django.http import JsonResponse, HttpResponseRedirect
from core.account.account import *
from django.template.loader import render_to_string
from django.shortcuts import redirect
import json
from django.contrib.auth import authenticate, login
def user(request):
    action = request.GET.get('action')
    user = request.user
    if action == "check_username":
        username = request.GET.get('username').lower()
        exist = check_username(username)
        return JsonResponse({"status": exist})
    if action == "update_username":
        data = json.loads(request.body)
        username = data.get('username')
        changed = change_username(username, user.id)
        return JsonResponse({"status": changed})
    if action == "verify_email":
        from core.tasks import send_otp_email
        from core.utils import confirm_user
        data = json.loads(request.body)
        
        email = data.get('email')
        user = confirm_user(email)
        if not user:
            request.session['new_user'] = email.split("@")[0]
        send_otp_email.delay(email)
        request.session['email'] = email
        return render(request, 'user/page/otp.html', {"otpType": action.split("_")[0]})
    if action == "validate_email":
        from core.tasks import confirm_otp
        from django.core.cache import cache
        data = json.loads(request.body)
        otp = data.get('otp')
        email = request.session.get('email')
        code = cache.get(f'new_user_{email}')
        try:
            valid = confirm_otp(otp, email.split("@")[0])
        
            if code:
                return JsonResponse({
                    'status': valid,
                    'html': render_to_string('user/page/password.html')
                })

            if valid: 
                from core.utils import confirm_user, confirm_social
                user = confirm_user(email)
                if user:
                    social = confirm_social(email)
                    if social:
                        return JsonResponse({
                            'status': 'social_auth',
                            'url': '/accounts/google/login/?process=login'
                        })
                return JsonResponse({
                    'status': valid,
                    'html': render_to_string('user/page/login.html', {'email': email})
                })
            
        except Exception:
            return JsonResponse({
                'status': False
            })
    if action == "create_account":
        data = json.loads(request.body)
        password = data.get('password')
        account = create_account(request.session.get('email'), password)
        if account:
            request.session.delete('email')
        return JsonResponse({
            'status': account
        })
    if action == "login_user":
        data = json.loads(request.body)
        email = data.get('email')
        password = data.get('password')
        user = authenticate(request=request,email=email, password=password)
        status = False
        if user:
            status = True
            login(request, user)
        return JsonResponse({
            'status': status
        })
    if action == "reset_email":
        from core.tasks import send_link_email
        data = json.loads(request.body)
        email = request.session.get('email')
        send_link_email.delay(email)
        return render(request, 'user/page/reset_link.html')
    if action == "reset_password":
        from core.tasks import confirm_link
        token = request.GET.get('token')
        email = confirm_link(token)
        if email:
            return render(request, 'user/page/password_reset.html')
        return HttpResponseRedirect('https://user.smartstock.africa')
    if action == "change_password":
        from core.tasks import confirm_link
        data = json.loads(request.body)
        password1 = data.get('password1')
        password2 = data.get('password2')
        token = data.get('token')
        email = confirm_link(token)
        if password1 == password2 and email:
            from core.account.account import change_password
            from core.utils import delete_stored_link
            changed = change_password(email, password1)
            if changed:
                delete_stored_link(token)
            return JsonResponse({
                'status': changed,
                'html': render_to_string('user/page/login.html', {'email': email})
            })
        return JsonResponse({
            'status': False
        })
            
    page = request.GET.get('page')
    if page == "login_user":
        return render(request, 'user/page/login.html')
    if page == 'reset_password':
        return render(request, 'user/page/reset_email.html')
    if user.is_authenticated:
        return HttpResponseRedirect('https://user.smartstock.africa/accounts/profile')
    
    return render(request, 'user/page/signup.html')
from core.decorator import smst_logged_in

@smst_logged_in
def profile(request):
    user = request.user
    if not user.username:
        return render(request, 'user/profile/username.html')
    
    return render(request, 'user/profile/page.html')
