import { cva, type VariantProps } from "class-variance-authority";

export const inputGroupAddonVariants = cva(
  "flex h-auto cursor-text items-center justify-center gap-1 py-2 text-xs/relaxed font-medium text-muted-foreground select-none group-data-[disabled=true]/input-group:opacity-50 **:data-[slot=kbd]:rounded-[calc(var(--radius-sm)-2px)] **:data-[slot=kbd]:bg-muted-foreground/10 **:data-[slot=kbd]:px-1 **:data-[slot=kbd]:text-[0.625rem] [&>svg:not([class*='size-'])]:size-3.5",
  {
    variants: {
      align: {
        "inline-start":
          "order-first pl-2 has-[>button]:ml-[-0.275rem] has-[>kbd]:ml-[-0.275rem]",
        "inline-end":
          "order-last pr-2 has-[>button]:mr-[-0.275rem] has-[>kbd]:mr-[-0.275rem]",
        "block-start":
          "order-first w-full justify-start px-2 pt-2 group-has-[>input]/input-group:pt-2 [.border-b]:pb-2",
        "block-end":
          "order-last w-full justify-start px-2 pb-2 group-has-[>input]/input-group:pb-2 [.border-t]:pt-2"
      }
    },
    defaultVariants: {
      align: "inline-start"
    }
  }
);

export type InputGroupAddonVariantProps = VariantProps<
  typeof inputGroupAddonVariants
>;

export const inputGroupButtonVariants = cva(
  "flex items-center gap-2 rounded-md text-xs/relaxed shadow-none",
  {
    variants: {
      size: {
        xs: "h-5 gap-1 rounded-[calc(var(--radius-sm)-2px)] px-1 [&>svg:not([class*='size-'])]:size-3",
        sm: "gap-1",
        "icon-xs": "size-6 p-0 has-[>svg]:p-0",
        "icon-sm": "size-7 p-0 has-[>svg]:p-0"
      }
    },
    defaultVariants: {
      size: "xs"
    }
  }
);

export type InputGroupButtonVariantProps = VariantProps<
  typeof inputGroupButtonVariants
>;
