import { useLocalSearchParams, useRouter } from 'expo-router'
import { ArrowLeft, Eye, SkipForward, Star } from 'lucide-react-native'
import React, { useState } from 'react'
import { Dimensions } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { LoadingSpinner } from '@/components/LoadingSpinner'
import { useToastNotifications } from '@/components/toast'
import { Box } from '@/components/ui/box'
import { Button, ButtonText } from '@/components/ui/button'
import { HStack } from '@/components/ui/hstack'
import { Pressable } from '@/components/ui/pressable'
import { Slider, SliderFilledTrack, SliderThumb, SliderTrack } from '@/components/ui/slider'
import { Text } from '@/components/ui/text'
import { VStack } from '@/components/ui/vstack'
import { trpc } from '@/lib/trpc'


const { width } = Dimensions.get('window')
const isDesktop = width >= 1024

interface ReviewCard {
  id: string
  front: string
  back: string
  hint?: string | null
  order: number
}

const DIFFICULTY_OPTIONS = [
  { value: 1, label: 'Very Easy', color: 'success-500', description: 'Gave an accurate answer without much thinking' },
  { value: 2, label: 'Easy', color: 'success-400', description: 'Recalled with minor hesitation' },
  { value: 3, label: 'Medium', color: 'warning-500', description: 'Required some effort to remember' },
  { value: 4, label: 'Hard', color: 'error-400', description: 'Struggled but eventually recalled' },
  { value: 5, label: 'Very Hard', color: 'error-500', description: 'Could not recall or answered incorrectly' },
]

export default function ReviewPage() {
  const router = useRouter()
  const { id } = useLocalSearchParams<{ id: string }>()
  const { showError, showSuccess } = useToastNotifications()

  const [sessionId, setSessionId] = useState<string | null>(null)
  const [cards, setCards] = useState<ReviewCard[]>([])
  const [currentCardIndex, setCurrentCardIndex] = useState(0)
  const [showAnswer, setShowAnswer] = useState(false)
  const [selectedDifficulty, setSelectedDifficulty] = useState<number>(3)
  const [isFavorited, setIsFavorited] = useState(false)
  const [isRetryPhase, setIsRetryPhase] = useState(false)
  const [reviewStartTime, setReviewStartTime] = useState<Date | null>(null)

  const startSessionMutation = trpc.deck.startReviewSession.useMutation({
    onSuccess: (data) => {
      setSessionId(data.sessionId)
      setCards(data.cards)
      setReviewStartTime(new Date())
    },
    onError: (error) => {
      showError({ title: 'Error', description: error.message })
      setHasInitialized(false)
      router.back()
    },
  })
  const submitReviewMutation = trpc.deck.submitCardReview.useMutation()
  const completeSessionMutation = trpc.deck.completeReviewSession.useMutation()
  const { refetch: refetchDifficultCards } = trpc.deck.getDifficultCardsForRetry.useQuery(
    { sessionId: sessionId! },
    { enabled: !!sessionId && isRetryPhase }
  )

  const currentCard = cards[currentCardIndex]
  const isLastCard = currentCardIndex === cards.length - 1
  const progress = cards.length > 0 ? ((currentCardIndex + 1) / cards.length) * 100 : 0
  const currentDifficultyOption = DIFFICULTY_OPTIONS.find(option => option.value === selectedDifficulty) || DIFFICULTY_OPTIONS[2]

  const [hasInitialized, setHasInitialized] = React.useState(false)

  if (id && !sessionId && !startSessionMutation.isPending && !hasInitialized) {
    setHasInitialized(true)
    startSessionMutation.mutate({ deckId: id })
  }

  const handleShowAnswer = () => {
    setShowAnswer(true)
  }

  const handleSkip = () => {
    if (!sessionId || !currentCard) return

    const responseTime = reviewStartTime ? Math.floor((new Date().getTime() - reviewStartTime.getTime()) / 1000) : undefined

    submitReviewMutation.mutate(
      {
        sessionId,
        cardId: currentCard.id,
        difficulty: 3,
        wasSkipped: true,
        responseTime,
      },
      {
        onSuccess: () => {
          moveToNextCard()
        },
        onError: (error) => {
          showError({ title: 'Error', description: error.message })
        },
      }
    )
  }

  const handleToggleFavorite = () => {
    setIsFavorited(!isFavorited)
  }

  const handleContinue = () => {
    if (!sessionId || !currentCard) return

    const responseTime = reviewStartTime ? Math.floor((new Date().getTime() - reviewStartTime.getTime()) / 1000) : undefined

    submitReviewMutation.mutate(
      {
        sessionId,
        cardId: currentCard.id,
        difficulty: selectedDifficulty,
        wasFavorited: isFavorited,
        responseTime,
      },
      {
        onSuccess: () => {
          moveToNextCard()
        },
        onError: (error) => {
          showError({ title: 'Error', description: error.message })
        },
      }
    )
  }

  const moveToNextCard = () => {
    if (isLastCard) {
      if (!isRetryPhase) {
        refetchDifficultCards().then(({ data }) => {
          if (data && data.length > 0) {
            setCards(data)
            setCurrentCardIndex(0)
            setIsRetryPhase(true)
            setShowAnswer(false)
            setSelectedDifficulty(3)
            setIsFavorited(false)
            setReviewStartTime(new Date())
            showSuccess({ title: 'Review Phase', description: 'Now reviewing difficult cards again!' })
          } else {
            completeSession()
          }
        })
      } else {
        completeSession()
      }
    } else {
      setCurrentCardIndex(currentCardIndex + 1)
      setShowAnswer(false)
      setSelectedDifficulty(3)
      setIsFavorited(false)
      setReviewStartTime(new Date())
    }
  }

  const completeSession = () => {
    if (!sessionId) return

    completeSessionMutation.mutate(
      { sessionId },
      {
        onSuccess: () => {
          router.push(`/decks/${id}/review-stats?sessionId=${sessionId}`)
        },
        onError: (error) => {
          showError({ title: 'Error', description: error.message })
        },
      }
    )
  }

  if (startSessionMutation.isPending || !sessionId || !currentCard) {
    return (
      <SafeAreaView className="flex-1 bg-background-50">
        <LoadingSpinner message="Preparing your review session..." />
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView className="flex-1 bg-background-50">
      <VStack className="flex-1">
        <HStack className="justify-between items-center p-4 bg-background-0 border-b border-outline-200">
          <Button
            variant="outline"
            size="sm"
            onPress={() => router.back()}
          >
            <ArrowLeft size={16} color="rgb(var(--color-typography-600))" />
            <ButtonText className="ml-1">Exit</ButtonText>
          </Button>

          <VStack className="items-center">
            <Text className="text-lg font-bold text-typography-900">
              {isRetryPhase ? 'Retry Difficult Cards' : 'Review Session'}
            </Text>
            <Text className="text-sm text-typography-600">
              Card {currentCardIndex + 1} of {cards.length}
            </Text>
          </VStack>

        </HStack>

        <Box className="h-2 bg-background-200">
          <Box
            className="h-full bg-primary-500 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </Box>

        <VStack className="flex-1 p-6">
          {isDesktop ? (
            <HStack className="flex-1 space-x-6">
              <Box className="flex-1 bg-background-0 rounded-xl border border-outline-200 p-6 relative">
                <Pressable
                  onPress={handleToggleFavorite}
                  className="absolute top-4 right-4 p-2 -m-2"
                >
                  <Star
                    size={24}
                    color={isFavorited ? "rgb(var(--color-warning-500))" : "rgb(var(--color-outline-400))"}
                    fill={isFavorited ? "rgb(var(--color-warning-500))" : "transparent"}
                  />
                </Pressable>

                <VStack className="space-y-4 pr-8">
                  <Text className="text-sm font-medium text-primary-600 uppercase tracking-wide">
                    Question
                  </Text>
                  <Text className="text-xl text-typography-900 leading-relaxed">
                    {currentCard.front}
                  </Text>

                  {currentCard.hint && (
                    <Box className="p-3 bg-tertiary-50 rounded-lg">
                      <Text className="text-sm text-tertiary-700">
                        💡 {currentCard.hint}
                      </Text>
                    </Box>
                  )}
                </VStack>
              </Box>

              {showAnswer && (
                <Box className="flex-1 bg-background-0 rounded-xl border border-outline-200 p-6">
                  <VStack className="space-y-4">
                    <Text className="text-sm font-medium text-secondary-600 uppercase tracking-wide">
                      Answer
                    </Text>
                    <Text className="text-xl text-typography-900 leading-relaxed">
                      {currentCard.back}
                    </Text>
                  </VStack>
                </Box>
              )}
            </HStack>
          ) : (
            <VStack className="flex-1 space-y-6">
              <Box className="bg-background-0 rounded-xl border border-outline-200 p-6 relative">
                <Pressable
                  onPress={handleToggleFavorite}
                  className="absolute top-4 right-4 p-2 -m-2"
                >
                  <Star
                    size={24}
                    color={isFavorited ? "rgb(var(--color-warning-500))" : "rgb(var(--color-outline-400))"}
                    fill={isFavorited ? "rgb(var(--color-warning-500))" : "transparent"}
                  />
                </Pressable>

                <VStack className="space-y-4 pr-8">
                  <Text className="text-sm font-medium text-primary-600 uppercase tracking-wide">
                    Question
                  </Text>
                  <Text className="text-xl text-typography-900 leading-relaxed">
                    {currentCard.front}
                  </Text>

                  {currentCard.hint && (
                    <Box className="p-3 bg-tertiary-50 rounded-lg">
                      <Text className="text-sm text-tertiary-700">
                        💡 {currentCard.hint}
                      </Text>
                    </Box>
                  )}
                </VStack>
              </Box>

              {showAnswer && (
                <Box className="bg-background-0 rounded-xl border border-outline-200 p-6">
                  <VStack className="space-y-4">
                    <Text className="text-sm font-medium text-secondary-600 uppercase tracking-wide">
                      Answer
                    </Text>
                    <Text className="text-xl text-typography-900 leading-relaxed">
                      {currentCard.back}
                    </Text>
                  </VStack>
                </Box>
              )}
            </VStack>
          )}
        </VStack>

        <Box className="p-6 bg-background-0 border-t border-outline-200">
          {!showAnswer ? (
            <HStack className="justify-center space-x-4">
              <Button
                variant="outline"
                size="lg"
                onPress={handleSkip}
                className="flex-1"
              >
                <SkipForward size={20} color="rgb(var(--color-typography-600))" />
                <ButtonText className="ml-2">Skip</ButtonText>
              </Button>

              <Button
                action="primary"
                size="lg"
                onPress={handleShowAnswer}
                className="flex-1"
              >
                <Eye size={20} color="rgb(var(--color-background-0))" />
                <ButtonText className="ml-2">Show Answer</ButtonText>
              </Button>
            </HStack>
          ) : (
            <VStack className="space-y-6">
              <VStack className="space-y-4">
                <Text className="text-center text-lg font-semibold text-typography-900">
                  How difficult was this card?
                </Text>

                <VStack className="space-y-3">
                  <Box className="relative mx-12">
                    <HStack className="relative justify-between">
                      {DIFFICULTY_OPTIONS.map((option) => (
                        <Box key={option.value} className="items-center">
                          <Text className={`text-xs font-medium text-center ${selectedDifficulty === option.value
                            ? 'text-primary-600'
                            : 'text-typography-500'
                            }`}>
                            {option.label}
                          </Text>
                        </Box>
                      ))}
                    </HStack>
                  </Box>

                  <Box className="px-12">
                    <Slider
                      value={selectedDifficulty}
                      onChange={(value: number) => setSelectedDifficulty(value)}
                      minValue={1}
                      maxValue={5}
                      step={1}
                      size="lg"
                      className="w-full"
                    >
                      <SliderTrack className="bg-outline-200">
                        <SliderFilledTrack className="bg-primary-500" />
                      </SliderTrack>
                      <SliderThumb className="bg-primary-500 border-2 border-background-0 shadow-lg" />
                    </Slider>
                  </Box>

                  <Box className="relative mx-12">
                    <HStack className="relative justify-between h-6">
                      {DIFFICULTY_OPTIONS.map((option) => (
                        <Pressable
                          key={option.value}
                          onPress={() => setSelectedDifficulty(option.value)}
                          className="items-center justify-center w-6 h-6"
                        >
                          <Box className={`w-2 h-2 rounded-full ${selectedDifficulty === option.value
                            ? 'bg-primary-500'
                            : 'bg-outline-300'
                            }`} />
                        </Pressable>
                      ))}
                    </HStack>
                  </Box>
                </VStack>

                <Box className="bg-background-100 rounded-lg p-4">
                  <Text className="text-center text-typography-700 font-medium">
                    {currentDifficultyOption.description}
                  </Text>
                </Box>
              </VStack>

              <VStack className="space-y-3">
                <Button
                  action="primary"
                  size="lg"
                  onPress={handleContinue}
                  className="w-full"
                >
                  <ButtonText>Continue</ButtonText>
                </Button>

                <Button
                  variant="outline"
                  size="md"
                  onPress={handleToggleFavorite}
                  className="w-full"
                >
                  <Star
                    size={16}
                    color={isFavorited ? "rgb(var(--color-warning-500))" : "rgb(var(--color-outline-400))"}
                    fill={isFavorited ? "rgb(var(--color-warning-500))" : "transparent"}
                  />
                  <ButtonText className="ml-2">
                    {isFavorited ? 'Remove from Favorites' : 'Add to Favorites'}
                  </ButtonText>
                </Button>
              </VStack>
            </VStack>
          )}
        </Box>
      </VStack>
    </SafeAreaView>
  )
}