export type ResumeArea = "Tecnologia" | "Saúde" | "Administrativo";

export interface ResumeData {
  nome: string;
  email: string;
  telefone: string;
  resumo: string;
  habilidades: string;
  experiencias: Array<{
    id: string;
    cargo: string;
    empresa: string;
    periodo: string;
    descricao: string;
  }>;
  area: ResumeArea;
}

export const areaOptions: ResumeArea[] = ["Tecnologia", "Saúde", "Administrativo"];

export const areaDescriptions = {
  Tecnologia: "Template moderno focado em stack técnica, projetos e conquistas mensuráveis",
  Saúde: "Layout profissional destacando certificações, registro e experiência clínica",
  Administrativo: "Design corporativo enfatizando organização, processos e gestão"
};

// Template structure for each area - will be used for HTML generation
export const resumeTemplates = {
  Tecnologia: {
    primaryColor: "#2563eb",
    accentColor: "#3b82f6",
    fontFamily: "Inter, system-ui, sans-serif",
    sections: ["Resumo", "Experiência Técnica", "Stack & Habilidades", "Projetos"],
    tone: "objetivo e focado em resultados mensuráveis"
  },
  Saúde: {
    primaryColor: "#059669",
    accentColor: "#10b981",
    fontFamily: "Georgia, serif",
    sections: ["Perfil Profissional", "Formação e Certificações", "Experiência Clínica", "Habilidades"],
    tone: "empático e profissional com foco em cuidado"
  },
  Administrativo: {
    primaryColor: "#7c3aed",
    accentColor: "#8b5cf6",
    fontFamily: "Arial, Helvetica, sans-serif",
    sections: ["Resumo Executivo", "Experiência Profissional", "Competências", "Formação"],
    tone: "formal e orientado a processos"
  }
};

// Function to build clean JSON for submission
export function buildResumeJSON(data: ResumeData): ResumeData {
  return {
    nome: data.nome.trim(),
    email: data.email.trim().toLowerCase(),
    telefone: data.telefone.trim(),
    resumo: data.resumo.trim(),
    habilidades: data.habilidades.trim(),
    experiencias: data.experiencias.map(exp => ({
      id: exp.id,
      cargo: exp.cargo.trim(),
      empresa: exp.empresa.trim(),
      periodo: exp.periodo.trim(),
      descricao: exp.descricao.trim()
    })).filter(exp => exp.cargo || exp.empresa), // Filter empty experiences
    area: data.area
  };
}
