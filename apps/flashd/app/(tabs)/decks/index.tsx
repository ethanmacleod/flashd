import { ErrorBoundary } from '@/components/ErrorBoundary'
import { Form, FormInput } from '@/components/forms'
import { QueryErrorFallback } from '@/components/QueryErrorFallback'
import { useToastNotifications } from '@/components/toast'
import { Box } from '@/components/ui/box'
import { Button, ButtonText } from '@/components/ui/button'
import { HStack } from '@/components/ui/hstack'
import { Pressable } from '@/components/ui/pressable'
import { ScrollView } from '@/components/ui/scroll-view'
import { Text } from '@/components/ui/text'
import { VStack } from '@/components/ui/vstack'
import { useDecks } from '@/hooks/useDecks'
import { useRouter } from 'expo-router'
import { PlusIcon, SquarePen, Trash2 } from 'lucide-react-native'
import React, { useState } from 'react'
import { RefreshControl } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { z } from 'zod'

import { AppModal } from '@/components/AppModal'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { EmptyState } from '@/components/EmptyState'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { DECK_COLORS } from '@/lib/utility/constants'
import type { Deck, DeckCreateInput } from '@/types/api'

// Deck creation schema
const deckSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title too long'),
  description: z.string().optional(),
  color: z.string().optional(),
  isPublic: z.boolean().optional(),
})

type DeckFormData = z.infer<typeof deckSchema>

interface DeckCardProps {
  deck: Deck
  onPress: () => void
  onEdit: (deck: Deck) => void
  onDelete: (deck: Deck) => void
}

function DeckCard({ deck, onPress, onEdit, onDelete }: DeckCardProps) {

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
    }).format(new Date(date))
  }

  const handleEdit = (e: any) => {
    e.stopPropagation()
    onEdit(deck)
  }

  const handleDelete = (e: any) => {
    e.stopPropagation()
    onDelete(deck)
  }

  return (
    <Box className="relative w-full sm:w-1/2 md:w-1/3 lg:w-1/4 xl:w-1/5 p-2">
      <Pressable
        onPress={onPress}
        className="bg-background-0 rounded-xl border border-outline-200 shadow-sm w-full h-48"
      >
        <VStack className="flex-1 p-4">
          <HStack className="justify-between items-start mb-3">
            <HStack className="flex-1 items-center space-x-3">
              <Box
                className="w-4 h-4 rounded-full flex-shrink-0"
                style={{ backgroundColor: deck.color ?? 'rgb(var(--color-primary-500))' }}
              />
              <Text className="text-sm font-bold text-typography-900 flex-1" numberOfLines={1}>
                {deck.title}
              </Text>
            </HStack>
            <Pressable
              onPress={(e) => handleEdit(e)}
              className="p-1 -m-1 ml-2 rounded-full hover:bg-primary-100 transition-colors duration-200 group"
            >
              <SquarePen
                size={16}
                className="text-typography-500 group-hover:text-primary-500 transition-colors duration-200"
              />
            </Pressable>
            <Pressable
              onPress={(e) => handleDelete(e)}
              className="p-1 -m-1 ml-2 rounded-full hover:bg-error-100 transition-colors duration-200 group"
            >
              <Trash2
                size={16}
                className="text-typography-500 group-hover:text-error-500 transition-colors duration-200"
              />
            </Pressable>
          </HStack>

          <Box className="flex-1 justify-start mb-3">
            {deck.description ? (
              <Text className="text-xs text-typography-600" numberOfLines={4}>
                {deck.description}
              </Text>
            ) : (
              <Text className="text-xs text-typography-400 italic">
                No description
              </Text>
            )}
          </Box>

          <HStack className="justify-between items-center">
            <Text className="text-xs font-medium text-typography-900">
              {deck.cardCount} {deck.cardCount === 1 ? 'card' : 'cards'}
            </Text>
            <Text className="text-xs text-typography-400">
              {formatDate(deck.updatedAt)}
            </Text>
          </HStack>
        </VStack>
      </Pressable>
    </Box>
  )
}

interface DeckFormModalProps {
  visible: boolean
  onClose: () => void
  onSubmit: (data: DeckFormData) => Promise<void>
  deck?: Deck | null
  isLoading?: boolean
}

function DeckFormModal({ visible, onClose, onSubmit, deck, isLoading }: DeckFormModalProps) {
  const [selectedColor, setSelectedColor] = useState(deck?.color ?? DECK_COLORS[0])

  const handleSubmit = async (data: DeckFormData) => {
    const submitData = {
      ...data,
      color: selectedColor,
      description: data.description ?? undefined
    }
    await onSubmit(submitData)
  }

  const defaultValues: Partial<DeckFormData> = deck ? {
    title: deck.title,
    description: deck.description ?? '',
    isPublic: deck.isPublic,
  } : {
    title: '',
    description: '',
    isPublic: false,
  }

  return (
    <AppModal
      isOpen={visible}
      onClose={onClose}
      title={deck ? 'Edit Deck' : 'Create New Deck'}
      size="md"
      showFooter={false}
    >
      <VStack className="space-y-4">
        <Form
          schema={deckSchema}
          onSubmit={handleSubmit}
          submitText={deck ? 'Save Changes' : 'Create Deck'}
          isLoading={isLoading}
          defaultValues={defaultValues}
        >
          <FormInput
            name="title"
            label="Deck Title"
            placeholder="Enter deck title"
          />

          <FormInput
            name="description"
            label="Description (Optional)"
            placeholder="Enter deck description"
            multiline
            numberOfLines={3}
          />

          <VStack className="space-y-2">
            <Text className="text-sm font-medium text-typography-700">Deck Color</Text>
            <HStack className="flex-wrap gap-3">
              {DECK_COLORS.map((color) => (
                <Pressable
                  key={color}
                  onPress={() => setSelectedColor(color)}
                  className={`w-8 h-8 rounded-full border-2 ${selectedColor === color ? 'border-outline-400' : 'border-outline-200'
                    }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </HStack>
          </VStack>
        </Form>
      </VStack>
    </AppModal>
  )
}

export default function DecksPage() {
  return (
    <ErrorBoundary>
      <DecksContent />
    </ErrorBoundary>
  )
}

function DecksContent() {
  const router = useRouter()
  const { showSuccess, showError } = useToastNotifications()
  const {
    decks,
    isLoading,
    error,
    refetch,
    createDeck,
    updateDeck,
    deleteDeck,
    isCreating,
    isUpdating
  } = useDecks()

  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingDeck, setEditingDeck] = useState<Deck | null>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [deckToDelete, setDeckToDelete] = useState<Deck | null>(null)

  const handleDeckPress = (deckId: string) => {
    router.push(`/decks/${deckId}`)
  }

  const handleCreateDeck = async (data: DeckFormData) => {
    try {
      await createDeck(data as DeckCreateInput)
      showSuccess({ title: 'Deck created successfully!' })
    } catch (err) {
      console.error('Create deck error:', err)
      showError({ title: 'Failed to create deck' })
    }
  }

  const handleUpdateDeck = async (data: DeckFormData) => {
    if (!editingDeck) return

    try {
      await updateDeck({ id: editingDeck.id, ...data })
      showSuccess({ title: 'Deck updated successfully!' })
      setEditingDeck(null)
    } catch (err) {
      console.error('Update deck error:', err)
      showError({ title: 'Failed to update deck' })
    }
  }

  const handleDeleteDeck = (deck: Deck) => {
    setDeckToDelete(deck)
    setShowDeleteDialog(true)
  }

  const confirmDeleteDeck = async () => {
    if (!deckToDelete) return

    try {
      await deleteDeck(deckToDelete.id)
      showSuccess({ title: 'Success', description: 'Deck deleted successfully!' })
    } catch (err) {
      console.error('Delete deck error:', err)
      showError({ title: 'Error', description: 'Failed to delete deck' })
    } finally {
      setShowDeleteDialog(false)
      setDeckToDelete(null)
    }
  }

  const cancelDeleteDeck = () => {
    setShowDeleteDialog(false)
    setDeckToDelete(null)
  }

  if (error) {
    return (
      <SafeAreaView className="flex-1">
        <QueryErrorFallback
          error={error as unknown as Error}
          onRetry={() => refetch()}
          isLoading={isLoading}
        />
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView className="flex-1 bg-background-50">
      <VStack className="flex-1">
        <HStack className="justify-between items-center p-6 bg-background-0 border-b border-outline-200">
          <Text className="text-2xl font-bold text-typography-900">My Decks</Text>
          <Button
            onPress={() => setShowCreateModal(true)}
            size="sm"
            action="primary"
          >
            <PlusIcon size={16} color="rgb(var(--color-background-0))" />
            <ButtonText className="ml-1">New Deck</ButtonText>
          </Button>
        </HStack>

        <Box className="flex-1 px-6">
          {isLoading ? (
            <LoadingSpinner
              message="Loading your decks..."
            />
          ) : !decks || decks.length === 0 ? (
            <EmptyState
              title="No decks yet"
              description="Create your first flashcard deck to start learning!"
              actionText="Create Your First Deck"
              onAction={() => setShowCreateModal(true)}
              icon={<PlusIcon size={48} color="rgb(var(--color-typography-400))" />}
            />
          ) : (
            <ScrollView
              className="flex-1"
              contentContainerStyle={{ padding: 16 }}
              refreshControl={
                <RefreshControl
                  refreshing={isLoading}
                  onRefresh={refetch}
                  colors={['rgb(var(--color-primary-500))']}
                />
              }
              showsVerticalScrollIndicator={false}
            >
              <Box className="flex-row flex-wrap -m-2">
                {decks?.map((deck) => (
                  <DeckCard
                    key={deck.id}
                    deck={deck}
                    onPress={() => handleDeckPress(deck.id)}
                    onEdit={setEditingDeck}
                    onDelete={handleDeleteDeck}
                  />
                ))}
              </Box>
            </ScrollView>
          )}
        </Box>
      </VStack>

      <DeckFormModal
        visible={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateDeck}
        isLoading={isCreating}
      />

      <DeckFormModal
        visible={!!editingDeck}
        onClose={() => setEditingDeck(null)}
        onSubmit={handleUpdateDeck}
        deck={editingDeck}
        isLoading={isUpdating}
      />

      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={cancelDeleteDeck}
        onConfirm={confirmDeleteDeck}
        title="Delete Deck"
        message={`Are you sure you want to delete "${deckToDelete?.title}"? This will also delete all cards in this deck. This action cannot be undone.`}
        confirmText="Delete"
        confirmAction="negative"
      />
    </SafeAreaView>
  )
}
