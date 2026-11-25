# Evaluación 2 - Maquetación dinámica (Bootstrap + CSS + JS)

Ficha 3349882 - Tecnólogo en Análisis y Desarrollo de Software - SENA CDITI.
Trabajo individual. Cambia este README por la descripción de tu proyecto
cuando termines (tema, qué hace y cómo verlo).

## Qué vas a construir

Un catálogo web para la empresa de tu tema (ver `TEMAS.md`) donde JavaScript construye las
tarjetas a partir de los datos de `js/datos.js`, y la persona puede filtrar
por categoría, buscar por texto y ordenar. La apariencia NO la eliges tú: sigue la
guía de diseño de tu empresa (Manual de marca: colores, fuentes, cómo va la
página y toda la información que lleva: textos, contacto y los 12 elementos del
catálogo), aplicada en `css/estilos.css` sobre Bootstrap 5.3.

## Archivos

| Archivo | Qué haces ahí |
|---------|---------------|
| `index.html` | Estructura semántica, navbar, controles y grilla (issue #2) |
| `css/estilos.css` | Guía de diseño de tu empresa con variables (issue #1) |
| `js/datos.js` | Datos de tu tema (issue #1) |
| `js/app.js` | Tarjetas, filtros, orden y eventos (issues #3 y #4) |
| `ISSUES.md` | Los 5 issues que debes crear en GitHub |
| `ENTREGA.md` | Datos de tu entrega (issue #5) |
| `verificar-evaluacion.js` | Revisa las pautas y calcula tu nota automática. No lo modifiques |

## Cómo empezar

1. Crea en GitHub un repositorio **público** llamado `evaluacion2-maquetacion`, vacío.
2. Descomprime el zip, entra a la carpeta y súbela:

```
git init -b main
git add .
git commit -m "chore: plantilla inicial"
git remote add origin https://github.com/TU-USUARIO/evaluacion2-maquetacion.git
git push -u origin main
```

3. Crea los issues #1 a #5 desde `ISSUES.md`.
4. Trabaja issue por issue. Cierra cada uno con un commit `closes #n` y haz `git push`.
5. Activa GitHub Pages: Settings, Pages, Deploy from a branch, `main`, carpeta `/ (root)`.

## Verificar tu avance

```
node verificar-evaluacion.js --sin-api
```

Muestra qué pautas cumples, una pista para cada una que falta y tu nota
automática (puntos ÷ 12, máximo 4.5). Escribe primero tu número de tema en `ENTREGA.md`: el verificador lo usa para
revisar tu guía de diseño. Las 3 revisiones en línea (repositorio público,
issues cerrados y Pages) las hace el instructor con su copia del verificador.
La sustentación vale 0.5.

Para ver la página mientras trabajas, abre `index.html` en el navegador o usa
la extensión Live Server de VS Code.
