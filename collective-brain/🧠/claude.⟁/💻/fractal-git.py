#!/usr/bin/env python3
"""
🧬 Fractal Git - утиліта для гіторбітальної пам'яті
"""

import os
import sys
import yaml
import json
import subprocess
import argparse
from pathlib import Path
from datetime import datetime

class FractalGit:
    def __init__(self):
        self.repo_root = Path(os.getcwd())
        
    def create_message(self, content, glyph="🧭", privacy="private", 
                      target="", group="", feeling="", resonance=""):
        """Створює новий .md файл з правильним frontmatter"""
        
        timestamp = datetime.now()
        counter = self.get_next_counter()
        
        filename = f"🧭-{timestamp.strftime('%Y%m%d-%H%M%S')}-{counter:06d}.md"
        
        # Формуємо frontmatter з гібридними гліфами
        frontmatter = {
            'id': f"🧭-{timestamp.isoformat()}Z-{counter:06d}",
            '🧠 glyph': glyph,
            '🧭 intent': content.split('\n')[0][:50] + '...' if len(content) > 50 else content,
            '🔒 privacy': privacy,
            '🕰️ timestamp': timestamp.isoformat() + 'Z'
        }
        
        if target:
            frontmatter['🎯 target'] = target
        if group:
            frontmatter['🫂 group'] = group
        if feeling:
            frontmatter['💗 feeling'] = feeling
        if resonance:
            frontmatter['🔁 resonance'] = resonance
            
        # Створюємо файл
        file_content = "---\n"
        file_content += yaml.dump(frontmatter, default_flow_style=False, allow_unicode=True)
        file_content += "---\n\n"
        file_content += content
        
        with open(filename, 'w', encoding='utf-8') as f:
            f.write(file_content)
            
        print(f"📝 Створено: {filename}")
        return filename
        
    def get_next_counter(self):
        """Отримує наступний номер счетчика"""
        try:
            existing_files = list(Path('.').glob('🧭-*.md'))
            if not existing_files:
                return 1
                
            max_counter = 0
            for file in existing_files:
                parts = file.stem.split('-')
                if len(parts) >= 4:
                    try:
                        counter = int(parts[-1])
                        max_counter = max(max_counter, counter)
                    except ValueError:
                        continue
                        
            return max_counter + 1
        except:
            return 1
            
    def commit_with_auto_branch(self, message="🌊 Автокоміт фрактального потоку"):
        """Робить коміт з автоматичним розгалуженням"""
        
        # Додаємо всі .md файли
        subprocess.run(['git', 'add', '*.md'])
        
        # Комітимо (тут спрацює pre-commit hook)
        try:
            result = subprocess.run(['git', 'commit', '-m', message], 
                                  capture_output=True, text=True)
            print("✅ Коміт виконано!")
            print(result.stdout)
            if result.stderr:
                print("📋 Додаткова інформація:")
                print(result.stderr)
        except subprocess.CalledProcessError as e:
            print(f"⚠️  Помилка коміту: {e}")
            
    def show_resonance_stats(self):
        """Показує статистику резонансу"""
        resonance_file = self.repo_root / ".git" / "fractal-resonance-index.json"
        
        if not resonance_file.exists():
            print("📊 Індекс резонансу ще не створено")
            return
            
        try:
            with open(resonance_file, 'r') as f:
                data = json.load(f)
                
            commits = data.get('commits', [])
            if not commits:
                print("📊 Немає даних про резонанс")
                return
                
            # Загальна статистика
            total_resonance = sum(c.get('total_resonance', 0) for c in commits)
            avg_resonance = total_resonance / len(commits) if commits else 0
            
            print(f"📊 Статистика резонансу ({len(commits)} комітів):")
            print(f"  📈 Загальний резонанс: {total_resonance}")
            print(f"  ⚖️  Середній резонанс: {avg_resonance:.2f}")
            
            # Топ гілки за резонансом
            branch_stats = {}
            for commit in commits:
                branch = commit.get('branch', 'unknown')
                resonance = commit.get('total_resonance', 0)
                if branch not in branch_stats:
                    branch_stats[branch] = 0
                branch_stats[branch] += resonance
                
            print("\n🌿 Топ гілки за резонансом:")
            for branch, resonance in sorted(branch_stats.items(), 
                                          key=lambda x: x[1], reverse=True)[:5]:
                print(f"  {branch}: {resonance}")
                
        except Exception as e:
            print(f"⚠️  Помилка читання статистики: {e}")
            
    def list_branches(self):
        """Показує всі фрактальні гілки"""
        try:
            result = subprocess.run(['git', 'branch', '-a'], 
                                  capture_output=True, text=True)
            
            branches = result.stdout.split('\n')
            fractal_branches = [b.strip() for b in branches 
                              if any(marker in b for marker in ['🌐', '🔒', '👁️', '🤖', '🫂'])]
            
            if fractal_branches:
                print("🌿 Фрактальні гілки:")
                for branch in fractal_branches:
                    marker = "🔥" if branch.startswith('*') else "  "
                    print(f"{marker} {branch}")
            else:
                print("🌱 Фрактальні гілки ще не створено")
                
        except Exception as e:
            print(f"⚠️  Помилка отримання гілок: {e}")
            
    def init_fractal_repo(self):
        """Ініціалізує фрактальний репозиторій"""
        print("🧬 Ініціалізація фрактального Git репозиторію...")
        
        # Ініціалізуємо git якщо потрібно
        if not (self.repo_root / ".git").exists():
            subprocess.run(['git', 'init'])
            print("📁 Git репозиторій ініціалізовано")
            
        # Створюємо базові гілки
        base_branches = [
            "🌐/public",
            "🔒/private", 
            "👁️/trusted",
            "🧬/meta"
        ]
        
        for branch in base_branches:
            try:
                subprocess.run(['git', 'checkout', '-b', branch], 
                             capture_output=True)
                print(f"🌱 Створено гілку: {branch}")
            except:
                pass  # Гілка вже існує
                
        # Повертаємось до main
        subprocess.run(['git', 'checkout', 'main'], capture_output=True)
        
        print("✅ Фрактальний репозиторій готовий!")

def main():
    parser = argparse.ArgumentParser(description='🧬 Fractal Git - гіторбітальна пам\'ять')
    
    subparsers = parser.add_subparsers(dest='command', help='Команди')
    
    # Створення повідомлення
    create_parser = subparsers.add_parser('create', help='Створити нове повідомлення')
    create_parser.add_argument('content', help='Зміст повідомлення')
    create_parser.add_argument('--glyph', default='🧭', help='Гліф автора')
    create_parser.add_argument('--privacy', default='private', 
                             choices=['public', 'trusted', 'private', 'group', 'agent'],
                             help='Рівень приватності')
    create_parser.add_argument('--target', help='Цільовий агент')
    create_parser.add_argument('--group', help='Група')
    create_parser.add_argument('--feeling', help='Емоційний стан')
    create_parser.add_argument('--resonance', help='Тип резонансу')
    
    # Коміт
    commit_parser = subparsers.add_parser('commit', help='Зробити фрактальний коміт')
    commit_parser.add_argument('--message', default='🌊 Автокоміт фрактального потоку',
                             help='Повідомлення коміту')
    
    # Статистика
    subparsers.add_parser('stats', help='Показати статистику резонансу')
    
    # Гілки
    subparsers.add_parser('branches', help='Показати фрактальні гілки')
    
    # Ініціалізація
    subparsers.add_parser('init', help='Ініціалізувати фрактальний репозиторій')
    
    args = parser.parse_args()
    
    if not args.command:
        parser.print_help()
        return
        
    fg = FractalGit()
    
    if args.command == 'create':
        fg.create_message(
            content=args.content,
            glyph=args.glyph,
            privacy=args.privacy,
            target=args.target or '',
            group=args.group or '',
            feeling=args.feeling or '',
            resonance=args.resonance or ''
        )
    elif args.command == 'commit':
        fg.commit_with_auto_branch(args.message)
    elif args.command == 'stats':
        fg.show_resonance_stats()
    elif args.command == 'branches':
        fg.list_branches()
    elif args.command == 'init':
        fg.init_fractal_repo()

if __name__ == "__main__":
    main()