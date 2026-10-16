from django.shortcuts import render
from rest_framework_simplejwt.tokens import RefreshToken
from django.http import JsonResponse, HttpResponseRedirect
def app(request):
    user = request.user
    refresh = RefreshToken.for_user(user)
    action = request.GET.get('action')
    if action == "any_unread_notifications":
        from core.app.notification import any_unread_notifications
        return JsonResponse({
            'status': any_unread_notifications(user.id)
        })
    return render(request, 'app/homepage.html',{
        'refresh': str(refresh),
        'access': str(refresh.access_token)
    })
    
def login(request):
    return HttpResponseRedirect('https://user.smartstock.africa/')

def smst_app(request):
    app = request.GET.get('smst_app')
    if app:    
        
        return render(request, f'app/apps/{app}.html')

    action = request.GET.get('action')
    if action == "create_smst_stock":
        return render(request, 'app/apps/smst_stocks/forms/create_product.html')