import Link from "next/link";
import { ShoppingCart } from "lucide-react";

export const metadata = {
  title: "E-Kart | Account",
};

export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border/50 bg-background/60 backdrop-blur-sm px-6 py-4">
        <Link href="/" className="flex items-center gap-2 w-fit group">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center transition-transform group-hover:scale-110">
            <ShoppingCart className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold tracking-tight">E-Kart</span>
        </Link>
      </header>

      {/* Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">{children}</div>
      </main>

      {/* Footer */}
      <footer className="text-center text-xs text-muted-foreground py-6 border-t border-border/50">
        © {new Date().getFullYear()} E-Kart. All rights reserved.
      </footer>
    </div>
  );
}
