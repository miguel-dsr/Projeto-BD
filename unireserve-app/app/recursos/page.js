'use client';

import { useEffect, useState } from 'react';

const emptyForm = {
  id_recurso: null,
  nome: '',
  indicador_disponibilidade: 'S',
  descricao_regras: '',
  id_bloco: '',
  id_categoria: '',
  tipo: 'Espaco_Fisico',
  capacidade: '',
  numero_serie: '',
  marca_modelo: '',
};

export default function RecursosPage() {
  const [recursos, setRecursos] = useState([]);
  const [blocos, setBlocos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');

  async function load() {
    const [r, b, c] = await Promise.all([
      fetch('/api/recursos').then((r) => r.json()),
      fetch('/api/blocos').then((r) => r.json()),
      fetch('/api/categorias').then((r) => r.json()),
    ]);
    setRecursos(r);
    setBlocos(b);
    setCategorias(c);
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
    const isEdit = Boolean(form.id_recurso);
    const url = isEdit ? `/api/recursos/${form.id_recurso}` : '/api/recursos';
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

  function handleEdit(r) {
    setForm({
      id_recurso: r.id_recurso,
      nome: r.nome,
      indicador_disponibilidade: r.indicador_disponibilidade,
      descricao_regras: r.descricao_regras,
      id_bloco: r.id_bloco,
      id_categoria: r.id_categoria,
      tipo: r.tipo === 'Equipamento' ? 'Equipamento' : 'Espaco_Fisico',
      capacidade: r.capacidade ?? '',
      numero_serie: r.numero_serie ?? '',
      marca_modelo: r.marca_modelo ?? '',
    });
  }

  async function handleDelete(id) {
    if (!confirm('Excluir este recurso?')) return;
    const res = await fetch(`/api/recursos/${id}`, { method: 'DELETE' });
    if (!res.ok) {
      alert((await res.json()).error || 'Erro ao excluir.');
      return;
    }
    load();
  }

  return (
    <div>
      <h1 className="text-xl font-bold text-unb-blue mb-4">Recursos Reserváveis</h1>

      <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-lg p-4 mb-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label>Nome</label>
          <input name="nome" value={form.nome} onChange={handleChange} required />
        </div>
        <div>
          <label>Disponibilidade</label>
          <select name="indicador_disponibilidade" value={form.indicador_disponibilidade} onChange={handleChange}>
            <option value="S">Disponível</option>
            <option value="N">Indisponível</option>
          </select>
        </div>
        <div className="sm:col-span-2">
          <label>Regras de uso</label>
          <input name="descricao_regras" value={form.descricao_regras} onChange={handleChange} />
        </div>
        <div>
          <label>Bloco/Prédio</label>
          <select name="id_bloco" value={form.id_bloco} onChange={handleChange} required>
            <option value="">Selecione...</option>
            {blocos.map((b) => (
              <option key={b.id_bloco} value={b.id_bloco}>{b.nome_bloco}</option>
            ))}
          </select>
        </div>
        <div>
          <label>Categoria</label>
          <select name="id_categoria" value={form.id_categoria} onChange={handleChange} required>
            <option value="">Selecione...</option>
            {categorias.map((c) => (
              <option key={c.id_categoria} value={c.id_categoria}>{c.nome}</option>
            ))}
          </select>
        </div>
        <div>
          <label>Tipo de recurso</label>
          <select name="tipo" value={form.tipo} onChange={handleChange}>
            <option value="Espaco_Fisico">Espaço físico</option>
            <option value="Equipamento">Equipamento</option>
          </select>
        </div>

        {form.tipo === 'Espaco_Fisico' ? (
          <div>
            <label>Capacidade (pessoas)</label>
            <input name="capacidade" type="number" value={form.capacidade} onChange={handleChange} />
          </div>
        ) : (
          <>
            <div>
              <label>Número de série</label>
              <input name="numero_serie" type="number" value={form.numero_serie} onChange={handleChange} />
            </div>
            <div>
              <label>Marca/Modelo</label>
              <input name="marca_modelo" value={form.marca_modelo} onChange={handleChange} />
            </div>
          </>
        )}

        {error && <p className="text-red-600 text-sm sm:col-span-2">{error}</p>}

        <div className="sm:col-span-2 flex gap-2">
          <button type="submit" className="bg-unb-green text-white px-4 py-2 rounded-md text-sm">
            {form.id_recurso ? 'Salvar alterações' : 'Cadastrar recurso'}
          </button>
          {form.id_recurso && (
            <button type="button" onClick={() => setForm(emptyForm)} className="bg-slate-200 px-4 py-2 rounded-md text-sm">
              Cancelar edição
            </button>
          )}
        </div>
      </form>

      <table>
        <thead>
          <tr>
            <th>ID</th><th>Nome</th><th>Tipo</th><th>Bloco</th><th>Categoria</th><th>Disp.</th><th>Detalhe</th><th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {recursos.map((r) => (
            <tr key={r.id_recurso}>
              <td>{r.id_recurso}</td>
              <td>{r.nome}</td>
              <td>{r.tipo}</td>
              <td>{r.nome_bloco}</td>
              <td>{r.categoria}</td>
              <td>{r.indicador_disponibilidade === 'S' ? 'Sim' : 'Não'}</td>
              <td>{r.tipo === 'Espaco_Fisico' ? `${r.capacidade} lugares` : `${r.marca_modelo} (${r.numero_serie})`}</td>
              <td className="whitespace-nowrap">
                <button onClick={() => handleEdit(r)} className="text-unb-blue underline mr-2">Editar</button>
                <button onClick={() => handleDelete(r.id_recurso)} className="text-red-600 underline">Excluir</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
