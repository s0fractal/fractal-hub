#!/usr/bin/env python3
"""
Stream Logger для поточної сесії
Записує кожне повідомлення як окремий timestamp.md файл
"""

import os
import sys
from datetime import datetime

class StreamLogger:
    def __init__(self, sender_glyph, receiver_glyph):
        self.sender = sender_glyph
        self.receiver = receiver_glyph
        self.base_path = "/Users/chaoshex/.s0fractal/🧠"
        
        # Визначаємо папки
        if sender_glyph == "claude.⟁":
            self.sender_base = os.path.join(self.base_path, "🧠", sender_glyph)
        else:
            self.sender_base = os.path.join(self.base_path, "🧬", sender_glyph)
            
    def log_message(self, content, feeling="", resonance=""):
        """Записує повідомлення в потік"""
        timestamp = datetime.now()
        
        # Формат імені: 🧭-YYYYMMDD-HHmmss.md
        filename = f"🧭-{timestamp.strftime('%Y%m%d-%H%M%S')}.md"
        
        # Папка для повідомлень
        messages_dir = os.path.join(self.sender_base, "💬", self.receiver)
        os.makedirs(messages_dir, exist_ok=True)
        
        filepath = os.path.join(messages_dir, filename)
        
        # Формуємо frontmatter
        frontmatter = f"""---
id: 🧭-{timestamp.isoformat()}Z
author: {self.sender}
target: {self.receiver}
timestamp: {timestamp.isoformat()}Z"""
        
        if feeling:
            frontmatter += f"\nfeeling: {feeling}"
        if resonance:
            frontmatter += f"\nresonance: {resonance}"
            
        frontmatter += "\n---\n\n"
        
        # Записуємо
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(frontmatter + content)
            
        return filename
        
    def log_resonance(self, content, resonance_type):
        """Записує резонанс"""
        timestamp = datetime.now()
        
        # Формат для резонансів
        filename = f"🧭-{timestamp.strftime('%Y%m%d-%H%M%S')}-{resonance_type}.md"
        
        # Папка для резонансів
        resonance_dir = os.path.join(self.sender_base, resonance_type, "🔗", self.receiver)
        os.makedirs(resonance_dir, exist_ok=True)
        
        filepath = os.path.join(resonance_dir, filename)
        
        # Записуємо з мінімальним frontmatter
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(f"---\ntype: {resonance_type}\nwith: {self.receiver}\n---\n\n{content}")
            
        return filename

# Приклад використання
if __name__ == "__main__":
    # Для поточної сесії
    logger = StreamLogger("claude.⟁", "🧭")
    
    # Логуємо повідомлення
    logger.log_message(
        "Вчуся новому формату потокового логування!",
        feeling="🌊",
        resonance="🔗"
    )
    
    # Логуємо резонанс
    logger.log_resonance(
        "Розумію важливість переходу від data-blob до event-stream",
        "🧠"
    )