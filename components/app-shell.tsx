import { ReactNode } from "react";
import { ProductNav } from "@/components/product-nav";
import { cn } from "@/lib/utils";

type AppShellProps = {
  children: ReactNode;
  mode: "YOUTH" | "YOUNG_ADULT";
  active?: string;
  className?: string;
};

export function AppShell({ children, mode, active = "Home", className }: AppShellProps) {
  return <div className="mobile-shell app-shell">
    <a className="skip-link" href="#main-content">Skip to main content</a>
    <div id="main-content" tabIndex={-1} className={cn("dashboard-shell app-shell-scroll", className)}>{children}</div>
    <ProductNav mode={mode} active={active}/>
  </div>;
}
