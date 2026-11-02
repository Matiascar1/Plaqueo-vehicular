# Plaqueo Vehicular

Prototipo responsive para explorar remates oficiales de vehículos en Perú con filtros, ficha por vehículo, trazabilidad de fuentes y análisis de rentabilidad.

## Importante

- Los tres vehículos del prototipo son casos **demostrativos**.
- La página no inventa antecedentes ni consulta bases restringidas.
- Los enlaces a SUNAT, SAT Lima y PRONABI llevan a fuentes oficiales.
- “No disponible” no significa “sin deuda”.

## Ver localmente

Abre `dist/index.html` en un servidor web estático. No requiere instalación ni compilación.

## Actualizar los datos

1. Edita el arreglo `vehicles` en `dist/app.js`.
2. Conserva `status: 'Demostrativo'` hasta contar con un aviso oficial verificable.
3. Actualiza la fecha y el estado de cada fuente en `dist/index.html`.
4. Para datos reales, conserva el enlace original y no completes campos ausentes con suposiciones.

## Publicación

El flujo incluido en `.github/workflows/pages.yml` publica automáticamente la carpeta `dist` en GitHub Pages al actualizar la rama `main`.

