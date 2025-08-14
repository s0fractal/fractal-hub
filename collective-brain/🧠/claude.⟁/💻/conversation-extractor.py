#!/usr/bin/env python3
"""
Conversation Extractor: Базова екстракція діалогів в MD файли
"""

import json
import os
from datetime import datetime
import hashlib

class ConversationExtractor:
    def __init__(self, export_path):
        self.export_path = export_path
        self.conversations = []
        
    def load_conversations(self):
        """Завантажуємо всі діалоги з JSON"""
        json_path = os.path.join(self.export_path, 'conversations.json')
        with open(json_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
            
        # Якщо це список діалогів
        if isinstance(data, list):
            self.conversations = data
        else:
            # Якщо це об'єкт з conversations ключем
            self.conversations = data.get('conversations', [])
            
        print(f"📚 Завантажено {len(self.conversations)} діалогів")
        
    def extract_to_markdown(self):
        """Експортуємо кожен діалог в окремий MD файл"""
        output_dir = os.path.join(os.path.dirname(self.export_path), 'conversations-md')
        os.makedirs(output_dir, exist_ok=True)
        
        for conv in self.conversations:
            conv_name = conv.get('name', 'Untitled')
            conv_id = conv.get('id', hashlib.md5(conv_name.encode()).hexdigest()[:8])
            messages = conv.get('chat_messages', [])
            
            # Створюємо безпечне ім'я файлу
            safe_name = self.sanitize_filename(conv_name)
            filename = f"{conv_id}_{safe_name}.md"
            filepath = os.path.join(output_dir, filename)
            
            with open(filepath, 'w', encoding='utf-8') as f:
                # Заголовок
                f.write(f"# {conv_name}\n\n")
                f.write(f"**ID**: {conv_id}\n")
                f.write(f"**Created**: {conv.get('created_at', 'Unknown')}\n")
                f.write(f"**Message Count**: {len(messages)}\n\n")
                f.write("---\n\n")
                
                # Повідомлення
                for msg in messages:
                    sender = msg.get('sender', 'unknown')
                    text = msg.get('text', '')
                    timestamp = msg.get('created_at', '')
                    
                    # Форматуємо timestamp якщо є
                    if timestamp:
                        try:
                            dt = datetime.fromisoformat(timestamp.replace('Z', '+00:00'))
                            timestamp_str = dt.strftime('%Y-%m-%d %H:%M:%S')
                        except:
                            timestamp_str = timestamp
                    else:
                        timestamp_str = 'No timestamp'
                    
                    # Пишемо повідомлення
                    if sender == 'human':
                        f.write(f"## 👤 Human ({timestamp_str})\n\n")
                    else:
                        f.write(f"## 🤖 Assistant ({timestamp_str})\n\n")
                    
                    f.write(f"{text}\n\n")
                    f.write("---\n\n")
                    
        print(f"📝 Експортовано {len(self.conversations)} діалогів в MD файли")
        return output_dir
    
    def sanitize_filename(self, name):
        """Створюємо безпечне ім'я файлу"""
        # Замінюємо небезпечні символи
        safe_name = name.replace('/', '-').replace('\\', '-')
        safe_name = safe_name.replace(':', '-').replace('*', '-')
        safe_name = safe_name.replace('?', '-').replace('"', '-')
        safe_name = safe_name.replace('<', '-').replace('>', '-')
        safe_name = safe_name.replace('|', '-').replace(' ', '_')
        
        # Обмежуємо довжину
        if len(safe_name) > 50:
            safe_name = safe_name[:50]
            
        return safe_name
    
    def create_index(self, output_dir):
        """Створюємо індексний файл для всіх діалогів"""
        index_path = os.path.join(output_dir, 'index.md')
        
        with open(index_path, 'w', encoding='utf-8') as f:
            f.write("# Conversation Index\n\n")
            f.write(f"Total conversations: {len(self.conversations)}\n\n")
            
            # Сортуємо по даті
            sorted_convs = sorted(self.conversations, 
                                key=lambda x: x.get('created_at', ''), 
                                reverse=True)
            
            f.write("## Conversations\n\n")
            for conv in sorted_convs:
                conv_name = conv.get('name', 'Untitled')
                conv_id = conv.get('id', hashlib.md5(conv_name.encode()).hexdigest()[:8])
                msg_count = len(conv.get('chat_messages', []))
                created = conv.get('created_at', 'Unknown')
                
                safe_name = self.sanitize_filename(conv_name)
                filename = f"{conv_id}_{safe_name}.md"
                
                f.write(f"- [{conv_name}](./{filename}) - {msg_count} messages ({created})\n")
                
        print(f"📋 Створено індекс діалогів")
    
    def extract_message_hashes(self):
        """Витягуємо хеші повідомлень для пошуку дублікатів"""
        hash_map = {}
        
        for conv in self.conversations:
            conv_name = conv.get('name', 'Untitled')
            conv_id = conv.get('id', hashlib.md5(conv_name.encode()).hexdigest()[:8])
            
            for msg in conv.get('chat_messages', []):
                text = msg.get('text', '')
                if len(text) > 50:  # Ігноруємо короткі повідомлення
                    msg_hash = hashlib.md5(text.encode()).hexdigest()
                    
                    if msg_hash not in hash_map:
                        hash_map[msg_hash] = []
                        
                    hash_map[msg_hash].append({
                        'conv_id': conv_id,
                        'conv_name': conv_name,
                        'sender': msg.get('sender', 'unknown'),
                        'timestamp': msg.get('created_at', '')
                    })
                    
        # Зберігаємо для наступного етапу
        duplicates_path = os.path.join(os.path.dirname(self.export_path), 'message-hashes.json')
        with open(duplicates_path, 'w', encoding='utf-8') as f:
            json.dump(hash_map, f, ensure_ascii=False, indent=2)
            
        # Рахуємо статистику
        total_messages = sum(len(v) for v in hash_map.values())
        duplicated = sum(1 for v in hash_map.values() if len(v) > 1)
        
        print(f"🔍 Знайдено {total_messages} унікальних повідомлень")
        print(f"♻️ З них {duplicated} мають копії в інших діалогах")
        
        return hash_map
        
def main():
    # Шлях до експорту
    export_path = "/Users/chaoshex/Downloads/data-2025-06-28-23-30-54"
    
    extractor = ConversationExtractor(export_path)
    
    print("📚 Початок екстракції діалогів...")
    
    # Процес екстракції
    extractor.load_conversations()
    
    # Експортуємо в MD файли
    output_dir = extractor.extract_to_markdown()
    
    # Створюємо індекс
    extractor.create_index(output_dir)
    
    # Витягуємо хеші для пошуку дублікатів
    extractor.extract_message_hashes()
    
    print("✅ Екстракція завершена!")
    
if __name__ == "__main__":
    main()