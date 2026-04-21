# Copie para "supabase.credentials.ps1" e preencha (o ficheiro real está no .gitignore).
#
# 1) Project ref = 20 letras do subdomínio (NÃO a URL completa)
#    Ex.: em https://abcdefgh.supabase.co  ->  SupabaseProjectRef = "abcdefgh..."
#
# 2) Access token = Personal Access Token da CONTA (começa com sbp_)
#    NÃO use anon key, publishable key nem JWT (eyJ...).
#    Criar em: https://supabase.com/dashboard/account/tokens

$SupabaseProjectRef = "auhwylnhqmdgphsvjszr"
$SupabaseAccessToken = "sbp_COLE_AQUI_O_TOKEN_DA_CONTA"

$SupabaseSkipLogin = $true
