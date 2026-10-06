import { Link, useLocation } from "@remix-run/react";
import { useState } from "react";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  MessageSquare,
  BarChart3,
  LogOut,
  X,
  Store,
  ArrowLeft,
  FileText,
  RotateCcw,
  Clock10,
  Users,
  CalendarCheck,
  Clock,
  ChevronDown,
  ChevronRight,
  Package as Package2
} from "lucide-react";

interface SellerSidebarProps {
  onClose?: () => void;
}

export default function SellerSidebar({ onClose }: SellerSidebarProps) {
  const location = useLocation();
  const [openMenus, setOpenMenus] = useState<Set<string>>(new Set());
  
  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, path: "/seller/dashboard" },
    {
      id: "products",
      label: "Boutique",
      icon: Package,
      path: "/seller/products",
      children: [
        { id: "products-list", label: "Produits", icon: Package2, path: "/seller/products" },
        { id: "product-photos", label: "Photos Acceuil", icon: Store, path: "/seller/NewProduits" },
        { id: "inventory", label: "Inventaire", icon: BarChart3, path: "/seller/inventory" }
      ]
    },
    { id: "orders", label: "Commandes", icon: ShoppingCart, path: "/seller/orders" },
    { id: "tickets", label: "Tickets", icon: MessageSquare, path: "/seller/support" },
    { id: "remboursements", label: "Remboursements", icon: RotateCcw, path: "/seller/refund" },
    { id: "blog", label: "Blog", icon: FileText, path: "/seller/blog" },
    { 
      id: "appointments",
      label: "Rendez-vous",
      icon: Clock10,
      path: "/seller/appointments",
      children: [
        { id: "appointments-list", label: "Rendez-vous", icon: Clock10, path: "/seller/appointments" },
        { id: "availability", label: "Création", icon: Clock, path: "/seller/createappointements" }
      ]
    },
    { id: "users", label: "Utilisateurs", icon: Users, path: "/seller/users" },
    { id: "installments", label: "Tranches", icon: CalendarCheck, path: "/seller/installments" },
  ];

  const toggleMenu = (menuId: string) => {
    const newOpenMenus = new Set(openMenus);
    if (newOpenMenus.has(menuId)) {
      newOpenMenus.delete(menuId);
    } else {
      newOpenMenus.add(menuId);
    }
    setOpenMenus(newOpenMenus);
  };

  const isMenuOpen = (menuId: string) => openMenus.has(menuId);

  const isActive = (path: string) => location.pathname === path;

  const isParentActive = (item: any) => {
    if (isActive(item.path)) return true;
    if (item.children) {
      return item.children.some((child: any) => isActive(child.path));
    }
    return false;
  };

  const handleLinkClick = () => {
    if (onClose) onClose();
  };

  return (
    <div className="fixed top-0 left-0 h-screen w-64 bg-gray-800 text-white flex flex-col z-50">
      {/* Header avec logo et bouton fermer */}
      <div className="p-4 sm:p-6 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <Link
            to="/seller/dashboard"
            className="flex items-center"
            onClick={handleLinkClick}
          >
            <div className="w-8 h-8 rounded overflow-hidden mr-3">
              <img
                src="/ADAWI _ LOGO FOND BLANC.jpg"
                alt="Logo Adawi"
                className="object-cover w-full h-full"
              />
            </div>
            <span className="text-lg font-semibold">Adawi Vendeur</span>
          </Link>

          {/* Close uniquement sur mobile */}
          {onClose && (
            <button
              onClick={onClose}
              className="lg:hidden p-2 text-gray-300 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          )}
        </div>
      </div>

      {/* Retour boutique */}
      <div className="p-4 border-b border-gray-700">
        <Link
          to="/boutique"
          onClick={onClose}
          className="flex items-center space-x-3 w-full px-3 py-3 text-adawi-brown bg-gray-900 hover:bg-gray-700 rounded-xl transition-all duration-200 group border border-adawi-gold/20 hover:border-adawi-gold/40"
        >
          <ArrowLeft className="w-5 h-5 flex-shrink-0 group-hover:text-adawi-gold" />
          <span className="font-medium truncate">Retour à la boutique</span>
          <Store className="w-4 h-4 ml-auto text-adawi-gold opacity-70 group-hover:opacity-100" />
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 sm:py-6">
        <ul className="space-y-1 sm:space-y-2 px-3 sm:px-4">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const hasChildren = item.children && item.children.length > 0;
            const isOpen = isMenuOpen(item.id);
            const isItemActive = isParentActive(item);

            return (
              <li key={item.id}>
                <div>
                  <div
                    className={`w-full flex items-center px-3 sm:px-4 py-2 sm:py-3 rounded-lg transition-colors duration-200 text-sm sm:text-base cursor-pointer ${
                      isItemActive
                        ? "bg-adawi-gold text-black"
                        : "text-gray-300 hover:bg-gray-700 hover:text-white"
                    }`}
                    onClick={() => hasChildren ? toggleMenu(item.id) : (() => {
                      if (item.path) {
                        window.location.href = item.path;
                      }
                      handleLinkClick();
                    })()}
                  >
                    <Icon className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3 flex-shrink-0" />
                    <span className="flex-1 truncate">{item.label}</span>
                    {hasChildren && (
                      <div className="ml-2">
                        {isOpen ? (
                          <ChevronDown className="w-4 h-4" />
                        ) : (
                          <ChevronRight className="w-4 h-4" />
                        )}
                      </div>
                    )}
                  </div>

                  {/* Sous-menu */}
                  {hasChildren && isOpen && (
                    <ul className="ml-6 mt-1 space-y-1">
                      {item.children.map((child: any) => {
                        const ChildIcon = child.icon;
                        const isChildActive = isActive(child.path);

                        return (
                          <li key={child.id}>
                            <Link
                              to={child.path}
                              onClick={handleLinkClick}
                              className={`w-full flex items-center px-3 sm:px-4 py-2 sm:py-3 rounded-lg transition-colors duration-200 text-sm sm:text-base ${
                                isChildActive
                                  ? "bg-adawi-gold text-black"
                                  : "text-gray-400 hover:bg-gray-700 hover:text-white"
                              }`}
                            >
                              <ChildIcon className="w-3 h-3 sm:w-4 sm:h-4 mr-2 sm:mr-3 flex-shrink-0" />
                              <span className="flex-1 truncate">{child.label}</span>
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Déconnexion */}
      <div className="p-4 border-t border-gray-700">
        <form method="post" action="/logout" className="w-full">
          <button
            type="submit"
            className="flex items-center space-x-3 w-full px-3 py-3 text-red-500 hover:bg-red-900/20 rounded-xl transition-all duration-200 group"
          >
            <LogOut className="w-5 h-5 flex-shrink-0 group-hover:scale-110 transition-transform" />
            <span className="font-medium truncate">Se déconnecter</span>
          </button>
        </form>
      </div>
    </div>
  );
}