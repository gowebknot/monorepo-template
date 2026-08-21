export default function ReferenceLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-svh flex-col">
      <main className="flex-1 p-4">{children}</main>
    </div>
  );
}
