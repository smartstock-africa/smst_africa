from django.shortcuts import render
from rest_framework.views import APIView
from .serializer import *
# Create your views here.
from rest_framework.permissions import IsAuthenticated
from backend.models import SmstUser
from rest_framework.response import Response

class SmstUser(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)