import { motion } from "framer-motion";
import { DocumentTextIcon } from "@heroicons/react/24/outline";

export default function ActivitySection({ data }) {
  // Asegurarse de que bySubadmin existe y es un array
  const bySubadmin = data?.bySubadmin || [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="bg-white rounded-lg shadow-lg p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-medium text-gray-900">
          Actividad Reciente
        </h2>
        <span className="px-2 py-1 text-xs font-medium rounded-full bg-indigo-100 text-indigo-800">
          Últimas 24h
        </span>
      </div>

      <div className="flow-root">
        <ul className="-my-5 divide-y divide-gray-200">
          {bySubadmin.slice(0, 5).map((item, index) => (
            <li key={index} className="py-4">
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center">
                    <DocumentTextIcon className="h-4 w-4 text-indigo-600" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {item.name}
                  </p>
                  <p className="text-sm text-gray-500 truncate">
                    Procesó {item.count} autorizaciones
                  </p>
                </div>
                <div>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Activo
                  </span>
                </div>
              </div>
            </li>
          ))}

          {bySubadmin.length === 0 && (
            <li className="py-4">
              <div className="text-center text-gray-500">
                No hay actividad reciente para mostrar
              </div>
            </li>
          )}
        </ul>
      </div>

      <div className="mt-6">
        <a
          href="#"
          className="w-full flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
        >
          Ver todas las actividades
        </a>
      </div>
    </motion.div>
  );
}
