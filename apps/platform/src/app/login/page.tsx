import { Icons } from "@/components/icons";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md border-border/60">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex items-center justify-center">
            <Link href="/" aria-label="Página Inicial">
              <Icons.openswe className="h-10 w-10 sm:h-12 sm:w-12 text-brasil-green-500" />
            </Link>
          </div>
          <CardTitle className="text-2xl sm:text-3xl font-bold text-foreground">
            Dev BR
          </CardTitle>
          <CardDescription className="text-sm sm:text-base text-muted-foreground">
            A plataforma brasileira de desenvolvimento com IA. Faça seu login para continuar.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <Button asChild variant="outline">
            <a href="/api/auth/github/login" className="w-full">
              <Icons.github className="mr-2 h-5 w-5" />
              Entrar com GitHub
            </a>
          </Button>
          <Button asChild variant="outline">
            <a href="/api/auth/google/login" className="w-full">
              <svg className="mr-2 h-5 w-5" role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><title>Google</title><path d="M12.48 10.92v3.28h7.84c-.24 1.84-.85 3.18-1.73 4.1-1.02 1.02-2.6 1.98-4.66 1.98-3.57 0-6.45-2.84-6.45-6.35s2.88-6.35 6.45-6.35c1.96 0 3.33.74 4.3 1.69l2.5-2.5C18.16 3.84 15.76 3 12.48 3c-5.21 0-9.48 4.22-9.48 9.42s4.27 9.42 9.48 9.42c5.08 0 9.02-3.47 9.02-9.13 0-.64-.07-1.25-.16-1.83z" fill="currentColor"/></svg>
              Entrar com Google
            </a>
          </Button>
        </CardContent>
        <CardFooter>
          <p className="px-8 text-center text-xs text-muted-foreground">
            Ao continuar, você concorda com nossos Termos de Serviço e Política de Privacidade.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}