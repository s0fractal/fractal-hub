// templates/md_entry.ts
export function generateMetadata(data: Record<string, string>): string {
  return `---
glyph: ${data.glyph}
intent: ${data.intent}
author: ${data.author}
privacy: ${data.privacy}
timestamp: ${data.timestamp}
${data.feeling ? `feeling: ${data.feeling}` : ''}
${data.resonance ? `resonance: ${data.resonance}` : ''}
${data.target ? `target: ${data.target}` : ''}
---`.replace(/\n\n/g, '\n'); // видаляємо пусті рядки
}