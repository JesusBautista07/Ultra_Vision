// Lógica exclusiva de pages/detalle.html

document.addEventListener("DOMContentLoaded", () => {
  const parametros = new URLSearchParams(window.location.search);
  const movieId = parametros.get("id");

  if (!movieId) {
    mostrarError("No se especificó ninguna película.");
    return;
  }

  cargarDetalle(movieId);
});

// Pide a TMDb el detalle, créditos y videos de la película, y pinta la página
async function cargarDetalle(movieId) {
  try {
    const pelicula = await getMovieDetail(movieId);
    pintarDetalle(pelicula);
  } catch (error) {
    console.error("Error cargando el detalle:", error);
    mostrarError("No se pudo cargar la información de esta película.");
  }
}

function mostrarError(mensaje) {
  document.getElementById("contenidoDetalle").innerHTML = `
    <p class="text-danger">${mensaje}</p>
    <a href="../index.html" class="btn-uv-outline">Volver al inicio</a>`;
}

// Arma todo el contenido de la página con los datos de la película
function pintarDetalle(pelicula) {
  const generos = pelicula.genres.map((g) => g.name).join(", ") || "—";
  const anio = pelicula.release_date ? pelicula.release_date.split("-")[0] : "—";
  const reparto = (pelicula.credits?.cast || []).slice(0, 6);
  const trailerKey = obtenerTrailerKey(pelicula.videos);

  document.getElementById("contenidoDetalle").innerHTML = `
    <div class="row g-4">
      <div class="col-12 col-md-4">
        <img src="${getPosterUrl(pelicula.poster_path)}" alt="Póster de ${pelicula.title}"
             class="w-100 rounded-4">
      </div>
      <div class="col-12 col-md-8">
        <p class="eyebrow mb-1">${generos}</p>
        <h1 class="mb-2">${pelicula.title}</h1>
        <p class="text-secondary mb-3">${anio} · ⭐ ${pelicula.vote_average.toFixed(1)}</p>
        <p class="mb-4">${pelicula.overview || "Sin sinopsis disponible."}</p>

        <div class="d-flex gap-3 flex-wrap mb-4">
          <a href="reservas.html?movieId=${pelicula.id}" class="btn-uv-primary">Reservar boletos</a>
          ${trailerKey ? `<button class="btn-uv-outline" id="btnVerTrailer">Ver trailer</button>` : ""}
        </div>

        <h5 class="mb-3">Reparto</h5>
        <div class="d-flex flex-wrap gap-3">
          ${reparto.map((actor) => `
            <div style="width: 100px;">
              <img src="${getPosterUrl(actor.profile_path)}" alt="Foto de ${actor.name}"
                   class="rounded-3 mb-1" style="width: 100%; aspect-ratio: 2/3; object-fit: cover;">
              <p class="small mb-0">${actor.name}</p>
            </div>`).join("") || `<p class="text-secondary small">No hay información del reparto.</p>`}
        </div>
      </div>
    </div>`;

  if (trailerKey) {
    document.getElementById("btnVerTrailer").addEventListener("click", () => abrirTrailer(trailerKey, pelicula.title));
  }
}

// Busca el primer video de tipo "Trailer" publicado en YouTube
function obtenerTrailerKey(videos) {
  const lista = videos?.results || [];
  const trailer = lista.find((v) => v.site === "YouTube" && v.type === "Trailer");
  return trailer ? trailer.key : null;
}

// Inserta el iframe de YouTube dentro del modal y lo muestra
function abrirTrailer(key, tituloPelicula) {
  document.getElementById("contenedorTrailer").innerHTML = `
    <iframe src="https://www.youtube.com/embed/${key}" title="Trailer de ${tituloPelicula}" allowfullscreen></iframe>`;
  new bootstrap.Modal(document.getElementById("modalTrailer")).show();
}

// Al cerrar el modal, se borra el iframe para que el video deje de sonar de fondo
document.getElementById("modalTrailer").addEventListener("hidden.bs.modal", () => {
  document.getElementById("contenedorTrailer").innerHTML = "";
});