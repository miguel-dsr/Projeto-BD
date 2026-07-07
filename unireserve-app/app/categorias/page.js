'use client';

import { useEffect, useState } from 'react';

const emptyForm = { id_categoria: null, nome: '' };

export default function CategoriasPage() {
  const [categorias, setCategorias] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');

  async function load() {
    const res = await fetch('/api/categorias');
    setCategorias(await res.json());
  }

  useEffect(() => {
    load();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    const isEdit = Boolean(form.id_categoria);
    const url = isEdit ? `/api/categorias/${form.id_categoria}` : '/api/categorias';
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
    if (!confirm('Excluir esta categoria?')) return;
    const res = await fetch(`/api/categorias/${id}`, { method: 'DELETE' });
    if (!res.ok) {
      alert((await res.json()).error || 'Erro ao excluir.');
      return;
    }
    load();
  }

  return (
    <div>
      <h1 className="text-xl font-bold text-unb-blue mb-4">Categorias de Recurso</h1>

      <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-lg p-4 mb-6 flex gap-3 items-end">
        <div className="flex-1">
          <label>Nome da categoria</label>
          <input value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} required />
        </div>
        <button type="submit" className="bg-unb-green text-white px-4 py-2 rounded-md text-sm h-fit">
          {form.id_categoria ? 'Salvar' : 'Cadastrar'}
        </button>
        {form.id_categoria && (
          <button type="button" onClick={() => setForm(emptyForm)} className="bg-slate-200 px-4 py-2 rounded-md text-sm h-fit">
            Cancelar
          </button>
        )}
      </form>

      {error && <p className="text-red-600 text-sm mb-3">{error}</p>}

      <table>
        <thead><tr><th>ID</th><th>Nome</th><th>Ações</th></tr></thead>
        <tbody>
          {categorias.map((c) => (
            <tr key={c.id_categoria}>
              <td>{c.id_categoria}</td>
              <td>{c.nome}</td>
              <td className="whitespace-nowrap">
                <button onClick={() => setForm(c)} className="text-unb-blue underline mr-2">Editar</button>
                <button onClick={() => handleDelete(c.id_categoria)} className="text-red-600 underline">Excluir</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
