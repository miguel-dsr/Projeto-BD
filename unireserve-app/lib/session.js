// Funções de sessão "edge-safe": SEM imports de bcrypt ou next/headers,
// para poderem ser usadas dentro do middleware (Edge Runtime).
export const COOKIE_NAME = 'unireserve_session';

// Sessão simplificada para fins acadêmicos: o cookie guarda
// { id_usuario, nome, tipo } em base64, httpOnly. Não é assinado/
// criptografado — para produção real usar iron-session/JWT.
export function encodeSession(payload) {
  return Buffer.from(JSON.stringify(payload)).toString('base64');
}

export function decodeSession(value) {
  try {
    return JSON.parse(Buffer.from(value, 'base64').toString('utf8'));
  } catch {
    return null;
  }
}
