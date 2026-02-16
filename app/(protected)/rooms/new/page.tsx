"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewRoomPage() {
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isPending, setIsPending] = useState(false);
  const router = useRouter();

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsPending(true);
    const form = e.currentTarget;
    const formData = new FormData(form);
    const res = await fetch("/api/rooms", {
      method: "POST",
      body: formData,
    });
    setIsPending(false);
    if (res.ok) {
      setSuccess("Quarto criado com sucesso!");
      form.reset();
      setTimeout(() => router.push("/rooms"), 1200);
    } else {
      const data = await res.json();
      setError(data.error || "Erro ao criar quarto.");
    }
  }

  return (
    <main className="p-8 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-4">Novo Quarto</h1>
      <form onSubmit={handleCreate} className="space-y-4 bg-white dark:bg-gray-800 p-6 rounded shadow" encType="multipart/form-data">
        <div>
          <label htmlFor="name" className="block font-semibold text-black dark:text-white mb-1">Nome</label>
          <input id="name" name="name" required className="w-full border border-gray-300 dark:border-gray-600 p-3 rounded text-black dark:text-white bg-white dark:bg-gray-700 focus:border-orange-500 focus:outline-none" />
        </div>
        <div>
          <label htmlFor="description" className="block font-semibold text-black dark:text-white mb-1">Descrição</label>
          <textarea id="description" name="description" required className="w-full border border-gray-300 dark:border-gray-600 p-3 rounded text-black dark:text-white bg-white dark:bg-gray-700 focus:border-orange-500 focus:outline-none" />
        </div>
        <div>
          <label htmlFor="photo" className="block font-semibold text-black dark:text-white mb-1">Foto do Quarto</label>
          <input id="photo" name="photo" type="file" accept="image/*" className="w-full border border-gray-300 dark:border-gray-600 p-3 rounded text-black dark:text-white bg-white dark:bg-gray-700 focus:border-orange-500 focus:outline-none" />
        </div>
        {error && <div className="text-red-600 font-semibold text-center">{error}</div>}
        {success && <div className="text-green-600 font-semibold text-center">{success}</div>}
        <button type="submit" className="w-full bg-orange-500 text-white text-lg font-bold py-3 rounded hover:bg-orange-600 transition" disabled={isPending}>{isPending ? "Salvando..." : "Criar Quarto"}</button>
      </form>
    </main>
  );
}
