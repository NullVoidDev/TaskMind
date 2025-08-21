#!/usr/bin/env python3
"""
Demo script para DevTools CLI
Demonstra as principais funcionalidades da ferramenta
"""

import subprocess
import sys
from rich.console import Console
from rich.panel import Panel
from rich.text import Text

console = Console()

def run_command(cmd):
    """Executa comando e exibe resultado"""
    console.print(f"\n💻 [bold cyan]Comando:[/bold cyan] {cmd}")
    try:
        result = subprocess.run(cmd.split(), capture_output=True, text=True, timeout=10)
        if result.stdout:
            console.print(result.stdout)
        if result.stderr:
            console.print(f"[red]{result.stderr}[/red]")
    except Exception as e:
        console.print(f"[red]Erro: {e}[/red]")

def main():
    """Executa demonstração do DevTools CLI"""
    
    # Banner
    banner = Text()
    banner.append("🛠️ DevTools CLI", style="bold cyan")
    banner.append(" - Demonstração Interativa", style="dim")
    
    console.print(Panel(banner, title="Bem-vindo!", padding=(1, 2)))
    
    console.print("\n[bold green]🚀 Demonstração das funcionalidades principais:[/bold green]\n")
    
    # 1. Ajuda geral
    console.print("[bold]1. 📖 Ajuda Geral[/bold]")
    run_command("python3 -m devtools.main --help")
    
    # 2. Gerador de senhas
    console.print("\n[bold]2. 🔐 Gerador de Senhas[/bold]")
    run_command("python3 -m devtools.main password --length 12 --count 2")
    
    # 3. Calculadora
    console.print("\n[bold]3. 🧮 Calculadora[/bold]")
    run_command("python3 -m devtools.main calc '10 + 5 * 2'")
    run_command("python3 -m devtools.main calc '(100 - 25) / 3'")
    
    # 4. Conversor de unidades
    console.print("\n[bold]4. 🔄 Conversor de Unidades[/bold]")
    run_command("python3 -m devtools.main convert 2048 bytes kb")
    run_command("python3 -m devtools.main convert 90 minutes hours")
    run_command("python3 -m devtools.main convert 100 celsius fahrenheit")
    
    # 5. Gerenciador de arquivos
    console.print("\n[bold]5. 📁 Gerenciador de Arquivos[/bold]")
    run_command("python3 -m devtools.main file list . --long")
    
    # 6. Sistema de configuração
    console.print("\n[bold]6. ⚙️ Sistema de Configuração[/bold]")
    run_command("python3 -m devtools.main config set demo test_value 'Olá DevTools!'")
    run_command("python3 -m devtools.main config get demo test_value")
    
    # 7. Sistema de plugins
    console.print("\n[bold]7. 🔌 Sistema de Plugins[/bold]")
    run_command("python3 -m devtools.main plugin list")
    
    # Finalização
    console.print("\n[bold green]✨ Demonstração concluída![/bold green]")
    console.print("\n[dim]💡 Dicas:[/dim]")
    console.print("• Use [cyan]devtools --help[/cyan] para ver todos os comandos")
    console.print("• Use [cyan]devtools <comando> --help[/cyan] para ajuda específica")
    console.print("• Veja exemplos em [cyan]examples/[/cyan]")
    console.print("• Leia a documentação completa no [cyan]README.md[/cyan]")

if __name__ == "__main__":
    main()