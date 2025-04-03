import { motion } from "framer-motion";
import {
  UserGroupIcon,
  DocumentCheckIcon,
  ArrowPathIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";

export default function StatCards({ data }) {
  // Verificar que data existe y tiene las propiedades necesarias
  // Usar operador de encadenamiento opcional para evitar errores
  const users = data?.users || {
    total: 0,
    admins: 0,
    subadmins: 0,
    security: 0,
    regular: 0,
  };

  const authorizations = data?.authorizations || {
    total: 0,
    approved: 0,
    rejected: 0,
    pending: 0,
  };

  const security = data?.security || {
    entries: 0,
    exits: 0,
  };

  // Calcular porcentajes de forma segura para evitar divisiones por cero
  const approvedPercent =
    authorizations.total > 0
      ? Math.round((authorizations.approved / authorizations.total) * 100)
      : 0;

  const pendingPercent =
    authorizations.total > 0
      ? Math.round((authorizations.pending / authorizations.total) * 100)
      : 0;

  const rejectedPercent =
    authorizations.total > 0
      ? Math.round((authorizations.rejected / authorizations.total) * 100)
      : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white overflow-hidden shadow-lg rounded-lg"
      >
        <div className="p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-indigo-100 rounded-md p-3">
              <UserGroupIcon className="h-6 w-6 text-indigo-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Usuarios Totales
                </dt>
                <dd>
                  <div className="text-lg font-medium text-gray-900">
                    {users.total}
                  </div>
                </dd>
              </dl>
            </div>
          </div>
        </div>
        <div className="bg-gray-50 px-5 py-3">
          <div className="text-sm">
            <div className="font-medium text-indigo-700 inline-flex items-center">
              <span>
                {users.admins} Admin · {users.subadmins} Subadmin ·{" "}
                {users.security} Seguridad
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="bg-white overflow-hidden shadow-lg rounded-lg"
      >
        <div className="p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-green-100 rounded-md p-3">
              <DocumentCheckIcon className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Autorizaciones Aprobadas
                </dt>
                <dd>
                  <div className="text-lg font-medium text-gray-900">
                    {authorizations.approved}
                  </div>
                </dd>
              </dl>
            </div>
          </div>
        </div>
        <div className="bg-gray-50 px-5 py-3">
          <div className="text-sm">
            <div className="font-medium text-green-700 inline-flex items-center">
              <span>{approvedPercent}% del total</span>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="bg-white overflow-hidden shadow-lg rounded-lg"
      >
        <div className="p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-yellow-100 rounded-md p-3">
              <ArrowPathIcon className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Autorizaciones Pendientes
                </dt>
                <dd>
                  <div className="text-lg font-medium text-gray-900">
                    {authorizations.pending}
                  </div>
                </dd>
              </dl>
            </div>
          </div>
        </div>
        <div className="bg-gray-50 px-5 py-3">
          <div className="text-sm">
            <div className="font-medium text-yellow-700 inline-flex items-center">
              <span>{pendingPercent}% del total</span>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="bg-white overflow-hidden shadow-lg rounded-lg"
      >
        <div className="p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-red-100 rounded-md p-3">
              <XCircleIcon className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Autorizaciones Rechazadas
                </dt>
                <dd>
                  <div className="text-lg font-medium text-gray-900">
                    {authorizations.rejected}
                  </div>
                </dd>
              </dl>
            </div>
          </div>
        </div>
        <div className="bg-gray-50 px-5 py-3">
          <div className="text-sm">
            <div className="font-medium text-red-700 inline-flex items-center">
              <span>{rejectedPercent}% del total</span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
