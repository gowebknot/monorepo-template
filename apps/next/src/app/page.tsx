import Link from "next/link";

import { buttonVariants, cn } from "@monorepo-template/ui";

export default function HomePage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-4">
      <h1 className="text-4xl font-bold">TanStack Demo</h1>
      <div className="flex gap-4">
        <Link href="/reference" className={cn(buttonVariants())}>
          Reference
        </Link>
        <Link href="/form-demo" className={cn(buttonVariants())}>
          Form Demo
        </Link>
        <Link
          href="/table-demo"
          className={cn(buttonVariants({ variant: "secondary" }))}
        >
          Table Demo
        </Link>
      </div>
    </div>
  );
}
