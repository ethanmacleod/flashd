import { Button, ButtonText } from '@/components/ui/button'
import { AlertCircle, WifiOff } from 'lucide-react-native'
import React from 'react'
import { Text, View } from 'react-native'

interface QueryErrorFallbackProps {
  error: Error
  onRetry: () => void
  isLoading?: boolean
}

export function QueryErrorFallback({ error, onRetry, isLoading }: QueryErrorFallbackProps) {
  const isNetworkError = error.message.toLowerCase().includes('network') || error.message.toLowerCase().includes('fetch')
  const isAuthError = error.message.includes('UNAUTHORIZED')

  if (isAuthError) {
    return (
      <View className="flex-1 justify-center items-center p-4">
        <AlertCircle size={48} color="rgb(var(--color-error-500))" />
        <Text className="text-lg font-semibold text-error-600 mb-2 mt-4">
          Authentication Required
        </Text>
        <Text className="text-typography-600 text-center mb-4">
          Please sign in to continue
        </Text>
        <Button onPress={() => {/* Navigate to sign in */ }}>
          <ButtonText>Sign In</ButtonText>
        </Button>
      </View>
    )
  }

  if (isNetworkError) {
    return (
      <View className="flex-1 justify-center items-center p-4">
        <WifiOff size={48} color="rgb(var(--color-error-500))" />
        <Text className="text-lg font-semibold text-error-600 mb-2 mt-4">
          Connection Error
        </Text>
        <Text className="text-typography-600 text-center mb-4">
          Check your internet connection and try again
        </Text>
        <Button onPress={onRetry} disabled={isLoading}>
          <ButtonText>{isLoading ? 'Retrying...' : 'Try Again'}</ButtonText>
        </Button>
      </View>
    )
  }

  return (
    <View className="flex-1 justify-center items-center p-4">
      <AlertCircle size={48} color="rgb(var(--color-error-500))" />
      <Text className="text-lg font-semibold text-error-600 mb-2 mt-4">
        Something went wrong
      </Text>
      <Text className="text-typography-600 text-center mb-4">
        {error.message}
      </Text>
      <Button onPress={onRetry} disabled={isLoading}>
        <ButtonText>{isLoading ? 'Retrying...' : 'Try Again'}</ButtonText>
      </Button>
    </View>
  )
}