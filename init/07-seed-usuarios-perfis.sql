-- =====================================================================
-- Seed de usuários por perfil, para a equipe e o professor testarem.
-- Roda depois da migração 06 (perfis).
--
--   id 1  Ana Beatriz Souza    ADMINISTRADOR
--   id 2  Carlos Eduardo Lima  FUNCIONARIO
--   ids 3 a 10 (02-seed.sql)   FUNCIONARIO; os ids 7 e 9 estão inativos
--
-- Senha de demonstração de TODOS os usuários do seed (ids 1 a 10): 123456
-- (só o hash BCrypt está aqui e no banco; o texto da senha não é gravado
-- em lugar nenhum). Arquivo só para banco de demonstração: não o aplique
-- em um banco com usuários reais.
-- =====================================================================

-- Hash BCrypt (custo 10) da senha de demonstração, igual para os 10 do seed
UPDATE funcionario
SET senha_hash = '$2a$10$mvn1GQqMwLMClr7wK3Fi9.rwAxw89HcC6qoGFJ6ZNPfyQI6BfnTyy'
WHERE id BETWEEN 1 AND 10;

-- Um usuário de cada perfil
UPDATE funcionario SET perfil = 'ADMINISTRADOR' WHERE id = 1;
UPDATE funcionario SET perfil = 'FUNCIONARIO'   WHERE id = 2;
