import React, { useRef, useEffect } from 'react'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import {
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Heading3,
} from 'lucide-react'

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value || ''
    }
  }, [value])

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML)
    }
  }

  const execute = (cmd: string, arg?: string) => {
    document.execCommand(cmd, false, arg)
    editorRef.current?.focus()
    handleInput()
  }

  return (
    <div className="border border-input rounded-md bg-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 overflow-hidden shadow-sm">
      <div className="flex flex-wrap items-center gap-1 border-b border-input p-1 bg-muted/40">
        <ToggleGroup type="multiple" className="justify-start">
          <ToggleGroupItem value="bold" aria-label="Bold" onClick={() => execute('bold')}>
            <Bold className="h-4 w-4" />
          </ToggleGroupItem>
          <ToggleGroupItem value="italic" aria-label="Italic" onClick={() => execute('italic')}>
            <Italic className="h-4 w-4" />
          </ToggleGroupItem>
          <ToggleGroupItem
            value="underline"
            aria-label="Underline"
            onClick={() => execute('underline')}
          >
            <Underline className="h-4 w-4" />
          </ToggleGroupItem>
        </ToggleGroup>

        <div className="w-px h-6 bg-border mx-1" />

        <ToggleGroup type="single" className="justify-start">
          <ToggleGroupItem value="h1" aria-label="H1" onClick={() => execute('formatBlock', 'H1')}>
            <Heading1 className="h-4 w-4" />
          </ToggleGroupItem>
          <ToggleGroupItem value="h2" aria-label="H2" onClick={() => execute('formatBlock', 'H2')}>
            <Heading2 className="h-4 w-4" />
          </ToggleGroupItem>
          <ToggleGroupItem value="h3" aria-label="H3" onClick={() => execute('formatBlock', 'H3')}>
            <Heading3 className="h-4 w-4" />
          </ToggleGroupItem>
        </ToggleGroup>

        <div className="w-px h-6 bg-border mx-1" />

        <ToggleGroup type="multiple" className="justify-start">
          <ToggleGroupItem
            value="ul"
            aria-label="Bulleted List"
            onClick={() => execute('insertUnorderedList')}
          >
            <List className="h-4 w-4" />
          </ToggleGroupItem>
          <ToggleGroupItem
            value="ol"
            aria-label="Numbered List"
            onClick={() => execute('insertOrderedList')}
          >
            <ListOrdered className="h-4 w-4" />
          </ToggleGroupItem>
        </ToggleGroup>
      </div>
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        onBlur={handleInput}
        className="p-4 min-h-[150px] outline-none prose prose-sm dark:prose-invert max-w-none focus:outline-none empty:before:content-[attr(data-placeholder)] empty:before:text-muted-foreground empty:before:pointer-events-none"
        data-placeholder={placeholder}
      />
    </div>
  )
}
