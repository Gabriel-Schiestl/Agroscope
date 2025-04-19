import ProtectedRoute from "../../components/ProtectedRoute";

export default function EngineerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ProtectedRoute requireEngineer={true}>{children}</ProtectedRoute>;
}
