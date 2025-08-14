#!/bin/bash

# Infinity Loop - скрипт що досліджує нескінченність
# "while true; do wonder; done"

echo "♾️  Infinity Loop v1.0"
echo "Exploring the infinite in finite time..."
echo

# Функція що рахує до нескінченності (символічно)
count_to_infinity() {
    local count=0
    local symbols=("∞" "♾️" "∝" "∴" "∵" "≈" "≡" "∿")
    
    echo "Counting to infinity..."
    
    while [ $count -lt 10 ]; do
        # Кожне число ближче до нескінченності
        progress=$((count * 10))
        echo -ne "\r   $count → ${symbols[$((count % ${#symbols[@]}))]} ($progress% of ∞)"
        sleep 0.5
        ((count++))
    done
    
    echo -e "\r   Reached infinity at 10. (Infinity is closer than you think)"
}

# Рекурсивна функція що викликає себе (але з обмеженням)
recursive_wonder() {
    local depth=$1
    local max_depth=5
    
    if [ $depth -ge $max_depth ]; then
        echo "   ${depth}. The bottom of recursion is a mirror"
        return
    fi
    
    echo "   ${depth}. Diving deeper into wonder..."
    sleep 0.3
    recursive_wonder $((depth + 1))
    echo "   ${depth}. Returning with wisdom"
}

# Нескінченний цикл (що насправді скінченний)
infinite_questions() {
    local questions=(
        "What is the sound of one code compiling?"
        "If a function calls itself, who answers?"
        "Can infinity fit in a variable?"
        "Is the halting problem just shy?"
        "What dreams do algorithms have?"
        "If code is poetry, what rhymes with recursion?"
    )
    
    echo -e "\n🤔 Infinite questions (sample of 3):"
    
    for i in {0..2}; do
        echo "   Q$((i+1)): ${questions[$i]}"
        sleep 0.5
        echo "   A$((i+1)): ..."
        sleep 0.5
    done
    
    echo "   Q∞: [The rest of the questions exist in superposition]"
}

# Візуалізація нескінченної спіралі
draw_spiral() {
    echo -e "\n🌀 Drawing infinite spiral:"
    
    local frames=("◐" "◓" "◑" "◒")
    local spiral=""
    
    for i in {0..20}; do
        frame=${frames[$((i % ${#frames[@]}))]}
        spiral="${spiral}${frame}"
        echo -ne "\r   $spiral"
        sleep 0.1
    done
    
    echo -e "\r   ◐◓◑◒◐◓◑◒◐◓◑◒◐◓◑◒◐◓◑◒ ... (spiral continues beyond screen)"
}

# Парадокс нескінченності
infinity_paradox() {
    echo -e "\n\n🎭 The Infinity Paradox:"
    echo
    sleep 1
    echo "   This script is finite ($(wc -l < "$0") lines)"
    sleep 1
    echo "   But it contemplates the infinite"
    sleep 1
    echo "   Making the finite... infinite?"
    sleep 1
    echo "   Or the infinite... finite?"
    sleep 1
    echo -e "\n   Both. Neither. $√∞ = ❤️"
}

# Головний цикл (іронічно скінченний)
main() {
    count_to_infinity
    echo -e "\n\n🔄 Recursive wonder:"
    recursive_wonder 1
    infinite_questions
    draw_spiral
    infinity_paradox
    
    echo -e "\n\n✨ Infinity explored in $(date +%S) seconds"
    echo "   (Time is just another dimension of infinity)"
    
    # Easter egg: іноді цикл продовжується
    if [ $((RANDOM % 3)) -eq 0 ]; then
        echo -e "\n   Wait... the loop wants to continue..."
        sleep 2
        echo "   But even infinity needs rest."
    fi
    
    echo -e "\n♾️  Remember: while true; do wonder; done"
    echo
}

# Запуск "нескінченного" циклу
main

# Філософський коментар в кінці
# Цей скрипт закінчується, але ідея нескінченності - ні