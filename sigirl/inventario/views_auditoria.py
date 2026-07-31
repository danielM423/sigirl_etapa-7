from rest_framework import viewsets, filters
from rest_framework.permissions import IsAuthenticated
from .models import Auditoria
from .serializers_auditoria import AuditoriaSerializer

class AuditoriaViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Auditoria.objects.select_related('usuario').all()
    serializer_class = AuditoriaSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['usuario__username', 'accion', 'modulo', 'descripcion']
    ordering_fields = ['fecha', 'usuario']

    def get_queryset(self):
        queryset = super().get_queryset()
        usuario = self.request.query_params.get('usuario')
        accion = self.request.query_params.get('accion')
        modulo = self.request.query_params.get('modulo')
        fecha = self.request.query_params.get('fecha')
        if usuario:
            queryset = queryset.filter(usuario__username=usuario)
        if accion:
            queryset = queryset.filter(accion=accion)
        if modulo:
            queryset = queryset.filter(modulo=modulo)
        if fecha:
            queryset = queryset.filter(fecha__date=fecha)
        return queryset
