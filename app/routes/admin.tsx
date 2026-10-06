import { useState } from "react";
import { Outlet } from "@remix-run/react";
import AdminSidebar from "~/components/admin/AdminSidebar";
import AdminHeader from "~/components/admin/AdminHeader";

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Overlay mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={closeSidebar}
          aria-hidden="true"
        />
      )}

      {/* Sidebar - fixe sur desktop, slide-in sur mobile */}
      <div
        className={`
          fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0
        `}
      >
        <AdminSidebar onClose={closeSidebar} />
      </div>

      {/* Contenu principal */}
      <div className="flex-1 flex flex-col min-h-screen lg:ml-64">
        {/* Header - sticky en haut */}
        <div className="sticky top-0 z-30">
          <AdminHeader onMenuClick={toggleSidebar} />
        </div>

        {/* Contenu scrollable */}
        <main className="flex-1 overflow-y-auto pt-16">
          <div className="p-4 sm:p-6">
            <div className="max-w-7xl mx-auto">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
