import Link from "next/link";

import { buttonClassName } from "../components/ui/button";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col bg-background">
      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center px-6 py-16">
        <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary text-lg font-semibold text-primary-foreground">
          م
        </div>
        <h1 className="mt-8 text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
          Muhasabi Cloud
        </h1>
        <p className="mt-4 max-w-xl text-lg text-muted-foreground">
          Calm, modern accounting for teams that care about clarity. Sign in to
          your workspace or create a new company.
        </p>
        <div className="mt-10 flex flex-wrap gap-3">
          <Link href="/auth/login" className={buttonClassName("brand", "px-5")}>
            Sign in
          </Link>
          <Link
            href="/auth/register"
            className={buttonClassName("outline", "px-5")}
          >
            Register
          </Link>
        </div>
        <p className="mt-6 text-sm text-muted-foreground">
          Secure credentials sign-in. Arabic UI direction switches from the
          dashboard toolbar.
        </p>
      </div>
    </main>
  );
}
