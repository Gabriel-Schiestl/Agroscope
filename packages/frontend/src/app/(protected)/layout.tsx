import Header from "../../components/header";
import MobileNav from "../../components/mobile-nav";
import ProtectedRoute from "../../components/ProtectedRoute";
import Sidebar from "../../components/sidebar";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <div className="flex h-screen overflow-hidden">
        <div className="hidden md:block">{/* <Sidebar /> */}</div>
        <div className="flex flex-col flex-1 overflow-hidden">
          <Header />
          <main className="flex-1 overflow-auto p-4">{children}</main>
          <div className="md:hidden">
            <MobileNav />
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
