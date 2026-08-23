import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "../../components/ui/button";

export const Route = createFileRoute("/reference/")({
  component: ReferenceIndex
});

function ReferenceIndex() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-4">
      <h1 className="text-4xl font-bold">Reference Pages</h1>
      <p className="text-muted-foreground">
        These pages demonstrate consuming the reference API through TanStack
        Query.
      </p>
      <div className="flex gap-4">
        <Link to="/reference/todos">
          <Button data-testid="web-reference-todos">Todos</Button>
        </Link>
        <Link to="/">
          <Button data-testid="web-reference-home" variant="secondary">
            Back to Home
          </Button>
        </Link>
      </div>
    </div>
  );
}
