/*
 * datos.js - Los datos de tu tema
 * Los datos viven aquí, separados de la interfaz. app.js los recorre
 * y construye las tarjetas: nunca se escriben tarjetas a mano en el HTML.
 *
 * TODO (issue #1):
 *
 * 1. Completa configuracion:
 *      titulo         nombre de tu proyecto
 *      campoOrden     nombre de la propiedad NUMÉRICA que se usa para ordenar
 *                     (precio, duracionMinutos, paginas...). Se elige en la guía.
 *      etiquetaValor  cómo se muestra ese número en la tarjeta ("Precio", "Duración")
 *
 * 2. Llena items con los 12 elementos de la página de Contenido de tu
 *    empresa en el Manual de marca (nombres, categorías y valores exactos).
 *    TODOS con las mismas propiedades:
 *      id           número, único
 *      nombre       texto
 *      categoria    texto (mínimo 3 categorías, cada una con 2 o más elementos)
 *      descripcion  texto corto
 *      imagen       ruta en img/ (que exista) o URL que empiece por https://
 *      la propiedad de campoOrden (número)
 *      y los 2 campos propios que indica tu tema en la guía
 *
 * La información es ficticia: la entrega la empresa en el manual.
 * Puedes usar img/placeholder.svg mientras consigues imágenes.
 */

const configuracion = {
  titulo: '',
  campoOrden: '',
  etiquetaValor: ''
};

const items = [
  // Ejemplo de la forma (tema Mercado campesino). Bórralo y escribe los tuyos.
  // {
  //   id: 1,
  //   nombre: 'Mora de Castilla',
  //   categoria: 'frutas',
  //   descripcion: 'Mora fresca de las veredas de Santa Rosa de Cabal.',
  //   imagen: 'img/placeholder.svg',
  //   precio: 6500,
  //   unidad: 'libra',
  //   municipio: 'Santa Rosa de Cabal'
  // },
];
