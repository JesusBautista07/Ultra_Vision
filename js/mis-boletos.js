/* ==========================================================================
   UltraVision — mis-boletos.js
   Lógica exclusiva de pages/mis-boletos.html (CRUD sobre LocalStorage)
   ========================================================================== */

let idAEliminar = null;                              // Guarda temporalmente qué boleto se va a borrar
let modalEditar, modalEliminar, toastNotificacion;   // Instancias de los componentes Bootstrap (se llenan al cargar)

document.addEventListener("DOMContentLoaded", () => {
    // Se crean UNA sola vez las instancias de modal/toast, controladas por JS (no por data-bs-*)
    modalEditar = new bootstrap.Modal(document.getElementById("modalEditar"));
    modalEliminar = new bootstrap.Modal(document.getElementById("modalEliminar"));
    toastNotificacion = new bootstrap.Toast(document.getElementById("toastNotificacion"));

    pintarBoletos(); // Dibuja todos los boletos guardados apenas carga la página

    document.getElementById("formEditar").addEventListener("submit", guardarEdicion);
    document.getElementById("btnConfirmarEliminar").addEventListener("click", confirmarEliminacion);
});

// Lista todos los boletos guardados en LocalStorage 
function pintarBoletos() {
    const boletos = obtenerBoletos(); // Trae los datos desde crud.js
    const contenedor = document.getElementById("contenedorBoletos");
    const estadoVacio = document.getElementById("estadoVacio");

    // Si no hay boletos, muestra el mensaje de "vacio" en vez de las tarjetas
    if (boletos.length === 0) {
        contenedor.innerHTML = "";
        estadoVacio.classList.remove("d-none");
        return;
    }

    estadoVacio.classList.add("d-none");

    // Genera una tarjeta por cada boleto (imagen, datos, botones editar/cancelar)
    contenedor.innerHTML = boletos
        .map((boleto) => `
      <div class="col-12 col-md-6 col-lg-4">
        <div class="card-uv h-100 p-3 d-flex flex-column">
          <div class="d-flex gap-3">
            <img src="${getPosterUrl(boleto.poster)}" alt="Póster de ${boleto.movieTitle}"
                 style="width: 70px; height: 105px; object-fit: cover; border-radius: 8px;">
            <div>
              <h6 class="mb-1">${boleto.movieTitle}</h6>
              <small class="text-secondary d-block">${boleto.funcion}</small>
              <small class="text-secondary d-block">Asientos: ${boleto.asientos.join(", ")}</small>
              <small class="text-secondary d-block">${boleto.comprador.nombre}</small>
            </div>
          </div>
          <p class="mt-3 mb-2 fw-semibold" style="color: var(--uv-blue-glow);">
            Total: $${boleto.total.toLocaleString("es-CO")}
          </p>
          <div class="mt-auto d-flex gap-2">
            <button class="btn-uv-outline btn-sm flex-fill" onclick="abrirModalEditar(${boleto.id})">Editar</button>
            <button class="btn btn-outline-danger btn-sm flex-fill" onclick="abrirModalEliminar(${boleto.id})">Cancelar</button>
          </div>
        </div>
      </div>`)
        .join("");
}

// Abre el modal de edición precargado con los datos del boleto 
function abrirModalEditar(id) {
    const boleto = obtenerBoletoPorId(id); // Busca el boleto exacto por su id
    if (!boleto) return;

    // Rellena los campos del formulario con los datos actuales del boleto
    document.getElementById("editarId").value = boleto.id;
    document.getElementById("editarFuncion").value = boleto.funcion;
    document.getElementById("editarNombre").value = boleto.comprador.nombre;
    document.getElementById("editarEmail").value = boleto.comprador.email;

    modalEditar.show();
}

// Guarda los cambios hechos en el modal de edición 
function guardarEdicion(evento) {
    evento.preventDefault();

    const id = Number(document.getElementById("editarId").value); // El input guarda el id como texto, se convierte a número
    const nombre = document.getElementById("editarNombre").value.trim();
    const email = document.getElementById("editarEmail").value.trim();
    const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // Validación simple: si falla, avisa por toast y no continúa
    if (nombre.length < 3 || !regexEmail.test(email)) {
        mostrarToast("Revisa el nombre y el correo antes de guardar.");
        return;
    }

    // Trae el boleto original y le sobreescribe solo los campos editables
    const boleto = obtenerBoletoPorId(id);
    boleto.funcion = document.getElementById("editarFuncion").value;
    boleto.comprador.nombre = nombre;
    boleto.comprador.email = email;

    actualizarBoleto(boleto); // Guarda el cambio en LocalStorage (crud.js)
    modalEditar.hide();
    pintarBoletos();          // Vuelve a dibujar la lista con el dato actualizado
    mostrarToast("Reserva actualizada correctamente.");
}

/** Guarda el id pendiente de eliminar y abre el modal de confirmación */
function abrirModalEliminar(id) {
    idAEliminar = id; // Se guarda en la variable global para usarlo luego, al confirmar
    modalEliminar.show();
}

/** Elimina el boleto confirmado */
function confirmarEliminacion() {
    if (idAEliminar === null) return;
    eliminarBoleto(idAEliminar); // Borra de LocalStorage (crud.js)
    idAEliminar = null;          // Limpia la variable para el próximo uso
    modalEliminar.hide();
    pintarBoletos();
    mostrarToast("Reserva cancelada.");
}

/** Muestra el Toast con un mensaje dado */
function mostrarToast(mensaje) {
    document.getElementById("toastMensaje").textContent = mensaje;
    toastNotificacion.show();
}