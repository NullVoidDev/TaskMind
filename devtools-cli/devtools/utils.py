"""
Utilitários gerais para o DevTools CLI
"""
import os
import sys
from rich.console import Console
from rich.text import Text
from rich import print as rprint

console = Console()

def print_success(message):
    """Imprime mensagem de sucesso em verde"""
    console.print(f"✅ {message}", style="green")

def print_error(message):
    """Imprime mensagem de erro em vermelho"""
    console.print(f"❌ {message}", style="red")

def print_warning(message):
    """Imprime mensagem de aviso em amarelo"""
    console.print(f"⚠️  {message}", style="yellow")

def print_info(message):
    """Imprime mensagem informativa em azul"""
    console.print(f"ℹ️  {message}", style="blue")

def confirm_action(message):
    """Solicita confirmação do usuário"""
    response = input(f"⚡ {message} (s/N): ").lower().strip()
    return response in ['s', 'sim', 'y', 'yes']

def get_home_dir():
    """Retorna o diretório home do usuário"""
    return os.path.expanduser("~")

def get_config_dir():
    """Retorna o diretório de configuração"""
    config_dir = os.path.join(get_home_dir(), '.devtools')
    if not os.path.exists(config_dir):
        os.makedirs(config_dir)
    return config_dir

def format_bytes(bytes_value):
    """Formata bytes em formato legível"""
    for unit in ['B', 'KB', 'MB', 'GB', 'TB']:
        if bytes_value < 1024.0:
            return f"{bytes_value:.2f} {unit}"
        bytes_value /= 1024.0
    return f"{bytes_value:.2f} PB"

def validate_file_path(file_path):
    """Valida se um caminho de arquivo existe"""
    return os.path.exists(file_path)

def create_banner():
    """Cria banner do aplicativo"""
    banner = Text()
    banner.append("🛠️  DevTools CLI", style="bold cyan")
    banner.append(" v1.0.0", style="dim")
    return banner