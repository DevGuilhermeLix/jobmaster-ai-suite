import { Link, useLocation } from "react-router-dom";
import { Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";

const Navbar = () => {
  const location = useLocation();

  const navItems = [
    { path: "/", label: "Home" },
    { path: "/criar-curriculo", label: "Criar Currículo" },
    { path: "/historico", label: "Histórico" },
    { path: "/analisar-vaga", label: "Analisar Vaga" },
    { path: "/entrevista", label: "Entrevista" },
    { path: "/ranking", label: "Ranking" },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <Briefcase className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">JobMaster AI</span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => (
              <Link key={item.path} to={item.path}>
                <Button
                  variant={isActive(item.path) ? "default" : "ghost"}
                  className="transition-all"
                >
                  {item.label}
                </Button>
              </Link>
            ))}
          </div>

          {/* Account Button */}
          <div className="flex items-center space-x-2">
            <Link to="/conta">
              <Button variant="outline">Conta</Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
