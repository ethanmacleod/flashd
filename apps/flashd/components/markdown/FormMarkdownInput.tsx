import { AlertCircleIcon } from 'lucide-react-native'
import React from 'react'
import { Controller } from 'react-hook-form'
import {
    FormControl,
    FormControlError,
    FormControlErrorIcon,
    FormControlErrorText,
    FormControlHelper,
    FormControlHelperText,
    FormControlLabel,
    FormControlLabelText,
} from '../ui/form-control'
import { MarkdownEditor } from './MarkdownEditor'

interface FormMarkdownInputProps {
    name: string
    label: string
    placeholder?: string
    helperText?: string
    rows?: number
    control?: any
    errors?: any
}

export function FormMarkdownInput({
    name,
    label,
    placeholder,
    helperText,
    rows = 4,
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
                        rows={rows}
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