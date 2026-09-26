import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import AdminDashboard from "./dashboard";

export default async function AdminPage() {
  const cookieStore = await cookies();
  const session = cookieStore.get("church_admin")?.value;
  const expected = process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_PASSWORD;

  if (!expected || session !== expected) redirect("/admin/login");
  return <AdminDashboard />;
}
