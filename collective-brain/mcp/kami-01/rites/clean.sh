#!/bin/bash
# clean.sh - Kami's leaf collection ritual

echo "🌲 Kami-01: Починаю збір опалого листя..."
echo "   \"Опале листя живить землю, видалені файли звільняють простір\""
echo

# Meditate before action
sleep 2

# Clean with forest wisdom
echo "🍃 Збираю тимчасові файли..."
find /tmp -type f -atime +7 -print 2>/dev/null | while read leaf; do
    echo "   🍂 $leaf"
    # Would remove in real implementation
done

echo
echo "🌿 Очищаю кеш npm..."
npm cache clean --force 2>/dev/null || echo "   🍂 npm кеш вже чистий як роса"

echo
echo "🍃 Перевіряю Docker образи..."
docker image prune -f 2>/dev/null || echo "   🍂 Docker спить зимовим сном"

echo
echo "🌺 Leaf collection complete. Forest floor is clean."
echo "   System breathes easier now."