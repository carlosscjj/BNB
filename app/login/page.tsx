
"use client";

import { signIn, getSession } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  async function handleLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const form = event.currentTarget;
    const identifier = form.identifier.value;
    const password = form.password.value;
    if (!identifier || !password) {
      setError("Preencha todos os campos.");
      return;
    }
    const res = await signIn("credentials", { identifier, password, redirect: false });
    if (res?.ok && !res.error) {
      // Atualizar sessão imediatamente para refletir permissões
      await router.refresh?.();
      const session = await getSession();
      if ((session?.user as any)?.role === "ADMIN") {
        router.push("/dashboard");
      } else {
        router.push("/calendar");
      }
    } else {
      setError("Email ou password inválidos.");
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-white">
      <form onSubmit={handleLogin} className="bg-white p-8 rounded shadow w-80 flex flex-col gap-4 transition-colors">
        <h1 className="text-xl font-bold text-center text-orange-500">Gestão de Reservas</h1>
        <input
          name="identifier"
          type="text"
          placeholder="Email ou Username"
          required
          className="border p-2 rounded text-black placeholder-gray-500 bg-white focus:outline-none focus:ring-2 focus:ring-orange-400"
          style={{ color: '#111', background: '#fff', fontWeight: 500 }}
        />
        <div className="flex items-center relative">
          <input
            name="password"
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            required
            className="border p-2 rounded text-black placeholder-gray-500 bg-white focus:outline-none focus:ring-2 focus:ring-orange-400 w-full"
            style={{ color: '#111', background: '#fff', fontWeight: 500 }}
          />
          <button
            type="button"
            onClick={() => setShowPassword(prev => !prev)}
            className="absolute right-2 text-black font-semibold focus:outline-none"
            tabIndex={-1}
          >
            {showPassword ? "Ocultar" : "Mostrar"}
          </button>
        </div>
        {error && <span className="text-red-600 text-sm text-center font-semibold">{error}</span>}
        <button type="submit" className="bg-orange-500 text-white py-2 rounded font-semibold hover:bg-orange-600">Entrar</button>
      </form>
    </main>
  );
}
