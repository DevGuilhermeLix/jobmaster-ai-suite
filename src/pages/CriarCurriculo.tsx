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
    setPreviewOpen(true);
    toast.success("Dados estruturados com sucesso!");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
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

    console.log("Resume Data Ready for AI:", cleanData);
    toast.success("Dados preparados! (Geração de PDF será implementada na ETAPA 3)");
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
              >
                <FileText className="h-5 w-5 mr-2" />
                Preparar Currículo
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                size="lg"
                className="flex-1 h-14 text-lg font-semibold"
                onClick={handlePreview}
              >
                Ver JSON Estruturado
              </Button>
            </div>
            
            <p className="text-center text-sm text-muted-foreground">
              * ETAPA 1: Estrutura e templates configurados. Geração de PDF será implementada na ETAPA 3.
            </p>
          </form>
        </div>
      </main>

      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">Dados Estruturados do Currículo</DialogTitle>
            <DialogDescription className="text-base">
              JSON limpo pronto para ser enviado à IA (ETAPA 2) e backend (ETAPA 3)
            </DialogDescription>
          </DialogHeader>
          <div className="bg-muted p-6 rounded-lg">
            <pre className="text-sm font-mono whitespace-pre-wrap break-words">
              {previewData}
            </pre>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CriarCurriculo;
