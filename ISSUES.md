# Issues del proyecto

Crea estos 5 issues en tu repositorio, en este orden, para que queden con los
números #1 a #5. Copia el título y los criterios de aceptación. Cada issue se
cierra con un commit que diga `closes #n` (puedes hacer varios commits por
issue; el último lo cierra).

---

## #1 Datos y guía de diseño de la empresa

Como empresa, quiero que el sitio use exactamente mi identidad visual y mi
información (Manual de marca), para que los clientes reconozcan la marca.

Criterios de aceptación:
- [ ] `datos.js` tiene `configuracion` (titulo, campoOrden, etiquetaValor) y los 12 elementos de la página de Contenido del Manual de marca, con sus categorías, valores y campos propios.
- [ ] `estilos.css` define en `:root` las variables `--marca-primario`, `--marca-secundario`, `--marca-fondo` y `--marca-texto` con los códigos EXACTOS del Manual de marca.
- [ ] Las dos fuentes del manual se enlazan desde Google Fonts; `--marca-fuente` es la del cuerpo y `--marca-fuente-titulos` se aplica a h1, h2 y h3.
- [ ] El texto sobre el fondo y el texto blanco sobre el color primario tienen contraste de 4.5:1 o más (las paletas del manual ya cumplen).
- [ ] Bootstrap usa la marca: `--bs-body-bg`, `--bs-body-color` y `--bs-body-font-family`.
- [ ] El botón de filtro está personalizado con 3 o más variables `--bs-btn-*`.
- [ ] Hay una regla `:focus-visible`.

Consulta: [Google Fonts](https://fonts.google.com/), [Variables CSS (MDN)](https://developer.mozilla.org/es/docs/Web/CSS/Using_CSS_custom_properties), [Variables CSS de Bootstrap](https://getbootstrap.com/docs/5.3/customize/css-variables/), [Comprobador de contraste (WebAIM)](https://webaim.org/resources/contrastchecker/)

---

## #2 Estructura semántica, navbar y grilla

Como visitante que usa teclado o lector de pantalla, quiero una página bien
estructurada, para moverme por ella sin perderme.

Criterios de aceptación:
- [ ] El nombre de la empresa en la navbar, el `h1`, el texto de la presentación, la sección "acerca de" y los datos de contacto del footer son los del Manual de marca.
- [ ] `title` propio, enlace "Saltar al contenido" y `main id="contenido"`.
- [ ] `header` con navbar que se pliega en celular (botón con `aria-controls`, `aria-expanded` y `aria-label`).
- [ ] Un solo `h1`. Secciones del catálogo y de `id="acerca"` con `aria-labelledby` apuntando a su `h2`.
- [ ] Controles del catálogo: grupo de filtros (`role="group"`, `aria-label`, botón "todas" y uno por categoría con `data-categoria` y `aria-pressed`), buscador `type="search"` con `label`, `select id="orden"` con `label`, y `#contador` con `aria-live="polite"`.
- [ ] La navbar tiene el color del manual y va fija (`sticky-top`) solo si el manual lo indica.
- [ ] La presentación (hero) es como indica el manual: centrada sin imagen, o en dos columnas con imagen.
- [ ] `#catalogo` es una fila de Bootstrap: 1 columna en celular, 2 en tableta y en escritorio las columnas que indica el manual (3 o 4).
- [ ] La sección "acerca de" usa una grilla de 2 columnas, con la imagen al lado que indica el manual.
- [ ] `footer` al final. Sin scroll horizontal a 360 px de ancho.

Consulta: [Navbar](https://getbootstrap.com/docs/5.3/components/navbar/), [Grilla](https://getbootstrap.com/docs/5.3/layout/grid/), [Button group](https://getbootstrap.com/docs/5.3/components/button-group/), [aria-live (MDN)](https://developer.mozilla.org/es/docs/Web/Accessibility/ARIA/Attributes/aria-live)

---

## #3 Tarjetas desde los datos

Como visitante, quiero ver todos los elementos del catálogo en tarjetas, para
compararlos de un vistazo.

Criterios de aceptación:
- [ ] `crearCard(item)` devuelve una tarjeta `article.card` con las clases de estilo que indica el manual, imagen y `alt` descriptivo, `card-body`, `h3.card-title`, badge con la categoría, descripción, el valor de `campoOrden` con su etiqueta y los 2 campos propios.
- [ ] `generarHTML(lista)` devuelve todas las tarjetas (map + join) o un mensaje si la lista está vacía.
- [ ] Al abrir la página se ven todas las tarjetas y el contador dice cuántas hay.

Consulta: [Template literals (MDN)](https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Template_literals), [Array.map (MDN)](https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Global_Objects/Array/map), [Card](https://getbootstrap.com/docs/5.3/components/card/)

---

## #4 Filtrar, buscar y ordenar

Como visitante, quiero filtrar por categoría, buscar por texto y ordenar, para
encontrar rápido lo que me interesa.

Criterios de aceptación:
- [ ] `filtrarPorCategoria`, `buscarPorTexto`, `ordenarItems` y `aplicarFiltros` funcionan y no modifican la lista original.
- [ ] Clic en un filtro: se actualiza la lista y `aria-pressed` del botón elegido queda en `true` (los demás en `false`).
- [ ] Escribir en el buscador actualiza la lista mientras se escribe (evento `input`).
- [ ] Cambiar el orden actualiza la lista (evento `change`).
- [ ] Los tres controles se combinan, y el contador se actualiza siempre.

Consulta: [Array.filter (MDN)](https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Global_Objects/Array/filter), [Array.sort (MDN)](https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Global_Objects/Array/sort), [addEventListener (MDN)](https://developer.mozilla.org/es/docs/Web/API/EventTarget/addEventListener)

---

## #5 Publicación y entrega

Como empresa, quiero ver el sitio publicado, para revisarlo y aprobarlo.

Criterios de aceptación:
- [ ] El sitio está publicado en GitHub Pages y funciona igual que en tu equipo.
- [ ] Se ve bien a 360 px de ancho, sin scroll horizontal, y se parece al boceto del Manual de marca.
- [ ] `ENTREGA.md` está completo (nombre, número de tema, empresa y enlaces).
- [ ] `node verificar-evaluacion.js --sin-api` no muestra errores de carga.

Consulta: [GitHub Pages](https://docs.github.com/es/pages/getting-started-with-github-pages/creating-a-github-pages-site)
