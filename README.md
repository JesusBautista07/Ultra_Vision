# UltraVision 🎬

Aplicación web responsiva sobre temática de **Cine**, desarrollada como Taller Final Integrador del programa **Análisis y Desarrollo de Software (ADSO) — SENA**.

## Integrantes

- Silder Nieto
- Jesús Bautista

## Objetivo

Desarrollar una aplicación web responsive que resuelva la necesidad de una cadena de cines: mostrar cartelera de películas, permitir la reserva de asientos y la gestión de boletos, aplicando de forma integrada HTML5, CSS3, JavaScript, Bootstrap 5 y Tailwind CSS, sin uso de bases de datos ni frameworks adicionales.

## Tecnologías utilizadas

- **HTML5** — estructura semántica de las 6 páginas
- **CSS3** — variables personalizadas, Flexbox, animaciones, transiciones y diseño responsive
- **JavaScript (Vanilla)** — manipulación del DOM, eventos, validaciones, CRUD con LocalStorage y consumo de API
- **Bootstrap 5** — Navbar, Cards, Carousel, Modal, Toast, formularios, botones y sistema Grid
- **Tailwind CSS** — sección de selección de asientos en `reservas.html` (100% Tailwind, sin mezclar con Bootstrap)
- **API pública** — [TMDb (The Movie Database)](https://www.themoviedb.org/) para cartelera, búsqueda, géneros, detalle, reparto y trailers

## Estructura del proyecto

```
UltraVision/
│
├── index.html              → Inicio: hero, carrusel de estrenos y populares
├── pages/
│   ├── cartelera.html      → Catálogo con buscador y filtro por género
│   ├── detalle.html        → Ficha de película: sinopsis, reparto y trailer
│   ├── reservas.html       → Selección de asientos (sección 100% Tailwind) + formulario
│   ├── mis-boletos.html    → CRUD de reservas (ver, editar, cancelar)
│   └── contacto.html       → Formulario de contacto validado + datos del cine
├── css/
│   └── styles.css          → Variables de la paleta, estilos base y responsive
├── js/
│   ├── api.js               → Conexión con la API de TMDb
│   ├── app.js                → Lógica global (modo oscuro, favoritos, home)
│   ├── crud.js                → CRUD de boletos en LocalStorage
│   ├── cartelera.js            → Lógica de búsqueda, filtro y paginación
│   ├── reservas.js              → Mapa de asientos y creación de boletos
│   ├── mis-boletos.js            → Listado, edición y eliminación de boletos
│   ├── detalle.js                 → Detalle de película y trailer
│   └── contacto.js                 → Validaciones del formulario de contacto
├── icons/
│   └── favicon.svg
└── assets/                  → Otros recursos (documentos, fuentes locales, etc.)
```

## Funcionalidades implementadas

- 🔍 Buscador de películas
- 🎯 Filtro por género
- 🌙 Modo oscuro / claro (con persistencia en LocalStorage)
- ❤️ Sistema de favoritos (con filtro "solo favoritos" y contador dinámico en el navbar)
- 🔢 Paginación de resultados en Cartelera
- 🦴 Efecto skeleton mientras cargan los datos de TMDb

## Instrucciones para ejecutar

1. Descomprime la carpeta del proyecto.
2. Abre `index.html` directamente en el navegador, o usa la extensión **Live Server** de VS Code para una mejor experiencia (recomendado, evita posibles restricciones de CORS al cargar imágenes).
3. No requiere instalación de dependencias ni servidor backend: todo el proyecto es Front-End puro.
4. La API de TMDb ya viene configurada con una clave de uso personal en `js/api.js`. Si necesitas tu propia clave, regístrate gratis en [themoviedb.org](https://www.themoviedb.org/) → *Settings → API*.

## Notas

- La persistencia de datos (boletos y favoritos) se realiza mediante **LocalStorage** del navegador.
- El formulario de contacto es una simulación: valida los campos pero no envía ningún mensaje real (no hay backend ni servidor de correo).
- No se procesan pagos reales; el proyecto tiene fines exclusivamente educativos.