"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "$/context/AuthContext";

export default function AdminRoute({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Si no está cargando y el usuario no es admin, redirigir
    if (!loading && (!user || user.role !== "admin")) {
      router.push("/login?redirect=/admin");
    }
  }, [user, loading, router]);

  // Mostrar nada mientras carga o si no hay usuario o no es admin
  if (loading || !user || user.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Si el usuario es admin, mostrar el contenido
  return <>{children}</>;
}
