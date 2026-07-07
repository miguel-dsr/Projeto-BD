'use client';

import { useEffect, useState } from 'react';

export default function ReservasPage() {
  const [session, setSession] = useState(null);
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    const [meRes, rRes] = await Promise.all([fetch('/api/auth/me'), fetch('/api/reservas')]);
    const { session } = await meRes.json();
    setSession(session);
    setReservas(await rRes.json());
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleCancel(id) {
    if (!confirm('Cancelar esta reserva?')) return;
    const res = await fetch(`/api/reservas/${id}`, { method: 'DELETE' });
    if (!res.ok) {
      alert((await res.json()).error || 'Erro ao cancelar.');
      return;
    }
    load();
  }

  // Uma reserva pode ter mais de um recurso (a view retorna uma linha por recurso).
  const grouped = Object.values(
    (Array.isArray(reservas) ? reservas : []).reduce((acc, r) => {
      if (!acc[r.id_reserva]) acc[r.id_reserva] = { ...r, recursos: [] };
      acc[r.id_reserva].recursos.push(r.nome_recurso);
      return acc;
    }, {})
  );

  const isAdmin = session?.tipo === 'Servidor';

  if (loading) return <p>Carregando...</p>;

  return (
    <div>
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <h1 className="text-xl font-bold text-unb-blue">
          {isAdmin ? 'Todas as reservas' : 'Minhas reservas'}
        </h1>
        {!isAdmin && (
          <a href="/catalogo" className="bg-unb-green text-white px-4 py-2 rounded-md text-sm">
            + Nova reserva
          </a>
        )}
      </div>

      {grouped.length === 0 ? (
        <p className="text-slate-500">
          Nenhuma reserva {isAdmin ? 'cadastrada' : 'sua'} por aqui ainda.
          {!isAdmin && <> Comece pelo <a href="/catalogo" className="text-unb-blue underline">catálogo</a>.</>}
        </p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>ID</th>
              {isAdmin && <th>Usuário</th>}
              <th>Recurso(s)</th>
              <th>Início</th>
              <th>Duração</th>
              <th>Devolução</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {grouped.map((r) => (
              <tr key={r.id_reserva}>
                <td>{r.id_reserva}</td>
                {isAdmin && <td>{r.nome_usuario}</td>}
                <td>{r.recursos.join(', ')}</td>
                <td>{r.data_inicio}</td>
                <td>{r.duracao_reserva}</td>
                <td>{r.data_devolucao}</td>
                <td>
                  <button onClick={() => handleCancel(r.id_reserva)} className="text-red-600 underline">
                    Cancelar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
