'use client';

import { useEffect, useState } from 'react';

export default function PerfilPage() {
  const [session, setSession] = useState(null);
  const [form, setForm] = useState({ nome: '', senha: '', telefones: '' });
  const [error, setError] = useState('');
  const [ok, setOk] = useState(false);

  useEffect(() => {
    (async () => {
      const meRes = await fetch('/api/auth/me');
      const { session } = await meRes.json();
      setSession(session);
      if (session) {
        const res = await fetch(`/api/usuarios/${session.id_usuario}`);
        const data = await res.json();
        setForm({ nome: data.nome, senha: '', telefones: (data.telefones || []).join(', ') });
      }
    })();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setOk(false);
    const payload = {
      nome: form.nome,
      senha: form.senha, // vazio = mantém a senha atual
      telefones: form.telefones.split(',').map((t) => t.trim()).filter(Boolean),
    };
    const res = await fetch(`/api/usuarios/${session.id_usuario}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      setError((await res.json()).error || 'Erro ao salvar.');
      return;
    }
    setForm({ ...form, senha: '' });
    setOk(true);
  }

  if (!session) return <p>Carregando...</p>;

  return (
    <div className="max-w-sm">
      <h1 className="text-xl font-bold text-unb-blue mb-1">Meu perfil</h1>
      <p className="text-sm text-slate-500 mb-4">
        Tipo de conta: <strong>{session.tipo === 'Servidor' ? 'Administrador (Servidor)' : 'Usuário comum (Estudante)'}</strong>
      </p>
      <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-lg p-4 space-y-3">
        <div>
          <label>Nome</label>
          <input value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} required />
        </div>
        <div>
          <label>Nova senha (deixe em branco para manter a atual)</label>
          <input type="password" value={form.senha} onChange={(e) => setForm({ ...form, senha: e.target.value })} />
        </div>
        <div>
          <label>Telefones (separados por vírgula)</label>
          <input value={form.telefones} onChange={(e) => setForm({ ...form, telefones: e.target.value })} />
        </div>
        {error && <p className="text-red-600 text-sm">{error}</p>}
        {ok && <p className="text-unb-green text-sm">Dados atualizados.</p>}
        <button type="submit" className="bg-unb-green text-white px-4 py-2 rounded-md text-sm">
          Salvar
        </button>
      </form>
    </div>
  );
}
