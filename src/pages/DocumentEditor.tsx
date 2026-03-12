import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/contexts/AuthContext'
import { StandardEditor } from '@/components/editor/StandardEditor'
import { StatusReportEditor } from '@/components/editor/StatusReportEditor'

export default function DocumentEditor() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [documento, setDocumento] = useState<any>(null)

  useEffect(() => {
    const fetchDoc = async () => {
      if (!id || !user) return

      const { data, error } = await supabase
        .from('documentos')
        .select('*')
        .eq('id', id)
        .eq('usuario_id', user.id)
        .single()

      if (error || !data) {
        toast.error('Documento não encontrado')
        navigate('/documentos')
        return
      }

      setDocumento(data)
      setLoading(false)
    }

    fetchDoc()
  }, [id, user, navigate])

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  const handleBack = () => navigate('/documentos')

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12 animate-fade-in">
      {documento?.tipo_documento === 'Status Report' ? (
        <StatusReportEditor documento={documento} onBack={handleBack} />
      ) : (
        <StandardEditor documento={documento} onBack={handleBack} />
      )}
    </div>
  )
}
