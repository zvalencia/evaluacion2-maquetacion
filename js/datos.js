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
  titulo: 'Ferretería El Tornillo',
  campoOrden: 'precio',
  etiquetaValor: 'Precio'
};

const items = [
  {
    id: 1,
    nombre: 'Taladro percutor',
    categoria: 'electricas',
    descripcion: 'Taladro de 650 W con maletín.',
    imagen: 'img/placeholder.svg',
    precio: 289000,
    marca: 'Fuerza',
    garantiaMeses: 24
  },
  {
    id: 2,
    nombre: 'Pulidora angular',
    categoria: 'electricas',
    descripcion: 'Pulidora de 4 1/2 pulgadas y 850 W.',
    imagen: 'img/placeholder.svg',
    precio: 245000,
    marca: 'Fuerza',
    garantiaMeses: 12
  },
  {
    id: 3,
    nombre: 'Sierra caladora',
    categoria: 'electricas',
    descripcion: 'Cortes rectos y curvos en madera.',
    imagen: 'img/placeholder.svg',
    precio: 210000,
    marca: 'Corte',
    garantiaMeses: 12
  },
  {
    id: 4,
    nombre: 'Martillo de uña',
    categoria: 'manuales',
    descripcion: 'Martillo de 16 onzas con mango de fibra',
    imagen: 'img/placeholder.svg',
    precio: 35000,
    marca: 'Acero',
    garantiaMeses: 6
  },
  {
    id: 5,
    nombre: 'Juego de destornilladores',
    categoria: 'manuales',
    descripcion: 'Seis destornilladores de pala y estrella.',
    imagen: 'img/placeholder.svg',
    precio: 42000,
    marca: 'Acero',
    garantiaMeses: 6
  },
  {
    id: 6,
    nombre: 'Flexómetro 5 m',
    categoria: 'manuales',
    descripcion: 'Cinta métrica con freno y gancho.',
    imagen: 'img/placeholder.svg',
    precio: 18000,
    marca: 'Medida',
    garantiaMeses: 3
  },
  {
    id: 7,
    nombre: 'Pintura blanca',
    categoria: 'pintura',
    descripcion: 'Galón de pintura tipo 1 para interiores.',
    imagen: 'img/placeholder.svg',
    precio: 78000,
    marca: 'Colorama',
    garantiaMeses: 0
  },
  {
    id: 8,
    nombre: 'Rodillo de felpa',
    categoria: 'pintura',
    descripcion: 'Rodillo de 9 pulgadas con bandeja.',
    imagen: 'img/placeholder.svg',
    precio: 22000,
    marca: 'Colorama',
    garantiaMeses: 0
  },
  {
    id: 9,
    nombre: 'Esmalte anticorrosivo',
    categoria: 'pintura',
    descripcion: 'Cuarto de galón para metal.',
    imagen: 'img/placeholder.svg',
    precio: 36000,
    marca: 'Colorama',
    garantiaMeses: 0
  },
  {
    id: 10,
    nombre: 'Tubo PVC 1/2',
    categoria: 'plomeria',
    descripcion: 'Tubo de presión de 6 metros.',
    imagen: 'img/placeholder.svg',
    precio: 15000,
    marca: 'Hidro',
    garantiaMeses: 0
  },
  {
    id: 11,
    nombre: 'Llave de lavaplatos',
    categoria: 'plomeria',
    descripcion: 'Grifería cromada de cuello alto.',
    imagen: 'img/placeholder.svg',
    precio: 68000,
    marca: 'Hidro',
    garantiaMeses: 12
  },
  {
    id: 12,
    nombre: 'Cinta de teflón',
    categoria: 'plomeria',
    descripcion: 'Rollo para sellar roscas.',
    imagen: 'img/placeholder.svg',
    precio: 2500,
    marca: 'Hidro',
    garantiaMeses: 0
  }
];