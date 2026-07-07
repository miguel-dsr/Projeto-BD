import './globals.css';
import { getSession } from '@/lib/auth-server';
import LogoutButton from './components/LogoutButton';

export const metadata = {
  title: 'UniReserve - UnB',
  description: 'Sistema de reserva de espaços e equipamentos da UnB',
};

const commonLinks = [
  { href: '/', label: 'Início' },
  { href: '/reservas', label: 'Reservas' },
  { href: '/perfil', label: 'Meu perfil' },
];

const adminLinks = [
  { href: '/usuarios', label: 'Usuários' },
  { href: '/blocos', label: 'Blocos' },
  { href: '/categorias', label: 'Categorias' },
  { href: '/recursos', label: 'Recursos' },
  { href: '/manutencoes', label: 'Manutenções' },
];

export default function RootLayout({ children }) {
  const session = getSession();
  const isAdmin = session?.tipo === 'Servidor';

  return (
    <html lang="pt-br">
      <body className="min-h-screen bg-slate-50 text-slate-800">
        <header className="bg-unb-blue text-white shadow">
          <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between flex-wrap gap-2">
            <a href="/" className="text-lg font-bold">
              UniReserve <span className="text-unb-green">UnB</span>
            </a>

            {session ? (
              <nav className="flex gap-4 text-sm flex-wrap items-center">
                {commonLinks.map((l) => (
                  <a key={l.href} href={l.href} className="hover:underline">{l.label}</a>
                ))}
                {isAdmin && adminLinks.map((l) => (
                  <a key={l.href} href={l.href} className="hover:underline">{l.label}</a>
                ))}
                <span className="text-xs bg-unb-green px-2 py-1 rounded-full">
                  {session.nome} · {isAdmin ? 'Admin' : 'Usuário'}
                </span>
                <LogoutButton />
              </nav>
            ) : (
              <nav className="flex gap-4 text-sm">
                <a href="/login" className="hover:underline">Entrar</a>
                <a href="/signup" className="hover:underline">Cadastrar</a>
              </nav>
            )}
          </div>
        </header>
        <main className="max-w-6xl mx-auto px-4 py-6">{children}</main>
      </body>
    </html>
  );
}
