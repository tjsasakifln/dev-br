"use client";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { LogOut, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { signOut } from "next-auth/react";

interface UserPopoverProps {
  className?: string;
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

export function UserPopover({ className, user }: UserPopoverProps) {
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await signOut({ redirect: true, callbackUrl: "/" });
    } catch (error) {
      console.error("Error during logout:", error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  if (!user) {
    return (
      <Button
        variant="ghost"
        size="sm"
        disabled
        className={cn("h-8 w-8 rounded-full p-0", className)}
      >
        <div className="bg-muted h-6 w-6 animate-pulse rounded-full" />
      </Button>
    );
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={cn("hover:bg-accent h-8 w-8 rounded-full p-0", className)}
        >
          {user.image ? (
            <img
              src={user.image}
              alt={`${user.name} avatar`}
              className="h-6 w-6 rounded-full"
            />
          ) : (
            <User className="h-4 w-4" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-80 p-0"
        align="end"
      >
        <div className="p-4">
          <div className="mb-4 flex items-center gap-3">
            {user.image ? (
              <img
                src={user.image}
                alt={`${user.name} avatar`}
                className="h-10 w-10 rounded-full"
              />
            ) : (
              <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                <User className="h-5 w-5" />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <div className="truncate font-medium">
                {user.name || "Usuário"}
              </div>
              <div className="text-muted-foreground text-sm">
                {user.email || ""}
              </div>
            </div>
          </div>

          <Button
            variant="ghost"
            className="w-full justify-start text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-950/50 dark:hover:text-red-300"
            onClick={handleLogout}
            disabled={isLoggingOut}
          >
            <LogOut className="mr-2 h-4 w-4" />
            {isLoggingOut ? "Saindo..." : "Sair"}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}