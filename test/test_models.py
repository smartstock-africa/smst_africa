from django.test import TestCase, Client
import json
from backend.models import *
from django.contrib.auth.hashers import check_password, make_password
from core.account.account import check_username


class SmstAccountTestCase(TestCase):
    def setUp(self):
        password = make_password("testcase123")
        SmstUser.objects.create(
            email="testcase.smst@gmail.com",
            password=password,
            username="testcase.smst"
        )
    
    def test_account_exists(self):
        test_user = SmstUser.objects.filter(email="testcase.smst@gmail.com")
        self.assertEqual(test_user.exists(), True)
    
    def test_account_password_is_correct(self):
        test_user = SmstUser.objects.get(email="testcase.smst@gmail.com")
        self.assertEqual(check_password("testcase123", test_user.password), True)
        
    def test_check_username(self):
        self.assertEqual(check_username('testcase.smst'), 'exists')
        
    
    # SAVE PASSWORD USING MAKE PASSWORD AND CHECK USING CHECK PASSWORD
    # DO NOT SAVE A PASSWORD DIRECTLY TO THE USER MODEL
    
TEST_EMAIL = 'anythingemailforme@gmail.com'

class SmStNewsLetterTestCase(TestCase):
    def setUp(self):
        SmStNewsLetter.objects.create(
            email = TEST_EMAIL,
            first_name = "anything",
            last_name = "email"
        )
    
    def test_newsletter_saved(self):
        test_user = SmStNewsLetter.objects.filter(email=TEST_EMAIL, first_name="anything", last_name="email", subscribed=True)
        self.assertEqual(test_user.exists(), True)

from django.core.cache import cache
import hashlib
class OtpConfirmTestCase(TestCase):
    def setUp(self):
        cache_key = 'smst_otp_test'
        otp = cache.get(cache_key)
        if not otp:
            otp_code = '12345'
            otp = hashlib.sha256(otp_code.encode()).hexdigest()
            cache.set(cache_key, otp, timeout=20)
            otp = cache.get(cache_key)
    
    def test_function(self):
        from core.utils import confirm_otp
        otp = '12345'
        valid = confirm_otp(otp, 'test')
        self.assertEqual(valid, True)
        invalid = confirm_otp('122343', 'test')
        self.assertEqual(invalid, False)
        cache.delete('smst_otp_test')
    
        
    
    # class SmStNewsLetterUrlCreate(TestCase):
#     def setUp(self):
#         self = Client()
    
#     def test_create_on_url(self):
#         response = self.client.post('/users/?action=register-newsletter',
#             data =json.dumps(
#                 {
#                     "email": TEST_EMAIL,
#                     "firstName": "anything",
#                     "lastName": "form"
#                 },
#             ),
#                 content_type="application/json",
#             )
#         newsletter = SmStNewsLetter.objects.filter(
#             email=TEST_EMAIL,
#             first_name ="anything",
#             last_name = "form"
#         )
#         self.assertEqual(newsletter.exists(), True)
        
#     def test_remove_on_url(self):
#         SmStNewsLetter.objects.create(
#             email = TEST_EMAIL,
#             first_name = "anything",
#             last_name = "email"
#         )
        
#         response = self.client.get('/users/?action=unsubscribe_newsletter&email=anythingemailforme@gmail.com')
#         user = SmStNewsLetter.objects.filter(email=TEST_EMAIL)
#         self.assertEqual(user.exists(), False)

