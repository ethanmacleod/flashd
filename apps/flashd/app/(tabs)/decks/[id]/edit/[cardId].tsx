import { ConfirmDialog } from '@/components/ConfirmDialog'
import { MarkdownEditor } from '@/components/markdown/MarkdownEditor'
import { MarkdownRenderer } from '@/components/markdown/MarkdownRenderer'
import { BackButton } from '@/components/Shared'
import { useToastNotifications } from '@/components/toast'
import { Box } from '@/components/ui/box'
import { Button, ButtonText } from '@/components/ui/button'
import { HStack } from '@/components/ui/hstack'
import { Text } from '@/components/ui/text'
import { VStack } from '@/components/ui/vstack'
import { trpc } from '@/lib/trpc'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { Save, Trash2 } from 'lucide-react-native'
import React, { useEffect, useState } from 'react'
import { Dimensions, Platform } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

const { width } = Dimensions.get('window')
const isDesktop = Platform.OS === 'web' && width >= 1024

export default function EditCardPage() {
  const router = useRouter()
  const { id, cardId } = useLocalSearchParams<{ id: string; cardId: string }>()
  const { showError, showSuccess } = useToastNotifications()

  const [front, setFront] = useState('')
  const [back, setBack] = useState('')
  const [hint, setHint] = useState('')
  const [showPreview, setShowPreview] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const { data: deck } = trpc.deck.getDeck.useQuery({ id: id! }, { enabled: !!id })

  const currentCard = deck?.cards.find(card => card.id === cardId)

  useEffect(() => {
    if (currentCard) {
      setFront(currentCard.front)
      setBack(currentCard.back)
      setHint(currentCard.hint || '')
    }
  }, [currentCard])

  const updateCardMutation = trpc.deck.updateCard.useMutation({
    onSuccess: () => {
      showSuccess({ title: 'Card updated!', description: 'Your changes have been saved.' })
      router.back()
    },
    onError: (error) => {
      showError({ title: 'Error', description: error.message })
    },
  })

  const deleteCardMutation = trpc.deck.deleteCard.useMutation({
    onSuccess: () => {
      showSuccess({ title: 'Card deleted!', description: 'The card has been removed from the deck.' })
      router.back()
    },
    onError: (error) => {
      showError({ title: 'Error', description: error.message })
    },
  })

  const handleSaveCard = () => {
    if (!front.trim() || !back.trim()) {
      showError({ title: 'Missing content', description: 'Please enter both question and answer.' })
      return
    }

    updateCardMutation.mutate({
      id: cardId!,
      front: front.trim(),
      back: back.trim(),
      hint: hint.trim() || undefined,
    })
  }

  const handleDeleteCard = () => {
    deleteCardMutation.mutate({ id: cardId! })
  }

  if (!deck || !currentCard) {
    return (
      <SafeAreaView className="flex-1 bg-background-50">
        <VStack className="flex-1 justify-center items-center">
          <Text>Loading...</Text>
        </VStack>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView className="flex-1 bg-background-50">
      <VStack className="flex-1">
        <HStack className="justify-between items-center p-4 bg-background-0 border-b border-outline-200">
          <HStack className="items-center space-x-3">
            <BackButton />
            <VStack>
              <Text className="text-lg font-bold text-typography-900">
                Edit Card
              </Text>
              <Text className="text-sm text-typography-600">
                {deck.title}
              </Text>
            </VStack>
          </HStack>

          <HStack className="space-x-3">
            {!isDesktop && (
              <Button
                variant="outline"
                size="sm"
                onPress={() => setShowPreview(!showPreview)}
              >
                <ButtonText>{showPreview ? 'Edit' : 'Preview'}</ButtonText>
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onPress={() => setShowDeleteDialog(true)}
            >
              <Trash2 size={16} color="rgb(var(--color-error-500))" />
            </Button>
            <Button
              action="primary"
              size="sm"
              onPress={handleSaveCard}
              disabled={updateCardMutation.isPending || !front.trim() || !back.trim()}
            >
              <Save size={16} color="rgb(var(--color-background-0))" />
              <ButtonText className="ml-1">Save Changes</ButtonText>
            </Button>
          </HStack>
        </HStack>

        <Box className="flex-1">
          {isDesktop ? (
            <HStack className="flex-1">
              <VStack className="flex-1 p-6 space-y-6 border-r border-outline-200">
                <Text className="text-xl font-semibold text-typography-900">
                  Edit Card
                </Text>

                <MarkdownEditor
                  value={front}
                  onChangeText={setFront}
                  label="Question (Front of card)"
                  placeholder="Enter the question with **bold**, *italic*, `code` etc."
                />

                <MarkdownEditor
                  value={back}
                  onChangeText={setBack}
                  label="Answer (Back of card)"
                  placeholder="Enter the answer with formatting, `code`, > quotes etc."
                />

                <MarkdownEditor
                  value={hint}
                  onChangeText={setHint}
                  label="Hint (Optional)"
                  placeholder="Enter a helpful hint with formatting"
                />

                <HStack className="space-x-3">
                  <Button
                    variant="outline"
                    onPress={() => setShowDeleteDialog(true)}
                    className="flex-1"
                  >
                    <Trash2 size={16} color="rgb(var(--color-error-500))" />
                    <ButtonText className="ml-1">Delete Card</ButtonText>
                  </Button>
                  <Button
                    action="primary"
                    onPress={handleSaveCard}
                    disabled={updateCardMutation.isPending || !front.trim() || !back.trim()}
                    className="flex-1"
                  >
                    <Save size={16} color="rgb(var(--color-background-0))" />
                    <ButtonText className="ml-1">Save Changes</ButtonText>
                  </Button>
                </HStack>
              </VStack>

              <VStack className="flex-1 p-6 space-y-6 bg-background-0">
                <Text className="text-xl font-semibold text-typography-900">
                  Preview
                </Text>

                <VStack className="space-y-3">
                  <Text className="text-sm font-medium text-primary-600 uppercase tracking-wide">
                    Question
                  </Text>
                  <Box className="min-h-[100px] p-4 bg-background-50 rounded-lg border border-outline-200">
                    {front.trim() ? (
                      <MarkdownRenderer content={front} />
                    ) : (
                      <Text className="text-typography-400 italic">
                        Question preview will appear here...
                      </Text>
                    )}
                  </Box>
                </VStack>

                <VStack className="space-y-3">
                  <Text className="text-sm font-medium text-secondary-600 uppercase tracking-wide">
                    Answer
                  </Text>
                  <Box className="min-h-[120px] p-4 bg-background-50 rounded-lg border border-outline-200">
                    {back.trim() ? (
                      <MarkdownRenderer content={back} />
                    ) : (
                      <Text className="text-typography-400 italic">
                        Answer preview will appear here...
                      </Text>
                    )}
                  </Box>
                </VStack>

                {hint.trim() && (
                  <VStack className="space-y-3">
                    <Text className="text-sm font-medium text-tertiary-600 uppercase tracking-wide">
                      Hint
                    </Text>
                    <Box className="p-3 bg-tertiary-50 rounded-lg border border-tertiary-200">
                      <MarkdownRenderer content={`💡 ${hint}`} className="text-sm text-tertiary-700" />
                    </Box>
                  </VStack>
                )}
              </VStack>
            </HStack>
          ) : (
            <VStack className="flex-1 p-4 space-y-4">
              {!showPreview ? (
                <>
                  <Text className="text-xl font-semibold text-typography-900">
                    Edit Card
                  </Text>

                  <MarkdownEditor
                    value={front}
                    onChangeText={setFront}
                    label="Question (Front of card)"
                    placeholder="Enter the question with **bold**, *italic*, `code` etc."
                  />

                  <MarkdownEditor
                    value={back}
                    onChangeText={setBack}
                    label="Answer (Back of card)"
                    placeholder="Enter the answer with formatting, `code`, > quotes etc."
                  />

                  <MarkdownEditor
                    value={hint}
                    onChangeText={setHint}
                    label="Hint (Optional)"
                    placeholder="Enter a helpful hint with formatting"
                  />

                  <HStack className="space-x-3">
                    <Button
                      variant="outline"
                      onPress={() => setShowDeleteDialog(true)}
                      className="flex-1"
                    >
                      <Trash2 size={16} color="rgb(var(--color-error-500))" />
                      <ButtonText className="ml-1">Delete</ButtonText>
                    </Button>
                    <Button
                      action="primary"
                      onPress={handleSaveCard}
                      disabled={updateCardMutation.isPending || !front.trim() || !back.trim()}
                      className="flex-1"
                    >
                      <Save size={16} color="rgb(var(--color-background-0))" />
                      <ButtonText className="ml-1">Save</ButtonText>
                    </Button>
                  </HStack>
                </>
              ) : (
                <>
                  <Text className="text-xl font-semibold text-typography-900">
                    Preview
                  </Text>

                  <VStack className="space-y-3">
                    <Text className="text-sm font-medium text-primary-600 uppercase tracking-wide">
                      Question
                    </Text>
                    <Box className="min-h-[100px] p-4 bg-background-0 rounded-lg border border-outline-200">
                      {front.trim() ? (
                        <MarkdownRenderer content={front} />
                      ) : (
                        <Text className="text-typography-400 italic">
                          Question preview will appear here...
                        </Text>
                      )}
                    </Box>
                  </VStack>

                  <VStack className="space-y-3">
                    <Text className="text-sm font-medium text-secondary-600 uppercase tracking-wide">
                      Answer
                    </Text>
                    <Box className="min-h-[120px] p-4 bg-background-0 rounded-lg border border-outline-200">
                      {back.trim() ? (
                        <MarkdownRenderer content={back} />
                      ) : (
                        <Text className="text-typography-400 italic">
                          Answer preview will appear here...
                        </Text>
                      )}
                    </Box>
                  </VStack>

                  {hint.trim() && (
                    <VStack className="space-y-3">
                      <Text className="text-sm font-medium text-tertiary-600 uppercase tracking-wide">
                        Hint
                      </Text>
                      <Box className="p-3 bg-tertiary-50 rounded-lg border border-tertiary-200">
                        <MarkdownRenderer content={`💡 ${hint}`} className="text-sm text-tertiary-700" />
                      </Box>
                    </VStack>
                  )}
                </>
              )}
            </VStack>
          )}
        </Box>
      </VStack>

      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDeleteCard}
        title="Delete Card"
        description="Are you sure you want to delete this card? This action cannot be undone."
        confirmText="Delete"
        variant="destructive"
      />
    </SafeAreaView>
  )
}