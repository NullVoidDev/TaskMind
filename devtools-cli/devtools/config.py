"""
Sistema de configuração do DevTools CLI
"""
import os
import configparser
from .utils import get_config_dir, print_error, print_success

class Config:
    def __init__(self):
        self.config_dir = get_config_dir()
        self.config_file = os.path.join(self.config_dir, 'config.ini')
        self.config = configparser.ConfigParser()
        self.load_config()
    
    def load_config(self):
        """Carrega configurações do arquivo"""
        if os.path.exists(self.config_file):
            try:
                self.config.read(self.config_file)
            except Exception as e:
                print_error(f"Erro ao carregar configuração: {e}")
        else:
            self.create_default_config()
    
    def create_default_config(self):
        """Cria configuração padrão"""
        self.config['general'] = {
            'default_download_path': os.path.join(os.path.expanduser("~"), 'Downloads'),
            'use_colors': 'true',
            'confirm_deletions': 'true'
        }
        
        self.config['password'] = {
            'default_length': '16',
            'include_symbols': 'true',
            'include_numbers': 'true',
            'include_uppercase': 'true',
            'include_lowercase': 'true'
        }
        
        self.config['calculator'] = {
            'precision': '10',
            'angle_unit': 'radians'
        }
        
        self.config['currency'] = {
            'api_key': '',
            'default_base': 'USD',
            'cache_duration': '3600'
        }
        
        self.save_config()
    
    def save_config(self):
        """Salva configurações no arquivo"""
        try:
            with open(self.config_file, 'w') as f:
                self.config.write(f)
        except Exception as e:
            print_error(f"Erro ao salvar configuração: {e}")
    
    def get(self, section, key, fallback=None):
        """Obtém valor de configuração"""
        try:
            return self.config.get(section, key, fallback=fallback)
        except:
            return fallback
    
    def set(self, section, key, value):
        """Define valor de configuração"""
        if section not in self.config:
            self.config.add_section(section)
        self.config.set(section, key, str(value))
        self.save_config()
    
    def get_bool(self, section, key, fallback=False):
        """Obtém valor booleano de configuração"""
        try:
            return self.config.getboolean(section, key, fallback=fallback)
        except:
            return fallback
    
    def get_int(self, section, key, fallback=0):
        """Obtém valor inteiro de configuração"""
        try:
            return self.config.getint(section, key, fallback=fallback)
        except:
            return fallback