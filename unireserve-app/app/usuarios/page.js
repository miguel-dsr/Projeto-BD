'use client';

import { useEffect, useState } from 'react';

const emptyForm = {
  id_usuario: null,
  nome: '',
  email_institucional: '',
  senha: '',
  tipo: 'Estudante',
  curso: '',
  cargo: '',
  departamento_vinculo: '',
  telefones: '',
};

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function load() {
    const res = await fetch('/api/usuarios');
    setUsuarios(await res.json());
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
    setLoading(true);
    const payload = {
      ...form,
      telefones: form.telefones
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
    };
    const isEdit = Boolean(form.id_usuario);
    const url = isEdit ? `/api/usuarios/${form.id_usuario}` : '/api/usuarios';
    const method = isEdit ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || 'Erro ao salvar.');
      return;
    }
    setForm(emptyForm);
    load();
  }

  function handleEdit(u) {
    setForm({
      id_usuario: u.id_usuario,
      nome: u.nome,
      email_institucional: u.email_institucional,
      senha: u.senha || '',
      tipo: u.tipo === 'Servidor' ? 'Servidor' : 'Estudante',
      curso: u.curso || '',
      cargo: u.cargo || '',
      departamento_vinculo: u.departamento_vinculo || '',
      telefones: (u.telefones || []).join(', '),
    });
  }

  async function handleDelete(id) {
    if (!confirm('Excluir este usuário?')) return;
    const res = await fetch(`/api/usuarios/${id}`, { method: 'DELETE' });
    if (!res.ok) {
      const data = await res.json();
      alert(data.error || 'Erro ao excluir.');
      return;
    }
    load();
  }

  return (
    <div>
      <h1 className="text-xl font-bold text-unb-blue mb-4">Usuários</h1>

      <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-lg p-4 mb-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label>Nome</label>
          <input name="nome" value={form.nome} onChange={handleChange} required />
        </div>
        <div>
          <label>Email institucional</label>
          <input name="email_institucional" type="email" value={form.email_institucional} onChange={handleChange} required />
        </div>
        <div>
          <label>Senha {form.id_usuario && <span className="font-normal text-slate-400">(deixe em branco para manter)</span>}</label>
          <input name="senha" type="password" value={form.senha} onChange={handleChange} required={!form.id_usuario} />
        </div>
        <div>
          <label>Tipo</label>
          <select name="tipo" value={form.tipo} onChange={handleChange}>
            <option value="Estudante">Estudante</option>
            <option value="Servidor">Servidor</option>
          </select>
        </div>

        {form.tipo === 'Estudante' ? (
          <div>
            <label>Curso</label>
            <input name="curso" value={form.curso} onChange={handleChange} />
          </div>
        ) : (
          <>
            <div>
              <label>Cargo</label>
              <input name="cargo" value={form.cargo} onChange={handleChange} />
            </div>
            <div>
              <label>Departamento de vínculo</label>
              <input name="departamento_vinculo" value={form.departamento_vinculo} onChange={handleChange} />
            </div>
          </>
        )}

        <div className="sm:col-span-2">
          <label>Telefones (separados por vírgula)</label>
          <input name="telefones" value={form.telefones} onChange={handleChange} placeholder="61999990000, 61988880000" />
        </div>

        {error && <p className="text-red-600 text-sm sm:col-span-2">{error}</p>}

        <div className="sm:col-span-2 flex gap-2">
          <button type="submit" disabled={loading} className="bg-unb-green text-white px-4 py-2 rounded-md text-sm">
            {form.id_usuario ? 'Salvar alterações' : 'Cadastrar usuário'}
          </button>
          {form.id_usuario && (
            <button type="button" onClick={() => setForm(emptyForm)} className="bg-slate-200 px-4 py-2 rounded-md text-sm">
              Cancelar edição
            </button>
          )}
        </div>
      </form>

      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Nome</th>
            <th>Email</th>
            <th>Tipo</th>
            <th>Detalhe</th>
            <th>Telefones</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {usuarios.map((u) => (
            <tr key={u.id_usuario}>
              <td>{u.id_usuario}</td>
              <td>{u.nome}</td>
              <td>{u.email_institucional}</td>
              <td>{u.tipo}</td>
              <td>{u.curso || u.cargo || '-'}</td>
              <td>{(u.telefones || []).join(', ') || '-'}</td>
              <td className="whitespace-nowrap">
                <button onClick={() => handleEdit(u)} className="text-unb-blue underline mr-2">Editar</button>
                <button onClick={() => handleDelete(u.id_usuario)} className="text-red-600 underline">Excluir</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
