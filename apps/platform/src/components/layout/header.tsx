import { UserPopover } from "@/components/user-popover";

const Logo = () => (
  <a href="/dashboard" className="flex items-center gap-2">
    <div className="w-8 h-8 bg-brasil-green-500 rounded-full flex items-center justify-center">
      <span className="text-white font-bold text-sm">BR</span>
    </div>
    <span className="text-xl font-bold text-foreground">Dev BR</span>
  </a>
);

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center justify-between">
        <Logo />
        {/* Mock User - substitua pela sua lógica de sessão */}
        <UserPopover />
      </div>
    </header>
  );
}