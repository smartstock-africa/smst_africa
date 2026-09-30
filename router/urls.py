from django.urls import path
from .views import *
urlpatterns = [
    path("", frontend, name="frontend"),
    path("<snippet>", snippet_access, name="access_snippets"),
    path('users/', user_access, name="user_access")
]