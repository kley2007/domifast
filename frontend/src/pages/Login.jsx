import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [mensaje, setMensaje] = useState("");

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!username.trim() || !password.trim()) {
      setMensaje(
        "⚠️ Por favor, completa todos los campos."
      );
      return;
    }

    const acceso = login(
      username.trim(),
      password
    );

    if (acceso) {
      setMensaje("");
      navigate("/dashboard");
    } else {
      setMensaje(
        "❌ Usuario o contraseña incorrectos."
      );
    }
  };

  return (
    <div className="login-page">

      <div className="login-card">

        <h1 className="logo">
          Domi<span>Fast</span> 🚚
        </h1>

        <p className="login-subtitle">
          Gestor de Pedidos a Domicilio
        </p>

        <form onSubmit={handleSubmit}>

          <div className="form-group">

            <label>
              Usuario
            </label>

            <input
              className="form-input"
              type="text"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                setMensaje("");
              }}
              placeholder="Ingresa tu usuario"
              autoComplete="username"
            />

          </div>


          <div className="form-group">

            <label>
              Contraseña
            </label>

            <input
              className="form-input"
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setMensaje("");
              }}
              placeholder="Ingresa tu contraseña"
              autoComplete="current-password"
            />

          </div>


          {mensaje && (

            <div
              className={
                mensaje.startsWith("❌")
                  ? "error-message"
                  : "error-message"
              }
            >
              {mensaje}
            </div>

          )}


          <button
            className="primary-button"
            type="submit"
          >
            🚀 Iniciar sesión
          </button>

        </form>


        <div className="demo-credentials">

          Usuario: <strong>admin</strong>

          <br />

          Contraseña: <strong>123456</strong>

        </div>

      </div>

    </div>
  );
}

export default Login;