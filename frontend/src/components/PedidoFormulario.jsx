import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import PedidoFormulario from "../components/PedidoFormulario";
import PedidoCard from "../components/PedidoCard";

import {
  obtenerPedidos,
  eliminarPedido,
  actualizarPedido
} from "../services/pedidoService";

function Dashboard() {
  const { usuario, logout } = useAuth();

  const [pedidos, setPedidos] = useState([]);
  const [vista, setVista] = useState("registrar");

  const [busqueda, setBusqueda] = useState("");
  const [orden, setOrden] = useState("az");

  const [cargando, setCargando] = useState(true);
  const [mensaje, setMensaje] = useState("");

  const [editando, setEditando] = useState(null);
  const [guardandoEdicion, setGuardandoEdicion] =
    useState(false);

  /* =========================
     FORMATEAR TELÉFONO
  ========================= */

  const formatearTelefono = (valor) => {
    const numeros = String(valor || "")
      .replace(/\D/g, "")
      .slice(0, 10);

    if (numeros.length <= 3) {
      return numeros;
    }

    if (numeros.length <= 6) {
      return (
        numeros.slice(0, 3) +
        " " +
        numeros.slice(3)
      );
    }

    return (
      numeros.slice(0, 3) +
      " " +
      numeros.slice(3, 6) +
      " " +
      numeros.slice(6)
    );
  };


  /* =========================
     CARGAR PEDIDOS
  ========================= */

  const cargarPedidos = async () => {
    try {
      setCargando(true);

      const datos = await obtenerPedidos();

      setPedidos(datos);

    } catch (error) {

      console.error(error);

      setMensaje(
        "❌ No se pudieron cargar los pedidos."
      );

    } finally {

      setCargando(false);

    }
  };


  useEffect(() => {
    cargarPedidos();
  }, []);


  /* =========================
     PEDIDO CREADO
  ========================= */

  const handlePedidoCreado = (nuevoPedido) => {

    setPedidos((pedidosActuales) => [
      ...pedidosActuales,
      nuevoPedido
    ]);

    setMensaje(
      "✅ Pedido registrado correctamente."
    );

    setVista("administrar");
  };


  /* =========================
     ELIMINAR
  ========================= */

  const handleEliminar = async (id) => {

    const confirmar = window.confirm(
      "¿Estás seguro de que deseas eliminar este pedido?"
    );

    if (!confirmar) {
      return;
    }

    try {

      await eliminarPedido(id);

      setPedidos((pedidosActuales) =>
        pedidosActuales.filter(
          (pedido) => pedido.id !== id
        )
      );

      setMensaje(
        "✅ Pedido eliminado correctamente."
      );

    } catch (error) {

      console.error(error);

      setMensaje(
        "❌ No se pudo eliminar el pedido."
      );

    }
  };


  /* =========================
     INICIAR EDICIÓN
  ========================= */

  const handleEditar = (pedido) => {

    console.log(
      "Editando pedido:",
      pedido
    );

    setEditando({
      id: pedido.id,

      nombre:
        String(pedido.nombre || ""),

      direccion:
        String(pedido.direccion || ""),

      telefono:
        formatearTelefono(
          pedido.telefono
        ),

      pedido:
        String(pedido.pedido || "")
    });

    setMensaje("");
  };


  /* =========================
     CANCELAR EDICIÓN
  ========================= */

  const handleCancelarEdicion = () => {

    if (guardandoEdicion) {
      return;
    }

    setEditando(null);
    setMensaje("");
  };


  /* =========================
     CAMBIAR TELÉFONO
  ========================= */

  const handleTelefonoEdicion = (e) => {

    const valor = e.target.value;

    const telefonoFormateado =
      formatearTelefono(valor);

    setEditando((actual) => ({
      ...actual,
      telefono: telefonoFormateado
    }));

    setMensaje("");
  };


  /* =========================
     GUARDAR EDICIÓN
  ========================= */

  const handleGuardarEdicion = async () => {

    if (!editando) {
      return;
    }

    const nombre =
      String(editando.nombre || "")
        .trim();

    const direccion =
      String(editando.direccion || "")
        .trim();

    const telefono =
      String(editando.telefono || "")
        .replace(/\D/g, "");

    const pedido =
      String(editando.pedido || "")
        .trim();


    /* CAMPOS VACÍOS */

    if (!nombre) {

      setMensaje(
        "⚠️ El nombre es obligatorio."
      );

      return;
    }

    if (!direccion) {

      setMensaje(
        "⚠️ La dirección es obligatoria."
      );

      return;
    }

    if (!telefono) {

      setMensaje(
        "⚠️ El teléfono es obligatorio."
      );

      return;
    }

    if (!pedido) {

      setMensaje(
        "⚠️ El pedido es obligatorio."
      );

      return;
    }


    /* NOMBRE */

    if (nombre.length < 3) {

      setMensaje(
        "⚠️ El nombre debe tener al menos 3 caracteres."
      );

      return;
    }

    if (
      !/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(
        nombre
      )
    ) {

      setMensaje(
        "⚠️ El nombre solo puede contener letras."
      );

      return;
    }


    /* DIRECCIÓN */

    if (direccion.length < 5) {

      setMensaje(
        "⚠️ Ingresa una dirección válida."
      );

      return;
    }


    /* TELÉFONO */

    if (telefono.length !== 10) {

      setMensaje(
        "⚠️ El teléfono debe tener 10 dígitos."
      );

      return;
    }


    /* PEDIDO */

    if (pedido.length < 3) {

      setMensaje(
        "⚠️ Describe brevemente el pedido."
      );

      return;
    }


    /* ACTUALIZAR */

    try {

      setGuardandoEdicion(true);
      setMensaje("");

      const datosActualizados = {
        nombre,
        direccion,
        telefono,
        pedido
      };

      console.log(
        "Enviando actualización:",
        datosActualizados
      );

      const actualizado =
        await actualizarPedido(
          editando.id,
          datosActualizados
        );

      setPedidos((pedidosActuales) =>
        pedidosActuales.map(
          (pedidoActual) =>
            String(pedidoActual.id) ===
            String(actualizado.id)
              ? actualizado
              : pedidoActual
        )
      );

      setEditando(null);

      setMensaje(
        "✅ Pedido actualizado correctamente."
      );

    } catch (error) {

      console.error(
        "Error actualizando:",
        error
      );

      setMensaje(
        "❌ No se pudo actualizar el pedido."
      );

    } finally {

      setGuardandoEdicion(false);

    }
  };


  /* =========================
     FILTRAR Y ORDENAR
  ========================= */

  const pedidosFiltrados =
    [...pedidos]
      .filter((pedido) =>
        String(pedido.nombre || "")
          .toLowerCase()
          .includes(
            busqueda.toLowerCase()
          )
      )
      .sort((a, b) => {

        const resultado =
          String(a.nombre || "")
            .localeCompare(
              String(b.nombre || "")
            );

        return orden === "az"
          ? resultado
          : -resultado;
      });


  /* =========================
     INTERFAZ
  ========================= */

  return (
    <div className="dashboard-page">

      {/* NAVBAR */}

      <nav className="navbar">

        <div className="navbar-brand">
          Domi<span>Fast</span> 🚚
        </div>

        <div className="user-area">

          <span>
            👤 {usuario}
          </span>

          <button
            className="logout-button"
            onClick={logout}
          >
            Cerrar sesión
          </button>

        </div>

      </nav>


      {/* CONTENIDO */}

      <main className="dashboard-content">

        <section className="welcome-section">

          <h1>
            Panel de administración
          </h1>

          <p>
            Administra los pedidos de tus clientes
            de manera rápida y organizada.
          </p>

        </section>


        {/* PESTAÑAS */}

        <div className="dashboard-tabs">

          <button
            className={
              vista === "registrar"
                ? "tab-button active"
                : "tab-button"
            }
            onClick={() => {

              setVista("registrar");
              setMensaje("");

            }}
          >
            📝 Registrar pedido
          </button>

          <button
            className={
              vista === "administrar"
                ? "tab-button active"
                : "tab-button"
            }
            onClick={() => {

              setVista("administrar");
              setMensaje("");

            }}
          >
            📋 Administrar pedidos
          </button>

        </div>


        {/* MENSAJE */}

        {mensaje && (

          <div
            className={
              mensaje.startsWith("❌") ||
              mensaje.startsWith("⚠️")
                ? "error-message"
                : "success-message"
            }
          >
            {mensaje}
          </div>

        )}


        {/* REGISTRAR */}

        {vista === "registrar" && (

          <section className="card">

            <h2 className="card-title">
              📝 Registrar nuevo pedido
            </h2>

            <p className="section-description">
              Ingresa los datos del cliente y del
              pedido que será gestionado.
            </p>

            <PedidoFormulario
              onPedidoCreado={
                handlePedidoCreado
              }
            />

          </section>

        )}


        {/* ADMINISTRAR */}

        {vista === "administrar" && (

          <section className="card">

            <div className="management-header">

              <div>

                <h2>
                  📋 Pedidos registrados
                </h2>

                <p>
                  Total: {pedidos.length} pedidos
                </p>

              </div>


              <div className="search-controls">

                <input
                  className="search-input"
                  type="text"
                  placeholder="🔎 Buscar cliente..."
                  value={busqueda}
                  onChange={(e) =>
                    setBusqueda(
                      e.target.value
                    )
                  }
                />

                <select
                  className="sort-select"
                  value={orden}
                  onChange={(e) =>
                    setOrden(
                      e.target.value
                    )
                  }
                >

                  <option value="az">
                    A - Z
                  </option>

                  <option value="za">
                    Z - A
                  </option>

                </select>

              </div>

            </div>


            {/* CARGANDO */}

            {cargando ? (

              <div className="loading">
                ⏳ Cargando pedidos...
              </div>

            ) : pedidosFiltrados.length === 0 ? (

              <div className="loading">
                📭 No se encontraron pedidos.
              </div>

            ) : (

              <div className="orders-grid">

                {pedidosFiltrados.map(
                  (pedido) => (

                    <div
                      key={pedido.id}
                    >

                      {editando &&
                      String(editando.id) ===
                      String(pedido.id) ? (

                        /* =================
                           EDITAR
                        ================= */

                        <div className="order-card">

                          <h3>
                            ✏️ Editar pedido
                          </h3>

                          <div className="edit-form">

                            {/* NOMBRE */}

                            <input
                              type="text"
                              value={
                                editando.nombre
                              }
                              onChange={(e) =>
                                setEditando({
                                  ...editando,
                                  nombre:
                                    e.target.value
                                })
                              }
                              placeholder="Nombre"
                            />


                            {/* DIRECCIÓN */}

                            <input
                              type="text"
                              value={
                                editando.direccion
                              }
                              onChange={(e) =>
                                setEditando({
                                  ...editando,
                                  direccion:
                                    e.target.value
                                })
                              }
                              placeholder="Dirección"
                            />


                            {/* TELÉFONO */}

                            <input
                              type="text"
                              value={
                                editando.telefono
                              }
                              onChange={
                                handleTelefonoEdicion
                              }
                              placeholder="300 456 2137"
                              inputMode="numeric"
                              maxLength="12"
                            />

                            <small className="input-help">
                              Escribe los números y los espacios se agregan automáticamente.
                            </small>


                            {/* PEDIDO */}

                            <textarea
                              value={
                                editando.pedido
                              }
                              onChange={(e) =>
                                setEditando({
                                  ...editando,
                                  pedido:
                                    e.target.value
                                })
                              }
                              placeholder="Pedido"
                            />


                            {/* BOTONES */}

                            <div className="order-actions">

                              <button
                                type="button"
                                className="submit-button"
                                onClick={
                                  handleGuardarEdicion
                                }
                                disabled={
                                  guardandoEdicion
                                }
                              >
                                {guardandoEdicion
                                  ? "⏳ Guardando..."
                                  : "💾 Guardar"}
                              </button>

                              <button
                                type="button"
                                className="cancel-button"
                                onClick={
                                  handleCancelarEdicion
                                }
                                disabled={
                                  guardandoEdicion
                                }
                              >
                                Cancelar
                              </button>

                            </div>

                          </div>

                        </div>

                      ) : (

                        /* =================
                           PEDIDO
                        ================= */

                        <div className="order-card">

                          <PedidoCard
                            pedido={pedido}
                          />

                          <div className="order-actions">

                            <button
                              type="button"
                              className="edit-button"
                              onClick={() =>
                                handleEditar(
                                  pedido
                                )
                              }
                            >
                              ✏️ Editar
                            </button>

                            <button
                              type="button"
                              className="delete-button"
                              onClick={() =>
                                handleEliminar(
                                  pedido.id
                                )
                              }
                            >
                              🗑️ Eliminar
                            </button>

                          </div>

                        </div>

                      )}

                    </div>

                  )
                )}

              </div>

            )}

          </section>

        )}

      </main>

    </div>
  );
}

export default Dashboard;