import { Box } from '@/components/ui/box'
import { Button, ButtonText } from '@/components/ui/button'
import { Text } from '@/components/ui/text'
import { VStack } from '@/components/ui/vstack'
import React from 'react'

export interface EmptyStateProps {
  title: string
  description?: string
  actionText?: string
  onAction?: () => void
  icon?: React.ReactNode
  className?: string
  isLoading?: boolean
}

export function EmptyState({
  title,
  description,
  actionText,
  onAction,
  icon,
  className,
  isLoading = false,
}: EmptyStateProps) {
  return (
    <Box className={`flex-1 justify-center items-center p-6 ${className || ''}`}>
      <VStack className="items-center space-y-4 max-w-sm">
        {icon && (
          <Box className="mb-2">
            {icon}
          </Box>
        )}
        
        <Text className="text-xl font-semibold text-typography-700 text-center">
          {title}
        </Text>
        
        {description && (
          <Text className="text-typography-500 text-center">
            {description}
          </Text>
        )}
        
        {actionText && onAction && (
          <Button
            onPress={onAction}
            size="lg"
            action="primary"
            className="mt-4"
            disabled={isLoading}
          >
            <ButtonText>
              {isLoading ? 'Loading...' : actionText}
            </ButtonText>
          </Button>
        )}
      </VStack>
    </Box>
  )
}