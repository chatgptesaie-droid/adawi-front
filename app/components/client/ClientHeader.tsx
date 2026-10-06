import { useState } from "react";
import { Menu, Search } from "lucide-react";

interface ClientHeaderProps {
  onMenuClick: () => void;
  userName?: string;
}

export default function ClientHeader({ onMenuClick, userName = "Client" }: ClientHeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 lg:left-64 z-50 bg-white border-b border-gray-200 px-3 sm:px-4 lg:px-6 py-2 sm:py-3 lg:py-4">
      <div className="flex items-center justify-between">
        {/* Left side */}
        <div className="flex items-center space-x-2 sm:space-x-3 lg:space-x-4 min-w-0 flex-1">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-1.5 sm:p-2 rounded-lg hover:bg-gray-100 transition-colors flex-shrink-0"
          >
            <Menu className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
          </button>
         

          <div className="min-w-0 flex-1">
            {/* Version mobile - titre compact */}
            <div className="block md:hidden">
              <h1 className="text-base sm:text-lg font-semibold text-adawi-brown truncate">
                {userName}
              </h1>
            </div>
            

            {/* Version desktop - titre complet */}
            <div className="hidden md:block">
              <h1 className="text-lg lg:text-xl font-semibold text-adawi-brown">
                Bonjour, {userName}
              </h1>
              <p className="text-xs lg:text-sm text-gray-500">
                Gérez votre compte et vos commandes
              </p>
            </div>
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center space-x-2 sm:space-x-3 lg:space-x-4 flex-shrink-0">
          {/* Bouton de recherche pour mobile
          <button className="md:hidden p-1.5 sm:p-2 rounded-lg hover:bg-gray-100 transition-colors">
            <Search className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
          </button> */}
          

          {/* Barre de recherche pour desktop
          <div className="hidden md:flex items-center bg-gray-50 rounded-lg px-3 py-2 min-w-0 w-48 lg:w-64">
            <Search className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0" />
            <input
              type="text"
              placeholder="Rechercher..."
              className="bg-transparent text-sm text-gray-700 placeholder-gray-400 outline-none min-w-0 flex-1"
            />
          </div> */}

          {/* Notifications - optionnel */}
          {/* <button className="hidden sm:block p-2 rounded-lg hover:bg-gray-100 transition-colors relative">
            <Bell className="w-5 h-5 text-gray-600" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
          </button> */}
         

          {/* Avatar */}
          <div className="w-7 h-7 sm:w-8 sm:h-8 lg:w-9 lg:h-9 bg-gradient-to-br from-adawi-gold to-adawi-brown rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-white font-medium text-xs sm:text-sm">
              {userName.charAt(0).toUpperCase()}
            </span>
          </div>

          {/* Menu dropdown pour mobile */}
          <div className="relative sm:hidden">
            <button className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
              <div className="w-1 h-1 bg-gray-400 rounded-full mb-1"></div>
              <div className="w-1 h-1 bg-gray-400 rounded-full mb-1"></div>
              <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}