import React, { useState, useEffect, useRef, useCallback } from "react";
import { Link, useLocation, useNavigate } from "@remix-run/react";
import { useCart } from "~/contexts/CartContext";
import { useUser } from "~/hooks/useUser";

const CompactHeader: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const currentPath = location.pathname;
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [isCompactMode, setIsCompactMode] = useState(false);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [isClient, setIsClient] = useState(false);

    const menuRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);
    const searchRef = useRef<HTMLInputElement>(null);
    const headerRef = useRef<HTMLDivElement>(null);
    const navRef = useRef<HTMLElement>(null);
    const actionsRef = useRef<HTMLDivElement>(null);
    const logoRef = useRef<HTMLAnchorElement>(null);

    const { state } = useCart();
    const { user } = useUser();

    console.log("Current User:", user);

    const navItems = [
        { name: "Maison", to: "/" },
        { name: "Boutique", to: "/boutique" },
        { name: "Blog", to: "/blog" },
        { name: "A-propos", to: "/a-propos" },
        { name: "Contact", to: "/contact" },
    ];

    const getDashboardRoute = () => {
        if (!user) return "/login";

        switch (user.role?.toLowerCase()) {
            case "admin":
                return "/admin/dashboard";
            case "vendeur":
            case "seller":
                return "/seller/dashboard";
            case "client":
            case "customer":
            default:
                return "/client/user";
        }
    };

    // Obtenir le label du rôle en français
    const getRoleLabel = () => {
        if (!user) return null;
        
        switch (user.role?.toLowerCase()) {
            case "admin":
                return "Admin";
            case "vendeur":
            case "seller":
                return "Vendeur";
            case "client":
            case "customer":
            default:
                return "Client";
        }
    };

    // Obtenir les initiales de l'utilisateur
    const getUserInitials = () => {
        if (!user) return "";
        
        const firstName = user.firstName || user.first_name || "";
        const lastName = user.lastName || user.last_name || "";
        
        if (firstName && lastName) {
            return `${firstName[0]}${lastName[0]}`.toUpperCase();
        } else if (firstName) {
            return firstName.substring(0, 2).toUpperCase();
        } else if (user.email) {
            return user.email.substring(0, 2).toUpperCase();
        }
        
        return "U";
    };

    useEffect(() => {
        setIsClient(true);
    }, []);

    const checkIfCompactModeNeeded = useCallback(() => {
        if (!isClient || !headerRef.current || !navRef.current || !actionsRef.current || !logoRef.current) {
            return;
        }

        const headerWidth = headerRef.current.offsetWidth;
        const logoWidth = logoRef.current.offsetWidth;
        const navWidth = navRef.current.scrollWidth;
        const actionsWidth = actionsRef.current.offsetWidth;

        const totalNeededWidth = logoWidth + navWidth + actionsWidth + 40;
        const shouldBeCompact = totalNeededWidth > headerWidth;

        if (shouldBeCompact !== isCompactMode) {
            setIsTransitioning(true);
            setTimeout(() => {
                setIsCompactMode(shouldBeCompact);
                setIsTransitioning(false);
            }, 150);
        }
    }, [isCompactMode, isClient]);

    useEffect(() => {
        if (!isClient) return;

        const resizeObserver = new ResizeObserver(() => {
            checkIfCompactModeNeeded();
        });

        if (headerRef.current) {
            resizeObserver.observe(headerRef.current);
        }

        checkIfCompactModeNeeded();

        return () => {
            resizeObserver.disconnect();
        };
    }, [checkIfCompactModeNeeded, isClient]);

    useEffect(() => {
        setIsMobileMenuOpen(false);
        // Sur /search, synchroniser la valeur de l'input avec ?q= de l'URL
        if (location.pathname === '/search') {
            const params = new URLSearchParams(location.search);
            const q = params.get('q') || '';
            setSearchQuery(q);
            // Donner le focus à l'input du header après navigation
            setTimeout(() => searchRef.current?.focus(), 100);
        } else {
            setSearchQuery('');
        }
    }, [location.pathname, location.search]);

    useEffect(() => {
        if (!isClient) return;

        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as HTMLElement;
            if (
                isMobileMenuOpen &&
                menuRef.current &&
                buttonRef.current &&
                !menuRef.current.contains(target) &&
                !buttonRef.current.contains(target)
            ) {
                setIsMobileMenuOpen(false);
            }
        };

        if (isMobileMenuOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isMobileMenuOpen, isClient]);

    useEffect(() => {
        if (!isClient) return;

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape' && isMobileMenuOpen) {
                setIsMobileMenuOpen(false);
                buttonRef.current?.focus();
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [isMobileMenuOpen, isClient]);

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    const handleSearchFocus = () => {
        if (location.pathname !== '/search') {
            navigate('/search');
        }
    };

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
            setSearchQuery('');
        }
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearchQuery(value);
        // Si on est déjà sur /search, mettre à jour ?q= en temps réel
        if (location.pathname === '/search') {
            navigate(`/search?q=${encodeURIComponent(value)}`, { replace: true });
        }
    };

    const shouldShowCompactMode = () => {
        if (!isClient) {
            return false;
        }
        return isCompactMode || (typeof window !== 'undefined' && window.innerWidth < 1024);
    };

    return (
        <header className="bg-adawi-beige-dark border-b border-gray-200 sticky top-0 z-40">
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
                <div
                    ref={headerRef}
                    className="flex items-center justify-between h-14 relative"
                >
                    {/* Logo */}
                    <Link
                        ref={logoRef}
                        to="/"
                        className="flex items-center flex-shrink-0 z-10"
                    >
                        <img
                            src="/lOGO_FOND_BLANC-removebg.png"
                            alt="Logo Adawi"
                            className="w-32 sm:w-40 h-auto transition-all duration-300"
                        />
                    </Link>

                    {/* Navigation Desktop */}
                    <nav
                        ref={navRef}
                        className={`items-center space-x-4 lg:space-x-6 transition-all duration-300 ${shouldShowCompactMode() || isTransitioning
                            ? 'hidden opacity-0'
                            : 'hidden lg:flex opacity-100'
                            }`}
                    >
                        {navItems.map((item) => (
                            <Link
                                key={item.to}
                                to={item.to}
                                className={`text-sm lg:text-lg font-medium transition-all duration-200 px-2 py-1 rounded whitespace-nowrap ${currentPath === item.to
                                    ? "text-black underline decoration-adawi-gold decoration-2 underline-offset-4"
                                    : "text-black hover:text-adawi-gold hover:bg-adawi-beige/50"
                                    }`}
                            >
                                {item.name}
                            </Link>
                        ))}
                    </nav>

                    {/* Actions Desktop */}
                    <div
                        ref={actionsRef}
                        className={`items-center space-x-2 lg:space-x-3 transition-all duration-300 ${shouldShowCompactMode() || isTransitioning
                            ? 'hidden opacity-0'
                            : 'hidden lg:flex opacity-100'
                            }`}
                    >
                        {/* Search Bar */}
                        <form
                            onSubmit={handleSearchSubmit}
                            className="flex items-center bg-white rounded-full border border-adawi-gold/30 overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200"
                        >
                            <input
                                ref={searchRef}
                                type="text"
                                value={searchQuery}
                                onChange={handleSearchChange}
                                onFocus={handleSearchFocus}
                                placeholder="Rechercher..."
                                className="w-32 lg:w-48 px-3 py-1.5 text-sm focus:outline-none focus:ring-0 border-0 bg-transparent text-black placeholder-adawi-brown-light"
                            />
                            <button
                                type="submit"
                                className="text-adawi-brown hover:text-adawi-gold transition-colors p-1.5 border-l border-adawi-gold/20 bg-adawi-beige/30 hover:bg-adawi-gold/10"
                                aria-label="Lancer la recherche"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </button>
                        </form>

                        {/* User Account Button - Version améliorée */}
                        {user ? (
                            <Link
                                to={getDashboardRoute()}
                                className="relative flex items-center gap-2 px-3 py-1.5 rounded-full bg-adawi-gold/10 border border-adawi-gold/30 hover:bg-adawi-gold/20 hover:border-adawi-gold/50 transition-all duration-200 group"
                                aria-label="Mon compte"
                            >
                                {/* Avatar avec initiales */}
                                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-adawi-gold to-adawi-brown flex items-center justify-center text-white text-xs font-semibold shadow-sm group-hover:shadow-md transition-shadow duration-200">
                                    {getUserInitials()}
                                </div>
                                
                                {/* Texte et indicateur de connexion */}
                                <div className="flex flex-col items-start">
                                    <span className="text-xs font-semibold text-adawi-brown group-hover:text-adawi-gold transition-colors duration-200">
                                        Mon Compte
                                    </span>
                                    <span className="text-[10px] text-adawi-brown-light">
                                        {getRoleLabel()}
                                    </span>
                                </div>
                                
                                {/* Indicateur de statut connecté */}
                                <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-adawi-beige-dark animate-pulse"></div>
                            </Link>
                        ) : (
                            <Link
                                to="/login"
                                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-adawi-gold/30 hover:bg-adawi-gold/10 hover:border-adawi-gold/50 transition-all duration-200 group"
                                aria-label="Se connecter"
                            >
                                <svg className="w-5 h-5 text-adawi-brown group-hover:text-adawi-gold transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                                <span className="text-xs font-medium text-adawi-brown group-hover:text-adawi-gold transition-colors duration-200">
                                    Connexion
                                </span>
                            </Link>
                        )}

                        {/* Cart Icon */}
                        <Link
                            to="/panier"
                            className="text-adawi-brown hover:text-adawi-gold transition-all duration-200 p-1.5 rounded-full hover:bg-adawi-beige/50 relative inline-flex items-center justify-center group"
                            aria-label="Panier"
                        >
                            <svg className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                    d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2 4h12m-8 4a1 1 0 11-2 0 1 1 0 012 0zm8 0a1 1 0 11-2 0 1 1 0 012 0z" />
                            </svg>
                            {state.itemCount > 0 && (
                                <span className="absolute -top-1 -right-1 bg-adawi-gold text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium animate-pulse">
                                    {state.itemCount > 99 ? '99+' : state.itemCount}
                                </span>
                            )}
                        </Link>
                    </div>

                    {/* Actions Compactes - Mobile */}
                    <div className={`flex items-center space-x-2 relative transition-all duration-300 ${!isClient
                        ? 'lg:hidden opacity-100'
                        : shouldShowCompactMode()
                            ? 'opacity-100'
                            : 'lg:hidden opacity-100'
                        }`}>
                        {/* Panier compact */}
                        <Link
                            to="/panier"
                            className="text-adawi-brown hover:text-adawi-gold transition-all duration-200 p-2 rounded-full hover:bg-adawi-beige/50 relative inline-flex items-center justify-center group"
                            aria-label="Panier"
                        >
                            <svg className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                    d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2 4h12m-8 4a1 1 0 11-2 0 1 1 0 012 0zm8 0a1 1 0 11-2 0 1 1 0 012 0z" />
                            </svg>
                            {state.itemCount > 0 && (
                                <span className="absolute -top-1 -right-1 bg-adawi-gold text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium animate-pulse">
                                    {state.itemCount > 99 ? '99+' : state.itemCount}
                                </span>
                            )}
                        </Link>

                        {/* Menu Hamburger */}
                        <button
                            ref={buttonRef}
                            onClick={toggleMobileMenu}
                            className="text-adawi-brown hover:text-adawi-gold transition-all duration-200 p-2 rounded-full hover:bg-adawi-beige/50 group relative"
                            aria-label={isMobileMenuOpen ? "Fermer le menu" : "Ouvrir le menu"}
                            aria-expanded={isMobileMenuOpen}
                            aria-haspopup="true"
                        >
                            {/* Indicateur de connexion sur le burger menu */}
                            {user && (
                                <div className="absolute top-1 right-1 w-2 h-2 bg-green-500 rounded-full border border-adawi-beige-dark"></div>
                            )}
                            
                            <div className="w-5 h-5 flex flex-col justify-center items-center">
                                <span
                                    className={`block w-5 h-0.5 bg-current transition-all duration-300 ease-in-out ${isMobileMenuOpen ? 'rotate-45 translate-y-1' : ''
                                        }`}
                                />
                                <span
                                    className={`block w-5 h-0.5 bg-current transition-all duration-300 ease-in-out mt-1 ${isMobileMenuOpen ? 'opacity-0 scale-0' : ''
                                        }`}
                                />
                                <span
                                    className={`block w-5 h-0.5 bg-current transition-all duration-300 ease-in-out mt-1 ${isMobileMenuOpen ? '-rotate-45 -translate-y-1' : ''
                                        }`}
                                />
                            </div>
                        </button>

                        {/* Menu Mobile Dropdown */}
                        <div
                            ref={menuRef}
                            className={`absolute top-full right-0 mt-3 w-72 bg-white rounded-2xl shadow-2xl border border-adawi-gold/20 py-4 z-50 transition-all duration-300 ease-out transform origin-top-right ${isMobileMenuOpen
                                ? 'opacity-100 scale-100 translate-y-0'
                                : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'
                                }`}
                            role="menu"
                            aria-orientation="vertical"
                        >
                            {/* User Info Section - Mobile */}
                            {user && (
                                <div className="px-4 pb-4 mb-4 border-b border-adawi-gold/10">
                                    <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-adawi-gold/10 to-adawi-beige/30">
                                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-adawi-gold to-adawi-brown flex items-center justify-center text-white text-sm font-bold shadow-md">
                                            {getUserInitials()}
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm font-semibold text-adawi-brown">
                                                {user.firstName || user.full_name || "Utilisateur"}
                                            </p>
                                            <p className="text-xs text-adawi-brown-light flex items-center gap-1">
                                                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                                                {getRoleLabel()}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Barre de recherche Mobile */}
                            <div className="px-4 pb-4 border-b border-adawi-gold/10 mb-4">
                                <form onSubmit={handleSearchSubmit} className="flex items-center">
                                    <div className="flex-1 relative">
                                        <input
                                            type="text"
                                            value={searchQuery}
                                            onChange={handleSearchChange}
                                            onFocus={handleSearchFocus}
                                            placeholder="Rechercher..."
                                            className="w-full px-4 py-3 text-sm border-2 border-adawi-gold/30 rounded-full focus:outline-none focus:ring-2 focus:ring-adawi-gold/50 focus:border-adawi-gold bg-adawi-beige/30 text-adawi-brown placeholder-adawi-brown-light transition-all duration-200"
                                        />
                                        <button
                                            type="submit"
                                            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-adawi-brown hover:text-adawi-gold transition-colors p-1.5 rounded-full hover:bg-adawi-gold/10"
                                            aria-label="Rechercher"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                            </svg>
                                        </button>
                                    </div>
                                </form>
                            </div>

                            {/* Navigation Links */}
                            <div className="px-2 space-y-1">
                                {navItems.map((item, index) => (
                                    <Link
                                        key={item.to}
                                        to={item.to}
                                        className={`block px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 transform hover:scale-[1.02] ${currentPath === item.to
                                            ? "text-adawi-brown bg-adawi-gold-light border-l-4 border-adawi-gold"
                                            : "text-adawi-brown hover:bg-adawi-beige hover:text-adawi-gold"
                                            }`}
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        role="menuitem"
                                        style={{
                                            animationDelay: `${index * 50}ms`
                                        }}
                                    >
                                        {item.name}
                                    </Link>
                                ))}
                            </div>

                            {/* Divider */}
                            <div className="border-t border-adawi-gold/10 my-4"></div>

                            {/* Actions Mobile */}
                            <div className="px-4">
                                {user ? (
                                    <Link
                                        to={getDashboardRoute()}
                                        className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl bg-gradient-to-r from-adawi-gold/20 to-adawi-beige/40 border border-adawi-gold/30 hover:from-adawi-gold/30 hover:to-adawi-beige/50 transition-all duration-200 group"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                        <svg className="w-5 h-5 text-adawi-brown group-hover:text-adawi-gold transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                                        </svg>
                                        <span className="text-sm font-semibold text-adawi-brown group-hover:text-adawi-gold transition-colors">
                                            Accéder au Dashboard
                                        </span>
                                    </Link>
                                ) : (
                                    <Link
                                        to="/login"
                                        className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl bg-white border-2 border-adawi-gold/30 hover:bg-adawi-gold/10 hover:border-adawi-gold/50 transition-all duration-200 group"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                        <svg className="w-5 h-5 text-adawi-brown group-hover:text-adawi-gold transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                        <span className="text-sm font-semibold text-adawi-brown group-hover:text-adawi-gold transition-colors">
                                            Se connecter
                                        </span>
                                    </Link>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Overlay pour le menu mobile */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 transition-opacity duration-300"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}
        </header>
    );
};

export default CompactHeader;
