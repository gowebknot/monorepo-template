import Link from "next/link";

import { buttonVariants, cn } from "@repo/ui";

export default function ReferenceIndexPage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-4">
      <h1 className="text-4xl font-bold">Reference Pages</h1>
      <p className="text-muted-foreground">
        These pages demonstrate consuming the reference API through TanStack
        Query.
      </p>
      <div className="flex gap-4">
        <Link href="/reference/todos" className={cn(buttonVariants())}>
          Todos
        </Link>
        <Link href="/" className={cn(buttonVariants({ variant: "secondary" }))}>
          Back to Home
        </Link>
      </div>
    </div>
  );
}
