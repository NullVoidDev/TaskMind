# 🛠️ DevTools CLI

Uma ferramenta de linha de comando multiuso em Python que oferece utilidades diversas para desenvolvedores e usuários avançados.

[![Python Version](https://img.shields.io/badge/python-3.7+-blue.svg)](https://python.org)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Version](https://img.shields.io/badge/version-1.0.0-orange.svg)](#)

## 🚀 Funcionalidades

- **📁 Gerenciador de Arquivos**: Copiar, mover, renomear, apagar e listar arquivos e pastas
- **🔄 Conversor de Unidades**: Tempo, tamanho, temperatura e moeda (com integração de API)
- **📺 Downloader de Vídeos**: Baixar vídeos do YouTube, Vimeo e outras plataformas
- **🔐 Gerador de Senhas**: Senhas seguras e códigos aleatórios personalizáveis
- **🧮 Calculadora**: Operações básicas, avançadas e científicas
- **🔌 Sistema de Plugins**: Extensibilidade para comandos personalizados
- **⚙️ Configuração**: Arquivo `.config` para preferências do usuário
- **🎨 Interface Rica**: Cores e formatação no terminal para melhor UX

## 📦 Instalação

### Via pip (Recomendado)

```bash
pip install devtools-cli
```

### Via código fonte

```bash
git clone https://github.com/devtools-cli/devtools-cli.git
cd devtools-cli
pip install -e .
```

### Dependências opcionais

Para download de vídeos:
```bash
pip install yt-dlp
```

## 🎯 Uso Básico

```bash
# Exibe ajuda geral
devtools --help

# Lista arquivos do diretório atual
devtools file list

# Converte unidades
devtools convert 1024 bytes mb

# Gera senha segura
devtools password --length 20

# Calcula expressão matemática
devtools calc "2 + 2 * 3"

# Baixa vídeo do YouTube
devtools download https://youtube.com/watch?v=...
```

## 📖 Comandos Detalhados

### 📁 Gerenciador de Arquivos

```bash
# Listar arquivos
devtools file list [pasta] [--all] [--long]
devtools file list /home/user --all --long

# Copiar arquivos/pastas
devtools file copy origem destino [--recursive]
devtools file copy arquivo.txt backup/
devtools file copy pasta/ backup/ --recursive

# Mover arquivos/pastas
devtools file move origem destino
devtools file move arquivo.txt nova_pasta/

# Renomear
devtools file rename nome_antigo nome_novo
devtools file rename arquivo.txt documento.txt

# Apagar arquivos/pastas
devtools file delete arquivo1 pasta2 [--force] [--recursive]
devtools file delete lixo.txt --force
devtools file delete pasta_vazia/ --recursive
```

### 🔄 Conversor de Unidades

```bash
# Conversão automática (detecta tipo)
devtools convert 1024 bytes mb
devtools convert 60 minutes hours
devtools convert 32 fahrenheit celsius

# Conversão com tipo específico
devtools convert 1.5 hours minutes --type time
devtools convert 100 usd brl --type currency

# Tipos suportados: size, time, temperature, currency
```

**Unidades de Tamanho**: bytes, kb, mb, gb, tb, pb
**Unidades de Tempo**: ms, seconds, minutes, hours, days, weeks, months, years
**Temperatura**: celsius, fahrenheit, kelvin
**Moeda**: Códigos ISO (USD, EUR, BRL, etc.) - requer API key

### 📺 Downloader de Vídeos

```bash
# Download básico
devtools download https://youtube.com/watch?v=VIDEO_ID

# Download com pasta específica
devtools download URL --output ~/Downloads/videos/

# Download apenas áudio
devtools download URL --audio-only

# Download com formato específico
devtools download URL --format "best[height<=720]"

# Obter informações do vídeo
devtools download --info URL

# Listar formatos disponíveis
devtools download --list-formats URL
```

### 🔐 Gerador de Senhas

```bash
# Senha padrão (16 caracteres)
devtools password

# Senha personalizada
devtools password --length 32 --no-symbols

# Múltiplas senhas
devtools password --count 5 --length 12

# PIN numérico
devtools password --pin --length 6

# Código hexadecimal
devtools password --hex --length 32

# UUID
devtools password --uuid

# Senha memorável
devtools password --memorable --words 4
```

### 🧮 Calculadora

```bash
# Operações básicas
devtools calc "2 + 3 * 4"
devtools calc "(10 + 5) / 3"

# Funções matemáticas
devtools calc "sqrt(16) + log(100)"
devtools calc "sin(pi/2) + cos(0)"

# Constantes
devtools calc "pi * e^2"

# Precisão personalizada
devtools calc "1/3" --precision 10

# Usar graus em vez de radianos
devtools calc "sin(90)" --degrees

# Estatísticas
devtools calc --stats 1,2,3,4,5,6,7,8,9,10

# Equação quadrática
devtools calc --quadratic 1 -5 6  # x² - 5x + 6 = 0

# Conversão de base
devtools calc --base-convert 255 10 16  # 255 decimal para hex
```

### ⚙️ Configuração

```bash
# Listar todas as configurações
devtools config list

# Obter valor específico
devtools config get general use_colors

# Definir valor
devtools config set general default_download_path ~/Downloads

# Configurações principais:
devtools config set general use_colors true
devtools config set password default_length 20
devtools config set currency api_key SUA_CHAVE_API
```

### 🔌 Sistema de Plugins

```bash
# Listar plugins instalados
devtools plugin list

# Instalar plugin
devtools plugin install meu_plugin.py

# Remover plugin
devtools plugin remove meu_plugin

# Criar template de plugin
devtools plugin create exemplo

# Executar plugin
devtools meu_plugin [argumentos]
```

## 🔧 Configuração Avançada

O DevTools CLI cria automaticamente um arquivo de configuração em `~/.devtools/config.ini`:

```ini
[general]
default_download_path = /home/user/Downloads
use_colors = true
confirm_deletions = true

[password]
default_length = 16
include_symbols = true
include_numbers = true
include_uppercase = true
include_lowercase = true

[calculator]
precision = 10
angle_unit = radians

[currency]
api_key = 
default_base = USD
cache_duration = 3600
```

## 🔌 Criando Plugins

Crie um arquivo Python com a seguinte estrutura:

```python
class DevToolsPlugin:
    def get_name(self):
        return "meu_plugin"
    
    def get_description(self):
        return "Descrição do meu plugin"
    
    def get_version(self):
        return "1.0.0"
    
    def execute(self, args):
        print("Meu plugin executado!")
        return True
```

Instale o plugin:
```bash
devtools plugin install meu_plugin.py
```

Execute:
```bash
devtools meu_plugin
```

## 🌐 API de Moedas

Para conversão de moedas, obtenha uma chave gratuita em [ExchangeRate-API](https://exchangerate-api.com/) e configure:

```bash
devtools config set currency api_key SUA_CHAVE_API
```

## 📋 Exemplos Práticos

### Backup de Arquivos
```bash
# Cria backup de pasta importante
devtools file copy ~/documentos ~/backup/documentos-$(date +%Y%m%d) --recursive
```

### Limpeza de Sistema
```bash
# Lista arquivos temporários
devtools file list /tmp --long

# Remove arquivos antigos (com confirmação)
devtools file delete /tmp/arquivo_antigo.tmp
```

### Análise de Dados
```bash
# Calcula estatísticas de uma série de números
devtools calc --stats 10,20,30,40,50,60,70,80,90,100
```

### Download em Lote
```bash
# Baixa playlist do YouTube
devtools download "https://youtube.com/playlist?list=..." --output ~/Music/
```

### Geração de Credenciais
```bash
# Gera múltiplas senhas para diferentes serviços
devtools password --count 10 --length 16 > senhas.txt
```

## 🛠️ Desenvolvimento

### Estrutura do Projeto

```
devtools-cli/
├── devtools/
│   ├── __init__.py
│   ├── main.py              # CLI principal
│   ├── config.py            # Sistema de configuração
│   ├── utils.py             # Utilitários gerais
│   ├── file_manager.py      # Gerenciador de arquivos
│   ├── unit_converter.py    # Conversor de unidades
│   ├── video_downloader.py  # Downloader de vídeos
│   ├── password_generator.py# Gerador de senhas
│   ├── calculator.py        # Calculadora
│   └── plugin_system.py     # Sistema de plugins
├── tests/                   # Testes unitários
├── docs/                    # Documentação
├── examples/                # Exemplos de uso
├── requirements.txt         # Dependências
├── setup.py                # Script de instalação
└── README.md               # Este arquivo
```

### Executando Testes

```bash
python -m pytest tests/
```

### Construindo Pacote

```bash
python setup.py sdist bdist_wheel
```

## 🤝 Contribuição

Contribuições são bem-vindas! Por favor:

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -am 'Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está licenciado sob a Licença MIT - veja o arquivo [LICENSE](LICENSE) para detalhes.

## 🙏 Agradecimentos

- [Rich](https://github.com/Textualize/rich) - Interface rica no terminal
- [Click](https://click.palletsprojects.com/) - Framework CLI
- [yt-dlp](https://github.com/yt-dlp/yt-dlp) - Download de vídeos
- [Requests](https://requests.readthedocs.io/) - Cliente HTTP

## 📞 Suporte

- 🐛 [Reportar Bug](https://github.com/devtools-cli/devtools-cli/issues)
- 💡 [Solicitar Feature](https://github.com/devtools-cli/devtools-cli/issues)
- 📖 [Documentação](https://github.com/devtools-cli/devtools-cli/wiki)
- 💬 [Discussões](https://github.com/devtools-cli/devtools-cli/discussions)

---

<div align="center">

**[⬆ Voltar ao topo](#-devtools-cli)**

Feito com ❤️ para a comunidade de desenvolvedores

</div>