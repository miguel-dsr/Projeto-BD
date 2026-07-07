USE unireserve;

-- =========================================================
-- VIEW: consolida reserva + usuário + recurso + bloco + categoria
-- para uso direto na tela de "Minhas reservas" / painel do admin.
-- =========================================================
DROP VIEW IF EXISTS `vw_reservas_detalhadas`;

CREATE VIEW `vw_reservas_detalhadas` AS
SELECT
  r.id_reserva,
  r.data_solicitacao,
  r.data_inicio,
  r.duracao_reserva,
  r.data_devolucao,
  r.aceitou_termo_solicitacao,
  u.id_usuario,
  u.nome AS nome_usuario,
  u.email_institucional,
  rr.id_recurso,
  rec.nome AS nome_recurso,
  cat.nome AS categoria_recurso,
  bp.nome_bloco,
  bp.campus
FROM `Reserva` r
JOIN `Usuario` u ON u.id_usuario = r.id_usuario
JOIN `Reserva_Recurso` rr ON rr.id_reserva = r.id_reserva
JOIN `Recurso_Reservavel` rec ON rec.id_recurso = rr.id_recurso
JOIN `Bloco_Predio` bp ON bp.id_bloco = rec.id_bloco
JOIN `Categoria_Recurso` cat ON cat.id_categoria = rec.id_categoria;

-- =========================================================
-- PROCEDURE: cancela (remove) uma reserva. Graças ao
-- ON DELETE CASCADE, o vínculo em Reserva_Recurso é removido
-- automaticamente. Usada pela rota DELETE /api/reservas/:id.
--
-- Obs.: "DELIMITER" não é usado aqui de propósito — é um recurso
-- apenas do cliente de linha de comando "mysql"; o driver mysql2
-- envia o CREATE PROCEDURE direto ao servidor.
-- =========================================================
DROP PROCEDURE IF EXISTS `sp_criar_reserva`;
DROP PROCEDURE IF EXISTS `sp_cancelar_reserva`;

CREATE PROCEDURE `sp_cancelar_reserva` (IN p_id_reserva INT)
BEGIN
  DELETE FROM Reserva WHERE id_reserva = p_id_reserva;
END;

-- =========================================================
-- TRIGGER: impede que uma reserva seja vinculada a um recurso
-- que o administrador marcou como indisponível (ex.: em manutenção,
-- indicador_disponibilidade = 'N'). A disponibilidade por PERÍODO
-- (conflito de horário) é tratada na rota POST /api/reservas.
-- =========================================================
DROP TRIGGER IF EXISTS `trg_reserva_recurso_after_insert`;
DROP TRIGGER IF EXISTS `trg_reserva_recurso_after_delete`;
DROP TRIGGER IF EXISTS `trg_bloqueia_recurso_indisponivel`;

CREATE TRIGGER `trg_bloqueia_recurso_indisponivel`
BEFORE INSERT ON `Reserva_Recurso`
FOR EACH ROW
BEGIN
  DECLARE v_disp CHAR(1);

  SELECT indicador_disponibilidade INTO v_disp
  FROM Recurso_Reservavel
  WHERE id_recurso = NEW.id_recurso;

  IF v_disp = 'N' THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'Recurso indisponível para reserva (desabilitado pelo administrador).';
  END IF;
END;
