import { useLocalSearchParams, useRouter } from 'expo-router'
import { ArrowLeft, Clock, Heart, RotateCcw, SkipForward, Target, TrendingUp, Trophy } from 'lucide-react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'

import { LoadingSpinner } from '@/components/LoadingSpinner'
import { Box } from '@/components/ui/box'
import { Button, ButtonText } from '@/components/ui/button'
import { HStack } from '@/components/ui/hstack'
import { ScrollView } from '@/components/ui/scroll-view'
import { Text } from '@/components/ui/text'
import { VStack } from '@/components/ui/vstack'
import { trpc } from '@/lib/trpc'

interface StatCardProps {
  icon: React.ReactNode
  title: string
  value: string | number
  subtitle?: string
  color?: string
}

function StatCard({ icon, title, value, subtitle, color = 'primary' }: StatCardProps) {
  return (
    <Box className={`bg-background-0 rounded-xl border border-outline-200 p-4`}>
      <HStack className="items-center space-x-3">
        <Box className={`w-10 h-10 rounded-lg bg-${color}-100 items-center justify-center`}>
          {icon}
        </Box>
        <VStack className="flex-1">
          <Text className="text-2xl font-bold text-typography-900">{value}</Text>
          <Text className="text-sm font-medium text-typography-700">{title}</Text>
          {subtitle && (
            <Text className="text-xs text-typography-500">{subtitle}</Text>
          )}
        </VStack>
      </HStack>
    </Box>
  )
}

export default function ReviewStatsPage() {
  const router = useRouter()
  const { id, sessionId } = useLocalSearchParams<{ id: string; sessionId: string }>()

  const { data: stats, isLoading, error } = trpc.deck.getReviewSessionStats.useQuery(
    { sessionId: sessionId! },
    { enabled: !!sessionId }
  )

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-background-50">
        <LoadingSpinner message="Calculating your review stats..." />
      </SafeAreaView>
    )
  }

  if (error || !stats) {
    return (
      <SafeAreaView className="flex-1 bg-background-50">
        <VStack className="flex-1 justify-center items-center p-6">
          <Text className="text-lg font-semibold text-error-600 mb-4">
            Error loading stats
          </Text>
          <Button onPress={() => router.back()}>
            <ButtonText>Go Back</ButtonText>
          </Button>
        </VStack>
      </SafeAreaView>
    )
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      month: 'short',
      day: 'numeric',
    }).format(new Date(date))
  }

  const sessionDuration = stats.completedAt && stats.startedAt
    ? Math.round((new Date(stats.completedAt).getTime() - new Date(stats.startedAt).getTime()) / 1000 / 60)
    : 0

  return (
    <SafeAreaView className="flex-1 bg-background-50">
      <VStack className="flex-1">
        <Box className="bg-background-0 border-b border-outline-200 p-6">
          <HStack className="justify-between items-center mb-4">
            <Button
              variant="outline"
              size="sm"
              onPress={() => router.push(`/decks/${id}`)}
            >
              <ArrowLeft size={16} color="rgb(var(--color-typography-600))" />
              <ButtonText className="ml-1">Back to Deck</ButtonText>
            </Button>
          </HStack>

          <VStack className="items-center space-y-2">
            <Box className="w-16 h-16 rounded-full bg-success-100 items-center justify-center mb-2">
              <Trophy size={32} color="rgb(var(--color-success-600))" />
            </Box>
            <Text className="text-2xl font-bold text-typography-900">Review Complete!</Text>
            <Text className="text-lg text-typography-600">{stats.deckTitle}</Text>
            <Text className="text-sm text-typography-500">
              Completed on {formatDate(stats.startedAt)}
            </Text>
          </VStack>
        </Box>

        <ScrollView className="flex-1" contentContainerStyle={{ padding: 24 }}>
          <VStack className="space-y-6">
            <VStack className="space-y-4">
              <Text className="text-lg font-semibold text-typography-900">Session Overview</Text>

              <VStack className="space-y-3">
                <StatCard
                  icon={<Target size={20} color="rgb(var(--color-primary-600))" />}
                  title="Cards Reviewed"
                  value={`${stats.reviewedCards}/${stats.totalCards}`}
                  subtitle="Total progress"
                  color="primary"
                />

                <StatCard
                  icon={<TrendingUp size={20} color="rgb(var(--color-success-600))" />}
                  title="Accuracy"
                  value={`${Math.round(stats.accuracy)}%`}
                  subtitle={`${stats.correctAnswers} correct answers`}
                  color="success"
                />

                <StatCard
                  icon={<Clock size={20} color="rgb(var(--color-info-600))" />}
                  title="Session Duration"
                  value={`${sessionDuration} min`}
                  subtitle="Time spent reviewing"
                  color="info"
                />

                {stats.averageDifficulty && (
                  <StatCard
                    icon={<RotateCcw size={20} color="rgb(var(--color-warning-600))" />}
                    title="Average Difficulty"
                    value={stats.averageDifficulty.toFixed(1)}
                    subtitle="Out of 5.0"
                    color="warning"
                  />
                )}
              </VStack>
            </VStack>

            {(stats.skippedCards > 0 || stats.favoriteCards.length > 0) && (
              <VStack className="space-y-4">
                <Text className="text-lg font-semibold text-typography-900">Additional Details</Text>

                <VStack className="space-y-3">
                  {stats.skippedCards > 0 && (
                    <StatCard
                      icon={<SkipForward size={20} color="rgb(var(--color-secondary-600))" />}
                      title="Cards Skipped"
                      value={stats.skippedCards}
                      color="secondary"
                    />
                  )}

                  {stats.favoriteCards.length > 0 && (
                    <StatCard
                      icon={<Heart size={20} color="rgb(var(--color-error-600))" />}
                      title="Favorite Cards"
                      value={stats.favoriteCards.length}
                      color="error"
                    />
                  )}
                </VStack>
              </VStack>
            )}

            {stats.difficultCards.length > 0 && (
              <VStack className="space-y-4">
                <Text className="text-lg font-semibold text-typography-900">
                  Cards to Review ({stats.difficultCards.length})
                </Text>
                <Text className="text-sm text-typography-600">
                  These cards were marked as difficult and may need more practice.
                </Text>

                <VStack className="space-y-2">
                  {stats.difficultCards.slice(0, 5).map((card, index) => (
                    <Box
                      key={card.id}
                      className="bg-background-0 rounded-lg border border-outline-200 p-4"
                    >
                      <HStack className="justify-between items-center">
                        <Text className="flex-1 text-typography-900" numberOfLines={2}>
                          {card.front}
                        </Text>
                        <Box className={`ml-3 px-2 py-1 rounded-full ${card.difficulty === 5 ? 'bg-error-100' : 'bg-warning-100'
                          }`}>
                          <Text className={`text-xs font-medium ${card.difficulty === 5 ? 'text-error-700' : 'text-warning-700'
                            }`}>
                            {card.difficulty === 5 ? 'Very Hard' : 'Hard'}
                          </Text>
                        </Box>
                      </HStack>
                    </Box>
                  ))}

                  {stats.difficultCards.length > 5 && (
                    <Text className="text-sm text-typography-500 text-center">
                      And {stats.difficultCards.length - 5} more difficult cards...
                    </Text>
                  )}
                </VStack>
              </VStack>
            )}

            {stats.favoriteCards.length > 0 && (
              <VStack className="space-y-4">
                <Text className="text-lg font-semibold text-typography-900">
                  Favorite Cards ({stats.favoriteCards.length})
                </Text>

                <VStack className="space-y-2">
                  {stats.favoriteCards.slice(0, 3).map((card, index) => (
                    <Box
                      key={card.id}
                      className="bg-background-0 rounded-lg border border-outline-200 p-4"
                    >
                      <HStack className="items-center space-x-3">
                        <Heart size={16} color="rgb(var(--color-error-500))" />
                        <Text className="flex-1 text-typography-900" numberOfLines={2}>
                          {card.front}
                        </Text>
                      </HStack>
                    </Box>
                  ))}

                  {stats.favoriteCards.length > 3 && (
                    <Text className="text-sm text-typography-500 text-center">
                      And {stats.favoriteCards.length - 3} more favorite cards...
                    </Text>
                  )}
                </VStack>
              </VStack>
            )}

            <VStack className="space-y-3 mt-8">
              <Button
                action="primary"
                size="lg"
                onPress={() => router.push(`/decks/${id}/review`)}
                className="w-full"
              >
                <RotateCcw size={20} color="rgb(var(--color-background-0))" />
                <ButtonText className="ml-2">Review Again</ButtonText>
              </Button>

              <Button
                variant="outline"
                size="lg"
                onPress={() => router.push(`/decks/${id}`)}
                className="w-full"
              >
                <ButtonText>Back to Deck</ButtonText>
              </Button>
            </VStack>
          </VStack>
        </ScrollView>
      </VStack>
    </SafeAreaView>
  )
}