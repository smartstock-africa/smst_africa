from django.db import models
from django.contrib.auth.models import AbstractUser
# Create your models here.
class SmstUser(AbstractUser):
    username= models.CharField(unique=True, max_length=30)
    email = models.EmailField(unique=True, db_index=True)
    social_acc = models.BooleanField(default=True)
    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = []
    
    class Meta:
        db_table = "smstuser"

class SmStNewsLetter(models.Model):
    email = models.EmailField(unique=True, db_index=True)
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    subscribed = models.BooleanField(default=True)
    
    def save(self, *args, **kwargs):
        from core.tasks import send_email
        
        email = self.email
        if not SmStNewsLetter.objects.filter(email=email).exists():
            send_email.delay(email)
        super().save(*args, **kwargs)
    
    class Meta:
        db_table = "newsletter"
        ordering = ["email"]
        