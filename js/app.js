document.addEventListener("DOMContentLoaded", () => { // se ejecuta cuando el DOM se ha cargado completo
  initModoOscuro();
  insertarProgressBar();
  actualizarBadgeFavoritos();

  const enIndex = document.getElementById("carruselInner");
  if (enIndex) { // si estamos en la página de inicio, inicializamos el contenido de la página y el carrusel de estrenos
    initHome();
  }
});


function initModoOscuro() {
  const boton = document.getElementById("toggleTema"); // Botón que permite al usuario cambiar entre modo oscuro y claro
  if (!boton) return;

  const temaGuardado = localStorage.getItem("uv-theme");
  if (temaGuardado === "light") {
    document.body.classList.add("light-mode");
    boton.textContent = "☀️";
  } else {
    boton.textContent = "🌙";
  }

  boton.addEventListener("click", () => {
    document.body.classList.toggle("light-mode");
    const esClaro = document.body.classList.contains("light-mode");
    boton.textContent = esClaro ? "☀️" : "🌙";
    localStorage.setItem("uv-theme", esClaro ? "light" : "dark");
  });
}


function obtenerFavoritos() { // devuelve un array con los ids de los boletos favoritos guardados
  return JSON.parse(localStorage.getItem("uv-favoritos") || "[]");
}

function esFavorito(movieId) { // devuelve true si el boleto con el id dado es favorito
  return obtenerFavoritos().includes(movieId);
}

function toggleFavorito(movieId) { // cambia el estado de favorito del boleto con el id dado
  let favoritos = obtenerFavoritos();
  if (favoritos.includes(movieId)) { // si el boleto ya estaba marcado como favorito lo desmarcamos
    favoritos = favoritos.filter((id) => id !== movieId);
  } else {
    favoritos.push(movieId);
  }
  localStorage.setItem("uv-favoritos", JSON.stringify(favoritos)); // guardamos los favoritos en LocalStorage
  actualizarBadgeFavoritos();
  return esFavorito(movieId);
}

/** Actualiza el badge de favoritos en la barra de navegación */
function actualizarBadgeFavoritos() {
  const badge = document.getElementById("badgeFavoritos");
  if (badge) badge.textContent = obtenerFavoritos().length;
}

/** Inserta la barra de progreso en la pantalla principal */
function insertarProgressBar() {
  if (document.getElementById("progressUV")) return;
  const barra = document.createElement("div");
  barra.id = "progressUV";
  barra.className = "progress-uv";
  document.body.prepend(barra);
}

/** Muestra la barra de progreso al cargar la página */
function progresoInicio() {
  const barra = document.getElementById("progressUV");
  if (!barra) return;
  barra.style.opacity = "1";
  barra.style.width = "70%";
}

function progresoFin() { // oculta la barra de progreso al terminar de cargar la página
  const barra = document.getElementById("progressUV");
  if (!barra) return;
  barra.style.width = "100%";
  setTimeout(() => {
    barra.style.opacity = "0";
    setTimeout(() => (barra.style.width = "0%"), 400);
  }, 300);
}

/** Inicializa el contenido de la página de inicio */
async function initHome() {
  progresoInicio();
  try {
    const populares = await getPopularMovies(); // obtenemos las peliculas populares
    pintarCarrusel(populares.slice(0, 5));
    pintarPopulares(populares.slice(5, 13));
    progresoFin();
  } catch (error) {
    progresoFin();
    console.error("Error cargando datos de TMDb:", error); // mostramos un error en la consola si llega a ocurrir un problema
    document.getElementById("carruselInner").innerHTML = `
      <div class="carousel-item active">
        <div class="d-flex justify-content-center align-items-center text-danger" style="height:300px;">
          No se pudo conectar con la API de TMDb.
        </div>
      </div>`;
  }
}

/** Pinta el carrusel de estrenos destacados en el index */
function pintarCarrusel(peliculas) {
  const contenedor = document.getElementById("carruselInner");
  contenedor.innerHTML = peliculas // recorremos el array de peliculas y creamos una card para cada una de ellas
    .map( // para cada pelicula creamos un div con la informacion de la pelicula y un boton para marcarla como favorita
      (pelicula, index) => `
      <div class="carousel-item ${index === 0 ? "active" : ""}">
        <div class="d-flex flex-column flex-md-row align-items-center gap-4 p-4"
             style="background-color: var(--uv-bg-alt); min-height: 400px;">
          <img src="${getPosterUrl(pelicula.poster_path)}"
               alt="Póster de ${pelicula.title}"
               style="width: 180px; border-radius: 10px;">
          <div>
            <p class="eyebrow mb-1">Destacada</p>
            <h3 class="text-white">${pelicula.title}</h3>
            <p class="text-secondary" style="max-width: 500px;">
              ${pelicula.overview ? pelicula.overview.slice(0, 180) + "..." : "Sin sinopsis disponible."}
            </p>
            <span class="btn-uv-primary">⭐ ${pelicula.vote_average.toFixed(1)}</span>
          </div>
        </div>
      </div>`
    )
    .join("");
}

/** Pinta las cards de películas populares en index.html */
function pintarPopulares(peliculas) {
  const contenedor = document.getElementById("contenedorPopulares");
  contenedor.innerHTML = peliculas.map((pelicula) => tarjetaPeliculaHTML(pelicula)).join("");
  activarBotonesFavorito(contenedor);
}

/** Retorna la ruta de la página de detalle de una pelicula */
function rutaDetalle(movieId) {
  const dentroDePages = window.location.pathname.includes("/pages/"); // comprobamos si estamos en la carpeta pages
  return dentroDePages ? `detalle.html?id=${movieId}` : `pages/detalle.html?id=${movieId}`;
}

/** Crea una tarjeta con la informacion de una pelicula */
function tarjetaPeliculaHTML(pelicula) {
  const favMarcado = esFavorito(pelicula.id); // comprobamos si la pelicula esta marcada como favorita
  return `
    <div class="col-6 col-md-4 col-lg-3">
      <div class="card-uv h-100">
        <button class="btn-favorito" data-id="${pelicula.id}" aria-label="Marcar como favorita">
          ${favMarcado ? "❤️" : "🤍"}
        </button>
        <a href="${rutaDetalle(pelicula.id)}">
          <img src="${getPosterUrl(pelicula.poster_path)}" alt="Póster de ${pelicula.title}" loading="lazy">
        </a>
        <div class="card-body p-3">
          <a href="${rutaDetalle(pelicula.id)}" class="text-white text-decoration-none">
            <h6 class="mb-1">${pelicula.title}</h6>
          </a>
          <small>${pelicula.release_date ? pelicula.release_date.split("-")[0] : "—"} · ⭐ ${pelicula.vote_average.toFixed(1)}</small>
        </div>
      </div>
    </div>`;
}

/** Activa los botones de marcar como favorita */
function activarBotonesFavorito(contenedor) {
  contenedor.querySelectorAll(".btn-favorito").forEach((boton) => {
    boton.addEventListener("click", () => {
      const id = Number(boton.dataset.id);
      const ahoraEsFavorito = toggleFavorito(id);
      boton.textContent = ahoraEsFavorito ? "❤️" : "🤍";
    });
  });
}