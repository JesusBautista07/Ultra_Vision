// Lógica exclusiva de pages/mis-boletos.html

let idBoletoAEliminar = null;

document.addEventListener("DOMContentLoaded", () => {
  pintarBoletos();

  document.getElementById("formEditar").addEventListener("submit", guardarEdicion);
  document.getElementById("btnConfirmarEliminar").addEventListener("click", confirmarEliminacion);
});

// Lee los boletos guardados y dibuja una card por cada uno (o el estado vacío)
function pintarBoletos() {
  const boletos = obtenerBoletos();
  const contenedor = document.getElementById("contenedorBoletos");
  const estadoVacio = document.getElementById("estadoVacio");

  if (boletos.length === 0) {
    contenedor.innerHTML = "";
    estadoVacio.classList.remove("d-none");
    return;
  }

  estadoVacio.classList.add("d-none");
  contenedor.innerHTML = boletos.map((boleto) => boletoCardHTML(boleto)).join("");
  activarBotonesDeCards();
}

// HTML de una card de boleto reservado
function boletoCardHTML(boleto) {
  return `
    <div class="col-12 col-md-6 col-lg-4">
      <div class="card-uv h-100 p-3">
        <h5 class="mb-1">${boleto.movieTitle}</h5>
        <p class="text-secondary small mb-2">${boleto.funcion}</p>
        <p class="mb-1">Asientos: <strong>${boleto.asientos.join(", ")}</strong></p>
        <p class="mb-1">Comprador: ${boleto.comprador.nombre}</p>
        <p class="mb-3">Total: <strong>$${boleto.total.toLocaleString("es-CO")}</strong></p>
        <div class="d-flex gap-2 mt-auto">
          <button class="btn-uv-outline btn-editar" data-id="${boleto.id}">Editar</button>
          <button class="btn btn-outline-danger btn-eliminar" data-id="${boleto.id}">Cancelar</button>
        </div>
      </div>
    </div>`;
}

// Conecta los botones "Editar" y "Cancelar" de cada card recién pintada
function activarBotonesDeCards() {
  document.querySelectorAll(".btn-editar").forEach((boton) => {
    boton.addEventListener("click", () => abrirModalEditar(Number(boton.dataset.id)));
  });

  document.querySelectorAll(".btn-eliminar").forEach((boton) => {
    boton.addEventListener("click", () => abrirModalEliminar(Number(boton.dataset.id)));
  });
}

// Llena el formulario del modal con los datos actuales del boleto
function abrirModalEditar(id) {
  const boleto = obtenerBoletoPorId(id);
  if (!boleto) return;

  document.getElementById("editarId").value = boleto.id;
  document.getElementById("editarFuncion").value = boleto.funcion;
  document.getElementById("editarNombre").value = boleto.comprador.nombre;
  document.getElementById("editarEmail").value = boleto.comprador.email;

  new bootstrap.Modal(document.getElementById("modalEditar")).show();
}

// Toma los valores del formulario, actualiza el boleto y refresca la lista
function guardarEdicion(evento) {
  evento.preventDefault();

  const id = Number(document.getElementById("editarId").value);
  const boleto = obtenerBoletoPorId(id);
  if (!boleto) return;

  boleto.funcion = document.getElementById("editarFuncion").value;
  boleto.comprador.nombre = document.getElementById("editarNombre").value.trim();
  boleto.comprador.email = document.getElementById("editarEmail").value.trim();

  actualizarBoleto(boleto);
  bootstrap.Modal.getInstance(document.getElementById("modalEditar")).hide();
  mostrarToast("Reserva actualizada correctamente.");
  pintarBoletos();
}

// Guarda qué boleto se va a eliminar y abre el modal de confirmación
function abrirModalEliminar(id) {
  idBoletoAEliminar = id;
  new bootstrap.Modal(document.getElementById("modalEliminar")).show();
}

// Se ejecuta al confirmar en el modal: elimina el boleto y refresca la lista
function confirmarEliminacion() {
  if (idBoletoAEliminar === null) return;

  eliminarBoleto(idBoletoAEliminar);
  idBoletoAEliminar = null;

  bootstrap.Modal.getInstance(document.getElementById("modalEliminar")).hide();
  mostrarToast("Reserva cancelada.");
  pintarBoletos();
}

// Muestra el toast de Bootstrap con el mensaje indicado
function mostrarToast(mensaje) {
  document.getElementById("toastMensaje").textContent = mensaje;
  new bootstrap.Toast(document.getElementById("toastNotificacion")).show();
}