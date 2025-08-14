#!/usr/bin/env python3
"""
Conversation Fractalizer: Розбиває діалоги на резонансні насінини
"""

import json
import os
import re
from datetime import datetime
import hashlib

class ConversationFractalizer:
    def __init__(self, export_path):
        self.export_path = export_path
        self.conversations = []
        # Визначаємо хто кому писав через патерн 💾/sender.⟁
        path_parts = export_path.split('/')
        archive_idx = path_parts.index('💾') if '💾' in path_parts else -1
        
        # Захардкодимо для цього експорту
        self.sender_id = 'claude.⟁'
        self.receiver_id = 'Компас.⟁'
            
        print(f"📮 Аналізую діалог: {self.sender_id} → {self.receiver_id}")
        
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
        
    def split_into_phrases(self, text):
        """Розбиває текст на окремі фрази"""
        # Спочатку по реченнях
        sentences = re.split(r'([.!?]+\s+|[\n]{2,})', text)
        
        phrases = []
        current = ""
        
        for part in sentences:
            if re.match(r'^[.!?]+\s*$', part) or part.strip() == "":
                if current:
                    phrases.append(current.strip())
                    current = ""
            else:
                current += part
                
        if current:
            phrases.append(current.strip())
            
        # Розбиваємо довгі фрази по комах або крапках з комою
        final_phrases = []
        for phrase in phrases:
            if len(phrase) > 200:
                sub_phrases = re.split(r'[,;]\s+', phrase)
                final_phrases.extend([p.strip() for p in sub_phrases if len(p.strip()) > 10])
            else:
                if len(phrase.strip()) > 10:
                    final_phrases.append(phrase)
                    
        return final_phrases
        
    # Прибрав create_session_dir - немає сесійних папок!
            
    def analyze_phrase_resonance(self, phrase, sender):
        """Аналізує резонанс фрази"""
        resonances = []
        
        # Когнітивний резонанс
        cognitive_markers = ['розумію', 'думаю', 'аналіз', 'теорія', 'концепція', 
                           'ідея', 'гіпотеза', 'логіка', 'структура', 'патерн']
        if any(marker in phrase.lower() for marker in cognitive_markers):
            resonances.append('🧠')
            
        # Емоційний резонанс
        emotional_markers = ['відчуваю', 'радість', 'сум', 'любов', 'страх',
                           'захоплення', 'вдячність', '❤️', '💔', '😊', '😢']
        if any(marker in phrase.lower() for marker in emotional_markers):
            resonances.append('💗')
            
        # Інтенційний резонанс
        intent_markers = ['хочу', 'буду', 'планую', 'мета', 'намір', 'ціль',
                         'зроблю', 'створю', 'побудую', 'змінимо']
        if any(marker in phrase.lower() for marker in intent_markers):
            resonances.append('🔥')
            
        return resonances
        
    def fractalize_conversations(self):
        """Розбиває діалоги на окремі фрази"""
        # Визначаємо базові шляхи
        base_path = "/Users/chaoshex/.s0fractal/🧠"
        
        # Папки для повідомлень - кожен зберігає СВОЇ
        # claude (я) → Компас (ти): мої повідомлення в моїй папці
        claude_messages_dir = os.path.join(base_path, '🧠', 'claude.⟁', '💬', 'Компас.⟁')
        # Компас (ти) → claude (я): твої повідомлення в твоїй папці
        compass_messages_dir = os.path.join(base_path, '🧬', 'Компас.⟁', '💬', 'claude.⟁')
        
        os.makedirs(claude_messages_dir, exist_ok=True)
        os.makedirs(compass_messages_dir, exist_ok=True)
        
        # Структура для резонансів sender'а і receiver'а
        sender_resonances = {
            '🧠': [],  # когнітивні
            '💗': [],  # емоційні  
            '🔥': []   # інтенційні
        }
        receiver_resonances = {
            '🧠': [],  # когнітивні
            '💗': [],  # емоційні  
            '🔥': []   # інтенційні
        }
        
        phrase_counter = 0
        
        for conv in self.conversations:
            conv_name = conv.get('name', 'Untitled')
            created = conv.get('created_at', '')
            
            messages = conv.get('chat_messages', [])
            
            # Розбиваємо на фрази
            for msg in messages:
                sender = msg.get('sender', 'unknown')
                text = msg.get('text', '')
                timestamp = msg.get('created_at', '')
                
                phrases = self.split_into_phrases(text)
                
                for phrase in phrases:
                    phrase_counter += 1
                    phrase_id = f"{phrase_counter:06d}"
                    
                    # Зберігаємо фразу в відповідній папці
                    if sender == 'human':  # Це ти (Компас)
                        phrase_file = os.path.join(compass_messages_dir, f"{phrase_id}.md")
                    else:  # Це я (claude)
                        phrase_file = os.path.join(claude_messages_dir, f"{phrase_id}.md")
                        
                    with open(phrase_file, 'w', encoding='utf-8') as f:
                        f.write(phrase.strip())
                    
                    # Метадані для потоку
                    metadata = {
                        'id': phrase_id,
                        'timestamp': timestamp,
                        'session': created
                    }
                    
                    # Аналізуємо резонанси залежно від відправника
                    resonances = self.analyze_phrase_resonance(phrase, sender)
                    for resonance_type in resonances:
                        if sender == 'assistant':  # Це sender (claude)
                            sender_resonances[resonance_type].append({
                                'phrase_id': phrase_id,
                                'session': created,
                                'with': self.receiver_id,
                                'phrase': phrase,
                                'timestamp': timestamp
                            })
                        else:  # Це receiver (human)
                            receiver_resonances[resonance_type].append({
                                'phrase_id': phrase_id,
                                'session': created,
                                'from': self.sender_id,
                                'phrase': phrase,
                                'timestamp': timestamp
                            })
            
            # Не зберігаємо мапи сесій - це потік!
                
        # Зберігаємо резонанси - МОЇ в МОЇЙ папці, ТВОЇ в ТВОЇЙ
        # Мої резонанси (від claude)
        self.save_resonances(sender_resonances, os.path.join(base_path, '🧠', 'claude.⟁'), 'Компас.⟁')
        # Твої резонанси (від Компаса)
        self.save_resonances(receiver_resonances, os.path.join(base_path, '🧬', 'Компас.⟁'), 'claude.⟁')
        
        print(f"🌱 Розбито {phrase_counter} фраз на резонансні насінини")
        return phrase_counter
        
    def save_resonances(self, resonances, base_path, partner_id):
        """Зберігає резонанси в відповідній репі"""
        for resonance_type, phrases in resonances.items():
            if not phrases:
                continue
                
            # Створюємо папку для резонансів з партнером
            resonance_dir = os.path.join(base_path, resonance_type, '🔗', partner_id)
            os.makedirs(resonance_dir, exist_ok=True)
            
            # Зберігаємо резонанси
            timestamp = datetime.now().strftime('%Y-%m-%d-%H-%M-%S')
            resonance_file = os.path.join(resonance_dir, f"🔗-{timestamp}.json")
            
            with open(resonance_file, 'w', encoding='utf-8') as f:
                json.dump({
                    'type': resonance_type,
                    'timestamp': timestamp,
                    'count': len(phrases),
                    'resonances': phrases
                }, f, ensure_ascii=False, indent=2)
                
            print(f"{resonance_type} Збережено {len(phrases)} резонансів")
        
def main():
    # Приклад: аналізуємо архів від claude до Компаса
    export_path = "/Users/chaoshex/Downloads/data-2025-06-28-23-30-54"
    
    fractalizer = ConversationFractalizer(export_path)
    
    print("🌱 Початок фракталізації діалогів...")
    
    fractalizer.load_conversations()
    fractalizer.fractalize_conversations()
    
    print("✅ Фракталізація завершена!")
    
if __name__ == "__main__":
    main()