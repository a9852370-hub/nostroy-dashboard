@echo off
echo ========================================
echo Отправка кода на GitHub
echo ========================================

cd /d "C:\Users\ivanov.a\Desktop\попытка 2\b_ltYmnj9eXAl"

echo.
echo Удаляем старый .git...
rmdir /s /q .git

echo.
echo Инициализируем новый репозиторий...
git init

echo.
echo Создаём .gitignore...
(
echo node_modules
echo .next
echo public/data/*.json
echo public/data/*.geojson
) > .gitignore

echo.
echo Добавляем файлы...
git add .

echo.
echo Создаём коммит...
git commit -m "Initial commit: НОСТРОЙ дашборд"

echo.
echo Переключаемся на ветку main...
git branch -M main

echo.
echo Добавляем удалённый репозиторий...
git remote add origin https://github.com/a9852370-hub/nostroy-dashboard.git

echo.
echo Отправляем код на GitHub...
git push -u origin main --force

echo.
echo ========================================
echo Готово! Проверь GitHub
echo ========================================
pause