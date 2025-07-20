
import { TriangleAlert } from 'lucide-react-native';
import React from 'react';
import { HStack } from './ui/hstack';
import { Icon } from './ui/icon';
import { Toast, ToastDescription, ToastTitle, useToast } from './ui/toast';
import { VStack } from './ui/vstack';

interface ToastConfig {
    title: string;
    description?: string;
    duration?: number;
}

export const useToastNotifications = () => {
    const toast = useToast();

    const showError = ({ title, description, duration = 5000 }: ToastConfig) => {
        toast.show({
            placement: "bottom right",
            render: ({ id }) => {
                return (
                    <Toast
                        nativeID={`toast-${id}`}
                        action="error"
                        variant="outline"
                        className='m-8 bg-background-error border border-error-400 py-2 px-4'
                    >
                        <HStack space="md" className="items-center" >
                            <VStack
                                className='justify-center items-center w-10 h-10'
                            >
                                <Icon
                                    as={TriangleAlert}
                                    className='text-error-700'
                                />
                            </VStack>
                            <VStack className="flex-1 justify-center">
                                <ToastTitle>
                                    {title}
                                </ToastTitle>
                                {description && (
                                    <ToastDescription className='text-sm'>
                                        {description}
                                    </ToastDescription>
                                )}
                            </VStack>
                        </HStack>
                    </Toast>
                );
            },
            duration,
        });
    }

    const showSuccess = ({ title, description, duration = 4000 }: ToastConfig) => {
        toast.show({
            placement: "bottom right",
            render: ({ id }) => {
                return (
                    <Toast
                        nativeID={`toast-${id}`}
                        action="success"
                        variant="outline"
                    >
                        <ToastTitle >
                            {title}
                        </ToastTitle>
                        {description && (
                            <ToastDescription>
                                {description}
                            </ToastDescription>
                        )}
                    </Toast>
                );
            },
            duration,
        });
    };

    const showInfo = ({ title, description, duration = 4000 }: ToastConfig) => {
        toast.show({
            placement: "bottom right",
            render: ({ id }) => {
                return (
                    <Toast
                        nativeID={`toast-${id}`}
                        action="info"
                        variant="outline"

                    >
                        <ToastTitle >
                            {title}
                        </ToastTitle>
                        {description && (
                            <ToastDescription>
                                {description}
                            </ToastDescription>
                        )}
                    </Toast>
                );
            },
            duration,
        });
    };

    const showWarning = ({ title, description, duration = 4000 }: ToastConfig) => {
        toast.show({
            placement: "bottom right",
            render: ({ id }) => {
                return (
                    <Toast
                        nativeID={`toast-${id}`}
                        action="warning"
                        variant="outline"
                    >
                        <ToastTitle >
                            {title}
                        </ToastTitle>
                        {description && (
                            <ToastDescription>
                                {description}
                            </ToastDescription>
                        )}
                    </Toast>
                );
            },
            duration,
        });
    };

    return {
        showError,
        showSuccess,
        showInfo,
        showWarning,
    };
};