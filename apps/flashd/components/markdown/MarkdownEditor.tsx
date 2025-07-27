import React from 'react'
import { WebRichTextEditor } from './WebRichTextEditor'

interface MarkdownEditorProps {
  value: string
  onChangeText: (text: string) => void
  placeholder?: string
  label?: string
  multiline?: boolean
}

export function MarkdownEditor({
  value,
  onChangeText,
  placeholder = "Enter text with rich formatting...",
  label,
}: MarkdownEditorProps) {
  return (
    <WebRichTextEditor
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      label={label}
    />
  )
}