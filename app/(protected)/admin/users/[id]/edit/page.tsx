"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function EditUserPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const userId = params?.id;
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ name: "", email: "", role: "STAFF" });
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    fetch(`/api/users/${userId}`)
      .then(res => res.ok ? res.json() : Promise.reject("Erro ao carregar utilizador"))
      .then(data => {
        setUser(data);
        setForm({ name: data.name || "", email: data.email || "", role: data.role || "STAFF" });
      })
      .catch(() => setError("Erro ao carregar utilizador"))
      .finally(() => setLoading(false));
  }, [userId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSuccess("");
    setError("");
    try {
      const res = await fetch(`/api/users/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Erro ao atualizar utilizador");
      setSuccess("Utilizador atualizado com sucesso!");
      setTimeout(() => router.push("/admin/users"), 1200);
    } catch {
      setError("Erro ao atualizar utilizador");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div>A carregar utilizador...</div>;
  if (error) return <div className="text-red-600">{error}</div>;
  if (!user) return null;

  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Editar Utilizador</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-semibold mb-1">Nome</label>
          <input
            className="border p-2 rounded w-full"
            value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            required
          />
        </div>
        <div>
          <label className="block font-semibold mb-1">Email</label>
          <input
            className="border p-2 rounded w-full"
            type="email"
            value={form.email}
            onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
            required
          />
        </div>
        <div>
          <label className="block font-semibold mb-1">Role</label>
          <select
            className="border p-2 rounded w-full"
            value={form.role}
            onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
          >
            <option value="ADMIN">ADMIN</option>
            <option value="STAFF">STAFF</option>
          </select>
        </div>
        <button
          type="submit"
          className="bg-orange-500 text-white px-4 py-2 rounded font-bold hover:bg-orange-600"
          disabled={saving}
        >
          {saving ? "A guardar..." : "Guardar"}
        </button>
        {success && <div className="text-green-600 mt-2">{success}</div>}
        {error && <div className="text-red-600 mt-2">{error}</div>}
      </form>
    </div>
  );
}
