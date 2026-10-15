from rest_framework import serializers
from smst_app.models import AppNotifications
from backend.models import SmstUser

class AppNotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = AppNotifications
        fields = 'all'

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = SmstUser
        fields = ['username', 'first_name', 'last_name']
