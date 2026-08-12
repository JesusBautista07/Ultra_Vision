// Lógica exclusiva de pages/reservas.html

const FUNCIONES = {
    "Hoy 3:00 PM": {
        sala: 1,
        precio: 10000
    },
    "Hoy 6:00 PM": {
        sala: 2,
        precio: 14000
    },
    "Hoy 9:00 PM": {
        sala: 3,
        precio: 16000
    },
    "Mañana 4:00 PM": {
        sala: 1,
        precio: 12000
    },
    "Mañana 7:30 PM": {
        sala: 2,
        precio: 15000
    }
};

const FILAS = ["A", "B", "C", "D", "E", "F"];
const COLUMNAS = 8;

let asientosOcupados = [];
let asientosSeleccionados = [];

// Al cargar el HTML, se prepara todo lo necesario para la página
document.addEventListener("DOMContentLoaded", () => {
    generarAsientosOcupados();
    pintarMapaAsientos();
    cargarPeliculasSelect();

    const selectFuncion = document.getElementById("selectFuncion");

    actualizarDatosFuncion();

    selectFuncion.addEventListener("change", () => {
        actualizarDatosFuncion();
        actualizarResumen();
    });

    actualizarResumen();

    document
        .getElementById("formReserva")
        .addEventListener("submit", manejarSubmitReserva);
});

// Simula asientos ya ocupados (aleatorios, fijos por sesión de página)
function generarAsientosOcupados() {
    const total = FILAS.length * COLUMNAS;
    const cantidadOcupados = Math.floor(total * 0.25);

    // Arma la lista de todos los ids posibles (A1, A2... F8)
    const idsPosibles = FILAS.flatMap((fila) =>
        Array.from({ length: COLUMNAS }, (_, i) => `${fila}${i + 1}`)
    );

    // Los desordena y toma los primeros N como "ocupados"
    asientosOcupados = idsPosibles.sort(() => 0.5 - Math.random()).slice(0, cantidadOcupados);
}

// Dibuja el grid de asientos, creando cada botón por JS
function pintarMapaAsientos() {
    const contenedor = document.getElementById("mapaAsientos");
    contenedor.innerHTML = "";

    FILAS.forEach((fila) => {
        for (let col = 1; col <= COLUMNAS; col++) {
            const idAsiento = `${fila}${col}`;
            const ocupado = asientosOcupados.includes(idAsiento);

            const boton = document.createElement("button");
            boton.type = "button";
            boton.dataset.asiento = idAsiento;
            boton.textContent = idAsiento;
            boton.disabled = ocupado;

            const clasesBase = "w-8 h-8 text-[10px] rounded flex items-center justify-center transition-colors";

            boton.className = ocupado
                ? `${clasesBase} bg-white/10 text-white/30 cursor-not-allowed`
                : `${clasesBase} bg-uvcard text-uvgray border border-white/10 hover:border-uvglow cursor-pointer`;

            if (!ocupado) {
                boton.addEventListener("click", () => alternarAsiento(idAsiento, boton));
            }

            contenedor.appendChild(boton);
        }
    });
}

// Selecciona/deselecciona un asiento y actualiza su estilo
function alternarAsiento(idAsiento, boton) {
    const clasesBase =
        "asiento-uv rounded flex items-center justify-center transition-colors";

    const clasesDisponible =
        `${clasesBase} bg-uvcard text-uvgray border border-white/10 hover:border-uvglow cursor-pointer`;

    if (asientosSeleccionados.includes(idAsiento)) {
        // Deseleccionar
        asientosSeleccionados = asientosSeleccionados.filter(
            (a) => a !== idAsiento
        );

        // Restaurar apariencia de asiento disponible
        boton.className = clasesDisponible;
    } else {
        // Seleccionar
        asientosSeleccionados.push(idAsiento);

        boton.className =
            `${clasesBase} asiento-seleccionado cursor-pointer`;
    }

    actualizarResumen();
}

// Obtiene la sala y el precio correspondientes al horario seleccionado
function obtenerFuncionSeleccionada() {
    const horario = document.getElementById("selectFuncion").value;

    return FUNCIONES[horario] || {
        sala: 1,
        precio: 10000
    };
}

// Actualiza en pantalla la sala y el precio según el horario
function actualizarDatosFuncion() {
    const funcion = obtenerFuncionSeleccionada();

    document.getElementById("resumenSala").textContent = `Sala ${funcion.sala}`;
    document.getElementById("resumenPrecio").textContent =
        `$${funcion.precio.toLocaleString("es-CO")}`;
}

// Actualiza cantidad y total en pantalla
function actualizarResumen() {
    const funcion = obtenerFuncionSeleccionada();

    document.getElementById("resumenCantidad").textContent =
        asientosSeleccionados.length;

    const total = asientosSeleccionados.length * funcion.precio;

    document.getElementById("resumenTotal").textContent =
        `$${total.toLocaleString("es-CO")}`;
}

// Carga las películas populares en el <select>, desde la API.
// Si se llegó desde el botón "Reservar boletos" de detalle.html, viene un
// movieId por la URL y esa película se agrega y se deja preseleccionada.
async function cargarPeliculasSelect() {
    const select = document.getElementById("selectPelicula");
    const movieIdUrl = new URLSearchParams(window.location.search).get("movieId");

    try {
        const peliculas = await getPopularMovies();

        if (movieIdUrl && !peliculas.some((p) => String(p.id) === movieIdUrl)) {
            const detalle = await getMovieDetail(movieIdUrl);
            peliculas.unshift(detalle);
        }

        select.innerHTML = peliculas
            .map((p) => `<option value="${p.id}" data-titulo="${p.title}" data-poster="${p.poster_path || ""}">${p.title}</option>`)
            .join("");

        if (movieIdUrl) {
            select.value = movieIdUrl;
        }
    } catch (error) {
        select.innerHTML = `<option value="">No se pudo cargar la cartelera</option>`;
    }
}

// Valida el formulario y, si todo es correcto, crea el boleto en LocalStorage
function manejarSubmitReserva(evento) {
    evento.preventDefault();

    const nombre = document.getElementById("inputNombre").value.trim();
    const email = document.getElementById("inputEmail").value.trim();
    const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    const errorNombre = document.querySelector('[data-error="nombre"]');
    const errorEmail = document.querySelector('[data-error="email"]');
    const errorAsientos = document.querySelector('[data-error="asientos"]');

    let esValido = true;

    // Valida nombre, email y asientos, mostrando/ocultando cada mensaje de error
    errorNombre.classList.toggle("hidden", nombre.length >= 3);
    if (nombre.length < 3) esValido = false;

    errorEmail.classList.toggle("hidden", regexEmail.test(email));
    if (!regexEmail.test(email)) esValido = false;

    errorAsientos.classList.toggle("hidden", asientosSeleccionados.length > 0);
    if (asientosSeleccionados.length === 0) esValido = false;

    if (!esValido) return;

    const selectPelicula = document.getElementById("selectPelicula");
    const opcionSeleccionada = selectPelicula.options[selectPelicula.selectedIndex];

    // Arma el boleto con los datos del formulario y la selección
    const funcion = obtenerFuncionSeleccionada();

    const boleto = {
        movieId: selectPelicula.value,
        movieTitle: opcionSeleccionada?.dataset.titulo || "Película",
        poster: opcionSeleccionada?.dataset.poster || "",
        funcion: document.getElementById("selectFuncion").value,
        sala: funcion.sala,
        precioBoleto: funcion.precio,
        asientos: [...asientosSeleccionados],
        total: asientosSeleccionados.length * funcion.precio,
        comprador: { nombre, email },
        fechaCompra: new Date().toISOString(),
    };

    crearBoleto(boleto);

    // Feedback y limpieza tras la reserva exitosa
    document.getElementById("mensajeExito").classList.remove("hidden");
    document.getElementById("formReserva").reset();
    asientosSeleccionados = [];
    pintarMapaAsientos();
    actualizarResumen();
}