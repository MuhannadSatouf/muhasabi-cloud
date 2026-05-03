type AuthPageShellProps = {
  children: React.ReactNode;
};

export function AuthPageShell({ children }: AuthPageShellProps) {
  return (
    <main className="min-h-screen bg-background lg:grid lg:min-h-screen lg:grid-cols-2">
      <div className="flex flex-col justify-center px-4 py-12 lg:px-12">
        <div className="mx-auto w-full max-w-sm">{children}</div>
      </div>

      <div className="relative hidden flex-col justify-between bg-primary p-10 text-primary-foreground lg:flex">
        <div
          className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-foreground/15 text-lg font-semibold"
          aria-hidden
        >
          م
        </div>
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">
            محاسبي كلاود
          </h2>
          <p className="mt-3 max-w-sm text-sm text-primary-foreground/90">
            Modern accounting for teams who value clarity, control, and calm.
          </p>
        </div>
      </div>
    </main>
  );
}
