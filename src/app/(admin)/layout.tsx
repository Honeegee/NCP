import { Navbar } from "@/components/shared/Navbar";
import { Footer } from "@/components/shared/Footer";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-muted/30 flex flex-col">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 py-8 w-full flex-1 pb-20 md:pb-0">{children}</main>
      <Footer />
    </div>
  );
}
