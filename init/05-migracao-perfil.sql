-- =====================================================================
-- Migração incremental: Adiciona coluna perfil para bancos existentes
-- =====================================================================
ALTER TABLE funcionario ADD COLUMN IF NOT EXISTS perfil VARCHAR(20) NOT NULL DEFAULT 'FUNCIONARIO';
ALTER TABLE funcionario DROP CONSTRAINT IF EXISTS chk_funcionario_perfil;
ALTER TABLE funcionario ADD CONSTRAINT chk_funcionario_perfil CHECK (perfil IN ('ADMINISTRADOR', 'FUNCIONARIO'));
UPDATE funcionario SET perfil = 'ADMINISTRADOR' WHERE id = 1;

