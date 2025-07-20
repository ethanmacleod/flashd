import { Box } from '@/components/ui/box'
import { HStack } from '@/components/ui/hstack'
import { Icon } from '@/components/ui/icon'
import { Pressable } from '@/components/ui/pressable'
import { Text } from '@/components/ui/text'
import { VStack } from '@/components/ui/vstack'
import { tabs } from '@/constants/tabs'
import { usePathname, useRouter } from 'expo-router'
import React from 'react'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

export function MobileBottomTabs() {
  const router = useRouter()
  const pathname = usePathname()
  const insets = useSafeAreaInsets()

  const getIsActive = (tabName: string) => {
    if (tabName === 'index') {
      return pathname === '/' || pathname === '/(tabs)' || pathname === '/(tabs)/'
    }
    return pathname.includes(tabName)
  }

  const handleTabPress = (route: string) => {
    router.push(route as any)
  }

  return (
    <Box className="border-t border-outline-200 bg-background-0" style={{ paddingBottom: insets.bottom }}>
      <HStack className="justify-around py-2">
        {tabs.map((tab) => {
          const isActive = getIsActive(tab.name)

          return (
            <Pressable key={tab.name} onPress={() => handleTabPress(tab.route)} className="flex-1">
              <VStack className="items-center py-2">
                <Icon
                  as={tab.icon}
                  size="md"
                  className={isActive ? 'text-primary-600' : 'text-typography-400'}
                />
                <Text
                  className={`text-xs mt-1 ${
                    isActive ? 'text-primary-600 font-semibold' : 'text-typography-400'
                  }`}
                >
                  {tab.label}
                </Text>
              </VStack>
            </Pressable>
          )
        })}
      </HStack>
    </Box>
  )
}
