"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";

export default function TreeGraph({ data }) {
  const [isLoading, setIsLoading] = useState(true);
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    if (!data || !data.users) {
      setIsLoading(false);
      return;
    }

    // Preparar los datos para el gráfico
    const users = data.users;
    const total = users.total || 0;

    const chartData = [
      {
        label: "Administradores",
        value: users.admins || 0,
        percentage: total > 0 ? Math.round((users.admins / total) * 100) : 0,
        color: "#7C3AED", // Púrpura
      },
      {
        label: "Subadministradores",
        value: users.subadmins || 0,
        percentage: total > 0 ? Math.round((users.subadmins / total) * 100) : 0,
        color: "#EC4899", // Rosa
      },
      {
        label: "Seguridad",
        value: users.security || 0,
        percentage: total > 0 ? Math.round((users.security / total) * 100) : 0,
        color: "#F59E0B", // Ámbar
      },
      {
        label: "Usuarios Regulares",
        value: users.regular || 0,
        percentage: total > 0 ? Math.round((users.regular / total) * 100) : 0,
        color: "#10B981", // Verde
      },
    ];

    setChartData(chartData);
    setIsLoading(false);
  }, [data]);

  // Animación para las barras
  const barVariants = {
    hidden: { width: 0 },
    visible: (custom) => ({
      width: `${custom}%`,
      transition: { duration: 0.8, ease: "easeOut" },
    }),
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white rounded-lg shadow-lg p-6 mb-8"
    >
      <h2 className="text-xl font-bold text-gray-800 mb-6">
        Distribución de Usuarios por Rol
      </h2>

      {isLoading ? (
        <div className="h-[400px] flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      ) : !chartData ? (
        <div className="h-[400px] flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-500">No hay datos disponibles</p>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex justify-between items-center mb-4">
            <div className="text-sm font-medium text-gray-500">Rol</div>
            <div className="text-sm font-medium text-gray-500">Cantidad</div>
          </div>

          {chartData.map((item, index) => (
            <div key={index} className="space-y-2">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <div
                    className="w-3 h-3 rounded-full mr-2"
                    style={{ backgroundColor: item.color }}
                  ></div>
                  <span className="font-medium text-gray-700">
                    {item.label}
                  </span>
                </div>
                <span className="font-semibold text-gray-900">
                  {item.value}
                </span>
              </div>

              <div className="h-6 bg-gray-100 rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ backgroundColor: item.color }}
                  variants={barVariants}
                  initial="hidden"
                  animate="visible"
                  custom={item.percentage}
                >
                  <span className="px-3 text-xs font-medium text-white flex h-full items-center">
                    {item.percentage}%
                  </span>
                </motion.div>
              </div>
            </div>
          ))}

          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="flex justify-between items-center">
              <span className="font-medium text-gray-700">
                Total de Usuarios
              </span>
              <span className="font-bold text-gray-900">
                {data.users.total || 0}
              </span>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
