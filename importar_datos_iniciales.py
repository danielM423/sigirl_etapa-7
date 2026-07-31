import os
import sys
import django

# Agregar el directorio actual al path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'sigirl.settings')
django.setup()

from sigirl.inventario.models import Programa, Competencia, Practica
from django.contrib.auth import get_user_model

User = get_user_model()
admin = User.objects.get(username='admin')

programas_data = [
    {
        'nombre': 'Química Aplicada a la Industria',
        'codigo': '291201087',
        'competencias': [
            {
                'codigo': '291201087',
                'nombre': 'Preparar ensayo químico según requerimientos y normativa técnica',
                'practicas': [
                    'Identificación del material del laboratorio químico.',
                    'Clasificación del material del laboratorio químico.',
                    'Medición de volúmenes de líquidos.',
                    'Manipular equipos básicos de laboratorio: Uso de la balanza analítica y la balanza de precisión.',
                    'Pesada de sólidos producidos por reacción Química (precipitación, filtración y secado del precipitado)',
                    'Determinación de cenizas: uso de la mufla y el desecador.',
                    'Limpieza y lavado del material de laboratorio.',
                    'Identificación de la peligrosidad de las sustancias químicas.',
                    'Manipular equipos básicos de laboratorio: potenciómetro.',
                    'Manipular equipos básicos de laboratorio: centrífuga.',
                    'Manipular equipos básicos de laboratorio: refractómetro.',
                    'Almacenamiento de reactivos químicos.',
                    'Inventariar materiales, reactivos y equipos de laboratorio.',
                    'Manipulación de residuos químicos.'
                ]
            },
            {
                'codigo': '291201086',
                'nombre': 'Valorar muestras según técnicas de análisis químico',
                'practicas': [
                    'Preparación de muestras para análisis químico: molienda, tamizado, cuarteo, filtrado, secado.',
                    'Realización del montaje para filtración al vacío y por gravedad.',
                    'Realización del montaje para destilación simple y fraccionada.',
                    'Realización del montaje para destilación por arrastre de vapor.',
                    'Realización del montaje para destilación a presión reducida.',
                    'Realización del montaje para extracción sólido – líquido.',
                    'Realización del montaje para extracción líquido – líquido.',
                    'Realización del montaje para cromatografía en capa delgada, papel y columna.',
                    'Realización del montaje para reflujo químico.',
                    'Identificación de cationes del primer grupo.',
                    'Análisis cualitativo elemental orgánico.',
                    'Clasificación de sustancias orgánicas por solubilidad.',
                    'Determinación de constantes físicas de sustancias orgánicas: punto de fusión, punto de ebullición, densidad, índice de refracción.',
                    'Identificación de alcoholes.',
                    'Identificación de ácidos carboxílicos.',
                    'Identificación de aldehídos y cetonas.',
                    'Identificación de aminas.',
                    'Identificación de carbohidratos.',
                    'Preparación de soluciones para análisis químico.',
                    'Tipos de reacciones químicas.',
                    'Estequiometría de las reacciones.',
                    'Equilibrio químico.',
                    'Nomenclatura inorgánica.',
                    'Tipos de enlace químico.',
                    'Concepto de Avogadro.'
                ]
            },
            {
                'codigo': '220202017',
                'nombre': 'Conducir proceso de biotransformación de acuerdo con tipo de producto y plan de producción',
                'practicas': [
                    'Reconocimiento de las normas de bioseguridad (Manual del uso de laboratorios química CGI)',
                    'Reconocimiento de los equipos del laboratorio de biotecnología CGI',
                    'Preparación de medios de cultivo y siembra de microorganismos',
                    'Realización del montaje de la tinción de Gram a partir de microorganismos aislados',
                    'Preparación de los medios de cultivo, soluciones y reactivos específicos para el aislamiento del microorganismo de interés',
                    'Aislamiento, recuento y selección del microorganismo de interés',
                    'Lectura de resultados del aislamiento, recuento y selección del microorganismo de interés',
                    'Preparación de los medios de cultivo, soluciones y reactivos específicos para el montaje de la fermentación',
                    'Preparación de inóculos a partir del microorganismo de interés y utilizando las materias primas de interés',
                    'Producción del metabolito de interés a partir de inóculos microbianos',
                    'Lectura de los resultados obtenidos durante la fermentación',
                    'Recuperación del metabolito de interés por medio de filtración y centrifugación'
                ]
            },
            {
                'codigo': '291201004',
                'nombre': 'Aplicar técnicas instrumentales de análisis de acuerdo con los protocolos y naturaleza de la muestra',
                'practicas': [
                    'Determinación del porcentaje de humedad en suelo, harina, MP, etc. Por gravimetría.',
                    'Determinación del agua de hidratación en un hidrato (gravimetría).',
                    'Determinación de CaO en una piedra caliza por gravimetría.',
                    'Determinación del porcentaje de níquel en sales y aceros por precipitación con DMG.',
                    'Preparación y estandarización de soluciones de HCl y NaOH.',
                    'Determinación del porcentaje de ácido acético en un vinagre comercial por volumetría de neutralización (acidimetría)',
                    'Determinación del porcentaje de carbonatos en una piedra caliza por volumetría de neutralización (alcalimetría)',
                    'Determinación del porcentaje de nitrógeno por el método Kjeldahl (porcentaje de proteína en harina, carne, cereal).',
                    'Preparación y estandarización de una solución de Na2S2O3 con KH(IO3)2',
                    'Determinación de oxígeno disuelto (OD) en agua por el método Winkler.',
                    'Determinación de cloro activo en lejías o en polvos de blanqueo por valoración con tiosulfato de sodio.',
                    'Preparación y estandarización de una solución de KMnO4.',
                    'Determinación del porcentaje de CaO de una caliza por permanganimetría.',
                    'Determinación de H2O2 en agua oxigenada comercial por permanganimetría.',
                    'Preparación y estandarización de una solución de nitrato de plata.',
                    'Determinación de cloruros por el método Mohr.',
                    'Preparación y estandarización de una solución de KSCN.',
                    'Determinación de cloruros por el método Volhard.',
                    'Preparación y estandarización de una solución de EDTA.',
                    'Determinación de la dureza del agua con EDTA.',
                    'Determinación del contenido de azúcares reductores por el método de Fehling.',
                    'Test de jarras: determinación de la dosis óptima de coagulante en un agua residual.',
                    'Determinación de sulfatos por turbidimetría.',
                    'Determinación del porcentaje de ácido acético en un vinagre comercial por titulación potenciométrica.',
                    'Determinación potenciométrica de la alcalinidad de un agua residual.',
                    'Determinación de nitritos en una muestra comercial por espectroscopía visible.',
                    'Determinación de ácido ascórbico en un jugo comercial por espectroscopía UV-VIS.',
                    'Identificación de grupos funcionales orgánicos por espectroscopía IR.',
                    'Determinación de metales en diferentes matrices por AAS.',
                    'Separación y cuantificación de los componentes de una mezcla de alcoholes por GCMS.',
                    'Determinación de la concentración de una solución de sacarosa por polarimetría.',
                    'Determinación de humedad por termobalanza.'
                ]
            }
        ]
    }
]

print('📥 Importando prácticas...')

for programa_data in programas_data:
    programa, created = Programa.objects.get_or_create(
        nombre=programa_data['nombre'],
        defaults={'activo': True}
    )
    print(f'  ✅ Programa: {programa.nombre} ({"creado" if created else "existente"})')

    for comp_data in programa_data['competencias']:
        competencia, created = Competencia.objects.get_or_create(
            codigo=comp_data['codigo'],
            defaults={
                'nombre': comp_data['nombre'],
                'programa': programa,
                'activo': True
            }
        )
        print(f'    ✅ Competencia: {competencia.nombre[:40]}... ({"creado" if created else "existente"})')

        for practica_nombre in comp_data['practicas']:
            practica, created = Practica.objects.get_or_create(
                nombre=practica_nombre,
                defaults={
                    'ficha': f'PRAC-{competencia.codigo}',
                    'competencia': competencia,
                    'instructor': admin,
                    'estado': 'aprobada',
                    'grupos_trabajo': 1
                }
            )
            if created:
                print(f'      ✅ Práctica: {practica_nombre[:40]}...')

print('\n🎉 ¡Importación completada!')
print(f'📊 Resumen:')
print(f'  - Programas: {Programa.objects.count()}')
print(f'  - Competencias: {Competencia.objects.count()}')
print(f'  - Prácticas: {Practica.objects.count()}')