"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { ChevronRightIcon, HomeIcon } from "@heroicons/react/24/solid";

export default function AdminBreadcrumb() {
  const pathname = usePathname();

  // Ignorar si estamos en la página principal de admin
  if (pathname === "/admin") return null;

  // Construir las migas de pan
  const pathSegments = pathname.split("/").filter(Boolean);

  // Mapear segmentos a nombres más amigables
  const segmentNames = {
    admin: "Admin",
    users: "Usuarios",
    products: "Productos",
    settings: "Configuración",
    // Añadir más mapeos según sea necesario
  };

  return (
    <nav className="flex mb-6" aria-label="Breadcrumb">
      <ol className="inline-flex items-center space-x-1 md:space-x-3">
        <li className="inline-flex items-center">
          <Link
            href="/admin"
            className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-blue-600"
          >
            <HomeIcon className="w-4 h-4 mr-2" />
            Admin
          </Link>
        </li>

        {pathSegments.slice(1).map((segment, index) => {
          const segmentPath = `/${pathSegments.slice(0, index + 2).join("/")}`;
          const isLast = index === pathSegments.slice(1).length - 1;

          return (
            <li key={segment}>
              <div className="flex items-center">
                <ChevronRightIcon className="w-5 h-5 text-gray-400" />
                {isLast ? (
                  <span className="ml-1 text-sm font-medium text-gray-500 md:ml-2">
                    {segmentNames[segment] || segment}
                  </span>
                ) : (
                  <Link
                    href={segmentPath}
                    className="ml-1 text-sm font-medium text-gray-700 hover:text-blue-600 md:ml-2"
                  >
                    {segmentNames[segment] || segment}
                  </Link>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
