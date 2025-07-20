import React from 'react'
import Markdown from 'react-native-markdown-display'
import { Text } from '../ui/text'

interface MarkdownRendererProps {
  content: string
  style?: any
  className?: string
}

export function MarkdownRenderer({ content, style, className }: MarkdownRendererProps) {
  const isMarkdown = content.includes('**') || content.includes('*') || content.includes('#') ||
    content.includes('==') || content.includes('`') || content.includes('[')

  if (!isMarkdown) {
    return (
      <Text className={className} style={style}>
        {content}
      </Text>
    )
  }

  const markdownStyles = {
    body: {
      color: 'rgb(38, 38, 39)',
      fontSize: 16,
      lineHeight: 24,
      fontFamily: 'System',
      ...style,
    },
    heading1: {
      color: 'rgb(255, 105, 97)',
      fontSize: 24,
      fontWeight: 'bold',
      marginVertical: 8,
    },
    heading2: {
      color: 'rgb(255, 105, 97)',
      fontSize: 20,
      fontWeight: 'bold',
      marginVertical: 6,
    },
    heading3: {
      color: 'rgb(255, 105, 97)',
      fontSize: 18,
      fontWeight: 'bold',
      marginVertical: 4,
    },
    strong: {
      fontWeight: 'bold',
      color: 'rgb(38, 38, 39)',
    },
    em: {
      fontStyle: 'italic',
      color: 'rgb(82, 82, 82)',
    },
    code_inline: {
      backgroundColor: 'rgb(254, 245, 243)',
      color: 'rgb(185, 45, 37)',
      paddingHorizontal: 4,
      paddingVertical: 2,
      borderRadius: 4,
      fontSize: 14,
      fontFamily: 'monospace',
    },
    code_block: {
      backgroundColor: 'rgb(254, 245, 243)',
      color: 'rgb(185, 45, 37)',
      padding: 12,
      borderRadius: 8,
      fontSize: 14,
      fontFamily: 'monospace',
      marginVertical: 8,
    },
    blockquote: {
      backgroundColor: 'rgb(255, 244, 233)',
      borderLeftWidth: 4,
      borderLeftColor: 'rgb(255, 133, 60)',
      paddingLeft: 12,
      paddingVertical: 8,
      marginVertical: 8,
      fontStyle: 'italic',
    },
    list_item: {
      marginVertical: 2,
    },
    bullet_list: {
      marginVertical: 4,
    },
    ordered_list: {
      marginVertical: 4,
    },
    link: {
      color: 'rgb(255, 105, 97)',
      textDecorationLine: 'underline',
    },
    hr: {
      backgroundColor: 'rgb(212, 212, 212)',
      height: 1,
      marginVertical: 16,
    },
    table: {
      borderWidth: 1,
      borderColor: 'rgb(212, 212, 212)',
      borderRadius: 8,
      marginVertical: 8,
    },
    thead: {
      backgroundColor: 'rgb(255, 250, 248)',
    },
    tbody: {},
    th: {
      backgroundColor: 'rgb(255, 250, 248)',
      borderWidth: 1,
      borderColor: 'rgb(212, 212, 212)',
      padding: 8,
      fontWeight: 'bold',
    },
    td: {
      borderWidth: 1,
      borderColor: 'rgb(212, 212, 212)',
      padding: 8,
    },
    tr: {
      borderBottomWidth: 1,
      borderBottomColor: 'rgb(212, 212, 212)',
    },
  }

  return (
    <Markdown style={markdownStyles}>
      {content}
    </Markdown>
  )
}