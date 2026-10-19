# Valida o setup do banco: criacao pelos scripts de init/ e persistencia no volume.
#
# Uso (PowerShell, na raiz do repositorio):
#   powershell -ExecutionPolicy Bypass -File scripts\validar-banco.ps1
#   powershell -ExecutionPolicy Bypass -File scripts\validar-banco.ps1 -ComposeFile docker-compose.prod.yml
#
# ATENCAO: usa "down -v" e APAGA os dados do volume do banco (o seed recria).
# Ao final, so o servico "db" fica no ar.

param([string]$ComposeFile = "docker-compose.yml")

$script:falhas = 0

function Compose {
    docker compose -f $ComposeFile @args
}

# Executa uma consulta no banco e devolve a saida sem formatacao
function Sql($consulta) {
    $saida = Compose exec -T db psql -U grafica_user -d grafica -t -A -c $consulta 2>$null
    return ("$saida").Trim()
}

# Espera o banco aceitar conexoes TCP (o servidor temporario da inicializacao
# so escuta em socket local, entao -h 127.0.0.1 garante que os scripts de init terminaram)
function EsperarBanco {
    for ($i = 0; $i -lt 40; $i++) {
        Compose exec -T db pg_isready -h 127.0.0.1 -U grafica_user -d grafica *> $null
        if ($LASTEXITCODE -eq 0) { return }
        Start-Sleep -Seconds 2
    }
    throw "O banco nao ficou pronto a tempo."
}

function Checar($nome, $ok) {
    if ($ok) {
        Write-Host "OK     - $nome" -ForegroundColor Green
    } else {
        Write-Host "FALHOU - $nome" -ForegroundColor Red
        $script:falhas++
    }
}

Write-Host ""
Write-Host "Arquivo compose: $ComposeFile"
Write-Host ""

# ---------------------------------------------------------------
Write-Host "1/4 Criando o banco do zero (down -v + up): schema e seed" -ForegroundColor Cyan
Compose down -v *> $null
Compose up -d db *> $null
EsperarBanco

$tabelas = Sql "SELECT count(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE'"
Checar "schema criado pelos scripts de init (7 tabelas)" ($tabelas -eq "7")

$seed = Sql "SELECT concat_ws(',', (SELECT count(*) FROM funcionario), (SELECT count(*) FROM cliente), (SELECT count(*) FROM material), (SELECT count(*) FROM servico), (SELECT count(*) FROM item_composicao), (SELECT count(*) FROM orcamento), (SELECT count(*) FROM atividade))"
Checar "seed carregado (10 registros em cada tabela)" ($seed -eq "10,10,10,10,10,10,10")

$unique = Sql "SELECT count(*) FROM pg_constraint WHERE conname IN ('material_nome_key', 'cliente_email_key')"
Checar "restricoes UNIQUE existem (material.nome e cliente.email)" ($unique -eq "2")

$custo = Sql "SELECT custo_total FROM orcamento WHERE id = 1"
Checar "script 04 recalculou o custo do orcamento 1 (54.00)" ($custo -eq "54.00")

# ---------------------------------------------------------------
Write-Host ""
Write-Host "2/4 Gravando um dado e reiniciando o container (restart)" -ForegroundColor Cyan
Sql "INSERT INTO material (nome, unidade_medida, custo) VALUES ('MARCADOR-VOLUME', 'un', 1)" | Out-Null
Compose restart db *> $null
EsperarBanco
$marcador = Sql "SELECT count(*) FROM material WHERE nome = 'MARCADOR-VOLUME'"
Checar "dado gravado sobrevive ao restart do container" ($marcador -eq "1")

# ---------------------------------------------------------------
Write-Host ""
Write-Host "3/4 Derrubando e subindo de novo SEM apagar o volume (down + up)" -ForegroundColor Cyan
Compose down *> $null
Compose up -d db *> $null
EsperarBanco
$marcador = Sql "SELECT count(*) FROM material WHERE nome = 'MARCADOR-VOLUME'"
Checar "dado gravado sobrevive a down/up (volume persistente)" ($marcador -eq "1")
$materiais = Sql "SELECT count(*) FROM material"
Checar "scripts de init nao rodam de novo (10 do seed + 1 marcador = 11)" ($materiais -eq "11")

# ---------------------------------------------------------------
Write-Host ""
Write-Host "4/4 Apagando o volume (down -v) e recriando" -ForegroundColor Cyan
Compose down -v *> $null
Compose up -d db *> $null
EsperarBanco
$marcador = Sql "SELECT count(*) FROM material WHERE nome = 'MARCADOR-VOLUME'"
Checar "down -v apaga o volume (marcador sumiu)" ($marcador -eq "0")
$materiais = Sql "SELECT count(*) FROM material"
Checar "banco recriado do zero com o seed (10 materiais)" ($materiais -eq "10")

# ---------------------------------------------------------------
Write-Host ""
if ($script:falhas -gt 0) {
    Write-Host "RESULTADO: $($script:falhas) verificacao(oes) FALHARAM" -ForegroundColor Red
    exit 1
}
Write-Host "RESULTADO: todas as verificacoes passaram" -ForegroundColor Green
exit 0
