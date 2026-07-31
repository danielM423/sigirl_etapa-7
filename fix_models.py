import os
path = r"C:\Users\APRENDIZ\Desktop\faiber\sigirl_etapa-7\sigirl\inventario\models.py"
with open(path, "r", encoding="utf-8") as f:
    lines = f.readlines()

new_lines = []
for line in lines:
    orig = line
    stripped = line.lstrip()
    if stripped.startswith("class ") or not stripped or stripped.startswith("#") or stripped.startswith("from ") or stripped.startswith("import "):
        new_lines.append(line)
        continue
    
    # Try to fix obvious indentation errors for class members
    if any(stripped.startswith(prefix) for prefix in ["nombre =", "tipo =", "categoria =", "def ", "return ", "ficha =", "fecha =", "grupos_trabajo =", "instructor =", "estado =", "requiere_doble_aprobacion =", "observaciones =", "practica ="]):
        if not line.startswith("    "):
            new_lines.append("    " + stripped)
            continue
    new_lines.append(line)

with open(path, "w", encoding="utf-8") as f:
    f.writelines(new_lines)
