import Navbar from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy } from "lucide-react";

const Ranking = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <Trophy className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-4xl font-bold mb-4">Ranking Profissional</h1>
          <p className="text-muted-foreground text-lg mb-8">
            Em breve: ranking e competição entre profissionais
          </p>
          <Card>
            <CardHeader>
              <CardTitle>Funcionalidade em Desenvolvimento</CardTitle>
              <CardDescription>
                Esta página mostrará o ranking de profissionais da plataforma
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

export default Ranking;
