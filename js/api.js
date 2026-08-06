/*=======================
API TMDb - The Movie Database
=========================*/

const TMDB_TOKEN = "eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJmOTQ4OGUxNWYxZTk2YjUzMThlMjAwYzJmNTczMWM0NSIsIm5iZiI6MTc4NTk2MTM1MS4yNTMsInN1YiI6IjZhNzM5Yjg3MjgxNjE2NmJiNTNkNjQxYSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.oV1j2lPSG9JFt_PaFQ2DoO6A-LEInEe2-hDNd5VsQnM";

const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const TMDB_IMG_BASE = "https://image.tmdb.org/t/p/w500";

const tmdbHeaders = {
  accept: "application/json",
  Authorization: `Bearer ${TMDB_TOKEN}`,
};

/**
 * Realiza una petición GET genérica a la API de TMDb.
 * @param {string} endpoint - Ej: "/movie/popular", "/search/movie"
 * @param {Object} params - Parámetros query adicionales (ej: { query: "batman" })
 */
async function tmdbFetch(endpoint, params = {}) {
  const url = new URL(TMDB_BASE_URL + endpoint);
  url.searchParams.set("language", "es-ES");
  Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, value));

  const response = await fetch(url.toString(), { headers: tmdbHeaders });

  if (!response.ok) {
    throw new Error(`Error TMDb (${response.status}): ${response.statusText}`);
  }
  return response.json();
}

/** Obtiene las películas populares (usadas en Home y Cartelera) */
async function getPopularMovies(page = 1) {
  const data = await tmdbFetch("/movie/popular", { page });
  return data.results;
}

/** Busca películas por texto */
async function searchMovies(query, page = 1) {
  const data = await tmdbFetch("/search/movie", { query, page });
  return data.results;
}

/** Obtiene el detalle completo de una película por ID */
async function getMovieDetail(movieId) {
  return tmdbFetch(`/movie/${movieId}`, { append_to_response: "credits,videos" });
}

/** Obtiene la lista de géneros disponibles */
async function getGenres() {
  const data = await tmdbFetch("/genre/movie/list");
  return data.genres;
}

/** Obtiene películas filtradas por género */
async function getMoviesByGenre(genreId, page = 1) {
  const data = await tmdbFetch("/discover/movie", { with_genres: genreId, page });
  return data.results;
}

/** Construye la URL completa de un póster */
function getPosterUrl(posterPath) {
  return posterPath ? `${TMDB_IMG_BASE}${posterPath}` : "https://placehold.co/500x750/1B2540/B8C1D1?text=Sin+imagen";
}