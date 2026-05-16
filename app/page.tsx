import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function Page() {
  return (
    <div className="flex min-h-svh items-center justify-center p-6">
      <div className="flex flex-col items-center gap-8 text-center">
        <div className="space-y-4">
          <h1 className="text-4xl font-bold">Workio</h1>
          <p className="text-muted-foreground">Workflow automation platform</p>
        </div>

        <Link href="/workflow">
          <Button
            size="lg"
            className="relative group overflow-hidden"
          >
            <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
            <span className="absolute inset-0 w-full h-full rounded-lg animate-pulse bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 blur-sm opacity-50" />
            <span className="relative">Open Workflow</span>
          </Button>
        </Link>

        <div className="text-sm text-muted-foreground">
          Made by <span className="font-semibold text-foreground">Asef Ahmed</span>
        </div>

        <div className="font-mono text-xs text-muted-foreground">
          Press <kbd className="px-1.5 py-0.5 rounded bg-muted">d</kbd> to toggle dark mode
        </div>
      </div>
    </div>
  )
}
