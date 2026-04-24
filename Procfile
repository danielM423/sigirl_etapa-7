web: cd sigirl && python manage.py migrate --noinput && python ../crear_usuarios.py && python manage.py collectstatic --noinput && gunicorn sigirl.wsgi:application --bind 0.0.0.0:$PORT
