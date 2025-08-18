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
              <Icons.google className="mr-2 h-5 w-5" />
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