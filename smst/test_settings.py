from .settings import *
SECRET_KEY = 'ci-test-secret-key'

DATABASES["default"]["HOST"] = "127.0.0.1"
DATABASES["default"]["PORT"] = "5432"