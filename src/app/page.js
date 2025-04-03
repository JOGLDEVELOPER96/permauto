"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const { isAuthenticated, user, loading } = useAuth();
  const router = useRouter();

  // Redirigir a usuarios autenticados a su página correspondiente
  useEffect(() => {
    if (!loading && isAuthenticated && user) {
      const userRole = user.role?.toLowerCase() || "";

      if (userRole === "admin" || userRole === "administrador") {
        router.push("/dashboard");
      } else if (userRole === "subadmin") {
        router.push("/subadmin");
      } else if (userRole === "security") {
        router.push("/security");
      } else {
        router.push("/user-home");
      }
    }
  }, [isAuthenticated, loading, router, user]);

  // Si está cargando o el usuario está autenticado, mostrar un indicador de carga
  if (loading || isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white mx-auto"></div>
          <p className="mt-4 text-lg">Cargando...</p>
        </div>
      </div>
    );
  }

  // Si el usuario no está autenticado, mostrar la página de bienvenida
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-4">
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden max-w-2xl w-full">
        <div className="p-8 text-center">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Autorizaciones y Permisos
          </h1>
          <p className="text-gray-600 mb-8">
            Es necesario logearte para acceder a la aplicación. Si no tienes una
            cuenta, puedes registrarte. Sino comunicate con el administrador.
            Atte: El equipo de desarrollo.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/login"
              className="inline-flex justify-center py-3 px-6 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
            >
              Iniciar sesión
            </Link>
            <Link
              href="/register"
              className="inline-flex justify-center py-3 px-6 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
            >
              Registrarse
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
