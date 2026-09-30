from decouple import config
import cloudinary
from datetime import timedelta
SECRET_KEY = config("SECRET_KEY")

cloudinary.config(
    cloud_name=config('CLOUDINARY_CLOUD_NAME'),
    api_key=config("CLOUDINARY_API_KEY"),
    api_secret=config('CLOUDINARY_SECRET_KEY'),
    secure=True
)

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': config("DATABASE_NAME"),
        "USER": config("DATABASE_USER"),
        "PASSWORD": config("DATABASE_PASSWORD"),
        "HOST": "127.0.0.1",
        "PORT": config("DATABASE_PORT")
    }
}

CSRF_COOKIE_SECURE = True
CSRF_COOKIE_DOMAIN = ".smartstock.africa"
CSRF_TRUSTED_ORIGINS = [
    'https://smst.smartstock.africa/',
    'https://user.smartstock.africa'
]
CSRF_COOKIE_SAMESITE = "None"

EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = 'mail.smartstock.africa'
EMAIL_PORT = 587
EMAIL_HOST_USER = 'support@smartstock.africa'
EMAIL_HOST_PASSWORD = config('EMAIL_PASSWORD')
EMAIL_USE_TLS = True
EMAIL_TIMEOUT = 30

USE_X_FORWARDED_HOST = True
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')

ACCOUNT_DEFAULT_HTTP_PROTOCOL = 'https'
CELERY_BROKER_URL = config('BROKER_URL')
CELERY_TASK_SERIALIZER = 'json'
CELERY_TASK_ACKS_LATE = True
CELERY_TASK_REJECT_ON_WORKER_LOST = True
CELERY_TASK_TRACK_STARTED = True
CELERY_RESULT_BACKEND = 'redis://localhost:6379/1'
CELERY_TASK_DEFAULT_QUEUE = "smst"

CACHES = {
    'default': {
        'BACKEND':'django_redis.cache.RedisCache',
        'LOCATION': 'redis://127.0.0.1:6379/1',
        'OPTIONS': {
            'CLIENT_CLASS': 'django_redis.client.DefaultClient'
        }
    }
}

CACHE_MIDDLEWARE_ALIAS = 'default'
CACHE_MIDDLEWARE_KEY_PREFIX = ""

AUTHENTICATION_BACKENDS = [
    'axes.backends.AxesStandaloneBackend',
    'allauth.account.auth_backends.AuthenticationBackend'
]

SOCIALACCOUNT_PROVIDERS = {
    'google': {
        'APP':{
            'client_id': config('CLIENT_ID'),
            'secret': config('GOOGLE_SECRET_KEY'),
            'key': ''
        }
    }
}

ACCOUNT_USER_MODEL_USERNAME_FIELD = None
ACCOUNT_SIGNUP_FIELDS = ['email*', 'password1', 'password2']
ACCOUNT_LOGIN_METHODS = {'email'}

AXES_ENABLED = True
AXES_FAILURE_LIMIT = 5
AXES_COOLOFF_TIME = timedelta(minutes=5)
AXES_USERNAME_FORM_FIELD = 'email'
AXES_LOCKOUT_PARAMETERS = ['username', 'ip_address']
AXES_CLIENT_IP_META_PRECEDENCE_ORDER = ['HTTP_X_FORWARDED_FOR']
AXES_CLIENT_IP_CALLABLE = 'smst.ip_keys.client_id_key'