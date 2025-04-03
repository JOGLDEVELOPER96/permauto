"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";

// Importar HighchartsReact de forma dinámica para evitar problemas de SSR
const HighchartsReact = dynamic(() => import("highcharts-react-official"), {
  ssr: false,
});

export default function ChartSection({ data }) {
  const [authChartOptions, setAuthChartOptions] = useState(null);
  const [securityChartOptions, setSecurityChartOptions] = useState(null);
  const [highchartsInstance, setHighchartsInstance] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [noSecurityData, setNoSecurityData] = useState(false);

  useEffect(() => {
    // Imprimir los datos para depuración
    console.log("Datos recibidos en ChartSection:", data);

    // Esta función solo se ejecutará en el cliente
    async function loadHighcharts() {
      try {
        // Importar Highcharts dinámicamente
        const highchartsModule = await import("highcharts");
        const highcharts = highchartsModule.default || highchartsModule;

        // Guardar la instancia de Highcharts
        setHighchartsInstance(highcharts);

        // Procesar datos para el gráfico de autorizaciones
        let authData = [];
        let authCategories = [];

        // Usar datos de autorizaciones para el gráfico
        authCategories = ["Aprobadas", "Pendientes", "Rechazadas"];
        authData = [
          data?.stats?.authorizations?.approved ||
            data?.authorizations?.approved ||
            0,
          data?.stats?.authorizations?.pending ||
            data?.authorizations?.pending ||
            0,
          data?.stats?.authorizations?.rejected ||
            data?.authorizations?.rejected ||
            0,
        ];

        // Configurar gráfico de autorizaciones
        setAuthChartOptions({
          chart: {
            type: "column",
            style: { fontFamily: "Inter, system-ui, sans-serif" },
            backgroundColor: "transparent",
          },
          title: {
            text: "Resumen de Autorizaciones",
            style: { fontSize: "16px", fontWeight: "bold", color: "#374151" },
          },
          xAxis: {
            categories: authCategories,
            crosshair: true,
            labels: { style: { color: "#6B7280" } },
          },
          yAxis: {
            min: 0,
            title: { text: "Cantidad", style: { color: "#6B7280" } },
            gridLineColor: "#E5E7EB",
          },
          legend: { enabled: false },
          tooltip: {
            headerFormat:
              '<span style="font-size:10px">{point.key}</span><table>',
            pointFormat:
              '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
              '<td style="padding:0"><b>{point.y}</b></td></tr>',
            footerFormat: "</table>",
            shared: true,
            useHTML: true,
          },
          plotOptions: {
            column: {
              pointPadding: 0.2,
              borderWidth: 0,
              borderRadius: 5,
              colorByPoint: true,
              colors: ["#4F46E5", "#FCD34D", "#EF4444"],
            },
          },
          series: [
            {
              name: "Autorizaciones",
              data: authData,
            },
          ],
          credits: { enabled: false },
        });

        // PROCESAMIENTO DE DATOS DE SEGURIDAD
        // Intentar encontrar los datos de seguridad en diferentes ubicaciones
        let securityRecords = [];

        // Buscar en diferentes ubicaciones posibles
        if (data?.rawSecurityData && Array.isArray(data.rawSecurityData)) {
          securityRecords = data.rawSecurityData;
        } else if (data?.security?.logs && Array.isArray(data.security.logs)) {
          securityRecords = data.security.logs;
        } else if (
          data?.stats?.security?.logs &&
          Array.isArray(data.stats.security.logs)
        ) {
          securityRecords = data.stats.security.logs;
        }

        console.log("Registros de seguridad encontrados:", securityRecords);

        // Si tenemos datos procesados por hora, usarlos directamente
        if (data?.security?.byHour && Array.isArray(data.security.byHour) && data.security.byHour.length > 0) {
          // Filtrar solo las horas con actividad
          const activeHours = data.security.byHour.filter(
            item => item.entries > 0 || item.exits > 0
          );
          
          if (activeHours.length > 0) {
            const hours = activeHours.map(item => item.hour);
            const entriesData = activeHours.map(item => item.entries);
            const exitsData = activeHours.map(item => item.exits);
            
            setSecurityChartOptions({
              chart: {
                type: "areaspline",
                style: { fontFamily: "Inter, system-ui, sans-serif" },
                backgroundColor: "transparent",
              },
              title: {
                text: "Registro de Entradas y Salidas",
                style: {
                  fontSize: "16px",
                  fontWeight: "bold",
                  color: "#374151",
                },
              },
              xAxis: {
                categories: hours,
                labels: { style: { color: "#6B7280" } },
              },
              yAxis: {
                title: {
                  text: "Cantidad de personas",
                  style: { color: "#6B7280" },
                },
                gridLineColor: "#E5E7EB",
              },
              tooltip: { shared: true, valueSuffix: " personas" },
              credits: { enabled: false },
              plotOptions: { areaspline: { fillOpacity: 0.5 } },
              series: [
                {
                  name: "Entradas",
                  data: entriesData,
                  color: "#4F46E5",
                },
                {
                  name: "Salidas",
                  data: exitsData,
                  color: "#F97316",
                },
              ],
            });
            return; // Salir de la función si ya procesamos los datos
          }
        }

        // Si tenemos registros de seguridad, procesarlos
        if (securityRecords.length > 0) {
          // Verificar si los registros tienen la estructura correcta (type: "entry"/"exit")
          const hasCorrectStructure = securityRecords.some(
            (record) => record.type === "entry" || record.type === "exit"
          );

          if (hasCorrectStructure) {
            // Procesar datos reales
            const entriesByHour = {};
            const exitsByHour = {};

            // Inicializar horas de 00:00 a 23:00
            for (let i = 0; i < 24; i++) {
              const hour = `${i.toString().padStart(2, "0")}:00`;
              entriesByHour[hour] = 0;
              exitsByHour[hour] = 0;
            }

            // Contar entradas y salidas por hora
            securityRecords.forEach((record) => {
              if (!record.timestamp) return;

              const date = new Date(record.timestamp);
              const hour = `${date.getHours().toString().padStart(2, "0")}:00`;

                            if (record.type === "entry") {
                entriesByHour[hour] = (entriesByHour[hour] || 0) + 1;
              } else if (record.type === "exit") {
                exitsByHour[hour] = (exitsByHour[hour] || 0) + 1;
              }
            });

            // Filtrar solo las horas con actividad
            const activeHours = Object.keys(entriesByHour)
              .filter(
                (hour) => entriesByHour[hour] > 0 || exitsByHour[hour] > 0
              )
              .sort();

            // Si no hay horas activas, mostrar mensaje de no datos
            if (activeHours.length === 0) {
              setNoSecurityData(true);
              setSecurityChartOptions({
                chart: {
                  type: "areaspline",
                  style: { fontFamily: "Inter, system-ui, sans-serif" },
                  backgroundColor: "transparent",
                },
                title: {
                  text: "Registro de Entradas y Salidas",
                  style: {
                    fontSize: "16px",
                    fontWeight: "bold",
                    color: "#374151",
                  },
                },
                subtitle: {
                  text: "No hay datos de seguridad disponibles",
                  style: { fontSize: "12px", color: "#6B7280" },
                },
                xAxis: {
                  categories: ["00:00", "06:00", "12:00", "18:00", "23:00"],
                  labels: { style: { color: "#6B7280" } },
                },
                yAxis: {
                  title: {
                    text: "Cantidad de personas",
                    style: { color: "#6B7280" },
                  },
                  gridLineColor: "#E5E7EB",
                },
                tooltip: { shared: true, valueSuffix: " personas" },
                credits: { enabled: false },
                plotOptions: { areaspline: { fillOpacity: 0.5 } },
                series: [
                  {
                    name: "Entradas",
                    data: [0, 0, 0, 0, 0],
                    color: "#4F46E5",
                  },
                  {
                    name: "Salidas",
                    data: [0, 0, 0, 0, 0],
                    color: "#F97316",
                  },
                ],
              });
              return;
            }

            // Preparar datos para el gráfico
            const entriesData = activeHours.map((hour) => entriesByHour[hour] || 0);
            const exitsData = activeHours.map((hour) => exitsByHour[hour] || 0);

            // Configurar gráfico con datos reales
            setSecurityChartOptions({
              chart: {
                type: "areaspline",
                style: { fontFamily: "Inter, system-ui, sans-serif" },
                backgroundColor: "transparent",
              },
              title: {
                text: "Registro de Entradas y Salidas",
                style: {
                  fontSize: "16px",
                  fontWeight: "bold",
                  color: "#374151",
                },
              },
              xAxis: {
                categories: activeHours,
                labels: { style: { color: "#6B7280" } },
              },
              yAxis: {
                title: {
                  text: "Cantidad de personas",
                  style: { color: "#6B7280" },
                },
                gridLineColor: "#E5E7EB",
              },
              tooltip: { shared: true, valueSuffix: " personas" },
              credits: { enabled: false },
              plotOptions: { areaspline: { fillOpacity: 0.5 } },
              series: [
                {
                  name: "Entradas",
                  data: entriesData,
                  color: "#4F46E5",
                },
                {
                  name: "Salidas",
                  data: exitsData,
                  color: "#F97316",
                },
              ],
            });
          } else {
            // Estructura incorrecta, mostrar mensaje de error
            setNoSecurityData(true);
            setSecurityChartOptions({
              chart: {
                type: "areaspline",
                style: { fontFamily: "Inter, system-ui, sans-serif" },
                backgroundColor: "transparent",
              },
              title: {
                text: "Registro de Entradas y Salidas",
                style: {
                  fontSize: "16px",
                  fontWeight: "bold",
                  color: "#374151",
                },
              },
              subtitle: {
                text: "Formato de datos incorrecto",
                style: { fontSize: "12px", color: "#6B7280" },
              },
              xAxis: {
                categories: ["00:00", "06:00", "12:00", "18:00", "23:00"],
                labels: { style: { color: "#6B7280" } },
              },
              yAxis: {
                title: {
                  text: "Cantidad de personas",
                  style: { color: "#6B7280" },
                },
                gridLineColor: "#E5E7EB",
              },
              tooltip: { shared: true, valueSuffix: " personas" },
              credits: { enabled: false },
              plotOptions: { areaspline: { fillOpacity: 0.5 } },
              series: [
                {
                  name: "Entradas",
                  data: [0, 0, 0, 0, 0],
                  color: "#4F46E5",
                },
                {
                  name: "Salidas",
                  data: [0, 0, 0, 0, 0],
                  color: "#F97316",
                },
              ],
            });
          }
        } else {
          // No hay registros, mostrar mensaje
          setNoSecurityData(true);
          setSecurityChartOptions({
            chart: {
              type: "areaspline",
              style: { fontFamily: "Inter, system-ui, sans-serif" },
              backgroundColor: "transparent",
            },
            title: {
              text: "Registro de Entradas y Salidas",
              style: {
                fontSize: "16px",
                fontWeight: "bold",
                color: "#374151",
              },
            },
            subtitle: {
              text: "No hay datos de seguridad disponibles",
              style: { fontSize: "12px", color: "#6B7280" },
            },
            xAxis: {
              categories: ["00:00", "06:00", "12:00", "18:00", "23:00"],
              labels: { style: { color: "#6B7280" } },
            },
            yAxis: {
              title: {
                text: "Cantidad de personas",
                style: { color: "#6B7280" },
              },
              gridLineColor: "#E5E7EB",
            },
            tooltip: { shared: true, valueSuffix: " personas" },
            credits: { enabled: false },
            plotOptions: { areaspline: { fillOpacity: 0.5 } },
            series: [
              {
                name: "Entradas",
                data: [0, 0, 0, 0, 0],
                color: "#4F46E5",
              },
              {
                name: "Salidas",
                data: [0, 0, 0, 0, 0],
                color: "#F97316",
              },
            ],
          });
        }
      } catch (error) {
        console.error("Error al cargar Highcharts:", error);
      } finally {
        setIsLoading(false);
      }
    }

    loadHighcharts();
  }, [data]);

  // Mostrar un placeholder mientras se carga
  if (
    isLoading ||
    !authChartOptions ||
    !securityChartOptions ||
    !highchartsInstance
  ) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white rounded-lg shadow-lg p-6 h-[300px] flex items-center justify-center"
        >
          <div className="animate-pulse flex flex-col items-center w-full">
            <div className="h-6 w-48 bg-gray-200 rounded mb-4"></div>
            <div className="h-48 w-full bg-gray-200 rounded"></div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="bg-white rounded-lg shadow-lg p-6 h-[300px] flex items-center justify-center"
        >
          <div className="animate-pulse flex flex-col items-center w-full">
            <div className="h-6 w-48 bg-gray-200 rounded mb-4"></div>
            <div className="h-48 w-full bg-gray-200 rounded"></div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="bg-white rounded-lg shadow-lg p-6"
      >
        <HighchartsReact
          highcharts={highchartsInstance}
          options={authChartOptions}
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="bg-white rounded-lg shadow-lg p-6 relative"
      >
        {noSecurityData && (
          <div className="absolute inset-0 flex items-center justify-center z-10 bg-white bg-opacity-70">
            <p className="text-gray-500 text-sm font-medium">
              No hay datos de seguridad disponibles
            </p>
          </div>
        )}
        <HighchartsReact
          highcharts={highchartsInstance}
          options={securityChartOptions}
        />
      </motion.div>
    </div>
  );
}
