#!/bin/bash
# Script de instalação do DevTools CLI

set -e  # Sai em caso de erro

echo "🛠️ Instalador do DevTools CLI"
echo "============================="

# Verifica se Python está instalado
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 não encontrado. Instale Python 3.7+ primeiro."
    exit 1
fi

# Verifica versão do Python
python_version=$(python3 -c 'import sys; print(".".join(map(str, sys.version_info[:2])))')
required_version="3.7"

if [ "$(printf '%s\n' "$required_version" "$python_version" | sort -V | head -n1)" != "$required_version" ]; then
    echo "❌ Python $python_version encontrado. Requer Python $required_version ou superior."
    exit 1
fi

echo "✅ Python $python_version detectado"

# Verifica se pip está instalado
if ! command -v pip3 &> /dev/null; then
    echo "❌ pip3 não encontrado. Instale pip primeiro."
    exit 1
fi

echo "✅ pip3 encontrado"

# Cria ambiente virtual (opcional)
read -p "🤔 Deseja instalar em um ambiente virtual? (recomendado) [s/N]: " use_venv
if [[ $use_venv =~ ^[Ss]$ ]]; then
    echo "📦 Criando ambiente virtual..."
    python3 -m venv devtools-env
    source devtools-env/bin/activate
    echo "✅ Ambiente virtual ativado"
fi

# Atualiza pip
echo "📦 Atualizando pip..."
pip install --upgrade pip

# Instala dependências
echo "📦 Instalando dependências..."
pip install -r requirements.txt

# Instala o pacote
echo "📦 Instalando DevTools CLI..."
pip install -e .

# Verifica instalação
if command -v devtools &> /dev/null; then
    echo "✅ DevTools CLI instalado com sucesso!"
    echo
    echo "🎉 Instalação concluída!"
    echo
    echo "📖 Comandos básicos:"
    echo "   devtools --help          # Ajuda geral"
    echo "   devtools file list       # Lista arquivos"
    echo "   devtools password        # Gera senha"
    echo "   devtools calc '2+2'      # Calculadora"
    echo
    echo "📚 Veja mais exemplos em: examples/"
    echo "📖 Documentação completa: README.md"
    
    if [[ $use_venv =~ ^[Ss]$ ]]; then
        echo
        echo "💡 Para usar o DevTools CLI:"
        echo "   source devtools-env/bin/activate"
        echo "   devtools --help"
    fi
else
    echo "❌ Erro na instalação. Verifique as mensagens acima."
    exit 1
fi