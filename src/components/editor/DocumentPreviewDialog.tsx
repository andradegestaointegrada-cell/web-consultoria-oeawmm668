import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { Eye } from 'lucide-react'
import type { StandardContent } from '@/types/editor'

export function DocumentPreviewDialog({ content }: { content: StandardContent }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Eye className="mr-2 h-4 w-4" />
          Visualizar
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl h-[85vh] flex flex-col p-0 gap-0 overflow-hidden bg-muted/20">
        <DialogHeader className="p-6 pb-4 bg-background border-b z-10">
          <DialogTitle>Visualização do Documento</DialogTitle>
        </DialogHeader>
        <ScrollArea className="flex-1 p-6">
          <div className="prose prose-slate dark:prose-invert max-w-none bg-card text-card-foreground border rounded-lg shadow-sm p-8 md:p-12 min-h-full mx-auto max-w-[800px]">
            <h1>{content.titulo}</h1>
            <div dangerouslySetInnerHTML={{ __html: content.introducao }} />
            {content.secoes.map((s) => (
              <div key={s.id} className="mt-8">
                <h2>{s.subtitulo}</h2>
                <div dangerouslySetInnerHTML={{ __html: s.conteudo }} />
              </div>
            ))}
            <div className="mt-8" dangerouslySetInnerHTML={{ __html: content.conclusao }} />
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
