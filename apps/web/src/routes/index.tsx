import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "../components/ui/button";

export const Route = createFileRoute("/")({
  component: Index
});

function Index() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-4">
      <h1 className="text-4xl font-bold">TanStack Demo</h1>
      <div className="flex gap-4">
        <Link to="/reference">
          <Button data-testid="web-home-reference">Reference</Button>
        </Link>
        <Link to="/form-demo">
          <Button data-testid="web-home-form-demo">Form Demo</Button>
        </Link>
        <Link to="/table-demo">
          <Button data-testid="web-home-table-demo" variant="secondary">
            Table Demo
          </Button>
        </Link>
      </div>
    </div>
  );
}
