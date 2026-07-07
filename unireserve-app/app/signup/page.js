'use client';

import { useState } from 'react';

export default function SignupPage() {
  const [form, setForm] = useState({ nome: '', email_institucional: '', senha: '', curso: '', telefones: '' });
  const [error, setError] = useState('');
  const [ok, setOk] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    const res = await fetch('/api/usuarios', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        tipo: 'Estudante', // cadastro público só cria conta de Estudante
        telefones: form.telefones.split(',').map((t) => t.trim()).filter(Boolean),
      }),
    });
    if (!res.ok) {
      setError((await res.json()).error || 'Erro ao cadastrar.');
      return;
    }
    setOk(true);
    setTimeout(() => (window.location.href = '/login'), 1200);
  }

  return (
    <div className="max-w-sm mx-auto">
      <h1 className="text-xl font-bold text-unb-blue mb-4">Criar conta de estudante</h1>
      <p className="text-sm text-slate-500 mb-4">
        Contas de servidor (administrador) só podem ser criadas por um administrador já existente,
        na tela de Usuários.
      </p>
      <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-lg p-4 space-y-3">
        <div>
          <label>Nome</label>
          <input value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} required />
        </div>
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
        <div>
          <label>Curso</label>
          <input value={form.curso} onChange={(e) => setForm({ ...form, curso: e.target.value })} required />
        </div>
        <div>
          <label>Telefones (separados por vírgula)</label>
          <input value={form.telefones} onChange={(e) => setForm({ ...form, telefones: e.target.value })} />
        </div>
        {error && <p className="text-red-600 text-sm">{error}</p>}
        {ok && <p className="text-unb-green text-sm">Conta criada! Redirecionando para o login...</p>}
        <button type="submit" className="bg-unb-green text-white px-4 py-2 rounded-md text-sm w-full">
          Cadastrar
        </button>
      </form>
      <p className="text-sm text-slate-600 mt-3">
        Já tem conta? <a href="/login" className="text-unb-blue underline">Entrar</a>
      </p>
    </div>
  );
}
