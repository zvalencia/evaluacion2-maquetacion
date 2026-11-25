/*
- app.js - JavaScript que construye la interfaz
 *
- Los NOMBRES de las funciones y sus parámetros no se cambian: el
- verificador las llama así. Lo que hay dentro lo escribes tú.
 *
- Las funciones de los issues #3 y #4 (crearCard, generarHTML, filtrar,
- buscar, ordenar, aplicarFiltros) NO tocan el DOM: reciben datos y
- devuelven datos o texto. Solo actualizarVista() e iniciar() usan document.
 *
- Consulta:
-   https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Template_literals
-   https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Global_Objects/Array/map
-   https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Global_Objects/Array/filter
-   https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Global_Objects/Array/sort
-   https://developer.mozilla.org/es/docs/Web/API/EventTarget/addEventListener
-   https://es.javascript.info/array-methods
 */

// Estado de la interfaz: lo que la persona eligió en los controles.
const estado = {
  categoria: 'todas',
  texto: '',
  orden: 'nombre-asc'
};

/* ---------------------------------------------------------------
- Issue #3 - Datos a tarjetas
- --------------------------------------------------------------- */

function crearCard(item) {
  const campoOrden = configuracion.campoOrden;
  const valorRaw = item[campoOrden];
  const valorFormateado = typeof valorRaw === 'number'
    ? valorRaw.toLocaleString('es-CO')
    : valorRaw;

  const garantiaTexto = item.garantiaMeses > 0
    ? `${item.garantiaMeses} meses`
    : 'Sin garantía';

  return `
    <div class="col">
      <article class="card h-100 border-0 shadow-sm">
        <img src="${item.imagen}" class="card-img-top" alt="${item.nombre}">
        <div class="card-body d-flex flex-column">
          <div class="mb-2">
            <span class="badge text-bg-secondary">${item.categoria}</span>
          </div>
          <h3 class="card-title h5">${item.nombre}</h3>
          <p class="card-text">${item.descripcion}</p>
          <p class="mb-1"><strong>${configuracion.etiquetaValor}:</strong> $${valorFormateado}</p>
          <p class="mb-1 small"><strong>Marca:</strong> ${item.marca}</p>
          <p class="mb-0 small"><strong>Garantía:</strong> ${garantiaTexto}</p>
        </div>
      </article>
    </div>
  `;
}

function generarHTML(lista) {
  if (!Array.isArray(lista) || lista.length === 0) {
    return '<p class="text-center col-12">No hay resultados para tu búsqueda.</p>';
  }
  return lista.map(crearCard).join('');
}

/* ---------------------------------------------------------------
- Issue #4 - Filtrar, buscar y ordenar
- Ninguna de estas funciones modifica la lista que recibe.
- --------------------------------------------------------------- */

function filtrarPorCategoria(lista, categoria) {
  if (!categoria || categoria === 'todas') {
    return [...lista];
  }
  return lista.filter((item) => item.categoria === categoria);
}

function buscarPorTexto(lista, texto) {
  const consulta = (texto || '').trim().toLowerCase();
  if (!consulta) {
    return [...lista];
  }
  return lista.filter((item) => {
    const nombre = (item.nombre || '').toLowerCase();
    const descripcion = (item.descripcion || '').toLowerCase();
    return nombre.includes(consulta) || descripcion.includes(consulta);
  });
}

function ordenarItems(lista, criterio) {
  const copia = [...lista];
  if (criterio === 'valor-asc') {
    return copia.sort((a, b) => Number(a[configuracion.campoOrden]) - Number(b[configuracion.campoOrden]));
  }
  if (criterio === 'valor-desc') {
    return copia.sort((a, b) => Number(b[configuracion.campoOrden]) - Number(a[configuracion.campoOrden]));
  }
  return copia.sort((a, b) => String(a.nombre).localeCompare(String(b.nombre), 'es'));
}

function aplicarFiltros(lista, estadoActual) {
  const actual = estadoActual || estado;
  const porCategoria = filtrarPorCategoria(lista, actual.categoria);
  const porTexto = buscarPorTexto(porCategoria, actual.texto);
  return ordenarItems(porTexto, actual.orden);
}

/* ---------------------------------------------------------------
- Issue #4 - Eventos (estas sí usan el DOM)
- --------------------------------------------------------------- */

function actualizarVista() {
  const contenedor = document.getElementById('catalogo');
  const contador = document.getElementById('contador');
  const filtrados = aplicarFiltros(items, estado);

  if (contenedor) {
    contenedor.innerHTML = generarHTML(filtrados);
  }
  if (contador) {
    contador.textContent = `Mostrando ${filtrados.length} de ${items.length} resultados`;
  }
}

function iniciar() {
  const botonesCategoria = document.querySelectorAll('[data-categoria]');
  const buscador = document.getElementById('buscador');
  const selectOrden = document.getElementById('orden');

  botonesCategoria.forEach((boton) => {
    boton.addEventListener('click', () => {
      estado.categoria = boton.dataset.categoria;

      botonesCategoria.forEach((btn) => {
        const seleccionado = btn === boton;
        btn.setAttribute('aria-pressed', seleccionado ? 'true' : 'false');
        btn.classList.toggle('active', seleccionado);
      });

      actualizarVista();
    });
  });

  if (buscador) {
    buscador.addEventListener('input', (evento) => {
      estado.texto = evento.target.value;
      actualizarVista();
    });
  }

  if (selectOrden) {
    selectOrden.addEventListener('change', (evento) => {
      estado.orden = evento.target.value;
      actualizarVista();
    });
  }

  actualizarVista();
}

// No cambies estas líneas: así el archivo también carga en el verificador,
// donde no existe document.
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', iniciar);
}