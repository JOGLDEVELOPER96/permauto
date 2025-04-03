export default function DashboardFooter() {
  return (
    <footer className="bg-white border-t border-gray-200 mt-12">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-500">
            &copy; {new Date().getFullYear()} Desarrollo ZGROUP. Todos los
            derechos reservados.
          </div>
          <div className="text-sm text-gray-500">Versión 1.0.0</div>
        </div>
      </div>
    </footer>
  );
}
