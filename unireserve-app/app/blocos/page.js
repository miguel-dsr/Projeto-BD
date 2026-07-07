'use client';

import { useEffect, useState } from 'react';

const emptyForm = { id_bloco: null, nome_bloco: '', campus: '', horario_abertura: '', horario_fechamento: '' };

export default function BlocosPage() {
  const [blocos, setBlocos] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');

  async function load() {
    const res = await fetch('/api/blocos');
    setBlocos(await res.json());
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
    const isEdit = Boolean(form.id_bloco);
    const url = isEdit ? `/api/blocos/${form.id_bloco}` : '/api/blocos';
    const method = isEdit ? 'PUT' : 'POST';
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    if (!res.ok) {
      setError((await res.json()).error || 'Erro ao salvar.');
      return;
    }
    setForm(emptyForm);
    load();
  }

  async function handleDelete(id) {
    if (!confirm('Excluir este bloco?')) return;
    const res = await fetch(`/api/blocos/${id}`, { method: 'DELETE' });
    if (!res.ok) {
      alert((await res.json()).error || 'Erro ao excluir.');
      return;
    }
    load();
  }

  return (
    <div>
      <h1 className="text-xl font-bold text-unb-blue mb-4">Blocos / Prédios</h1>

      <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-lg p-4 mb-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label>Nome do bloco</label>
          <input name="nome_bloco" value={form.nome_bloco} onChange={handleChange} required />
        </div>
        <div>
          <label>Campus</label>
          <input name="campus" value={form.campus} onChange={handleChange} required />
        </div>
        <div>
          <label>Horário de abertura</label>
          <input name="horario_abertura" type="time" value={form.horario_abertura} onChange={handleChange} required />
        </div>
        <div>
          <label>Horário de fechamento</label>
          <input name="horario_fechamento" type="time" value={form.horario_fechamento} onChange={handleChange} required />
        </div>

        {error && <p className="text-red-600 text-sm sm:col-span-2">{error}</p>}

        <div className="sm:col-span-2 flex gap-2">
          <button type="submit" className="bg-unb-green text-white px-4 py-2 rounded-md text-sm">
            {form.id_bloco ? 'Salvar alterações' : 'Cadastrar bloco'}
          </button>
          {form.id_bloco && (
            <button type="button" onClick={() => setForm(emptyForm)} className="bg-slate-200 px-4 py-2 rounded-md text-sm">
              Cancelar edição
            </button>
          )}
        </div>
      </form>

      <table>
        <thead>
          <tr>
            <th>ID</th><th>Nome</th><th>Campus</th><th>Abertura</th><th>Fechamento</th><th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {blocos.map((b) => (
            <tr key={b.id_bloco}>
              <td>{b.id_bloco}</td>
              <td>{b.nome_bloco}</td>
              <td>{b.campus}</td>
              <td>{b.horario_abertura}</td>
              <td>{b.horario_fechamento}</td>
              <td className="whitespace-nowrap">
                <button onClick={() => setForm(b)} className="text-unb-blue underline mr-2">Editar</button>
                <button onClick={() => handleDelete(b.id_bloco)} className="text-red-600 underline">Excluir</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
