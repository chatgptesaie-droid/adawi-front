import { useState } from "react";
import SellerSidebar from "./SellerSidebar";
import SellerHeader from "./SellerHeader";

interface SellerLayoutProps {
  children: React.ReactNode;
  userName?: string;
}

export default function SellerLayout({ children, userName }: SellerLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Overlay mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
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
        <SellerSidebar onClose={() => setSidebarOpen(false)} />
      </div>

      {/* Contenu principal */}
      <div className="flex-1 flex flex-col min-h-screen lg:ml-64">
        {/* Header sticky */}
        <div className="sticky top-0 z-30">
          <SellerHeader
            onMenuClick={() => setSidebarOpen(true)}
            userName={userName}
          />
        </div>

        {/* Contenu scrollable */}
        <main className="flex-1 overflow-y-auto pt-16">
          <div className="p-4 sm:p-6">
            <div className="max-w-7xl mx-auto">{children}</div>
          </div>
        </main>
      </div>
    </div>
  );
}
