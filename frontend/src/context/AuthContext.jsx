import {
  createContext,
  useContext,
  useState
} from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {

  const [usuario, setUsuario] = useState(
    localStorage.getItem(
      "domifast_usuario"
    )
  );

  const login = (
    username,
    password
  ) => {

    if (
      username === "admin" &&
      password === "123456"
    ) {

      localStorage.setItem(
        "domifast_usuario",
        username
      );

      setUsuario(username);

      return true;
    }

    return false;
  };


  const logout = () => {

    localStorage.removeItem(
      "domifast_usuario"
    );

    setUsuario(null);
  };


  return (
    <AuthContext.Provider
      value={{
        usuario,
        login,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}


export function useAuth() {

  return useContext(
    AuthContext
  );
}