"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import {
  Bars3Icon,
  XMarkIcon,
  UserCircleIcon,
  ArrowRightStartOnRectangleIcon,
  HomeIcon,
  ClipboardDocumentListIcon,
  UserGroupIcon,
  ShieldCheckIcon,
  UserIcon,
  Cog6ToothIcon,
  ChartBarIcon,
  BuildingOfficeIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/outline";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const { user, logout, isAuthenticated, loading } = useAuth();
  const profileMenuRef = useRef(null);

  // Establecer mounted a true después de la carga inicial
  useEffect(() => {
    setMounted(true);
  }, []);

  // Cerrar menú móvil y perfil al cambiar de ruta
  useEffect(() => {
    setIsOpen(false);
    setShowProfileMenu(false);
  }, [pathname]);

  // Cerrar menú de perfil al hacer clic fuera
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target)
      ) {
        setShowProfileMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // No renderizar nada mientras carga o si no está montado
  if (!mounted || loading) {
    return null;
  }

  // No renderizar si el usuario no está autenticado
  if (!isAuthenticated || !user) {
    console.log("Navbar not rendering: user not authenticated");
    return null;
  }

  // Verificar si estamos en una ruta pública
  const isPublicRoute =
    pathname === "/" || pathname === "/login" || pathname === "/register";

  // No mostrar el navbar en rutas públicas
  if (isPublicRoute) {
    console.log("Navbar not rendering: on public route");
    return null;
  }

  console.log("Rendering navbar for authenticated user:", user);

  // Definir enlaces de navegación según el rol del usuario
  const getNavLinks = () => {
    // Enlaces comunes para todos los usuarios
    const commonLinks = [
      { name: "Dashboard", href: "/dashboard", icon: HomeIcon },
    ];

    // Enlaces específicos para administradores
    const adminLinks = [
      {
        name: "Gestión de Usuarios",
        href: "/admin/users",
        icon: UserGroupIcon,
      },
      {
        name: "Registros de Security",
        href: "/admin/security-logs",
        icon: ShieldCheckIcon,
      },
      {
        name: "Registros de SubAdmin",
        href: "/admin/subadmin-logs",
        icon: ClipboardDocumentListIcon,
      },
    ];

    // Enlaces específicos para subadministradores
    const subAdminLinks = [
      {
        name: "Autorizaciones Empresas",
        href: "/dashboard/company-auth",
        icon: BuildingOfficeIcon,
      },
      {
        name: "Permisos Trabajadores",
        href: "/dashboard/worker-permissions",
        icon: UserIcon,
      },
      { name: "Reportes", href: "/dashboard/reports", icon: DocumentTextIcon },
    ];

    // Enlaces para usuarios regulares
    const userLinks = [
      {
        name: "Mis Solicitudes",
        href: "/dashboard/requests",
        icon: ClipboardDocumentListIcon,
      },
      {
        name: "Documentos",
        href: "/dashboard/documents",
        icon: DocumentTextIcon,
      },
    ];

    // Determinar qué enlaces mostrar según el rol del usuario
    const role = user?.role?.toLowerCase() || "";

    if (role === "admin" || role === "administrador") {
      return [...commonLinks, ...adminLinks];
    } else if (role === "subadmin") {
      return [...commonLinks, ...subAdminLinks];
    } else {
      return [...commonLinks, ...userLinks];
    }
  };

  const navLinks = getNavLinks();

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/dashboard">
                <span className="text-xl font-bold text-indigo-600 hover:text-indigo-800 transition-colors">
                  PermAuto
                </span>
              </Link>
            </div>

            {/* Enlaces de navegación para escritorio */}
            <div className="hidden md:ml-6 md:flex md:space-x-4">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    className={`inline-flex items-center px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? "bg-indigo-100 text-indigo-700"
                        : "text-gray-600 hover:bg-gray-50 hover:text-indigo-600"
                    }`}
                  >
                    <link.icon className="h-5 w-5 mr-2" />
                    {link.name}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Sección de perfil de usuario */}
          <div className="hidden md:ml-6 md:flex md:items-center">
            <div className="relative" ref={profileMenuRef}>
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 p-1"
                aria-expanded={showProfileMenu}
              >
                <span className="sr-only">Abrir menú de usuario</span>
                <div className="flex items-center text-gray-700 hover:text-indigo-600 transition-colors">
                  <UserCircleIcon className="h-8 w-8" />
                  <span className="ml-2 font-medium">
                    {user?.email || "Usuario"}
                  </span>
                </div>
              </button>

              {/* Menú desplegable de perfil */}
              <AnimatePresence>
                {showProfileMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-10"
                  >
                    <div className="px-4 py-2 text-xs text-gray-500 border-b border-gray-100">
                      <p>Conectado como:</p>
                      <p className="font-medium text-gray-800">
                        {user?.email || "Usuario"}
                      </p>
                      <p className="mt-1">
                        Rol:{" "}
                        <span className="capitalize">
                          {user?.role || "Usuario"}
                        </span>
                      </p>
                    </div>
                    <Link
                      href="/admin/settings"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                    >
                      <Cog6ToothIcon className="h-5 w-5 mr-2" />
                      Configuración
                    </Link>
                    <button
                      onClick={logout}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                    >
                      <ArrowRightStartOnRectangleIcon className="h-5 w-5 mr-2" />
                      Cerrar sesión
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Botón de menú móvil */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
              aria-expanded={isOpen}
            >
              <span className="sr-only">Abrir menú principal</span>
              {isOpen ? (
                <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Menú móvil */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden"
          >
            <div className="pt-2 pb-3 space-y-1">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    className={`flex items-center px-4 py-2 text-base font-medium ${
                      isActive
                        ? "bg-indigo-50 text-indigo-700 border-l-4 border-indigo-500"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-800 border-l-4 border-transparent"
                    }`}
                  >
                    <link.icon className="h-5 w-5 mr-3" />
                    {link.name}
                  </Link>
                );
              })}
            </div>

            {/* Sección de perfil en móvil */}
            <div className="pt-4 pb-3 border-t border-gray-200 bg-gray-50">
              <div className="flex items-center px-4">
                <div className="flex-shrink-0">
                  <UserCircleIcon className="h-10 w-10 text-gray-400" />
                </div>
                <div className="ml-3">
                  <div className="text-base font-medium text-gray-800">
                    {user?.email || "Usuario"}
                  </div>
                  <div className="text-sm font-medium text-gray-500 capitalize">
                    Rol: {user?.role || "Usuario"}
                  </div>
                </div>
              </div>
              <div className="mt-3 space-y-1">
                <Link
                  href="/admin/settings"
                  className="flex items-center px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                >
                  <Cog6ToothIcon className="h-5 w-5 mr-3" />
                  Configuración
                </Link>
                <button
                  onClick={logout}
                  className="flex items-center w-full px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                >
                  <ArrowRightStartOnRectangleIcon className="h-5 w-5 mr-3" />
                  Cerrar sesión
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
