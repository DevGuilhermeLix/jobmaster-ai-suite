import Navbar from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Search } from "lucide-react";

const AnalisarVaga = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <Search className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-4xl font-bold mb-4">Analisar Vaga</h1>
          <p className="text-muted-foreground text-lg mb-8">
            Em breve: análise inteligente de vagas de emprego
          </p>
          <Card>
            <CardHeader>
              <CardTitle>Funcionalidade em Desenvolvimento</CardTitle>
              <CardDescription>
                Esta página permitirá analisar vagas e comparar com seu perfil
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Aguarde as próximas atualizações!
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default AnalisarVaga;
