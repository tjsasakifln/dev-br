import { UserPopover } from "@/components/user-popover";
import { Icons } from "../icons";

const Logo = () => (
  <a href="/dashboard" className="flex items-center gap-2">
    <Icons.openswe className="h-8 w-8 text-brasil-green-500" />
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