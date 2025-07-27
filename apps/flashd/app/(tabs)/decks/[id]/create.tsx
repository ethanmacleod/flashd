import { ColorPicker } from '@/components/ColorPicker'
import { MarkdownEditor } from '@/components/markdown/MarkdownEditor'
import { MarkdownRenderer } from '@/components/markdown/MarkdownRenderer'
import { BackButton } from '@/components/Shared'
import { useToastNotifications } from '@/components/toast'
import { Box } from '@/components/ui/box'
import { Button, ButtonText } from '@/components/ui/button'
import { HStack } from '@/components/ui/hstack'
import { ScrollView } from '@/components/ui/scroll-view'
import { Text } from '@/components/ui/text'
import { VStack } from '@/components/ui/vstack'
import { trpc } from '@/lib/trpc'
import { CARD_COLORS } from '@/lib/utility/constants'
import { useLocalSearchParams } from 'expo-router'
import { Plus, Save } from 'lucide-react-native'
import React, { useState } from 'react'
import { Dimensions, Platform } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

const { width } = Dimensions.get('window')
const isDesktop = Platform.OS === 'web' && width >= 1024

export default function CreateCardPage() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const { showError, showSuccess } = useToastNotifications()

  const [front, setFront] = useState('')
  const [back, setBack] = useState('')
  const [hint, setHint] = useState('')
  const [cardColor, setCardColor] = useState('default')
  const [showPreview, setShowPreview] = useState(false)

  const { data: deck } = trpc.deck.getDeck.useQuery({ id: id! }, { enabled: !!id })

  const createCardMutation = trpc.deck.createCard.useMutation({
    onSuccess: () => {
      showSuccess({ title: 'Card created!', description: 'Your new card has been added to the deck.' })
      setFront('')
      setBack('')
      setHint('')
      setCardColor('default')
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

    createCardMutation.mutate({
      deckId: id!,
      front: front.trim(),
      back: back.trim(),
      hint: hint.trim() || undefined,
      color: cardColor,
    })
  }

  const handleSaveAndAddAnother = () => {
    handleSaveCard()
  }

  if (!deck) {
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
                Create New Card
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
              action="primary"
              size="sm"
              onPress={handleSaveAndAddAnother}
              disabled={createCardMutation.isPending || !front.trim() || !back.trim()}
            >
              <Save size={16} color="rgb(var(--color-background-0))" />
              <ButtonText className="ml-1">Save Card</ButtonText>
            </Button>
          </HStack>
        </HStack>

        <Box className="flex-1">
          {isDesktop ? (
            <HStack className="flex-1">
              <VStack className="flex-1 p-6 space-y-6 border-r border-outline-200 max-w-2xl">
                <Text className="text-xl font-semibold text-typography-900">
                  Create Card
                </Text>

                <ColorPicker
                  selectedColor={cardColor}
                  onColorChange={setCardColor}
                />

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
                    action="primary"
                    onPress={handleSaveAndAddAnother}
                    disabled={createCardMutation.isPending || !front.trim() || !back.trim()}
                    className="flex-1"
                  >
                    <Plus size={16} color="rgb(var(--color-background-0))" />
                    <ButtonText className="ml-1">Save & Add Another</ButtonText>
                  </Button>
                </HStack>
              </VStack>
              <ScrollView className="flex-1">
                <VStack className="flex-1 p-6 space-y-6 bg-background-0">
                  <Text className="text-xl font-semibold text-typography-900">
                    Preview
                  </Text>

                  <VStack className="space-y-4">
                    <Text className="text-sm font-medium text-typography-600 uppercase tracking-wide">
                      Card Preview
                    </Text>
                    <Box className={`p-6 rounded-xl border-2 shadow-sm ${CARD_COLORS.find(c => c.id === cardColor)?.background || 'bg-background-0'} ${CARD_COLORS.find(c => c.id === cardColor)?.border || 'border-outline-200'}`}>
                      <VStack className="space-y-4">
                        <VStack className="space-y-3">
                          <Text className="text-sm font-medium text-primary-600 uppercase tracking-wide">
                            Question
                          </Text>
                          <Box className="min-h-[80px]">
                            {front.trim() ? (
                              <MarkdownRenderer content={front} />
                            ) : (
                              <Text className="text-typography-400 italic">
                                Question preview will appear here...
                              </Text>
                            )}
                          </Box>
                        </VStack>

                        <Box className="h-px bg-outline-200" />

                        <VStack className="space-y-3">
                          <Text className="text-sm font-medium text-secondary-600 uppercase tracking-wide">
                            Answer
                          </Text>
                          <Box className="min-h-[80px]">
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
                          <>
                            <Box className="h-px bg-outline-200" />
                            <VStack className="space-y-3">
                              <Text className="text-sm font-medium text-tertiary-600 uppercase tracking-wide">
                                Hint
                              </Text>
                              <Box className="p-3 bg-tertiary-50 rounded-lg border border-tertiary-200">
                                <MarkdownRenderer content={`💡 ${hint}`} className="text-sm text-tertiary-700" />
                              </Box>
                            </VStack>
                          </>
                        )}
                      </VStack>
                    </Box>
                  </VStack>
                </VStack>
              </ScrollView>
            </HStack>
          ) : (
            <ScrollView>

              <VStack className="flex-1 p-4 space-y-4">
                {!showPreview ? (
                  <>
                    <Text className="text-xl font-semibold text-typography-900">
                      Create Card
                    </Text>

                    <ColorPicker
                      selectedColor={cardColor}
                      onColorChange={setCardColor}
                    />

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

                    <Button
                      action="primary"
                      onPress={handleSaveAndAddAnother}
                      disabled={createCardMutation.isPending || !front.trim() || !back.trim()}
                    >
                      <Plus size={16} color="rgb(var(--color-background-0))" />
                      <ButtonText className="ml-1">Save & Add Another</ButtonText>
                    </Button>
                  </>
                ) : (
                  <>
                    <Text className="text-xl font-semibold text-typography-900">
                      Preview
                    </Text>

                    <Box className={`p-4 rounded-xl border-2 shadow-sm ${CARD_COLORS.find(c => c.id === cardColor)?.background || 'bg-background-0'} ${CARD_COLORS.find(c => c.id === cardColor)?.border || 'border-outline-200'}`}>
                      <VStack className="space-y-4">
                        <VStack className="space-y-3">
                          <Text className="text-sm font-medium text-primary-600 uppercase tracking-wide">
                            Question
                          </Text>
                          <Box className="min-h-[80px]">
                            {front.trim() ? (
                              <MarkdownRenderer content={front} />
                            ) : (
                              <Text className="text-typography-400 italic">
                                Question preview will appear here...
                              </Text>
                            )}
                          </Box>
                        </VStack>

                        <Box className="h-px bg-outline-200" />

                        <VStack className="space-y-3">
                          <Text className="text-sm font-medium text-secondary-600 uppercase tracking-wide">
                            Answer
                          </Text>
                          <Box className="min-h-[80px]">
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
                          <>
                            <Box className="h-px bg-outline-200" />
                            <VStack className="space-y-3">
                              <Text className="text-sm font-medium text-tertiary-600 uppercase tracking-wide">
                                Hint
                              </Text>
                              <Box className="p-3 bg-tertiary-50 rounded-lg border border-tertiary-200">
                                <MarkdownRenderer content={`💡 ${hint}`} className="text-sm text-tertiary-700" />
                              </Box>
                            </VStack>
                          </>
                        )}
                      </VStack>
                    </Box>
                  </>
                )}
              </VStack>
            </ScrollView>

          )}
        </Box>
      </VStack>
    </SafeAreaView>
  )
}