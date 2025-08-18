import { Sidebar, MobileSidebar } from "@/components/layout/sidebar";
import { UserPopover } from "@/components/user-popover";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar Desktop */}
      <Sidebar />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Mobile Header */}
        <header className="md:hidden sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex h-14 items-center justify-between px-4">
            <MobileSidebar />
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-ouro-gradient">
                <span className="text-sm font-bold text-brasil-navy">BR</span>
              </div>
              <span className="text-lg font-bold text-gradient-gold">Dev BR</span>
            </div>
            <UserPopover />
          </div>
        </header>
        
        {/* Desktop Header */}
        <header className="hidden md:flex sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex h-14 w-full items-center justify-end px-6">
            <UserPopover />
          </div>
        </header>
        
        {/* Page Content */}
        <main className="flex-1 p-6">
          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}