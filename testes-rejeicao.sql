-- 1. Insere um cliente e um material válidos primeiro para servirem de base
INSERT INTO cliente (nome, email) VALUES ('Cliente Base', 'teste@grafica.com');
INSERT INTO material (nome, unidade_medida, custo) VALUES ('Lona Base', 'm2', 25.00);

-- =================================================================
-- AGORA COMEÇAM OS TESTES QUE DEVEM SER REJEITADOS (DAR ERRO!)
-- =================================================================

-- TESTE 1: Unicidade (UNIQUE) em Material (mesmo nome 'Lona Base')
INSERT INTO material (nome, unidade_medida, custo) VALUES ('Lona Base', 'm2', 30.00);

-- TESTE 2: Unicidade (UNIQUE) em Cliente (mesmo email 'teste@grafica.com')
INSERT INTO cliente (nome, email) VALUES ('Outro Cliente', 'teste@grafica.com');

-- TESTE 3: Chave Estrangeira (FK) em Servico (material_id 99999 não existe)
INSERT INTO servico (nome, tipo_calculo, material_id) VALUES ('Banner', 'METRAGEM', 99999);

-- TESTE 4: Chave Estrangeira (FK) em ItemComposicao (servico_id 99999 não existe)
INSERT INTO item_composicao (servico_id, material_id, quantidade) VALUES (99999, 1, 2.0);

-- TESTE 5: Chave Estrangeira (FK) em Orcamento (cliente_id 99999 não existe)
INSERT INTO orcamento (cliente_id, servico_id, rascunho) VALUES (99999, NULL, TRUE);