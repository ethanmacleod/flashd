import { zodResolver } from '@hookform/resolvers/zod'
import { AlertCircleIcon } from 'lucide-react-native'
import React from 'react'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'
import { Button, ButtonText } from './ui/button'
import {
    FormControl,
    FormControlError,
    FormControlErrorIcon,
    FormControlErrorText,
    FormControlHelper,
    FormControlHelperText,
    FormControlLabel,
    FormControlLabelText,
} from './ui/form-control'
import { Input, InputField } from './ui/input'
import { VStack } from './ui/vstack'

import { Platform } from 'react-native'
import { MarkdownEditor } from './markdown/MarkdownEditor'

interface FormInputProps {
    name: string
    label: string
    placeholder?: string
    helperText?: string
    type?: 'text' | 'password' | 'email'
    autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters'
    keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad'
    multiline?: boolean
    numberOfLines?: number
    control?: any
    errors?: any
}

export function FormInput({
    name,
    label,
    placeholder,
    helperText,
    type = 'text',
    autoCapitalize = 'sentences',
    keyboardType = 'default',
    multiline = false,
    numberOfLines = 1,
    control,
    errors,
}: FormInputProps) {
    return (
        <Controller
            name={name}
            control={control}
            render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
                <FormControl isInvalid={!!error} size="md">
                    <FormControlLabel>
                        <FormControlLabelText>{label}</FormControlLabelText>
                    </FormControlLabel>

                    <Input>
                        <InputField
                            type={type}
                            placeholder={placeholder || label}
                            value={value || ''}
                            onChangeText={onChange}
                            onBlur={onBlur}
                            autoCapitalize={autoCapitalize}
                            keyboardType={keyboardType}
                            multiline={multiline}
                            numberOfLines={numberOfLines}
                        />
                    </Input>

                    {helperText && !error && (
                        <FormControlHelper>
                            <FormControlHelperText>{helperText}</FormControlHelperText>
                        </FormControlHelper>
                    )}

                    {error && (
                        <FormControlError>
                            <FormControlErrorIcon as={AlertCircleIcon} />
                            <FormControlErrorText>{error.message}</FormControlErrorText>
                        </FormControlError>
                    )}
                </FormControl>
            )}
        />
    )
}

interface FormMarkdownInputProps {
    name: string
    label: string
    placeholder?: string
    helperText?: string
    control?: any
    errors?: any
}

export function FormMarkdownInput({
    name,
    label,
    placeholder,
    helperText,
    control,
    errors,
}: FormMarkdownInputProps) {
    return (
        <Controller
            name={name}
            control={control}
            render={({ field: { onChange, value }, fieldState: { error } }) => (
                <FormControl isInvalid={!!error} size="md">
                    <FormControlLabel>
                        <FormControlLabelText>{label}</FormControlLabelText>
                    </FormControlLabel>

                    <MarkdownEditor
                        value={value || ''}
                        onChangeText={onChange}
                        placeholder={placeholder || `Enter ${label.toLowerCase()} with markdown formatting...`}
                    />

                    {helperText && !error && (
                        <FormControlHelper>
                            <FormControlHelperText>{helperText}</FormControlHelperText>
                        </FormControlHelper>
                    )}

                    {error && (
                        <FormControlError>
                            <FormControlErrorIcon as={AlertCircleIcon} />
                            <FormControlErrorText>{error.message}</FormControlErrorText>
                        </FormControlError>
                    )}
                </FormControl>
            )}
        />
    )
}

interface FormProps<T extends z.ZodType> {
    schema: T
    onSubmit: (data: z.infer<T>) => void | Promise<void>
    children: React.ReactNode
    submitText?: string
    isLoading?: boolean
    defaultValues?: Partial<z.infer<T>>
}

export function Form<T extends z.ZodType>({
    schema,
    onSubmit,
    children,
    submitText = 'Submit',
    isLoading = false,
    defaultValues,
}: FormProps<T>) {
    const {
        control,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<z.infer<T>>({
        resolver: zodResolver(schema),
        mode: 'onBlur',
        defaultValues: defaultValues as any,
    })

    const handleFormSubmit = async (data: z.infer<T>) => {
        try {
            await onSubmit(data)
        } catch (error) {
            console.error('Form submission error:', error)
        }
    }

    const formContent = (
        <VStack space="lg">
            {React.Children.map(children, (child) => {
                if (React.isValidElement(child) && (child.type === FormInput || child.type === FormMarkdownInput)) {
                    return React.cloneElement(child, { control, errors } as any)
                }
                return child
            })}

            <Button
                onPress={handleSubmit(handleFormSubmit)}
                isDisabled={isLoading || isSubmitting}
            >
                <ButtonText>
                    {isLoading || isSubmitting ? 'Loading...' : submitText}
                </ButtonText>
            </Button>
        </VStack>
    )

    if (Platform.OS === 'web') {
        return (
            <form
                onSubmit={(e) => {
                    e.preventDefault()
                    handleSubmit(handleFormSubmit)()
                }}
                style={{ width: '100%' }}
            >
                {formContent}
            </form>
        )
    }

    return formContent
}