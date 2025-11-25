import { useState } from "react";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Plus, Trash2, Briefcase, Code, Heart, Building2 } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { areaOptions, areaDescriptions, buildResumeJSON, type ResumeArea } from "@/lib/resumeTemplates";

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
  const [area, setArea] = useState<ResumeArea>("Tecnologia");
  const [experiencias, setExperiencias] = useState<Experience[]>([
    { id: "1", cargo: "", empresa: "", periodo: "", descricao: "" }
  ]);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewData, setPreviewData] = useState<string>("");
  const [htmlPreview, setHtmlPreview] = useState<string>("");
  const [isGeneratingHtml, setIsGeneratingHtml] = useState(false);
  const [isImproving, setIsImproving] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string>("");

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

  const generatePdf = async () => {
    if (!htmlPreview) {
      toast.error("Gere o currículo primeiro");
      return;
    }

    const loadingToast = toast.loading("Gerando PDF profissional...");
    setIsGeneratingPdf(true);

    try {
      const { supabase } = await import("@/integrations/supabase/client");
      
      // Check if user is authenticated
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Você precisa estar logado para gerar PDF", { id: loadingToast });
        return;
      }

      const { data, error } = await supabase.functions.invoke('generate-pdf', {
        body: { html: htmlPreview, area }
      });

      if (error) throw error;

      setPdfUrl(data.pdfUrl);
      toast.success("PDF gerado com sucesso!", { id: loadingToast });
      
      // Auto-download
      const link = document.createElement('a');
      link.href = data.pdfUrl;
      link.download = `curriculo-${area.toLowerCase()}-${Date.now()}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error("Erro ao gerar PDF. Tente novamente.", { id: loadingToast });
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const generateHtmlResume = async (improve = false) => {
    if (!nome || !email || !telefone) {
      toast.error("Preencha os campos obrigatórios");
      return;
    }

    const cleanData = buildResumeJSON({
      nome,
      email,
      telefone,
      resumo,
      habilidades,
      experiencias,
      area
    });

    const loadingToast = toast.loading(improve ? "Melhorando currículo com IA..." : "Gerando currículo com IA...");
    
    if (improve) {
      setIsImproving(true);
    } else {
      setIsGeneratingHtml(true);
    }

    try {
      const { supabase } = await import("@/integrations/supabase/client");
      const { data, error } = await supabase.functions.invoke('generate-resume-html', {
        body: { data: cleanData, improve }
      });

      if (error) throw error;

      setHtmlPreview(data.html);
      setPreviewOpen(true);
      toast.success(improve ? "Currículo melhorado com sucesso!" : "Currículo gerado com sucesso!", { id: loadingToast });
    } catch (error) {
      console.error('Error generating HTML resume:', error);
      toast.error("Erro ao gerar currículo. Tente novamente.", { id: loadingToast });
    } finally {
      setIsGeneratingHtml(false);
      setIsImproving(false);
    }
  };

  const handlePreview = () => {
    if (!nome || !email || !telefone) {
      toast.error("Preencha os campos obrigatórios");
      return;
    }

    const cleanData = buildResumeJSON({
      nome,
      email,
      telefone,
      resumo,
      habilidades,
      experiencias,
      area
    });

    setPreviewData(JSON.stringify(cleanData, null, 2));
    toast.success("Dados estruturados!");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    generateHtmlResume(false);
  };

  const handleImprove = () => {
    generateHtmlResume(true);
  };

  const getAreaIcon = (areaName: ResumeArea) => {
    switch (areaName) {
      case "Tecnologia":
        return <Code className="h-4 w-4" />;
      case "Saúde":
        return <Heart className="h-4 w-4" />;
      case "Administrativo":
        return <Building2 className="h-4 w-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-12 text-center space-y-4">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 mb-6 shadow-lg">
              <FileText className="h-10 w-10 text-primary" />
            </div>
            <h1 className="text-5xl font-bold text-foreground mb-3 tracking-tight">
              Criar Currículo Profissional
            </h1>
            <p className="text-muted-foreground text-xl max-w-2xl mx-auto leading-relaxed">
              Sistema inteligente de geração de currículos com templates por área profissional
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Área do Currículo */}
            <Card className="border-2 shadow-lg">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <Briefcase className="h-6 w-6 text-primary" />
                  Área Profissional
                </CardTitle>
                <CardDescription className="text-base">
                  Selecione a área para aplicar o template adequado
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Label htmlFor="area" className="text-base font-semibold">Escolha sua área *</Label>
                  <Select value={area} onValueChange={(value) => setArea(value as ResumeArea)}>
                    <SelectTrigger id="area" className="h-14 text-base">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {areaOptions.map((option) => (
                        <SelectItem key={option} value={option} className="py-3">
                          <div className="flex items-center gap-3">
                            {getAreaIcon(option)}
                            <div className="text-left">
                              <div className="font-semibold">{option}</div>
                              <div className="text-xs text-muted-foreground">
                                {areaDescriptions[option]}
                              </div>
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Informações Básicas */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl">Informações Básicas</CardTitle>
                <CardDescription className="text-base">Dados pessoais e de contato</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Label htmlFor="nome" className="text-base font-medium">Nome Completo *</Label>
                    <Input
                      id="nome"
                      value={nome}
                      onChange={(e) => setNome(e.target.value)}
                      placeholder="João Silva"
                      className="h-12 text-base"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-base font-medium">E-mail *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="joao@exemplo.com"
                      className="h-12 text-base"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="telefone" className="text-base font-medium">Telefone *</Label>
                  <Input
                    id="telefone"
                    value={telefone}
                    onChange={(e) => setTelefone(e.target.value)}
                    placeholder="(11) 99999-9999"
                    className="h-12 text-base"
                    required
                  />
                </div>
              </CardContent>
            </Card>

            {/* Resumo Profissional */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl">Resumo Profissional</CardTitle>
                <CardDescription className="text-base">
                  Descreva seu perfil em poucas linhas (a IA irá otimizar depois)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={resumo}
                  onChange={(e) => setResumo(e.target.value)}
                  placeholder="Ex: Profissional com 5 anos de experiência em desenvolvimento web..."
                  className="min-h-[140px] text-base"
                />
              </CardContent>
            </Card>

            {/* Experiências */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl">Experiência Profissional</CardTitle>
                <CardDescription className="text-base">Adicione suas experiências anteriores</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {experiencias.map((exp, index) => (
                  <div key={exp.id} className="space-y-4 p-6 border-2 border-border rounded-xl relative bg-card shadow-sm hover:shadow-md transition-shadow">
                    {experiencias.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute top-3 right-3 hover:bg-destructive/10 hover:text-destructive"
                        onClick={() => removeExperiencia(exp.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                    
                    <div className="font-bold text-base text-primary">
                      Experiência {index + 1}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="space-y-2">
                        <Label className="text-base font-medium">Cargo</Label>
                        <Input
                          value={exp.cargo}
                          onChange={(e) => updateExperiencia(exp.id, "cargo", e.target.value)}
                          placeholder="Desenvolvedor Full Stack"
                          className="h-11 text-base"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-base font-medium">Empresa</Label>
                        <Input
                          value={exp.empresa}
                          onChange={(e) => updateExperiencia(exp.id, "empresa", e.target.value)}
                          placeholder="Tech Company LTDA"
                          className="h-11 text-base"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-base font-medium">Período</Label>
                      <Input
                        value={exp.periodo}
                        onChange={(e) => updateExperiencia(exp.id, "periodo", e.target.value)}
                        placeholder="Jan 2020 - Dez 2023"
                        className="h-11 text-base"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-base font-medium">Descrição</Label>
                      <Textarea
                        value={exp.descricao}
                        onChange={(e) => updateExperiencia(exp.id, "descricao", e.target.value)}
                        placeholder="Descreva suas responsabilidades e conquistas..."
                        className="min-h-[100px] text-base"
                      />
                    </div>
                  </div>
                ))}
                
                <Button
                  type="button"
                  variant="outline"
                  className="w-full h-12 text-base font-semibold hover:bg-primary/5"
                  onClick={addExperiencia}
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Adicionar Experiência
                </Button>
              </CardContent>
            </Card>

            {/* Habilidades */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl">Habilidades</CardTitle>
                <CardDescription className="text-base">
                  Liste suas principais habilidades (separadas por vírgula)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={habilidades}
                  onChange={(e) => setHabilidades(e.target.value)}
                  placeholder="JavaScript, React, Node.js, SQL, Git"
                  className="min-h-[120px] text-base"
                />
              </CardContent>
            </Card>

            {/* Submit Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button 
                type="submit" 
                size="lg" 
                className="flex-1 h-14 text-lg font-semibold shadow-lg hover:shadow-xl transition-all"
                disabled={isGeneratingHtml}
              >
                {isGeneratingHtml ? (
                  <>
                    <div className="h-5 w-5 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Gerando HTML...
                  </>
                ) : (
                  <>
                    <FileText className="h-5 w-5 mr-2" />
                    Gerar Currículo com IA
                  </>
                )}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                size="lg"
                className="sm:w-auto h-14 text-base font-semibold"
                onClick={handlePreview}
              >
                Ver JSON
              </Button>
            </div>
            
            <p className="text-center text-sm text-muted-foreground">
              * ETAPA 2: Geração automática de HTML via IA. PDF e histórico serão implementados nas próximas etapas.
            </p>
          </form>
        </div>
      </main>

      {/* HTML Preview Dialog */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader className="space-y-3 pb-4 border-b">
            <DialogTitle className="text-2xl font-bold">
              {htmlPreview ? "Pré-visualização do Currículo" : "Dados Estruturados"}
            </DialogTitle>
            <DialogDescription className="text-base">
              {htmlPreview 
                ? "Preview HTML gerado pela IA - Use os botões abaixo para melhorar ou gerar PDF"
                : "JSON estruturado pronto para processamento"
              }
            </DialogDescription>
          </DialogHeader>

          {htmlPreview ? (
            <>
              <div className="flex-1 overflow-y-auto py-4">
                <div 
                  className="bg-white rounded-lg shadow-inner p-8 min-h-[600px]"
                  dangerouslySetInnerHTML={{ __html: htmlPreview }}
                />
              </div>
              
              <div className="flex gap-3 pt-4 border-t">
                <Button
                  onClick={handleImprove}
                  variant="outline"
                  size="lg"
                  className="flex-1 h-12"
                  disabled={isImproving || isGeneratingPdf}
                >
                  {isImproving ? (
                    <>
                      <div className="h-5 w-5 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      Melhorando...
                    </>
                  ) : (
                    <>
                      <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      Melhorar com IA
                    </>
                  )}
                </Button>
                <Button
                  onClick={generatePdf}
                  size="lg"
                  className="flex-1 h-12"
                  disabled={isGeneratingPdf || isImproving}
                >
                  {isGeneratingPdf ? (
                    <>
                      <div className="h-5 w-5 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      Gerando PDF...
                    </>
                  ) : (
                    <>
                      <FileText className="h-5 w-5 mr-2" />
                      Gerar PDF
                    </>
                  )}
                </Button>
              </div>
              
              {pdfUrl && (
                <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <p className="text-sm font-medium text-green-900 dark:text-green-100 mb-3">
                    ✓ PDF gerado com sucesso!
                  </p>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button
                      onClick={() => window.open(pdfUrl, '_blank')}
                      variant="outline"
                      size="sm"
                      className="flex-1"
                    >
                      <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      Ver PDF
                    </Button>
                    <Button
                      onClick={() => {
                        const link = document.createElement('a');
                        link.href = pdfUrl;
                        link.download = `curriculo-${area.toLowerCase()}-${Date.now()}.pdf`;
                        link.click();
                      }}
                      size="sm"
                      className="flex-1"
                    >
                      <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      Download
                    </Button>
                    <Button
                      onClick={() => window.location.href = '/historico'}
                      variant="secondary"
                      size="sm"
                      className="flex-1"
                    >
                      <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Ver Histórico
                    </Button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="flex-1 overflow-y-auto">
              <div className="bg-muted p-6 rounded-lg">
                <pre className="text-sm font-mono whitespace-pre-wrap break-words">
                  {previewData}
                </pre>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CriarCurriculo;
