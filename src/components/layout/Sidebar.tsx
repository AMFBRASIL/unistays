import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useLocation, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import * as LucideIcons from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

// Icons used in fixed UI elements
const { Layers, ChevronLeft, ChevronRight, ChevronDown, Bell, HelpCircle, LogOut } = LucideIcons;

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [canScrollDown, setCanScrollDown] = useState(false);
  const location = useLocation();
  const navRef = useRef<HTMLElement>(null);
  const { user, logout } = useAuth();
  const SCROLL_STORAGE_KEY = 'sidebar-scroll-position';
  const SIDEBAR_COLLAPSED_KEY = 'dashboard-sidebar-collapsed';
  const SIDEBAR_WIDTH_VAR = '--dashboard-sidebar-width';

  // Fetch dynamic navigation
  const { data: menuGroups } = useQuery({
    queryKey: ['navigation'],
    queryFn: async () => {
      const response = await api.getNavigation();
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
  });

  const navigation = useMemo(() => {
    // Basic navigation structure to start or fallback? 
    // If DB is empty, user sees nothing. Assuming DB is populated.

    if (!menuGroups || !Array.isArray(menuGroups)) return [];

    // Check permissions
    if (!user || !user.permissions || Object.keys(user.permissions).length === 0) {
      // If strict mode, maybe return []? For now assume similar behavior to before (show all if no groups data or fallback).
      // But logic below requires mapping.
    }

    const hasPermission = (href: string) => {
      // Logic: 
      // 1. Convert href to module key (remove / and replace / with _)
      // 2. Check user.permissions

      // If administrative user (super_admin), allow all? 
      // Current system relies on permissions.

      // If no permissions loaded, default to allow (legacy/dev support)
      if (!user?.permissions || Object.keys(user.permissions).length === 0) return true;

      const moduleKey = href.replace(/^\//, '').replace(/\//g, '_') || 'dashboard';
      const perms = user.permissions[moduleKey];

      // If permissions exist but not for this module, check if it's a sub-route or deny?
      // For now, if explicit permission is missing, deny access.
      if (!perms) return false;

      // Check for read permission
      return !!perms.read;
    };

    return menuGroups.map((group: any) => ({
      title: group.title,
      items: group.items
        .filter((item: any) => hasPermission(item.route))
        .map((item: any) => {
          // Resolve Icon
          const IconComponent = (LucideIcons as any)[item.icon] || LucideIcons.Circle;

          return {
            label: item.title,
            href: item.route,
            icon: IconComponent,
            badge: item.badge,
            target: item.target, // Assuming added to DB schema eventually, or undefined
          };
        })
    })).filter((section: any) => section.items.length > 0);

  }, [user, menuGroups]);

  const updateScrollIndicator = useCallback(() => {
    const navElement = navRef.current;
    if (!navElement) return;
    const { scrollTop, scrollHeight, clientHeight } = navElement;
    setCanScrollDown(scrollTop + clientHeight < scrollHeight - 8);
  }, []);

  const scrollMenuDown = () => {
    navRef.current?.scrollBy({ top: 220, behavior: "smooth" });
  };

  // Restaurar posição do scroll ao montar
  useEffect(() => {
    if (navRef.current) {
      const savedScroll = sessionStorage.getItem(SCROLL_STORAGE_KEY);
      if (savedScroll) {
        navRef.current.scrollTop = parseInt(savedScroll, 10);
      }
    }
  }, []);

  // Salvar posição do scroll antes de navegar
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (navRef.current) {
        sessionStorage.setItem(SCROLL_STORAGE_KEY, navRef.current.scrollTop.toString());
      }
    };

    const navElement = navRef.current;
    if (navElement) {
      // Salvar scroll ao fazer scroll
      const handleScroll = () => {
        sessionStorage.setItem(SCROLL_STORAGE_KEY, navElement.scrollTop.toString());
        updateScrollIndicator();
      };

      navElement.addEventListener('scroll', handleScroll);
      window.addEventListener('beforeunload', handleBeforeUnload);
      updateScrollIndicator();

      const resizeObserver = new ResizeObserver(updateScrollIndicator);
      resizeObserver.observe(navElement);

      return () => {
        navElement.removeEventListener('scroll', handleScroll);
        window.removeEventListener('beforeunload', handleBeforeUnload);
        resizeObserver.disconnect();
      };
    }
  }, [updateScrollIndicator]);

  // Restaurar scroll após mudança de rota (com pequeno delay para garantir renderização)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (navRef.current) {
        const savedScroll = sessionStorage.getItem(SCROLL_STORAGE_KEY);
        if (savedScroll) {
          navRef.current.scrollTop = parseInt(savedScroll, 10);
        }
      }
    }, 50);

    return () => clearTimeout(timer);
  }, [location.pathname, updateScrollIndicator]);

  useEffect(() => {
    const timer = setTimeout(updateScrollIndicator, 100);
    return () => clearTimeout(timer);
  }, [navigation, collapsed, updateScrollIndicator]);

  useEffect(() => {
    const saved = localStorage.getItem(SIDEBAR_COLLAPSED_KEY);
    if (saved === '1') {
      setCollapsed(true);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(SIDEBAR_COLLAPSED_KEY, collapsed ? '1' : '0');
    document.documentElement.style.setProperty(SIDEBAR_WIDTH_VAR, collapsed ? '5rem' : '16rem');
  }, [collapsed]);

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen bg-[#0f234d] border-r border-white/10 transition-all duration-300 flex flex-col text-white",
        collapsed ? "w-20" : "w-64"
      )}
    >
      {/* Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-white/10">
        <div
          className={cn(
            "flex items-center gap-3 transition-all duration-300",
            collapsed && "opacity-0 w-0 overflow-hidden pointer-events-none"
          )}
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-primary flex items-center justify-center shadow-glow">
            <Layers className="w-5 h-5 text-primary-foreground" />
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-white">Uni<span className="text-blue-300 mx-0.5">|</span>Stays</span>
            <span className="text-xs text-blue-100/80">Sistema Unificado</span>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon-sm"
          className="text-blue-100/80 hover:text-white hover:bg-white/10"
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </Button>
      </div>

      {/* Navigation */}
      <div className="relative flex-1 min-h-0">
        <nav ref={navRef} className="h-full overflow-y-auto sidebar-scroll-hidden py-4 px-3 pb-16">
          {navigation.map((section) => (
          <div key={section.title} className="mb-6">
            <h3
              className={cn(
                "px-3 mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground transition-opacity",
                "text-blue-100/60",
                collapsed && "opacity-0"
              )}
            >
              {section.title}
            </h3>
            <ul className="space-y-1">
              {section.items.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <li key={item.label}>
                    <Link
                      to={item.href}
                      target={item.target}
                      rel={item.target === "_blank" ? "noopener noreferrer" : undefined}
                      onClick={(e) => {
                        // Salvar posição do scroll antes de navegar
                        if (navRef.current) {
                          sessionStorage.setItem(SCROLL_STORAGE_KEY, navRef.current.scrollTop.toString());
                        }
                        // Prevenir scroll automático para o topo
                        if (item.href === location.pathname) {
                          e.preventDefault();
                        }
                      }}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                        isActive
                          ? "bg-white text-[#0f234d] shadow-sm"
                          : "text-white/95 hover:bg-white/20 hover:text-white"
                      )}
                    >
                      <item.icon className={cn("w-5 h-5 shrink-0", isActive && "text-[#0f234d]")} />
                      <span className={cn("flex-1 transition-opacity", collapsed && "opacity-0 w-0")}>
                        {item.label}
                      </span>
                      {item.badge && !collapsed && (
                        <span className={cn(
                          "px-2 py-0.5 text-xs font-medium rounded-full",
                          isActive ? "bg-[#0f234d]/10 text-[#0f234d]" : "bg-white/20 text-white"
                        )}>
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
        </nav>

        {canScrollDown && (
          <>
            <div
              className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[#0f234d] via-[#0f234d]/90 to-transparent"
              aria-hidden
            />
            <button
              type="button"
              onClick={scrollMenuDown}
              className={cn(
                "absolute bottom-3 left-1/2 z-10 -translate-x-1/2 flex items-center gap-2 rounded-xl border border-white/15 bg-[#0a1a3a]/95 px-3 py-2 text-xs font-semibold uppercase tracking-wider text-white/90 shadow-lg backdrop-blur-sm transition-colors hover:bg-white/10 hover:text-white",
                collapsed && "px-2"
              )}
              aria-label="Ver mais itens do menu"
            >
              {!collapsed && <span>Mais módulos</span>}
              <ChevronDown className="h-4 w-4 shrink-0 text-blue-300" />
            </button>
          </>
        )}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-white/10">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon-sm" className="text-blue-100/80 hover:text-white hover:bg-white/10">
            <Bell className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon-sm" className="text-blue-100/80 hover:text-white hover:bg-white/10">
            <HelpCircle className="w-4 h-4" />
          </Button>
          <div className="flex-1 flex items-center justify-center px-1">
            <div className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center text-xs font-semibold text-primary-foreground" title={user?.name || "Usuário"}>
              {user?.name ? user.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase() : "?"}
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon-sm"
            className="text-blue-100/80 hover:text-white hover:bg-white/10"
            title="Sair"
            onClick={() => { logout(); window.location.href = "/login"; }}
          >
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </aside>
  );
}
