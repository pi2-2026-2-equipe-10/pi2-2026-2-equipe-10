-- =====================================================================
-- Recalcula o custo_total dos orçamentos do seed (02-seed.sql) com as
-- mesmas regras da API, para que os valores gravados batam com o que
-- POST /orcamentos/calcular devolve.
--   RN-03 (METRAGEM):   largura x altura x custo do material
--   RN-01 (COMPOSICAO): soma(quantidade x custo do material)
--                       + tempo de operação x custo por hora
-- Rascunhos não têm custo calculado e ficam como estão.
-- =====================================================================

UPDATE orcamento o
SET custo_total = ROUND(o.largura * o.altura * m.custo, 2)
FROM servico s
JOIN material m ON m.id = s.material_id
WHERE o.servico_id = s.id
  AND s.tipo_calculo = 'METRAGEM'
  AND o.rascunho = FALSE;

UPDATE orcamento o
SET custo_total = ROUND(
      COALESCE((SELECT SUM(ic.quantidade * m.custo)
                FROM item_composicao ic
                JOIN material m ON m.id = ic.material_id
                WHERE ic.servico_id = s.id), 0)
    + COALESCE(s.tempo_operacao_horas * s.custo_hora_operacao, 0), 2)
FROM servico s
WHERE o.servico_id = s.id
  AND s.tipo_calculo = 'COMPOSICAO'
  AND o.rascunho = FALSE;
