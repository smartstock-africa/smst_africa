from django.urls import path, include
from .views import *
urlpatterns = [
    path("", user, name="user"),
    path('accounts/profile/', profile, name="user"),
    path('accounts/', include('allauth.urls')),
]