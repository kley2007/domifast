import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";

function Dashboard() {
  const { usuario, logout } = useAuth();

  // API PÚBLICA DE RENDER
  const API_URL = "https://domifast-api.onrender.com/contactos";

  const [pedidos, setPedidos] = useState([]);
  const [vista, setVista] = useState("registrar");

  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState("");

  const [busqueda, setBusqueda] = useState("");
  const [orden, setOrden] = useState("az");

  const [editando, setEditando] = useState(null);
  const [guardando, setGuardando] = useState(false);

  const [formulario, setFormulario] = useState({
    nombre: "",
    direccion: "",
    telefono: "",
    pedido: ""
  });

  const [errores, setErrores] = useState({});

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

  const cargarPedidos = async () => {
    try {
      setCargando(true);
      setMensaje("");

      const respuesta = await fetch(API_URL);

      if (!respuesta.ok) {
        throw new Error("Error al consultar la API");
      }

      const datos = await respuesta.json();

      setPedidos(
        Array.isArray(datos) ? datos : []
      );
    } catch (error) {
      console.error(error);

      setMensaje(
        "❌ No se pudieron cargar los pedidos. Verifica la conexión con el servidor."
      );
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarPedidos();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    let nuevoValor = value;

    if (name === "telefono") {
      nuevoValor = formatearTelefono(value);
    }

    setFormulario({
      ...formulario,
      [name]: nuevoValor
    });

    setErrores({
      ...errores,
      [name]: ""
    });

    setMensaje("");
  };

  const validarFormulario = () => {
    const nuevosErrores = {};

    const nombre =
      formulario.nombre.trim();

    const direccion =
      formulario.direccion.trim();

    const telefono =
      formulario.telefono.replace(/\D/g, "");

    const pedido =
      formulario.pedido.trim();

    if (!nombre) {
      nuevosErrores.nombre =
        "El nombre es obligatorio.";
    } else if (nombre.length < 3) {
      nuevosErrores.nombre =
        "El nombre debe tener al menos 3 caracteres.";
    } else if (
      !/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(nombre)
    ) {
      nuevosErrores.nombre =
        "El nombre solo puede contener letras.";
    }

    if (!direccion) {
      nuevosErrores.direccion =
        "La dirección es obligatoria.";
    } else if (direccion.length < 5) {
      nuevosErrores.direccion =
        "Ingresa una dirección válida.";
    }

    if (!telefono) {
      nuevosErrores.telefono =
        "El teléfono es obligatorio.";
    } else if (telefono.length !== 10) {
      nuevosErrores.telefono =
        "El teléfono debe tener 10 dígitos.";
    }

    if (!pedido) {
      nuevosErrores.pedido =
        "Debes ingresar el pedido.";
    } else if (pedido.length < 3) {
      nuevosErrores.pedido =
        "Describe brevemente el pedido.";
    }

    setErrores(nuevosErrores);

    return Object.keys(nuevosErrores).length === 0;
  };

  const registrarPedido = async (e) => {
    e.preventDefault();

    setMensaje("");

    if (!validarFormulario()) {
      setMensaje(
        "⚠️ Revisa los campos marcados."
      );
      return;
    }

    try {
      setGuardando(true);

      const nuevoPedido = {
        nombre:
          formulario.nombre.trim(),

        direccion:
          formulario.direccion.trim(),

        telefono:
          formulario.telefono,

        pedido:
          formulario.pedido.trim()
      };

      const respuesta = await fetch(
        API_URL,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json"
          },
          body:
            JSON.stringify(nuevoPedido)
        }
      );

      if (!respuesta.ok) {
        throw new Error(
          "No se pudo registrar"
        );
      }

      const creado =
        await respuesta.json();

      setPedidos((actuales) => [
        ...actuales,
        creado
      ]);

      setFormulario({
        nombre: "",
        direccion: "",
        telefono: "",
        pedido: ""
      });

      setErrores({});

      setMensaje(
        "✅ Pedido registrado correctamente."
      );

      setVista("administrar");
    } catch (error) {
      console.error(error);

      setMensaje(
        "❌ No se pudo registrar el pedido."
      );
    } finally {
      setGuardando(false);
    }
  };

  const comenzarEdicion = (pedido) => {
    console.log(
      "Pedido seleccionado para editar:",
      pedido
    );

    setEditando({
      id: pedido.id,

      nombre: String(
        pedido.nombre ?? ""
      ),

      direccion: String(
        pedido.direccion ?? ""
      ),

      telefono: formatearTelefono(
        String(pedido.telefono ?? "")
      ),

      pedido: String(
        pedido.pedido ?? ""
      )
    });

    setMensaje("");
  };

  const cambiarTelefonoEdicion = (e) => {
    setEditando((actual) => ({
      ...actual,
      telefono: formatearTelefono(
        e.target.value
      )
    }));

    setMensaje("");
  };

  const guardarEdicion = async () => {
    if (!editando) {
      return;
    }

    const nombre =
      String(editando.nombre || "").trim();

    const direccion =
      String(editando.direccion || "").trim();

    const telefonoNumeros =
      String(editando.telefono || "")
        .replace(/\D/g, "");

    const telefono =
      formatearTelefono(
        editando.telefono
      );

    const pedido =
      String(editando.pedido || "").trim();

    if (!nombre) {
      setMensaje(
        "⚠️ El nombre es obligatorio."
      );
      return;
    }

    if (nombre.length < 3) {
      setMensaje(
        "⚠️ El nombre debe tener al menos 3 caracteres."
      );
      return;
    }

    if (
      !/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(nombre)
    ) {
      setMensaje(
        "⚠️ El nombre solo puede contener letras."
      );
      return;
    }

    if (!direccion) {
      setMensaje(
        "⚠️ La dirección es obligatoria."
      );
      return;
    }

    if (direccion.length < 5) {
      setMensaje(
        "⚠️ Ingresa una dirección válida."
      );
      return;
    }

    if (telefonoNumeros.length !== 10) {
      setMensaje(
        "⚠️ El teléfono debe tener 10 dígitos."
      );
      return;
    }

    if (!pedido) {
      setMensaje(
        "⚠️ El pedido es obligatorio."
      );
      return;
    }

    try {
      setGuardando(true);
      setMensaje("");

      const datos = {
        nombre,
        direccion,
        telefono,
        pedido
      };

      const respuesta = await fetch(
        `${API_URL}/${editando.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type":
              "application/json"
          },
          body: JSON.stringify(datos)
        }
      );

      if (!respuesta.ok) {
        throw new Error(
          "No se pudo actualizar"
        );
      }

      const actualizado =
        await respuesta.json();

      setPedidos((actuales) =>
        actuales.map((item) =>
          String(item.id) ===
          String(actualizado.id)
            ? actualizado
            : item
        )
      );

      setEditando(null);

      setMensaje(
        "✅ Pedido actualizado correctamente."
      );
    } catch (error) {
      console.error(error);

      setMensaje(
        "❌ No se pudo actualizar el pedido."
      );
    } finally {
      setGuardando(false);
    }
  };

  const eliminarPedido = async (id) => {
    const confirmar =
      window.confirm(
        "¿Estás seguro de que deseas eliminar este pedido?"
      );

    if (!confirmar) {
      return;
    }

    try {
      const respuesta = await fetch(
        `${API_URL}/${id}`,
        {
          method: "DELETE"
        }
      );

      if (!respuesta.ok) {
        throw new Error(
          "No se pudo eliminar"
        );
      }

      setPedidos((actuales) =>
        actuales.filter(
          (item) =>
            String(item.id) !==
            String(id)
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

  const pedidosFiltrados =
    [...pedidos]
      .filter((pedido) =>
        String(
          pedido.nombre || ""
        )
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

  return (
    <div className="dashboard-page">

      <nav className="navbar">

        <div className="navbar-brand">
          Domi<span>Fast</span> 🚚
        </div>

        <div className="user-area">

          <span>
            👤 {usuario}
          </span>

          <button
            type="button"
            className="logout-button"
            onClick={logout}
          >
            Cerrar sesión
          </button>

        </div>

      </nav>

      <main className="dashboard-content">

        <section className="welcome-section">

          <h1>
            Panel de administración
          </h1>

          <p>
            Administra los pedidos de tus
            clientes de manera rápida y
            organizada.
          </p>

        </section>

        <div className="dashboard-tabs">

          <button
            type="button"
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
            type="button"
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

        {vista === "registrar" && (

          <section className="card">

            <h2 className="card-title">
              📝 Registrar nuevo pedido
            </h2>

            <p className="section-description">
              Ingresa los datos del cliente y
              del pedido que será gestionado.
            </p>

            <form
              onSubmit={
                registrarPedido
              }
            >

              <div className="form-group">

                <label>
                  Nombre del cliente
                </label>

                <input
                  className={
                    errores.nombre
                      ? "form-input input-error"
                      : "form-input"
                  }
                  type="text"
                  name="nombre"
                  value={
                    formulario.nombre
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="Ej. Carlos Pérez"
                />

                {errores.nombre && (
                  <small className="field-error">
                    ⚠️ {errores.nombre}
                  </small>
                )}

              </div>

              <div className="form-group">

                <label>
                  Dirección
                </label>

                <input
                  className={
                    errores.direccion
                      ? "form-input input-error"
                      : "form-input"
                  }
                  type="text"
                  name="direccion"
                  value={
                    formulario.direccion
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="Ej. Carrera 45 #30-20"
                />

                {errores.direccion && (
                  <small className="field-error">
                    ⚠️ {errores.direccion}
                  </small>
                )}

              </div>

              <div className="form-group">

                <label>
                  Teléfono
                </label>

                <input
                  className={
                    errores.telefono
                      ? "form-input input-error"
                      : "form-input"
                  }
                  type="text"
                  name="telefono"
                  value={
                    formulario.telefono
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="300 456 2137"
                  inputMode="numeric"
                  maxLength="12"
                />

                <small className="input-help">
                  Formato: 300 456 2137
                </small>

                {errores.telefono && (
                  <small className="field-error">
                    ⚠️ {errores.telefono}
                  </small>
                )}

              </div>

              <div className="form-group">

                <label>
                  Pedido
                </label>

                <textarea
                  className={
                    errores.pedido
                      ? "form-input input-error"
                      : "form-input"
                  }
                  name="pedido"
                  value={
                    formulario.pedido
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="Ej. 2 hamburguesas y 1 gaseosa"
                  rows="4"
                />

                {errores.pedido && (
                  <small className="field-error">
                    ⚠️ {errores.pedido}
                  </small>
                )}

              </div>

              <button
                className="primary-button"
                type="submit"
                disabled={guardando}
              >
                {guardando
                  ? "⏳ Registrando..."
                  : "🚚 Registrar pedido"}
              </button>

            </form>

          </section>

        )}

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
                      className="order-card"
                      key={pedido.id}
                    >

                      {editando &&
                      String(editando.id) ===
                      String(pedido.id) ? (

                        <div>

                          <h3>
                            ✏️ Editar pedido
                          </h3>

                          <div className="edit-form">

                            <label>
                              Nombre
                            </label>

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
                            />

                            <label>
                              Dirección
                            </label>

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
                            />

                            <label>
                              Teléfono
                            </label>

                            <input
                              type="text"
                              value={
                                editando.telefono
                              }
                              onChange={
                                cambiarTelefonoEdicion
                              }
                              inputMode="numeric"
                              maxLength="12"
                              placeholder="300 456 2137"
                            />

                            <small className="input-help">
                              Formato: 300 456 2137
                            </small>

                            <label>
                              Pedido
                            </label>

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
                              rows="4"
                            />

                            <div className="order-actions">

                              <button
                                type="button"
                                className="submit-button"
                                onClick={
                                  guardarEdicion
                                }
                                disabled={
                                  guardando
                                }
                              >
                                {guardando
                                  ? "⏳ Guardando..."
                                  : "💾 Guardar"}
                              </button>

                              <button
                                type="button"
                                className="cancel-button"
                                onClick={() =>
                                  setEditando(
                                    null
                                  )
                                }
                                disabled={
                                  guardando
                                }
                              >
                                Cancelar
                              </button>

                            </div>

                          </div>

                        </div>

                      ) : (

                        <>

                          <h3>
                            👤 {pedido.nombre}
                          </h3>

                          <p className="order-info">
                            📍{" "}
                            <strong>
                              Dirección:
                            </strong>{" "}
                            {pedido.direccion}
                          </p>

                          <p className="order-info">
                            📱{" "}
                            <strong>
                              Teléfono:
                            </strong>{" "}
                            {pedido.telefono}
                          </p>

                          <p className="order-info">
                            🛵{" "}
                            <strong>
                              Pedido:
                            </strong>{" "}
                            {pedido.pedido}
                          </p>

                          <div className="order-actions">

                            <button
                              type="button"
                              className="edit-button"
                              onClick={() =>
                                comenzarEdicion(
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
                                eliminarPedido(
                                  pedido.id
                                )
                              }
                            >
                              🗑️ Eliminar
                            </button>

                          </div>

                        </>

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