import { getSession } from '@/lib/auth-server';
import { redirect } from 'next/navigation';

const adminCards = [
  { href: '/reservas', title: 'Reservas', desc: 'Todas as reservas do sistema.' },
  { href: '/usuarios', title: 'Usuários', desc: 'Estudantes e servidores.' },
  { href: '/blocos', title: 'Blocos/Prédios', desc: 'Blocos do campus e horários.' },
  { href: '/categorias', title: 'Categorias', desc: 'Categorias de recursos.' },
  { href: '/recursos', title: 'Recursos', desc: 'Espaços físicos e equipamentos.' },
  { href: '/manutencoes', title: 'Manutenções', desc: 'Histórico e fotos de manutenção.' },
];

const studentCards = [
  { href: '/catalogo', title: 'Catálogo de recursos', desc: 'Veja o que está disponível e reserve.' },
  { href: '/reservas', title: 'Minhas reservas', desc: 'Acompanhe e cancele suas reservas.' },
  { href: '/perfil', title: 'Meu perfil', desc: 'Atualize seus dados e senha.' },
];

export default function HomePage() {
  const session = getSession();
  if (!session) redirect('/login');

  const isAdmin = session.tipo === 'Servidor';
  const cards = isAdmin ? adminCards : studentCards;

  return (
    <div>
      <h1 className="text-2xl font-bold text-unb-blue mb-1">
        Olá, {session.nome.split(' ')[0]} 👋
      </h1>
      <p className="text-slate-600 mb-6">
        {isAdmin
          ? 'Painel administrativo — você tem acesso completo ao sistema.'
          : 'Reserve espaços e equipamentos da UnB de forma rápida.'}
      </p>

      {!isAdmin && (
        <a
          href="/catalogo"
          className="inline-block bg-unb-green text-white px-5 py-3 rounded-lg font-semibold mb-6 hover:opacity-90"
        >
          + Nova reserva
        </a>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {cards.map((c) => (
          <a
            key={c.href}
            href={c.href}
            className="block bg-white border border-slate-200 rounded-lg p-4 hover:shadow-md hover:border-unb-green transition"
          >
            <h2 className="font-semibold text-unb-blue">{c.title}</h2>
            <p className="text-sm text-slate-600 mt-1">{c.desc}</p>
          </a>
        ))}
      </div>
    </div>
  );
}
