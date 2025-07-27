import { trpc } from '@/lib/trpc'
import { EXTENDED_TEXT_COLORS, TEXT_COLORS } from '@/lib/utility/constants'
import { Heart, Trash2, X } from 'lucide-react-native'
import React, { useState } from 'react'
import { Modal, View } from 'react-native'
import { Box } from '../ui/box'
import { Button, ButtonText } from '../ui/button'
import { HStack } from '../ui/hstack'
import { Input, InputField } from '../ui/input'
import { Pressable } from '../ui/pressable'
import { ScrollView } from '../ui/scroll-view'
import { Text } from '../ui/text'
import { VStack } from '../ui/vstack'

interface SimpleColorModalProps {
  visible: boolean
  onClose: () => void
  onColorSelect: (color: string) => void
}

export function SimpleColorModal({ visible, onClose, onColorSelect }: SimpleColorModalProps) {
  const [selectedColor, setSelectedColor] = useState('#ff0000')
  const [hexInput, setHexInput] = useState('#ff0000')
  const [customColorName, setCustomColorName] = useState('')

  const { data: customColors = [], refetch: refetchCustomColors } = trpc.user.getCustomColors.useQuery()
  const saveColorMutation = trpc.user.saveCustomColor.useMutation({
    onSuccess: () => refetchCustomColors()
  })
  const deleteColorMutation = trpc.user.deleteCustomColor.useMutation({
    onSuccess: () => refetchCustomColors()
  })

  const isValidHex = (color: string): boolean => {
    return /^#[0-9A-F]{6}$/i.test(color)
  }

  const handleColorClick = (color: string) => {
    setSelectedColor(color)
    setHexInput(color)
  }

  const handleHexChange = (value: string) => {
    setHexInput(value)
    if (isValidHex(value)) {
      setSelectedColor(value)
    }
  }

  const handleSaveCustomColor = () => {
    if (isValidHex(selectedColor)) {
      saveColorMutation.mutate({
        name: customColorName || `Custom ${Date.now()}`,
        value: selectedColor
      })
      setCustomColorName('')
    }
  }

  const handleDeleteCustomColor = (colorId: string) => {
    deleteColorMutation.mutate({ colorId })
  }

  const handleConfirm = () => {
    onColorSelect(selectedColor)
    onClose()
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/50 justify-end">
        <Box className="bg-background-0 rounded-t-xl max-h-[90%]">
          <ScrollView>
            <VStack className="p-6 space-y-6">
              <HStack className="justify-between items-center">
                <Text className="text-xl font-semibold text-typography-900">
                  Color Picker
                </Text>
                <Pressable onPress={onClose}>
                  <X size={24} color="rgb(107, 114, 128)" />
                </Pressable>
              </HStack>

              <Box
                className="h-16 rounded-lg border border-outline-200"
                style={{ backgroundColor: selectedColor }}
              />

              <VStack className="space-y-2">
                <Text className="text-sm font-medium text-typography-700">Hex Color</Text>
                <Input>
                  <InputField
                    value={hexInput}
                    onChangeText={handleHexChange}
                    placeholder="#FF0000"
                    autoCapitalize="characters"
                  />
                </Input>
              </VStack>

              <VStack className="space-y-3">
                <Text className="text-sm font-medium text-typography-700">Card Colors</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <HStack className="space-x-3">
                    {TEXT_COLORS.map((color) => (
                      <Pressable
                        key={color.id}
                        onPress={() => handleColorClick(color.value)}
                        className="items-center"
                      >
                        <Box
                          className={`w-12 h-12 rounded-lg border-2 ${selectedColor === color.value ? 'border-primary-500' : 'border-outline-200'}`}
                          style={{ backgroundColor: color.value }}
                        />
                        <Text className="text-xs text-center mt-1 text-typography-600 w-16">
                          {color.name}
                        </Text>
                      </Pressable>
                    ))}
                  </HStack>
                </ScrollView>
              </VStack>

              <VStack className="space-y-3">
                <Text className="text-sm font-medium text-typography-700">Color Palette</Text>
                <View className="flex-row flex-wrap gap-2">
                  {EXTENDED_TEXT_COLORS.map((color, index) => (
                    <Pressable
                      key={index}
                      onPress={() => handleColorClick(color)}
                      className={`w-10 h-10 rounded border-2 ${selectedColor === color ? 'border-primary-500' : 'border-outline-200'}`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </View>
              </VStack>

              <VStack className="space-y-3">
                <HStack className="justify-between items-center">
                  <Text className="text-sm font-medium text-typography-700">Saved Colors</Text>
                  <VStack className="space-y-2">
                    <Input className="min-w-[120px]">
                      <InputField
                        value={customColorName}
                        onChangeText={setCustomColorName}
                        placeholder="Color name"
                      />
                    </Input>
                    <Button
                      size="sm"
                      onPress={handleSaveCustomColor}
                      disabled={!isValidHex(selectedColor)}
                    >
                      <Heart size={14} color="rgb(var(--color-background-0))" />
                      <ButtonText className="ml-1">Save</ButtonText>
                    </Button>
                  </VStack>
                </HStack>

                {customColors.length > 0 ? (
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <HStack className="space-x-3">
                      {customColors.map((color: any) => (
                        <VStack key={color.id} className="items-center">
                          <Pressable
                            onPress={() => handleColorClick(color.value)}
                            className="relative"
                          >
                            <Box
                              className={`w-12 h-12 rounded-lg border-2 ${selectedColor === color.value ? 'border-primary-500' : 'border-outline-200'}`}
                              style={{ backgroundColor: color.value }}
                            />
                            <Pressable
                              onPress={() => handleDeleteCustomColor(color.id)}
                              className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full items-center justify-center"
                            >
                              <Trash2 size={10} color="white" />
                            </Pressable>
                          </Pressable>
                          <Text className="text-xs text-center mt-1 text-typography-600 w-16">
                            {color.name}
                          </Text>
                        </VStack>
                      ))}
                    </HStack>
                  </ScrollView>
                ) : (
                  <Text className="text-sm text-typography-500 italic">
                    No saved colors yet. Enter a name and click Save to add this color.
                  </Text>
                )}
              </VStack>

              <HStack className="space-x-3 pt-4">
                <Button variant="outline" onPress={onClose} className="flex-1">
                  <ButtonText>Cancel</ButtonText>
                </Button>
                <Button action="primary" onPress={handleConfirm} className="flex-1">
                  <ButtonText>Use Color</ButtonText>
                </Button>
              </HStack>
            </VStack>
          </ScrollView>
        </Box>
      </View>
    </Modal>
  )
}