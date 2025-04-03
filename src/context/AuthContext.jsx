"use client";

import { createContext, useState, useEffect, useContext } from "react";
import { useRouter, usePathname } from "next/navigation";

export const AuthContext = createContext();

export default function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  // Función para determinar si se debe mostrar el navbar
  const shouldShowNavbar = () => {
    // Si el usuario está autenticado, siempre mostrar el navbar excepto en rutas específicas
    if (isAuthenticated && user) {
      // Lista de rutas donde no queremos mostrar el navbar incluso si el usuario está autenticado
      const excludedRoutes = ["/login", "/register", "/"];

      return !excludedRoutes.includes(pathname);
    }

    // Si no está autenticado, no mostrar el navbar
    return false;
  };

  // Función para obtener la ruta de inicio según el rol del usuario
  const getHomeRouteByRole = (role) => {
    const normalizedRole = role?.toLowerCase() || "";

    switch (normalizedRole) {
      case "admin":
      case "administrador":
        return "/dashboard";
      case "subadmin":
        return "/subadmin";
      case "security":
        return "/security";
      default:
        // Para cualquier otro rol, redirigir a una página genérica
        return "/user-home";
    }
  };

  // Función para iniciar sesión
  const login = async (credentials) => {
    try {
      setLoading(true);
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Error al iniciar sesión");
      }

      // Añadir logs para depuración
      console.log("Login successful, user data:", data.user);
      console.log("User role:", data.user.role);

      setIsAuthenticated(true);
      setUser(data.user);

      // Redirección basada en el rol del usuario
      const userRole = data.user.role?.toLowerCase() || "";
      const homeRoute = getHomeRouteByRole(userRole);

      console.log(`Redirecting user with role '${userRole}' to ${homeRoute}`);

      // Usar el router de Next.js para la redirección
      router.push(homeRoute);

      return true;
    } catch (error) {
      console.error("Error al iniciar sesión:", error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Función para registrar usuario
  const register = async (userData) => {
    try {
      setLoading(true);
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Error al registrar usuario");
      }

      setIsAuthenticated(true);
      setUser(data.user);

      // Redirección basada en el rol después del registro
      const homeRoute = getHomeRouteByRole(data.user.role);
      router.push(homeRoute);

      return true;
    } catch (error) {
      console.error("Error al registrar usuario:", error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Función para cerrar sesión
  const logout = async () => {
    try {
      setLoading(true);
      await fetch("/api/auth/logout", {
        method: "POST",
      });

      setIsAuthenticated(false);
      setUser(null);

      // Redirección automática al login usando el router
      router.push("/login");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
      // Incluso si hay un error, intentamos limpiar el estado y redirigir
      setIsAuthenticated(false);
      setUser(null);
      router.push("/login");
    } finally {
      setLoading(false);
    }
  };

  // Verificar si el usuario ya está autenticado al cargar la página
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Verificar si estamos en una página de login o registro
        const isPublicRoute =
          pathname === "/login" || pathname === "/register" || pathname === "/";

        // Obtener el estado de autenticación actual
        const response = await fetch("/api/auth/me");

        if (response.ok) {
          const data = await response.json();
          console.log("User authenticated:", data.user);
          setIsAuthenticated(true);
          setUser(data.user);

          // Si el usuario está autenticado y está en una ruta pública, redirigir al dashboard
          if (isPublicRoute) {
            const homeRoute = getHomeRouteByRole(data.user.role);
            router.push(homeRoute);
            return;
          }

          // Verificar si el usuario está intentando acceder a una ruta para la que no tiene permisos
          const userRole = data.user.role?.toLowerCase() || "";

          // Verificar acceso a rutas protegidas
          if (
            (pathname.startsWith("/dashboard") &&
              userRole !== "admin" &&
              userRole !== "administrador") ||
            (pathname.startsWith("/subadmin") && userRole !== "subadmin") ||
            (pathname.startsWith("/security") && userRole !== "security")
          ) {
            console.log(
              "User trying to access unauthorized route. Redirecting to appropriate home."
            );
            const homeRoute = getHomeRouteByRole(userRole);
            router.push(homeRoute);
          }
        } else {
          // Si la respuesta no es ok, asegurarnos de que el estado refleje que no estamos autenticados
          console.log("User not authenticated");
          setIsAuthenticated(false);
          setUser(null);

          // Si no estamos en una ruta pública y no estamos autenticados, redirigir al login
          if (!isPublicRoute) {
            router.push("/login");
          }
        }
      } catch (error) {
        console.error("Error al verificar autenticación:", error);
        setIsAuthenticated(false);
        setUser(null);

        // Si hay un error y no estamos en una ruta pública, redirigir al login
        const isPublicRoute =
          pathname === "/login" || pathname === "/register" || pathname === "/";

        if (!isPublicRoute) {
          router.push("/login");
        }
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [pathname, router]);

  // Valor para depuración
  console.log("Auth context state:", {
    isAuthenticated,
    user,
    loading,
    pathname,
  });

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        login,
        logout,
        register,
        loading,
        shouldShowNavbar,
        getHomeRouteByRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Hook personalizado para usar el contexto de autenticación
export const useAuth = () => useContext(AuthContext);
