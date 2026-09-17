function PedidoCard({ pedido }) {
  return (
    <div>

      <h3>
        👤 {pedido.nombre}
      </h3>

      <p className="order-info">
        📍 <strong>Dirección:</strong>{" "}
        {pedido.direccion}
      </p>

      <p className="order-info">
        📱 <strong>Teléfono:</strong>{" "}
        {pedido.telefono}
      </p>

      <p className="order-info">
        🛵 <strong>Pedido:</strong>{" "}
        {pedido.pedido}
      </p>

    </div>
  );
}

export default PedidoCard;