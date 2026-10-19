-- =====================================================================
-- Sistema da Gráfica — Script de criação do banco (PostgreSQL)
-- Baseado no MER (RF001 a RF013)
-- =====================================================================

-- ENUM para tipoCalculo do Serviço (a revisão do MER cita que hoje é
-- texto livre validado só na API; aqui optei por um ENUM para já
-- garantir a restrição no banco. Se preferir manter como texto livre
-- (igual ao Prisma atual), troque a coluna por VARCHAR e remova o tipo).
CREATE TYPE tipo_calculo_enum AS ENUM ('METRAGEM', 'COMPOSICAO');

-- ---------------------------------------------------------------------
-- Funcionario
-- Pessoa que entra no sistema. Não se relaciona com outras entidades.
-- ---------------------------------------------------------------------
CREATE TABLE funcionario (
    id          SERIAL PRIMARY KEY,
    nome        VARCHAR(150) NOT NULL,
    senha_hash  VARCHAR(255) NOT NULL,
    ativo       BOOLEAN NOT NULL DEFAULT TRUE
);

-- Índice parcial: só funcionários ativos, já ordenados por nome.
-- Atende GET /funcionarios (WHERE ativo = TRUE ORDER BY nome).
CREATE INDEX idx_funcionario_ativo_nome ON funcionario(nome) WHERE ativo = TRUE;

-- ---------------------------------------------------------------------
-- Cliente
-- Quem solicita orçamentos. O e-mail é opcional, mas quando informado
-- não pode se repetir (o UNIQUE aceita vários NULL).
-- ---------------------------------------------------------------------
CREATE TABLE cliente (
    id            SERIAL PRIMARY KEY,
    nome          VARCHAR(150) NOT NULL,
    telefone      VARCHAR(20),
    email         VARCHAR(150) UNIQUE,
    observacoes   TEXT
);

-- ---------------------------------------------------------------------
-- Material
-- Insumo usado nos serviços, com custo por unidade. O nome é único.
-- ---------------------------------------------------------------------
CREATE TABLE material (
    id              SERIAL PRIMARY KEY,
    nome            VARCHAR(150) NOT NULL UNIQUE,
    unidade_medida  VARCHAR(20) NOT NULL,
    custo           NUMERIC(12,2) NOT NULL CHECK (custo >= 0)
);

-- ---------------------------------------------------------------------
-- Servico
-- Serviço oferecido pela gráfica. materialId é opcional (só é usado
-- quando o serviço tem cálculo por metragem ligado direto a um material).
-- ---------------------------------------------------------------------
CREATE TABLE servico (
    id                      SERIAL PRIMARY KEY,
    nome                    VARCHAR(150) NOT NULL,
    tipo_calculo            tipo_calculo_enum NOT NULL,
    material_id             INTEGER REFERENCES material(id),
    tempo_operacao_horas    NUMERIC(10,2),
    custo_hora_operacao     NUMERIC(12,2),
    CONSTRAINT chk_servico_tempo_nao_negativo
        CHECK (tempo_operacao_horas IS NULL OR tempo_operacao_horas >= 0),
    CONSTRAINT chk_servico_custo_hora_nao_negativo
        CHECK (custo_hora_operacao IS NULL OR custo_hora_operacao >= 0)
);

CREATE INDEX idx_servico_material_id ON servico(material_id);

-- ---------------------------------------------------------------------
-- ItemComposicao
-- Entidade associativa (N:M) entre Servico e Material: quanto de cada
-- material um serviço consome. Obrigatória em ambas as pontas.
-- Exclusão em cascata quando o serviço é removido (conforme o MER).
-- Não há restrição de unicidade (servico_id, material_id) de propósito:
-- o mesmo material pode se repetir na composição de um serviço.
-- ---------------------------------------------------------------------
CREATE TABLE item_composicao (
    id           SERIAL PRIMARY KEY,
    servico_id   INTEGER NOT NULL REFERENCES servico(id) ON DELETE CASCADE,
    material_id  INTEGER NOT NULL REFERENCES material(id),
    quantidade   NUMERIC(12,3) NOT NULL CHECK (quantidade > 0)
);

CREATE INDEX idx_item_composicao_servico_id ON item_composicao(servico_id);
CREATE INDEX idx_item_composicao_material_id ON item_composicao(material_id);

-- ---------------------------------------------------------------------
-- Orcamento
-- Cálculo de custo de um serviço para um cliente, registrado ou em
-- rascunho. Cliente e Serviço são opcionais, MAS: só um rascunho pode
-- ficar sem serviço (regra garantida via CHECK abaixo).
-- custo_total é gravado no momento do orçamento: mudar o custo de um
-- material depois não altera orçamentos antigos (não há recálculo
-- automático, é um valor congelado).
-- ---------------------------------------------------------------------
CREATE TABLE orcamento (
    id           SERIAL PRIMARY KEY,
    cliente_id   INTEGER REFERENCES cliente(id) ON DELETE SET NULL,
    servico_id   INTEGER REFERENCES servico(id) ON DELETE SET NULL,
    largura      NUMERIC(10,2),
    altura       NUMERIC(10,2),
    custo_total  NUMERIC(12,2),
    rascunho     BOOLEAN NOT NULL DEFAULT FALSE,
    criado_em    TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_orcamento_servico_obrigatorio_se_nao_rascunho
        CHECK (rascunho = TRUE OR servico_id IS NOT NULL),
    CONSTRAINT chk_orcamento_largura_nao_negativa
        CHECK (largura IS NULL OR largura >= 0),
    CONSTRAINT chk_orcamento_altura_nao_negativa
        CHECK (altura IS NULL OR altura >= 0),
    CONSTRAINT chk_orcamento_custo_total_nao_negativo
        CHECK (custo_total IS NULL OR custo_total >= 0)
);

CREATE INDEX idx_orcamento_cliente_id ON orcamento(cliente_id);
CREATE INDEX idx_orcamento_servico_id ON orcamento(servico_id);

-- ---------------------------------------------------------------------
-- Atividade
-- Item do planejamento semanal, em um dia específico. Não possui FK
-- para nenhuma outra entidade.
-- ---------------------------------------------------------------------
CREATE TABLE atividade (
    id         SERIAL PRIMARY KEY,
    titulo     VARCHAR(150) NOT NULL,
    descricao  TEXT,
    data       DATE NOT NULL
);

CREATE INDEX idx_atividade_data ON atividade(data);