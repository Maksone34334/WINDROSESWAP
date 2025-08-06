# 🧪 Локальное тестирование

## 🚀 Запуск сервера:

```bash
# Соберите проект
npm run build

# Запустите сервер
node build/server.js
```

Сервер запустится на http://localhost:3001

## 🔗 Тестирование endpoints:

### 1. Главная страница:
```bash
open http://localhost:3001
```

### 2. API endpoints:
```bash
# Количество токенов
curl http://localhost:3001/api/tokens/count

# Верифицированные токены
curl http://localhost:3001/api/tokens/category/verified?limit=5

# Все токены
curl http://localhost:3001/api/tokens?limit=3

# Котировка
curl -X POST http://localhost:3001/api/quote \
  -H "Content-Type: application/json" \
  -d '{
    "amount": "1",
    "from": "BEAN",
    "to": "CHOG",
    "sender": "0x1234567890123456789012345678901234567890"
  }'
```

## 🦊 Тестирование кошелька:

1. Откройте http://localhost:3001 в браузере
2. Убедитесь что установлен MetaMask
3. Нажмите "Add Monad Network" 
4. Нажмите "Connect MetaMask"
5. Проверьте что подключился к Monad Testnet
6. Попробуйте кнопку "My Balance"
7. Если есть токены - попробуйте "Execute Real Swap"

## ✅ Что должно работать:

✅ Красивая главная страница  
✅ 7 API endpoints  
✅ Подключение MetaMask  
✅ Добавление Monad Network  
✅ Отображение балансов  
✅ Выполнение реальных свапов  

## 🚨 Если не работает:

1. **Порт занят**: Измените PORT в server.ts
2. **CORS ошибки**: Проверьте что cors() подключен
3. **API не отвечает**: Проверьте что Monorail API доступен
4. **MetaMask**: Убедитесь что расширение установлено
5. **Сеть**: Проверьте что добавлена Monad Testnet

## 🎯 После тестирования:

Если всё работает локально - можно деплоить на Vercel!

```bash
vercel --prod
```