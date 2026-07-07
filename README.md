# UniReserve — Sistema de Reservas UnB

Projeto da disciplina de Banco de Dados (Departamento de Ciência da Computação — UnB).
Sistema para reserva de espaços físicos (salas, auditórios) e equipamentos
(notebooks, projetores) da universidade.

## Stack

- **Front-end + Back-end:** Next.js 14 (App Router), em um único projeto.
  - Páginas em `app/*/page.js` (client components) chamam as rotas de API.
  - Rotas de API em `app/api/**/route.js` fazem a persistência.
- **Banco de dados:** MySQL (SGBD relacional), acessado via `mysql2` com SQL puro
  (sem ORM), através da pool única em `lib/db.js`.
- **Estilo:** Tailwind CSS.

## Diagrama da camada de persistência

```
┌─────────────────────────┐        fetch()        ┌──────────────────────────────┐
│  Páginas (Client Comp.)  │ ─────────────────────▶ │  Rotas de API (Route Handlers)│
│  app/usuarios/page.js     │                        │  app/api/usuarios/route.js    │
│  app/reservas/page.js     │ ◀───────────────────── │  app/api/reservas/route.js     │
│  ...                      │      JSON / status     │  ...                           │
└─────────────────────────┘                         └───────────────┬───────────────┘
                                                                     │ query() / rawQuery()
                                                                     ▼
                                                        ┌──────────────────────────┐
                                                        │   lib/db.js (mysql2 pool) │
                                                        └────────────┬─────────────┘
                                                                     │ SQL puro
                                                                     ▼
                                                        ┌──────────────────────────┐
                                                        │   MySQL — banco unireserve │
                                                        │  Tabelas, View, Procedure, │
                                                        │  Triggers                  │
                                                        └──────────────────────────┘
```

Exemplo concreto para a tabela `Reserva`:
`app/reservas/page.js` → `POST /api/reservas` (`app/api/reservas/route.js`) →
`rawQuery()` em `lib/db.js` → `CALL sp_criar_reserva(...)` no MySQL, que insere em
`Reserva` e `Reserva_Recurso` na mesma transação.

## Como rodar localmente

1. Instale as dependências:
   ```bash
   npm install
   ```
2. Copie `.env.example` para `.env` e ajuste as credenciais do seu MySQL:
   ```bash
   cp .env.example .env
   ```
3. Crie e popule o banco (roda `sql/01_schema.sql`, `sql/02_seed.sql` e
   `sql/03_view_procedure_trigger.sql`):
   ```bash
   npm run db:init
   ```
   Alternativamente, execute os três arquivos em `sql/` manualmente no seu
   cliente MySQL preferido (Workbench, DBeaver, `mysql` CLI etc.), na ordem
   numérica.
4. Rode o projeto:
   ```bash
   npm run dev
   ```
5. Acesse `http://localhost:3000`.

## Requisitos do projeto atendidos

- **10+ entidades:** Usuario, Estudante, Servidor, Usuario_Telefone,
  Bloco_Predio, Categoria_Recurso, Recurso_Reservavel, Espaco_Fisico,
  Equipamento, Manutencao, Reserva, Reserva_Recurso.
- **≥5 registros por tabela:** ver `sql/02_seed.sql`.
- **Gerador de chave primária automático:** `AUTO_INCREMENT` em Usuario,
  Bloco_Predio, Categoria_Recurso, Recurso_Reservavel, Manutencao, Reserva.
- **CRUD acessando mais de uma tabela:**
  - Usuário: grava em `Usuario` + `Estudante`/`Servidor` + `Usuario_Telefone`.
  - Recurso: grava em `Recurso_Reservavel` + `Espaco_Fisico`/`Equipamento`.
  - Reserva: grava em `Reserva` + `Reserva_Recurso` via procedure.
- **View:** `vw_reservas_detalhadas` (`sql/03_view_procedure_trigger.sql`),
  usada nas telas de reservas.
- **Procedure:** `sp_cancelar_reserva`, usada pela rota `DELETE /api/reservas/:id`.
- **Trigger:** `trg_bloqueia_recurso_indisponivel` — impede reservar um recurso
  que o administrador marcou como indisponível (`indicador_disponibilidade = 'N'`).
- **Dado binário:** upload de foto/PDF do estado do recurso na tela de
  Manutenções, armazenado na coluna `MEDIUMBLOB` (`Manutencao.foto_estado_blob`,
  até 16 MB) e servido de volta em `app/api/manutencoes/[id]/foto/route.js`, que
  detecta o tipo (JPG/PNG/GIF/WebP/PDF) pelos primeiros bytes. Se for enviar
  arquivos grandes, confira o `max_allowed_packet` do seu MySQL
  (`SET GLOBAL max_allowed_packet = 16*1024*1024;`).
- **Interface gráfica para o CRUD:** todas as telas em `app/*/page.js`.

## Autenticação e níveis de acesso (RBAC)

O sistema tem login com sessão (cookie httpOnly) e dois perfis, derivados do
próprio modelo de dados:

- **Estudante = usuário comum.** Vê o catálogo de recursos disponíveis, cria e
  gerencia (cancela) apenas as **próprias** reservas, e edita o próprio perfil.
- **Servidor = administrador.** Além de reservar, tem os CRUDs de Usuários,
  Blocos, Categorias, Recursos (Espaços/Equipamentos) e Manutenções, e enxerga
  todas as reservas.

As permissões são aplicadas em dois níveis: no `middleware.js` (bloqueia páginas
e rotas de API por perfil) e dentro de cada rota (ex.: um estudante só cancela
reserva própria). As senhas são armazenadas com **hash bcrypt**.

### Credenciais de demonstração (após rodar o seed)

Todas as contas usam a senha **`senha123`**.

- Estudantes: `ana.souza@aluno.unb.br`, `carlos.lima@aluno.unb.br`, `fernanda.costa@aluno.unb.br`
- Servidores (admin): `joao.martins@unb.br`, `mariana.ribeiro@unb.br`, `rafael.nogueira@unb.br`

O cadastro público (`/signup`) cria **apenas** contas de Estudante; contas de
Servidor só são criadas por um administrador na tela de Usuários.

## Validação de conflito de horário (double booking)

A rota `POST /api/reservas` abre uma **transação** e, antes dos INSERTs, executa
uma `SELECT ... FOR UPDATE` que verifica se já existe reserva do mesmo recurso
com intervalo de datas sobreposto (`novo_inicio <= existente_fim AND novo_fim >=
existente_inicio`). Havendo sobreposição, faz `ROLLBACK` e retorna **400** com a
mensagem "Este recurso já está reservado neste período". O `FOR UPDATE` segura o
bloqueio até o commit, evitando corrida entre requisições concorrentes.

## Indicação de uso de IA

Foi utilizada IA (Claude, da Anthropic) como apoio na geração do código do
back-end (rotas de API em `app/api/**`), das páginas de front-end em Next.js
(`app/**/page.js`), e revisão dos código SQL (schema + seeds + view + procedure
+ triggers) e deste README, a partir da especificação do projeto e do script escrito pelos alunos. Todo o código gerado foi revisado pelo grupo
antes do envio.
