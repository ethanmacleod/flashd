import { Box } from '@/components/ui/box'
import { Spinner } from '@/components/ui/spinner'
import { Text } from '@/components/ui/text'
import { VStack } from '@/components/ui/vstack'
import React from 'react'

export interface LoadingSpinnerProps {
  size?: 'small' | 'large'
  color?: string
  message?: string
  fullScreen?: boolean
  className?: string
}

export function LoadingSpinner({
  size = 'large',
  color = 'rgb(var(--color-primary-500))',
  message,
  fullScreen = true,
  className,
}: LoadingSpinnerProps) {
  const containerClass = fullScreen 
    ? "flex-1 justify-center items-center" 
    : "justify-center items-center"

  const content = (
    <VStack className="items-center space-y-4">
      <Spinner size={size} color={color} />
      {message && (
        <Text className="text-typography-500 text-center max-w-sm">
          {message}
        </Text>
      )}
    </VStack>
  )

  if (fullScreen) {
    return (
      <Box className={`${containerClass} ${className || ''}`}>
        {content}
      </Box>
    )
  }

  return (
    <Box className={`${containerClass} ${className || ''}`}>
      {content}
    </Box>
  )
}

// Convenience component for inline loading
export function InlineSpinner({ 
  size = 'small', 
  color = 'rgb(var(--color-primary-500))' 
}: Pick<LoadingSpinnerProps, 'size' | 'color'>) {
  return (
    <LoadingSpinner 
      size={size} 
      color={color} 
      fullScreen={false}
      className="py-4"
    />
  )
}