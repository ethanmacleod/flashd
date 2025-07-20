import { AppModal } from '@/components/AppModal'
import { Form, FormMarkdownInput } from '@/components/forms'
import { Button, ButtonText } from '@/components/ui/button'
import { HStack } from '@/components/ui/hstack'
import { VStack } from '@/components/ui/vstack'
import type { Card } from '@/types/api'
import React from 'react'
import { z } from 'zod'

// Schema for card creation/editing
const cardSchema = z.object({
  front: z.string().min(1, 'Question is required').max(500, 'Question too long'),
  back: z.string().min(1, 'Answer is required').max(1000, 'Answer too long'),
  hint: z.string().optional(),
})

export type CardFormData = z.infer<typeof cardSchema>

interface CardEditModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: { front: string; back: string; hint?: string }) => Promise<void>
  card?: Card | null
  isLoading?: boolean
}

export function CardEditModal({
  isOpen,
  onClose,
  onSubmit,
  card,
  isLoading = false
}: CardEditModalProps) {
  const isEditing = !!card
  const title = isEditing ? 'Edit Card' : 'Add New Card'

  const defaultValues: Partial<CardFormData> = card ? {
    front: card.front,
    back: card.back,
    hint: card.hint || '',
  } : {
    front: '',
    back: '',
    hint: '',
  }

  const handleSubmit = async (data: CardFormData) => {
    await onSubmit(data)
    onClose()
  }

  return (
    <AppModal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="md"
      showFooter={false}
    >
      <VStack className="space-y-4">
        <Form
          schema={cardSchema}
          onSubmit={handleSubmit}
          submitText={isEditing ? 'Save Changes' : 'Add Card'}
          isLoading={isLoading}
          defaultValues={defaultValues}
        >
          <FormMarkdownInput
            name="front"
            label="Question (Front of card)"
            placeholder="Enter the question with **bold**, *italic*, ==highlight== etc."
            rows={3}
            helperText="Supports markdown formatting for rich text"
          />

          <FormMarkdownInput
            name="back"
            label="Answer (Back of card)"
            placeholder="Enter the answer with formatting, `code`, > quotes etc."
            rows={4}
            helperText="Use markdown for better formatting and readability"
          />

          <FormMarkdownInput
            name="hint"
            label="Hint (Optional)"
            placeholder="Enter a helpful hint with formatting"
            rows={2}
          />

          <HStack className="space-x-3 mt-6">
            <Button
              variant="outline"
              onPress={onClose}
              className="flex-1"
              disabled={isLoading}
            >
              <ButtonText>Cancel</ButtonText>
            </Button>

          </HStack>
        </Form>
      </VStack>
    </AppModal>
  )
}