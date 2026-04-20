import { FileText, GalleryVerticalEnd } from "lucide-react";
import { AuthForm } from "@/components/auth/authcomponent";
import Link from "next/link";

export default function SignInPage() {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      {/* Left — Form */}
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <Link href="/" className="flex items-center gap-2 font-medium">
            <div className="flex size-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <FileText className="size-4" />
            </div>
            pslmp
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <AuthForm />
          </div>
        </div>
      </div>

      {/* Right — Decorative panel */}
      <div className="relative hidden bg-muted lg:block">
        <img
          src="/auth-bg.jpg"
          alt="pslmp"
          className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
        />
      </div>
    </div>
  );
}