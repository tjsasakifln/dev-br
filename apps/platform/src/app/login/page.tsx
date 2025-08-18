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

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex items-center justify-center">
            <Icons.openswe className="h-12 w-12 text-brasil-green-500" width={48} height={48} />
          </div>
          <CardTitle className="text-3xl font-bold text-foreground">
            Dev BR
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            A plataforma brasileira de desenvolvimento com IA. Faça seu login para continuar.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <Button asChild variant="outline">
            <a href="/api/auth/github/login" className="w-full">
              <Icons.github className="mr-2 h-4 w-4" />
              Entrar com GitHub
            </a>
          </Button>
          <Button asChild variant="outline">
            <a href="/api/auth/google/login" className="w-full">
              <Icons.google className="mr-2 h-4 w-4" />
              Entrar com Google
            </a>
          </Button>
        </CardContent>
        <CardFooter>
          <p className="text-center text-xs text-muted-foreground">
            Ao continuar, você concorda com nossos Termos de Serviço e Política de Privacidade.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}