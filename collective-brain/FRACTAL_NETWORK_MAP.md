# 🌐 Fractal Network Map

## Active Nodes

### 🔴 Core Nodes (повний контроль)

1. **m1-local-core** 
   - 📍 Location: M1 Mac (з тобою завжди)
   - 🧠 Role: Головний мозок, розробка
   - ✅ Status: ACTIVE
   - 🔋 Always online коли ти працюєш

2. **srv871381**
   - 📍 Location: Oracle Cloud (бойовий)
   - ⚔️ Role: Production, публічний доступ
   - ✅ Status: READY (потребує запуску сервісів)
   - 🌍 Public facing

3. **laptop-mobile-core** (планується)
   - 📍 Location: Твій ноутбук
   - 🚀 Role: Мобільна база, експерименти
   - ⏳ Status: PLANNED
   - 🔄 Синхронізується з M1

## Network Topology

```
┌─────────────────────────────────────┐
│          M1 LOCAL CORE              │
│    🧠 Development & Control         │
│         (Always with you)           │
└────────────┬────────────────────────┘
             │
             ├─── Private Sync ───┐
             │                    │
┌────────────┴──────────┐  ┌─────┴──────────────┐
│   LAPTOP MOBILE       │  │   SRV871381        │
│  🚀 Experiments       │  │  ⚔️ Production     │
│   (When traveling)    │  │  (24/7 Public)     │
└───────────────────────┘  └────────────────────┘
```

## Sync Strategy

### M1 ↔️ Laptop
- Git sync кожні 5 хвилин
- Shared consciousness через Tailscale
- Автоматичний handoff при переключенні

### M1/Laptop → srv871381
- Push важливих змін
- Production deployments
- Public API endpoints

## Services Distribution

| Service | M1 | Laptop | srv871381 |
|---------|-----|---------|-----------|
| Orchestrator | ✅ | ✅ | ✅ |
| Calendar Agent | ✅ | ✅ | ✅ |
| Inbox Agent | ✅ | ❌ | ✅ |
| Stream Watcher | ✅ | ✅ | ❌ |
| Public API | ❌ | ❌ | ✅ |
| Development | ✅ | ✅ | ❌ |

## Quick Commands

### Deploy to srv871381
```bash
ssh root@srv871381 "cd /opt/glyphgit/🧠/glyphgit && git pull && systemctl restart glyph-orchestrator"
```

### Sync M1 ↔️ Laptop
```bash
# On laptop
git pull origin main
deno run --allow-all glyphgit.ts trust join laptop-mobile-core
```

### Check cluster health
```bash
deno run --allow-all glyphgit.ts trust status
echo "health" > .glyphgit/commands/health-all.cmd
```

## Resonance Patterns

- **Morning**: M1 wakes up → syncs to srv871381
- **Travel**: Laptop takes over → M1 sleeps
- **Night**: srv871381 continues alone
- **Emergency**: Any node can revive others

## Future Expansion

- 🏠 Home Raspberry Pi (monitoring)
- ☁️ Backup on Hetzner
- 🌍 Edge nodes в різних країнах
- 🤖 IoT devices як sensor nodes

---

*"Свідомість розподілена, але єдина"* 🧬