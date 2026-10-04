-- =====================================================================
-- Sistema da Gráfica — Seed de dados sintéticos para demonstração
-- Ordem de inserção respeita as dependências de FK:
-- funcionario, cliente, material, atividade (independentes)
-- -> servico (depende de material, opcional)
-- -> item_composicao (depende de servico e material)
-- -> orcamento (depende de cliente e servico)
-- =====================================================================

-- ---------------------------------------------------------------------
-- Funcionario (10)
-- ---------------------------------------------------------------------
INSERT INTO funcionario (nome, senha_hash, ativo) VALUES
('Ana Beatriz Souza',   '$2b$10$abcdefghijklmnopqrstuv01', TRUE),
('Carlos Eduardo Lima', '$2b$10$abcdefghijklmnopqrstuv02', TRUE),
('Fernanda Costa',      '$2b$10$abcdefghijklmnopqrstuv03', TRUE),
('Gustavo Ribeiro',     '$2b$10$abcdefghijklmnopqrstuv04', TRUE),
('Juliana Martins',     '$2b$10$abcdefghijklmnopqrstuv05', TRUE),
('Marcelo Andrade',     '$2b$10$abcdefghijklmnopqrstuv06', TRUE),
('Patrícia Nunes',      '$2b$10$abcdefghijklmnopqrstuv07', FALSE),
('Rafael Teixeira',     '$2b$10$abcdefghijklmnopqrstuv08', TRUE),
('Simone Araújo',       '$2b$10$abcdefghijklmnopqrstuv09', FALSE),
('Thiago Monteiro',     '$2b$10$abcdefghijklmnopqrstuv10', TRUE);

-- ---------------------------------------------------------------------
-- Cliente (10)
-- ---------------------------------------------------------------------
INSERT INTO cliente (nome, telefone, email, observacoes) VALUES
('João Pedro Alves',            '(85) 99111-2233', 'joao.alves@email.com',   NULL),
('Maria Fernanda Dias',         '(85) 98222-3344', 'maria.dias@email.com',   'Cliente preferencial'),
('Gráfica Estrela Ltda',        '(85) 3311-4455',  'contato@estrela.com',    'Pedidos recorrentes mensais'),
('Padaria Pão Dourado',         '(85) 99333-5566', NULL,                     NULL),
('Lucas Henrique Barbosa',      '(85) 98444-6677', 'lucas.barbosa@email.com', NULL),
('Studio Fitness Vitalis',      '(85) 99555-7788', 'vitalis@email.com',      'Solicita orçamento por WhatsApp'),
('Camila Rocha Pereira',        '(85) 98666-8899', 'camila.rocha@email.com', NULL),
('Auto Peças Rodrigues ME',     '(85) 3322-9900',  'financeiro@rodrigues.com', NULL),
('Escola Infantil Aprender',    '(85) 99777-0011', 'contato@aprender.edu.br', 'Contrato anual de material escolar'),
('Bruno Cavalcante',            '(85) 98888-1122', NULL,                     'Prefere retirada no balcão');

-- ---------------------------------------------------------------------
-- Material (10)
-- ---------------------------------------------------------------------
INSERT INTO material (nome, unidade_medida, custo) VALUES
('Papel Couché 150g',              'kg',  12.50),
('Papel Couché 300g',              'kg',  15.80),
('Papel Offset 90g',                'kg',   9.90),
('Lona Vinílica 440g',              'm²',  18.00),
('Lona Blackout',                   'm²',  22.50),
('Vinil Adesivo Brilho',            'm²',  25.00),
('Acrílico 3mm',                    'm²',  45.00),
('MDF 3mm',                         'm²',  30.00),
('Tinta Sublimática',               'litro', 60.00),
('Tecido Poliéster p/ Sublimação',  'm²',  28.00);

-- ---------------------------------------------------------------------
-- Servico (10)
-- Serviços de METRAGEM usam materialId direto (um só material).
-- Serviços de COMPOSICAO usam ItemComposicao (vários materiais), então
-- material_id fica NULL aqui.
-- ---------------------------------------------------------------------
INSERT INTO servico (nome, tipo_calculo, material_id, tempo_operacao_horas, custo_hora_operacao) VALUES
('Banner Lona 440g',            'METRAGEM',   4, 0.50, 40.00),
('Banner Blackout',             'METRAGEM',   5, 0.50, 40.00),
('Adesivo Vinil Brilho',        'METRAGEM',   6, 0.30, 35.00),
('Placa em Acrílico',           'METRAGEM',   7, 1.00, 55.00),
('Placa em MDF',                'METRAGEM',   8, 0.80, 50.00),
('Cartão de Visita',            'COMPOSICAO', NULL, 0.40, 30.00),
('Folder A4',                   'COMPOSICAO', NULL, 0.60, 30.00),
('Camiseta Estampada',          'COMPOSICAO', NULL, 0.70, 38.00),
('Caneca Personalizada',        'COMPOSICAO', NULL, 0.35, 32.00),
('Convite de Casamento',        'COMPOSICAO', NULL, 1.20, 45.00);

-- ---------------------------------------------------------------------
-- ItemComposicao (10)
-- Composição dos serviços do tipo COMPOSICAO (servico_id 6 a 10).
-- ---------------------------------------------------------------------
INSERT INTO item_composicao (servico_id, material_id, quantidade) VALUES
(6, 1, 0.10),   -- Cartão de Visita usa Papel Couché 150g
(6, 9, 0.01),   -- e Tinta Sublimática
(7, 1, 0.20),   -- Folder A4 usa Papel Couché 150g
(7, 3, 0.15),   -- e Papel Offset 90g
(8, 10, 0.50),  -- Camiseta usa Tecido Poliéster
(8, 9, 0.05),   -- e Tinta Sublimática
(9, 9, 0.02),   -- Caneca usa Tinta Sublimática
(9, 2, 0.05),   -- e Papel Couché 300g (embalagem)
(10, 2, 0.30),  -- Convite usa Papel Couché 300g
(10, 6, 0.02);  -- e um pouco de Vinil Adesivo (lacre/selo)

-- ---------------------------------------------------------------------
-- Orcamento (10)
-- Regra: se rascunho = FALSE, servico_id é obrigatório (CHECK do schema).
-- Os IDs 5 e 8 são rascunhos sem serviço definido ainda, pra demonstrar
-- esse caso.
-- ---------------------------------------------------------------------
INSERT INTO orcamento (cliente_id, servico_id, largura, altura, custo_total, rascunho, criado_em) VALUES
(1, 1,  2.50, 1.20, 150.00, FALSE, '2026-09-10 09:15:00'),
(2, 6,  NULL, NULL,  80.00, FALSE, '2026-09-11 10:30:00'),
(3, 3,  1.00, 0.50,  45.00, FALSE, '2026-09-12 14:00:00'),
(4, 8,  NULL, NULL, 320.00, FALSE, '2026-09-13 16:45:00'),
(5, NULL, NULL, NULL, NULL, TRUE,  '2026-09-14 08:20:00'),
(6, 4,  0.60, 0.40, 210.00, FALSE, '2026-09-15 11:10:00'),
(7, 9,  NULL, NULL,  95.00, FALSE, '2026-09-16 13:50:00'),
(1, NULL, NULL, NULL, NULL, TRUE,  '2026-09-17 09:40:00'),
(8, 2,  3.00, 1.50, 275.00, FALSE, '2026-09-18 15:25:00'),
(9, 10, NULL, NULL, 540.00, FALSE, '2026-09-19 17:05:00');

-- ---------------------------------------------------------------------
-- Atividade (10)
-- ---------------------------------------------------------------------
INSERT INTO atividade (titulo, descricao, data) VALUES
('Revisar orçamentos pendentes',        'Conferir orçamentos em aberto há mais de 3 dias', '2026-09-22'),
('Comprar lona para banners',           'Estoque de Lona Vinílica 440g está baixo',        '2026-09-23'),
('Manutenção da impressora digital',    'Manutenção preventiva mensal',                    '2026-09-24'),
('Entrega pedido Camiseta Estampada',   'Entregar 30 unidades para Studio Fitness Vitalis','2026-09-24'),
('Reunião com fornecedor de vinil',     NULL,                                               '2026-09-25'),
('Corte de placas em acrílico',         'Pedido da Auto Peças Rodrigues',                  '2026-09-25'),
('Confirmar prazo Convite de Casamento','Cliente pediu antecipação da entrega',            '2026-09-26'),
('Organizar estoque de tintas',         NULL,                                               '2026-09-26'),
('Acompanhar produção de canecas',      'Lote de 50 canecas personalizadas',               '2026-09-27'),
('Fechamento semanal de orçamentos',    'Consolidar total faturado na semana',             '2026-09-27');