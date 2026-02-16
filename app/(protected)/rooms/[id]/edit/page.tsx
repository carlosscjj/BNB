
"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";


export default function EditRoomPage() {
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [room, setRoom] = useState<any>(null);
  const [form, setForm] = useState({ name: "", description: "", imageUrl: "" });
  const router = useRouter();
  const params = useParams();
  const id = typeof params.id === "string" ? params.id : Array.isArray(params.id) ? params.id[0] : "";

  useEffect(() => {
    if (!id) return;
    setIsPending(true);
    fetch(`/api/rooms/${id}`)
      .then(async res => {
        if (!res.ok) throw new Error("Erro ao carregar quarto");
        return res.json();
      })
      .then(data => {
        setRoom(data);
        setForm({
          name: data.name || "",
          description: data.description || "",
          imageUrl: data.imageUrl || data.photoUrl || ""
        });
      })
      .catch(() => setError("Erro ao carregar quarto."))
      .finally(() => setIsPending(false));
  }, [id]);

  async function handleEdit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsPending(true);
    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    let imageUrl = form.imageUrl;
    const photo = formData.get("photo");
    // Se o usuário selecionar uma nova imagem, fazer upload (não implementado aqui)
    // Para já, só envia o campo imageUrl
    const res = await fetch(`/api/rooms/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, description, imageUrl }),
    });
    setIsPending(false);
    if (res.ok) {
      setSuccess("Quarto atualizado com sucesso!");
      setTimeout(() => router.push("/rooms"), 1200);
    } else {
      let data;
      try { data = await res.json(); } catch { data = {}; }
      setError(data.error || "Erro ao editar quarto.");
    }
  }

  if (isPending && !room && !error) return <div className="p-8">Carregando...</div>;
  if (error) return <div className="p-8 text-red-600">{error}</div>;

  return (
    <main className="p-8 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-4">Editar Quarto</h1>
      <form onSubmit={handleEdit} className="space-y-4 bg-white dark:bg-white p-6 rounded shadow transition-colors">
        <div>
          <label htmlFor="name" className="block font-semibold text-black mb-1">Nome</label>
          <input id="name" name="name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required className="w-full border border-gray-300 dark:border-gray-600 p-3 rounded text-black bg-white focus:border-orange-500 focus:outline-none" />
        </div>
        <div>
          <label htmlFor="description" className="block font-semibold text-black mb-1">Descrição</label>
          <textarea id="description" name="description" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} required className="w-full border border-gray-300 dark:border-gray-600 p-3 rounded text-black bg-white focus:border-orange-500 focus:outline-none" />
        </div>
        <div>
          <label htmlFor="photo" className="block font-semibold text-black mb-1">Foto do Quarto (URL)</label>
          <input id="imageUrl" name="imageUrl" value={form.imageUrl} onChange={e => setForm(f => ({ ...f, imageUrl: e.target.value }))} className="w-full border border-gray-300 dark:border-gray-600 p-3 rounded text-black bg-white focus:border-orange-500 focus:outline-none" placeholder="Cole o link da imagem ou deixe vazio" />
          {form.imageUrl && <img src={form.imageUrl} alt="Foto atual" className="mt-2 max-h-32 rounded" />}
        </div>
        {error && <div className="text-red-600 font-semibold text-center">{error}</div>}
        {success && <div className="text-green-600 font-semibold text-center">{success}</div>}
        <button type="submit" className="w-full bg-orange-500 text-white text-lg font-bold py-3 rounded hover:bg-orange-600 transition" disabled={isPending}>{isPending ? "Salvando..." : "Salvar Alterações"}</button>
      </form>
    </main>
  );
}
