"""
Exemplo de plugin para DevTools CLI
Este plugin demonstra como criar funcionalidades personalizadas
"""

import os
import requests
from datetime import datetime

class DevToolsPlugin:
    """Plugin de exemplo que verifica informações do sistema e clima"""
    
    def get_name(self):
        return "sysinfo"
    
    def get_description(self):
        return "Exibe informações do sistema e clima atual"
    
    def get_version(self):
        return "1.0.0"
    
    def execute(self, args):
        """Executa o plugin"""
        try:
            print("🖥️  Informações do Sistema")
            print("=" * 40)
            
            # Informações básicas do sistema
            self._show_system_info()
            
            print("\n🌤️  Informações do Clima")
            print("=" * 40)
            
            # Tenta obter informações do clima
            self._show_weather_info()
            
            return True
        
        except Exception as e:
            print(f"❌ Erro no plugin: {e}")
            return False
    
    def _show_system_info(self):
        """Mostra informações do sistema"""
        import platform
        import psutil
        
        print(f"Sistema Operacional: {platform.system()} {platform.release()}")
        print(f"Arquitetura: {platform.machine()}")
        print(f"Processador: {platform.processor()}")
        print(f"Python: {platform.python_version()}")
        print(f"Usuário: {os.getenv('USER', 'N/A')}")
        print(f"Diretório Atual: {os.getcwd()}")
        print(f"Data/Hora: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        
        # Informações de memória
        memory = psutil.virtual_memory()
        print(f"Memória Total: {self._format_bytes(memory.total)}")
        print(f"Memória Disponível: {self._format_bytes(memory.available)}")
        print(f"Uso de Memória: {memory.percent}%")
        
        # Informações de disco
        disk = psutil.disk_usage('/')
        print(f"Espaço Total: {self._format_bytes(disk.total)}")
        print(f"Espaço Livre: {self._format_bytes(disk.free)}")
        print(f"Uso de Disco: {(disk.used / disk.total) * 100:.1f}%")
    
    def _show_weather_info(self):
        """Mostra informações do clima (exemplo com API gratuita)"""
        try:
            # Usa uma API gratuita de exemplo (substitua por uma real)
            # Esta é apenas uma demonstração
            print("🌡️  Temperatura: 22°C")
            print("💨 Vento: 15 km/h")
            print("💧 Umidade: 65%")
            print("☁️  Condição: Parcialmente nublado")
            print("\n💡 Dica: Configure uma API key real para dados precisos")
        
        except Exception as e:
            print(f"❌ Erro ao obter clima: {e}")
    
    def _format_bytes(self, bytes_value):
        """Formata bytes em formato legível"""
        for unit in ['B', 'KB', 'MB', 'GB', 'TB']:
            if bytes_value < 1024.0:
                return f"{bytes_value:.2f} {unit}"
            bytes_value /= 1024.0
        return f"{bytes_value:.2f} PB"
    
    def get_help(self):
        """Retorna ajuda do plugin"""
        return """
Uso: devtools sysinfo

Descrição:
    Exibe informações detalhadas do sistema incluindo:
    - Sistema operacional e arquitetura
    - Uso de memória e disco
    - Informações do usuário
    - Data e hora atual
    - Informações básicas do clima

Exemplos:
    devtools sysinfo                 # Exibe todas as informações
    devtools plugin info sysinfo     # Informações sobre o plugin
        """

# Função opcional para configurar argumentos específicos
def setup_plugin_args(parser):
    """Configura argumentos específicos do plugin"""
    parser.add_argument('--no-weather', action='store_true',
                       help='Pula informações do clima')
    parser.add_argument('--detailed', action='store_true',
                       help='Exibe informações mais detalhadas')