// Logica exclusivamente de detalle.html

// Llama la funcion cargarDetalle cuando el DOM cargue
document.addEventListener("DOMContentLoaded", cargarDetalle);

// Carga todo el detalle sobre la pelicula seleccionada
async function cargarDetalle() {
    const parametros = new URLSearchParams(window.location.search); //devuelve la parte de la URL que empieza con ?
    const id = parametros.get("id");
    const contenedor = document.getElementById("contenidoDetalle");

    // Muestra error si no se encontro el id de la pelicula
    if (!id) {
        contenedor.innerHTML = `<p class="text-danger">No se especificó ninguna película.</p>`;
        return;
    }

    progresoInicio(); // Animacion de barra de carga
    try {
        const pelicula = await getMovieDetail(id);
        pintarDetalle(pelicula);
        progresoFin(); //Termina la animacion de carga
    } catch (error) {
        console.error(error);
        progresoFin();
        contenedor.innerHTML = `<p class="text-danger">No se pudo cargar la información de esta película.</p>`;
    }
}

// Muestra o pinta toda la info de la pelicula
function pintarDetalle(pelicula) {
    const contenedor = document.getElementById("contenidoDetalle");
    const generos = pelicula.genres.map((g) => g.name).join(" · "); // transforma ese arreglo en uno solo con los nombres: ["Acción", "Aventura"]
    const año = pelicula.release_date ? pelicula.release_date.split("-")[0] : "—"; // Guarda el año de extreno de la pelicula
    const duracion = pelicula.runtime ? `${pelicula.runtime} min` : "—";// Guarda la duracion de la pelicula

    const reparto = (pelicula.credits?.cast || []).slice(0, 8); // Guarda los repartos de la pelicula (solo los 8 primeros)
    const trailer = (pelicula.videos?.results || []).find(
        (v) => v.site === "YouTube" && v.type === "Trailer"
    ); // Obtiene el trailer


    // Inserta toda la informacion a la pantalla
    contenedor.innerHTML = `
    <div class="row g-5">
      <div class="col-md-4">
        <img src="${getPosterUrl(pelicula.poster_path)}" alt="Póster de ${pelicula.title}"  
             class="img-fluid rounded-4 w-100">
      </div>
      <div class="col-md-8">
        <p class="eyebrow mb-1">${generos}</p>x
        <h1 class="mb-2">${pelicula.title}</h1>
        <p class="text-secondary mb-3">${año} · ${duracion} · ⭐ ${pelicula.vote_average.toFixed(1)}</p> 
        <p style="max-width: 700px;">${pelicula.overview || "Sin sinopsis disponible."}</p>

        <div class="d-flex gap-3 flex-wrap mt-4">
          <a href="reservas.html?movieId=${pelicula.id}" class="btn-uv-primary">Reservar boletos</a>
          ${trailer ? `<button class="btn-uv-outline" id="btnVerTrailer">Ver trailer</button>` : ""}
        </div>

        <h5 class="mt-5 mb-3">Reparto principal</h5>
        <div class="d-flex gap-3 flex-wrap">
          ${reparto
            .map(
                (actor) => `
            <div class="text-center" style="width: 90px;">
              <img src="${actor.profile_path ? `https://image.tmdb.org/t/p/w200${actor.profile_path}` : "https://placehold.co/200x200/1B2540/B8C1D1?text=%3F"}" 
                   alt="${actor.name}" class="rounded-circle mb-1"  style="width: 70px; height: 70px; object-fit: cover;">
              <p class="small mb-0">${actor.name}</p> <!-- Muestra nombre del actor -->
              <p class="small text-secondary mb-0">${actor.character || ""}</p>
            </div>`
            )
            .join("")}
        </div>
      </div>
    </div>
  `;

    // Inserta el trailer de la pelicula
    if (trailer) {
        document.getElementById("btnVerTrailer").addEventListener("click", () => {
            document.getElementById("contenedorTrailer").innerHTML = `
        <iframe src="https://www.youtube.com/embed/${trailer.key}" title="Trailer de ${pelicula.title}"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowfullscreen></iframe>`;
            new bootstrap.Modal(document.getElementById("modalTrailer")).show();
        });
    }
}
