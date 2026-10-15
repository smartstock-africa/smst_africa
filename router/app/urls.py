from django.urls import path, include
from django.views.i18n import JavaScriptCatalog
from .views import *
urlpatterns = [
    path('', app, name="appHomePage"),
    path('app/', smst_app, name="smst_app"),
    path('login/', login, name="login"),
    path("i18n/", include("django.conf.urls.i18n")),
    path("jsi18n/", JavaScriptCatalog.as_view(), name="javascript-catalog"),

]
