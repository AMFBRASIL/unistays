import { useState, useMemo, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Search, Bell, Plus, CalendarDays, LogOut, User, Command } from "lucide-react";
import * as LucideIcons from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { NewReservationModal } from "@/components/reservations/NewReservationModal";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";

export function Header() {
  const queryClient = useQueryClient();
  const [showNewReservationModal, setShowNewReservationModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showResults, setShowResults] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const searchRef = useRef<HTMLDivElement>(null);
  const hideFunctionalitySearch = useMemo(() => {
    if (!user) return false;
    const groupName = (user.group?.name || "").toLowerCase();
    // Strict identification: only by group name.
    return (
      groupName.includes("pdv") ||
      groupName.includes("pos terminal") ||
      groupName.includes("pos-terminal")
    );
  }, [user]);

  // Fetch dynamic navigation (reusing same query key/fn as Sidebar for consistency)
  const { data: menuGroups } = useQuery({
    queryKey: ['navigation'],
    queryFn: async () => {
      const response = await api.getNavigation();
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
  });

  // Flatten and filter items
  const searchResults = useMemo(() => {
    if (!menuGroups || !searchQuery) return [];

    const query = searchQuery.toLowerCase();
    const results: any[] = [];

    // Helper to check permission (basic check mirroring sidebar logic roughly)
    const hasPermission = (href: string) => {
      if (!user?.groups || user.groups.length === 0) return true;
      const moduleKey = href.replace(/^\//, '').replace(/\//g, '_') || 'dashboard';
      let isVisible = false;
      let hasExplicitEntry = false;
      for (const group of user.groups) {
        const perms = group.permissions?.[moduleKey];
        if (perms) {
          hasExplicitEntry = true;
          if (perms.read || perms.write || perms.update || perms.delete) {
            isVisible = true;
            break;
          }
        }
      }
      return !hasExplicitEntry || isVisible;
    };

    menuGroups.forEach((group: any) => {
      group.items.forEach((item: any) => {
        if (
          hasPermission(item.route) &&
          (item.title.toLowerCase().includes(query) ||
            group.title.toLowerCase().includes(query))
        ) {
          results.push({
            ...item,
            category: group.title,
            icon: (LucideIcons as any)[item.icon] || LucideIcons.Circle
          });
        }
      });
    });

    return results;
  }, [menuGroups, searchQuery, user]);

  const handleNavigate = (route: string) => {
    navigate(route);
    setSearchQuery("");
    setShowResults(false);
  };

  // Close results on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // If PDV profile: keep header clean (no functionality search)
  useEffect(() => {
    if (!hideFunctionalitySearch) return;
    setShowResults(false);
    setSearchQuery("");
  }, [hideFunctionalitySearch]);

  return (
    <>
      <header
        className={cn(
          "h-16 bg-background/80 backdrop-blur-xl border-b border-border sticky top-0 z-30 flex items-center px-6",
          hideFunctionalitySearch ? "justify-end" : "justify-between"
        )}
      >
        {/* Search */}
        {!hideFunctionalitySearch && (
          <div ref={searchRef} className="flex items-center gap-4 flex-1 max-w-xl relative">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Buscar funcionalidades... (Ex: Hóspedes, Reservas)"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowResults(true);
                }}
                onFocus={() => setShowResults(true)}
                className="w-full h-10 pl-10 pr-4 rounded-lg bg-secondary/50 border border-border text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary/50 transition-all"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 hidden sm:flex items-center gap-1 pointer-events-none">
                <kbd className="h-5 items-center gap-1 rounded border border-border bg-muted px-1.5 text-[10px] font-medium text-muted-foreground flex">
                  <Command className="w-3 h-3" />K
                </kbd>
              </div>
            </div>

            {/* Large Search Results Dropdown */}
            {showResults && searchQuery && (
              <div className="absolute top-full left-0 right-0 mt-2 p-2 bg-background/95 backdrop-blur-md border border-border rounded-xl shadow-2xl animate-in fade-in zoom-in-95 duration-200 z-50">
                {searchResults.length > 0 ? (
                  <div className="space-y-1 max-h-[60vh] overflow-y-auto custom-scrollbar">
                    <div className="px-3 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Resultados da busca
                    </div>
                    {searchResults.map((item, index) => {
                      const Icon = item.icon;
                      return (
                        <button
                          key={index}
                          onClick={() => handleNavigate(item.route)}
                          className="w-full flex items-center gap-4 p-4 rounded-lg hover:bg-muted/80 focus-visible:ring-2 focus-visible:ring-primary/10 focus-visible:ring-offset-2 focus:outline-none transition-all group text-left border border-transparent hover:border-border/30"
                        >
                          <div className="w-12 h-12 rounded-xl bg-primary/5 flex items-center justify-center group-hover:scale-105 transition-transform">
                            <Icon className="w-6 h-6 text-primary/70 group-hover:text-primary/90" />
                          </div>
                          <div className="flex-1">
                            <h4 className="text-lg font-semibold text-foreground group-hover:text-foreground transition-colors">
                              {item.title}
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              {item.category}
                            </p>
                          </div>
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="px-3 py-1 bg-muted rounded-full text-xs font-medium text-muted-foreground border border-border/50">
                              Acessar
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-8 text-center text-muted-foreground">
                    <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>Nenhum resultado encontrado para "{searchQuery}"</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-3 ml-auto">
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 text-sm font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Online
          </div>

          <Button variant="ghost" size="icon" className="relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-destructive" />
          </Button>

          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary text-sm">
            <CalendarDays className="w-4 h-4 text-muted-foreground" />
            <span className="text-foreground font-medium">
              {new Date().toLocaleDateString("pt-BR", {
                weekday: "short",
                day: "numeric",
                month: "short"
              })}
            </span>
          </div>

          {!hideFunctionalitySearch && (
            <Button variant="gradient" className="gap-2" onClick={() => setShowNewReservationModal(true)}>
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Nova Reserva</span>
            </Button>
          )}

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-gradient-primary text-primary-foreground">
                    {user?.name
                      ? user.name
                        .split(" ")
                        .map((n) => n[0])
                        .slice(0, 2)
                        .join("")
                        .toUpperCase()
                      : "U"}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user?.name || "Usuário"}</p>
                  <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <a href="/profile" className="cursor-pointer">
                  <User className="mr-2 h-4 w-4" />
                  <span>Meu Perfil</span>
                </a>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout} className="cursor-pointer text-destructive">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sair</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <NewReservationModal
        open={showNewReservationModal}
        onOpenChange={setShowNewReservationModal}
        onSave={() => {
          queryClient.invalidateQueries({ queryKey: ['reservations'] });
        }}
      />
    </>
  );
}
