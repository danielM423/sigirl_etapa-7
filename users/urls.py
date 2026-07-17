from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import UserViewSet, UserManagementViewSet, get_current_user, manage_profile

router = DefaultRouter()
router.register(r'users', UserViewSet, basename='user')
router.register(r'usuarios', UserManagementViewSet, basename='usuario')

urlpatterns = [
    path('', include(router.urls)),
    path('auth/user/', get_current_user, name='auth_user'),
    path('auth/profile/', manage_profile, name='auth_profile'),
    path('profile/', manage_profile, name='profile'),
]