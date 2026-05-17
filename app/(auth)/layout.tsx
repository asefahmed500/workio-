import { cn } from "@/lib/utils";
import { Geist, Geist_Mono } from "next/font/google";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });
const fontMono = Geist_Mono({ subsets: ["latin"], variable: "--font-mono" });

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "relative flex min-h-screen font-sans antialiased",
        geist.variable,
        fontMono.variable
      )}
    >
      {/* Left panel — branding */}
      <div className="relative hidden w-1/2 flex-col justify-between bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-12 text-white lg:flex">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-sky-500/20 via-transparent to-transparent" />
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }} />

        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="text-xl font-bold tracking-tight">Workio</span>
          </div>
        </div>

        <div className="relative z-10 max-w-md space-y-6">
          <h1 className="text-4xl font-bold leading-tight tracking-tight">
            Automate your workflow<br />
            <span className="text-sky-400">with AI agents</span>
          </h1>
          <p className="text-lg text-slate-400">
            Build, execute, and monitor automated workflows powered by AI. Connect external services, trigger actions, and let intelligent agents handle the rest.
          </p>
          <div className="flex gap-6 pt-4">
            {[
              { label: "AI-Powered", desc: "Smart agents" },
              { label: "Enterprise", desc: "Built to scale" },
              { label: "Secure", desc: "OAuth 2.0" },
            ].map((item) => (
              <div key={item.label} className="space-y-1">
                <div className="text-sm font-semibold text-white">{item.label}</div>
                <div className="text-xs text-slate-500">{item.desc}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 text-xs text-slate-600">
          &copy; {new Date().getFullYear()} Workio. All rights reserved.
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex w-full flex-1 items-center justify-center bg-background p-6 lg:w-1/2">
        <div className="w-full max-w-sm space-y-8">
          {children}
        </div>
      </div>
    </div>
  );
}
