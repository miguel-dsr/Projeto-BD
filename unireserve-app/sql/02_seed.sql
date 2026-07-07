USE unireserve;

-- Todas as senhas de demonstração são "senha123" (armazenadas com hash bcrypt).
-- Estudantes (usuários comuns): ana, carlos, fernanda.
-- Servidores (administradores): joao, mariana, rafael.
INSERT INTO `Usuario` (`nome`, `email_institucional`, `senha`) VALUES
('Ana Beatriz Souza', 'ana.souza@aluno.unb.br', '$2b$10$kTmMg/eJDiDWiPBudrDS.uYwA84GOX.L2/BamRYJpWbImo5nMHEGq'),
('Carlos Eduardo Lima', 'carlos.lima@aluno.unb.br', '$2b$10$kTmMg/eJDiDWiPBudrDS.uYwA84GOX.L2/BamRYJpWbImo5nMHEGq'),
('Fernanda Alves Costa', 'fernanda.costa@aluno.unb.br', '$2b$10$kTmMg/eJDiDWiPBudrDS.uYwA84GOX.L2/BamRYJpWbImo5nMHEGq'),
('João Pedro Martins', 'joao.martins@unb.br', '$2b$10$kTmMg/eJDiDWiPBudrDS.uYwA84GOX.L2/BamRYJpWbImo5nMHEGq'),
('Mariana Ribeiro', 'mariana.ribeiro@unb.br', '$2b$10$kTmMg/eJDiDWiPBudrDS.uYwA84GOX.L2/BamRYJpWbImo5nMHEGq'),
('Rafael Nogueira', 'rafael.nogueira@unb.br', '$2b$10$kTmMg/eJDiDWiPBudrDS.uYwA84GOX.L2/BamRYJpWbImo5nMHEGq');

INSERT INTO `Estudante` (`id_usuario`, `curso`) VALUES
(1, 'Ciência da Computação'),
(2, 'Engenharia de Software'),
(3, 'Sistemas de Informação');

INSERT INTO `Servidor` (`id_usuario`, `cargo`, `departamento_vinculo`) VALUES
(4, 'Técnico Administrativo', 'Departamento de Ciência da Computação'),
(5, 'Professor Adjunto', 'Instituto de Ciências Exatas'),
(6, 'Bibliotecário', 'Biblioteca Central');

INSERT INTO `Usuario_Telefone` (`id_usuario`, `telefone`) VALUES
(1, '61999990001'),
(2, '61999990002'),
(3, '61999990003'),
(4, '61999990004'),
(5, '61999990005'),
(6, '61999990006');

INSERT INTO `Bloco_Predio` (`nome_bloco`, `campus`, `horario_abertura`, `horario_fechamento`) VALUES
('Instituto de Ciências Exatas - ICC', 'Darcy Ribeiro', '07:00:00', '22:00:00'),
('Faculdade de Tecnologia', 'Darcy Ribeiro', '07:00:00', '22:00:00'),
('Biblioteca Central - BCE', 'Darcy Ribeiro', '08:00:00', '22:00:00'),
('Faculdade de Ceilândia', 'Ceilândia', '07:30:00', '21:00:00'),
('Faculdade de Planaltina', 'Planaltina', '07:30:00', '21:00:00');

INSERT INTO `Categoria_Recurso` (`nome`) VALUES
('Sala de Aula'),
('Laboratório'),
('Auditório'),
('Notebook'),
('Projetor');

INSERT INTO `Recurso_Reservavel` (`nome`, `indicador_disponibilidade`, `descricao_regras`, `id_bloco`, `id_categoria`) VALUES
('Sala ICC Ala Norte 101', 'S', 'Uso exclusivo para aulas e monitorias.', 1, 1),
('Laboratório de Redes LabRedes', 'S', 'Necessário treinamento prévio para uso dos equipamentos.', 2, 2),
('Auditório Dois Candangos', 'S', 'Reservas acima de 50 pessoas precisam de autorização da direção.', 1, 3),
('Sala de Reunião BCE 2', 'S', 'Reserva máxima de 3 horas por usuário.', 3, 1),
('Notebook Dell Latitude 01', 'S', 'Devolução em até 24h após a retirada.', 2, 4),
('Notebook Dell Latitude 02', 'N', 'Devolução em até 24h após a retirada.', 2, 4),
('Projetor Epson PowerLite 01', 'S', 'Cabo HDMI incluso.', 1, 5),
('Projetor Epson PowerLite 02', 'S', 'Cabo HDMI incluso.', 4, 5);

INSERT INTO `Espaco_Fisico` (`id_recurso`, `capacidade`) VALUES
(1, 45),
(2, 30),
(3, 400),
(4, 8);

INSERT INTO `Equipamento` (`id_recurso`, `numero_serie`, `marca_modelo`) VALUES
(5, 100234, 'Dell Latitude 5420'),
(6, 100235, 'Dell Latitude 5420'),
(7, 200011, 'Epson PowerLite X49'),
(8, 200012, 'Epson PowerLite X49');

INSERT INTO `Manutencao` (`data`, `descricao`, `valor`, `id_recurso`) VALUES
('2026-02-10', 'Troca de bateria do notebook', 250.00, 5),
('2026-03-05', 'Limpeza e revisão do projetor', 80.00, 7),
('2026-03-20', 'Substituição de cabo de rede do laboratório', 45.90, 2),
('2026-04-01', 'Pintura e reparo de cadeiras da sala', 300.00, 1),
('2026-04-15', 'Troca de lâmpada do projetor', 190.00, 8);

INSERT INTO `Reserva` (`data_solicitacao`, `aceitou_termo_solicitacao`, `TS_aceitacao_termo`, `data_inicio`, `duracao_reserva`, `data_devolucao`, `id_usuario`) VALUES
('2026-06-01 10:00:00', TRUE, '2026-06-01 10:00:05', '2026-06-03', '02:00:00', '2026-06-03', 1),
('2026-06-02 14:30:00', TRUE, '2026-06-02 14:30:03', '2026-06-05', '03:00:00', '2026-06-05', 2),
('2026-06-03 09:15:00', TRUE, '2026-06-03 09:15:02', '2026-06-06', '01:30:00', '2026-06-06', 3),
('2026-06-04 16:00:00', TRUE, '2026-06-04 16:00:04', '2026-06-07', '04:00:00', '2026-06-08', 4),
('2026-06-05 11:45:00', TRUE, '2026-06-05 11:45:01', '2026-06-09', '02:00:00', '2026-06-09', 5);

INSERT INTO `Reserva_Recurso` (`id_reserva`, `id_recurso`) VALUES
(1, 1),
(2, 3),
(3, 2),
(4, 4),
(5, 7);
