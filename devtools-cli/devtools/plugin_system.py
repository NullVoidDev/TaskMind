"""
Sistema de plugins do DevTools CLI
"""
import os
import sys
import importlib.util
import json
from pathlib import Path
from .utils import print_success, print_error, print_info, print_warning

class PluginSystem:
    def __init__(self, config):
        self.config = config
        self.plugins_dir = Path(config.config_dir) / 'plugins'
        self.plugins_dir.mkdir(exist_ok=True)
        self.loaded_plugins = {}
        self.load_plugins()
    
    def load_plugins(self):
        """Carrega todos os plugins disponíveis"""
        try:
            for plugin_file in self.plugins_dir.glob('*.py'):
                if plugin_file.name.startswith('_'):
                    continue  # Ignora arquivos privados
                
                plugin_name = plugin_file.stem
                try:
                    plugin = self._load_plugin_file(plugin_file)
                    if plugin:
                        self.loaded_plugins[plugin_name] = plugin
                        print_info(f"Plugin carregado: {plugin_name}")
                except Exception as e:
                    print_warning(f"Erro ao carregar plugin {plugin_name}: {e}")
        
        except Exception as e:
            print_error(f"Erro ao carregar plugins: {e}")
    
    def _load_plugin_file(self, plugin_file):
        """Carrega um arquivo de plugin específico"""
        try:
            spec = importlib.util.spec_from_file_location(plugin_file.stem, plugin_file)
            module = importlib.util.module_from_spec(spec)
            spec.loader.exec_module(module)
            
            # Verifica se o plugin tem a estrutura correta
            if not hasattr(module, 'DevToolsPlugin'):
                print_error(f"Plugin {plugin_file.stem} não tem classe DevToolsPlugin")
                return None
            
            plugin_class = getattr(module, 'DevToolsPlugin')
            plugin_instance = plugin_class()
            
            # Valida interface do plugin
            if not self._validate_plugin(plugin_instance):
                return None
            
            return plugin_instance
        
        except Exception as e:
            print_error(f"Erro ao carregar {plugin_file}: {e}")
            return None
    
    def _validate_plugin(self, plugin):
        """Valida se o plugin implementa a interface correta"""
        required_methods = ['get_name', 'get_description', 'get_version', 'execute']
        
        for method in required_methods:
            if not hasattr(plugin, method) or not callable(getattr(plugin, method)):
                print_error(f"Plugin não implementa método obrigatório: {method}")
                return False
        
        return True
    
    def list_plugins(self):
        """Lista todos os plugins instalados"""
        from rich.console import Console
        from rich.table import Table
        
        console = Console()
        
        if not self.loaded_plugins:
            print_info("Nenhum plugin instalado")
            return
        
        table = Table(title="Plugins Instalados")
        table.add_column("Nome", style="cyan")
        table.add_column("Versão", style="magenta")
        table.add_column("Descrição", style="green")
        table.add_column("Status", style="yellow")
        
        for name, plugin in self.loaded_plugins.items():
            try:
                plugin_name = plugin.get_name()
                plugin_version = plugin.get_version()
                plugin_description = plugin.get_description()
                status = "✅ Ativo"
            except Exception as e:
                plugin_name = name
                plugin_version = "N/A"
                plugin_description = f"Erro: {e}"
                status = "❌ Erro"
            
            table.add_row(plugin_name, plugin_version, plugin_description, status)
        
        console.print(table)
    
    def install_plugin(self, plugin_path):
        """Instala um plugin"""
        try:
            source_path = Path(plugin_path)
            
            if not source_path.exists():
                print_error(f"Arquivo de plugin não encontrado: {plugin_path}")
                return False
            
            if not source_path.suffix == '.py':
                print_error("Plugin deve ser um arquivo .py")
                return False
            
            # Testa se o plugin é válido
            test_plugin = self._load_plugin_file(source_path)
            if not test_plugin:
                print_error("Plugin inválido")
                return False
            
            # Copia plugin para diretório de plugins
            dest_path = self.plugins_dir / source_path.name
            
            if dest_path.exists():
                from .utils import confirm_action
                if not confirm_action(f"Plugin {source_path.name} já existe. Sobrescrever?"):
                    print_info("Instalação cancelada")
                    return False
            
            import shutil
            shutil.copy2(source_path, dest_path)
            
            # Recarrega plugins
            plugin_name = dest_path.stem
            self.loaded_plugins[plugin_name] = test_plugin
            
            print_success(f"Plugin {plugin_name} instalado com sucesso!")
            return True
        
        except Exception as e:
            print_error(f"Erro ao instalar plugin: {e}")
            return False
    
    def remove_plugin(self, plugin_name):
        """Remove um plugin"""
        try:
            if plugin_name not in self.loaded_plugins:
                print_error(f"Plugin não encontrado: {plugin_name}")
                return False
            
            from .utils import confirm_action
            if not confirm_action(f"Confirmar remoção do plugin {plugin_name}?"):
                print_info("Remoção cancelada")
                return False
            
            # Remove arquivo
            plugin_file = self.plugins_dir / f"{plugin_name}.py"
            if plugin_file.exists():
                plugin_file.unlink()
            
            # Remove da memória
            del self.loaded_plugins[plugin_name]
            
            print_success(f"Plugin {plugin_name} removido com sucesso!")
            return True
        
        except Exception as e:
            print_error(f"Erro ao remover plugin: {e}")
            return False
    
    def execute_plugin(self, plugin_name, args):
        """Executa um plugin específico"""
        try:
            if plugin_name not in self.loaded_plugins:
                return False  # Plugin não encontrado
            
            plugin = self.loaded_plugins[plugin_name]
            return plugin.execute(args)
        
        except Exception as e:
            print_error(f"Erro ao executar plugin {plugin_name}: {e}")
            return False
    
    def create_plugin_template(self, plugin_name, output_dir='.'):
        """Cria template de plugin"""
        try:
            output_path = Path(output_dir) / f"{plugin_name}.py"
            
            if output_path.exists():
                from .utils import confirm_action
                if not confirm_action(f"Arquivo {output_path} já existe. Sobrescrever?"):
                    print_info("Criação cancelada")
                    return False
            
            template = self._get_plugin_template(plugin_name)
            
            with open(output_path, 'w', encoding='utf-8') as f:
                f.write(template)
            
            print_success(f"Template de plugin criado: {output_path}")
            print_info("Edite o arquivo e instale com: devtools plugin install " + str(output_path))
            return True
        
        except Exception as e:
            print_error(f"Erro ao criar template: {e}")
            return False
    
    def _get_plugin_template(self, plugin_name):
        """Retorna template de plugin"""
        return f'''"""
Plugin {plugin_name} para DevTools CLI
"""

class DevToolsPlugin:
    """
    Classe base para plugins do DevTools CLI
    
    Métodos obrigatórios:
    - get_name(): retorna nome do plugin
    - get_description(): retorna descrição do plugin  
    - get_version(): retorna versão do plugin
    - execute(args): executa o plugin com argumentos
    """
    
    def get_name(self):
        """Retorna o nome do plugin"""
        return "{plugin_name}"
    
    def get_description(self):
        """Retorna a descrição do plugin"""
        return "Descrição do plugin {plugin_name}"
    
    def get_version(self):
        """Retorna a versão do plugin"""
        return "1.0.0"
    
    def execute(self, args):
        """
        Executa o plugin
        
        Args:
            args: argumentos da linha de comando (objeto argparse.Namespace)
            
        Returns:
            bool: True se executado com sucesso, False caso contrário
        """
        try:
            print(f"🔌 Executando plugin {{self.get_name()}} v{{self.get_version()}}")
            
            # TODO: Implementar lógica do plugin aqui
            print("Plugin executado com sucesso!")
            
            return True
        
        except Exception as e:
            print(f"Erro no plugin: {{e}}")
            return False
    
    def get_help(self):
        """Retorna texto de ajuda do plugin (opcional)"""
        return f"""
Uso: devtools {plugin_name} [opções]

Descrição:
    {{self.get_description()}}

Exemplos:
    devtools {plugin_name}
        """

# Exemplo de uso avançado com argumentos personalizados
def setup_plugin_args(parser):
    """
    Configura argumentos específicos do plugin (opcional)
    
    Args:
        parser: subparser do argparse para este plugin
    """
    parser.add_argument('--exemplo', help='Argumento de exemplo')
    parser.add_argument('-v', '--verbose', action='store_true', 
                       help='Saída detalhada')
'''
    
    def get_plugin_info(self, plugin_name):
        """Obtém informações detalhadas de um plugin"""
        if plugin_name not in self.loaded_plugins:
            print_error(f"Plugin não encontrado: {plugin_name}")
            return None
        
        try:
            plugin = self.loaded_plugins[plugin_name]
            
            info = {
                'name': plugin.get_name(),
                'description': plugin.get_description(),
                'version': plugin.get_version(),
                'file': str(self.plugins_dir / f"{plugin_name}.py")
            }
            
            # Verifica se tem método de ajuda
            if hasattr(plugin, 'get_help'):
                info['help'] = plugin.get_help()
            
            return info
        
        except Exception as e:
            print_error(f"Erro ao obter informações do plugin: {e}")
            return None
    
    def reload_plugin(self, plugin_name):
        """Recarrega um plugin específico"""
        try:
            plugin_file = self.plugins_dir / f"{plugin_name}.py"
            
            if not plugin_file.exists():
                print_error(f"Arquivo de plugin não encontrado: {plugin_file}")
                return False
            
            # Remove plugin atual se existir
            if plugin_name in self.loaded_plugins:
                del self.loaded_plugins[plugin_name]
            
            # Recarrega plugin
            plugin = self._load_plugin_file(plugin_file)
            if plugin:
                self.loaded_plugins[plugin_name] = plugin
                print_success(f"Plugin {plugin_name} recarregado com sucesso!")
                return True
            else:
                print_error(f"Erro ao recarregar plugin {plugin_name}")
                return False
        
        except Exception as e:
            print_error(f"Erro ao recarregar plugin: {e}")
            return False