import React, { Component, ReactNode } from 'react'
import { View, Text } from 'react-native'
import { Button, ButtonText } from '@/components/ui/button'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <View className="flex-1 justify-center items-center p-4">
          <Text className="text-lg font-semibold text-error-600 mb-2">
            Something went wrong
          </Text>
          <Text className="text-typography-600 text-center mb-4">
            {this.state.error?.message || 'An unexpected error occurred'}
          </Text>
          <Button
            onPress={() => this.setState({ hasError: false, error: undefined })}
          >
            <ButtonText>Try Again</ButtonText>
          </Button>
        </View>
      )
    }

    return this.props.children
  }
}