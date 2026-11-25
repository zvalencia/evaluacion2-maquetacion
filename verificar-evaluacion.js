/*
 * verificar-evaluacion.js
 * Evaluación 2 - Maquetación dinámica (Bootstrap + CSS + JS)
 * Ficha 3349882 - ADSO - SENA CDITI
 *
 * Uso:
 *   node verificar-evaluacion.js                 revisa la carpeta actual
 *   node verificar-evaluacion.js ruta/al/repo    revisa otra carpeta
 *   node verificar-evaluacion.js --sin-api       omite las consultas a GitHub
 *
 * Para las consultas a GitHub se puede usar un token (evita el límite de
 * 60 consultas por hora de la red del salón):
 *   GITHUB_TOKEN=xxxx node verificar-evaluacion.js
 *   (o tener la sesión de gh iniciada: se usa "gh auth token")
 *
 * Puntaje: 54 puntos automáticos. Nota automática = puntos / 12 (máximo 4.5).
 * La sustentación oral (0.5) la califica el instructor.
 *
 * No necesita npm install: usa solo módulos de Node.js 18 o superior.
 */

'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { execSync } = require('child_process');

const args = process.argv.slice(2);
const SIN_API = args.includes('--sin-api');
const RAIZ = path.resolve(args.find((a) => !a.startsWith('--')) || '.');

const bloques = [];
let bloqueActual = null;

function bloque(nombre, maximo) {
  bloqueActual = { nombre, maximo, puntos: 0, items: [] };
  bloques.push(bloqueActual);
}

function revisar(descripcion, fn, pista) {
  let ok = false;
  let detalle = '';
  try {
    const r = fn();
    ok = r === true || (r && r.ok === true);
    if (r && typeof r === 'object' && r.detalle) detalle = r.detalle;
  } catch (e) {
    ok = false;
    detalle = 'Error: ' + e.message;
  }
  if (ok) bloqueActual.puntos += 1;
  bloqueActual.items.push({ ok, descripcion, detalle, pista });
}

function leer(rel) {
  const p = path.join(RAIZ, rel);
  return fs.existsSync(p) ? fs.readFileSync(p, 'utf8') : '';
}

function sinComentariosHTML(s) { return s.replace(/<!--[\s\S]*?-->/g, ''); }
function sinComentariosCSS(s) { return s.replace(/\/\*[\s\S]*?\*\//g, ''); }
function sinComentariosJS(s) {
  return s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:\\])\/\/.*$/gm, '$1');
}

// Etiquetas de apertura que coinciden con un patrón, con sus atributos.
function etiquetas(html, nombre) {
  const re = new RegExp('<' + nombre + '\\b([^>]*)>', 'gi');
  const out = [];
  let m;
  while ((m = re.exec(html))) out.push(m[1]);
  return out;
}
function attr(atributos, nombre) {
  const re = new RegExp('\\b' + nombre + '\\s*=\\s*("([^"]*)"|\'([^\']*)\')', 'i');
  const m = atributos.match(re);
  return m ? (m[2] !== undefined ? m[2] : m[3]) : null;
}
function tieneClase(atributos, clase) {
  const c = attr(atributos, 'class');
  return c ? c.split(/\s+/).includes(clase) : false;
}
function clases(atributos) {
  const c = attr(atributos, 'class');
  return c ? c.split(/\s+/) : [];
}
function textoPlano(s) { return s.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim(); }

// Contraste WCAG
function hexARgb(hex) {
  let h = hex.trim().replace('#', '');
  if (h.length === 3) h = h.split('').map((c) => c + c).join('');
  if (!/^[0-9a-f]{6}$/i.test(h)) return null;
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
}
function luminancia(rgb) {
  const [r, g, b] = rgb.map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
function contraste(a, b) {
  const la = luminancia(a);
  const lb = luminancia(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

// ---------------------------------------------------------------
// Carga de archivos
// ---------------------------------------------------------------
const htmlCrudo = leer('index.html');
const html = sinComentariosHTML(htmlCrudo);
const css = sinComentariosCSS(leer('css/estilos.css'));
const datosSrc = leer('js/datos.js');
const appSrc = leer('js/app.js');
const appSinComentarios = sinComentariosJS(appSrc);

// Se ejecutan datos.js y app.js en un contexto aislado, sin navegador.
// document es un objeto de relleno: si alguien lo usa fuera de una función,
// app.js igual carga y las funciones se pueden probar.
const relleno = new Proxy(function () {}, {
  get: (t, k) => (k === Symbol.toPrimitive ? () => '' : k === Symbol.iterator ? undefined : k === 'length' ? 0 : relleno),
  set: () => true,
  apply: () => relleno
});
let ctx = {};
let errorCarga = '';
let errorDatos = '';
const sandbox = { console: { log() {}, warn() {}, error() {} }, Intl, Math, Number, String, Array, Object, JSON };
vm.createContext(sandbox);
const extraerDatos = `({
  items: typeof items !== 'undefined' ? items : undefined,
  configuracion: typeof configuracion !== 'undefined' ? configuracion : undefined
})`;
try {
  vm.runInContext(datosSrc, sandbox, { filename: 'datos.js', timeout: 2000 });
  ctx = vm.runInContext(extraerDatos, sandbox);
} catch (e) {
  errorDatos = errorCarga = 'datos.js: ' + e.message;
}
if (!errorDatos) {
  try {
    sandbox.document = relleno;
    sandbox.window = sandbox;
    vm.runInContext(appSrc, sandbox, { filename: 'app.js', timeout: 2000 });
    ctx = Object.assign(ctx, vm.runInContext(`({
      crearCard: typeof crearCard === 'function' ? crearCard : undefined,
      generarHTML: typeof generarHTML === 'function' ? generarHTML : undefined,
      filtrarPorCategoria: typeof filtrarPorCategoria === 'function' ? filtrarPorCategoria : undefined,
      buscarPorTexto: typeof buscarPorTexto === 'function' ? buscarPorTexto : undefined,
      ordenarItems: typeof ordenarItems === 'function' ? ordenarItems : undefined,
      aplicarFiltros: typeof aplicarFiltros === 'function' ? aplicarFiltros : undefined
    })`, sandbox));
  } catch (e) {
    errorCarga = 'app.js: ' + e.message;
  }
}

const items = Array.isArray(ctx.items) ? ctx.items : [];
const conf = ctx.configuracion || {};
const campo = conf.campoOrden;
const copia = () => JSON.parse(JSON.stringify(items));
const categorias = [...new Set(items.map((i) => i && i.categoria))].filter(Boolean);
const REQUERIDOS = { id: 'number', nombre: 'string', categoria: 'string', descripcion: 'string', imagen: 'string' };

function exigeFuncion(nombre) {
  if (typeof ctx[nombre] !== 'function') throw new Error(nombre + '() no existe o app.js no carga');
  if (items.length < 4) throw new Error('faltan datos en datos.js para probar ' + nombre + '()');
  return ctx[nombre];
}
function contar(str, re) { return (String(str).match(re) || []).length; }

// ---------------------------------------------------------------
// A. HTML semántico y accesibilidad (9)
// ---------------------------------------------------------------
bloque('A. HTML semántico y accesibilidad', 9);

revisar('Idioma, viewport y título propio', () => {
  const lang = /<html[^>]*\blang\s*=\s*["']es/i.test(html);
  const vp = /<meta[^>]*name\s*=\s*["']viewport["']/i.test(html);
  const t = (html.match(/<title>([\s\S]*?)<\/title>/i) || [])[1] || '';
  const titulo = t.trim().length > 3 && !/plantilla|evaluaci[oó]n 2/i.test(t);
  return { ok: lang && vp && titulo, detalle: titulo ? '' : 'El <title> debe ser el nombre de tu proyecto' };
}, 'html lang="es", meta viewport y un <title> con el nombre de tu sitio.');

revisar('Enlace "Saltar al contenido" y main#contenido', () => {
  const salto = etiquetas(html, 'a').some((a) => attr(a, 'href') === '#contenido');
  const main = etiquetas(html, 'main').some((m) => attr(m, 'id') === 'contenido');
  return salto && main;
}, '<a class="visually-hidden-focusable" href="#contenido"> y <main id="contenido">.');

revisar('header con nav, footer y un solo h1', () => {
  const header = /<header\b[\s\S]*?<nav\b[\s\S]*?<\/header>/i.test(html);
  const footer = /<footer\b/i.test(html);
  const h1 = contar(html, /<h1\b/gi);
  return { ok: header && footer && h1 === 1, detalle: 'h1 encontrados: ' + h1 };
}, 'Usa landmarks: header > nav, main, footer. Debe haber exactamente un h1.');

revisar('Secciones con aria-labelledby y al menos 2 h2', () => {
  const secciones = etiquetas(html, 'section').filter((s) => {
    const id = attr(s, 'aria-labelledby');
    return id && new RegExp('id\\s*=\\s*["\']' + id + '["\']').test(html);
  });
  return { ok: secciones.length >= 2 && contar(html, /<h2\b/gi) >= 2, detalle: 'secciones válidas: ' + secciones.length };
}, 'Cada section apunta con aria-labelledby al id de su h2 (catálogo y acerca de, como mínimo).');

revisar('Buscador: input type="search" id="buscador" con label', () => {
  const inp = etiquetas(html, 'input').find((i) => attr(i, 'id') === 'buscador');
  const label = etiquetas(html, 'label').some((l) => attr(l, 'for') === 'buscador');
  return !!inp && attr(inp, 'type') === 'search' && label;
}, '<label for="buscador"> + <input type="search" id="buscador">.');

revisar('Select id="orden" con label y opciones nombre-asc, valor-asc, valor-desc', () => {
  const sel = (html.match(/<select\b[^>]*id\s*=\s*["']orden["'][^>]*>([\s\S]*?)<\/select>/i) || [])[1];
  const label = etiquetas(html, 'label').some((l) => attr(l, 'for') === 'orden');
  if (!sel) return false;
  const valores = etiquetas(sel, 'option').map((o) => attr(o, 'value'));
  return label && ['nombre-asc', 'valor-asc', 'valor-desc'].every((v) => valores.includes(v));
}, 'Los value de las opciones deben ser exactamente nombre-asc, valor-asc y valor-desc.');

revisar('Contador de resultados con aria-live', () => {
  const el = etiquetas(html, '[a-z0-9]+').find((a) => attr(a, 'id') === 'contador');
  return !!el && /^(polite|assertive)$/.test(attr(el, 'aria-live') || '');
}, 'Un elemento con id="contador" y aria-live="polite" que anuncie "Mostrando N resultados".');

revisar('Imágenes del HTML con alt y sin eventos en línea (onclick, oninput...)', () => {
  const imgs = etiquetas(html, 'img');
  const alts = imgs.every((i) => attr(i, 'alt') !== null);
  const enLinea = /\son(click|input|change|submit|load)\s*=/i.test(html);
  return { ok: alts && !enLinea, detalle: enLinea ? 'Hay manejadores en línea: usa addEventListener en app.js' : '' };
}, 'Todo <img> lleva alt. Los eventos se conectan en app.js, no en el HTML.');

revisar('Scripts: bundle de Bootstrap, datos.js antes que app.js', () => {
  const srcs = etiquetas(html, 'script').map((s) => attr(s, 'src') || '');
  const iD = srcs.findIndex((s) => /js\/datos\.js$/.test(s));
  const iA = srcs.findIndex((s) => /js\/app\.js$/.test(s));
  const bundle = srcs.some((s) => /bootstrap@5\.3[^"']*bootstrap\.bundle(\.min)?\.js/.test(s));
  return bundle && iD !== -1 && iA !== -1 && iD < iA;
}, 'Los datos deben existir antes de que app.js los use.');

// ---------------------------------------------------------------
// B. Bootstrap: grilla y componentes (7)
// ---------------------------------------------------------------
bloque('B. Bootstrap: grilla y componentes', 7);

revisar('Bootstrap 5.3 por CDN y estilos.css enlazado después', () => {
  const links = etiquetas(html, 'link').map((l) => attr(l, 'href') || '');
  const iB = links.findIndex((h) => /bootstrap@5\.3[^"']*bootstrap(\.min)?\.css/.test(h));
  const iE = links.findIndex((h) => /css\/estilos\.css$/.test(h));
  return iB !== -1 && iE > iB;
}, 'Si estilos.css carga antes, Bootstrap pisa tus estilos.');

revisar('Navbar que se pliega, con botón accesible', () => {
  const nav = etiquetas(html, 'nav').some((n) => tieneClase(n, 'navbar') && clases(n).some((c) => /^navbar-expand-(sm|md|lg|xl)$/.test(c)));
  const btn = etiquetas(html, 'button').find((b) => tieneClase(b, 'navbar-toggler'));
  if (!nav || !btn) return false;
  const id = attr(btn, 'aria-controls');
  const destino = etiquetas(html, 'div').some((d) => attr(d, 'id') === id && tieneClase(d, 'collapse'));
  return destino && attr(btn, 'aria-expanded') !== null && !!attr(btn, 'aria-label') && (attr(btn, 'data-bs-target') || '') === '#' + id;
}, 'navbar-expand-lg, navbar-toggler con data-bs-target, aria-controls, aria-expanded y aria-label.');

revisar('#catalogo es una fila responsive (1, 2 y 3 columnas)', () => {
  const cat = etiquetas(html, '[a-z]+').find((a) => attr(a, 'id') === 'catalogo');
  if (!cat || !tieneClase(cat, 'row')) return false;
  const c = clases(cat);
  const porFila = c.some((x) => /^row-cols-(md|sm)-2$/.test(x)) && c.some((x) => /^row-cols-(lg|xl)-[34]$/.test(x));
  let porCard = false;
  if (ctx.crearCard && items[0]) {
    const card = String(ctx.crearCard(items[0]));
    porCard = /col-(md|sm)-6/.test(card) && /col-(lg|xl)-(4|3)/.test(card);
  }
  return porFila || porCard;
}, 'Usa row row-cols-1 row-cols-md-2 row-cols-lg-3 en #catalogo, o col-12 col-md-6 col-lg-4 en cada tarjeta.');

revisar('Sección "acerca de" con grilla de 2 columnas', () => {
  const m = html.match(/<section\b[^>]*id\s*=\s*["']acerca["'][^>]*>([\s\S]*?)<\/section>/i);
  if (!m) return { ok: false, detalle: 'No hay <section id="acerca">' };
  return /class\s*=\s*["'][^"']*\brow\b/.test(m[1]) && contar(m[1], /\bcol-(sm|md|lg)-\d+/g) >= 2;
}, '<section id="acerca"> con un .row y dos columnas col-md-*.');

revisar('Grupo de filtros: role="group", aria-label, botones con data-categoria y aria-pressed', () => {
  const grupo = etiquetas(html, 'div').some((d) => tieneClase(d, 'btn-group') && attr(d, 'role') === 'group' && !!attr(d, 'aria-label'));
  const botones = etiquetas(html, 'button').filter((b) => attr(b, 'data-categoria') !== null);
  const bien = botones.filter((b) => attr(b, 'aria-pressed') !== null && attr(b, 'type') === 'button');
  return { ok: grupo && botones.length >= 4 && bien.length === botones.length, detalle: 'botones de filtro: ' + botones.length };
}, '<div class="btn-group" role="group" aria-label="...">, cada <button type="button" data-categoria="..." aria-pressed="false">.');

revisar('Hay un botón "todas" y uno por cada categoría de datos.js', () => {
  const valores = etiquetas(html, 'button').map((b) => attr(b, 'data-categoria')).filter((v) => v !== null);
  const faltan = categorias.filter((c) => !valores.includes(c));
  return { ok: categorias.length >= 3 && valores.includes('todas') && faltan.length === 0, detalle: faltan.length ? 'Faltan: ' + faltan.join(', ') : '' };
}, 'El valor de data-categoria debe escribirse igual que la categoria en los datos.');

revisar('La tarjeta usa card-body, card-title y un badge con la categoría', () => {
  const f = exigeFuncion('crearCard');
  const card = String(f(items[0]));
  return /card-body/.test(card) && /card-title/.test(card) && /\bbadge\b/.test(card) && card.includes(items[0].categoria);
}, 'Componentes de Bootstrap dentro de la tarjeta generada por crearCard().');

// ---------------------------------------------------------------
// C. Guía de estilo con CSS propio (6)
// ---------------------------------------------------------------
bloque('C. Guía de estilo con CSS propio', 6);

const raiz = (css.match(/:root\s*\{([^}]*)\}/) || [])[1] || '';
function variable(nombre) {
  const m = raiz.match(new RegExp('--' + nombre + '\\s*:\\s*([^;]+);'));
  return m ? m[1].trim() : null;
}
const VARS = ['marca-primario', 'marca-secundario', 'marca-fondo', 'marca-texto', 'marca-fuente'];

revisar('Las 5 variables de marca en :root', () => {
  const faltan = VARS.filter((v) => !variable(v));
  return { ok: faltan.length === 0, detalle: faltan.length ? 'Faltan: --' + faltan.join(', --') : '' };
}, '--marca-primario, --marca-secundario, --marca-fondo, --marca-texto y --marca-fuente.');

revisar('Contraste texto sobre fondo de al menos 4.5:1', () => {
  const t = hexARgb(variable('marca-texto') || '');
  const f = hexARgb(variable('marca-fondo') || '');
  if (!t || !f) return { ok: false, detalle: 'Usa colores hexadecimales (#rrggbb)' };
  const r = contraste(t, f);
  return { ok: r >= 4.5, detalle: 'contraste: ' + r.toFixed(2) + ':1' };
}, 'Verifica en https://webaim.org/resources/contrastchecker/');

revisar('Contraste texto blanco sobre --marca-primario de al menos 4.5:1', () => {
  const p = hexARgb(variable('marca-primario') || '');
  if (!p) return { ok: false, detalle: 'Usa un color hexadecimal' };
  const r = contraste(p, [255, 255, 255]);
  return { ok: r >= 4.5, detalle: 'contraste: ' + r.toFixed(2) + ':1' };
}, 'Los botones activos llevan texto blanco sobre el color primario.');

revisar('Bootstrap personalizado: --bs-body-bg, --bs-body-color y --bs-body-font-family con var(--marca-...)', () => {
  return ['bg', 'color', 'font-family'].every((p) => new RegExp('--bs-body-' + p + '\\s*:\\s*var\\(--marca-').test(css));
}, 'Sobrescribe las variables de Bootstrap desde estilos.css, sin tocar bootstrap.min.css.');

revisar('Botón personalizado con al menos 3 variables --bs-btn-*', () => {
  const n = new Set((css.match(/--bs-btn-[a-z-]+\s*:/g) || []).map((x) => x.replace(/\s*:$/, ''))).size;
  return { ok: n >= 3, detalle: 'variables --bs-btn-* distintas: ' + n };
}, 'Ej.: .btn-outline-primary { --bs-btn-color: ...; --bs-btn-border-color: ...; --bs-btn-active-bg: ...; }');

revisar('Foco visible: regla :focus-visible y ningún outline: none', () => {
  const fv = /:focus-visible\s*[,{]/.test(css);
  const quita = /outline\s*:\s*(none|0)\s*[;}]/i.test(css);
  return fv && !quita;
}, 'Quien navega con teclado debe ver dónde está.');

// ---------------------------------------------------------------
// D. Datos (4)
// ---------------------------------------------------------------
bloque('D. Datos', 4);

revisar('datos.js carga y tiene al menos 12 elementos', () => {
  if (errorDatos) return { ok: false, detalle: errorDatos };
  return { ok: items.length >= 12, detalle: 'elementos: ' + items.length };
}, 'const items = [ {...}, {...} ];');

revisar('Todos tienen id, nombre, categoria, descripcion, imagen y 2 campos propios del tema', () => {
  if (!items.length) return false;
  const malos = items.filter((it) => !it || Object.entries(REQUERIDOS).some(([k, t]) => typeof it[k] !== t || (t === 'string' && !it[k].trim())));
  const base = new Set([...Object.keys(REQUERIDOS), campo]);
  const extras = Object.keys(items[0]).filter((k) => !base.has(k) && items.every((it) => it[k] !== undefined && it[k] !== ''));
  return { ok: malos.length === 0 && extras.length >= 2, detalle: 'incompletos: ' + malos.length + ', campos propios: ' + extras.join(', ') };
}, 'Todos los objetos con las mismas propiedades; las imágenes locales deben existir en img/.');

revisar('ids únicos y al menos 3 categorías con 2 o más elementos cada una', () => {
  const ids = new Set(items.map((i) => i.id));
  const conteo = categorias.map((c) => items.filter((i) => i.categoria === c).length);
  const imgsLocales = items.filter((i) => typeof i.imagen === 'string' && !/^https?:\/\//.test(i.imagen));
  const faltanImg = imgsLocales.filter((i) => !fs.existsSync(path.join(RAIZ, i.imagen)));
  return { ok: ids.size === items.length && categorias.length >= 3 && conteo.every((n) => n >= 2) && faltanImg.length === 0,
    detalle: 'categorías: ' + categorias.length + (faltanImg.length ? ', imágenes que no existen: ' + faltanImg.length : '') };
}, 'Las categorías alimentan los botones de filtro.');

revisar('configuracion con titulo y campoOrden numérico en todos los elementos', () => {
  const ok = typeof conf.titulo === 'string' && conf.titulo.trim().length > 2 && typeof campo === 'string' &&
    items.length > 0 && items.every((i) => typeof i[campo] === 'number' && !Number.isNaN(i[campo]));
  return { ok, detalle: 'campoOrden: ' + campo };
}, 'const configuracion = { titulo: "...", campoOrden: "precio", etiquetaValor: "Precio" };');

// ---------------------------------------------------------------
// E. JavaScript: datos a interfaz (9)
// ---------------------------------------------------------------
bloque('E. JavaScript: datos a interfaz', 9);

revisar('crearCard(item) devuelve un article con clase card y un h3 con el nombre', () => {
  const card = String(exigeFuncion('crearCard')(items[1]));
  return /<article\b[^>]*class\s*=\s*["'][^"']*\bcard\b/.test(card) && new RegExp('<h3[^>]*>[^<]*' + items[1].nombre.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).test(card);
}, 'La tarjeta se arma con un template literal y ${item.nombre}.');

revisar('crearCard(item) incluye la imagen con alt descriptivo', () => {
  const card = String(exigeFuncion('crearCard')(items[2]));
  const img = etiquetas(card, 'img')[0];
  const alt = img ? attr(img, 'alt') : null;
  return !!img && attr(img, 'src') === items[2].imagen && !!alt && alt.trim().length >= 5 && !/^(imagen|foto|img)$/i.test(alt.trim());
}, 'alt describe la imagen, por ejemplo con el nombre del elemento.');

revisar('crearCard(item) muestra la categoría y el valor del campoOrden', () => {
  const it = items[3];
  const card = String(exigeFuncion('crearCard')(it));
  const digitos = card.replace(/\D/g, '');
  return card.includes(it.categoria) && digitos.includes(String(Math.round(it[campo])).replace(/\D/g, ''));
}, 'Puedes formatear el número con toLocaleString("es-CO").');

revisar('generarHTML(lista) devuelve una tarjeta por elemento (map + join)', () => {
  const f = exigeFuncion('generarHTML');
  const sub = items.slice(0, 5);
  const salida = f(sub);
  return typeof salida === 'string' && contar(salida, /<article\b/gi) === 5 && !salida.includes(',<');
}, 'Si ves comas entre tarjetas, te faltó .join("").');

revisar('generarHTML([]) devuelve un mensaje cuando no hay resultados', () => {
  const salida = String(exigeFuncion('generarHTML')([]));
  return contar(salida, /<article\b/gi) === 0 && textoPlano(salida).length >= 10;
}, 'Ej.: <p class="text-center">No hay resultados para tu búsqueda.</p>');

revisar('filtrarPorCategoria(lista, categoria) filtra, acepta "todas" y no modifica la lista', () => {
  const f = exigeFuncion('filtrarPorCategoria');
  const lista = copia();
  const c = categorias[0];
  const r = f(lista, c);
  const todas = f(lista, 'todas');
  const esperado = items.filter((i) => i.categoria === c).length;
  return Array.isArray(r) && r.length === esperado && r.every((i) => i.categoria === c) &&
    todas.length === items.length && JSON.stringify(lista) === JSON.stringify(items);
}, 'Usa lista.filter(...). Con "todas" devuelve todos.');

revisar('buscarPorTexto(lista, texto) busca en nombre y descripcion sin importar mayúsculas', () => {
  const f = exigeFuncion('buscarPorTexto');
  const it = items[4];
  const palabra = it.nombre.split(/\s+/).sort((a, b) => b.length - a.length)[0];
  const r1 = f(copia(), '  ' + palabra.toUpperCase() + ' ');
  const r2 = f(copia(), '');
  const r3 = f(copia(), 'zzzqqqxxx');
  return Array.isArray(r1) && r1.some((i) => i.id === it.id) && r2.length === items.length && r3.length === 0;
}, 'toLowerCase(), trim() e includes(). Texto vacío devuelve todos.');

revisar('ordenarItems(lista, criterio) ordena por nombre y por valor sin modificar la lista', () => {
  const f = exigeFuncion('ordenarItems');
  const lista = copia();
  const asc = f(lista, 'valor-asc').map((i) => i[campo]);
  const desc = f(lista, 'valor-desc').map((i) => i[campo]);
  const nom = f(lista, 'nombre-asc').map((i) => i.nombre);
  const okAsc = asc.every((v, i) => i === 0 || asc[i - 1] <= v);
  const okDesc = desc.every((v, i) => i === 0 || desc[i - 1] >= v);
  const okNom = nom.every((v, i) => i === 0 || nom[i - 1].localeCompare(v, 'es') <= 0);
  return okAsc && okDesc && okNom && asc.length === items.length && JSON.stringify(lista) === JSON.stringify(items);
}, 'Ordena una copia: [...lista].sort(...). sort() modifica el arreglo original.');

revisar('aplicarFiltros(lista, estado) combina categoría, texto y orden', () => {
  const f = exigeFuncion('aplicarFiltros');
  const c = categorias[0];
  const r = f(copia(), { categoria: c, texto: '', orden: 'valor-desc' });
  const esperado = items.filter((i) => i.categoria === c).map((i) => i[campo]).sort((a, b) => b - a);
  const r2 = f(copia(), { categoria: 'todas', texto: 'zzzqqqxxx', orden: 'nombre-asc' });
  return Array.isArray(r) && JSON.stringify(r.map((i) => i[campo])) === JSON.stringify(esperado) && r2.length === 0;
}, 'estado = { categoria, texto, orden }. Encadena las tres funciones.');

// ---------------------------------------------------------------
// F. Eventos e interfaz (4)
// ---------------------------------------------------------------
bloque('F. Eventos e interfaz', 4);

revisar('Evento click en los filtros que actualiza aria-pressed', () => {
  return /addEventListener\(\s*['"]click['"]/.test(appSinComentarios) && /setAttribute\(\s*['"]aria-pressed['"]/.test(appSinComentarios);
}, 'Al hacer clic: el botón elegido queda en aria-pressed="true" y los demás en "false".');

revisar('Evento input en el buscador', () => /addEventListener\(\s*['"]input['"]/.test(appSinComentarios) && /buscador/.test(appSinComentarios),
  'La lista se actualiza mientras se escribe.');

revisar('Evento change en el select de orden', () => /addEventListener\(\s*['"]change['"]/.test(appSinComentarios) && /orden/.test(appSinComentarios),
  'Al cambiar la opción se vuelve a pintar el catálogo.');

revisar('Se pinta en #catalogo con innerHTML y se actualiza #contador', () => {
  return /innerHTML/.test(appSinComentarios) && /catalogo/.test(appSinComentarios) && /contador/.test(appSinComentarios) &&
    /(textContent|innerHTML|innerText)/.test(appSinComentarios.split('contador').slice(1).join(''));
}, 'Ej.: contador.textContent = `Mostrando ${lista.length} resultados`;');

// ---------------------------------------------------------------
// G. Guía de diseño de la empresa (9)
// Datos de las 18 guías del Manual de marca. No se modifican.
// ---------------------------------------------------------------
const GUIAS = [{"n":1,"empresa":"La Cosecha del Eje","primario":"#2f6b2f","secundario":"#c8792b","fondo":"#fbf8f1","texto":"#2b2a26","titulos":"Merriweather","cuerpo":"Open Sans","navbar":{"color":"primario","fija":true},"hero":"dos-columnas","columnas":3,"tarjeta":["border-0","shadow-sm"],"acerca":"izquierda","h1":"Del campo del Eje a tu mesa","telefono":"606 335 1020","nombres":["Mora de Castilla","Lulo","Banano bocadillo","Arracacha","Tomate chonto","Cebolla larga","Queso campesino","Kumis artesanal","Cuajada","Fríjol cargamanto","Maíz pelado","Café de origen"]},{"n":2,"empresa":"Fogón Paisa","primario":"#8c2f1b","secundario":"#e0a526","fondo":"#fff9f0","texto":"#2e1c14","titulos":"Playfair Display","cuerpo":"Lato","navbar":{"color":"claro","fija":false},"hero":"centrado","columnas":3,"tarjeta":["rounded-4","shadow-sm"],"acerca":"derecha","h1":"La cocina de la abuela, todos los días","telefono":"606 342 7788","nombres":["Empanadas de pipián","Chorizo con arepa","Patacón con hogao","Bandeja paisa","Sancocho de gallina","Trucha al ajillo","Mazamorra con panela","Arroz con leche","Brevas con arequipe","Aguapanela con limón","Jugo de mora en leche","Café de olla"]},{"n":3,"empresa":"Escena Pereira","primario":"#5b2a86","secundario":"#f2b134","fondo":"#f7f5fb","texto":"#1f1a2b","titulos":"Montserrat","cuerpo":"Roboto","navbar":{"color":"primario","fija":true},"hero":"centrado","columnas":4,"tarjeta":["border-0","shadow"],"acerca":"izquierda","h1":"Esta semana en Pereira","telefono":"606 324 5566","nombres":["Noche de bambucos","Rock en el Lago","Concierto de cuerdas","La casa de Bernarda","Comedia de barrio","Títeres para niños","Ciclo de cine colombiano","Cortos del Eje","Cine bajo las estrellas","Gala de danza folclórica","Salsa en la plaza","Danza contemporánea"]},{"n":4,"empresa":"Páginas Abiertas","primario":"#1d4e89","secundario":"#f29e4c","fondo":"#f9f7f2","texto":"#1e2430","titulos":"Lora","cuerpo":"Source Sans 3","navbar":{"color":"claro","fija":true},"hero":"dos-columnas","columnas":4,"tarjeta":["border-0","shadow-sm"],"acerca":"derecha","h1":"Libros para leer, aprender y soñar","telefono":"606 330 4411","nombres":["El viejo y el mar","María","El principito","Breve historia del tiempo","El gen egoísta","Cosmos","Historia de Colombia","El diario de Ana Frank","Sapiens","Donde viven los monstruos","Cuentos de la selva","Matilda"]},{"n":5,"empresa":"Pedal Andino","primario":"#0f5b5c","secundario":"#f25c05","fondo":"#f4f7f7","texto":"#142022","titulos":"Oswald","cuerpo":"Roboto","navbar":{"color":"primario","fija":true},"hero":"dos-columnas","columnas":3,"tarjeta":["rounded-0","shadow-sm"],"acerca":"izquierda","h1":"Bicicletas hechas para la montaña","telefono":"606 333 9090","nombres":["Ruta Carbono R1","Ruta Aluminio Sport","Ruta Gravel G2","Montaña Trail 29","Montaña Doble Suspensión","Montaña Junior 26","Urbana Plegable","Urbana Clásica","Urbana Eléctrica E1","Casco ventilado","Luces LED recargables","Candado en U"]},{"n":6,"empresa":"Huellitas Clínica Veterinaria","primario":"#0f6b80","secundario":"#f5a623","fondo":"#f3fafb","texto":"#1b2b30","titulos":"Nunito","cuerpo":"Nunito Sans","navbar":{"color":"claro","fija":false},"hero":"centrado","columnas":3,"tarjeta":["rounded-4","border-0","shadow-sm"],"acerca":"derecha","h1":"Cuidamos a quien te cuida","telefono":"606 321 4545","nombres":["Consulta general","Consulta de urgencias","Control de cachorro","Vacuna múltiple canina","Vacuna triple felina","Vacuna antirrábica","Baño y cepillado","Corte de pelo","Corte de uñas","Cuadro hemático","Coprológico","Ecografía abdominal"]},{"n":7,"empresa":"Pulso Fitness","primario":"#b0122d","secundario":"#1c1c1c","fondo":"#f6f6f6","texto":"#161616","titulos":"Bebas Neue","cuerpo":"Inter","navbar":{"color":"primario","fija":true},"hero":"dos-columnas","columnas":4,"tarjeta":["rounded-0","border-0"],"acerca":"izquierda","h1":"Entrena en grupo, avanza en serio","telefono":"606 340 2020","nombres":["Spinning","HIIT","Step","Funcional","Body pump","Core","Rumba","Zumba","Dance fit","Yoga","Pilates","Estiramiento"]},{"n":8,"empresa":"Haciendas del Café","primario":"#5a3d2b","secundario":"#7a9a3a","fondo":"#fbf7f0","texto":"#2b211b","titulos":"Cormorant Garamond","cuerpo":"Lato","navbar":{"color":"claro","fija":true},"hero":"dos-columnas","columnas":3,"tarjeta":["border-0","shadow"],"acerca":"derecha","h1":"Despierta entre cafetales","telefono":"606 759 3030","nombres":["Finca La Esperanza","Finca El Roble","Finca Villa Café","Hotel Plaza Mayor","Hotel Termales","Hotel Colonial","Glamping Las Nubes","Glamping Bosque","Glamping Mirador","Hostal Mochilero","Hostal Casa Azul","Hostal del Parque"]},{"n":9,"empresa":"Aula Ágil","primario":"#3045b5","secundario":"#22b07d","fondo":"#f5f7ff","texto":"#1a1f36","titulos":"Poppins","cuerpo":"Inter","navbar":{"color":"primario","fija":false},"hero":"centrado","columnas":4,"tarjeta":["rounded-4","shadow-sm"],"acerca":"izquierda","h1":"Cursos cortos para tu próximo empleo","telefono":"606 335 7070","nombres":["HTML y CSS desde cero","JavaScript práctico","Python para datos","Diseño gráfico básico","Figma para interfaces","Fotografía con celular","Inglés conversacional","Inglés para entrevistas","Portugués básico","Excel intermedio","Word profesional","Presentaciones efectivas"]},{"n":10,"empresa":"Nivel Uno Games","primario":"#6a1b9a","secundario":"#00bfa5","fondo":"#f4f1f8","texto":"#1b1424","titulos":"Orbitron","cuerpo":"Roboto","navbar":{"color":"primario","fija":true},"hero":"centrado","columnas":4,"tarjeta":["border-0","shadow"],"acerca":"derecha","h1":"Tu próxima partida empieza aquí","telefono":"606 345 1212","nombres":["Galaxia Rota","Ciudad Sombra","Ninja del Viento","Fútbol Total 26","Baloncesto Pro","Tenis Arcade","Isla Perdida","El Último Mapa","Reino de Cristal","Imperios Andinos","Granja Galáctica","Torres de Defensa"]},{"n":11,"empresa":"Raíz Viva","primario":"#2e6b3f","secundario":"#a4c639","fondo":"#f6faf3","texto":"#1f2b20","titulos":"Quicksand","cuerpo":"Nunito","navbar":{"color":"claro","fija":false},"hero":"dos-columnas","columnas":3,"tarjeta":["rounded-4","border-0"],"acerca":"izquierda","h1":"Plantas que llenan de vida tu casa","telefono":"606 322 6060","nombres":["Monstera","Pothos","Sansevieria","Bugambilia","Heliconia","Hortensia","Echeveria","Aloe vera","Cactus estrella","Limón mandarino","Guayaba","Aguacate Hass"]},{"n":12,"empresa":"Semillero Deportivo Risaralda","primario":"#0b4f9c","secundario":"#ffc72c","fondo":"#f4f7fb","texto":"#14213d","titulos":"Barlow Condensed","cuerpo":"Barlow","navbar":{"color":"primario","fija":true},"hero":"dos-columnas","columnas":4,"tarjeta":["rounded-3","shadow-sm"],"acerca":"derecha","h1":"Formamos deportistas y personas","telefono":"606 336 8080","nombres":["Fútbol infantil","Fútbol juvenil","Fútbol femenino","Natación bebés","Natación niños","Natación competitiva","Patinaje iniciación","Patinaje de carreras","Patinaje artístico","Baloncesto mini","Baloncesto juvenil","Baloncesto en silla"]},{"n":13,"empresa":"Horno de la Abuela","primario":"#8a4b20","secundario":"#e8b04b","fondo":"#fffaf2","texto":"#33241a","titulos":"Fredoka","cuerpo":"Open Sans","navbar":{"color":"claro","fija":true},"hero":"centrado","columnas":3,"tarjeta":["rounded-4","shadow-sm"],"acerca":"izquierda","h1":"Pan recién horneado todos los días","telefono":"606 329 1515","nombres":["Pan de bono","Pan blandito","Pan integral","Torta de naranja","Torta negra","Torta de zanahoria","Galletas de avena","Polvorosas","Galletas de chocolate","Chocolate caliente","Café con leche","Té de frutos rojos"]},{"n":14,"empresa":"Patitas a Casa","primario":"#b23c0a","secundario":"#0e7c86","fondo":"#fff8f3","texto":"#2a1f1a","titulos":"Baloo 2","cuerpo":"Nunito","navbar":{"color":"primario","fija":false},"hero":"dos-columnas","columnas":3,"tarjeta":["rounded-4","border-0","shadow"],"acerca":"derecha","h1":"Adoptar es dar una segunda oportunidad","telefono":"310 555 2323","nombres":["Canela","Rocky","Tango","Luna","Max","Misha","Simón","Nieve","Garfield","Copito","Pelusa","Tambor"]},{"n":15,"empresa":"MotoPartes Dosquebradas","primario":"#b91c1c","secundario":"#374151","fondo":"#f5f5f4","texto":"#111827","titulos":"Rajdhani","cuerpo":"Roboto","navbar":{"color":"primario","fija":true},"hero":"centrado","columnas":4,"tarjeta":["rounded-0","shadow-sm"],"acerca":"izquierda","h1":"El repuesto exacto para tu moto","telefono":"606 343 5050","nombres":["Kit de arrastre","Filtro de aceite","Bujía iridio","Pastillas de freno","Disco de freno","Bandas traseras","Batería 12V","Direccionales LED","Regulador de voltaje","Llanta delantera","Llanta trasera","Neumático interior"]},{"n":16,"empresa":"Ruta Patrimonio","primario":"#7b2d26","secundario":"#c9a227","fondo":"#faf6ef","texto":"#2a2420","titulos":"Cinzel","cuerpo":"Source Serif 4","navbar":{"color":"claro","fija":false},"hero":"dos-columnas","columnas":3,"tarjeta":["border-0","shadow-sm"],"acerca":"derecha","h1":"Historia viva del Eje Cafetero","telefono":"606 334 9191","nombres":["Museo del Oro Quimbaya","Museo de Arte de Pereira","Museo del Café","Valle de Cocora","Jardín Botánico UTP","Parque de la Vida","Bolívar Desnudo","Catedral de Manizales","Puente Helicoidal","Centro Cultural Lucy Tejada","Casa de la Cultura","Mirador de Filandia"]},{"n":17,"empresa":"Manos del Eje","primario":"#9a3412","secundario":"#2f6b5e","fondo":"#fbf6ee","texto":"#2b1d14","titulos":"Josefin Sans","cuerpo":"Lato","navbar":{"color":"primario","fija":false},"hero":"centrado","columnas":3,"tarjeta":["rounded-3","border-0","shadow"],"acerca":"izquierda","h1":"Artesanía hecha con historia","telefono":"606 758 4242","nombres":["Canasto de bejuco","Individuales de iraca","Lámpara de guadua","Jarrón de barro","Pocillos cafeteros","Plato decorativo","Ruana de lana","Mochila tejida","Tapiz de pared","Jeep Willys tallado","Cucharas de cocina","Bandeja de cedro"]},{"n":18,"empresa":"Ferretería El Tornillo","primario":"#1f3a5f","secundario":"#f2a900","fondo":"#f4f5f7","texto":"#15202b","titulos":"Archivo Black","cuerpo":"Archivo","navbar":{"color":"primario","fija":true},"hero":"dos-columnas","columnas":4,"tarjeta":["border-0","shadow-sm"],"acerca":"derecha","h1":"Todo para construir y reparar","telefono":"606 341 8181","nombres":["Taladro percutor","Pulidora angular","Sierra caladora","Martillo de uña","Juego de destornilladores","Flexómetro 5 m","Pintura blanca","Rodillo de felpa","Esmalte anticorrosivo","Tubo PVC 1/2","Llave de lavaplatos","Cinta de teflón"]}];

bloque('G. Guía de diseño de la empresa', 9);

const entregaTxt = leer('ENTREGA.md');
const numTema = +(((entregaTxt.match(/Tema\s*(n[uú]mero)?\s*:\s*(\d{1,2})/i) || [])[2]) || 0);
const guia = GUIAS.find((g) => g.n === numTema);
function exigeGuia() {
  if (!guia) throw new Error('escribe tu número de tema (1 a 18) en ENTREGA.md: "Tema número: 7"');
  return guia;
}
function igualHex(a, b) { return (a || '').trim().toLowerCase() === (b || '').trim().toLowerCase(); }
function reglas(selectorRe) {
  const out = [];
  const re = /([^{}]+)\{([^}]*)\}/g;
  let m;
  while ((m = re.exec(css))) if (selectorRe.test(m[1])) out.push(m[2]);
  return out;
}
function seccionCon(re) {
  const secs = html.match(/<section\b[^>]*>[\s\S]*?<\/section>/gi) || [];
  return secs.find((x) => re.test(x)) || '';
}

revisar('Los 4 colores exactos de la guía', () => {
  const g = exigeGuia();
  const ok = igualHex(variable('marca-primario'), g.primario) && igualHex(variable('marca-secundario'), g.secundario) &&
    igualHex(variable('marca-fondo'), g.fondo) && igualHex(variable('marca-texto'), g.texto);
  return { ok, detalle: 'Guía ' + g.n + ' (' + g.empresa + '): ' + g.primario + ', ' + g.secundario + ', ' + g.fondo + ', ' + g.texto };
}, 'Copia los códigos exactos del Manual de marca en :root.');

revisar('Contenido de la empresa: marca, h1, teléfono y los 12 elementos de la guía', () => {
  const g = exigeGuia();
  const norm = (t) => String(t || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().toLowerCase();
  const marca = (html.match(/<a\b[^>]*class\s*=\s*["'][^"']*navbar-brand[^"']*["'][^>]*>([\s\S]*?)<\/a>/i) || [])[1];
  const okMarca = norm(marca).includes(norm(g.empresa));
  const h1 = (html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i) || [])[1];
  const okH1 = norm(h1) === norm(g.h1);
  const footer = (html.match(/<footer\b[\s\S]*?<\/footer>/i) || [''])[0];
  const okTel = footer.includes(g.telefono);
  const nombres = new Set(items.map((i) => norm(i && i.nombre)));
  const faltan = g.nombres.filter((x) => !nombres.has(norm(x)));
  const partes = [];
  if (!okMarca) partes.push('navbar-brand: ' + g.empresa);
  if (!okH1) partes.push('h1: "' + g.h1 + '"');
  if (!okTel) partes.push('teléfono en el footer: ' + g.telefono);
  if (faltan.length) partes.push('faltan en datos.js: ' + faltan.slice(0, 3).join(', ') + (faltan.length > 3 ? '...' : ''));
  return { ok: okMarca && okH1 && okTel && faltan.length === 0, detalle: partes.join('; ') };
}, 'Usa los textos y los datos exactos que da tu página de Contenido en el Manual de marca.');

revisar('Fuentes de la guía enlazadas desde Google Fonts', () => {
  const g = exigeGuia();
  const href = etiquetas(html, 'link').map((l) => attr(l, 'href') || '').filter((h) => /fonts\.googleapis\.com/.test(h)).join(' ');
  const tiene = (f) => href.includes(f.replace(/ /g, '+')) || href.includes(f.replace(/ /g, '%20'));
  return { ok: tiene(g.titulos) && tiene(g.cuerpo), detalle: 'títulos: ' + g.titulos + ', cuerpo: ' + g.cuerpo };
}, 'En fonts.google.com selecciona las dos familias y copia el <link> en el head, antes de estilos.css.');

revisar('--marca-fuente (cuerpo) y --marca-fuente-titulos aplicada a los títulos', () => {
  const g = exigeGuia();
  const cuerpo = (variable('marca-fuente') || '').includes(g.cuerpo);
  const tit = (variable('marca-fuente-titulos') || '').includes(g.titulos);
  const usada = /h1[^{]*\{[^}]*font-family\s*:\s*var\(--marca-fuente-titulos\)/.test(css);
  return { ok: cuerpo && tit && usada, detalle: (usada ? '' : 'Falta una regla h1, h2, h3 { font-family: var(--marca-fuente-titulos); }') };
}, "--marca-fuente: 'Lato', sans-serif;  --marca-fuente-titulos: 'Playfair Display', serif;");

revisar('Navbar como indica la guía (color y si va fija)', () => {
  const g = exigeGuia();
  const navs = etiquetas(html, 'nav').filter((n) => tieneClase(n, 'navbar'));
  const headers = etiquetas(html, 'header');
  const fija = [...navs, ...headers].some((a) => tieneClase(a, 'sticky-top') || tieneClase(a, 'fixed-top'));
  const cuerpos = reglas(/\.navbar\b/);
  let color;
  if (g.navbar.color === 'primario') {
    const oscura = navs.some((n) => tieneClase(n, 'navbar-dark') || attr(n, 'data-bs-theme') === 'dark');
    color = oscura && cuerpos.some((b) => /background(-color)?\s*:\s*var\(--marca-primario\)/.test(b));
  } else {
    color = cuerpos.some((b) => /background(-color)?\s*:\s*var\(--marca-fondo\)/.test(b)) &&
      cuerpos.some((b) => /border-bottom[^;]*var\(--marca-secundario\)/.test(b));
  }
  const esperado = (g.navbar.color === 'primario' ? 'fondo primario con texto claro' : 'fondo claro con borde inferior secundario') + (g.navbar.fija ? ', fija (sticky-top)' : ', no fija');
  return { ok: color && fija === g.navbar.fija, detalle: 'La guía pide: ' + esperado };
}, 'Primario: .navbar { background-color: var(--marca-primario); } + navbar-dark. Claro: background var(--marca-fondo) y border-bottom con var(--marca-secundario).');

revisar('Sección de presentación (hero) como indica la guía', () => {
  const g = exigeGuia();
  const hero = seccionCon(/<h1\b/i);
  if (!hero) return { ok: false, detalle: 'El h1 debe estar dentro de una section' };
  let ok;
  if (g.hero === 'centrado') ok = /text-center/.test(hero) && !/<img\b/i.test(hero);
  else ok = /class\s*=\s*["'][^"']*\brow\b/.test(hero) && contar(hero, /\bcol-(sm|md|lg)-\d+/g) >= 2 && /<img\b[^>]*\balt\s*=/i.test(hero);
  return { ok, detalle: 'La guía pide hero ' + (g.hero === 'centrado' ? 'centrado, sin imagen' : 'en dos columnas: texto e imagen') };
}, 'Centrado: text-center y sin imagen. Dos columnas: un .row con dos col-md-* o col-lg-*, una de ellas con la imagen.');

revisar('Catálogo con las columnas de escritorio que pide la guía', () => {
  const g = exigeGuia();
  const cat = etiquetas(html, '[a-z]+').find((a) => attr(a, 'id') === 'catalogo');
  const c = cat ? clases(cat) : [];
  let ok = c.includes('row-cols-lg-' + g.columnas);
  if (!ok && ctx.crearCard && items[0]) ok = String(ctx.crearCard(items[0])).includes('col-lg-' + (12 / g.columnas));
  return { ok, detalle: 'La guía pide ' + g.columnas + ' columnas en escritorio' };
}, 'row-cols-lg-3 o row-cols-lg-4 en #catalogo, según tu guía.');

revisar('Estilo de tarjeta de la guía', () => {
  const g = exigeGuia();
  const card = String(exigeFuncion('crearCard')(items[0]));
  const art = etiquetas(card, 'article').find((a) => tieneClase(a, 'card'));
  const faltan = art ? g.tarjeta.filter((k) => !tieneClase(art, k)) : g.tarjeta;
  return { ok: faltan.length === 0, detalle: 'El article.card debe llevar: ' + g.tarjeta.join(' ') + (faltan.length ? ' (faltan: ' + faltan.join(' ') + ')' : '') };
}, 'Agrega esas clases de Bootstrap al article de crearCard().');

revisar('Imagen de "acerca de" al lado que indica la guía', () => {
  const g = exigeGuia();
  const m = html.match(/<section\b[^>]*id\s*=\s*["']acerca["'][^>]*>([\s\S]*?)<\/section>/i);
  if (!m) return false;
  const iImg = m[1].search(/<img\b/i);
  const iH2 = m[1].search(/<h2\b/i);
  if (iImg === -1 || iH2 === -1) return { ok: false, detalle: 'La sección necesita una imagen y su h2' };
  const reordena = /order-(md|lg)-(last|first|\d)/.test(m[1]);
  const izquierda = reordena ? iImg > iH2 : iImg < iH2;
  return { ok: (g.acerca === 'izquierda') === izquierda, detalle: 'La guía pide la imagen a la ' + g.acerca };
}, 'Cambia el orden de las columnas en el HTML (o usa order-md-last en la columna de la imagen).');

// ---------------------------------------------------------------
// H. GitHub y entrega (6: 3 locales + 3 en línea)
// ---------------------------------------------------------------
bloque('H. GitHub y entrega', 6);

function git(cmd) {
  return execSync('git ' + cmd, { cwd: RAIZ, stdio: ['ignore', 'pipe', 'ignore'] }).toString();
}
let mensajes = [];
let remoto = null;
try {
  mensajes = git('log --pretty=%B%x00').split('\0').map((s) => s.trim()).filter(Boolean);
  const url = git('remote get-url origin').trim();
  const m = url.match(/github\.com[:/]([^/]+)\/([^/.]+?)(\.git)?$/);
  if (m) remoto = { owner: m[1], repo: m[2] };
} catch (e) { /* sin git */ }

revisar('Repositorio con al menos 8 commits', () => ({ ok: mensajes.length >= 8, detalle: 'commits: ' + mensajes.length }),
  'Commits pequeños, uno por avance, con mensajes claros.');

revisar('Al menos 4 commits cierran issues (closes #n o fixes #n)', () => {
  const n = mensajes.filter((m) => /\b(close[sd]?|fix(e[sd])?|resolve[sd]?)\s+#\d+/i.test(m)).length;
  return { ok: n >= 4, detalle: 'commits que cierran issues: ' + n };
}, 'git commit -m "feat: tarjetas desde datos (closes #3)"');

const entrega = entregaTxt;
revisar('ENTREGA.md completo', () => {
  const tema = entrega.match(/Tema\s*(n[uú]mero)?\s*:\s*(\d{1,2})/i);
  const okEntrega = /Nombre\s*:\s*\S{3,}/i.test(entrega) && tema && +tema[2] >= 1 && +tema[2] <= 18 && /https:\/\/[\w-]+\.github\.io\//i.test(entrega);
  return { ok: !!okEntrega, detalle: okEntrega ? '' : 'Faltan nombre, número de tema o enlace a GitHub Pages' };
}, 'Nombre, número de tema, enlace al repositorio y a GitHub Pages.');

async function enLinea() {
  const pendientes = ['Repositorio público en GitHub', '4 o más issues cerrados, 3 o más cerrados por commit', 'GitHub Pages publicado'];
  if (SIN_API || !remoto) {
    const motivo = SIN_API ? 'omitido con --sin-api' : 'no se encontró el remoto origin de GitHub';
    pendientes.forEach((d) => bloqueActual.items.push({ ok: false, descripcion: d, detalle: motivo, pendiente: true }));
    return false;
  }
  let token = process.env.GITHUB_TOKEN || '';
  if (!token) { try { token = execSync('gh auth token', { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim(); } catch (e) { /* sin gh */ } }
  const headers = { 'User-Agent': 'verificar-evaluacion', Accept: 'application/vnd.github+json' };
  if (token) headers.Authorization = 'Bearer ' + token;
  const api = async (p) => {
    const url = 'https://api.github.com/repos/' + remoto.owner + '/' + remoto.repo + p;
    let r = await fetch(url, { headers });
    if (r.status === 401 && headers.Authorization) {
      delete headers.Authorization;   // token inválido: se intenta sin token
      r = await fetch(url, { headers });
    }
    if (r.status === 403 || r.status === 429) throw new Error('límite de consultas de GitHub (HTTP ' + r.status + '): usa GITHUB_TOKEN o --sin-api');
    return r;
  };

  async function paso(descripcion, fn) {
    let ok = false; let detalle = '';
    try { const r = await fn(); ok = r.ok; detalle = r.detalle || ''; } catch (e) { detalle = 'Error: ' + e.message; }
    if (ok) bloqueActual.puntos += 1;
    bloqueActual.items.push({ ok, descripcion, detalle });
  }

  await paso('Repositorio público en GitHub', async () => {
    const r = await api('');
    const j = await r.json();
    return { ok: r.ok && j.private === false, detalle: r.ok ? remoto.owner + '/' + remoto.repo : 'No existe o es privado (HTTP ' + r.status + ')' };
  });
  await paso('4 o más issues cerrados, 3 o más cerrados por commit', async () => {
    const r = await api('/issues?state=closed&per_page=100');
    const j = await r.json();
    const cerrados = Array.isArray(j) ? j.filter((i) => !i.pull_request).length : 0;
    const e = await api('/issues/events?per_page=100');
    const ev = await e.json();
    const porCommit = new Set(Array.isArray(ev) ? ev.filter((x) => x.event === 'closed' && x.commit_id).map((x) => x.issue && x.issue.number) : []).size;
    return { ok: cerrados >= 4 && porCommit >= 3, detalle: 'cerrados: ' + cerrados + ', por commit: ' + porCommit };
  });
  await paso('GitHub Pages publicado', async () => {
    const url = (entrega.match(/https:\/\/[\w-]+\.github\.io\/[^\s)>\]]*/i) || [])[0] ||
      'https://' + remoto.owner.toLowerCase() + '.github.io/' + remoto.repo + '/';
    const r = await fetch(url, { redirect: 'follow' });
    const t = r.ok ? await r.text() : '';
    if (r.ok && !/js\/app\.js/.test(t)) return { ok: false, detalle: url + ' responde, pero no es tu index.html' };
    return { ok: r.ok && /bootstrap@5\.3/.test(t) && /js\/app\.js/.test(t), detalle: url + ' (HTTP ' + r.status + ')' };
  });
  return true;
}

// ---------------------------------------------------------------
// Reporte
// ---------------------------------------------------------------
(async () => {
  await enLinea();
  console.log('');
  console.log('Evaluación 2 - Maquetación dinámica (Bootstrap + CSS + JS)');
  console.log('Carpeta revisada: ' + RAIZ);
  if (errorCarga) console.log('\nATENCIÓN: datos.js o app.js tienen un error y no cargan: ' + errorCarga);
  let total = 0; let maximo = 0; let pendientesApi = false;
  for (const b of bloques) {
    total += b.puntos; maximo += b.maximo;
    console.log('\n' + b.nombre + '  (' + b.puntos + ' de ' + b.maximo + ')');
    for (const it of b.items) {
      if (it.pendiente) pendientesApi = true;
      const marca = it.ok ? '[OK]   ' : it.pendiente ? '[--]   ' : '[FALTA]';
      console.log('  ' + marca + ' ' + it.descripcion + (it.detalle ? '  -> ' + it.detalle : ''));
      if (!it.ok && !it.pendiente && it.pista) console.log('           Pista: ' + it.pista);
    }
  }
  console.log('\n----------------------------------------------------------');
  console.log('Puntos automáticos: ' + total + ' de ' + maximo);
  console.log('Nota automática:    ' + (total / 12).toFixed(2) + ' de 4.5  (la sustentación vale 0.5)');
  if (pendientesApi) console.log('Las revisiones en línea [--] las hace el instructor con su copia del verificador.');
  console.log('');
})();
