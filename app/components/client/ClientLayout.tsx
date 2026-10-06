import { useState } from "react";
import ClientSidebar from "./ClientSidebar";
import ClientHeader from "./ClientHeader";

interface ClientLayoutProps {
  children: React.ReactNode;
  userName?: string;
}

export default function ClientLayout({ children, userName }: ClientLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Overlay mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
          lg:sticky lg:top-0 lg:h-screen
          ${sidebarOpen ? "fixed inset-y-0 left-0 z-50 w-64" : "hidden"}
          lg:block lg:w-64 lg:shrink-0
          transform transition-transform duration-300 ease-in-out
        `}
      >
        <ClientSidebar onClose={() => setSidebarOpen(false)} />
      </div>

      {/* Contenu principal */}
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        {/* Header */}
        <div className="flex-shrink-0 z-30 relative">
          <ClientHeader
            onMenuClick={() => setSidebarOpen(true)}
            userName={userName}
          />
        </div>

        {/* Page content */}
        <main className="flex-1 overflow-auto pt-24 ">
          <div className="p-4 sm:p-6">
            <div className="max-w-7xl mx-auto">{children}</div>
          </div>
        </main>
      </div>
    </div>
  );
}
