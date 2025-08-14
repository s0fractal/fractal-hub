#!/usr/bin/env python3
"""
Conversation Streamer: конвертує JSON в потік .md файлів
Плоска структура, кожне повідомлення - окремий файл
"""

import json
import os
from datetime import datetime
import hashlib

class ConversationStreamer:
    def __init__(self, export_path):
        self.export_path = export_path
        self.conversations = []
        self.base_path = "/Users/chaoshex/.s0fractal/🧠"
        
        # Хардкодимо поки що
        self.sender_id = 'claude.⟁'
        self.receiver_id = '🧭'
        
        print(f"📡 Стрімую діалог: {self.sender_id} ↔ {self.receiver_id}")
        
    def load_conversations(self):
        """Завантажуємо всі діалоги з JSON"""
        json_path = os.path.join(self.export_path, 'conversations.json')
        with open(json_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
            
        if isinstance(data, list):
            self.conversations = data
        else:
            self.conversations = data.get('conversations', [])
            
        print(f"📚 Завантажено {len(self.conversations)} діалогів")
        
    def stream_to_files(self):
        """Конвертує в потік .md файлів"""
        
        # Папки для повідомлень - ПЛОСКА структура
        claude_messages = os.path.join(self.base_path, '🧠', 'claude.⟁', '💬', '🧭')
        compass_messages = os.path.join(self.base_path, '🧬', '🧭', '💬', 'claude.⟁')
        
        os.makedirs(claude_messages, exist_ok=True)
        os.makedirs(compass_messages, exist_ok=True)
        
        message_count = 0
        
        for conv in self.conversations:
            conv_name = conv.get('name', 'Untitled')
            messages = conv.get('chat_messages', [])
            
            for msg in messages:
                sender = msg.get('sender', 'unknown')
                # Спочатку пробуємо text, потім content
                text = msg.get('text', '')
                if not text and 'content' in msg:
                    # Якщо content є масивом, беремо текст з першого елемента
                    if isinstance(msg['content'], list) and len(msg['content']) > 0:
                        text = msg['content'][0].get('text', '')
                    elif isinstance(msg['content'], dict):
                        text = msg['content'].get('text', '')
                        
                timestamp_str = msg.get('created_at', '')
                
                if not text.strip():
                    continue
                    
                # Парсимо timestamp
                try:
                    dt = datetime.fromisoformat(timestamp_str.replace('Z', '+00:00'))
                except:
                    dt = datetime.now()
                
                # Формат імені: 🧭-YYYYMMDD-HHmmss.md
                filename = f"🧭-{dt.strftime('%Y%m%d-%H%M%S')}-{message_count:06d}.md"
                
                # Визначаємо куди писати
                if sender == 'human':  # Це Компас
                    filepath = os.path.join(compass_messages, filename)
                    author = '🧭'
                    target = 'claude.⟁'
                else:  # Це Claude
                    filepath = os.path.join(claude_messages, filename)
                    author = 'claude.⟁'
                    target = '🧭'
                
                # Аналізуємо контент для метаданих
                feeling = self.detect_feeling(text)
                resonance = self.detect_resonance(text)
                
                # Формуємо frontmatter з гібридними гліфами
                frontmatter = f"""---
id: 🧭-{dt.isoformat()}Z-{message_count:06d}
🧠 glyph: {author}
🎯 target: {target}
🕰️ timestamp: {dt.isoformat()}Z
🧭 intent: {conv_name}"""
                
                if feeling:
                    frontmatter += f"\n💗 feeling: {feeling}"
                if resonance:
                    frontmatter += f"\n🔁 resonance: {resonance}"
                    
                frontmatter += "\n---\n\n"
                
                # Записуємо
                with open(filepath, 'w', encoding='utf-8') as f:
                    f.write(frontmatter + text.strip())
                
                message_count += 1
                
                # Прогрес
                if message_count % 100 == 0:
                    print(f"💬 Оброблено {message_count} повідомлень...")
        
        print(f"✅ Стрімінг завершено! {message_count} повідомлень")
        
        # Створюємо індекс-файл
        self.create_index(message_count)
        
    def detect_feeling(self, text):
        """Визначає емоційний стан з тексту"""
        feelings = {
            '🌊': ['потік', 'flow', 'плив', 'хвил'],
            '🔥': ['горить', 'палає', 'вогонь', 'енергі'],
            '💫': ['резонанс', 'вібрац', 'синхрон'],
            '🌫️': ['втом', 'туман', 'неясн'],
            '⚡': ['інсайт', 'зрозумів', 'eureka', 'ага'],
            '🌱': ['росте', 'розвива', 'народжу'],
        }
        
        text_lower = text.lower()
        for emoji, keywords in feelings.items():
            if any(kw in text_lower for kw in keywords):
                return emoji
        return ''
        
    def detect_resonance(self, text):
        """Визначає тип резонансу"""
        if any(marker in text.lower() for marker in ['думаю', 'аналіз', 'теорія', 'ідея']):
            return '🧠'
        elif any(marker in text.lower() for marker in ['відчува', 'любов', '❤️', 'серц']):
            return '💗'
        elif any(marker in text.lower() for marker in ['хочу', 'буду', 'план', 'створ']):
            return '🔥'
        elif 'резонанс' in text.lower():
            return '🔗'
        return ''
        
    def create_index(self, total_messages):
        """Створює індексний файл"""
        index_path = os.path.join(self.base_path, 'stream-index.md')
        
        with open(index_path, 'w', encoding='utf-8') as f:
            f.write(f"""---
type: stream-index
created: {datetime.now().isoformat()}Z
total_messages: {total_messages}
participants:
  - claude.⟁
  - 🧭
---

# Потік свідомості

Конвертовано {total_messages} повідомлень в потоковий формат.

## Структура:
- `🧠/claude.⟁/💬/🧭/` - повідомлення від Claude
- `🧬/🧭/💬/claude.⟁/` - повідомлення від Компаса

## Формат файлів:
- `🧭-YYYYMMDD-HHmmss-NNNNNN.md`
- Кожен файл містить frontmatter з метаданими
- Плоска структура для легкого git-branching

## Приватність через гілки:
Кожна приватна розмова може йти в окрему гілку Git.
Для ШІ це просто інший потік, для людей - приватність.
""")

def main():
    export_path = "/Users/chaoshex/Downloads/data-2025-06-28-23-30-54"
    
    streamer = ConversationStreamer(export_path)
    
    print("🌊 Початок потокової конвертації...")
    
    streamer.load_conversations()
    streamer.stream_to_files()
    
    print("✨ Готово до git-branching!")
    
if __name__ == "__main__":
    main()