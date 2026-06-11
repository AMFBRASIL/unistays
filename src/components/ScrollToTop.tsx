import { useLayoutEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * Sempre posiciona o usuário no topo ao trocar de rota.
 */
export function ScrollToTop() {
  const location = useLocation();

  useLayoutEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [location.pathname, location.search]);

  return null;
}
