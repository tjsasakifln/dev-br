"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { 
  Menu, 
  FolderOpen, 
  Plus, 
  Settings, 
  LogOut,
  Home
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  className?: string;
}

const Logo = () => (
  <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2">
    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-ouro-gradient shadow-lg">
      <span className="text-lg font-bold text-brasil-navy">BR</span>
    </div>
    <div className="flex flex-col">
      <span className="text-lg font-bold text-gradient-gold">Dev BR</span>
      <span className="text-xs text-muted-foreground">Plataforma IA</span>
    </div>
  </Link>
);

const navigation = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: Home,
  },
  {
    name: "Meus Projetos",
    href: "/dashboard/projects",
    icon: FolderOpen,
  },
  {
    name: "Novo App",
    href: "/dashboard/projects/new",
    icon: Plus,
  },
];

const SidebarContent = ({ onNavigate }: { onNavigate?: () => void }) => {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="p-4">
        <Logo />
      </div>
      
      <Separator className="opacity-20" />
      
      {/* Navigation */}
      <ScrollArea className="flex-1 px-3">
        <div className="space-y-1 py-4">
          {navigation.map((item) => {
            const isActive = pathname === item.href || 
              (item.href !== "/dashboard" && pathname.startsWith(item.href));
            
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={onNavigate}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all hover:bg-accent hover:text-accent-foreground",
                  isActive
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.name}
              </Link>
            );
          })}
        </div>
      </ScrollArea>
      
      <Separator className="opacity-20" />
      
      {/* Bottom Actions */}
      <div className="p-3 space-y-1">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-muted-foreground hover:text-foreground"
          asChild
        >
          <Link href="/settings">
            <Settings className="h-4 w-4" />
            Configurações
          </Link>
        </Button>
        
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-muted-foreground hover:text-destructive"
          onClick={() => {
            window.location.href = "/api/auth/signout";
          }}
        >
          <LogOut className="h-4 w-4" />
          Sair
        </Button>
      </div>
    </div>
  );
};

export function Sidebar({ className }: SidebarProps) {
  return (
    <div className={cn("hidden md:flex", className)}>
      <div className="flex h-full w-72 flex-col border-r bg-card/50 backdrop-blur">
        <SidebarContent />
      </div>
    </div>
  );
}

export function MobileSidebar() {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          className="md:hidden"
          size="icon"
          aria-label="Abrir menu"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-72 p-0 bg-card/95 backdrop-blur">
        <SidebarContent onNavigate={() => setOpen(false)} />
      </SheetContent>
    </Sheet>
  );
}