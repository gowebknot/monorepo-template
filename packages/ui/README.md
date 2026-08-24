# @monorepo-template/ui

Shared shadcn-based web components and Tailwind theme styling.

## Usage

Import components from the single package entrypoint:

```tsx
import { Button, Card } from "@monorepo-template/ui";

export function Example() {
  return (
    <Card>
      <Button>Continue</Button>
    </Card>
  );
}
```

`cn` and `buttonVariants` are server-safe exports. Interactive components carry their own
`"use client"` boundaries, so Server Components may call the styling utilities without becoming
Client Components.

Import the shared stylesheet from each web application's global CSS file:

```css
@import "tailwindcss";
@import "tw-animate-css";
@import "shadcn/tailwind.css";
@import "@monorepo-template/ui/styles.css";

@source "../../../packages/ui/src";
```

The consumer owns the Tailwind Vite or PostCSS plugin and should keep app-specific fonts and global
overrides in its own stylesheet. The `@source` directive makes Tailwind v4 scan utility classes
used by the package.

## Development

```sh
pnpm --filter @monorepo-template/ui build
pnpm --filter @monorepo-template/ui typecheck
pnpm --filter @monorepo-template/ui lint
```
