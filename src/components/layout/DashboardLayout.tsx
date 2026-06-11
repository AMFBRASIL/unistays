import { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div
        className="transition-all duration-300"
        style={{ paddingLeft: "var(--dashboard-sidebar-width, 16rem)" }}
      >
        <Header />
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
