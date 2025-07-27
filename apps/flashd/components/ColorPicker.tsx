import { CARD_COLORS, type CardColor } from '@/lib/utility/constants'
import { Check, Plus } from 'lucide-react-native'
import React, { useState } from 'react'
import { Box } from './ui/box'
import { Button, ButtonText } from './ui/button'
import { HStack } from './ui/hstack'
import { Input, InputField } from './ui/input'
import { Pressable } from './ui/pressable'
import { ScrollView } from './ui/scroll-view'
import { Text } from './ui/text'
import { VStack } from './ui/vstack'

export { CARD_COLORS, type CardColor }

interface ColorPickerProps {
  selectedColor: string
  onColorChange: (colorId: string) => void
  label?: string
}

export function ColorPicker({ selectedColor, onColorChange, label = "Card Color" }: ColorPickerProps) {
  const [customColor, setCustomColor] = useState('')
  const [showCustomInput, setShowCustomInput] = useState(false)

  const isCustomColor = !CARD_COLORS.find(c => c.id === selectedColor)

  const handleCustomColorSubmit = () => {
    if (isValidColor(customColor)) {
      onColorChange(customColor)
      setCustomColor('')
      setShowCustomInput(false)
    }
  }

  const isValidColor = (color: string): boolean => {
    if (/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color)) return true
    if (/^rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)$/.test(color)) return true
    if (/^rgba\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*[\d.]+\s*\)$/.test(color)) return true
    if (/^hsl\(\s*\d+\s*,\s*\d+%\s*,\s*\d+%\s*\)$/.test(color)) return true
    if (/^hsla\(\s*\d+\s*,\s*\d+%\s*,\s*\d+%\s*,\s*[\d.]+\s*\)$/.test(color)) return true

    return false
  }

  return (
    <VStack className="space-y-3">
      <Text className="text-sm font-medium text-typography-700">{label}</Text>

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <HStack className="space-x-3 px-1">
          {CARD_COLORS.map((color) => (
            <Pressable
              key={color.id}
              onPress={() => onColorChange(color.id)}
              className="items-center"
            >
              <Box
                className={`
                  w-12 h-12 rounded-lg border-2 
                  ${color.background} 
                  ${selectedColor === color.id ? color.border : 'border-outline-200'}
                  ${selectedColor === color.id ? 'scale-110' : ''}
                  transition-all duration-200
                `}
              >
                {selectedColor === color.id && (
                  <Box className="absolute inset-0 flex items-center justify-center">
                    <Check size={16} color="currentColor" className={color.text} />
                  </Box>
                )}
              </Box>
              <Text className="text-xs text-center mt-1 text-typography-600 w-16">
                {color.name}
              </Text>
            </Pressable>
          ))}

          {isCustomColor && (
            <Pressable className="items-center">
              <Box
                className="w-12 h-12 rounded-lg border-2 border-primary-500 scale-110"
                style={{ backgroundColor: selectedColor }}
              >
                <Box className="absolute inset-0 flex items-center justify-center">
                  <Check size={16} color="white" />
                </Box>
              </Box>
              <Text className="text-xs text-center mt-1 text-typography-600 w-16">
                Custom
              </Text>
            </Pressable>
          )}

          <Pressable
            onPress={() => setShowCustomInput(!showCustomInput)}
            className="items-center"
          >
            <Box className="w-12 h-12 rounded-lg border-2 border-dashed border-outline-300 bg-background-50 items-center justify-center">
              <Plus size={20} color="rgb(107, 114, 128)" />
            </Box>
            <Text className="text-xs text-center mt-1 text-typography-600 w-16">
              Custom
            </Text>
          </Pressable>
        </HStack>
      </ScrollView>

      {showCustomInput && (
        <VStack className="space-y-3 p-3 bg-background-50 rounded-lg border border-outline-200">
          <Text className="text-sm font-medium text-typography-700">Add Custom Color</Text>

          <HStack className="space-x-2">
            <Input className="flex-1">
              <InputField
                placeholder="#FF5733 or rgb(255,87,51)"
                value={customColor}
                onChangeText={setCustomColor}
                autoCapitalize="none"
              />
            </Input>
            <Button
              size="sm"
              onPress={handleCustomColorSubmit}
              disabled={!isValidColor(customColor)}
            >
              <ButtonText>Add</ButtonText>
            </Button>
          </HStack>

          <Button
            variant="outline"
            size="sm"
            onPress={() => setShowCustomInput(false)}
          >
            <ButtonText>Cancel</ButtonText>
          </Button>
        </VStack>
      )}

    </VStack>
  )
}