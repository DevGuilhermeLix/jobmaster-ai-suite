import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Search, Video, Trophy, ArrowRight, CheckCircle } from "lucide-react";
import heroImage from "@/assets/hero-image.jpg";

const Index = () => {
  const features = [
    {
      icon: FileText,
      title: "Criar Currículo",
      description: "Crie currículos profissionais com IA em minutos",
      link: "/criar-curriculo",
      color: "bg-blue-500",
    },
    {
      icon: Search,
      title: "Analisar Vaga",
      description: "Analise vagas e otimize sua candidatura",
      link: "/analisar-vaga",
      color: "bg-green-500",
    },
    {
      icon: Video,
      title: "Treinar Entrevista",
      description: "Pratique com simulações de entrevistas reais",
      link: "/entrevista",
      color: "bg-purple-500",
    },
    {
      icon: Trophy,
      title: "Ranking Profissional",
      description: "Compare seu perfil com outros profissionais",
      link: "/ranking",
      color: "bg-orange-500",
    },
  ];

  const benefits = [
    "Currículos otimizados para ATS",
    "Análise inteligente de vagas",
    "Feedback em tempo real",
    "Suporte 24/7",
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-accent/5">
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="inline-block">
                <span className="px-4 py-2 rounded-full bg-primary/10 text-primary font-semibold text-sm">
                  🚀 Powered by AI
                </span>
              </div>
              <h1 className="text-5xl md:text-6xl font-bold text-foreground leading-tight">
                Sua Carreira,
                <span className="text-primary"> Nosso Foco</span>
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed">
                Plataforma completa com IA para impulsionar sua carreira profissional. 
                Crie currículos, analise vagas e treine entrevistas.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/criar-curriculo">
                  <Button size="lg" className="w-full sm:w-auto shadow-button">
                    Começar Agora
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  Ver Demonstração
                </Button>
              </div>
              <div className="flex flex-wrap gap-6 pt-4">
                {benefits.map((benefit) => (
                  <div key={benefit} className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-accent" />
                    <span className="text-sm text-muted-foreground">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="hidden lg:block">
              <div className="relative">
                <img
                  src={heroImage}
                  alt="Professional workspace"
                  className="rounded-2xl shadow-2xl border border-border"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/20 to-transparent rounded-2xl" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Tudo que Você Precisa
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Ferramentas profissionais para cada etapa da sua jornada de carreira
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <Link key={feature.title} to={feature.link}>
                <Card className="h-full hover:shadow-card-hover transition-all duration-300 group cursor-pointer border-border">
                  <CardHeader>
                    <div className={`w-12 h-12 rounded-lg ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <CardTitle className="text-xl group-hover:text-primary transition-colors">
                      {feature.title}
                    </CardTitle>
                    <CardDescription className="text-base">
                      {feature.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center text-primary font-medium group-hover:gap-2 transition-all">
                      Acessar
                      <ArrowRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 py-16 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Pronto para Transformar Sua Carreira?
          </h2>
          <p className="text-lg mb-8 opacity-90 max-w-2xl mx-auto">
            Junte-se a milhares de profissionais que já estão usando o JobMaster AI
          </p>
          <Link to="/criar-curriculo">
            <Button size="lg" variant="secondary" className="shadow-lg">
              Criar Meu Currículo Agora
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-muted-foreground">
            <p>&copy; 2024 JobMaster AI. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
