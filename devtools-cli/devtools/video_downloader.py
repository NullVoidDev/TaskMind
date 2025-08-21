"""
Downloader de vídeos do DevTools CLI
"""
import os
import subprocess
import json
from pathlib import Path
from urllib.parse import urlparse
from .utils import print_success, print_error, print_info, print_warning

class VideoDownloader:
    def __init__(self, config):
        self.config = config
        self.supported_sites = [
            'youtube.com', 'youtu.be', 'vimeo.com', 'dailymotion.com',
            'twitch.tv', 'facebook.com', 'instagram.com', 'tiktok.com'
        ]
    
    def download(self, url, output_dir=None, format_selector='best', audio_only=False):
        """Baixa vídeo da URL especificada"""
        
        # Verifica se yt-dlp está instalado
        if not self._check_ytdlp():
            return False
        
        # Define diretório de saída
        if not output_dir:
            output_dir = self.config.get('general', 'default_download_path', 
                                       os.path.join(os.path.expanduser("~"), 'Downloads'))
        
        output_path = Path(output_dir)
        output_path.mkdir(parents=True, exist_ok=True)
        
        # Valida URL
        if not self._validate_url(url):
            return False
        
        try:
            print_info(f"Iniciando download de: {url}")
            
            # Constrói comando yt-dlp
            cmd = self._build_command(url, output_path, format_selector, audio_only)
            
            # Executa download
            result = subprocess.run(cmd, capture_output=True, text=True)
            
            if result.returncode == 0:
                print_success(f"Download concluído! Salvo em: {output_path}")
                return True
            else:
                print_error(f"Erro no download: {result.stderr}")
                return False
        
        except Exception as e:
            print_error(f"Erro inesperado: {e}")
            return False
    
    def _check_ytdlp(self):
        """Verifica se yt-dlp está instalado"""
        try:
            result = subprocess.run(['yt-dlp', '--version'], 
                                  capture_output=True, text=True)
            if result.returncode == 0:
                return True
        except FileNotFoundError:
            pass
        
        print_error("yt-dlp não encontrado. Instale com: pip install yt-dlp")
        return False
    
    def _validate_url(self, url):
        """Valida se a URL é suportada"""
        try:
            parsed = urlparse(url)
            domain = parsed.netloc.lower()
            
            # Remove www. se presente
            if domain.startswith('www.'):
                domain = domain[4:]
            
            # Verifica se é um site suportado
            supported = any(site in domain for site in self.supported_sites)
            
            if not supported:
                print_warning(f"Site pode não ser suportado: {domain}")
                print_info("Sites suportados: " + ", ".join(self.supported_sites))
            
            return True
        
        except Exception:
            print_error("URL inválida")
            return False
    
    def _build_command(self, url, output_path, format_selector, audio_only):
        """Constrói comando yt-dlp"""
        cmd = ['yt-dlp']
        
        # Formato de saída
        if audio_only:
            cmd.extend(['-f', 'bestaudio/best'])
            cmd.extend(['--extract-audio'])
            cmd.extend(['--audio-format', 'mp3'])
            filename_template = '%(title)s.%(ext)s'
        else:
            cmd.extend(['-f', format_selector])
            filename_template = '%(title)s.%(ext)s'
        
        # Template de nome do arquivo
        cmd.extend(['-o', str(output_path / filename_template)])
        
        # Opções adicionais
        cmd.extend(['--no-playlist'])  # Baixa apenas o vídeo, não playlist
        cmd.extend(['--write-description'])  # Salva descrição
        cmd.extend(['--write-info-json'])  # Salva metadados
        cmd.extend(['--embed-subs'])  # Incorpora legendas se disponíveis
        
        cmd.append(url)
        
        return cmd
    
    def get_video_info(self, url):
        """Obtém informações do vídeo sem baixar"""
        if not self._check_ytdlp():
            return None
        
        try:
            cmd = ['yt-dlp', '--dump-json', '--no-playlist', url]
            result = subprocess.run(cmd, capture_output=True, text=True)
            
            if result.returncode == 0:
                info = json.loads(result.stdout)
                return self._format_video_info(info)
            else:
                print_error(f"Erro ao obter informações: {result.stderr}")
                return None
        
        except Exception as e:
            print_error(f"Erro ao processar informações: {e}")
            return None
    
    def _format_video_info(self, info):
        """Formata informações do vídeo"""
        formatted = {
            'title': info.get('title', 'N/A'),
            'uploader': info.get('uploader', 'N/A'),
            'duration': self._format_duration(info.get('duration')),
            'view_count': info.get('view_count', 0),
            'upload_date': info.get('upload_date', 'N/A'),
            'description': info.get('description', 'N/A')[:200] + '...' if info.get('description') else 'N/A',
            'formats': []
        }
        
        # Processa formatos disponíveis
        if 'formats' in info:
            for fmt in info['formats'][-10:]:  # Últimos 10 formatos
                format_info = {
                    'format_id': fmt.get('format_id', ''),
                    'ext': fmt.get('ext', ''),
                    'resolution': fmt.get('resolution', 'audio only' if not fmt.get('height') else f"{fmt.get('height')}p"),
                    'filesize': self._format_filesize(fmt.get('filesize'))
                }
                formatted['formats'].append(format_info)
        
        return formatted
    
    def _format_duration(self, duration):
        """Formata duração em segundos para HH:MM:SS"""
        if not duration:
            return 'N/A'
        
        hours = duration // 3600
        minutes = (duration % 3600) // 60
        seconds = duration % 60
        
        if hours > 0:
            return f"{hours:02d}:{minutes:02d}:{seconds:02d}"
        else:
            return f"{minutes:02d}:{seconds:02d}"
    
    def _format_filesize(self, filesize):
        """Formata tamanho do arquivo"""
        if not filesize:
            return 'N/A'
        
        for unit in ['B', 'KB', 'MB', 'GB']:
            if filesize < 1024:
                return f"{filesize:.1f} {unit}"
            filesize /= 1024
        
        return f"{filesize:.1f} TB"
    
    def list_formats(self, url):
        """Lista formatos disponíveis para download"""
        if not self._check_ytdlp():
            return False
        
        try:
            cmd = ['yt-dlp', '-F', url]
            result = subprocess.run(cmd, capture_output=True, text=True)
            
            if result.returncode == 0:
                print_info("Formatos disponíveis:")
                print(result.stdout)
                return True
            else:
                print_error(f"Erro ao listar formatos: {result.stderr}")
                return False
        
        except Exception as e:
            print_error(f"Erro: {e}")
            return False
    
    def download_playlist(self, url, output_dir=None, format_selector='best', 
                         audio_only=False, max_downloads=None):
        """Baixa playlist completa"""
        if not self._check_ytdlp():
            return False
        
        # Define diretório de saída
        if not output_dir:
            output_dir = self.config.get('general', 'default_download_path',
                                       os.path.join(os.path.expanduser("~"), 'Downloads'))
        
        output_path = Path(output_dir)
        output_path.mkdir(parents=True, exist_ok=True)
        
        try:
            print_info(f"Iniciando download da playlist: {url}")
            
            cmd = ['yt-dlp']
            
            # Formato
            if audio_only:
                cmd.extend(['-f', 'bestaudio/best'])
                cmd.extend(['--extract-audio'])
                cmd.extend(['--audio-format', 'mp3'])
                filename_template = '%(playlist_index)s - %(title)s.%(ext)s'
            else:
                cmd.extend(['-f', format_selector])
                filename_template = '%(playlist_index)s - %(title)s.%(ext)s'
            
            # Template de nome
            cmd.extend(['-o', str(output_path / filename_template)])
            
            # Limita número de downloads se especificado
            if max_downloads:
                cmd.extend(['--playlist-end', str(max_downloads)])
            
            # Opções adicionais
            cmd.extend(['--write-description'])
            cmd.extend(['--write-info-json'])
            
            cmd.append(url)
            
            result = subprocess.run(cmd, capture_output=True, text=True)
            
            if result.returncode == 0:
                print_success(f"Playlist baixada! Salva em: {output_path}")
                return True
            else:
                print_error(f"Erro no download da playlist: {result.stderr}")
                return False
        
        except Exception as e:
            print_error(f"Erro inesperado: {e}")
            return False
    
    def search_videos(self, query, max_results=10):
        """Busca vídeos no YouTube"""
        if not self._check_ytdlp():
            return []
        
        try:
            search_url = f"ytsearch{max_results}:{query}"
            cmd = ['yt-dlp', '--dump-json', '--no-playlist', search_url]
            
            result = subprocess.run(cmd, capture_output=True, text=True)
            
            if result.returncode == 0:
                videos = []
                for line in result.stdout.strip().split('\n'):
                    if line:
                        try:
                            info = json.loads(line)
                            video = {
                                'title': info.get('title', 'N/A'),
                                'url': info.get('webpage_url', ''),
                                'uploader': info.get('uploader', 'N/A'),
                                'duration': self._format_duration(info.get('duration')),
                                'view_count': info.get('view_count', 0)
                            }
                            videos.append(video)
                        except json.JSONDecodeError:
                            continue
                
                return videos
            else:
                print_error(f"Erro na busca: {result.stderr}")
                return []
        
        except Exception as e:
            print_error(f"Erro na busca: {e}")
            return []