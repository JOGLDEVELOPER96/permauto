// app/subadmin/authorizations/[id]/page.jsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";
import Link from "next/link";

export default function AuthorizationDetailsPage({ params }) {
  const router = useRouter();
  const { user, isAuthenticated, loading } = useAuth();
  const { id } = params;

  const [authorization, setAuthorization] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Verificar permisos
  useEffect(() => {
    if (
      !loading &&
      (!isAuthenticated || user?.role?.toLowerCase() !== "subadmin")
    ) {
      router.push("/login");
    }
  }, [isAuthenticated, loading, router, user]);

  // Cargar datos de la autorización
  useEffect(() => {
    if (isAuthenticated && user?.role?.toLowerCase() === "subadmin" && id) {
      fetchAuthorizationDetails();
    }
  }, [isAuthenticated, user, id]);

  const fetchAuthorizationDetails = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/authorizations/${id}`);

      if (!response.ok) {
        throw new Error("Error al obtener los detalles de la autorización");
      }

      const data = await response.json();
      setAuthorization(data.authorization);
    } catch (error) {
      console.error("Error al cargar detalles de la autorización:", error);
      toast.error("Error al cargar los detalles de la autorización");
    } finally {
      setIsLoading(false);
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

  // Traducir estado
  const translateStatus = (status) => {
    const statusMap = {
      initiated: "Iniciado",
      completed: "Finalizado",
      approved: "Aprobado",
      rejected: "Rechazado",
      pending: "Pendiente",
    };
    return statusMap[status] || status;
  };

  // Obtener color según estado
  const getStatusColor = (status) => {
    const colorMap = {
      initiated: "bg-blue-100 text-blue-800",
      completed: "bg-green-100 text-green-800",
      approved: "bg-purple-100 text-purple-800",
      rejected: "bg-red-100 text-red-800",
      pending: "bg-yellow-100 text-yellow-800",
    };
    return colorMap[status] || "bg-gray-100 text-gray-800";
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

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      </div>
    );
  }

  if (!authorization) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <svg
            className="w-16 h-16 text-red-500 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            ></path>
          </svg>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">
            Autorización no encontrada
          </h2>
          <p className="text-gray-500 mb-6">
            La autorización que estás buscando no existe o no tienes permisos
            para verla.
          </p>
          <Link
            href="/subadmin/authorizations"
            className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              ></path>
            </svg>
            Volver a Autorizaciones
          </Link>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto px-4 py-8"
    >
      <div className="mb-6 flex items-center">
        <Link
          href="/subadmin/authorizations"
          className="inline-flex items-center text-indigo-600 hover:text-indigo-800 mr-4"
        >
          <svg
            className="w-5 h-5 mr-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            ></path>
          </svg>
          Volver
        </Link>
        <h1 className="text-3xl font-bold text-gray-800">
          Detalles de Autorización
        </h1>
      </div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-lg shadow-lg overflow-hidden"
      >
        <div className="p-6">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">
                {authorization.companyName}
              </h2>
              <p className="text-gray-600">RUC: {authorization.ruc}</p>
            </div>
            <div className="mt-4 md:mt-0">
              <span
                className={`px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full ${getStatusColor(
                  authorization.status
                )}`}
              >
                {translateStatus(authorization.status)}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                Información de Visita
              </h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="mb-3">
                  <span className="block text-sm font-medium text-gray-500">
                    ID de Usuario
                  </span>
                  <span className="block text-base text-gray-800">
                    {authorization.userId}
                  </span>
                </div>
                <div className="mb-3">
                  <span className="block text-sm font-medium text-gray-500">
                    Fecha de Inicio
                  </span>
                  <span className="block text-base text-gray-800">
                    {formatDate(authorization.startDate)}
                  </span>
                </div>
                <div>
                  <span className="block text-sm font-medium text-gray-500">
                    Fecha de Fin
                  </span>
                  <span className="block text-base text-gray-800">
                    {formatDate(authorization.endDate)}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                Estado de Aprobación
              </h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="mb-3">
                  <span className="block text-sm font-medium text-gray-500">
                    Estado
                  </span>
                  <span
                    className={`mt-1 px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full ${
                      authorization.approvedBy === "pending"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-green-100 text-green-800"
                    }`}
                  >
                    {authorization.approvedBy === "pending"
                      ? "Pendiente de aprobación"
                      : `Aprobado por: ${authorization.approvedBy}`}
                  </span>
                </div>
                <div>
                  <span className="block text-sm font-medium text-gray-500">
                    Fecha de Creación
                  </span>
                  <span className="block text-base text-gray-800">
                    {formatDate(authorization.timestamp)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              Razón de Visita
            </h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-gray-800 whitespace-pre-line">
                {authorization.reason}
              </p>
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() =>
                router.push(
                  `/subadmin/authorizations/edit/${authorization._id}`
                )
              }
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors flex items-center"
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                ></path>
              </svg>
              Editar Autorización
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
