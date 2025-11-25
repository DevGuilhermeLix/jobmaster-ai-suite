import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Download, Eye, FileText, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import Navbar from "@/components/Navbar";

interface Resume {
  id: string;
  area: string;
  pdf_url: string;
  html_preview: string;
  created_at: string;
}

const Historico = () => {
  const navigate = useNavigate();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedResume, setSelectedResume] = useState<Resume | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      toast.error("Você precisa estar logado para acessar o histórico");
      navigate("/");
      return;
    }

    loadResumes(session.user.id);
  };

  const loadResumes = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("resumes")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      setResumes(data || []);
    } catch (error) {
      console.error("Error loading resumes:", error);
      toast.error("Erro ao carregar histórico");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (pdfUrl: string, area: string) => {
    const link = document.createElement("a");
    link.href = pdfUrl;
    link.download = `curriculo-${area.toLowerCase()}-${Date.now()}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePreview = (resume: Resume) => {
    setSelectedResume(resume);
    setPreviewOpen(true);
  };

  const getAreaColor = (area: string) => {
    const colors: Record<string, string> = {
      'Tecnologia': 'bg-blue-500',
      'Saúde': 'bg-green-500',
      'Administrativo': 'bg-purple-500'
    };
    return colors[area] || 'bg-gray-500';
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Histórico de Currículos</h1>
          <p className="text-muted-foreground">
            Veja todos os currículos que você gerou anteriormente
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : resumes.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent className="space-y-4">
              <FileText className="h-16 w-16 mx-auto text-muted-foreground" />
              <div>
                <h3 className="text-xl font-semibold mb-2">Nenhum currículo gerado ainda</h3>
                <p className="text-muted-foreground mb-4">
                  Comece criando seu primeiro currículo profissional
                </p>
                <Button onClick={() => navigate("/criar-curriculo")}>
                  Criar Currículo
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {resumes.map((resume) => (
              <Card key={resume.id} className="flex flex-col hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <Badge className={`${getAreaColor(resume.area)} text-white`}>
                      {resume.area}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {format(new Date(resume.created_at), "dd/MM/yyyy", { locale: ptBR })}
                    </span>
                  </div>
                  <CardTitle className="text-lg">
                    Currículo de {resume.area}
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-1">
                  <p className="text-sm text-muted-foreground">
                    Gerado em {format(new Date(resume.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                  </p>
                </CardContent>
                <CardFooter className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => handlePreview(resume)}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Visualizar
                  </Button>
                  <Button
                    size="sm"
                    className="flex-1"
                    onClick={() => handleDownload(resume.pdf_url, resume.area)}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </main>

      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Preview - Currículo de {selectedResume?.area}
            </DialogTitle>
          </DialogHeader>
          {selectedResume && (
            <div className="space-y-4">
              <div 
                className="prose max-w-none"
                dangerouslySetInnerHTML={{ __html: selectedResume.html_preview }}
              />
              <div className="flex gap-2 pt-4 border-t">
                <Button
                  onClick={() => handleDownload(selectedResume.pdf_url, selectedResume.area)}
                  className="w-full"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download PDF
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Historico;
