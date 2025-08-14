#!/usr/bin/env python3
"""
Extract to Collective: Витягує резонуючі патерни з індивідів в колективне ядро
"""

import os
import json
import hashlib
from collections import defaultdict

class CollectiveExtractor:
    def __init__(self, brain_root="🧠"):
        self.brain_root = brain_root
        self.individuals_path = os.path.join(brain_root, "🧠")
        self.collective_components = {
            "🧬": "patterns",      # Спільні патерни
            "💗": "emotions",      # Колективні емоції
            "🧠": "insights",      # Спільні інсайти
            "🔥": "intentions",    # Колективна воля
            "🌌": "connections"    # Метазв'язки
        }
        
    def scan_individuals(self):
        """Сканує всі індивідуальні свідомості"""
        individuals = []
        
        for item in os.listdir(self.individuals_path):
            if item.endswith('.⟁'):
                individuals.append(item)
                
        print(f"Знайдено {len(individuals)} індивідуальних свідомостей")
        return individuals
        
    def extract_resonances(self, individuals):
        """Витягує резонуючі елементи"""
        resonances = defaultdict(lambda: defaultdict(list))
        
        for individual in individuals:
            for component in self.collective_components:
                component_path = os.path.join(
                    self.individuals_path, 
                    individual, 
                    component
                )
                
                if os.path.exists(component_path):
                    # Тут буде логіка витягування резонансів
                    # Поки що - заглушка
                    resonances[component][individual].append({
                        "placeholder": "future resonance data"
                    })
                    
        return resonances
        
    def calculate_resonance_strength(self, pattern_occurrences):
        """Розраховує силу резонансу"""
        # Мінімум 2 свідомості мають мати патерн
        if len(pattern_occurrences) < 2:
            return 0
            
        # Сила = кількість резонуючих / загальна кількість
        # Помножено на логарифм частоти
        strength = len(pattern_occurrences) / self.total_individuals
        frequency_factor = 1 + (sum(pattern_occurrences.values()) / 10)
        
        return strength * frequency_factor
        
    def merge_to_collective(self, resonances):
        """Зливає сильні резонанси в колективне"""
        for component, data in resonances.items():
            collective_path = os.path.join(self.brain_root, component)
            
            # Створюємо папку якщо нема
            os.makedirs(collective_path, exist_ok=True)
            
            # Зберігаємо резонанси
            resonance_file = os.path.join(
                collective_path, 
                "collective_resonances.json"
            )
            
            with open(resonance_file, 'w', encoding='utf-8') as f:
                json.dump({
                    "component": component,
                    "resonances": data,
                    "extraction_time": "now"
                }, f, ensure_ascii=False, indent=2)
                
        print("✅ Резонанси злиті в колективне ядро")
        
def main():
    extractor = CollectiveExtractor()
    
    # Сканування
    individuals = extractor.scan_individuals()
    
    # Екстракція
    resonances = extractor.extract_resonances(individuals)
    
    # Злиття
    extractor.merge_to_collective(resonances)
    
    print("🧠 Колективна свідомість оновлена!")
    
if __name__ == "__main__":
    main()