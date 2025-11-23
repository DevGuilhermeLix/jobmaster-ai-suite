import { useState } from "react";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Plus, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface Experience {
  id: string;
  cargo: string;
  empresa: string;
  periodo: string;
  descricao: string;
}

const CriarCurriculo = () => {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [resumo, setResumo] = useState("");
  const [habilidades, setHabilidades] = useState("");
  const [experiencias, setExperiencias] = useState<Experience[]>([
    { id: "1", cargo: "", empresa: "", periodo: "", descricao: "" }
  ]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewContent, setPreviewContent] = useState("");

  const addExperiencia = () => {
    const newExp: Experience = {
      id: Date.now().toString(),
      cargo: "",
      empresa: "",
      periodo: "",
      descricao: ""
    };
    setExperiencias([...experiencias, newExp]);
  };

  const removeExperiencia = (id: string) => {
    if (experiencias.length > 1) {
      setExperiencias(experiencias.filter(exp => exp.id !== id));
    }
  };

  const updateExperiencia = (id: string, field: keyof Experience, value: string) => {
    setExperiencias(experiencias.map(exp =>
      exp.id === id ? { ...exp, [field]: value } : exp
    ));
  };

  const handlePreview = async () => {
    if (!nome || !email || !telefone) {
      toast.error("Preencha os campos obrigatórios");
      return;
    }

    setIsPreviewing(true);
    try {
      const formData = { nome, email, telefone, resumo, experiencias, habilidades };
      
      const { data, error } = await supabase.functions.invoke('preview-resume', {
        body: { data: formData }
      });

      if (error) throw error;
      
      setPreviewContent(data.preview);
      setPreviewOpen(true);
    } catch (error) {
      console.error('Error previewing resume:', error);
      toast.error("Erro ao gerar pré-visualização");
    } finally {
      setIsPreviewing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!nome || !email || !telefone) {
      toast.error("Preencha os campos obrigatórios");
      return;
    }

    setIsGenerating(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error("Você precisa estar logado para gerar um currículo");
        return;
      }

      const formData = { nome, email, telefone, resumo, experiencias, habilidades };
      
      const { data, error } = await supabase.functions.invoke('generate-resume', {
        body: { data: formData }
      });

      if (error) throw error;

      toast.success("Currículo gerado com sucesso!");
      console.log('Resume saved:', data);
    } catch (error) {
      console.error('Error generating resume:', error);
      toast.error("Erro ao gerar currículo");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
              <FileText className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-4xl font-bold text-foreground mb-2">Criar Currículo Profissional</h1>
            <p className="text-muted-foreground text-lg">
              Preencha suas informações e crie um currículo impactante
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Informações Básicas */}
            <Card>
              <CardHeader>
                <CardTitle>Informações Básicas</CardTitle>
                <CardDescription>Dados pessoais e de contato</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="nome">Nome Completo *</Label>
                    <Input
                      id="nome"
                      value={nome}
                      onChange={(e) => setNome(e.target.value)}
                      placeholder="João Silva"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">E-mail *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="joao@exemplo.com"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="telefone">Telefone *</Label>
                  <Input
                    id="telefone"
                    value={telefone}
                    onChange={(e) => setTelefone(e.target.value)}
                    placeholder="(11) 99999-9999"
                    required
                  />
                </div>
              </CardContent>
            </Card>

            {/* Resumo Profissional */}
            <Card>
              <CardHeader>
                <CardTitle>Resumo Profissional</CardTitle>
                <CardDescription>Descreva seu perfil em poucas linhas</CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={resumo}
                  onChange={(e) => setResumo(e.target.value)}
                  placeholder="Ex: Profissional com 5 anos de experiência em desenvolvimento web..."
                  className="min-h-[120px]"
                />
              </CardContent>
            </Card>

            {/* Experiências */}
            <Card>
              <CardHeader>
                <CardTitle>Experiência Profissional</CardTitle>
                <CardDescription>Adicione suas experiências anteriores</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {experiencias.map((exp, index) => (
                  <div key={exp.id} className="space-y-4 p-4 border border-border rounded-lg relative">
                    {experiencias.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute top-2 right-2"
                        onClick={() => removeExperiencia(exp.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                    
                    <div className="font-semibold text-sm text-muted-foreground">
                      Experiência {index + 1}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Cargo</Label>
                        <Input
                          value={exp.cargo}
                          onChange={(e) => updateExperiencia(exp.id, "cargo", e.target.value)}
                          placeholder="Desenvolvedor Full Stack"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Empresa</Label>
                        <Input
                          value={exp.empresa}
                          onChange={(e) => updateExperiencia(exp.id, "empresa", e.target.value)}
                          placeholder="Tech Company LTDA"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Período</Label>
                      <Input
                        value={exp.periodo}
                        onChange={(e) => updateExperiencia(exp.id, "periodo", e.target.value)}
                        placeholder="Jan 2020 - Dez 2023"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Descrição</Label>
                      <Textarea
                        value={exp.descricao}
                        onChange={(e) => updateExperiencia(exp.id, "descricao", e.target.value)}
                        placeholder="Descreva suas responsabilidades e conquistas..."
                        className="min-h-[80px]"
                      />
                    </div>
                  </div>
                ))}
                
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={addExperiencia}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Experiência
                </Button>
              </CardContent>
            </Card>

            {/* Habilidades */}
            <Card>
              <CardHeader>
                <CardTitle>Habilidades</CardTitle>
                <CardDescription>Liste suas principais habilidades (separadas por vírgula)</CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={habilidades}
                  onChange={(e) => setHabilidades(e.target.value)}
                  placeholder="JavaScript, React, Node.js, SQL, Git"
                  className="min-h-[100px]"
                />
              </CardContent>
            </Card>

            {/* Submit Button */}
            <div className="flex gap-4">
              <Button type="submit" size="lg" className="flex-1" disabled={isGenerating}>
                {isGenerating ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Gerando...
                  </>
                ) : (
                  <>
                    <FileText className="h-5 w-5 mr-2" />
                    Gerar Currículo
                  </>
                )}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                size="lg"
                onClick={handlePreview}
                disabled={isPreviewing}
              >
                {isPreviewing ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Carregando...
                  </>
                ) : (
                  'Pré-visualizar'
                )}
              </Button>
            </div>
          </form>
        </div>
      </main>

      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Pré-visualização do Currículo</DialogTitle>
            <DialogDescription>
              Esta é uma visualização do seu currículo gerado por IA
            </DialogDescription>
          </DialogHeader>
          <div className="whitespace-pre-wrap text-sm">
            {previewContent}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CriarCurriculo;
