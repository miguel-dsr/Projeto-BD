'use client';

import { useState } from 'react';

export default function LoginPage() {
  const [form, setForm] = useState({ email_institucional: '', senha: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    setLoading(false);
    if (!res.ok) {
      setError((await res.json()).error || 'Erro ao entrar.');
      return;
    }
    window.location.href = '/';
  }

  return (
    <div className="max-w-sm mx-auto">
      <h1 className="text-xl font-bold text-unb-blue mb-4">Entrar</h1>
      <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-lg p-4 space-y-3">
        <div>
          <label>Email institucional</label>
          <input
            type="email"
            value={form.email_institucional}
            onChange={(e) => setForm({ ...form, email_institucional: e.target.value })}
            required
          />
        </div>
        <div>
          <label>Senha</label>
          <input
            type="password"
            value={form.senha}
            onChange={(e) => setForm({ ...form, senha: e.target.value })}
            required
          />
        </div>
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <button type="submit" disabled={loading} className="bg-unb-green text-white px-4 py-2 rounded-md text-sm w-full">
          Entrar
        </button>
      </form>
      <p className="text-sm text-slate-600 mt-3">
        Ainda não tem conta? <a href="/signup" className="text-unb-blue underline">Cadastre-se</a>
      </p>
    </div>
  );
}
