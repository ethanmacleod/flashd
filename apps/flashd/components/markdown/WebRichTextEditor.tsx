import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  ChevronDown,
  Italic,
  List,
  ListOrdered,
  Palette,
  Strikethrough,
  Underline
} from 'lucide-react-native'
import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react'
import { Platform } from 'react-native'
import { Box } from '../ui/box'
import { HStack } from '../ui/hstack'
import { Pressable } from '../ui/pressable'
import { ScrollView } from '../ui/scroll-view'
import { Text } from '../ui/text'
import { VStack } from '../ui/vstack'
import { SimpleColorModal } from './SimpleColorModal'

interface WebRichTextEditorProps {
  value: string
  onChangeText: (text: string) => void
  placeholder?: string
  label?: string
}

interface TextStyle {
  id: string
  label: string
  tag: string
}

const TEXT_STYLES: TextStyle[] = [
  { id: 'normal', label: 'Normal Text', tag: 'div' },
  { id: 'h1', label: 'Heading 1', tag: 'h1' },
  { id: 'h2', label: 'Heading 2', tag: 'h2' },
  { id: 'h3', label: 'Heading 3', tag: 'h3' },
]

interface FormattingButton {
  id: string
  icon: React.ComponentType<any>
  label: string
  command: string
  queryCommand?: string
}

const FORMATTING_BUTTONS: FormattingButton[] = [
  { id: 'bold', icon: Bold, label: 'Bold', command: 'bold', queryCommand: 'bold' },
  { id: 'italic', icon: Italic, label: 'Italic', command: 'italic', queryCommand: 'italic' },
  { id: 'underline', icon: Underline, label: 'Underline', command: 'underline', queryCommand: 'underline' },
  { id: 'strikethrough', icon: Strikethrough, label: 'Strikethrough', command: 'strikeThrough', queryCommand: 'strikeThrough' },
]

const ALIGNMENT_BUTTONS: FormattingButton[] = [
  { id: 'alignLeft', icon: AlignLeft, label: 'Align Left', command: 'justifyLeft', queryCommand: 'justifyLeft' },
  { id: 'alignCenter', icon: AlignCenter, label: 'Align Center', command: 'justifyCenter', queryCommand: 'justifyCenter' },
  { id: 'alignRight', icon: AlignRight, label: 'Align Right', command: 'justifyRight', queryCommand: 'justifyRight' },
]

const LIST_BUTTONS: FormattingButton[] = [
  { id: 'bulletList', icon: List, label: 'Bullet List', command: 'insertUnorderedList', queryCommand: 'insertUnorderedList' },
  { id: 'numberedList', icon: ListOrdered, label: 'Numbered List', command: 'insertOrderedList', queryCommand: 'insertOrderedList' },
]

export interface WebRichTextEditorRef {
  focus: () => void
  getContent: () => string
  setContent: (content: string) => void
}

export const WebRichTextEditor = forwardRef<WebRichTextEditorRef, WebRichTextEditorProps>(
  ({ value, onChangeText, placeholder, label }, ref) => {
    const editorRef = useRef<HTMLDivElement>(null)
    const [selectedTextStyle, setSelectedTextStyle] = useState(TEXT_STYLES[0])
    const [showTextDropdown, setShowTextDropdown] = useState(false)
    const [showColorModal, setShowColorModal] = useState(false)
    const [activeFormats, setActiveFormats] = useState<Set<string>>(new Set())
    const [isEditorFocused, setIsEditorFocused] = useState(false)
    const [isInitialized, setIsInitialized] = useState(false)
    const lastContentRef = useRef('')

    // Helper functions for cursor position
    const saveCursorPosition = useCallback(() => {
      if (!document || !editorRef.current) return null

      const selection = window.getSelection()
      if (!selection || selection.rangeCount === 0) return null

      const range = selection.getRangeAt(0)
      const preCaretRange = range.cloneRange()
      preCaretRange.selectNodeContents(editorRef.current)
      preCaretRange.setEnd(range.endContainer, range.endOffset)

      return preCaretRange.toString().length
    }, [])

    const restoreCursorPosition = useCallback((position: number) => {
      if (!document || !editorRef.current || position === null) return

      const walker = document.createTreeWalker(
        editorRef.current,
        NodeFilter.SHOW_TEXT,
        null
      )

      let currentLength = 0
      let targetNode = null
      let targetOffset = 0

      while (walker.nextNode()) {
        const node = walker.currentNode
        const nodeLength = node.textContent?.length || 0

        if (currentLength + nodeLength >= position) {
          targetNode = node
          targetOffset = position - currentLength
          break
        }
        currentLength += nodeLength
      }

      if (targetNode) {
        const range = document.createRange()
        const selection = window.getSelection()

        range.setStart(targetNode, Math.min(targetOffset, targetNode.textContent?.length || 0))
        range.collapse(true)

        selection?.removeAllRanges()
        selection?.addRange(range)
      }
    }, [])

    useImperativeHandle(ref, () => ({
      focus: () => {
        editorRef.current?.focus()
      },
      getContent: () => {
        return editorRef.current?.innerHTML || ''
      },
      setContent: (content: string) => {
        if (editorRef.current && !isEditorFocused) {
          editorRef.current.innerHTML = content
          lastContentRef.current = content
        }
      }
    }), [isEditorFocused])

    const updateActiveFormats = useCallback(() => {
      if (!document || !isEditorFocused) return

      const newActiveFormats = new Set<string>()

      try {
        // Check formatting states
        if (document.queryCommandState('bold')) newActiveFormats.add('bold')
        if (document.queryCommandState('italic')) newActiveFormats.add('italic')
        if (document.queryCommandState('underline')) newActiveFormats.add('underline')
        if (document.queryCommandState('strikeThrough')) newActiveFormats.add('strikethrough')
        if (document.queryCommandState('justifyLeft')) newActiveFormats.add('alignLeft')
        if (document.queryCommandState('justifyCenter')) newActiveFormats.add('alignCenter')
        if (document.queryCommandState('justifyRight')) newActiveFormats.add('alignRight')
        if (document.queryCommandState('insertUnorderedList')) newActiveFormats.add('bulletList')
        if (document.queryCommandState('insertOrderedList')) newActiveFormats.add('numberedList')

        const selection = window.getSelection()
        if (selection && selection.rangeCount > 0) {
          const range = selection.getRangeAt(0)
          let element = range.startContainer

          while (element && element.nodeType !== Node.ELEMENT_NODE) {
            element = element.parentNode
          }

          if (element) {
            const tagName = (element as Element).tagName?.toLowerCase()
            const matchingStyle = TEXT_STYLES.find(style => style.tag === tagName)
            if (matchingStyle) {
              setSelectedTextStyle(matchingStyle)
            } else {
              setSelectedTextStyle(TEXT_STYLES[0])
            }
          }
        }
      } catch (error) {
        console.warn('Error checking command state:', error)
      }

      setActiveFormats(newActiveFormats)
    }, [isEditorFocused])

    const executeCommand = useCallback((command: string, value?: any) => {
      if (!document || !editorRef.current) return false

      try {
        const cursorPos = saveCursorPosition()

        editorRef.current.focus()
        const result = document.execCommand(command, false, value)

        if (cursorPos !== null && ['bold', 'italic', 'underline', 'strikeThrough'].includes(command)) {
          setTimeout(() => restoreCursorPosition(cursorPos), 0)
        }

        const event = new Event('input', { bubbles: true })
        editorRef.current.dispatchEvent(event)

        setTimeout(updateActiveFormats, 50)

        return result
      } catch (error) {
        console.error('Error executing command:', command, error)
        return false
      }
    }, [updateActiveFormats, saveCursorPosition, restoreCursorPosition])

    const handleInput = useCallback((e: React.FormEvent<HTMLDivElement>) => {
      const content = e.currentTarget.innerHTML
      lastContentRef.current = content
      onChangeText(content)
      setTimeout(updateActiveFormats, 50)
    }, [onChangeText, updateActiveFormats])

    useEffect(() => {
      if (!isInitialized && editorRef.current) {
        if (value && value !== lastContentRef.current) {
          editorRef.current.innerHTML = value
          lastContentRef.current = value
        }
        setIsInitialized(true)
      }
    }, [value, isInitialized])

    useEffect(() => {
      if (isInitialized && !isEditorFocused && editorRef.current) {
        const currentContent = editorRef.current.innerHTML
        if (value !== currentContent && value !== lastContentRef.current) {
          editorRef.current.innerHTML = value
          lastContentRef.current = value
        }
      }
    }, [value, isInitialized, isEditorFocused])

    const handleFocus = useCallback(() => {
      setIsEditorFocused(true)
      setTimeout(updateActiveFormats, 10)
    }, [updateActiveFormats])

    const handleBlur = useCallback(() => {
      setIsEditorFocused(false)
    }, [])

    const handleSelectionChange = useCallback(() => {
      if (isEditorFocused) {
        setTimeout(updateActiveFormats, 10)
      }
    }, [isEditorFocused, updateActiveFormats])

    const handleKeyUp = useCallback(() => {
      if (isEditorFocused) {
        setTimeout(updateActiveFormats, 50)
      }
    }, [updateActiveFormats, isEditorFocused])

    const handleMouseUp = useCallback(() => {
      if (isEditorFocused) {
        setTimeout(updateActiveFormats, 50)
      }
    }, [updateActiveFormats, isEditorFocused])

    const handleTextStyleSelect = useCallback((textStyle: TextStyle) => {
      setSelectedTextStyle(textStyle)
      setShowTextDropdown(false)
      executeCommand('formatBlock', textStyle.tag)
    }, [executeCommand])

    const handleFormatPress = useCallback((button: FormattingButton) => {
      executeCommand(button.command)
    }, [executeCommand])

    const handleColorSelect = useCallback((color: string) => {
      executeCommand('foreColor', color)
      setShowColorModal(false)
    }, [executeCommand])

    useEffect(() => {
      if (typeof document !== 'undefined') {
        document.addEventListener('selectionchange', handleSelectionChange)
        return () => {
          document.removeEventListener('selectionchange', handleSelectionChange)
        }
      }
    }, [handleSelectionChange])

    const getButtonStyle = (isActive: boolean) => {
      return `p-2 border border-outline-200 rounded-lg transition-colors ${isActive
          ? 'bg-primary-100 border-primary-300 shadow-sm'
          : 'bg-background-50 hover:bg-background-100 active:bg-background-100'
        }`
    }

    const getIconColor = (isActive: boolean) => {
      return isActive ? '#3b82f6' : '#4b5563'
    }

    if (Platform.OS !== 'web') {
      return (
        <VStack className="space-y-3">
          {label && (
            <Text className="text-sm font-medium text-typography-900">{label}</Text>
          )}
          <Box className="p-4 border border-outline-200 rounded-lg min-h-[120px] bg-background-0">
            <Text className="text-typography-500">
              Rich text editing is optimized for web. On mobile, please use a simpler text input.
            </Text>
          </Box>
        </VStack>
      )
    }

    return (
      <VStack className="space-y-3">
        {label && (
          <Text className="text-sm font-medium text-typography-900">{label}</Text>
        )}

        <Box className="bg-background-0 border border-outline-200 rounded-lg shadow-sm relative" style={{ zIndex: 100 }}>
          <HStack className="items-center justify-between px-4 py-3 flex-wrap gap-2">
            <Box className="relative">
              <Pressable
                onPress={() => setShowTextDropdown(!showTextDropdown)}
                className="flex-row items-center space-x-2 px-3 py-2 bg-background-50 border border-outline-200 rounded-lg min-w-[140px]"
              >
                <Text className="text-sm font-medium text-typography-700 flex-1">
                  {selectedTextStyle.label}
                </Text>
                <ChevronDown size={16} color="#6b7280" />
              </Pressable>

              {showTextDropdown && (
                <>
                  <Box
                    className="absolute top-full left-0 mt-1 w-48 bg-background-0 border border-outline-200 rounded-lg shadow-lg"
                    style={{ zIndex: 150 }}
                  >
                    <VStack className="py-1">
                      {TEXT_STYLES.map((textStyle) => (
                        <Pressable
                          key={textStyle.id}
                          onPress={() => handleTextStyleSelect(textStyle)}
                          className={`px-3 py-2 hover:bg-background-50 ${selectedTextStyle.id === textStyle.id ? 'bg-primary-50' : ''}`}
                        >
                          <Text className={`text-sm ${selectedTextStyle.id === textStyle.id ? 'text-primary-600 font-medium' : 'text-typography-700'}`}>
                            {textStyle.label}
                          </Text>
                        </Pressable>
                      ))}
                    </VStack>
                  </Box>

                  <div
                    className="fixed inset-0"
                    style={{ zIndex: 140 }}
                    onClick={() => setShowTextDropdown(false)}
                  />
                </>
              )}
            </Box>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-1 mx-4">
              <HStack className="space-x-2">
                {FORMATTING_BUTTONS.map((button) => {
                  const isActive = activeFormats.has(button.id)
                  return (
                    <Pressable
                      key={button.id}
                      onPress={() => handleFormatPress(button)}
                      className={getButtonStyle(isActive)}
                    >
                      <button.icon size={18} color={getIconColor(isActive)} />
                    </Pressable>
                  )
                })}

                {ALIGNMENT_BUTTONS.map((button) => {
                  const isActive = activeFormats.has(button.id)
                  return (
                    <Pressable
                      key={button.id}
                      onPress={() => handleFormatPress(button)}
                      className={getButtonStyle(isActive)}
                    >
                      <button.icon size={18} color={getIconColor(isActive)} />
                    </Pressable>
                  )
                })}

                {LIST_BUTTONS.map((button) => {
                  const isActive = activeFormats.has(button.id)
                  return (
                    <Pressable
                      key={button.id}
                      onPress={() => handleFormatPress(button)}
                      className={getButtonStyle(isActive)}
                    >
                      <button.icon size={18} color={getIconColor(isActive)} />
                    </Pressable>
                  )
                })}
              </HStack>
            </ScrollView>

            <Pressable
              onPress={() => setShowColorModal(true)}
              className="p-2 bg-background-50 border border-outline-200 rounded-lg hover:bg-background-100 active:bg-background-100"
            >
              <Palette size={20} color="#ef4444" />
            </Pressable>
          </HStack>
        </Box>

        <Box className="border border-outline-200 rounded-lg overflow-hidden">
          <div
            ref={editorRef}
            contentEditable
            suppressContentEditableWarning
            onInput={handleInput}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onKeyUp={handleKeyUp}
            onMouseUp={handleMouseUp}
            style={{
              minHeight: 120,
              maxHeight: 300,
              padding: 16,
              outline: 'none',
              fontFamily: 'system-ui, -apple-system, sans-serif',
              fontSize: 16,
              lineHeight: 1.5,
              color: '#111827',
              backgroundColor: '#ffffff',
              overflow: 'auto'
            }}
            data-placeholder={placeholder}
            className="[&:empty:before]:content-[attr(data-placeholder)] [&:empty:before]:text-gray-400 [&:empty:before]:pointer-events-none [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:my-2 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:my-2 [&_h3]:text-lg [&_h3]:font-medium [&_h3]:my-1 [&_div]:text-base [&_div]:font-normal"
          />
        </Box>

        <SimpleColorModal
          visible={showColorModal}
          onClose={() => setShowColorModal(false)}
          onColorSelect={handleColorSelect}
        />

        <HStack className="justify-between items-center">
          <Text className="text-xs text-typography-500">
            Rich text formatting with real-time preview
          </Text>
        </HStack>
      </VStack>
    )
  }
)