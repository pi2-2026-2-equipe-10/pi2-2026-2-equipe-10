-- =====================================================================
-- Testes de rejeição — FK, unicidade e demais restrições do schema
--
-- Tudo roda dentro de uma transação que termina em ROLLBACK: nada fica
-- gravado no banco. Cada teste PASSA quando o banco REJEITA o dado
-- inválido; se o dado for aceito, o teste é marcado como FALHOU.
-- Os testes P01 e P02 são controles: dados válidos que DEVEM ser aceitos.
--
-- Como rodar (PowerShell, na raiz do repositório, com o container no ar):
--   docker cp backend\testes\testes-rejeicao.sql grafica_db:/tmp/testes-rejeicao.sql
--   docker exec grafica_db psql -U grafica_user -d grafica -v ON_ERROR_STOP=1 -f /tmp/testes-rejeicao.sql
--
-- Obs.: as sequences (SERIAL) avançam mesmo com o ROLLBACK; é inofensivo.
-- =====================================================================

BEGIN;

DO $$
DECLARE
  v_cliente  INTEGER;
  v_material INTEGER;
  v_servico  INTEGER;
  v_falhas   INTEGER := 0;
  v_c        TEXT;
BEGIN
  -- Dados-base válidos usados pelos testes
  INSERT INTO cliente (nome, email)
    VALUES ('Cliente Base (teste)', 'teste-rejeicao@grafica.com')
    RETURNING id INTO v_cliente;
  INSERT INTO material (nome, unidade_medida, custo)
    VALUES ('Material Base (teste)', 'm2', 25.00)
    RETURNING id INTO v_material;
  INSERT INTO servico (nome, tipo_calculo, material_id)
    VALUES ('Servico Base (teste)', 'METRAGEM', v_material)
    RETURNING id INTO v_servico;

  -- ===================================================================
  -- UNICIDADE
  -- ===================================================================

  -- T01: material com nome duplicado
  BEGIN
    INSERT INTO material (nome, unidade_medida, custo)
      VALUES ('Material Base (teste)', 'm2', 30.00);
    v_falhas := v_falhas + 1;
    RAISE NOTICE 'T01 FALHOU - nome de material duplicado foi ACEITO';
  EXCEPTION WHEN unique_violation THEN
    GET STACKED DIAGNOSTICS v_c = CONSTRAINT_NAME;
    RAISE NOTICE 'T01 OK     - rejeitado por %', v_c;
  END;

  -- T02: cliente com e-mail duplicado
  BEGIN
    INSERT INTO cliente (nome, email)
      VALUES ('Outro Cliente (teste)', 'teste-rejeicao@grafica.com');
    v_falhas := v_falhas + 1;
    RAISE NOTICE 'T02 FALHOU - e-mail de cliente duplicado foi ACEITO';
  EXCEPTION WHEN unique_violation THEN
    GET STACKED DIAGNOSTICS v_c = CONSTRAINT_NAME;
    RAISE NOTICE 'T02 OK     - rejeitado por %', v_c;
  END;

  -- ===================================================================
  -- CHAVES ESTRANGEIRAS (id -1 nunca existe: SERIAL começa em 1)
  -- ===================================================================

  -- T03: servico.material_id inexistente
  BEGIN
    INSERT INTO servico (nome, tipo_calculo, material_id)
      VALUES ('Servico FK invalida', 'METRAGEM', -1);
    v_falhas := v_falhas + 1;
    RAISE NOTICE 'T03 FALHOU - servico com material inexistente foi ACEITO';
  EXCEPTION WHEN foreign_key_violation THEN
    GET STACKED DIAGNOSTICS v_c = CONSTRAINT_NAME;
    RAISE NOTICE 'T03 OK     - rejeitado por %', v_c;
  END;

  -- T04: item_composicao.servico_id inexistente
  BEGIN
    INSERT INTO item_composicao (servico_id, material_id, quantidade)
      VALUES (-1, v_material, 2.0);
    v_falhas := v_falhas + 1;
    RAISE NOTICE 'T04 FALHOU - item de composicao com servico inexistente foi ACEITO';
  EXCEPTION WHEN foreign_key_violation THEN
    GET STACKED DIAGNOSTICS v_c = CONSTRAINT_NAME;
    RAISE NOTICE 'T04 OK     - rejeitado por %', v_c;
  END;

  -- T05: item_composicao.material_id inexistente
  BEGIN
    INSERT INTO item_composicao (servico_id, material_id, quantidade)
      VALUES (v_servico, -1, 2.0);
    v_falhas := v_falhas + 1;
    RAISE NOTICE 'T05 FALHOU - item de composicao com material inexistente foi ACEITO';
  EXCEPTION WHEN foreign_key_violation THEN
    GET STACKED DIAGNOSTICS v_c = CONSTRAINT_NAME;
    RAISE NOTICE 'T05 OK     - rejeitado por %', v_c;
  END;

  -- T06: orcamento.cliente_id inexistente
  BEGIN
    INSERT INTO orcamento (cliente_id, servico_id, rascunho)
      VALUES (-1, v_servico, FALSE);
    v_falhas := v_falhas + 1;
    RAISE NOTICE 'T06 FALHOU - orcamento com cliente inexistente foi ACEITO';
  EXCEPTION WHEN foreign_key_violation THEN
    GET STACKED DIAGNOSTICS v_c = CONSTRAINT_NAME;
    RAISE NOTICE 'T06 OK     - rejeitado por %', v_c;
  END;

  -- T07: orcamento.servico_id inexistente
  BEGIN
    INSERT INTO orcamento (cliente_id, servico_id, rascunho)
      VALUES (v_cliente, -1, FALSE);
    v_falhas := v_falhas + 1;
    RAISE NOTICE 'T07 FALHOU - orcamento com servico inexistente foi ACEITO';
  EXCEPTION WHEN foreign_key_violation THEN
    GET STACKED DIAGNOSTICS v_c = CONSTRAINT_NAME;
    RAISE NOTICE 'T07 OK     - rejeitado por %', v_c;
  END;

  -- T08: apagar material que está em uso por um servico
  BEGIN
    DELETE FROM material WHERE id = v_material;
    v_falhas := v_falhas + 1;
    RAISE NOTICE 'T08 FALHOU - material em uso foi APAGADO';
  EXCEPTION WHEN foreign_key_violation THEN
    GET STACKED DIAGNOSTICS v_c = CONSTRAINT_NAME;
    RAISE NOTICE 'T08 OK     - rejeitado por %', v_c;
  END;

  -- ===================================================================
  -- OUTRAS RESTRICOES (CHECK, NOT NULL, ENUM)
  -- ===================================================================

  -- T09: custo de material negativo
  BEGIN
    INSERT INTO material (nome, unidade_medida, custo)
      VALUES ('Material custo negativo', 'm2', -5.00);
    v_falhas := v_falhas + 1;
    RAISE NOTICE 'T09 FALHOU - custo negativo foi ACEITO';
  EXCEPTION WHEN check_violation THEN
    GET STACKED DIAGNOSTICS v_c = CONSTRAINT_NAME;
    RAISE NOTICE 'T09 OK     - rejeitado por %', v_c;
  END;

  -- T10: quantidade zero na composicao (RN-02)
  BEGIN
    INSERT INTO item_composicao (servico_id, material_id, quantidade)
      VALUES (v_servico, v_material, 0);
    v_falhas := v_falhas + 1;
    RAISE NOTICE 'T10 FALHOU - quantidade zero foi ACEITA';
  EXCEPTION WHEN check_violation THEN
    GET STACKED DIAGNOSTICS v_c = CONSTRAINT_NAME;
    RAISE NOTICE 'T10 OK     - rejeitado por %', v_c;
  END;

  -- T11: orcamento registrado (nao rascunho) sem servico
  BEGIN
    INSERT INTO orcamento (cliente_id, servico_id, rascunho)
      VALUES (v_cliente, NULL, FALSE);
    v_falhas := v_falhas + 1;
    RAISE NOTICE 'T11 FALHOU - orcamento registrado sem servico foi ACEITO';
  EXCEPTION WHEN check_violation THEN
    GET STACKED DIAGNOSTICS v_c = CONSTRAINT_NAME;
    RAISE NOTICE 'T11 OK     - rejeitado por %', v_c;
  END;

  -- T12: largura negativa no orcamento
  BEGIN
    INSERT INTO orcamento (cliente_id, servico_id, largura, rascunho)
      VALUES (v_cliente, v_servico, -1.00, FALSE);
    v_falhas := v_falhas + 1;
    RAISE NOTICE 'T12 FALHOU - largura negativa foi ACEITA';
  EXCEPTION WHEN check_violation THEN
    GET STACKED DIAGNOSTICS v_c = CONSTRAINT_NAME;
    RAISE NOTICE 'T12 OK     - rejeitado por %', v_c;
  END;

  -- T13: tipo_calculo fora do ENUM
  BEGIN
    INSERT INTO servico (nome, tipo_calculo)
      VALUES ('Servico tipo invalido', 'INEXISTENTE');
    v_falhas := v_falhas + 1;
    RAISE NOTICE 'T13 FALHOU - tipo_calculo invalido foi ACEITO';
  EXCEPTION WHEN invalid_text_representation THEN
    RAISE NOTICE 'T13 OK     - rejeitado por tipo_calculo_enum';
  END;

  -- T14: material sem nome
  BEGIN
    INSERT INTO material (nome, unidade_medida, custo)
      VALUES (NULL, 'm2', 10.00);
    v_falhas := v_falhas + 1;
    RAISE NOTICE 'T14 FALHOU - material sem nome foi ACEITO';
  EXCEPTION WHEN not_null_violation THEN
    RAISE NOTICE 'T14 OK     - rejeitado por NOT NULL em material.nome';
  END;

  -- ===================================================================
  -- CONTROLES: dados validos que DEVEM ser aceitos
  -- ===================================================================

  -- P01: orcamento registrado sem cliente (RN-04)
  BEGIN
    INSERT INTO orcamento (cliente_id, servico_id, rascunho)
      VALUES (NULL, v_servico, FALSE);
    RAISE NOTICE 'P01 OK     - aceito: orcamento sem cliente (RN-04)';
  EXCEPTION WHEN OTHERS THEN
    v_falhas := v_falhas + 1;
    RAISE NOTICE 'P01 FALHOU - orcamento sem cliente foi rejeitado: %', SQLERRM;
  END;

  -- P02: rascunho sem cliente e sem servico
  BEGIN
    INSERT INTO orcamento (cliente_id, servico_id, rascunho)
      VALUES (NULL, NULL, TRUE);
    RAISE NOTICE 'P02 OK     - aceito: rascunho sem cliente e sem servico';
  EXCEPTION WHEN OTHERS THEN
    v_falhas := v_falhas + 1;
    RAISE NOTICE 'P02 FALHOU - rascunho foi rejeitado: %', SQLERRM;
  END;

  -- ===================================================================
  IF v_falhas > 0 THEN
    RAISE EXCEPTION 'RESULTADO: % teste(s) FALHARAM', v_falhas;
  END IF;
  RAISE NOTICE 'RESULTADO: todos os testes passaram';
END
$$;

ROLLBACK;
