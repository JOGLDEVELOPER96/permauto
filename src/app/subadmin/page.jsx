"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { motion } from "framer-motion";
import Link from "next/link";

export default function SubadminDashboard() {
  const router = useRouter();
  const { user, isAuthenticated, loading } = useAuth();

  // Estado para las secciones
  const [sections, setSections] = useState([
    {
      id: "cards",
      title: "Accesos Rápidos",
      icon: (
        <svg
          className="w-6 h-6 text-blue-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M4 6h16M4 12h16M4 18h16"
          ></path>
        </svg>
      ),
      bgColor: "bg-blue-100",
    },
    {
      id: "table",
      title: "Autorizaciones Iniciadas",
      icon: (
        <svg
          className="w-6 h-6 text-green-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          ></path>
        </svg>
      ),
      bgColor: "bg-green-100",
    },
  ]);

  // Estado para las tarjetas
  const [cards, setCards] = useState([
    {
      id: "authorizations",
      title: "Autorizaciones",
      description:
        "Gestiona las autorizaciones de acceso para visitantes y contratistas.",
      icon: (
        <svg
          className="w-6 h-6 text-indigo-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          ></path>
        </svg>
      ),
      link: "/subadmin/authorizations",
      bgColor: "bg-indigo-100",
      textColor: "text-indigo-600",
      buttonColor: "bg-indigo-600 hover:bg-indigo-700",
    },
    {
      id: "reports",
      title: "Reportes",
      description: "Genera y visualiza reportes de actividad y autorizaciones.",
      icon: (
        <svg
          className="w-6 h-6 text-purple-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          ></path>
        </svg>
      ),
      link: "/subadmin/reports",
      bgColor: "bg-purple-100",
      textColor: "text-purple-600",
      buttonColor: "bg-purple-600 hover:bg-purple-700",
    },
  ]);

  const [recentAuthorizations, setRecentAuthorizations] = useState([]);
  const [isLoadingAuthorizations, setIsLoadingAuthorizations] = useState(true);

  // Verificar permisos
  useEffect(() => {
    if (
      !loading &&
      (!isAuthenticated || user?.role?.toLowerCase() !== "subadmin")
    ) {
      router.push("/login");
    }
  }, [isAuthenticated, loading, router, user]);

  // Cargar autorizaciones recientes
  useEffect(() => {
    if (isAuthenticated && user?.role?.toLowerCase() === "subadmin") {
      fetchRecentAuthorizations();
    }
  }, [isAuthenticated, user]);

  // Cargar orden guardado
  useEffect(() => {
    const savedSections = localStorage.getItem("subadminDashboardSections");
    if (savedSections) {
      try {
        setSections(JSON.parse(savedSections));
      } catch (e) {
        console.error("Error al cargar secciones guardadas:", e);
      }
    }
  }, []);

  const fetchRecentAuthorizations = async () => {
    setIsLoadingAuthorizations(true);
    try {
      const response = await fetch("/api/authorizations?status=initiated");
      if (!response.ok) {
        throw new Error("Error al obtener las autorizaciones recientes");
      }
      const data = await response.json();
      setRecentAuthorizations(data.authorizations || []);
    } catch (error) {
      console.error("Error al cargar autorizaciones recientes:", error);
    } finally {
      setIsLoadingAuthorizations(false);
    }
  };

  // Formatear fecha
  const formatDate = (dateString) => {
    const options = {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateString).toLocaleDateString("es-ES", options);
  };

  // Función para mover una sección hacia arriba
  const moveSectionUp = (index) => {
    if (index === 0) return; // Ya está en la parte superior

    const newSections = [...sections];
    const temp = newSections[index];
    newSections[index] = newSections[index - 1];
    newSections[index - 1] = temp;

    setSections(newSections);
    localStorage.setItem(
      "subadminDashboardSections",
      JSON.stringify(newSections)
    );
  };

  // Función para mover una sección hacia abajo
  const moveSectionDown = (index) => {
    if (index === sections.length - 1) return; // Ya está en la parte inferior

    const newSections = [...sections];
    const temp = newSections[index];
    newSections[index] = newSections[index + 1];
    newSections[index + 1] = temp;

    setSections(newSections);
    localStorage.setItem(
      "subadminDashboardSections",
      JSON.stringify(newSections)
    );
  };

  // Función para resetear el orden
  const resetOrder = () => {
    const defaultSections = [
      {
        id: "cards",
        title: "Accesos Rápidos",
        icon: (
          <svg
            className="w-6 h-6 text-blue-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M4 6h16M4 12h16M4 18h16"
            ></path>
          </svg>
        ),
        bgColor: "bg-blue-100",
      },
      {
        id: "table",
        title: "Autorizaciones Iniciadas",
        icon: (
          <svg
            className="w-6 h-6 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            ></path>
          </svg>
        ),
        bgColor: "bg-green-100",
      },
    ];
    setSections(defaultSections);
    localStorage.setItem(
      "subadminDashboardSections",
      JSON.stringify(defaultSections)
    );
  };

  // Renderizar una sección específica
  const renderSection = (section, index) => {
    const sectionContent =
      section.id === "cards" ? (
        <div className="bg-white rounded-lg shadow-md p-6 mb-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-800">
              {section.title}
            </h2>
            <div className={`p-2 ${section.bgColor} rounded-full`}>
              {section.icon}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {cards.map((card) => (
              <motion.div
                key={card.id}
                whileHover={{
                  y: -5,
                  boxShadow:
                    "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                }}
                className="bg-white rounded-lg border border-gray-200 overflow-hidden h-full"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-gray-800">
                      {card.title}
                    </h2>
                    <div className={`p-2 ${card.bgColor} rounded-full`}>
                      {card.icon}
                    </div>
                  </div>
                  <p className="text-gray-600 mb-6">{card.description}</p>
                  <Link
                    href={card.link}
                    className={`block w-full py-2 px-4 ${card.buttonColor} text-white text-center rounded-lg transition-colors`}
                  >
                    Administrar {card.title}
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      ) : section.id === "table" ? (
        <div className="bg-white rounded-lg shadow-md p-6 mb-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-800">
              {section.title}
            </h2>
            <div className={`p-2 ${section.bgColor} rounded-full`}>
              {section.icon}
            </div>
          </div>
          {isLoadingAuthorizations ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-500 mx-auto"></div>
              <p className="mt-4 text-gray-500">Cargando autorizaciones...</p>
            </div>
          ) : recentAuthorizations.length === 0 ? (
            <div className="text-center py-8">
              <svg
                className="w-16 h-16 text-gray-400 mx-auto mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                ></path>
              </svg>
              <h3 className="text-lg font-medium text-gray-700 mb-2">
                No hay autorizaciones iniciadas
              </h3>
              <p className="text-gray-500">
                Las autorizaciones con estado "iniciado" aparecerán aquí.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Empresa
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      RUC
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Usuario
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Fecha de Inicio
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {recentAuthorizations.map((auth) => (
                    <tr key={auth._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {auth.companyName}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{auth.ruc}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {auth.userId}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {formatDate(auth.startDate)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Link
                          href={`/subadmin/authorizations/${auth._id}`}
                          className="text-indigo-600 hover:text-indigo-900 mr-4"
                        >
                          Ver
                        </Link>
                        <Link
                          href={`/subadmin/authorizations/edit/${auth._id}`}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Editar
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="mt-4 text-right">
                <Link
                  href="/subadmin/authorizations?status=initiated"
                  className="inline-block py-2 px-4 bg-green-600 hover:bg-green-700 text-white text-center rounded-lg transition-colors"
                >
                  Ver todas las autorizaciones iniciadas
                </Link>
              </div>
            </div>
          )}
        </div>
      ) : null;

    return (
      <div className="relative mb-8">
        {/* Controles de reordenamiento */}
        <div className="absolute -top-3 right-4 flex space-x-2 z-10">
          <button
            onClick={() => moveSectionUp(index)}
            disabled={index === 0}
            className={`p-1 rounded-full shadow-md ${
              index === 0
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : "bg-white text-gray-600 hover:bg-gray-100"
            }`}
            title="Mover arriba"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M5 15l7-7 7 7"
              ></path>
            </svg>
          </button>
          <button
            onClick={() => moveSectionDown(index)}
            disabled={index === sections.length - 1}
            className={`p-1 rounded-full shadow-md ${
              index === sections.length - 1
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : "bg-white text-gray-600 hover:bg-gray-100"
            }`}
            title="Mover abajo"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M19 9l-7 7-7-7"
              ></path>
            </svg>
          </button>
        </div>
        {sectionContent}
      </div>
    );
  };

  if (loading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto px-4 py-8 bg-gray-50 min-h-screen"
    >
      <div className="mb-8 flex flex-wrap justify-between items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Panel de Subadministrador
          </h1>
          <p className="text-gray-600 mt-2">
            Bienvenido, {user?.name || "Subadministrador"}
          </p>
        </div>
        <div>
          <button
            onClick={resetOrder}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded-lg text-sm transition-colors"
          >
            Restablecer orden
          </button>
        </div>
      </div>
      <div className="mb-6">
        <p className="text-sm text-gray-500 italic">
          Usa los botones de flecha para reorganizar las secciones de tu panel
        </p>
      </div>

      {sections.map((section, index) => renderSection(section, index))}
    </motion.div>
  );
}
