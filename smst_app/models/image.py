from django.db import models
from cloudinary.models import CloudinaryField

class Image(models.Model):
    image_file = models.CloudinaryField('image')