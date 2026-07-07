'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function ReservarPage() {
  const { id } = useParams();
  const router = useRouter();

  const [recurso, setRecurso] = useState(null);
  const [form, setForm] = useState({ data_inicio: '', duracao_reserva: '', data_devolucao: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const res = await fetch(`/api/recursos/${id}`);
      if (res.ok) setRecurso(await res.json());
    })();
  }, [id]);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSaving(true);
    const res = await fetch('/api/reservas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id_recurso: Number(id), ...form }),
    });
    setSaving(false);
    if (!res.ok) {
      setError((await res.json()).error || 'Não foi possível concluir a reserva.');
      return;
    }
    setSuccess(true);
    setTimeout(() => router.push('/reservas'), 1200);
  }

  if (!recurso) return <p>Carregando recurso...</p>;

  return (
    <div className="max-w-lg mx-auto">
      <a href="/catalogo" className="text-sm text-unb-blue underline">← Voltar ao catálogo</a>

      <div className="bg-white border border-slate-200 rounded-lg p-5 mt-3">
        <span className="text-xs text-unb-green font-semibold uppercase tracking-wide">
          {recurso.categoria || 'Recurso'}
        </span>
        <h1 className="text-xl font-bold text-unb-blue mt-1">{recurso.nome}</h1>
        <p className="text-sm text-slate-600 mt-1">
          {recurso.nome_bloco ? `${recurso.nome_bloco}` : ''}
          {recurso.capacidade != null && ` · Capacidade: ${recurso.capacidade}`}
          {recurso.marca_modelo && ` · ${recurso.marca_modelo}`}
        </p>
        {recurso.descricao_regras && (
          <p className="text-xs text-slate-500 mt-2 bg-slate-50 border border-slate-100 rounded p-2">
            <strong>Regras:</strong> {recurso.descricao_regras}
          </p>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label>Data de início</label>
              <input name="data_inicio" type="date" value={form.data_inicio} onChange={handleChange} required />
            </div>
            <div>
              <label>Data de devolução</label>
              <input name="data_devolucao" type="date" value={form.data_devolucao} onChange={handleChange} required />
            </div>
          </div>
          <div>
            <label>Duração (horas por dia de uso)</label>
            <input name="duracao_reserva" type="time" value={form.duracao_reserva} onChange={handleChange} required />
          </div>

          {error && (
            <p className="text-red-600 text-sm bg-red-50 border border-red-100 rounded p-2">{error}</p>
          )}
          {success && (
            <p className="text-unb-green text-sm bg-green-50 border border-green-100 rounded p-2">
              Reserva confirmada! Redirecionando...
            </p>
          )}

          <button
            type="submit"
            disabled={saving || success}
            className="w-full bg-unb-green text-white px-4 py-3 rounded-md font-semibold hover:opacity-90 disabled:opacity-60"
          >
            {saving ? 'Confirmando...' : 'Confirmar reserva'}
          </button>
        </form>
      </div>
    </div>
  );
}
