export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md rounded-lg border border-border bg-card p-8 shadow-sm">
        <div className="mb-8 text-center">
          <h1 className="font-heading text-2xl font-semibold tracking-tight">
            Ca&apos; Del Friul
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Premium Italian Resort
          </p>
        </div>
        {children}
      </div>
    </div>
  );
}
