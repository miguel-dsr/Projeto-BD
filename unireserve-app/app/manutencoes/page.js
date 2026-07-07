'use client';

import { useEffect, useState, useRef } from 'react';

export default function ManutencoesPage() {
  const [manutencoes, setManutencoes] = useState([]);
  const [recursos, setRecursos] = useState([]);
  const [form, setForm] = useState({ data: '', descricao: '', valor: '', id_recurso: '' });
  const [error, setError] = useState('');
  const fileRef = useRef(null);

  async function load() {
    const [m, r] = await Promise.all([
      fetch('/api/manutencoes').then((r) => r.json()),
      fetch('/api/recursos').then((r) => r.json()),
    ]);
    setManutencoes(m);
    setRecursos(r);
  }

  useEffect(() => {
    load();
  }, []);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    const file = fileRef.current?.files[0];
    if (file && file.size > 16 * 1024 * 1024) {
      setError('Arquivo muito grande. O limite é 16 MB.');
      return;
    }
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));
    if (file) {
      fd.append('foto', file);
    }
    const res = await fetch('/api/manutencoes', { method: 'POST', body: fd });
    if (!res.ok) {
      setError((await res.json()).error || 'Erro ao registrar.');
      return;
    }
    setForm({ data: '', descricao: '', valor: '', id_recurso: '' });
    if (fileRef.current) fileRef.current.value = '';
    load();
  }

  async function handleDelete(id) {
    if (!confirm('Excluir este registro de manutenção?')) return;
    const res = await fetch(`/api/manutencoes/${id}`, { method: 'DELETE' });
    if (!res.ok) {
      alert((await res.json()).error || 'Erro ao excluir.');
      return;
    }
    load();
  }

  return (
    <div>
      <h1 className="text-xl font-bold text-unb-blue mb-4">Manutenções</h1>
      <p className="text-sm text-slate-500 mb-4">
        É possível anexar uma foto do estado do recurso (armazenada como <code>BLOB</code> no MySQL).
      </p>

      <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-lg p-4 mb-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label>Recurso</label>
          <select name="id_recurso" value={form.id_recurso} onChange={handleChange} required>
            <option value="">Selecione...</option>
            {recursos.map((r) => (
              <option key={r.id_recurso} value={r.id_recurso}>{r.nome}</option>
            ))}
          </select>
        </div>
        <div>
          <label>Data</label>
          <input name="data" type="date" value={form.data} onChange={handleChange} required />
        </div>
        <div className="sm:col-span-2">
          <label>Descrição</label>
          <input name="descricao" value={form.descricao} onChange={handleChange} required />
        </div>
        <div>
          <label>Valor (R$)</label>
          <input name="valor" type="number" step="0.01" value={form.valor} onChange={handleChange} required />
        </div>
        <div>
          <label>Foto/arquivo do estado (opcional)</label>
          <input type="file" accept="image/*,application/pdf" ref={fileRef} />
          <p className="text-xs text-slate-400 mt-1">Aceita imagem (JPG, PNG, GIF, WebP) ou PDF.</p>
        </div>

        {error && <p className="text-red-600 text-sm sm:col-span-2">{error}</p>}

        <div className="sm:col-span-2">
          <button type="submit" className="bg-unb-green text-white px-4 py-2 rounded-md text-sm">
            Registrar manutenção
          </button>
        </div>
      </form>

      <table>
        <thead>
          <tr>
            <th>ID</th><th>Recurso</th><th>Data</th><th>Descrição</th><th>Valor</th><th>Foto</th><th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {manutencoes.map((m) => (
            <tr key={m.id_manutencao}>
              <td>{m.id_manutencao}</td>
              <td>{m.nome_recurso}</td>
              <td>{m.data}</td>
              <td>{m.descricao}</td>
              <td>R$ {Number(m.valor).toFixed(2)}</td>
              <td>
                {m.foto_tipo === 'imagem' ? (
                  <img src={`/api/manutencoes/${m.id_manutencao}/foto`} alt="Estado do recurso" className="h-12 rounded" />
                ) : m.foto_tipo === 'pdf' ? (
                  <a
                    href={`/api/manutencoes/${m.id_manutencao}/foto`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-unb-blue underline"
                  >
                    Ver PDF
                  </a>
                ) : (
                  '-'
                )}
              </td>
              <td>
                <button onClick={() => handleDelete(m.id_manutencao)} className="text-red-600 underline">Excluir</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
