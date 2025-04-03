// app/subadmin/authorizations/edit/[id]/page.jsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";
import Link from "next/link";

export default function EditAuthorizationPage({ params }) {
  const router = useRouter();
  const { user, isAuthenticated, loading } = useAuth();
  const { id } = params;

  const [formData, setFormData] = useState({
    companyName: "",
    ruc: "",
    reason: "",
    status: "initiated",
    userId: "",
    startDate: "",
    endDate: "",
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

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

      // Formatear fechas para el input datetime-local
      const formatDateForInput = (dateString) => {
        const date = new Date(dateString);
        return date.toISOString().slice(0, 16);
      };

      setFormData({
        companyName: data.authorization.companyName,
        ruc: data.authorization.ruc,
        reason: data.authorization.reason,
        status: data.authorization.status,
        userId: data.authorization.userId,
        startDate: formatDateForInput(data.authorization.startDate),
        endDate: formatDateForInput(data.authorization.endDate),
      });
    } catch (error) {
      console.error("Error al cargar detalles de la autorización:", error);
      toast.error("Error al cargar los detalles de la autorización");
    } finally {
      setIsLoading(false);
    }
  };

  // Manejar cambios en el formulario
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    // Limpiar error cuando el usuario comienza a escribir
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: "",
      });
    }
  };

  // Validar formulario
  const validateForm = () => {
    const newErrors = {};

    if (!formData.companyName.trim()) {
      newErrors.companyName = "El nombre de la empresa es obligatorio";
    }

    if (!formData.ruc.trim()) {
      newErrors.ruc = "El RUC es obligatorio";
    } else if (!/^\d{11}$/.test(formData.ruc)) {
      newErrors.ruc = "El RUC debe tener 11 dígitos";
    }

    if (!formData.reason.trim()) {
      newErrors.reason = "La razón de visita es obligatoria";
    }

    if (!formData.userId.trim()) {
      newErrors.userId = "El ID del usuario es obligatorio";
    }

    if (!formData.startDate) {
      newErrors.startDate = "La fecha de inicio es obligatoria";
    }

    if (!formData.endDate) {
      newErrors.endDate = "La fecha de fin es obligatoria";
    } else if (new Date(formData.endDate) < new Date(formData.startDate)) {
      newErrors.endDate =
        "La fecha de fin debe ser posterior a la fecha de inicio";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Manejar envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Por favor, corrige los errores en el formulario");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/authorizations/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || "Error al actualizar la autorización"
        );
      }

      toast.success("Autorización actualizada con éxito");
      router.push(`/subadmin/authorizations/${id}`);
    } catch (error) {
      console.error("Error al actualizar la autorización:", error);
      toast.error(error.message || "Error al actualizar la autorización");
    } finally {
      setIsSubmitting(false);
    }
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

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto px-4 py-8"
    >
      <div className="mb-6 flex items-center">
        <Link
          href={`/subadmin/authorizations/${id}`}
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
          Editar Autorización
        </h1>
      </div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-lg shadow-lg p-6"
      >
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Nombre de la empresa */}
            <div className="col-span-2 md:col-span-1">
              <label
                htmlFor="companyName"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Nombre de la Empresa
              </label>
              <input
                type="text"
                id="companyName"
                name="companyName"
                value={formData.companyName}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors ${
                  errors.companyName ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Ingrese el nombre de la empresa"
              />
              {errors.companyName && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.companyName}
                </p>
              )}
            </div>

            {/* RUC */}
            <div className="col-span-2 md:col-span-1">
              <label
                htmlFor="ruc"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                RUC
              </label>
              <input
                type="text"
                id="ruc"
                name="ruc"
                value={formData.ruc}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors ${
                  errors.ruc ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Ingrese el RUC (11 dígitos)"
                maxLength={11}
              />
              {errors.ruc && (
                <p className="mt-1 text-sm text-red-600">{errors.ruc}</p>
              )}
            </div>

            {/* ID del usuario */}
            <div className="col-span-2 md:col-span-1">
              <label
                htmlFor="userId"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                ID del Usuario
              </label>
              <input
                type="text"
                id="userId"
                name="userId"
                value={formData.userId}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors ${
                  errors.userId ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Ingrese el ID del usuario"
              />
              {errors.userId && (
                <p className="mt-1 text-sm text-red-600">{errors.userId}</p>
              )}
            </div>

            {/* Estado */}
            <div className="col-span-2 md:col-span-1">
              <label
                htmlFor="status"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Estado
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
              >
                <option value="initiated">Iniciado</option>
                <option value="completed">Finalizado</option>
              </select>
            </div>

            {/* Fecha de inicio */}
            <div className="col-span-2 md:col-span-1">
              <label
                htmlFor="startDate"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Fecha de Inicio
              </label>
              <input
                type="datetime-local"
                id="startDate"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors ${
                  errors.startDate ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.startDate && (
                <p className="mt-1 text-sm text-red-600">{errors.startDate}</p>
              )}
            </div>

            {/* Fecha de fin */}
            <div className="col-span-2 md:col-span-1">
              <label
                htmlFor="endDate"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Fecha de Fin
              </label>
              <input
                type="datetime-local"
                id="endDate"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors ${
                  errors.endDate ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.endDate && (
                <p className="mt-1 text-sm text-red-600">{errors.endDate}</p>
              )}
            </div>

            {/* Razón de visita */}
            <div className="col-span-2">
              <label
                htmlFor="reason"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Razón de Visita
              </label>
              <textarea
                id="reason"
                name="reason"
                value={formData.reason}
                onChange={handleChange}
                rows={4}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors ${
                  errors.reason ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Describa el motivo de la visita"
              ></textarea>
              {errors.reason && (
                <p className="mt-1 text-sm text-red-600">{errors.reason}</p>
              )}
            </div>
          </div>

          {/* Botones */}
          <div className="mt-8 flex justify-end space-x-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={() => router.push(`/subadmin/authorizations/${id}`)}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
            >
              Cancelar
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors flex items-center"
            >
              {isSubmitting ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Guardando...
                </>
              ) : (
                "Guardar Cambios"
              )}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}
