import { Box } from '@/components/ui/box'
import { HStack } from '@/components/ui/hstack'
import { Icon } from '@/components/ui/icon'
import { Pressable } from '@/components/ui/pressable'
import { Text } from '@/components/ui/text'
import { VStack } from '@/components/ui/vstack'
import { tabs } from '@/constants/tabs'
import { usePathname, useRouter } from 'expo-router'
import React from 'react'

export function DesktopSidebar() {
  const router = useRouter()
  const pathname = usePathname()

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
    <Box className="w-64 bg-background-50 border-r border-outline-200">
      <VStack className="p-4 space-y-2">
        <Text className="text-xl font-bold mb-6 px-3">My App</Text>

        {tabs.map((tab) => {
          const isActive = getIsActive(tab.name)

          return (
            <Pressable
              key={tab.name}
              onPress={() => handleTabPress(tab.route)}
              className={`rounded-lg p-3 ${isActive ? 'bg-primary-100' : 'hover:bg-background-100'}`}
            >
              <HStack className="items-center space-x-3">
                <Icon
                  as={tab.icon}
                  size="md"
                  className={isActive ? 'text-primary-600' : 'text-typography-600'}
                />
                <Text className={`${isActive ? 'text-primary-600 font-semibold' : 'text-typography-600'}`}>
                  {tab.label}
                </Text>
              </HStack>
            </Pressable>
          )
        })}
      </VStack>
    </Box>
  )
}
