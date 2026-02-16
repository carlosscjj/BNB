// Use em páginas protegidas por staff ou admin
export async function requireAdminOrStaff() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "STAFF")) {
    redirect("/dashboard");
  }
}
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

export async function requireRole(role: "ADMIN" | "STAFF") {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== role) {
    redirect("/dashboard");
  }
}

export async function requireAdmin() {
  return requireRole("ADMIN");
}

export async function requireStaff() {
  return requireRole("STAFF");
}
