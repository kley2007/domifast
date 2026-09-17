import { API_URL } from "../config/api";

const ENDPOINT = `${API_URL}/contactos`;

export async function obtenerPedidos() {
  const respuesta = await fetch(ENDPOINT);

  if (!respuesta.ok) {
    throw new Error("No se pudieron obtener los pedidos.");
  }

  return await respuesta.json();
}

export async function crearPedido(pedido) {
  const respuesta = await fetch(ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(pedido)
  });

  if (!respuesta.ok) {
    throw new Error("No se pudo registrar el pedido.");
  }

  return await respuesta.json();
}

export async function eliminarPedido(id) {
  const respuesta = await fetch(`${ENDPOINT}/${id}`, {
    method: "DELETE"
  });

  if (!respuesta.ok) {
    throw new Error("No se pudo eliminar el pedido.");
  }

  return true;
}

export async function actualizarPedido(id, pedido) {
  const respuesta = await fetch(`${ENDPOINT}/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(pedido)
  });

  if (!respuesta.ok) {
    throw new Error("No se pudo actualizar el pedido.");
  }

  return await respuesta.json();
}