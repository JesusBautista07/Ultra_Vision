// CRUD de boletos reservados usando LocalStorage.
// Usado por: reservas.html (crear) y mis-boletos.html (leer/eliminar)

const CLAVE_BOLETOS = "uv-boletos";

// Devuelve todos los boletos guardados
function obtenerBoletos() {
    return JSON.parse(localStorage.getItem(CLAVE_BOLETOS) || "[]");
}

// Guarda un boleto nuevo. Genera un id único basado en la fecha/hora actual
function crearBoleto(boleto) {
    const boletos = obtenerBoletos();
    boleto.id = Date.now();
    boletos.push(boleto);
    localStorage.setItem(CLAVE_BOLETOS, JSON.stringify(boletos));
    return boleto;
}

// Busca un boleto por su id
function obtenerBoletoPorId(id) {
    return obtenerBoletos().find((b) => b.id === id);
}

// Actualiza un boleto existente (usado por el modal de editar)
function actualizarBoleto(boletoActualizado) {
    const boletos = obtenerBoletos().map((b) =>
        b.id === boletoActualizado.id ? boletoActualizado : b
    );
    localStorage.setItem(CLAVE_BOLETOS, JSON.stringify(boletos));
}

// Elimina un boleto por id
function eliminarBoleto(id) {
    const boletos = obtenerBoletos().filter((b) => b.id !== id);
    localStorage.setItem(CLAVE_BOLETOS, JSON.stringify(boletos));
}