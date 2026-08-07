/** Cuantas peliculas se muestran por pagina */
const PELICULAS_POR_PAGINA = 8;
let resultadosActuales = [];
let paginaActualCartelera = 1;

/** Función que se ejecuta cuando se carga el DOM */
document.addEventListener("DOMContentLoaded", () => {
  cargarGeneros();
  cargarYPintar(); // carga los resultados iniciales de la cartelera

  document.getElementById("checkSoloFavoritos").addEventListener("change", () => { // resetea la paginacion al cambiar el filtro 
    paginaActualCartelera = 1;
    pintarPagina();
  });
});

const form = document.getElementById("formFiltros");
form.addEventListener("submit", (evento) => { // resetea la paginacion al enviar el formulario
  evento.preventDefault();
  cargarYPintar();
});

async function cargarGeneros() { // carga los géneros desde la API y los agrega al select
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

/** Carga los resultados iniciales de la cartelera y los pinta en la pantalla */
async function cargarYPintar() {
  const contenedor = document.getElementById("contenedorCartelera");
  const mensaje = document.getElementById("mensajeEstado");

  const texto = document.getElementById("inputBuscar").value.trim(); // obtiene el texto a buscar del input
  const generoId = document.getElementById("selectGenero").value;
  const orden = document.getElementById("selectOrden").value;

  mensaje.textContent = "Cargando películas...";
  contenedor.innerHTML = skeletonHTML(8);
  progresoInicio();

  try {
    let peliculas;

    if (texto) {
      peliculas = await searchMovies(texto);
    } else if (generoId) {
      peliculas = await getMoviesByGenre(generoId);
    } else {
      peliculas = await getPopularMovies();
    }

    peliculas = ordenarPeliculas(peliculas, orden); // ordena las peliculas segun el criterio elegido por el usuario
    resultadosActuales = peliculas;
    paginaActualCartelera = 1;
    progresoFin();
    pintarPagina();
  } catch (error) {
    console.error(error);
    progresoFin();
    mensaje.textContent = "Ocurrió un error al consultar TMDb. Intenta de nuevo.";
    contenedor.innerHTML = "";
  }
}

/** Pinta las peliculas en la pantalla de la cartelera */
function pintarPagina() {
  const contenedor = document.getElementById("contenedorCartelera");
  const mensaje = document.getElementById("mensajeEstado");
  const soloFavoritos = document.getElementById("checkSoloFavoritos").checked;

  let lista = resultadosActuales;
  if (soloFavoritos) {
    lista = lista.filter((p) => esFavorito(p.id)); // filtra las peliculas marcadas como favoritas
  }

  if (lista.length === 0) {
    mensaje.textContent = soloFavoritos // si solo se muestran las favoritas y no se encontraron, se muestra un mensaje
      ? "Aún no marcaste ninguna película de esta lista como favorita."
      : "No se encontraron resultados para tu búsqueda.";
    contenedor.innerHTML = "";
    document.getElementById("paginacionCartelera").innerHTML = "";
    return;
  }

  const inicio = (paginaActualCartelera - 1) * PELICULAS_POR_PAGINA; // calcula el inicio de la pagina actual
  const paginaDePeliculas = lista.slice(inicio, inicio + PELICULAS_POR_PAGINA); // obtiene las peliculas de la pagina actual

  mensaje.textContent = `${lista.length} resultado${lista.length === 1 ? "" : "s"} encontrado${lista.length === 1 ? "" : "s"}`; // muestra la cantidad de resultados encontrados
  contenedor.innerHTML = paginaDePeliculas.map((p) => tarjetaPeliculaHTML(p)).join(""); // pinta las peliculas de la pagina actual
  activarBotonesFavorito(contenedor);

  renderizarPaginacion(lista.length);
}

/** Construye los controles de paginación de Bootstrap */
function renderizarPaginacion(totalResultados) {
  const totalPaginas = Math.ceil(totalResultados / PELICULAS_POR_PAGINA); // calcula el total de paginas necesarias para mostrar todos los resultados
  const contenedor = document.getElementById("paginacionCartelera");
  contenedor.innerHTML = "";

  if (totalPaginas <= 1) return;

  const crearItem = (etiqueta, pagina, deshabilitado = false, activo = false) => { // crea un item de paginación de Bootstrap con un botón que navega a la pagina correspondiente y lo activa si corresponde
    const li = document.createElement("li");
    li.className = `page-item ${deshabilitado ? "disabled" : ""} ${activo ? "active" : ""}`;
    const btn = document.createElement("button");
    btn.className = "page-link";
    btn.textContent = etiqueta;
    btn.addEventListener("click", () => {
      if (deshabilitado) return;
      paginaActualCartelera = pagina;
      pintarPagina();
      document.getElementById("contenedorCartelera").scrollIntoView({ behavior: "smooth", block: "start" }); // hace scroll hacia arriba de la pantalla
    });
    li.appendChild(btn);
    return li;
  };

  contenedor.appendChild(crearItem("«", paginaActualCartelera - 1, paginaActualCartelera === 1)); // agrega un botón que navega a la pagina anterior
  for (let i = 1; i <= totalPaginas; i++) { // agrega un botón para cada pagina disponible
    contenedor.appendChild(crearItem(i, i, false, i === paginaActualCartelera));
  }
  contenedor.appendChild(crearItem("»", paginaActualCartelera + 1, paginaActualCartelera === totalPaginas)); // agrega un botón que navega a la pagina siguiente
}

/** Ordena las peliculas segun el criterio elegido por el usuario */
function ordenarPeliculas(peliculas, criterio) {
  const copia = [...peliculas];
  switch (criterio) {
    case "calificacion":
      return copia.sort((a, b) => b.vote_average - a.vote_average);
    case "reciente":
      return copia.sort((a, b) => new Date(b.release_date || 0) - new Date(a.release_date || 0));
    default:
      return copia.sort((a, b) => b.popularity - a.popularity);
  }
}

/** Crea un HTML de skeleton para las peliculas en la cartelera */
function skeletonHTML(cantidad) {
  return Array.from({ length: cantidad })
    .map(() => `<div class="col-6 col-md-4 col-lg-3"><div class="skeleton-uv"></div></div>`) // crea un div con la clase "skeleton-uv" para cada pelicula
    .join("");
}