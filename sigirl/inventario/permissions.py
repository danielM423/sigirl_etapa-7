from rest_framework import permissions

# ============================================================
# PERMISOS BASE
# ============================================================

class IsAdmin(permissions.BasePermission):
    """Permiso solo para administradores (is_staff)"""
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.is_staff


class IsJefe(permissions.BasePermission):
    """Permiso solo para Jefes (basado en perfil)"""
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return hasattr(request.user, 'profile') and request.user.profile.rol in ['jefe', 'jefe_superior']


class IsInstructor(permissions.BasePermission):
    """Permiso solo para Instructores (basado en perfil)"""
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return hasattr(request.user, 'profile') and request.user.profile.rol == 'instructor'


class IsAdminOrJefe(permissions.BasePermission):
    """Permiso para Administradores y Jefes (is_staff o is_superuser)"""
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return request.user.is_superuser or request.user.is_staff
    
    def has_object_permission(self, request, view, obj):
        return request.user.is_superuser or request.user.is_staff


class IsAdminOrReadOnly(permissions.BasePermission):
    """Admin puede modificar, otros solo lectura"""
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user and request.user.is_authenticated and (request.user.is_superuser or request.user.is_staff)


class IsStaffOrSuperuser(permissions.BasePermission):
    """Permiso para usuarios con is_staff=True o is_superuser=True"""
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return request.user.is_staff or request.user.is_superuser


class IsInventoryManagerOrReadOnly(permissions.BasePermission):
    """Permiso para gestión de inventario: admins y jefes pueden modificar"""
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user.is_staff or request.user.is_superuser