"""
Conversor de unidades do DevTools CLI
"""
import requests
import json
import time
from pathlib import Path
from .utils import print_error, print_warning, print_info

class UnitConverter:
    def __init__(self, config):
        self.config = config
        self.cache_dir = Path(config.config_dir) / 'cache'
        self.cache_dir.mkdir(exist_ok=True)
        
        # Definições de unidades
        self.size_units = {
            'b': 1, 'byte': 1, 'bytes': 1,
            'kb': 1024, 'kilobyte': 1024, 'kilobytes': 1024,
            'mb': 1024**2, 'megabyte': 1024**2, 'megabytes': 1024**2,
            'gb': 1024**3, 'gigabyte': 1024**3, 'gigabytes': 1024**3,
            'tb': 1024**4, 'terabyte': 1024**4, 'terabytes': 1024**4,
            'pb': 1024**5, 'petabyte': 1024**5, 'petabytes': 1024**5
        }
        
        self.time_units = {
            'ms': 0.001, 'millisecond': 0.001, 'milliseconds': 0.001,
            's': 1, 'sec': 1, 'second': 1, 'seconds': 1,
            'min': 60, 'minute': 60, 'minutes': 60,
            'h': 3600, 'hour': 3600, 'hours': 3600,
            'd': 86400, 'day': 86400, 'days': 86400,
            'w': 604800, 'week': 604800, 'weeks': 604800,
            'month': 2592000, 'months': 2592000,
            'y': 31536000, 'year': 31536000, 'years': 31536000
        }
        
        self.temperature_conversions = {
            ('c', 'f'): lambda c: c * 9/5 + 32,
            ('c', 'k'): lambda c: c + 273.15,
            ('f', 'c'): lambda f: (f - 32) * 5/9,
            ('f', 'k'): lambda f: (f - 32) * 5/9 + 273.15,
            ('k', 'c'): lambda k: k - 273.15,
            ('k', 'f'): lambda k: (k - 273.15) * 9/5 + 32
        }
    
    def convert(self, value, from_unit, to_unit, unit_type=None):
        """Converte valor entre unidades"""
        from_unit = from_unit.lower()
        to_unit = to_unit.lower()
        
        # Auto-detecta tipo se não especificado
        if not unit_type:
            unit_type = self._detect_unit_type(from_unit, to_unit)
        
        if unit_type == 'size':
            return self._convert_size(value, from_unit, to_unit)
        elif unit_type == 'time':
            return self._convert_time(value, from_unit, to_unit)
        elif unit_type == 'temperature':
            return self._convert_temperature(value, from_unit, to_unit)
        elif unit_type == 'currency':
            return self._convert_currency(value, from_unit, to_unit)
        else:
            print_error(f"Tipo de unidade não suportado: {unit_type}")
            return None
    
    def _detect_unit_type(self, from_unit, to_unit):
        """Auto-detecta o tipo de unidade"""
        if from_unit in self.size_units and to_unit in self.size_units:
            return 'size'
        elif from_unit in self.time_units and to_unit in self.time_units:
            return 'time'
        elif from_unit in ['c', 'f', 'k', 'celsius', 'fahrenheit', 'kelvin'] and \
             to_unit in ['c', 'f', 'k', 'celsius', 'fahrenheit', 'kelvin']:
            return 'temperature'
        else:
            # Assume moeda se não reconheceu outros tipos
            return 'currency'
    
    def _convert_size(self, value, from_unit, to_unit):
        """Converte unidades de tamanho"""
        if from_unit not in self.size_units:
            print_error(f"Unidade de origem não reconhecida: {from_unit}")
            return None
        
        if to_unit not in self.size_units:
            print_error(f"Unidade de destino não reconhecida: {to_unit}")
            return None
        
        # Converte para bytes, depois para unidade destino
        bytes_value = value * self.size_units[from_unit]
        result = bytes_value / self.size_units[to_unit]
        
        return round(result, 6) if result != int(result) else int(result)
    
    def _convert_time(self, value, from_unit, to_unit):
        """Converte unidades de tempo"""
        if from_unit not in self.time_units:
            print_error(f"Unidade de origem não reconhecida: {from_unit}")
            return None
        
        if to_unit not in self.time_units:
            print_error(f"Unidade de destino não reconhecida: {to_unit}")
            return None
        
        # Converte para segundos, depois para unidade destino
        seconds_value = value * self.time_units[from_unit]
        result = seconds_value / self.time_units[to_unit]
        
        return round(result, 6) if result != int(result) else int(result)
    
    def _convert_temperature(self, value, from_unit, to_unit):
        """Converte unidades de temperatura"""
        # Normaliza nomes de unidades
        temp_map = {
            'celsius': 'c', 'fahrenheit': 'f', 'kelvin': 'k'
        }
        
        from_unit = temp_map.get(from_unit, from_unit)
        to_unit = temp_map.get(to_unit, to_unit)
        
        if from_unit == to_unit:
            return value
        
        conversion_key = (from_unit, to_unit)
        if conversion_key in self.temperature_conversions:
            result = self.temperature_conversions[conversion_key](value)
            return round(result, 2)
        else:
            print_error(f"Conversão de temperatura não suportada: {from_unit} → {to_unit}")
            return None
    
    def _convert_currency(self, value, from_currency, to_currency):
        """Converte moedas usando API"""
        from_currency = from_currency.upper()
        to_currency = to_currency.upper()
        
        if from_currency == to_currency:
            return value
        
        # Verifica cache
        cached_rate = self._get_cached_rate(from_currency, to_currency)
        if cached_rate:
            return round(value * cached_rate, 2)
        
        # Busca taxa atual
        api_key = self.config.get('currency', 'api_key')
        if not api_key:
            print_warning("Chave da API de moeda não configurada. Use: devtools config set currency api_key SUA_CHAVE")
            print_info("Você pode obter uma chave gratuita em: https://exchangerate-api.com/")
            return None
        
        try:
            url = f"https://v6.exchangerate-api.com/v6/{api_key}/pair/{from_currency}/{to_currency}"
            response = requests.get(url, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                if data['result'] == 'success':
                    rate = data['conversion_rate']
                    
                    # Salva no cache
                    self._cache_rate(from_currency, to_currency, rate)
                    
                    return round(value * rate, 2)
                else:
                    print_error(f"Erro da API: {data.get('error-type', 'Desconhecido')}")
            else:
                print_error(f"Erro HTTP: {response.status_code}")
        
        except requests.RequestException as e:
            print_error(f"Erro de rede: {e}")
        except Exception as e:
            print_error(f"Erro ao converter moeda: {e}")
        
        return None
    
    def _get_cached_rate(self, from_currency, to_currency):
        """Obtém taxa do cache se válida"""
        cache_file = self.cache_dir / f"{from_currency}_{to_currency}.json"
        
        if not cache_file.exists():
            return None
        
        try:
            with open(cache_file, 'r') as f:
                data = json.load(f)
            
            # Verifica se cache não expirou
            cache_duration = self.config.get_int('currency', 'cache_duration', 3600)
            if time.time() - data['timestamp'] < cache_duration:
                return data['rate']
        
        except Exception:
            pass
        
        return None
    
    def _cache_rate(self, from_currency, to_currency, rate):
        """Salva taxa no cache"""
        cache_file = self.cache_dir / f"{from_currency}_{to_currency}.json"
        
        try:
            data = {
                'rate': rate,
                'timestamp': time.time(),
                'from': from_currency,
                'to': to_currency
            }
            
            with open(cache_file, 'w') as f:
                json.dump(data, f)
        
        except Exception as e:
            print_warning(f"Erro ao salvar cache: {e}")
    
    def list_supported_units(self):
        """Lista unidades suportadas"""
        from rich.console import Console
        from rich.table import Table
        
        console = Console()
        
        # Tabela de tamanhos
        size_table = Table(title="Unidades de Tamanho")
        size_table.add_column("Unidade", style="cyan")
        size_table.add_column("Aliases", style="magenta")
        
        size_groups = {
            'Bytes': ['b', 'byte', 'bytes'],
            'Kilobytes': ['kb', 'kilobyte', 'kilobytes'],
            'Megabytes': ['mb', 'megabyte', 'megabytes'],
            'Gigabytes': ['gb', 'gigabyte', 'gigabytes'],
            'Terabytes': ['tb', 'terabyte', 'terabytes'],
            'Petabytes': ['pb', 'petabyte', 'petabytes']
        }
        
        for unit, aliases in size_groups.items():
            size_table.add_row(unit, ', '.join(aliases))
        
        console.print(size_table)
        console.print()
        
        # Tabela de tempo
        time_table = Table(title="Unidades de Tempo")
        time_table.add_column("Unidade", style="cyan")
        time_table.add_column("Aliases", style="magenta")
        
        time_groups = {
            'Milissegundos': ['ms', 'millisecond', 'milliseconds'],
            'Segundos': ['s', 'sec', 'second', 'seconds'],
            'Minutos': ['min', 'minute', 'minutes'],
            'Horas': ['h', 'hour', 'hours'],
            'Dias': ['d', 'day', 'days'],
            'Semanas': ['w', 'week', 'weeks'],
            'Meses': ['month', 'months'],
            'Anos': ['y', 'year', 'years']
        }
        
        for unit, aliases in time_groups.items():
            time_table.add_row(unit, ', '.join(aliases))
        
        console.print(time_table)
        console.print()
        
        # Tabela de temperatura
        temp_table = Table(title="Unidades de Temperatura")
        temp_table.add_column("Unidade", style="cyan")
        temp_table.add_column("Aliases", style="magenta")
        
        temp_table.add_row("Celsius", "c, celsius")
        temp_table.add_row("Fahrenheit", "f, fahrenheit")
        temp_table.add_row("Kelvin", "k, kelvin")
        
        console.print(temp_table)
        console.print()
        
        console.print("💰 [bold]Moedas:[/bold] Use códigos ISO 4217 (USD, EUR, BRL, etc.)")
        console.print("   Requer configuração de API key: devtools config set currency api_key SUA_CHAVE")