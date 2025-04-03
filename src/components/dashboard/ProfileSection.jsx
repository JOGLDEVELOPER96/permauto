import { motion } from "framer-motion";
import { UserIcon } from "@heroicons/react/24/outline";

export default function ProfileSection({ user, onLogout }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="bg-white rounded-lg shadow-lg p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-medium text-gray-900">Tu Perfil</h2>
        <span
          className={`px-2 py-1 text-xs font-medium rounded-full ${
            user?.role === "admin"
              ? "bg-red-100 text-red-800"
              : user?.role === "subadmin"
              ? "bg-amber-100 text-amber-800"
              : user?.role === "security"
              ? "bg-green-100 text-green-800"
              : "bg-blue-100 text-blue-800"
          }`}
        >
          {user?.role === "admin"
            ? "Administrador"
            : user?.role === "subadmin"
            ? "Subadministrador"
            : user?.role === "security"
            ? "Seguridad"
            : "Usuario"}
        </span>
      </div>

      <div className="flex items-center space-x-5 mb-6">
        <div className="flex-shrink-0">
          <div className="h-16 w-16 rounded-full bg-indigo-100 flex items-center justify-center">
            <UserIcon className="h-8 w-8 text-indigo-600" />
          </div>
        </div>
        <div>
          <h3 className="text-lg font-medium text-gray-900">
            {user?.name || "Usuario"}
          </h3>
          <p className="text-sm text-gray-500">{user?.email}</p>
        </div>
      </div>

      <div className="border-t border-gray-200 pt-5">
        <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
          <div className="sm:col-span-1">
            <dt className="text-sm font-medium text-gray-500">Último acceso</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {new Date().toLocaleDateString("es-ES", {
                day: "numeric",
                month: "long",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </dd>
          </div>
          <div className="sm:col-span-1">
            <dt className="text-sm font-medium text-gray-500">Cuenta creada</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {user?.createdAt
                ? new Date(user.createdAt).toLocaleDateString("es-ES", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })
                : "Fecha no disponible"}
            </dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-sm font-medium text-gray-500">Permisos</dt>
            <dd className="mt-1 text-sm text-gray-900">
              <div className="flex flex-wrap gap-2">
                {renderPermissionBadges(user?.role)}
              </div>
            </dd>
          </div>
        </dl>
      </div>

      <div className="mt-6">
        <button
          onClick={onLogout}
          className="w-full flex justify-center items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Cerrar sesión
        </button>
      </div>
    </motion.div>
  );
}

function renderPermissionBadges(role) {
  if (role === "admin") {
    return (
      <>
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
          Gestión de usuarios
        </span>
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
          Gestión de permisos
        </span>
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
          Configuración del sistema
        </span>
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
          Reportes avanzados
        </span>
      </>
    );
  } else if (role === "subadmin") {
    return (
      <>
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
          Gestión de autorizaciones
        </span>
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
          Reportes básicos
        </span>
      </>
    );
  } else if (role === "security") {
    return (
      <>
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
          Registro de entradas
        </span>
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
          Registro de salidas
        </span>
      </>
    );
  } else {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
        Acceso básico
      </span>
    );
  }
}
