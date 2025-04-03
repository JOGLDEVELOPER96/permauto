"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext"; // Ajusta la ruta según tu estructura
import {
  Bars3Icon,
  XMarkIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
  HomeIcon,
  ClipboardDocumentListIcon,
  UserGroupIcon,
  ShieldCheckIcon,
  UserIcon,
} from "@heroicons/react/24/outline";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const pathname = usePathname();
  const { user, logout } = useAuth();

  // Cerrar menú móvil al cambiar de ruta
  useEffect(() => {
    setIsOpen(false);
    setShowProfileMenu(false);
  }, [pathname]);

  // Determinar enlaces según el rol del usuario
  const getNavLinks = () => {
    const isAdmin =
      user?.role === "admin" ||
      user?.role === "Administrador" ||
      user?.role === "administrador";

    if (isAdmin) {
      return [
        { name: "Dashboard", href: "/dashboard", icon: HomeIcon },
        {
          name: "Ver registro del Security",
          href: "/admin/security-logs",
          icon: ShieldCheckIcon,
        },
        {
          name: "Ver registro del SubAdmin",
          href: "/admin/subadmin-logs",
          icon: ClipboardDocumentListIcon,
        },
        {
          name: "Gestión de Usuarios",
          href: "/admin/users",
          icon: UserGroupIcon,
        },
      ];
    }

    return [
      { name: "Dashboard", href: "/dashboard", icon: HomeIcon },
      {
        name: "Autorizaciones Empresas",
        href: "/dashboard/company-auth",
        icon: ClipboardDocumentListIcon,
      },
      {
        name: "Permisos Trabajadores",
        href: "/dashboard/worker-permissions",
        icon: UserIcon,
      },
    ];
  };

  const navLinks = getNavLinks();

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/dashboard">
                <span className="text-xl font-bold text-indigo-600">
                  PermAuto
                </span>
              </Link>
            </div>

            {/* Enlaces de navegación para escritorio */}
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                      isActive
                        ? "border-indigo-500 text-gray-900"
                        : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                    }`}
                  >
                    <link.icon className="h-5 w-5 mr-1" />
                    {link.name}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Perfil de usuario */}
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <span className="sr-only">Abrir menú de usuario</span>
                <div className="flex items-center text-gray-700 hover:text-indigo-600">
                  <UserCircleIcon className="h-8 w-8" />
                  <span className="ml-2">{user?.email || "Usuario"}</span>
                </div>
              </button>

              {/* Menú desplegable de perfil */}
              {showProfileMenu && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-10"
                >
                  <div className="px-4 py-2 text-xs text-gray-500">
                    Rol: {user?.role || "Usuario"}
                  </div>
                  <div className="border-t border-gray-100"></div>
                  <button
                    onClick={logout}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                  >
                    <ArrowRightOnRectangleIcon className="h-5 w-5 mr-2" />
                    Cerrar sesión
                  </button>
                </motion.div>
              )}
            </div>
          </div>

          {/* Botón de menú móvil */}
          <div className="flex items-center sm:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
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
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="sm:hidden"
        >
          <div className="pt-2 pb-3 space-y-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`flex items-center pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                    isActive
                      ? "bg-indigo-50 border-indigo-500 text-indigo-700"
                      : "border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800"
                  }`}
                >
                  <link.icon className="h-5 w-5 mr-3" />
                  {link.name}
                </Link>
              );
            })}
          </div>

          {/* Perfil en menú móvil */}
          <div className="pt-4 pb-3 border-t border-gray-200">
            <div className="flex items-center px-4">
              <div className="flex-shrink-0">
                <UserCircleIcon className="h-10 w-10 text-gray-400" />
              </div>
              <div className="ml-3">
                <div className="text-base font-medium text-gray-800">
                  {user?.email || "Usuario"}
                </div>
                <div className="text-sm font-medium text-gray-500">
                  Rol: {user?.role || "Usuario"}
                </div>
              </div>
            </div>
            <div className="mt-3 space-y-1">
              <button
                onClick={logout}
                className="flex items-center w-full px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
              >
                <ArrowRightOnRectangleIcon className="h-5 w-5 mr-3" />
                Cerrar sesión
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </nav>
  );
}
