-- =====================================================================
-- Migração: tabela de perfis, integridade do perfil e senha em hash
-- (RF-12, RF-13)
--
-- Parte do que o 05-migracao-perfil.sql já fez: funcionario.perfil
-- (texto: ADMINISTRADOR ou FUNCIONARIO). O código da API continua lendo
-- essa coluna sem mudar. Esta migração:
--   1. cria a tabela de perfis, que passa a ser a fonte dos perfis válidos;
--   2. troca as listas fixas (CHECK) por uma chave estrangeira para ela,
--      então um perfil novo é só uma linha nova em perfil;
--   3. garante que a senha só exista como hash BCrypt, inclusive no banco:
--      senha em texto puro é convertida em hash e, daqui em diante, o
--      banco recusa qualquer valor que não tenha o formato de um hash.
--
-- É IDEMPOTENTE: roda sozinha na criação de um banco novo (Docker executa
-- init/ em ordem alfabética, depois de 01 a 05) e pode ser aplicada a um
-- banco que já existe, sem perder dados:
--   docker compose cp init\06-migracao-perfis-usuarios.sql db:/tmp/06.sql
--   docker compose exec -T db psql -U grafica_user -d grafica -v ON_ERROR_STOP=1 -f /tmp/06.sql
-- =====================================================================

-- Funções de hash (crypt e gen_salt) usadas na conversão abaixo
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ---------------------------------------------------------------------
-- 1. Perfis
-- "codigo" é o identificador estável gravado em funcionario.perfil e no
-- token da API; "nome" é o texto exibido ao usuário.
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS perfil (
    codigo  VARCHAR(20) PRIMARY KEY,
    nome    VARCHAR(50) NOT NULL UNIQUE
);

INSERT INTO perfil (codigo, nome) VALUES
    ('ADMINISTRADOR', 'Administrador'),
    ('FUNCIONARIO',   'Funcionário')
ON CONFLICT (codigo) DO NOTHING;

-- ---------------------------------------------------------------------
-- 2. Integridade do perfil do funcionário
-- Garante a coluna em bancos que ainda não passaram pelo 05; quem já
-- existia vira FUNCIONARIO (o perfil de menor privilégio).
-- ---------------------------------------------------------------------
ALTER TABLE funcionario ADD COLUMN IF NOT EXISTS perfil VARCHAR(20) NOT NULL DEFAULT 'FUNCIONARIO';

-- As listas fixas de perfis (CHECK) dão lugar à chave estrangeira
ALTER TABLE funcionario DROP CONSTRAINT IF EXISTS chk_funcionario_perfil;
ALTER TABLE funcionario DROP CONSTRAINT IF EXISTS funcionario_perfil_check;

ALTER TABLE funcionario DROP CONSTRAINT IF EXISTS funcionario_perfil_fkey;
ALTER TABLE funcionario ADD CONSTRAINT funcionario_perfil_fkey
    FOREIGN KEY (perfil) REFERENCES perfil(codigo);

CREATE INDEX IF NOT EXISTS idx_funcionario_perfil ON funcionario(perfil);

-- ---------------------------------------------------------------------
-- 3. Senha sempre em hash BCrypt
-- 3.1 Converte em hash todo valor que não tem formato de hash BCrypt
--     (senha em texto puro). A senha continua a mesma, só passa a ser
--     guardada em hash.
-- 3.2 Impede, no próprio banco, que um texto puro volte a ser gravado.
-- Formato BCrypt: $2a$/$2b$/$2y$ + custo de 2 dígitos + $ + 53 caracteres.
-- ---------------------------------------------------------------------
UPDATE funcionario
SET senha_hash = crypt(senha_hash, gen_salt('bf', 10))
WHERE senha_hash !~ '^\$2[aby]\$[0-9]{2}\$[./A-Za-z0-9]{53}$';

ALTER TABLE funcionario DROP CONSTRAINT IF EXISTS funcionario_senha_hash_bcrypt_chk;
ALTER TABLE funcionario ADD CONSTRAINT funcionario_senha_hash_bcrypt_chk
    CHECK (senha_hash ~ '^\$2[aby]\$[0-9]{2}\$[./A-Za-z0-9]{53}$');
