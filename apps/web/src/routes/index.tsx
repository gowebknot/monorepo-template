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
          <Button>Reference</Button>
        </Link>
        <Link to="/form-demo">
          <Button>Form Demo</Button>
        </Link>
        <Link to="/table-demo">
          <Button variant="secondary">Table Demo</Button>
        </Link>
      </div>
    </div>
  );
}
