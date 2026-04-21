from django.contrib import admin
from django.urls import path, include
from rest_framework.permissions import AllowAny
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from inventario.views import register, get_current_user, manage_profile, PublicTokenObtainPairView, PublicTokenRefreshView


@api_view(['GET'])
@permission_classes([AllowAny])
def home(request):
    return Response({
        "mensaje": "SIGIRL API funcionando 🚀"
    })


urlpatterns = [
    path('', home),
    path('admin/', admin.site.urls),

    # JWT (Public)
    path('api/token/', PublicTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', PublicTokenRefreshView.as_view(), name='token_refresh'),

    # Auth (Public)
    path('api/register/', register, name='register'),
    path('api/auth/user/', get_current_user, name='get_current_user'),
    path('api/auth/profile/', manage_profile, name='manage_profile'),

    # API
    path('api/', include('inventario.urls')),
]