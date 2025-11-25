/* eslint-disable @typescript-eslint/no-explicit-any */

import { cn } from "@/lib/utils";
import type { VariantProps } from "class-variance-authority";
import { cva } from "class-variance-authority";
import type { ComponentPropsWithRef, ElementType, ForwardedRef } from "react";

import React, { forwardRef } from "react";

// Source : https://www.totaltypescript.com/pass-component-as-prop-react
type FixedForwardRef = <T, P = object>(
  render: (props: P, ref: React.Ref<T>) => React.ReactNode,
) => (props: P & React.RefAttributes<T>) => React.ReactNode;

const fixedForwardRef = forwardRef as FixedForwardRef;

type DistributiveOmit<T, TOmitted extends PropertyKey> = T extends any
  ? Omit<T, TOmitted>
  : never;

export const typographyVariants = cva("", {
  variants: {
    variant: {
      default: "",
      h1: "font-caption scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl",
      h2: "font-caption scroll-m-20 text-3xl font-semibold tracking-tight",
      h3: "font-caption scroll-m-20 text-xl font-semibold tracking-tight",
      h4: "font-caption scroll-m-20 text-lg font-semibold tracking-tight",
      quote: "mt-6 border-l-2 pl-6 italic",
      code: "relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold",
      link: "hover:underline",
    },
    textSize: {
      xl: "text-xl font-semibold",
      lg: "text-lg font-semibold",
      sm: "text-sm font-medium leading-none",
      xs: "text-xs font-medium leading-none",
    },
    textColor: {
      muted: "text-muted-foreground",
    },
    functionnal: {
      truncate: "w-full text-start truncate",
      wrap: "w-full text-start text-wrap",
    },
  },
  defaultVariants: {
    variant: "default",
    textSize: null,
    textColor: null,
    functionnal: null,
  },
});
type TypographyCvaProps = VariantProps<typeof typographyVariants>;

const defaultElementMapping = {
  default: "p",
  h1: "h1",
  h2: "h2",
  h3: "h3",
  h4: "h4",
  quote: "p",
  code: "code",
  link: "a",
} satisfies Record<NonNullable<TypographyCvaProps["variant"]>, ElementType>;

type ElementMapping = typeof defaultElementMapping;

type ElementTypeForVariant<TVariant extends keyof ElementMapping> =
  ElementMapping[TVariant];

/**
 * The Typography component is useful to add Text to your page
 *
 * Usage :
 *
 * ```tsx
 * <Typography variant="h1">Hello World</Typography>
 * <Typography variant="h2" as="a" href="#">Hello World</Typography>
 * <Typography variant="large" as={Link} href="#">Hello World</Typography>
 * ```
 *
 * You can use the `as` prop to define the element type of the component
 * `as` can be a string or a component
 *
 * @param params The parameters of the component
 * @param ref The ref of the element. Untyped because it's a generic
 * @returns
 */
const InnerTypography = <
  TAs extends ElementType,
  TVariant extends TypographyCvaProps["variant"] = "default",
>(
  {
    variant = "default",
    textSize = null,
    textColor = null,
    functionnal = null,
    className,
    as,
    ...props
  }: {
    as?: TAs;
    variant?: TVariant;
    textSize?: TypographyCvaProps["textSize"];
    textColor?: TypographyCvaProps["textColor"];
    functionnal?: TypographyCvaProps["functionnal"];
  } & DistributiveOmit<
    ComponentPropsWithRef<
      ElementType extends TAs
        ? ElementTypeForVariant<NonNullable<TVariant>>
        : TAs
    >,
    "as"
  >,
  ref: ForwardedRef<any>,
) => {
  const Comp = as ?? defaultElementMapping[variant ?? "default"];
  return (
    <Comp
      {...props}
      className={cn(
        typographyVariants({ variant, textSize, textColor, functionnal }),
        className,
      )}
      ref={ref}
    ></Comp>
  );
};

export const Typography = fixedForwardRef(InnerTypography);
