// ============================================
// EDITOR DE IMÁGENES CON ÁLGEBRA MATRICIAL
// ============================================
// Nombre del estudiante: Scarlet Angelina Ruelas Cardeña 
// Fecha: 18 de noviembre de 2025
// Grupo: 1B

const { PNG } = require('pngjs');
const fs = require('fs');
const path = require('path');

// Importar funciones auxiliares (si las tienes, pueden coexistir)
// Si no existen, el código funciona con utilidades internas definidas abajo.
let utilidades = {};
try {
  utilidades = require('./utilidades');
} catch (e) {
  // ignore — usaremos funciones internas si no existe el módulo
}

// Importar operaciones matriciales (opcionales)
let matrizUtils = {};
try {
  matrizUtils = require('./matriz');
} catch (e) {
  // ignore
}

// --- Helpers locales (por si no están en utilidades) ---
function clampColor(v) {
  // Asegura 0..255 y entero
  if (Number.isNaN(v) || v === null || v === undefined) return 0;
  v = Math.round(v);
  if (v < 0) return 0;
  if (v > 255) return 255;
  return v;
}

function asegurarDirectorioLocal(dir) {
  if (!dir) return;
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function copiarMatrizSimple(matriz) {
  return matriz.map(row => row.map(pixel => ({ r: pixel.r, g: pixel.g, b: pixel.b, a: pixel.a })));
}

function obtenerDimensiones(matriz) {
  if (!Array.isArray(matriz) || matriz.length === 0) return { filas: 0, columnas: 0 };
  const filas = matriz.length;
  const columnas = matriz[0].length || 0;
  return { filas, columnas };
}

// ============================================
// SECCIÓN 1: FUNDAMENTOS (20 puntos)
// Conversión entre imágenes y matrices
// ============================================

/**
 * Ejercicio 1.1: Cargar imagen PNG y convertirla a matriz de píxeles
 * @param {string} rutaImagen - Ruta del archivo PNG
 * @returns {Array<Array<Object>>} Matriz de píxeles RGBA
 */
function imagenAMatriz(rutaImagen) {
  const buffer = fs.readFileSync(rutaImagen);
  const png = PNG.sync.read(buffer);

  const matriz = [];
  const width = png.width;
  const height = png.height;
  for (let y = 0; y < height; y++) {
    const fila = [];
    for (let x = 0; x < width; x++) {
      const idx = (width * y + x) * 4;
      fila.push({
        r: png.data[idx],
        g: png.data[idx + 1],
        b: png.data[idx + 2],
        a: png.data[idx + 3]
      });
    }
    matriz.push(fila);
  }
  return matriz;
}

/**
 * Ejercicio 1.2: Convertir matriz de píxeles a imagen PNG
 * @param {Array<Array<Object>>} matriz - Matriz de píxeles {r,g,b,a}
 * @param {string} rutaSalida - Ruta donde guardar el PNG //rutaSalida
 */
function matrizAImagen(matriz, rutaSalida) {
  if (!Array.isArray(matriz) || matriz.length === 0) {
    throw new Error('La matriz está vacía o no es un arreglo válido');
  }

  const dims = obtenerDimensiones(matriz);
  const width = dims.columnas;
  const height = dims.filas;

  const png = new PNG({ width, height });

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (width * y + x) * 4;
      const pixel = matriz[y][x] || { r: 0, g: 0, b: 0, a: 255 };
      png.data[idx] = clampColor(pixel.r);
      png.data[idx + 1] = clampColor(pixel.g);
      png.data[idx + 2] = clampColor(pixel.b);
      png.data[idx + 3] = clampColor(pixel.a !== undefined ? pixel.a : 255);
    }
  }

  // Asegurar directorio de salida
  const dir = path.dirname(rutaSalida);
  asegurarDirectorioLocal(dir);

  const buffer = PNG.sync.write(png);
  fs.writeFileSync(rutaSalida, buffer);
}

/**
 * Ejercicio 1.3: Obtener un canal específico de color // 'r', 'g', 'b'
 * @param {Array<Array<Object>>} matriz - Matriz de píxeles
 * @param {string} canal - 'r', 'g', o 'b'
 * @returns {Array<Array<Object>>}
 */
function obtenerCanal(matriz, canal) {
  if (!['r', 'g', 'b'].includes(canal)) {
    throw new Error("El canal debe ser 'r', 'g' o 'b'");
  }
  const dims = obtenerDimensiones(matriz);
  const resultado = [];
  for (let y = 0; y < dims.filas; y++) {
    const fila = [];
    for (let x = 0; x < dims.columnas; x++) {
      const px = matriz[y][x];
      const valor = clampColor(px[canal]);
      fila.push({ r: valor, g: valor, b: valor, a: px.a !== undefined ? px.a : 255 });
    }
    resultado.push(fila);
  }
  return resultado;
}

/**
 * Ejercicio 1.4: Obtener dimensiones de una imagen PNG //
 * @param {string} rutaImagen
 * @returns {Object} { ancho, alto, totalPixeles }
 */
function obtenerDimensionesImagen(rutaImagen) {
  const buffer = fs.readFileSync(rutaImagen);
  const png = PNG.sync.read(buffer);
  const ancho = png.width;
  const alto = png.height;
  return { ancho, alto, totalPixeles: ancho * alto };
}

// ============================================
// SECCIÓN 2: OPERACIONES BÁSICAS (25 puntos)
// ============================================

/**
 * Ejercicio 2.1: Ajustar brillo
 * @param {Array<Array<Object>>} matriz
 * @param {number} factor
 */
function ajustarBrillo(matriz, factor) {
  const dims = obtenerDimensiones(matriz);
  const resultado = [];
  for (let y = 0; y < dims.filas; y++) {
    const fila = [];
    for (let x = 0; x < dims.columnas; x++) {
      const px = matriz[y][x];
      fila.push({
        r: clampColor(px.r * factor),
        g: clampColor(px.g * factor),
        b: clampColor(px.b * factor),
        a: px.a !== undefined ? clampColor(px.a) : 255
      });
    }
    resultado.push(fila);
  }
  return resultado;
}

/**
 * Ejercicio 2.2: Invertir colores
 * @param {Array<Array<Object>>} matriz
 */
function invertirColores(matriz) {
  const dims = obtenerDimensiones(matriz);
  const resultado = [];
  for (let y = 0; y < dims.filas; y++) {
    const fila = [];
    for (let x = 0; x < dims.columnas; x++) {
      const px = matriz[y][x];
      fila.push({
        r: clampColor(255 - px.r),
        g: clampColor(255 - px.g),
        b: clampColor(255 - px.b),
        a: px.a !== undefined ? clampColor(px.a) : 255
      });
    }
    resultado.push(fila);
  }
  return resultado;
}

/**
 * Ejercicio 2.3: Convertir a escala de grises (promedio ponderado)
 * @param {Array<Array<Object>>} matriz
 */
function convertirEscalaGrises(matriz) {
  const dims = obtenerDimensiones(matriz);
  const resultado = [];
  for (let y = 0; y < dims.filas; y++) {
    const fila = [];
    for (let x = 0; x < dims.columnas; x++) {
      const px = matriz[y][x];
      const gris = clampColor(0.299 * px.r + 0.587 * px.g + 0.114 * px.b);
      fila.push({ r: gris, g: gris, b: gris, a: px.a !== undefined ? clampColor(px.a) : 255 });
    }
    resultado.push(fila);
  }
  return resultado;
}

// ============================================
// SECCIÓN 3: TRANSFORMACIONES GEOMÉTRICAS (30 puntos)
// ============================================

/**
 * Ejercicio 3.1: Voltear horizontal
 */
function voltearHorizontal(matriz) {
  const dims = obtenerDimensiones(matriz);
  const resultado = [];
  for (let y = 0; y < dims.filas; y++) {
    // copiamos en orden invertido
    const filaNueva = [];
    for (let x = dims.columnas - 1; x >= 0; x--) {
      const px = matriz[y][x];
      filaNueva.push({ r: px.r, g: px.g, b: px.b, a: px.a !== undefined ? px.a : 255 });
    }
    resultado.push(filaNueva);
  }
  return resultado;
}

/**
 * Ejercicio 3.2: Voltear vertical
 */
function voltearVertical(matriz) {
  const dims = obtenerDimensiones(matriz);
  const resultado = [];
  for (let y = dims.filas - 1; y >= 0; y--) {
    const fila = matriz[y].map(px => ({ r: px.r, g: px.g, b: px.b, a: px.a !== undefined ? px.a : 255 }));
    resultado.push(fila);
  }
  return resultado;
}

/**
 * Ejercicio 3.3: Rotar 90 grados en sentido horario
 */
function rotar90Grados(matriz) {
  const dims = obtenerDimensiones(matriz);
  const filas = dims.filas;
  const columnas = dims.columnas;
  if (filas === 0 || columnas === 0) return [];

  // Nuevo ancho = filas, nuevo alto = columnas
  const resultado = Array.from({ length: columnas }, () => []);
  for (let y = 0; y < filas; y++) {
    for (let x = 0; x < columnas; x++) {
      // pixel original en (y,x) va a (x, filas-1-y)
      const px = matriz[y][x];
      // aseguramos la fila destino
      resultado[x][filas - 1 - y] = { r: px.r, g: px.g, b: px.b, a: px.a !== undefined ? px.a : 255 };
    }
  }
  return resultado;
}

// ============================================
// SECCIÓN 4: FILTROS AVANZADOS (25 puntos)
// ============================================

/**
 * Ejercicio 4.1: Mezclar dos imágenes (combinación lineal)
 */
function mezclarImagenes(matriz1, matriz2, factor) {
  if (factor < 0 || factor > 1) throw new Error('El factor debe estar en [0,1]');
  const d1 = obtenerDimensiones(matriz1);
  const d2 = obtenerDimensiones(matriz2);
  if (d1.filas !== d2.filas || d1.columnas !== d2.columnas) {
    throw new Error('Las imágenes deben tener el mismo tamaño');
  }
  const resultado = [];
  for (let y = 0; y < d1.filas; y++) {
    const fila = [];
    for (let x = 0; x < d1.columnas; x++) {
      const a = matriz1[y][x];
      const b = matriz2[y][x];
      fila.push({
        r: clampColor(a.r * (1 - factor) + b.r * factor),
        g: clampColor(a.g * (1 - factor) + b.g * factor),
        b: clampColor(a.b * (1 - factor) + b.b * factor),
        a: clampColor((a.a !== undefined ? a.a : 255) * (1 - factor) + (b.a !== undefined ? b.a : 255) * factor)
      });
    }
    resultado.push(fila);
  }
  return resultado;
}

/**
 * Ejercicio 4.2: Filtro Sepia
 */
function aplicarSepia(matriz) {
  const dims = obtenerDimensiones(matriz);
  const resultado = [];
  for (let y = 0; y < dims.filas; y++) {
    const fila = [];
    for (let x = 0; x < dims.columnas; x++) {
      const p = matriz[y][x];
      const r = 0.393 * p.r + 0.769 * p.g + 0.189 * p.b;
      const g = 0.349 * p.r + 0.686 * p.g + 0.168 * p.b;
      const b = 0.272 * p.r + 0.534 * p.g + 0.131 * p.b;
      fila.push({
        r: clampColor(r),
        g: clampColor(g),
        b: clampColor(b),
        a: p.a !== undefined ? clampColor(p.a) : 255
      });
    }
    resultado.push(fila);
  }
  return resultado;// return resultado;
}

/**
 * Ejercicio 4.3: Detectar bordes (simplificado)
 * Algoritmo: convertir a grises y comparar con vecino derecho e inferior
 */
function detectarBordes(matriz, umbral = 50) {
  const dims = obtenerDimensiones(matriz);
  if (dims.filas === 0 || dims.columnas === 0) return [];
  const gris = convertirEscalaGrises(matriz);
  const resultado = [];
  for (let y = 0; y < dims.filas; y++) {
    const fila = [];
    for (let x = 0; x < dims.columnas; x++) {
      const v = gris[y][x].r;
      // valores de vecinos (si no existen, usar el mismo)
      const derecho = x + 1 < dims.columnas ? gris[y][x + 1].r : v;
      const inferior = y + 1 < dims.filas ? gris[y + 1][x].r : v;
      const dif = Math.max(Math.abs(v - derecho), Math.abs(v - inferior));
      if (dif > umbral) {
        fila.push({ r: 255, g: 255, b: 255, a: 255 });
      } else {
        fila.push({ r: 0, g: 0, b: 0, a: 255 });
      }
    }
    resultado.push(fila);
  }
  return resultado;
}

// ============================================
// NO MODIFICAR - Exportación de funciones
// ============================================
module.exports = {
  // Sección 1: Fundamentos
  imagenAMatriz,
  matrizAImagen,
  obtenerCanal,
  obtenerDimensionesImagen,
  
  // Sección 2: Operaciones Básicas
  ajustarBrillo,
  invertirColores,
  convertirEscalaGrises,
  
  // Sección 3: Transformaciones
  voltearHorizontal,
  voltearVertical,
  rotar90Grados,
  
  // Sección 4: Filtros Avanzados
  mezclarImagenes,
  aplicarSepia,
  detectarBordes
};
