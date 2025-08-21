"""
Calculadora do DevTools CLI
"""
import math
import re
from decimal import Decimal, getcontext
from .utils import print_error

class Calculator:
    def __init__(self, config):
        self.config = config
        
        # Funções matemáticas disponíveis
        self.functions = {
            # Trigonométricas
            'sin': math.sin, 'cos': math.cos, 'tan': math.tan,
            'asin': math.asin, 'acos': math.acos, 'atan': math.atan,
            'sinh': math.sinh, 'cosh': math.cosh, 'tanh': math.tanh,
            
            # Logarítmicas
            'log': math.log, 'log10': math.log10, 'ln': math.log, 'log2': math.log2,
            
            # Outras
            'sqrt': math.sqrt, 'abs': abs, 'ceil': math.ceil, 'floor': math.floor,
            'round': round, 'exp': math.exp, 'pow': pow,
            'factorial': math.factorial, 'gcd': math.gcd,
            
            # Conversões angulares
            'radians': math.radians, 'degrees': math.degrees
        }
        
        # Constantes matemáticas
        self.constants = {
            'pi': math.pi, 'e': math.e, 'tau': math.tau,
            'inf': math.inf, 'nan': math.nan
        }
    
    def calculate(self, expression, precision=None, use_degrees=False):
        """Calcula expressão matemática"""
        try:
            # Define precisão
            if precision is None:
                precision = self.config.get_int('calculator', 'precision', 10)
            
            getcontext().prec = precision
            
            # Limpa e valida expressão
            expression = self._clean_expression(expression)
            if not self._validate_expression(expression):
                return None
            
            # Converte ângulos se necessário
            if use_degrees:
                expression = self._convert_to_radians(expression)
            
            # Substitui constantes e funções
            expression = self._substitute_constants(expression)
            expression = self._substitute_functions(expression)
            
            # Prepara namespace com funções matemáticas
            namespace = {}
            for name, func in self.functions.items():
                namespace[name] = func
            
            # Avalia expressão
            result = eval(expression, {"__builtins__": {}}, namespace)
            
            # Converte resultado para formato apropriado
            if isinstance(result, complex):
                if result.imag == 0:
                    result = result.real
                else:
                    return f"{result.real:.{precision}g} + {result.imag:.{precision}g}i"
            
            if isinstance(result, float):
                if result.is_integer():
                    return int(result)
                else:
                    return round(result, precision)
            
            return result
        
        except ZeroDivisionError:
            print_error("Divisão por zero")
        except ValueError as e:
            print_error(f"Erro de valor: {e}")
        except OverflowError:
            print_error("Resultado muito grande")
        except Exception as e:
            print_error(f"Erro na expressão: {e}")
        
        return None
    
    def _clean_expression(self, expression):
        """Limpa e normaliza expressão"""
        # Remove espaços
        expression = expression.replace(' ', '')
        
        # Substitui operadores alternativos
        expression = expression.replace('×', '*')
        expression = expression.replace('÷', '/')
        expression = expression.replace('^', '**')
        
        # Adiciona multiplicação implícita
        expression = re.sub(r'(\d)([a-zA-Z])', r'\1*\2', expression)  # 2pi -> 2*pi
        expression = re.sub(r'([a-zA-Z])(\d)', r'\1*\2', expression)  # pi2 -> pi*2
        expression = re.sub(r'(\))(\()', r'\1*\2', expression)        # )(  -> )*(
        expression = re.sub(r'(\d)(\()', r'\1*\2', expression)        # 2(  -> 2*(
        expression = re.sub(r'(\))(\d)', r'\1*\2', expression)        # )2  -> )*2
        
        return expression
    
    def _validate_expression(self, expression):
        """Valida se a expressão é segura"""
        # Lista de caracteres/palavras proibidas
        forbidden = [
            'import', 'exec', 'eval', 'open', 'file', 'input', 'raw_input',
            '__', 'globals', 'locals', 'vars', 'dir', 'help', 'exit', 'quit'
        ]
        
        for item in forbidden:
            if item in expression.lower():
                print_error(f"Expressão contém elemento proibido: {item}")
                return False
        
        # Verifica caracteres permitidos
        allowed_chars = set('0123456789+-*/().abcdefghijklmnopqrstuvwxyz_')
        if not all(c.lower() in allowed_chars for c in expression):
            print_error("Expressão contém caracteres inválidos")
            return False
        
        return True
    
    def _convert_to_radians(self, expression):
        """Converte funções trigonométricas para usar graus"""
        trig_functions = ['sin', 'cos', 'tan', 'asin', 'acos', 'atan']
        
        for func in trig_functions:
            if func in ['asin', 'acos', 'atan']:
                # Para funções inversas, converte resultado para graus
                pattern = f'{func}\\(([^)]+)\\)'
                expression = re.sub(pattern, f'degrees({func}(\\1))', expression)
            else:
                # Para funções diretas, converte entrada para radianos
                pattern = f'{func}\\(([^)]+)\\)'
                expression = re.sub(pattern, f'{func}(radians(\\1))', expression)
        
        return expression
    
    def _substitute_constants(self, expression):
        """Substitui constantes matemáticas"""
        for name, value in self.constants.items():
            expression = expression.replace(name, str(value))
        
        return expression
    
    def _substitute_functions(self, expression):
        """Prepara funções para avaliação"""
        # Cria namespace com funções matemáticas
        namespace = {}
        for name, func in self.functions.items():
            namespace[name] = func
        
        # Adiciona funções ao contexto de avaliação
        return expression
    
    def calculate_statistics(self, numbers):
        """Calcula estatísticas de uma lista de números"""
        try:
            if not numbers:
                print_error("Lista de números vazia")
                return None
            
            numbers = [float(x) for x in numbers]
            n = len(numbers)
            
            # Estatísticas básicas
            total = sum(numbers)
            mean = total / n
            
            # Mediana
            sorted_nums = sorted(numbers)
            if n % 2 == 0:
                median = (sorted_nums[n//2 - 1] + sorted_nums[n//2]) / 2
            else:
                median = sorted_nums[n//2]
            
            # Moda (valor mais frequente)
            from collections import Counter
            counts = Counter(numbers)
            mode_count = max(counts.values())
            modes = [num for num, count in counts.items() if count == mode_count]
            mode = modes[0] if len(modes) == 1 else modes
            
            # Variância e desvio padrão
            variance = sum((x - mean) ** 2 for x in numbers) / n
            std_dev = math.sqrt(variance)
            
            # Amplitude
            range_val = max(numbers) - min(numbers)
            
            return {
                'count': n,
                'sum': total,
                'mean': mean,
                'median': median,
                'mode': mode,
                'min': min(numbers),
                'max': max(numbers),
                'range': range_val,
                'variance': variance,
                'std_dev': std_dev
            }
        
        except Exception as e:
            print_error(f"Erro no cálculo de estatísticas: {e}")
            return None
    
    def solve_quadratic(self, a, b, c):
        """Resolve equação quadrática ax² + bx + c = 0"""
        try:
            if a == 0:
                if b == 0:
                    if c == 0:
                        return "Infinitas soluções"
                    else:
                        return "Sem solução"
                else:
                    # Equação linear
                    return f"x = {-c/b}"
            
            # Discriminante
            discriminant = b**2 - 4*a*c
            
            if discriminant > 0:
                x1 = (-b + math.sqrt(discriminant)) / (2*a)
                x2 = (-b - math.sqrt(discriminant)) / (2*a)
                return f"x₁ = {x1}, x₂ = {x2}"
            elif discriminant == 0:
                x = -b / (2*a)
                return f"x = {x} (raiz dupla)"
            else:
                real_part = -b / (2*a)
                imag_part = math.sqrt(-discriminant) / (2*a)
                return f"x₁ = {real_part} + {imag_part}i, x₂ = {real_part} - {imag_part}i"
        
        except Exception as e:
            print_error(f"Erro na resolução da equação: {e}")
            return None
    
    def convert_base(self, number, from_base, to_base):
        """Converte número entre diferentes bases"""
        try:
            if from_base < 2 or from_base > 36 or to_base < 2 or to_base > 36:
                print_error("Base deve estar entre 2 e 36")
                return None
            
            # Converte para decimal primeiro
            if from_base == 10:
                decimal_value = int(number)
            else:
                decimal_value = int(str(number), from_base)
            
            # Converte para base de destino
            if to_base == 10:
                return str(decimal_value)
            
            if decimal_value == 0:
                return "0"
            
            digits = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ"
            result = ""
            
            while decimal_value > 0:
                result = digits[decimal_value % to_base] + result
                decimal_value //= to_base
            
            return result
        
        except ValueError:
            print_error(f"Número inválido para base {from_base}")
        except Exception as e:
            print_error(f"Erro na conversão: {e}")
        
        return None
    
    def calculate_compound_interest(self, principal, rate, time, compound_frequency=1):
        """Calcula juros compostos"""
        try:
            rate = rate / 100  # Converte porcentagem
            amount = principal * (1 + rate/compound_frequency) ** (compound_frequency * time)
            interest = amount - principal
            
            return {
                'principal': principal,
                'rate': rate * 100,
                'time': time,
                'compound_frequency': compound_frequency,
                'final_amount': round(amount, 2),
                'interest_earned': round(interest, 2)
            }
        
        except Exception as e:
            print_error(f"Erro no cálculo de juros: {e}")
            return None