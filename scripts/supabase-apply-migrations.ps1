param(
  [string]$ProjectRef = "",
  [string]$AccessToken = "",
  [switch]$SkipLogin,
  [string]$CredentialsFile = ""
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

function Get-VariableValueOrDefault {
  param(
    [Parameter(Mandatory = $true)]
    [string]$Name,
    [object]$Default = $null
  )
  $v = Get-Variable -Name $Name -Scope Script -ErrorAction SilentlyContinue
  if ($null -eq $v) { return $Default }
  return $v.Value
}

function Run-Step {
  param(
    [Parameter(Mandatory = $true)]
    [string]$Title,
    [Parameter(Mandatory = $true)]
    [scriptblock]$Action
  )

  Write-Host ""
  Write-Host "=== $Title ===" -ForegroundColor Cyan
  & $Action
}

function Invoke-SupabaseCli {
  [CmdletBinding()]
  param(
    [Parameter(ValueFromRemainingArguments = $true)]
    [object[]]$CliArgs
  )
  $cmd = Get-Command supabase -ErrorAction SilentlyContinue
  if ($cmd) {
    & supabase @CliArgs
  } else {
    Write-Host "(fallback) usando npx supabase@latest" -ForegroundColor DarkGray
    & npx --yes supabase@latest @CliArgs
  }
  if ($LASTEXITCODE -ne 0) {
    throw "Comando supabase falhou (codigo $LASTEXITCODE)."
  }
}

$root = Split-Path -Parent $PSScriptRoot
$configPath = Join-Path $root "supabase\config.toml"
$verifySqlPath = Join-Path $PSScriptRoot "supabase-verify-display-migrations.sql"
if ([string]::IsNullOrWhiteSpace($CredentialsFile)) {
  $CredentialsFile = Join-Path $PSScriptRoot "supabase.credentials.ps1"
}

if (Test-Path $CredentialsFile) {
  Write-Host "Carregando credenciais de: $CredentialsFile" -ForegroundColor DarkCyan
  . $CredentialsFile
  if ([string]::IsNullOrWhiteSpace($ProjectRef)) {
    $ProjectRef = [string](Get-VariableValueOrDefault -Name "SupabaseProjectRef" -Default "")
  }
  if ([string]::IsNullOrWhiteSpace($AccessToken)) {
    $AccessToken = [string](Get-VariableValueOrDefault -Name "SupabaseAccessToken" -Default "")
  }
  if (-not $SkipLogin) {
    $skipFromFile = Get-VariableValueOrDefault -Name "SupabaseSkipLogin" -Default $false
    if ($skipFromFile -eq $true) { $SkipLogin = $true }
  }
} else {
  Write-Host "Arquivo de credenciais nao encontrado: $CredentialsFile" -ForegroundColor Yellow
  Write-Host "Use scripts/supabase.credentials.example.ps1 como modelo." -ForegroundColor Yellow
}

if ([string]::IsNullOrWhiteSpace($ProjectRef)) {
  throw "ProjectRef ausente. Defina em $CredentialsFile (`$SupabaseProjectRef) ou passe -ProjectRef."
}
if ($ProjectRef -match "^(COLE_|SEU_)") {
  throw "ProjectRef invalido (`"$ProjectRef`"). Edite scripts/supabase.credentials.ps1 com o project ref real do Supabase (20 letras)."
}

Run-Step -Title "Validando Supabase CLI" -Action {
  Invoke-SupabaseCli --version
}

if (-not [string]::IsNullOrWhiteSpace($AccessToken)) {
  Run-Step -Title "Configurando token de acesso (nao interativo)" -Action {
    $env:SUPABASE_ACCESS_TOKEN = $AccessToken
    Write-Host "SUPABASE_ACCESS_TOKEN carregado a partir das credenciais."
  }
} elseif (-not $SkipLogin) {
  Run-Step -Title "Login no Supabase (interativo)" -Action { Invoke-SupabaseCli login }
}

Run-Step -Title "Atualizando supabase/config.toml com project_id" -Action {
  if (-not (Test-Path $configPath)) {
    throw "Arquivo nao encontrado: $configPath"
  }

  $configRaw = Get-Content -Path $configPath -Raw
  $newRaw = [regex]::Replace($configRaw, 'project_id\s*=\s*".*?"', "project_id = `"$ProjectRef`"")
  if ($newRaw -eq $configRaw) {
    Write-Host "project_id nao encontrado no config.toml; nenhum ajuste automatico aplicado." -ForegroundColor Yellow
  } else {
    Set-Content -Path $configPath -Value $newRaw -Encoding UTF8
    Write-Host "project_id atualizado para $ProjectRef"
  }
}

Run-Step -Title "Vinculando projeto remoto (supabase link)" -Action {
  Invoke-SupabaseCli link --project-ref $ProjectRef
}

Run-Step -Title "Listando migracoes (local x remoto)" -Action {
  Invoke-SupabaseCli migration list
}

Run-Step -Title "Aplicando migracoes no remoto (supabase db push)" -Action {
  Invoke-SupabaseCli db push
}

Write-Host ""
Write-Host "Migracoes aplicadas com sucesso." -ForegroundColor Green
Write-Host "Proximo passo: executar o SQL de verificacao em:"
Write-Host "  $verifySqlPath"
Write-Host ""
Write-Host "Exemplo de execucao:"
Write-Host "  .\scripts\supabase-apply-migrations.ps1"
