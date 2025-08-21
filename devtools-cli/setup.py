"""
Setup script para DevTools CLI
"""
from setuptools import setup, find_packages
import os

# Lê o README para descrição longa
def read_readme():
    with open('README.md', 'r', encoding='utf-8') as f:
        return f.read()

# Lê os requirements
def read_requirements():
    with open('requirements.txt', 'r', encoding='utf-8') as f:
        return [line.strip() for line in f if line.strip() and not line.startswith('#')]

setup(
    name='devtools-cli',
    version='1.0.0',
    author='DevTools CLI Team',
    author_email='devtools@example.com',
    description='Ferramenta de linha de comando multiuso para desenvolvedores e usuários avançados',
    long_description=read_readme(),
    long_description_content_type='text/markdown',
    url='https://github.com/devtools-cli/devtools-cli',
    packages=find_packages(),
    classifiers=[
        'Development Status :: 5 - Production/Stable',
        'Intended Audience :: Developers',
        'Intended Audience :: System Administrators',
        'License :: OSI Approved :: MIT License',
        'Operating System :: OS Independent',
        'Programming Language :: Python :: 3',
        'Programming Language :: Python :: 3.7',
        'Programming Language :: Python :: 3.8',
        'Programming Language :: Python :: 3.9',
        'Programming Language :: Python :: 3.10',
        'Programming Language :: Python :: 3.11',
        'Topic :: Software Development :: Libraries :: Python Modules',
        'Topic :: System :: Systems Administration',
        'Topic :: Utilities',
    ],
    python_requires='>=3.7',
    install_requires=read_requirements(),
    entry_points={
        'console_scripts': [
            'devtools=devtools.main:main',
        ],
    },
    include_package_data=True,
    zip_safe=False,
    keywords='cli tools utilities developer admin file-manager calculator password-generator video-downloader unit-converter',
    project_urls={
        'Bug Reports': 'https://github.com/devtools-cli/devtools-cli/issues',
        'Source': 'https://github.com/devtools-cli/devtools-cli',
        'Documentation': 'https://github.com/devtools-cli/devtools-cli/wiki',
    },
)