// Conexión con la API de TMDb (The Movie Database).
// Este token es de tipo "API Read Access Token" (v4 auth). En un proyecto
// real no se deja expuesto así en el front-end, pero para un proyecto
// académico sin backend es la forma más simple de usarlo.

// Token de autenticacion ante TMDb
const TMDB_TOKEN = "eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJmOTQ4OGUxNWYxZTk2YjUzMThlMjAwYzJmNTczMWM0NSIsIm5iZiI6MTc4NTk2MTM1MS4yNTMsInN1YiI6IjZhNzM5Yjg3MjgxNjE2NmJiNTNkNjQxYSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.oV1j2lPSG9JFt_PaFQ2DoO6A-LEInEe2-hDNd5VsQnM";

const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const TMDB_IMG_BASE = "https://image.tmdb.org/t/p/w500";

// Encabezados que pide TMDb en cada petición: formato de respuesta + el token de acceso
const tmdbHeaders = {
  accept: "application/json",
  Authorization: `Bearer ${TMDB_TOKEN}`,
};

// Petición GET genérica a la API de TMDb.
// endpoint: ej. "/movie/popular", "/search/movie"
// params: parámetros extra de la URL, ej. { query: "batman" }
async function tmdbFetch(endpoint, params = {}) {
  const url = new URL(TMDB_BASE_URL + endpoint);
  url.searchParams.set("language", "es-MX");
  Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, value));
  // EJ: /search/movie?language=es-CO&query=Batman&page=1

  const response = await fetch(url.toString(), { headers: tmdbHeaders });

  if (!response.ok) {
    throw new Error(`Error TMDb (${response.status}): ${response.statusText}`);
  }
  return response.json();
}

// Películas populares (usadas en Home y Cartelera)
async function getPopularMovies(page = 1) {
  const data = await tmdbFetch("/movie/popular", { page });
  return data.results;
}

// Busca películas por texto
async function searchMovies(query, page = 1) {
  const data = await tmdbFetch("/search/movie", { query, page });
  return data.results;
}

// Detalle completo de una película por ID
async function getMovieDetail(movieId) {
  return tmdbFetch(`/movie/${movieId}`, { append_to_response: "credits,videos" });
}

// Lista de géneros disponibles
async function getGenres() {
  const data = await tmdbFetch("/genre/movie/list");
  return data.genres;
}

// Películas filtradas por género
async function getMoviesByGenre(genreId, page = 1) {
  const data = await tmdbFetch("/discover/movie", { with_genres: genreId, page });
  return data.results;
}

// Construye la URL completa de un póster
function getPosterUrl(posterPath) {
  return posterPath ? `${TMDB_IMG_BASE}${posterPath}` : "https://placehold.co/500x750/1B2540/B8C1D1?text=Sin+imagen";
}