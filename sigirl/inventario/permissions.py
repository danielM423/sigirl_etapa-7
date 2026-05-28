from rest_framework.permissions import BasePermission
from rest_framework import permissions

class IsAdmin(BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.is_staff

class IsJefe(BasePermission):
    def has_permission(self, request, view):
        return hasattr(request.user, 'profile') and request.user.profile.rol in ['jefe', 'jefe_superior']
    # ============================================================
# PERMISOS PARA GESTIÓN ACADÉMICA
# ============================================================

class IsAdminOrJefe(permissions.BasePermission): # type: ignore
    """
    Permiso solo para Administradores y Jefes Maestros.
    Pueden crear, editar y eliminar.
    """
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        # Admin (superuser) o Jefe (is_staff)
        return request.user.is_superuser or request.user.is_staff
    
    def has_object_permission(self, request, view, obj):
        return request.user.is_superuser or request.user.is_staff


class IsAdminOrReadOnly(permissions.BasePermission): # type: ignore
    """
    Admin puede modificar, otros solo lectura.
    """
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS: # type: ignore
            return True
        return request.user and (request.user.is_superuser or request.user.is_staff)

class IsInstructor(BasePermission):
    def has_permission(self, request, view):
        return hasattr(request.user, 'profile') and request.user.profile.rol == 'instructor'
from rest_framework import permissions

class IsAdminOrJefe(permissions.BasePermission):
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return request.user.is_superuser or request.user.is_staff