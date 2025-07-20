'use client';
import { createSwitch } from '@gluestack-ui/switch';
import { Pressable, View } from 'react-native';
import React from 'react';
import { tva } from '@gluestack-ui/nativewind-utils/tva';
import {
  withStyleContext,
  useStyleContext,
} from '@gluestack-ui/nativewind-utils/withStyleContext';
import type { VariantProps } from '@gluestack-ui/nativewind-utils';

const SCOPE = 'SWITCH';

export const UISwitch = createSwitch({
  Root: withStyleContext(Pressable, SCOPE),
  Thumb: View,
});

const switchStyle = tva({
  base: 'rounded-full justify-center data-[disabled=true]:opacity-50 data-[disabled=true]:cursor-not-allowed',
  variants: {
    size: {
      sm: 'h-6 w-10',
      md: 'h-7 w-12',
      lg: 'h-8 w-14',
    },
    variant: {
      outline: 'border-2 border-outline-300 data-[checked=true]:border-primary-500 data-[checked=true]:bg-primary-500 bg-background-100',
    },
  },
});

const switchThumbStyle = tva({
  base: 'rounded-full bg-background-0 absolute data-[checked=true]:translate-x-4 transition-transform duration-200 shadow-sm',
  parentVariants: {
    size: {
      sm: 'h-4 w-4 m-1 data-[checked=true]:translate-x-4',
      md: 'h-5 w-5 m-1 data-[checked=true]:translate-x-5',
      lg: 'h-6 w-6 m-1 data-[checked=true]:translate-x-6',
    },
  },
});

type ISwitchProps = React.ComponentProps<typeof UISwitch> &
  VariantProps<typeof switchStyle>;

const Switch = React.forwardRef<
  React.ComponentRef<typeof UISwitch>,
  ISwitchProps
>(function Switch(
  {
    className,
    size = 'md',
    variant = 'outline',
    ...props
  },
  ref
) {
  return (
    <UISwitch
      ref={ref}
      {...props}
      className={switchStyle({
        size,
        variant,
        class: className,
      })}
      context={{ size, variant }}
    />
  );
});

type ISwitchThumbProps = React.ComponentProps<typeof UISwitch.Thumb> &
  VariantProps<typeof switchThumbStyle>;

const SwitchThumb = React.forwardRef<
  React.ComponentRef<typeof UISwitch.Thumb>,
  ISwitchThumbProps
>(function SwitchThumb({ className, size, ...props }, ref) {
  const { size: parentSize } = useStyleContext(SCOPE);

  return (
    <UISwitch.Thumb
      ref={ref}
      {...props}
      className={switchThumbStyle({
        parentVariants: {
          size: parentSize,
        },
        size,
        class: className,
      })}
    />
  );
});

Switch.displayName = 'Switch';
SwitchThumb.displayName = 'SwitchThumb';

export { Switch, SwitchThumb };