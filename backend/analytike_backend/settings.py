from pathlib import Path
import dj_database_url
import os

# Tempo de vida da sessão (ajuste conforme sua necessidade)
SESSION_COOKIE_AGE = 60 * 60 * 8  # 8 horas
SESSION_SAVE_EVERY_REQUEST = True  # renova a cada request

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = 'django-insecure-88z)0%q*+i+td*rek6e99fy#^91&-hkl5^vjnwe%bo*20y_am$'

DEBUG = True  # ⚠️ troque para False no Render

ALLOWED_HOSTS = ["*"]

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'django_filters',
    'rest_framework',
    'rest_framework.authtoken',
    'corsheaders',
    'core',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'analytike_backend.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'analytike_backend.wsgi.application'

DATABASES = {
    'default': dj_database_url.config(
        default=os.environ.get("DATABASE_URL")
    )
}

AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

STATIC_URL = 'static/'

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')

REST_FRAMEWORK = {
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.AllowAny',
    ]
}

AUTHENTICATION_BACKENDS = [
    'django.contrib.auth.backends.ModelBackend',
]

CORS_ALLOW_ALL_ORIGINS = True
CORS_ALLOW_CREDENTIALS = True

CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "https://analytike.onrender.com",
    "https://analytike.vercel.app",
]

CSRF_TRUSTED_ORIGINS = [
    "http://localhost:3000",
    "https://analytike.onrender.com",
    "https://analytike.vercel.app",  # 🔹 domínio real do frontend
]

# 🔹 Cookies e CSRF sempre liberados para cross-domain
CSRF_COOKIE_SECURE = True
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SAMESITE = "None"
SESSION_COOKIE_SAMESITE = "None"
