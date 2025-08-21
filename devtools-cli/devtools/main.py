#!/usr/bin/env python3
"""
DevTools CLI - Ferramenta de linha de comando multiuso
"""
import argparse
import sys
from rich.console import Console
from rich.table import Table

from .utils import create_banner, print_error, print_success, print_info
from .config import Config
from .file_manager import FileManager
from .unit_converter import UnitConverter
from .video_downloader import VideoDownloader
from .password_generator import PasswordGenerator
from .calculator import Calculator
from .plugin_system import PluginSystem

console = Console()

class DevToolsCLI:
    def __init__(self):
        self.config = Config()
        self.file_manager = FileManager(self.config)
        self.unit_converter = UnitConverter(self.config)
        self.video_downloader = VideoDownloader(self.config)
        self.password_generator = PasswordGenerator(self.config)
        self.calculator = Calculator(self.config)
        self.plugin_system = PluginSystem(self.config)
    
    def create_parser(self):
        """Cria o parser principal de argumentos"""
        parser = argparse.ArgumentParser(
            description='DevTools CLI - Ferramenta multiuso para desenvolvedores',
            formatter_class=argparse.RawDescriptionHelpFormatter,
            epilog="""
Exemplos de uso:
  devtools file list /home/user
  devtools convert 1024 bytes mb
  devtools download https://youtube.com/watch?v=...
  devtools password --length 20
  devtools calc "2 + 2 * 3"
  devtools config set general use_colors false
            """
        )
        
        parser.add_argument('--version', action='version', version='DevTools CLI v1.0.0')
        
        subparsers = parser.add_subparsers(dest='command', help='Comandos disponíveis')
        
        # Comando file (gerenciador de arquivos)
        file_parser = subparsers.add_parser('file', help='Gerenciador de arquivos')
        file_subparsers = file_parser.add_subparsers(dest='file_action')
        
        # file list
        list_parser = file_subparsers.add_parser('list', help='Listar arquivos e pastas')
        list_parser.add_argument('path', nargs='?', default='.', help='Caminho para listar')
        list_parser.add_argument('-a', '--all', action='store_true', help='Mostrar arquivos ocultos')
        list_parser.add_argument('-l', '--long', action='store_true', help='Formato detalhado')
        
        # file copy
        copy_parser = file_subparsers.add_parser('copy', help='Copiar arquivos/pastas')
        copy_parser.add_argument('source', help='Arquivo/pasta origem')
        copy_parser.add_argument('destination', help='Destino')
        copy_parser.add_argument('-r', '--recursive', action='store_true', help='Cópia recursiva')
        
        # file move
        move_parser = file_subparsers.add_parser('move', help='Mover arquivos/pastas')
        move_parser.add_argument('source', help='Arquivo/pasta origem')
        move_parser.add_argument('destination', help='Destino')
        
        # file rename
        rename_parser = file_subparsers.add_parser('rename', help='Renomear arquivo/pasta')
        rename_parser.add_argument('old_name', help='Nome atual')
        rename_parser.add_argument('new_name', help='Novo nome')
        
        # file delete
        delete_parser = file_subparsers.add_parser('delete', help='Apagar arquivos/pastas')
        delete_parser.add_argument('paths', nargs='+', help='Caminhos para apagar')
        delete_parser.add_argument('-f', '--force', action='store_true', help='Forçar exclusão')
        delete_parser.add_argument('-r', '--recursive', action='store_true', help='Exclusão recursiva')
        
        # Comando convert (conversor de unidades)
        convert_parser = subparsers.add_parser('convert', help='Conversor de unidades')
        convert_parser.add_argument('value', type=float, help='Valor a converter')
        convert_parser.add_argument('from_unit', help='Unidade origem')
        convert_parser.add_argument('to_unit', help='Unidade destino')
        convert_parser.add_argument('--type', choices=['size', 'time', 'temperature', 'currency'], 
                                   help='Tipo de conversão')
        
        # Comando download (downloader de vídeos)
        download_parser = subparsers.add_parser('download', help='Downloader de vídeos')
        download_parser.add_argument('url', help='URL do vídeo')
        download_parser.add_argument('-o', '--output', help='Pasta de destino')
        download_parser.add_argument('-f', '--format', default='best', help='Formato do vídeo')
        download_parser.add_argument('--audio-only', action='store_true', help='Baixar apenas áudio')
        
        # Comando password (gerador de senhas)
        password_parser = subparsers.add_parser('password', help='Gerador de senhas')
        password_parser.add_argument('-l', '--length', type=int, help='Comprimento da senha')
        password_parser.add_argument('--no-symbols', action='store_true', help='Sem símbolos')
        password_parser.add_argument('--no-numbers', action='store_true', help='Sem números')
        password_parser.add_argument('--no-uppercase', action='store_true', help='Sem maiúsculas')
        password_parser.add_argument('--no-lowercase', action='store_true', help='Sem minúsculas')
        password_parser.add_argument('-c', '--count', type=int, default=1, help='Quantidade de senhas')
        
        # Comando calc (calculadora)
        calc_parser = subparsers.add_parser('calc', help='Calculadora')
        calc_parser.add_argument('expression', help='Expressão matemática')
        calc_parser.add_argument('--precision', type=int, help='Precisão decimal')
        calc_parser.add_argument('--degrees', action='store_true', help='Usar graus em vez de radianos')
        
        # Comando config (configuração)
        config_parser = subparsers.add_parser('config', help='Configuração')
        config_subparsers = config_parser.add_subparsers(dest='config_action')
        
        # config get
        get_parser = config_subparsers.add_parser('get', help='Obter valor de configuração')
        get_parser.add_argument('section', help='Seção da configuração')
        get_parser.add_argument('key', help='Chave da configuração')
        
        # config set
        set_parser = config_subparsers.add_parser('set', help='Definir valor de configuração')
        set_parser.add_argument('section', help='Seção da configuração')
        set_parser.add_argument('key', help='Chave da configuração')
        set_parser.add_argument('value', help='Valor da configuração')
        
        # config list
        list_config_parser = config_subparsers.add_parser('list', help='Listar configurações')
        
        # Comando plugin (sistema de plugins)
        plugin_parser = subparsers.add_parser('plugin', help='Sistema de plugins')
        plugin_subparsers = plugin_parser.add_subparsers(dest='plugin_action')
        
        # plugin list
        plugin_list_parser = plugin_subparsers.add_parser('list', help='Listar plugins')
        
        # plugin install
        plugin_install_parser = plugin_subparsers.add_parser('install', help='Instalar plugin')
        plugin_install_parser.add_argument('plugin_path', help='Caminho do plugin')
        
        # plugin remove
        plugin_remove_parser = plugin_subparsers.add_parser('remove', help='Remover plugin')
        plugin_remove_parser.add_argument('plugin_name', help='Nome do plugin')
        
        return parser
    
    def show_banner(self):
        """Exibe banner do aplicativo"""
        console.print(create_banner())
        console.print()
    
    def handle_file_command(self, args):
        """Processa comandos de arquivo"""
        if args.file_action == 'list':
            self.file_manager.list_files(args.path, args.all, args.long)
        elif args.file_action == 'copy':
            self.file_manager.copy_file(args.source, args.destination, args.recursive)
        elif args.file_action == 'move':
            self.file_manager.move_file(args.source, args.destination)
        elif args.file_action == 'rename':
            self.file_manager.rename_file(args.old_name, args.new_name)
        elif args.file_action == 'delete':
            self.file_manager.delete_files(args.paths, args.force, args.recursive)
        else:
            print_error("Ação de arquivo não reconhecida. Use --help para ver opções.")
    
    def handle_convert_command(self, args):
        """Processa comandos de conversão"""
        result = self.unit_converter.convert(args.value, args.from_unit, args.to_unit, args.type)
        if result:
            print_success(f"{args.value} {args.from_unit} = {result} {args.to_unit}")
    
    def handle_download_command(self, args):
        """Processa comandos de download"""
        self.video_downloader.download(args.url, args.output, args.format, args.audio_only)
    
    def handle_password_command(self, args):
        """Processa comandos de geração de senha"""
        passwords = self.password_generator.generate(
            length=args.length,
            include_symbols=not args.no_symbols,
            include_numbers=not args.no_numbers,
            include_uppercase=not args.no_uppercase,
            include_lowercase=not args.no_lowercase,
            count=args.count
        )
        
        if args.count == 1:
            console.print(f"🔐 Senha gerada: [bold green]{passwords[0]}[/bold green]")
        else:
            console.print(f"🔐 {args.count} senhas geradas:")
            for i, password in enumerate(passwords, 1):
                console.print(f"  {i}. [green]{password}[/green]")
    
    def handle_calc_command(self, args):
        """Processa comandos de calculadora"""
        result = self.calculator.calculate(args.expression, args.precision, args.degrees)
        if result is not None:
            console.print(f"🧮 Resultado: [bold blue]{result}[/bold blue]")
    
    def handle_config_command(self, args):
        """Processa comandos de configuração"""
        if args.config_action == 'get':
            value = self.config.get(args.section, args.key)
            if value:
                console.print(f"[{args.section}] {args.key} = [green]{value}[/green]")
            else:
                print_error(f"Configuração [{args.section}] {args.key} não encontrada")
        
        elif args.config_action == 'set':
            self.config.set(args.section, args.key, args.value)
            print_success(f"Configuração [{args.section}] {args.key} definida para: {args.value}")
        
        elif args.config_action == 'list':
            table = Table(title="Configurações")
            table.add_column("Seção", style="cyan")
            table.add_column("Chave", style="magenta")
            table.add_column("Valor", style="green")
            
            for section_name in self.config.config.sections():
                section = self.config.config[section_name]
                for key, value in section.items():
                    table.add_row(section_name, key, value)
            
            console.print(table)
    
    def handle_plugin_command(self, args):
        """Processa comandos de plugin"""
        if args.plugin_action == 'list':
            self.plugin_system.list_plugins()
        elif args.plugin_action == 'install':
            self.plugin_system.install_plugin(args.plugin_path)
        elif args.plugin_action == 'remove':
            self.plugin_system.remove_plugin(args.plugin_name)
    
    def run(self):
        """Executa o CLI principal"""
        parser = self.create_parser()
        
        if len(sys.argv) == 1:
            self.show_banner()
            parser.print_help()
            return
        
        args = parser.parse_args()
        
        try:
            if args.command == 'file':
                self.handle_file_command(args)
            elif args.command == 'convert':
                self.handle_convert_command(args)
            elif args.command == 'download':
                self.handle_download_command(args)
            elif args.command == 'password':
                self.handle_password_command(args)
            elif args.command == 'calc':
                self.handle_calc_command(args)
            elif args.command == 'config':
                self.handle_config_command(args)
            elif args.command == 'plugin':
                self.handle_plugin_command(args)
            else:
                # Tentar executar plugin
                plugin_result = self.plugin_system.execute_plugin(args.command, args)
                if not plugin_result:
                    print_error(f"Comando não reconhecido: {args.command}")
                    parser.print_help()
        
        except KeyboardInterrupt:
            print_info("\nOperação cancelada pelo usuário")
        except Exception as e:
            print_error(f"Erro inesperado: {e}")
            sys.exit(1)

def main():
    """Ponto de entrada principal"""
    cli = DevToolsCLI()
    cli.run()

if __name__ == '__main__':
    main()