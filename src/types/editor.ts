export interface Section {
  id: string
  subtitulo: string
  conteudo: string
}

export interface StandardContent {
  titulo: string
  introducao: string
  secoes: Section[]
  conclusao: string
}

export interface StatusReportTask {
  id: string
  description: string
  status: string
  progress: number
}

export interface StatusReportContent {
  project_info: {
    name: string
    consultant: string
    period: string
  }
  tasks: StatusReportTask[]
  risks: string
  next_steps: string
}
