import unittest
from django.test import Client
from backend.models import *

# DONT USE THIS TEST IF IT TOUCHES THE DATABASE, USE tests.test_models instead

class TestViews(unittest.TestCase):
    def setUp(self):
        self.client = Client()
        
    def test_details(self):
        response = self.client.get('')
        self.assertEqual(response.status_code, 200)
        
    def test_pricing_view(self):
        response = self.client.get('?view=pricing')
        self.assertEqual(response.status_code, 200)

        
    def test_pricing_access(self):
        response = self.client.get('/pricing')
        self.assertEqual(response.status_code, 200)

        
    def test_wrong_url(self):
        response = self.client.get('/pricin')
        self.assertEqual(response.status_code, 302)
        
    def test_account_url(self):
        response = self.client.get('https://user.smartstock.africa/')
        self.assertEqual(response.status_code, 200)

    
        
   
