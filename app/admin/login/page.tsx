import type { Metadata } from "next";
import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Admin Login | Ladies Forest",
  robots: { index: false },
};

export default function AdminLoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-forest px-4">
      <div className="w-full max-w-sm">
        <div className="text-center text-forest-foreground">
          <p className="text-xs uppercase tracking-[0.35em] text-forest-foreground/60">
            Admin Panel
          </p>
          <h1 className="mt-2 font-heading text-4xl">Ladies Forest</h1>
        </div>
        <div className="mt-8 rounded-xl bg-card p-6 shadow-xl">
          <LoginForm />
        </div>
        <p className="mt-6 text-center text-xs text-forest-foreground/50">
          Authorized staff only
        </p>
      </div>
    </div>
  );
}
