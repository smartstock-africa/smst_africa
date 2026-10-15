from django.db import models
from django.contrib.auth import get_user_model
from core.utils import generate_notification_id
UserModel = get_user_model()

# Create your models here.
class AppNotifications(models.Model):
    notificationId = models.CharField(max_length=36, default=generate_notification_id, unique=True, db_index=True)
    notificationTitle = models.CharField(max_length=255)
    notificationContent = models.TextField()
    notificationUser = models.ForeignKey(UserModel, on_delete=models.CASCADE)
    notificationTime = models.DateTimeField(auto_now_add=True)
    notificationRead = models.BooleanField(default=False)
    
    def __str__(self):
        return f"{self.notificationTitle} {self.notificationTime}"
    