import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/reference")({
  component: ReferenceRoute
});

function ReferenceRoute() {
  return (
    <main>
      <h1>TanStack Router reference</h1>
      <p>This file-based route uses the native app's generated route tree.</p>
      <Link to="/">Return home</Link>
    </main>
  );
}
