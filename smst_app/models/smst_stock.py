from django.db import models
from django.contrib.auth import get_user_model
from .image import Image
UserModel = get_user_model()

class SmstStockProduct(models.Model):
    product_name = models.CharField(max_length=255)
    product_description = models.JSONField(default=dict)
    product_image = models.ForeignKey(Image, on_delete=models.PROTECT)
    product_creator = models.ForeignKey(UserModel, on_delete=models.SET_NULL, null=True)