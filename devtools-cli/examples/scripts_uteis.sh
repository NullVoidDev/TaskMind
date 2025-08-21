#!/bin/bash
# Scripts úteis usando DevTools CLI

echo "🛠️ Exemplos de Scripts com DevTools CLI"
echo "========================================"

# Backup automático
echo "📁 Exemplo 1: Backup Automático"
echo "devtools file copy ~/documentos ~/backup/docs-\$(date +%Y%m%d) --recursive"
echo

# Limpeza de sistema
echo "🧹 Exemplo 2: Limpeza de Sistema"
echo "devtools file list /tmp --long | grep -E '\.tmp$|\.cache$'"
echo "# devtools file delete /tmp/*.tmp --force"
echo

# Monitoramento de espaço
echo "💾 Exemplo 3: Verificação de Espaço em Disco"
echo "devtools file list / --long | head -20"
echo

# Geração de senhas para equipe
echo "🔐 Exemplo 4: Senhas para Equipe"
echo "devtools password --count 10 --length 16 > senhas_equipe.txt"
echo "devtools password --memorable --count 5 >> senhas_faceis.txt"
echo

# Conversões úteis
echo "🔄 Exemplo 5: Conversões Comuns"
echo "devtools convert 1000000 bytes mb"
echo "devtools convert 2.5 hours minutes"
echo "devtools convert 100 usd brl"
echo

# Cálculos rápidos
echo "🧮 Exemplo 6: Cálculos Úteis"
echo "devtools calc 'sqrt(144) + log10(1000)'"
echo "devtools calc --stats 85,90,78,92,88,76,94,89"
echo

# Download de conteúdo educacional
echo "📺 Exemplo 7: Downloads Organizados"
echo "mkdir -p ~/Downloads/cursos/python"
echo "devtools download 'URL_DO_VIDEO' --output ~/Downloads/cursos/python/"
echo

# Organização de arquivos por extensão
echo "📂 Exemplo 8: Script de Organização"
echo "# Organiza arquivos por extensão"
echo "for ext in pdf txt doc docx jpg png; do"
echo "  mkdir -p ~/Downloads/\$ext"
echo "  devtools file move ~/Downloads/*.\$ext ~/Downloads/\$ext/ 2>/dev/null || true"
echo "done"
echo

echo "💡 Dica: Salve estes comandos em scripts para automação!"
echo "💡 Use 'devtools --help' para ver todas as opções disponíveis"