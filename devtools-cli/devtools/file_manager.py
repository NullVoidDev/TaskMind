"""
Gerenciador de arquivos do DevTools CLI
"""
import os
import shutil
import stat
from datetime import datetime
from pathlib import Path
from rich.console import Console
from rich.table import Table
from rich.progress import Progress, BarColumn, TextColumn, TimeRemainingColumn

from .utils import (
    print_success, print_error, print_warning, print_info,
    confirm_action, format_bytes, validate_file_path
)

console = Console()

class FileManager:
    def __init__(self, config):
        self.config = config
    
    def list_files(self, path='.', show_hidden=False, long_format=False):
        """Lista arquivos e pastas"""
        try:
            path = Path(path).resolve()
            
            if not path.exists():
                print_error(f"Caminho não encontrado: {path}")
                return
            
            if not path.is_dir():
                print_error(f"O caminho não é um diretório: {path}")
                return
            
            items = []
            for item in path.iterdir():
                if not show_hidden and item.name.startswith('.'):
                    continue
                
                stat_info = item.stat()
                items.append({
                    'name': item.name,
                    'path': item,
                    'is_dir': item.is_dir(),
                    'size': stat_info.st_size,
                    'modified': datetime.fromtimestamp(stat_info.st_mtime),
                    'permissions': stat.filemode(stat_info.st_mode)
                })
            
            # Ordena: diretórios primeiro, depois arquivos, ambos alfabeticamente
            items.sort(key=lambda x: (not x['is_dir'], x['name'].lower()))
            
            if long_format:
                self._list_long_format(items, path)
            else:
                self._list_simple_format(items, path)
        
        except PermissionError:
            print_error(f"Permissão negada para acessar: {path}")
        except Exception as e:
            print_error(f"Erro ao listar arquivos: {e}")
    
    def _list_simple_format(self, items, path):
        """Lista arquivos em formato simples"""
        console.print(f"\n📁 Conteúdo de: [bold blue]{path}[/bold blue]\n")
        
        for item in items:
            icon = "📁" if item['is_dir'] else "📄"
            name_style = "bold blue" if item['is_dir'] else "white"
            console.print(f"{icon} [{name_style}]{item['name']}[/{name_style}]")
        
        total_dirs = sum(1 for item in items if item['is_dir'])
        total_files = len(items) - total_dirs
        console.print(f"\n📊 Total: {total_dirs} diretórios, {total_files} arquivos")
    
    def _list_long_format(self, items, path):
        """Lista arquivos em formato detalhado"""
        console.print(f"\n📁 Conteúdo de: [bold blue]{path}[/bold blue]\n")
        
        table = Table(show_header=True, header_style="bold magenta")
        table.add_column("Permissões", style="cyan")
        table.add_column("Tamanho", justify="right", style="green")
        table.add_column("Modificado", style="yellow")
        table.add_column("Nome", style="white")
        
        for item in items:
            size_str = "DIR" if item['is_dir'] else format_bytes(item['size'])
            modified_str = item['modified'].strftime("%Y-%m-%d %H:%M")
            name_style = "bold blue" if item['is_dir'] else "white"
            icon = "📁" if item['is_dir'] else "📄"
            
            table.add_row(
                item['permissions'],
                size_str,
                modified_str,
                f"{icon} [{name_style}]{item['name']}[/{name_style}]"
            )
        
        console.print(table)
        
        total_dirs = sum(1 for item in items if item['is_dir'])
        total_files = len(items) - total_dirs
        total_size = sum(item['size'] for item in items if not item['is_dir'])
        
        console.print(f"\n📊 Total: {total_dirs} diretórios, {total_files} arquivos ({format_bytes(total_size)})")
    
    def copy_file(self, source, destination, recursive=False):
        """Copia arquivo ou pasta"""
        try:
            source_path = Path(source).resolve()
            dest_path = Path(destination).resolve()
            
            if not source_path.exists():
                print_error(f"Arquivo/pasta origem não encontrado: {source_path}")
                return
            
            # Se destino é um diretório existente, copia para dentro dele
            if dest_path.is_dir():
                dest_path = dest_path / source_path.name
            
            if source_path.is_file():
                # Copia arquivo
                if dest_path.exists():
                    if not confirm_action(f"Arquivo '{dest_path}' já existe. Sobrescrever?"):
                        print_info("Operação cancelada")
                        return
                
                # Cria diretório pai se não existir
                dest_path.parent.mkdir(parents=True, exist_ok=True)
                
                with Progress(
                    TextColumn("[progress.description]{task.description}"),
                    BarColumn(),
                    "[progress.percentage]{task.percentage:>3.0f}%",
                    TimeRemainingColumn(),
                ) as progress:
                    task = progress.add_task(f"Copiando {source_path.name}", total=source_path.stat().st_size)
                    
                    with open(source_path, 'rb') as src, open(dest_path, 'wb') as dst:
                        while True:
                            chunk = src.read(8192)
                            if not chunk:
                                break
                            dst.write(chunk)
                            progress.update(task, advance=len(chunk))
                
                print_success(f"Arquivo copiado: {source_path} → {dest_path}")
            
            elif source_path.is_dir():
                # Copia diretório
                if not recursive:
                    print_error("Use -r/--recursive para copiar diretórios")
                    return
                
                if dest_path.exists():
                    if not confirm_action(f"Diretório '{dest_path}' já existe. Mesclar?"):
                        print_info("Operação cancelada")
                        return
                
                shutil.copytree(source_path, dest_path, dirs_exist_ok=True)
                print_success(f"Diretório copiado: {source_path} → {dest_path}")
        
        except PermissionError:
            print_error("Permissão negada para realizar a cópia")
        except Exception as e:
            print_error(f"Erro ao copiar: {e}")
    
    def move_file(self, source, destination):
        """Move arquivo ou pasta"""
        try:
            source_path = Path(source).resolve()
            dest_path = Path(destination).resolve()
            
            if not source_path.exists():
                print_error(f"Arquivo/pasta origem não encontrado: {source_path}")
                return
            
            # Se destino é um diretório existente, move para dentro dele
            if dest_path.is_dir():
                dest_path = dest_path / source_path.name
            
            if dest_path.exists():
                if not confirm_action(f"'{dest_path}' já existe. Sobrescrever?"):
                    print_info("Operação cancelada")
                    return
            
            # Cria diretório pai se não existir
            dest_path.parent.mkdir(parents=True, exist_ok=True)
            
            shutil.move(str(source_path), str(dest_path))
            print_success(f"Movido: {source_path} → {dest_path}")
        
        except PermissionError:
            print_error("Permissão negada para realizar a movimentação")
        except Exception as e:
            print_error(f"Erro ao mover: {e}")
    
    def rename_file(self, old_name, new_name):
        """Renomeia arquivo ou pasta"""
        try:
            old_path = Path(old_name).resolve()
            
            if not old_path.exists():
                print_error(f"Arquivo/pasta não encontrado: {old_path}")
                return
            
            new_path = old_path.parent / new_name
            
            if new_path.exists():
                if not confirm_action(f"'{new_path}' já existe. Sobrescrever?"):
                    print_info("Operação cancelada")
                    return
            
            old_path.rename(new_path)
            print_success(f"Renomeado: {old_path.name} → {new_name}")
        
        except PermissionError:
            print_error("Permissão negada para renomear")
        except Exception as e:
            print_error(f"Erro ao renomear: {e}")
    
    def delete_files(self, paths, force=False, recursive=False):
        """Apaga arquivos ou pastas"""
        try:
            confirm_deletions = self.config.get_bool('general', 'confirm_deletions', True)
            
            for path_str in paths:
                path = Path(path_str).resolve()
                
                if not path.exists():
                    print_warning(f"Arquivo/pasta não encontrado: {path}")
                    continue
                
                # Confirmação de segurança
                if not force and confirm_deletions:
                    item_type = "diretório" if path.is_dir() else "arquivo"
                    if not confirm_action(f"Confirmar exclusão do {item_type} '{path}'?"):
                        print_info(f"Exclusão de '{path}' cancelada")
                        continue
                
                if path.is_file():
                    # Apaga arquivo
                    path.unlink()
                    print_success(f"Arquivo apagado: {path}")
                
                elif path.is_dir():
                    # Apaga diretório
                    if not recursive and any(path.iterdir()):
                        print_error(f"Diretório não vazio: {path}. Use -r/--recursive para apagar")
                        continue
                    
                    shutil.rmtree(path)
                    print_success(f"Diretório apagado: {path}")
        
        except PermissionError:
            print_error("Permissão negada para realizar a exclusão")
        except Exception as e:
            print_error(f"Erro ao apagar: {e}")