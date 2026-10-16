from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.viewsets import ModelViewSet
from .serializer import *
# Create your views here.
from rest_framework.permissions import IsAuthenticated,IsAuthenticatedOrReadOnly
from backend.models import SmstUser
from rest_framework.response import Response
from smst_app.models.smst_stock import SmstStockProduct
from smst_app.models.image import Image
from rest_framework.parsers import MultiPartParser, FormParser
from django.db import transaction

class SmstUser(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)
    
class ProductViewSet(ModelViewSet):
    queryset = SmstStockProduct.objects.all()
    serializer_class= ProductSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    parser_classes = [MultiPartParser, FormParser]
    
    @transaction.atomic
    def perform_create(self, serializer):
        image_file = self.request.FILES['product_image']
        
        image = Image.objects.create(
            image_file=image_file
        )
        serializer.save(
            product_image=image,
            product_creator=self.request.user
            )
        
        
        
