'use client';

import { useEffect, useMemo, useState } from 'react';

export default function CatalogoPage() {
  const [recursos, setRecursos] = useState([]);
  const [busca, setBusca] = useState('');
  const [categoria, setCategoria] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const res = await fetch('/api/recursos');
      const data = await res.json();
      setRecursos(Array.isArray(data) ? data : []);
      setLoading(false);
    })();
  }, []);

  const categorias = useMemo(
    () => [...new Set(recursos.map((r) => r.categoria))].filter(Boolean),
    [recursos]
  );

  const filtrados = recursos
    .filter((r) => r.indicador_disponibilidade === 'S') // só recursos habilitados
    .filter((r) => (categoria ? r.categoria === categoria : true))
    .filter((r) => r.nome.toLowerCase().includes(busca.toLowerCase()));

  if (loading) return <p>Carregando catálogo...</p>;

  return (
    <div>
      <h1 className="text-xl font-bold text-unb-blue mb-1">Catálogo de recursos</h1>
      <p className="text-sm text-slate-500 mb-4">Escolha um recurso disponível para reservar.</p>

      <div className="flex flex-wrap gap-3 mb-5">
        <input
          placeholder="Buscar por nome..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          className="max-w-xs"
        />
        <select value={categoria} onChange={(e) => setCategoria(e.target.value)} className="max-w-xs">
          <option value="">Todas as categorias</option>
          {categorias.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      {filtrados.length === 0 ? (
        <p className="text-slate-500">Nenhum recurso disponível com esses filtros.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {filtrados.map((r) => (
            <div key={r.id_recurso} className="bg-white border border-slate-200 rounded-lg p-4 flex flex-col">
              <span className="text-xs text-unb-green font-semibold uppercase tracking-wide">{r.categoria}</span>
              <h2 className="font-semibold text-unb-blue mt-1">{r.nome}</h2>
              <p className="text-sm text-slate-600 mt-1 flex-1">
                {r.nome_bloco} — {r.campus}
                {r.tipo === 'Espaco_Fisico' && r.capacidade != null && (
                  <><br />Capacidade: {r.capacidade} pessoas</>
                )}
                {r.tipo === 'Equipamento' && r.marca_modelo && (
                  <><br />{r.marca_modelo}</>
                )}
              </p>
              {r.descricao_regras && (
                <p className="text-xs text-slate-400 mt-2 italic">{r.descricao_regras}</p>
              )}
              <a
                href={`/reservar/${r.id_recurso}`}
                className="mt-3 bg-unb-green text-white text-center px-4 py-2 rounded-md text-sm hover:opacity-90"
              >
                Reservar
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
