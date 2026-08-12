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


// INICIALIZACIÓN
document.addEventListener("DOMContentLoaded", () => {
    generarAsientosOcupados();
    pintarMapaAsientos();
    cargarPeliculasSelect();

    const selectFuncion = document.getElementById("selectFuncion");

    actualizarDatosFuncion();
    actualizarResumen();

    selectFuncion.addEventListener("change", () => {
        actualizarDatosFuncion();
        actualizarResumen();
    });

    document
        .getElementById("formReserva")
        .addEventListener("submit", manejarSubmitReserva);
});


// ASIENTOS OCUPADOS
function generarAsientosOcupados() {
    const total = FILAS.length * COLUMNAS;
    const cantidadOcupados = Math.floor(total * 0.25);

    const idsPosibles = FILAS.flatMap((fila) =>
        Array.from(
            { length: COLUMNAS },
            (_, i) => `${fila}${i + 1}`
        )
    );

    asientosOcupados = idsPosibles
        .sort(() => 0.5 - Math.random())
        .slice(0, cantidadOcupados);
}


// MAPA DE ASIENTOS
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

            const clasesBase =
                "asiento-uv rounded flex items-center justify-center transition-colors";

            if (ocupado) {
                boton.className =
                    `${clasesBase} bg-white/10 text-white/30 cursor-not-allowed`;
            } else {
                boton.className =
                    `${clasesBase} bg-uvcard text-uvgray border border-white/10 hover:border-uvglow cursor-pointer`;

                boton.addEventListener("click", () =>
                    alternarAsiento(idAsiento, boton)
                );
            }

            contenedor.appendChild(boton);
        }
    });
}


// SELECCIONAR / DESELECCIONAR ASIENTO
function alternarAsiento(idAsiento, boton) {
    const indice = asientosSeleccionados.indexOf(idAsiento);

    if (indice !== -1) {
        // Deseleccionar
        asientosSeleccionados.splice(indice, 1);

        boton.classList.remove("asiento-seleccionado");
    } else {
        // Seleccionar
        asientosSeleccionados.push(idAsiento);

        boton.classList.add("asiento-seleccionado");
    }

    actualizarResumen();
}


// FUNCIONES — SALA Y PRECIO
function obtenerFuncionSeleccionada() {
    const horario = document.getElementById("selectFuncion").value;

    return FUNCIONES[horario];
}

function actualizarDatosFuncion() {
    const funcion = obtenerFuncionSeleccionada();

    if (!funcion) {
        return;
    }

    document.getElementById("resumenSala").textContent =
        `Sala ${funcion.sala}`;

    document.getElementById("resumenPrecio").textContent =
        `$${funcion.precio.toLocaleString("es-CO")}`;
}


// RESUMEN
function actualizarResumen() {
    const funcion = obtenerFuncionSeleccionada();

    if (!funcion) {
        return;
    }

    document.getElementById("resumenCantidad").textContent =
        asientosSeleccionados.length;

    const total =
        asientosSeleccionados.length * funcion.precio;

    document.getElementById("resumenTotal").textContent =
        `$${total.toLocaleString("es-CO")}`;
}


// CARGAR PELÍCULAS
async function cargarPeliculasSelect() {
    const select = document.getElementById("selectPelicula");

    const movieIdUrl =
        new URLSearchParams(window.location.search).get("movieId");

    try {
        const peliculas = await getPopularMovies();

        if (
            movieIdUrl &&
            !peliculas.some(
                (pelicula) =>
                    String(pelicula.id) === movieIdUrl
            )
        ) {
            const detalle = await getMovieDetail(movieIdUrl);

            peliculas.unshift(detalle);
        }

        select.innerHTML = peliculas
            .map(
                (pelicula) => `
                    <option
                        value="${pelicula.id}"
                        data-titulo="${pelicula.title}"
                        data-poster="${pelicula.poster_path || ""}">
                        ${pelicula.title}
                    </option>
                `
            )
            .join("");

        if (movieIdUrl) {
            select.value = movieIdUrl;
        }
    } catch (error) {
        console.error("Error al cargar películas:", error);

        select.innerHTML = `
            <option value="">
                No se pudo cargar la cartelera
            </option>
        `;
    }
}


// VALIDACIÓN Y RESERVA
function manejarSubmitReserva(evento) {
    evento.preventDefault();

    const nombre =
        document.getElementById("inputNombre").value.trim();

    const email =
        document.getElementById("inputEmail").value.trim();

    const regexEmail =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    const errorNombre =
        document.querySelector('[data-error="nombre"]');

    const errorEmail =
        document.querySelector('[data-error="email"]');

    const errorAsientos =
        document.querySelector('[data-error="asientos"]');

    let esValido = true;

    // Nombre
    const nombreValido = nombre.length >= 3;

    errorNombre.classList.toggle(
        "hidden",
        nombreValido
    );

    if (!nombreValido) {
        esValido = false;
    }

    // Email
    const emailValido = regexEmail.test(email);

    errorEmail.classList.toggle(
        "hidden",
        emailValido
    );

    if (!emailValido) {
        esValido = false;
    }

    // Asientos
    const asientosValidos =
        asientosSeleccionados.length > 0;

    errorAsientos.classList.toggle(
        "hidden",
        asientosValidos
    );

    if (!asientosValidos) {
        esValido = false;
    }

    if (!esValido) {
        return;
    }

    const selectPelicula =
        document.getElementById("selectPelicula");

    const opcionSeleccionada =
        selectPelicula.options[
            selectPelicula.selectedIndex
        ];

    const funcion =
        obtenerFuncionSeleccionada();

    const boleto = {
        movieId: selectPelicula.value,

        movieTitle:
            opcionSeleccionada?.dataset.titulo ||
            "Película",

        poster:
            opcionSeleccionada?.dataset.poster ||
            "",

        funcion:
            document.getElementById("selectFuncion").value,

        sala: funcion.sala,

        precioBoleto: funcion.precio,

        asientos: [...asientosSeleccionados],

        total:
            asientosSeleccionados.length *
            funcion.precio,

        comprador: {
            nombre,
            email
        },

        fechaCompra:
            new Date().toISOString()
    };

    crearBoleto(boleto);

    // Mostrar confirmación
    document
        .getElementById("mensajeExito")
        .classList.remove("hidden");

    // Limpiar formulario
    document
        .getElementById("formReserva")
        .reset();

    asientosSeleccionados = [];

    pintarMapaAsientos();
    actualizarDatosFuncion();
    actualizarResumen();
}