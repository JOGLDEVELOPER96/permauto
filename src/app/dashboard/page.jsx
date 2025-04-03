"use client";

// React hooks
import { useState, useEffect } from "react";

// Next.js
import dynamic from "next/dynamic";

// Contextos
import { useAuth } from "@/context/AuthContext";

// Utilidades
import { fetchDashboardData } from "@/lib/dashboardUtils";

// Componentes estáticos
import StatCards from "@/components/dashboard/StatCards";
import ActivitySection from "@/components/dashboard/ActivitySection";
import DashboardFooter from "@/components/dashboard/DashboardFooter";
import LoadingSpinner from "@/components/dashboard/LoadingSpinner";

// Librería de drag and drop
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

// Componentes dinámicos (cargados del lado del cliente)
const ChartSection = dynamic(
  () => import("@/components/dashboard/ChartSection"),
  {
    ssr: false,
    loading: () => (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="bg-white rounded-lg shadow-lg p-6 h-[300px] flex items-center justify-center">
          <div className="animate-pulse flex flex-col items-center w-full">
            <div className="h-6 w-48 bg-gray-200 rounded mb-4"></div>
            <div className="h-48 w-full bg-gray-200 rounded"></div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-lg p-6 h-[300px] flex items-center justify-center">
          <div className="animate-pulse flex flex-col items-center w-full">
            <div className="h-6 w-48 bg-gray-200 rounded mb-4"></div>
            <div className="h-48 w-full bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    ),
  }
);

const TreeGraph = dynamic(() => import("@/components/dashboard/TreeGraph"), {
  ssr: false,
  loading: () => (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-8 h-[500px] flex items-center justify-center">
      <div className="animate-pulse flex flex-col items-center">
        <div className="h-8 w-64 bg-gray-200 rounded mb-4"></div>
        <div className="h-64 w-full bg-gray-200 rounded"></div>
      </div>
    </div>
  ),
});

// Componente envoltorio para elementos arrastrables
const SortableItem = ({ id, children }) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} className="mb-6 relative group">
      <div
        {...attributes}
        {...listeners}
        className="absolute -top-3 -right-3 bg-indigo-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-move z-10"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6h16M4 12h16m-7 6h7"
          />
        </svg>
      </div>
      {children}
    </div>
  );
};

export default function Dashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user, logout } = useAuth();

  // Estado para el orden de los componentes - eliminado "profile" del orden predeterminado
  const [componentsOrder, setComponentsOrder] = useState(() => {
    // Intentar recuperar el orden guardado en localStorage
    if (typeof window !== "undefined") {
      const savedOrder = localStorage.getItem("dashboardOrder");
      // Filtrar para eliminar 'profile' si existe en el orden guardado
      const defaultOrder = ["stats", "charts", "tree", "activity"];
      return savedOrder
        ? JSON.parse(savedOrder).filter((item) => item !== "profile")
        : defaultOrder;
    }
    return ["stats", "charts", "tree", "activity"];
  });

  // Configurar sensores para drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    async function loadDashboardData() {
      try {
        setLoading(true);
        const data = await fetchDashboardData();

        // Registrar los datos recibidos para depuración
        console.log("Datos recibidos:", data);

        if (!data) {
          throw new Error("No se recibieron datos");
        }

        setDashboardData(data);
        setError(null);
      } catch (err) {
        console.error("Error al cargar datos del dashboard:", err);
        setError(err.message || "Error al cargar los datos");
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, []);

  // Guardar el orden en localStorage cuando cambie
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("dashboardOrder", JSON.stringify(componentsOrder));
    }
  }, [componentsOrder]);

  const handleLogout = () => {
    logout();
    window.location.href = "/login";
  };

  const handleRetry = () => {
    window.location.reload();
  };

  // Manejar el final del arrastre
  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      setComponentsOrder((items) => {
        const oldIndex = items.indexOf(active.id);
        const newIndex = items.indexOf(over.id);

        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  // Función para renderizar componentes según el orden - eliminado el caso "profile"
  const renderComponent = (componentId) => {
    switch (componentId) {
      case "stats":
        return dashboardData?.stats ? (
          <SortableItem key="stats" id="stats">
            <StatCards data={dashboardData.stats} />
          </SortableItem>
        ) : null;
      case "charts":
        return dashboardData ? (
          <SortableItem key="charts" id="charts">
            <ChartSection data={dashboardData} />
          </SortableItem>
        ) : null;
      case "tree":
        return dashboardData ? (
          <SortableItem key="tree" id="tree">
            <TreeGraph data={dashboardData} />
          </SortableItem>
        ) : null;
      case "activity":
        return dashboardData?.authorizations ? (
          <SortableItem key="activity" id="activity">
            <ActivitySection data={dashboardData.authorizations} />
          </SortableItem>
        ) : null;
      default:
        return null;
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error || !dashboardData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center p-6 bg-white rounded-lg shadow-lg max-w-md">
          <h2 className="text-xl font-medium text-gray-900 mb-4">
            Error al cargar los datos
          </h2>
          <p className="text-gray-600 mb-6">
            {error || "No se pudieron obtener los datos del dashboard"}
          </p>
          <button
            onClick={handleRetry}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Panel de Control</h1>

          {/* Botones de acción */}
          <div className="flex space-x-2">
            <button
              onClick={() => {
                // Restablecer el orden predeterminado (sin "profile")
                setComponentsOrder(["stats", "charts", "tree", "activity"]);
              }}
              className="px-3 py-1 bg-gray-200 text-gray-700 rounded text-xs hover:bg-gray-300"
            >
              Restablecer orden
            </button>

            <button
              onClick={() =>
                console.log("Estructura de datos actual:", dashboardData)
              }
              className="px-3 py-1 bg-gray-200 text-gray-700 rounded text-xs hover:bg-gray-300"
            >
              Debug: Ver datos en consola
            </button>
          </div>
        </div>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={componentsOrder}
            strategy={verticalListSortingStrategy}
          >
            <div className="grid grid-cols-1 gap-6">
              {componentsOrder.map((componentId) =>
                renderComponent(componentId)
              )}
            </div>
          </SortableContext>
        </DndContext>
      </div>

      <DashboardFooter />
    </div>
  );
}
