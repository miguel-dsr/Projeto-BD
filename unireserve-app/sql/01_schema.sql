-- =========================================================
-- UniReserve - Script de criação do banco (baseado no
-- script fornecido na especificação do projeto)
-- =========================================================

CREATE DATABASE IF NOT EXISTS unireserve;
USE unireserve;

-- Torna o script idempotente: se você já tinha o banco criado (mesmo que
-- vazio ou com tentativas anteriores), isso limpa tudo antes de recriar,
-- na ordem inversa das dependências de chave estrangeira.
SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS `Reserva_Recurso`;
DROP TABLE IF EXISTS `Reserva`;
DROP TABLE IF EXISTS `Manutencao`;
DROP TABLE IF EXISTS `Equipamento`;
DROP TABLE IF EXISTS `Espaco_Fisico`;
DROP TABLE IF EXISTS `Recurso_Reservavel`;
DROP TABLE IF EXISTS `Categoria_Recurso`;
DROP TABLE IF EXISTS `Bloco_Predio`;
DROP TABLE IF EXISTS `Usuario_Telefone`;
DROP TABLE IF EXISTS `Servidor`;
DROP TABLE IF EXISTS `Estudante`;
DROP TABLE IF EXISTS `Usuario`;
SET FOREIGN_KEY_CHECKS = 1;

CREATE TABLE unireserve.`Usuario`(
  `id_usuario` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `nome` VARCHAR(60) NOT NULL,
  `email_institucional` VARCHAR(100) NOT NULL,
  `senha` VARCHAR(60) NOT NULL
);

CREATE TABLE unireserve.`Estudante`(
  `id_usuario` INT NOT NULL PRIMARY KEY,
  `curso` VARCHAR(255) NOT NULL
);

CREATE TABLE unireserve.`Servidor`(
  `id_usuario` INT NOT NULL PRIMARY KEY,
  `cargo` VARCHAR(255) NOT NULL,
  `departamento_vinculo` VARCHAR(255) NOT NULL
);

CREATE TABLE unireserve.`Usuario_Telefone`(
  `id_usuario` INT NOT NULL,
  `telefone` VARCHAR(20) NOT NULL,
  PRIMARY KEY (`id_usuario`, `telefone`)
);

CREATE TABLE unireserve.`Bloco_Predio`(
  `id_bloco` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `nome_bloco` VARCHAR(255) NOT NULL,
  `campus` VARCHAR(255) NOT NULL,
  `horario_abertura` TIME NOT NULL,
  `horario_fechamento` TIME NOT NULL
);

CREATE TABLE unireserve.`Categoria_Recurso`(
  `id_categoria` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `nome` VARCHAR(255) NOT NULL
);

CREATE TABLE unireserve.`Recurso_Reservavel`(
  `id_recurso` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `nome` VARCHAR(255) NOT NULL,
  `indicador_disponibilidade` CHAR(1) NOT NULL,
  `descricao_regras` VARCHAR(255) NOT NULL,
  `id_bloco` INT NOT NULL,
  `id_categoria` INT NOT NULL
);

CREATE TABLE unireserve.`Espaco_Fisico`(
  `id_recurso` INT NOT NULL PRIMARY KEY,
  `capacidade` INT NOT NULL
);

CREATE TABLE unireserve.`Equipamento`(
  `id_recurso` INT NOT NULL PRIMARY KEY,
  `numero_serie` INT NOT NULL,
  `marca_modelo` VARCHAR(255) NOT NULL
);

CREATE TABLE unireserve.`Manutencao`(
  `id_manutencao` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `data` DATE NOT NULL,
  `descricao` VARCHAR(255) NOT NULL,
  `valor` DECIMAL(8, 2) NOT NULL,
  `foto_estado_blob` MEDIUMBLOB,
  `id_recurso` INT NOT NULL
);

CREATE TABLE unireserve.`Reserva`(
  `id_reserva` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `data_solicitacao` DATETIME NOT NULL,
  `aceitou_termo_solicitacao` BOOLEAN NOT NULL,
  `TS_aceitacao_termo` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `data_inicio` DATE NOT NULL,
  `duracao_reserva` TIME NOT NULL,
  `data_devolucao` DATE NOT NULL,
  `id_usuario` INT NOT NULL
);

CREATE TABLE unireserve.`Reserva_Recurso`(
  `id_reserva` INT NOT NULL,
  `id_recurso` INT NOT NULL,
  PRIMARY KEY(`id_reserva`, `id_recurso`)
);

ALTER TABLE unireserve.`Estudante` ADD CONSTRAINT `estudante_id_usuario_foreign`
  FOREIGN KEY(`id_usuario`) REFERENCES unireserve.`Usuario`(`id_usuario`) ON DELETE CASCADE;

ALTER TABLE unireserve.`Servidor` ADD CONSTRAINT `servidor_id_usuario_foreign`
  FOREIGN KEY(`id_usuario`) REFERENCES unireserve.`Usuario`(`id_usuario`) ON DELETE CASCADE;

ALTER TABLE unireserve.`Usuario_Telefone` ADD CONSTRAINT
  `usuario_telefone_id_usuario_foreign` FOREIGN KEY(`id_usuario`) REFERENCES
  unireserve.`Usuario`(`id_usuario`) ON DELETE CASCADE;

ALTER TABLE unireserve.`Recurso_Reservavel` ADD CONSTRAINT
  `recurso_reservavel_id_bloco_foreign` FOREIGN KEY(`id_bloco`) REFERENCES
  unireserve.`Bloco_Predio`(`id_bloco`);

ALTER TABLE unireserve.`Recurso_Reservavel` ADD CONSTRAINT
  `recurso_reservavel_id_categoria_foreign` FOREIGN KEY(`id_categoria`) REFERENCES
  unireserve.`Categoria_Recurso`(`id_categoria`);

ALTER TABLE unireserve.`Espaco_Fisico` ADD CONSTRAINT
  `espaco_fisico_id_recurso_foreign` FOREIGN KEY(`id_recurso`) REFERENCES
  unireserve.`Recurso_Reservavel`(`id_recurso`) ON DELETE CASCADE;

ALTER TABLE unireserve.`Equipamento` ADD CONSTRAINT
  `equipamento_id_recurso_foreign` FOREIGN KEY(`id_recurso`) REFERENCES
  unireserve.`Recurso_Reservavel`(`id_recurso`) ON DELETE CASCADE;

ALTER TABLE unireserve.`Reserva` ADD CONSTRAINT `reserva_id_usuario_foreign`
  FOREIGN KEY(`id_usuario`) REFERENCES unireserve.`Usuario`(`id_usuario`);

ALTER TABLE unireserve.`Reserva_Recurso` ADD CONSTRAINT
  `reserva_recurso_id_reserva_foreign` FOREIGN KEY(`id_reserva`) REFERENCES
  unireserve.`Reserva`(`id_reserva`) ON DELETE CASCADE;

ALTER TABLE unireserve.`Reserva_Recurso` ADD CONSTRAINT
  `reserva_recurso_id_recurso_foreign` FOREIGN KEY(`id_recurso`) REFERENCES
  unireserve.`Recurso_Reservavel`(`id_recurso`);

ALTER TABLE unireserve.`Manutencao` ADD CONSTRAINT `manutencao_id_recurso_foreign`
  FOREIGN KEY(`id_recurso`) REFERENCES unireserve.`Recurso_Reservavel`(`id_recurso`) ON DELETE CASCADE;
