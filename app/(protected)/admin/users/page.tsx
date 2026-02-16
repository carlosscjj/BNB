"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function UsersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState("");

  useEffect(() => {
    if (status === "loading") return;
    if (!session || (session?.user as any)?.role !== "ADMIN") {
      router.replace("/calendar");
      return;
    }
    fetch("/api/users")
      .then(res => res.ok ? res.json() : Promise.reject("Erro ao carregar utilizadores"))
      .then(data => setUsers(data))
      .catch(() => setError("Erro ao carregar utilizadores"))
      .finally(() => setLoading(false));
  }, [session, status, router]);

  async function handleDelete(id: string) {
    if (!confirm("Tem a certeza que deseja apagar este utilizador?")) return;
    setDeleteLoading(id);
    setDeleteError("");
    try {
      const res = await fetch(`/api/users/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Erro ao apagar utilizador");
      setUsers(users => users.filter(u => u.id !== id));
    } catch (err) {
      setDeleteError("Erro ao apagar utilizador");
    } finally {
      setDeleteLoading(null);
    }
  }

  if (status === "loading" || loading) return <div>A carregar utilizadores...</div>;
  if (error) return <div className="text-red-600">{error}</div>;

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Gestão de Utilizadores</h1>
        <Link href="/admin/users/new" className="bg-orange-500 text-white px-4 py-2 rounded font-bold hover:bg-orange-600">Novo Utilizador</Link>
      </div>
      <table className="w-full border-collapse bg-white dark:bg-white text-black">
        <thead className="bg-white dark:bg-white text-black">
          <tr>
            <th className="border p-2">Nome</th>
            <th className="border p-2">Email</th>
            <th className="border p-2">Role</th>
            <th className="border p-2">Ações</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.id}>
              <td className="border p-2 text-black">{user.name}</td>
              <td className="border p-2 text-black">{user.email}</td>
              <td className="border p-2 text-black">{user.role}</td>
              <td className="border p-2 flex gap-2 text-black">
                <Link href={`/admin/users/${user.id}/edit`} className="text-blue-600 underline hover:text-blue-800">Editar</Link>
                <button
                  onClick={() => handleDelete(user.id)}
                  className="text-red-600 underline hover:text-red-800"
                  disabled={deleteLoading === user.id}
                >
                  {deleteLoading === user.id ? "A apagar..." : "Apagar"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {deleteError && <div className="text-red-600 mt-2">{deleteError}</div>}
    </div>
  );
}
