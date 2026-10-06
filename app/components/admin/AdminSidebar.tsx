import { Link, useLocation } from "@remix-run/react";
import {
  LayoutDashboard,
  Users,
  Package,
  ShoppingCart,
  MessageSquare,
  BarChart3,
  Settings,
  HelpCircle,
  Box,
  Mail,
  LogOut,
  X,
  TableOfContents,
  Clock,
  ArrowLeft,
  Store,
  FileText,
  RotateCcw,
  ChevronDown,
  ChevronRight,
  Package as Package2,
  TicketPercent,
  CreditCard,
  Repeat
} from "lucide-react";
import { Children, useState } from "react";
import { checkSlotAvailability } from "~/utils/availability.client";

interface AdminSidebarProps {
  onClose?: () => void;
}

export default function AdminSidebar({ onClose }: AdminSidebarProps) {
  const location = useLocation();
  const [openMenus, setOpenMenus] = useState<Set<string>>(new Set());

  const menuItems = [
    { id: "dashboard", label: "Vue d'ensemble", icon: LayoutDashboard, path: "/admin/dashboard" },
    { id: "users", label: "Utilisateurs", icon: Users, path: "/admin/users" },
    {
      id: "products",
      label: "Boutique",
      icon: Store,
      path: "/admin/products",
      children: [

        { id: "products", label: "Produits", icon: Package2, path: "/admin/products" },
        { id: "product-photos", label: "Photos Acceuil", icon: Package, path: "/admin/NewProduits" },
        { id: "categories", label: "Catégories", icon: Box, path: "/admin/categories" }
      ]
    },
    { id: "orders", label: "Commandes", icon: ShoppingCart, path: "/admin/orders" },
    { id: "Tickets", label: "Tickets", icon: MessageSquare, path: "/admin/support", },
    { id: "rapports", label: "Rapports", icon: BarChart3, path: "/admin/rapports" },
    { id: "Blogs", label: "Blog", icon: FileText, path: "/admin/blog" },
    { id: "refunds", label: "Remboursements", icon: RotateCcw, path: "/admin/refunds" },
    {
      id: "Rendez-Vous",
      label: "Rendez-Vous",
      icon: Clock,
      path: "/admin/appointments",
      children: [

        { id: "appointments", label: "Rendez-Vous", icon: Clock, path: "/admin/appointments" },
        { id: "availability", label: "Création", icon: Clock, path: "/admin/createappointements" },
      ]
    },
    // { id: "availability", label: "Disponibilités", icon: Clock, path: "/admin/availability" },
    { id: "promotions", label: "Promotions", icon: TicketPercent, path: "/admin/promotions" },
    { id: "installments", label: "Versements", icon: CreditCard, path: "/admin/installments" },
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
    // Fermer la sidebar sur mobile après avoir cliqué sur un lien
    if (onClose) {
      onClose();
    }
  };

  return (
    <div className="fixed top-0 left-0 h-screen w-64 bg-gray-800 text-white flex flex-col z-50">
      {/* Header avec bouton de fermeture sur mobile */}
      <div className="p-4 sm:p-6 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <Link
            to="/admin/dashboard"
            className="flex items-center"
            onClick={handleLinkClick}
          >
            <div className="w-8 h-8 rounded overflow-hidden mr-3">
              <img src="/ADAWI _ LOGO FOND BLANC.jpg" alt="Logo Adawi" className="object-cover w-full h-full" />
            </div>
            <span className="text-lg font-semibold">Adawi Admin</span>
          </Link>

          {/* Bouton de fermeture visible uniquement sur mobile */}
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
      <div className="p-4 border-b border-gray-200">
        <Link
          to="/boutique"
          onClick={onClose}
          className="flex items-center space-x-3 w-full px-3 py-3 text-adawi-brown hover:bg-adawi-beige rounded-xl transition-all duration-200 group border border-adawi-gold/20 hover:border-adawi-gold/40"
        >
          <ArrowLeft className="w-5 h-5 transition-colors flex-shrink-0 group-hover:text-adawi-gold" />
          <span className="font-medium truncate">Retour à la boutique</span>
          <Store className="w-4 h-4 ml-auto text-adawi-gold opacity-70 group-hover:opacity-100 transition-opacity" />
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
                    className={`w-full flex items-center px-3 sm:px-4 py-2 sm:py-3 rounded-lg transition-colors duration-200 text-sm sm:text-base cursor-pointer ${isItemActive
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
                              className={`w-full flex items-center px-3 sm:px-4 py-2 sm:py-3 rounded-lg transition-colors duration-200 text-sm sm:text-base ${isChildActive
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

      {/* Bottom Section */}
      <div className="p-4 border-t border-gray-200">
        <form method="post" action="/logout" className="w-full">
          <button
            type="submit"
            className="flex items-center space-x-3 w-full px-3 py-3 text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200 group"
          >
            <LogOut className="w-5 h-5 group-hover:scale-110 transition-transform flex-shrink-0" />
            <span className="font-medium truncate">Se déconnecter</span>
          </button>
        </form>
      </div>
    </div>
  );
}
