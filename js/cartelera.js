// Lógica exclusiva de pages/cartelera.html

const PELICULAS_POR_PAGINA = 8;
let resultadosActuales = [];
let paginaActualCartelera = 1;

document.addEventListener("DOMContentLoaded", () => {
  cargarGeneros();
  cargarYPintar(); // carga inicial: populares, sin filtros

  document.getElementById("checkSoloFavoritos").addEventListener("change", () => {
    paginaActualCartelera = 1;
    pintarPagina();
  });
});

const form = document.getElementById("formFiltros");
form.addEventListener("submit", (evento) => {
  evento.preventDefault();
  cargarYPintar();
});

// Llena el <select> de géneros consultando la API
async function cargarGeneros() {
  try {
    const generos = await getGenres();
    const select = document.getElementById("selectGenero");
    generos.forEach((genero) => {
      const opcion = document.createElement("option");
      opcion.value = genero.id;
      opcion.textContent = genero.name;
      select.appendChild(opcion);
    });
  } catch (error) {
    console.error("No se pudieron cargar los géneros:", error);
  }
}

// Lee los filtros del formulario, consulta la API y guarda los resultados
async function cargarYPintar() {
  const contenedor = document.getElementById("contenedorCartelera");
  const mensaje = document.getElementById("mensajeEstado");

  const texto = document.getElementById("inputBuscar").value.trim();
  const generoId = document.getElementById("selectGenero").value;

  mensaje.textContent = "Cargando películas...";
  contenedor.innerHTML = skeletonHTML(8);

  try {
    let peliculas;

    if (texto) {
      peliculas = await searchMovies(texto);
    } else if (generoId) {
      peliculas = await getMoviesByGenre(generoId);
    } else {
      peliculas = await getPopularMovies();
    }

    resultadosActuales = peliculas;
    paginaActualCartelera = 1;
    pintarPagina();
  } catch (error) {
    console.error(error);
    mensaje.textContent = "Ocurrió un error al consultar TMDb. Intenta de nuevo.";
    contenedor.innerHTML = "";
  }
}

// Aplica el filtro "solo favoritos" (si está activo) y pinta la página actual
function pintarPagina() {
  const contenedor = document.getElementById("contenedorCartelera");
  const mensaje = document.getElementById("mensajeEstado");
  const soloFavoritos = document.getElementById("checkSoloFavoritos").checked;

  let lista = resultadosActuales;
  if (soloFavoritos) {
    lista = lista.filter((p) => esFavorito(p.id));
  }

  if (lista.length === 0) {
    mensaje.textContent = soloFavoritos
      ? "Aún no marcaste ninguna película de esta lista como favorita."
      : "No se encontraron resultados para tu búsqueda.";
    contenedor.innerHTML = "";
    document.getElementById("paginacionCartelera").innerHTML = "";
    return;
  }

  const inicio = (paginaActualCartelera - 1) * PELICULAS_POR_PAGINA;
  const paginaDePeliculas = lista.slice(inicio, inicio + PELICULAS_POR_PAGINA);

  mensaje.textContent = `${lista.length} resultado${lista.length === 1 ? "" : "s"} encontrado${lista.length === 1 ? "" : "s"}`;
  contenedor.innerHTML = paginaDePeliculas.map((p) => tarjetaPeliculaHTML(p)).join("");
  activarBotonesFavorito(contenedor);

  renderizarPaginacion(lista.length);
}

// Construye los botones de paginación (« 1 2 3 »)
function renderizarPaginacion(totalResultados) {
  const totalPaginas = Math.ceil(totalResultados / PELICULAS_POR_PAGINA);
  const contenedor = document.getElementById("paginacionCartelera");
  contenedor.innerHTML = "";

  if (totalPaginas <= 1) return;

  const crearItem = (etiqueta, pagina, deshabilitado = false, activo = false) => {
    const li = document.createElement("li");
    li.className = `page-item ${deshabilitado ? "disabled" : ""} ${activo ? "active" : ""}`;
    const btn = document.createElement("button");
    btn.className = "page-link";
    btn.textContent = etiqueta;
    btn.addEventListener("click", () => {
      if (deshabilitado) return;
      paginaActualCartelera = pagina;
      pintarPagina();
      document.getElementById("contenedorCartelera").scrollIntoView({ behavior: "smooth", block: "start" });
    });
    li.appendChild(btn);
    return li;
  };

  contenedor.appendChild(crearItem("«", paginaActualCartelera - 1, paginaActualCartelera === 1));
  for (let i = 1; i <= totalPaginas; i++) {
    contenedor.appendChild(crearItem(i, i, false, i === paginaActualCartelera));
  }
  contenedor.appendChild(crearItem("»", paginaActualCartelera + 1, paginaActualCartelera === totalPaginas));
}

// Tarjetas "esqueleto" mientras se espera la respuesta de la API
function skeletonHTML(cantidad) {
  return Array.from({ length: cantidad })
    .map(() => `<div class="col-6 col-md-4 col-lg-3"><div class="skeleton-uv"></div></div>`)
    .join("");
}