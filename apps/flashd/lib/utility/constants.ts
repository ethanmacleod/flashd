export const FIVE_MINUTES = 300_000

export interface CardColor {
  id: string
  name: string
  background: string
  border: string
  text: string
  hex: string
}

export const CARD_COLORS: CardColor[] = [
  {
    id: 'default',
    name: 'Default',
    background: 'bg-background-0',
    border: 'border-outline-200',
    text: 'text-typography-900',
    hex: '#ffffff',
  },
  {
    id: 'blue',
    name: 'Blue',
    background: 'bg-blue-50',
    border: 'border-blue-200',
    text: 'text-blue-900',
    hex: '#3b82f6',
  },
  {
    id: 'green',
    name: 'Green',
    background: 'bg-green-50',
    border: 'border-green-200',
    text: 'text-green-900',
    hex: '#10b981',
  },
  {
    id: 'yellow',
    name: 'Yellow',
    background: 'bg-yellow-50',
    border: 'border-yellow-200',
    text: 'text-yellow-900',
    hex: '#f59e0b',
  },
  {
    id: 'red',
    name: 'Red',
    background: 'bg-red-50',
    border: 'border-red-200',
    text: 'text-red-900',
    hex: '#ef4444',
  },
  {
    id: 'purple',
    name: 'Purple',
    background: 'bg-purple-50',
    border: 'border-purple-200',
    text: 'text-purple-900',
    hex: '#8b5cf6',
  },
  {
    id: 'pink',
    name: 'Pink',
    background: 'bg-pink-50',
    border: 'border-pink-200',
    text: 'text-pink-900',
    hex: '#ec4899',
  },
  {
    id: 'indigo',
    name: 'Indigo',
    background: 'bg-indigo-50',
    border: 'border-indigo-200',
    text: 'text-indigo-900',
    hex: '#6366f1',
  },
]

export const TEXT_COLORS = [
  { id: 'blue', name: 'Blue', value: '#1e40af' }, // darker blue
  { id: 'green', name: 'Green', value: '#047857' }, // darker green
  { id: 'yellow', name: 'Yellow', value: '#b45309' }, // darker yellow/amber
  { id: 'red', name: 'Red', value: '#dc2626' }, // darker red
  { id: 'purple', name: 'Purple', value: '#7c3aed' }, // darker purple
  { id: 'pink', name: 'Pink', value: '#be185d' }, // darker pink
  { id: 'indigo', name: 'Indigo', value: '#4338ca' }, // darker indigo
  { id: 'orange', name: 'Orange', value: '#ea580c' }, // darker orange
]

export const EXTENDED_TEXT_COLORS = [
  '#000000',
  '#1f2937',
  '#374151',
  '#6b7280',
  '#9ca3af',
  '#d1d5db',
  '#f3f4f6',
  '#ffffff',
  '#7f1d1d',
  '#dc2626',
  '#f87171',
  '#fca5a5',
  '#fed7d7',
  '#fef2f2',
  '#7c2d12',
  '#ea580c',
  '#fb923c',
  '#fdba74',
  '#fed7aa',
  '#fef3f2',
  '#713f12',
  '#d97706',
  '#f59e0b',
  '#fbbf24',
  '#fde68a',
  '#fefbf2',
  '#365314',
  '#16a34a',
  '#22c55e',
  '#4ade80',
  '#86efac',
  '#f0fdf4',
  '#1e3a8a',
  '#2563eb',
  '#3b82f6',
  '#60a5fa',
  '#93c5fd',
  '#eff6ff',
  '#581c87',
  '#7c3aed',
  '#8b5cf6',
  '#a78bfa',
  '#c4b5fd',
  '#f3f4f6',
  '#be185d',
  '#e11d48',
  '#f43f5e',
  '#fb7185',
  '#fda4af',
  '#fdf2f8',
]

export const DECK_COLORS = [
  'rgb(var(--color-primary-500))',
  'rgb(var(--color-secondary-500))',
  'rgb(var(--color-tertiary-500))',
  'rgb(var(--color-info-500))',
  'rgb(var(--color-success-500))',
  'rgb(var(--color-warning-500))',
  'rgb(var(--color-primary-300))',
  'rgb(var(--color-secondary-300))',
]
