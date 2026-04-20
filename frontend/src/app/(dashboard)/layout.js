import Navbar from "@/components/layout/Navbar";

export const metadata = {
  title: "E-Kart | Dashboard",
};

export default function DashboardLayout({ children }) {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="max-w-9xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
