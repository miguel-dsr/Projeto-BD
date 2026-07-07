import { query } from '@/lib/db';

// Detecta o tipo do arquivo pelos primeiros bytes (magic numbers),
// já que o schema não guarda o mimetype. Suporta JPG, PNG, GIF, WebP e PDF.
function detectMime(buf) {
  if (!buf || buf.length < 4) return 'application/octet-stream';

  // JPEG: FF D8 FF
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return 'image/jpeg';
  // PNG: 89 50 4E 47
  if (buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47) return 'image/png';
  // GIF: 47 49 46 38 ("GIF8")
  if (buf[0] === 0x47 && buf[1] === 0x49 && buf[2] === 0x46 && buf[3] === 0x38) return 'image/gif';
  // PDF: 25 50 44 46 ("%PDF")
  if (buf[0] === 0x25 && buf[1] === 0x50 && buf[2] === 0x44 && buf[3] === 0x46) return 'application/pdf';
  // WebP: "RIFF"...."WEBP"
  if (
    buf.length >= 12 &&
    buf[0] === 0x52 && buf[1] === 0x49 && buf[2] === 0x46 && buf[3] === 0x46 &&
    buf[8] === 0x57 && buf[9] === 0x45 && buf[10] === 0x42 && buf[11] === 0x50
  ) {
    return 'image/webp';
  }

  return 'application/octet-stream';
}

// GET /api/manutencoes/:id/foto - devolve o BLOB com o Content-Type correto.
export async function GET(_req, { params }) {
  const rows = await query(`SELECT foto_estado_blob FROM Manutencao WHERE id_manutencao = ?`, [params.id]);

  if (rows.length === 0 || !rows[0].foto_estado_blob) {
    return new Response('Sem arquivo cadastrado.', { status: 404 });
  }

  const buffer = rows[0].foto_estado_blob; // Buffer vindo do mysql2
  const mime = detectMime(buffer);

  return new Response(buffer, {
    headers: {
      'Content-Type': mime,
      // inline: navegador tenta exibir (imagem/PDF) em vez de baixar
      'Content-Disposition': 'inline',
    },
  });
}
