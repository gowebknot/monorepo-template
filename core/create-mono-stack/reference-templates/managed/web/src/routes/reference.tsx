import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/reference")({
  component: () => (
    <div className="flex min-h-svh flex-col">
      <main className="flex-1 p-4">
        <Outlet />
      </main>
    </div>
  )
});
