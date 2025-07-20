import { CardEditModal } from '@/components/CardEditModal'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { EmptyState } from '@/components/EmptyState'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { BackButton } from '@/components/Shared'
import { useToastNotifications } from '@/components/toast'
import { Box } from '@/components/ui/box'
import { Button, ButtonText } from '@/components/ui/button'
import { HStack } from '@/components/ui/hstack'
import { Pressable } from '@/components/ui/pressable'
import { Text } from '@/components/ui/text'
import { VStack } from '@/components/ui/vstack'
import { useCards } from '@/hooks/useCards'
import { trpc } from '@/lib/trpc'
import type { Card } from '@/types/api'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { EditIcon, PlayIcon, ShareIcon, Trash2Icon } from 'lucide-react-native'
import React, { useState } from 'react'
import { Dimensions, Platform } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

const CARDS_PER_PAGE = 8
const { width } = Dimensions.get('window')
const isDesktop = Platform.OS === 'web' && width >= 1024

export default function DeckDetailPage() {
  const router = useRouter()
  const { id } = useLocalSearchParams<{ id: string }>()
  const { showError, showSuccess } = useToastNotifications()

  const [cardEditModalOpen, setCardEditModalOpen] = useState(false)
  const [editingCard, setEditingCard] = useState<Card | null>(null)
  const [showDeleteDeckDialog, setShowDeleteDeckDialog] = useState(false)
  const [showDeleteCardDialog, setShowDeleteCardDialog] = useState(false)
  const [deletingCard, setDeletingCard] = useState<Card | null>(null)
  const [currentPage, setCurrentPage] = useState(1)

  const { data: deck, isLoading, error } = trpc.deck.getDeck.useQuery(
    { id },
    { enabled: !!id }
  )
  const { data: stats } = trpc.deck.getDeckStats.useQuery(
    { id },
    { enabled: !!id }
  )

  const {
    createCard,
    updateCard,
    deleteCard,
    isCreating,
    isUpdating,
    isDeleting,
    createError,
    updateError,
    deleteError,
  } = useCards(id!)

  const deleteDeckMutation = trpc.deck.deleteDeck.useMutation({
    onSuccess: () => {
      showSuccess({ title: 'Success', description: 'Deck deleted successfully' })
      router.back()
    },
    onError: (error) => {
      showError({ title: 'Error', description: error.message ?? 'Unknown Error' })
    },
  })


  const handleDeleteDeck = () => {
    deleteDeckMutation.mutate({ id: id! })
  }

  const handleStudy = () => {
    router.push(`/decks/${id}/review`)
  }

  const handleShare = () => {
    // TODO: Implement share functionality
    showSuccess({ title: 'Coming Soon', description: 'Share functionality will be available soon' })
  }

  const handleAddCard = () => {
    setEditingCard(null)
    setCardEditModalOpen(true)
  }

  const handleEditCard = (card: Card) => {
    setEditingCard(card)
    setCardEditModalOpen(true)
  }

  const handleDeleteCard = (card: Card) => {
    setDeletingCard(card)
    setShowDeleteCardDialog(true)
  }

  const handleCardSubmit = async (data: { front: string; back: string; hint?: string }) => {
    try {
      if (editingCard) {
        await updateCard({
          id: editingCard.id,
          ...data,
        })
        showSuccess({ title: 'Success', description: 'Card updated successfully' })
      } else {
        await createCard(data)
        showSuccess({ title: 'Success', description: 'Card added successfully' })
      }
      setCardEditModalOpen(false)
      setEditingCard(null)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      if (editingCard) {
        showError({ title: 'Error', description: updateError?.message ?? errorMessage })
      } else {
        showError({ title: 'Error', description: createError?.message ?? errorMessage })
      }
    }
  }

  const cards = deck?.cards || []
  const totalPages = Math.ceil(cards.length / CARDS_PER_PAGE)
  const startIndex = (currentPage - 1) * CARDS_PER_PAGE
  const paginatedCards = isDesktop ? cards.slice(startIndex, startIndex + CARDS_PER_PAGE) : cards

  if (error) {
    return (
      <SafeAreaView className="flex-1">
        <Box className="flex-1 justify-center items-center p-6">
          <Text className="text-error-500 text-center mb-4">
            Failed to load deck: {error.message}
          </Text>
          <Button onPress={() => router.back()}>
            <ButtonText>Go Back</ButtonText>
          </Button>
        </Box>
      </SafeAreaView>
    )
  }

  if (isLoading || !deck) {
    return (
      <SafeAreaView className="flex-1">
        <LoadingSpinner message="Loading deck..." />
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView className="flex-1 bg-background-50">
      <VStack className="flex-1">
        <Box className="bg-background-0 border-b border-outline-200 p-6">
          <HStack className="justify-between items-center mb-4">
            <BackButton />
            <Button
              variant="outline"
              size="sm"
              onPress={() => setShowDeleteDeckDialog(true)}
            >
              <Trash2Icon size={16} color="#ef4444" />
              <ButtonText className="text-error-500 ml-1">Delete Deck</ButtonText>
            </Button>
          </HStack>

          <VStack className="space-y-2">
            <HStack className="items-center space-x-3">
              <Box
                className="w-6 h-6 rounded-full"
                style={{ backgroundColor: deck.color ?? '#3b82f6' }}
              />
              <Text className="text-2xl font-bold text-typography-900">{deck.title}</Text>
            </HStack>

            {deck.description && (
              <Text className="text-typography-600">{deck.description}</Text>
            )}
          </VStack>
        </Box>

        <Box className="flex-1 p-6">
          {isDesktop ? (
            // Desktop Layout: Stats left, Cards right
            <HStack className="space-x-6 flex-1">
              <VStack className="w-80 space-y-4">
                {stats && (
                  <Box className="bg-background-0 p-4 rounded-lg border border-outline-200">
                    <Text className="text-lg font-semibold mb-3">Deck Statistics</Text>
                    <VStack className="space-y-2">
                      <HStack className="justify-between">
                        <Text className="text-typography-600">Total Cards:</Text>
                        <Text className="font-medium">{stats.totalCards}</Text>
                      </HStack>
                      <HStack className="justify-between">
                        <Text className="text-typography-600">Reviewed:</Text>
                        <Text className="font-medium">{stats.reviewedCards}</Text>
                      </HStack>
                      <HStack className="justify-between">
                        <Text className="text-typography-600">Not Reviewed:</Text>
                        <Text className="font-medium">{stats.unReviewedCards}</Text>
                      </HStack>
                      {stats.totalReviews > 0 && (
                        <HStack className="justify-between">
                          <Text className="text-typography-600">Accuracy:</Text>
                          <Text className="font-medium">{stats.accuracy}%</Text>
                        </HStack>
                      )}
                    </VStack>
                  </Box>
                )}
              </VStack>

              <VStack className="flex-1 space-y-4">
                <HStack className="space-x-3">
                  <Button
                    onPress={handleStudy}
                    disabled={deck.cardCount === 0}
                    className="flex-1"
                  >
                    <PlayIcon size={16} color="white" />
                    <ButtonText className="ml-1">Review Cards</ButtonText>
                  </Button>
                  <Button
                    variant="outline"
                    onPress={handleAddCard}
                    className="flex-1"
                  >
                    <EditIcon size={16} color="currentColor" />
                    <ButtonText className="ml-1">Edit Cards</ButtonText>
                  </Button>
                  <Button
                    variant="outline"
                    onPress={handleShare}
                    className="flex-1"
                  >
                    <ShareIcon size={16} color="currentColor" />
                    <ButtonText className="ml-1">Share</ButtonText>
                  </Button>
                </HStack>

                {cards.length > 0 ? (
                  <>
                    <VStack className="space-y-2 flex-1">
                      {paginatedCards.map((card) => (
                        <Box key={card.id} className="bg-background-0 p-4 rounded-lg border border-outline-200">
                          <HStack className="items-start space-x-3">
                            <VStack className="flex-1">
                              <Text className="font-medium text-typography-900 leading-relaxed">
                                {card.front}
                              </Text>
                            </VStack>
                            <HStack className="space-x-3">
                              <Pressable
                                onPress={() => handleEditCard(card)}
                                className="p-2 rounded-lg hover:bg-background-100 active:bg-background-200"
                              >
                                <EditIcon size={24} color="#6b7280" />
                              </Pressable>
                              <Pressable
                                onPress={() => handleDeleteCard(card)}
                                className="p-2 rounded-lg hover:bg-error-50 active:bg-error-100"
                              >
                                <Trash2Icon size={24} color="#ef4444" />
                              </Pressable>
                            </HStack>
                          </HStack>
                        </Box>
                      ))}
                    </VStack>

                    {totalPages > 1 && (
                      <HStack className="justify-center space-x-2">
                        <Button
                          variant="outline"
                          onPress={() => setCurrentPage(Math.max(1, currentPage - 1))}
                          disabled={currentPage === 1}
                        >
                          <ButtonText>Previous</ButtonText>
                        </Button>
                        <Text className="self-center px-4 py-2">
                          {currentPage} of {totalPages}
                        </Text>
                        <Button
                          variant="outline"
                          onPress={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                          disabled={currentPage === totalPages}
                        >
                          <ButtonText>Next</ButtonText>
                        </Button>
                      </HStack>
                    )}
                  </>
                ) : (
                  <EmptyState
                    title="No cards yet"
                    description="Add your first flashcard to get started"
                    actionText="Add Card"
                    onAction={handleAddCard}
                  />
                )}
              </VStack>
            </HStack>
          ) : (
            // Mobile Layout: Vertical
            <VStack className="space-y-4 flex-1">
              {stats && (
                <Box className="bg-background-0 p-4 rounded-lg border border-outline-200">
                  <Text className="text-lg font-semibold mb-3">Deck Statistics</Text>
                  <VStack className="space-y-2">
                    <HStack className="justify-between">
                      <Text className="text-gray-600">Total Cards:</Text>
                      <Text className="font-medium">{stats.totalCards}</Text>
                    </HStack>
                    <HStack className="justify-between">
                      <Text className="text-gray-600">Reviewed:</Text>
                      <Text className="font-medium">{stats.reviewedCards}</Text>
                    </HStack>
                    <HStack className="justify-between">
                      <Text className="text-gray-600">Not Reviewed:</Text>
                      <Text className="font-medium">{stats.unReviewedCards}</Text>
                    </HStack>
                    {stats.totalReviews > 0 && (
                      <HStack className="justify-between">
                        <Text className="text-gray-600">Accuracy:</Text>
                        <Text className="font-medium">{stats.accuracy}%</Text>
                      </HStack>
                    )}
                  </VStack>
                </Box>
              )}

              <VStack className="space-y-2">
                <Button
                  onPress={handleStudy}
                  disabled={deck.cardCount === 0}
                >
                  <PlayIcon size={16} color="white" />
                  <ButtonText className="ml-1">
                    {deck.cardCount === 0 ? 'Add Cards to Study' : `Study Deck (${deck.cardCount} cards)`}
                  </ButtonText>
                </Button>
                <HStack className="space-x-2">
                  <Button
                    variant="outline"
                    onPress={handleAddCard}
                    className="flex-1"
                  >
                    <EditIcon size={16} color="currentColor" />
                    <ButtonText className="ml-1">Edit Cards</ButtonText>
                  </Button>
                  <Button
                    variant="outline"
                    onPress={handleShare}
                    className="flex-1"
                  >
                    <ShareIcon size={16} color="currentColor" />
                    <ButtonText className="ml-1">Share</ButtonText>
                  </Button>
                </HStack>
              </VStack>

              {cards.length > 0 ? (
                <VStack className="space-y-2 flex-1">
                  <Text className="text-lg font-semibold">Cards</Text>
                  {paginatedCards.map((card) => (
                    <Box key={card.id} className="bg-white p-4 rounded-lg border border-gray-200">
                      <HStack className="items-start space-x-3">
                        <VStack className="flex-1">
                          <Text className="font-medium text-gray-900 leading-relaxed">
                            {card.front}
                          </Text>
                        </VStack>
                        <HStack className="space-x-3">
                          <Pressable
                            onPress={() => handleEditCard(card)}
                            className="p-2 rounded-lg hover:bg-gray-100 active:bg-gray-200"
                          >
                            <EditIcon size={24} color="#6b7280" />
                          </Pressable>
                          <Pressable
                            onPress={() => handleDeleteCard(card)}
                            className="p-2 rounded-lg hover:bg-red-50 active:bg-red-100"
                          >
                            <Trash2Icon size={24} color="#ef4444" />
                          </Pressable>
                        </HStack>
                      </HStack>
                    </Box>
                  ))}
                </VStack>
              ) : (
                <EmptyState
                  title="No cards yet"
                  description="Add your first flashcard to get started"
                  actionText="Add Card"
                  onAction={handleAddCard}
                />
              )}
            </VStack>
          )}
        </Box>
      </VStack>

      <CardEditModal
        isOpen={cardEditModalOpen}
        onClose={() => {
          setCardEditModalOpen(false)
          setEditingCard(null)
        }}
        onSubmit={handleCardSubmit}
        card={editingCard}
        isLoading={isCreating || isUpdating}
      />

      <ConfirmDialog
        isOpen={showDeleteDeckDialog}
        onClose={() => setShowDeleteDeckDialog(false)}
        title="Delete Deck"
        message="Are you sure you want to delete this deck? This action cannot be undone."
        confirmText="Delete"
        onConfirm={handleDeleteDeck}
        isLoading={deleteDeckMutation.isPending}
        confirmAction="negative"
      />

      <ConfirmDialog
        isOpen={showDeleteCardDialog}
        onClose={() => {
          setShowDeleteCardDialog(false)
          setDeletingCard(null)
        }}
        title="Delete Card"
        message="Are you sure you want to delete this card? This action cannot be undone."
        confirmText="Delete"
        onConfirm={async () => {
          if (deletingCard) {
            try {
              await deleteCard(deletingCard.id)
              showSuccess({ title: 'Success', description: 'Card deleted successfully' })
              setShowDeleteCardDialog(false)
              setDeletingCard(null)
            } catch (error) {
              const errorMessage = error instanceof Error ? error.message : 'Unknown error'
              showError({ title: 'Error', description: deleteError?.message ?? errorMessage })
            }
          }
        }}
        isLoading={isDeleting}
        confirmAction="negative"
      />
    </SafeAreaView>
  )
}