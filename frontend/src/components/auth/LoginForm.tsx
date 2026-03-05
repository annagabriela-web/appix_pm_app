import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import apiClient from "@services/apiClient";
import QueryProvider from "@components/providers/QueryProvider";
import { z } from "zod";

const loginResponseSchema = z.object({
  id: z.number(),
  email: z.string(),
  firstName: z.string(),
  lastName: z.string(),
});

async function initCsrf(): Promise<void> {
  await apiClient.get("/auth/csrf/");
}

async function postLogin(
  email: string,
  password: string
): Promise<z.infer<typeof loginResponseSchema>> {
  const { data } = await apiClient.post("/auth/login/", { email, password });
  return loginResponseSchema.parse(data);
}

function LoginFormInner() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [csrfReady, setCsrfReady] = useState(false);

  useEffect(() => {
    initCsrf().then(() => setCsrfReady(true));
  }, []);

  const mutation = useMutation({
    mutationFn: () => postLogin(email, password),
    onSuccess: () => {
      window.location.href = "/";
    },
  });

  const errorMessage = mutation.isError
    ? ((mutation.error as { response?: { data?: { detail?: string } } })
        ?.response?.data?.detail ?? "Error de autenticacion. Intenta de nuevo.")
    : null;

  return (
    <div className="w-full max-w-sm">
      {/* Logo */}
      <div className="mb-8 text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 bg-[#6278fb] rounded-xl mb-4">
          <span className="text-white font-bold text-xl">A</span>
        </div>
        <h1 className="text-2xl font-bold text-white">
          <span className="text-[#00e7ba]">Appix</span> PM
        </h1>
        <p className="text-gray-400 text-xs mt-1">
          Centro de Comando Financiero
        </p>
      </div>

      {/* Card */}
      <div className="bg-white/5 backdrop-blur rounded-2xl p-8 shadow-2xl border border-white/10">
        <h2 className="text-lg font-semibold text-white mb-1">
          Iniciar sesion
        </h2>
        <p className="text-gray-400 text-xs mb-6">
          Ingresa tus credenciales para acceder
        </p>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (csrfReady) mutation.mutate();
          }}
          className="space-y-4"
        >
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-300 mb-1.5"
            >
              Correo electronico
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#6278fb] focus:border-[#6278fb] transition-colors"
              placeholder="correo@appix.mx"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-300 mb-1.5"
            >
              Contrasena
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#6278fb] focus:border-[#6278fb] transition-colors"
              placeholder="••••••••"
            />
          </div>

          {errorMessage && (
            <p role="alert" className="text-red-400 text-xs font-medium">
              {errorMessage}
            </p>
          )}

          <button
            type="submit"
            disabled={mutation.isPending || !csrfReady}
            className="w-full bg-[#6278fb] hover:bg-[#4f63e0] disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold rounded-lg py-2.5 text-sm transition-colors mt-2"
          >
            {mutation.isPending ? "Autenticando..." : "Iniciar sesion"}
          </button>
        </form>
      </div>

      <p className="text-center text-gray-500 text-xs mt-6">
        Appix Data Management v1.0
      </p>
    </div>
  );
}

export default function LoginForm() {
  return (
    <QueryProvider>
      <LoginFormInner />
    </QueryProvider>
  );
}
