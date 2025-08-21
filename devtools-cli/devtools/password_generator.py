"""
Gerador de senhas e códigos aleatórios do DevTools CLI
"""
import secrets
import string
import random
from .utils import print_error, print_info

class PasswordGenerator:
    def __init__(self, config):
        self.config = config
    
    def generate(self, length=None, include_symbols=True, include_numbers=True, 
                 include_uppercase=True, include_lowercase=True, count=1):
        """Gera senhas seguras"""
        
        # Usa configurações padrão se não especificado
        if length is None:
            length = self.config.get_int('password', 'default_length', 16)
        
        if include_symbols is None:
            include_symbols = self.config.get_bool('password', 'include_symbols', True)
        
        if include_numbers is None:
            include_numbers = self.config.get_bool('password', 'include_numbers', True)
        
        if include_uppercase is None:
            include_uppercase = self.config.get_bool('password', 'include_uppercase', True)
        
        if include_lowercase is None:
            include_lowercase = self.config.get_bool('password', 'include_lowercase', True)
        
        # Valida parâmetros
        if length < 1:
            print_error("Comprimento da senha deve ser maior que 0")
            return []
        
        if length > 256:
            print_error("Comprimento máximo da senha é 256 caracteres")
            return []
        
        if count < 1 or count > 100:
            print_error("Quantidade deve ser entre 1 e 100")
            return []
        
        # Constrói conjunto de caracteres
        charset = ""
        
        if include_lowercase:
            charset += string.ascii_lowercase
        
        if include_uppercase:
            charset += string.ascii_uppercase
        
        if include_numbers:
            charset += string.digits
        
        if include_symbols:
            charset += "!@#$%^&*()_+-=[]{}|;:,.<>?"
        
        if not charset:
            print_error("Pelo menos um tipo de caractere deve ser incluído")
            return []
        
        passwords = []
        for _ in range(count):
            password = self._generate_secure_password(charset, length, 
                                                    include_symbols, include_numbers,
                                                    include_uppercase, include_lowercase)
            passwords.append(password)
        
        return passwords
    
    def _generate_secure_password(self, charset, length, include_symbols, 
                                 include_numbers, include_uppercase, include_lowercase):
        """Gera uma senha segura garantindo que todos os tipos solicitados estejam presentes"""
        
        password = []
        remaining_length = length
        
        # Garante pelo menos um caractere de cada tipo solicitado
        if include_lowercase and remaining_length > 0:
            password.append(secrets.choice(string.ascii_lowercase))
            remaining_length -= 1
        
        if include_uppercase and remaining_length > 0:
            password.append(secrets.choice(string.ascii_uppercase))
            remaining_length -= 1
        
        if include_numbers and remaining_length > 0:
            password.append(secrets.choice(string.digits))
            remaining_length -= 1
        
        if include_symbols and remaining_length > 0:
            password.append(secrets.choice("!@#$%^&*()_+-=[]{}|;:,.<>?"))
            remaining_length -= 1
        
        # Preenche o resto aleatoriamente
        for _ in range(remaining_length):
            password.append(secrets.choice(charset))
        
        # Embaralha a senha para evitar padrões previsíveis
        random.shuffle(password)
        
        return ''.join(password)
    
    def generate_pin(self, length=4, count=1):
        """Gera PINs numéricos"""
        if length < 1 or length > 20:
            print_error("Comprimento do PIN deve ser entre 1 e 20")
            return []
        
        if count < 1 or count > 100:
            print_error("Quantidade deve ser entre 1 e 100")
            return []
        
        pins = []
        for _ in range(count):
            pin = ''.join(secrets.choice(string.digits) for _ in range(length))
            pins.append(pin)
        
        return pins
    
    def generate_hex(self, length=32, count=1):
        """Gera códigos hexadecimais"""
        if length < 1 or length > 256:
            print_error("Comprimento deve ser entre 1 e 256")
            return []
        
        if count < 1 or count > 100:
            print_error("Quantidade deve ser entre 1 e 100")
            return []
        
        hex_codes = []
        for _ in range(count):
            hex_code = secrets.token_hex(length // 2)
            if length % 2 == 1:
                hex_code += secrets.choice('0123456789abcdef')
            hex_codes.append(hex_code)
        
        return hex_codes
    
    def generate_base64(self, length=32, count=1):
        """Gera códigos base64"""
        if length < 1 or length > 256:
            print_error("Comprimento deve ser entre 1 e 256")
            return []
        
        if count < 1 or count > 100:
            print_error("Quantidade deve ser entre 1 e 100")
            return []
        
        base64_codes = []
        for _ in range(count):
            # Calcula bytes necessários para obter o comprimento desejado
            bytes_needed = (length * 3 + 3) // 4
            code = secrets.token_urlsafe(bytes_needed)[:length]
            base64_codes.append(code)
        
        return base64_codes
    
    def generate_uuid(self, count=1, version=4):
        """Gera UUIDs"""
        import uuid
        
        if count < 1 or count > 100:
            print_error("Quantidade deve ser entre 1 e 100")
            return []
        
        uuids = []
        for _ in range(count):
            if version == 1:
                new_uuid = str(uuid.uuid1())
            elif version == 4:
                new_uuid = str(uuid.uuid4())
            else:
                print_error("Versão de UUID não suportada. Use 1 ou 4")
                return []
            
            uuids.append(new_uuid)
        
        return uuids
    
    def generate_memorable_password(self, word_count=4, separator='-', 
                                   include_numbers=True, count=1):
        """Gera senhas memoráveis usando palavras"""
        
        # Lista de palavras comuns (simplificada)
        words = [
            'casa', 'gato', 'sol', 'mar', 'flor', 'luz', 'paz', 'amor',
            'vida', 'tempo', 'agua', 'terra', 'fogo', 'vento', 'lua', 'estrela',
            'ponte', 'porta', 'janela', 'mesa', 'cadeira', 'livro', 'papel', 'caneta',
            'verde', 'azul', 'vermelho', 'branco', 'preto', 'dourado', 'prata', 'rosa',
            'grande', 'pequeno', 'alto', 'baixo', 'rapido', 'lento', 'forte', 'fraco',
            'novo', 'velho', 'quente', 'frio', 'doce', 'amargo', 'feliz', 'triste'
        ]
        
        if word_count < 2 or word_count > 8:
            print_error("Número de palavras deve ser entre 2 e 8")
            return []
        
        if count < 1 or count > 100:
            print_error("Quantidade deve ser entre 1 e 100")
            return []
        
        passwords = []
        for _ in range(count):
            selected_words = []
            for _ in range(word_count):
                word = secrets.choice(words)
                # Capitaliza primeira letra aleatoriamente
                if secrets.choice([True, False]):
                    word = word.capitalize()
                selected_words.append(word)
            
            password = separator.join(selected_words)
            
            # Adiciona números se solicitado
            if include_numbers:
                number = secrets.randbelow(1000)
                password += str(number)
            
            passwords.append(password)
        
        return passwords
    
    def check_password_strength(self, password):
        """Avalia a força de uma senha"""
        score = 0
        feedback = []
        
        # Comprimento
        length = len(password)
        if length >= 12:
            score += 2
        elif length >= 8:
            score += 1
        else:
            feedback.append("Use pelo menos 8 caracteres")
        
        # Tipos de caracteres
        has_lower = any(c.islower() for c in password)
        has_upper = any(c.isupper() for c in password)
        has_digit = any(c.isdigit() for c in password)
        has_symbol = any(c in "!@#$%^&*()_+-=[]{}|;:,.<>?" for c in password)
        
        char_types = sum([has_lower, has_upper, has_digit, has_symbol])
        score += char_types
        
        if not has_lower:
            feedback.append("Inclua letras minúsculas")
        if not has_upper:
            feedback.append("Inclua letras maiúsculas")
        if not has_digit:
            feedback.append("Inclua números")
        if not has_symbol:
            feedback.append("Inclua símbolos")
        
        # Padrões comuns
        common_patterns = ['123', 'abc', 'qwerty', 'password', 'admin']
        if any(pattern in password.lower() for pattern in common_patterns):
            score -= 2
            feedback.append("Evite padrões comuns")
        
        # Repetições
        if len(set(password)) < len(password) * 0.7:
            score -= 1
            feedback.append("Evite muitas repetições")
        
        # Classificação
        if score >= 6:
            strength = "Muito Forte"
            color = "green"
        elif score >= 4:
            strength = "Forte"
            color = "blue"
        elif score >= 2:
            strength = "Moderada"
            color = "yellow"
        else:
            strength = "Fraca"
            color = "red"
        
        return {
            'score': max(0, score),
            'strength': strength,
            'color': color,
            'feedback': feedback
        }