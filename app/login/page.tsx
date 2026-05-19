import { Logo } from "@/components/brand/logo";
import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-[#1d4ed8] via-[#2563eb] to-[#1e40af]">
      <div className="flex flex-1 flex-col items-center justify-center px-4 py-12">
        <div className="mb-8 flex flex-col items-center gap-4 text-center">
          <div className="rounded-2xl bg-white/10 p-4 backdrop-blur">
            <Logo size="lg" />
          </div>
          <p className="text-sm text-blue-100">Organization CRM — Mock-up Phase</p>
        </div>

        <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl sm:p-8">
          <h1 className="text-xl font-bold text-slate-900">Welcome back</h1>
          <p className="mt-1 text-sm text-slate-500">
            Sign in to manage leads, pipeline, and chats
          </p>
          <LoginForm />
        </div>
      </div>

      <p className="pb-6 text-center text-xs text-blue-200">
        © 2026 ecobz-crm · Mock data only
      </p>
    </div>
  );
}
