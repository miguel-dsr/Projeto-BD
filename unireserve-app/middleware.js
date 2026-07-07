import { NextResponse } from 'next/server';
import { COOKIE_NAME, decodeSession } from '@/lib/session';

// Páginas/telas de administração (só Servidor acessa).
const ADMIN_PAGES = ['/usuarios', '/blocos', '/categorias', '/recursos', '/manutencoes'];

// APIs cujo acesso (leitura e escrita) é sempre restrito a administradores,
// exceto pelas exceções tratadas abaixo (auto-cadastro e autoedição de perfil).
const ADMIN_API_ALWAYS = ['/api/usuarios', '/api/manutencoes'];

// APIs cuja LEITURA (GET) é liberada para qualquer usuário logado
// (necessário para preencher formulários, ex.: escolher um recurso na
// tela de reservas), mas cuja escrita (POST/PUT/DELETE) é só de admin.
const ADMIN_API_MUTATION_ONLY = ['/api/blocos', '/api/categorias', '/api/recursos'];

function matchesPrefix(pathname, list) {
  return list.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

export function middleware(request) {
  const { pathname } = request.nextUrl;
  const method = request.method;

  // Rotas sempre públicas: login, cadastro de novo estudante e as
  // próprias rotas de autenticação.
  if (
    pathname === '/login' ||
    pathname === '/signup' ||
    pathname.startsWith('/api/auth') ||
    (pathname === '/api/usuarios' && method === 'POST')
  ) {
    return NextResponse.next();
  }

  const cookie = request.cookies.get(COOKIE_NAME);
  const session = cookie ? decodeSession(cookie.value) : null;

  if (!session) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Não autenticado. Faça login novamente.' }, { status: 401 });
    }
    return NextResponse.redirect(new URL('/login', request.url));
  }

  const isAdmin = session.tipo === 'Servidor';

  // Exceção: o próprio usuário pode ver/editar seu próprio cadastro
  // (usado na tela de Perfil), mesmo não sendo administrador.
  const usuarioIdMatch = pathname.match(/^\/api\/usuarios\/(\d+)$/);
  const isSelfUsuario =
    usuarioIdMatch &&
    Number(usuarioIdMatch[1]) === session.id_usuario &&
    (method === 'GET' || method === 'PUT');

  const isAdminPage = matchesPrefix(pathname, ADMIN_PAGES);
  const isAdminAlwaysApi = matchesPrefix(pathname, ADMIN_API_ALWAYS) && !isSelfUsuario;
  const isMutationOnlyApi = matchesPrefix(pathname, ADMIN_API_MUTATION_ONLY) && method !== 'GET';

  const blocked = (isAdminPage || isAdminAlwaysApi || isMutationOnlyApi) && !isAdmin;

  if (blocked) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Acesso restrito a administradores.' }, { status: 403 });
    }
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
