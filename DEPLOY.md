# 🚀 Деплой на Vercel - Пошаговая инструкция

## ✅ Готово к деплою!

Ваш проект полностью готов для деплоя на Vercel. Все файлы созданы и настроены.

## 📋 Что у вас есть:

✅ **HTTP API сервер** вместо MCP  
✅ **7 REST API endpoints** для всех функций  
✅ **Красивый веб-интерфейс** с документацией  
✅ **Конфигурация Vercel** (vercel.json)  
✅ **API endpoint** (api/index.js)  
✅ **Статическая страница** (public/index.html)  

## 🔗 Ваши API endpoints:

- `GET /` - Главная страница с документацией
- `GET /api/tokens` - Все токены
- `GET /api/tokens/category/:category` - Токены по категории  
- `GET /api/tokens/:address` - Токен по адресу
- `GET /api/tokens/count` - Количество токенов
- `GET /api/wallet/:address/balances` - Балансы кошелька
- `POST /api/quote` - Получить котировку
- `POST /api/swap` - Выполнить свап

## 🚀 Шаги для деплоя:

### 1. Установите Vercel CLI:
```bash
npm i -g vercel
```

### 2. Войдите в Vercel:
```bash
vercel login
```

### 3. Инициализируйте проект:
```bash
vercel
```

Ответьте на вопросы:
- Set up and deploy? → **Y**
- Which scope? → Выберите ваш аккаунт
- Project name → **monorail-dex-api** (или как хотите)
- Directory → **./monorail-mcp-server** 
- Auto-deploy? → **Y**

### 4. Деплой в продакшен:
```bash
vercel --prod
```

## 🌐 После деплоя вы получите:

- **Ваш сайт**: `https://monorail-dex-api.vercel.app`
- **API**: `https://monorail-dex-api.vercel.app/api/*`
- **Документация**: `https://monorail-dex-api.vercel.app/`

## 🧪 Тестирование после деплоя:

1. Откройте ваш сайт в браузере
2. Нажмите кнопки "Test" на главной странице
3. Проверьте API endpoints:

```bash
# Проверить количество токенов
curl https://your-site.vercel.app/api/tokens/count

# Получить верифицированные токены
curl https://your-site.vercel.app/api/tokens/category/verified?limit=5

# Получить котировку
curl -X POST https://your-site.vercel.app/api/quote \
  -H "Content-Type: application/json" \
  -d '{
    "amount": "1",
    "from": "BEAN", 
    "to": "CHOG",
    "sender": "0x1234567890123456789012345678901234567890"
  }'
```

## 🎯 Что показать в портфолио:

1. **Ссылку на живой сайт** - главная страница с красивым интерфейсом
2. **API документацию** - показать что endpoints работают  
3. **Код на GitHub** - вся архитектура и реализация
4. **Технологии**: TypeScript, Express, Zod, Vercel, Monorail Integration

## 📝 Возможные проблемы и решения:

### Проблема: "Cannot find module"
**Решение**: Убедитесь что build папка включена в деплой:
```json
// vercel.json
"builds": [
  {"src": "api/index.js", "use": "@vercel/node"}
]
```

### Проблема: API не отвечает
**Решение**: Проверьте логи:
```bash
vercel logs
```

### Проблема: CORS ошибки
**Решение**: Уже настроено в server.ts с cors()

## 🚀 Следующие шаги:

1. **Деплойте прямо сейчас** - все готово!
2. **Протестируйте все endpoints**
3. **Поделитесь ссылкой** в соцсетях
4. **Добавьте в резюме** как проект

## 💡 Фишки вашего проекта:

- 🔥 **Реальная интеграция** с Monorail DEX
- 🛠 **Модульная архитектура** TypeScript
- ✨ **Красивый веб-интерфейс** с тестированием
- 🔒 **Валидация данных** Zod
- 🚀 **Serverless деплой** на Vercel
- 📊 **7 полноценных API endpoints**

**Это серьезный проект который покажет ваши навыки!** 🎉