from celery import shared_task # type: ignore
from datetime import date, timedelta
from .models import Practica, PracticaEquipo, PracticaMaterial, PracticaReactivo

@shared_task
def verificar_practicas_recurrentes():
    """
    Verifica prácticas recurrentes y crea nuevas instancias si corresponde
    """
    hoy = date.today()
    
    # Buscar prácticas recurrentes activas
    practicas = Practica.objects.filter(
        es_recurrente=True,
        repeticiones_realizadas__lt=models.F('repeticiones_totales') # type: ignore
    )
    
    for practica in practicas:
        # Calcular próxima fecha
        if practica.fecha_ultima_repeticion:
            prox_fecha = practica.fecha_ultima_repeticion + timedelta(days=practica.periodicidad_dias)
        else:
            prox_fecha = practica.fecha
        
        # Si la próxima fecha es hoy o anterior, crear nueva instancia
        if prox_fecha <= hoy:
            # Crear nueva práctica basada en la original
            nueva = Practica.objects.create(
                ficha=practica.ficha,
                nombre=f"{practica.nombre} (Repetición {practica.repeticiones_realizadas + 1})",
                fecha=prox_fecha,
                grupos_trabajo=practica.grupos_trabajo,
                instructor=practica.instructor,
                competencia=practica.competencia,
                observaciones=practica.observaciones,
                es_recurrente=False  # La nueva no es recurrente (o sí, según necesidad)
            )
            
            # Copiar reactivos
            for pr in practica.reactivos.all():
                PracticaReactivo.objects.create(
                    practica=nueva,
                    reactivo=pr.reactivo,
                    cantidad=pr.cantidad,
                    unidad=pr.unidad,
                    es_sensible=pr.es_sensible
                )
            
            # Copiar equipos
            for pe in practica.equipos.all():
                PracticaEquipo.objects.create(
                    practica=nueva,
                    equipo=pe.equipo,
                    tiempo_uso_min=pe.tiempo_uso_min,
                    desgaste_estimado=pe.desgaste_estimado,
                    mantenimiento_requerido=pe.mantenimiento_requerido
                )
            
            # Copiar materiales
            for pm in practica.materiales.all():
                PracticaMaterial.objects.create(
                    practica=nueva,
                    nombre=pm.nombre,
                    cantidad_por_grupo=pm.cantidad_por_grupo,
                    cantidad_total=pm.cantidad_total
                )
            
            # Actualizar contadores
            practica.repeticiones_realizadas += 1
            practica.fecha_ultima_repeticion = prox_fecha
            practica.save()
            
            print(f"✅ Práctica recurrente generada: {nueva.nombre} para {prox_fecha}")
    
    return f"Procesadas {practicas.count()} prácticas recurrentes"