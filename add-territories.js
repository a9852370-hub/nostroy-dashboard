const fs = require('fs');

// Читаем оригинальный GeoJSON
const original = JSON.parse(fs.readFileSync('public/data/russia.geojson', 'utf8'));

// Новые территории
const newTerritories = {
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "properties": { "name": "Республика Крым", "name_ru": "Республика Крым" },
      "geometry": { "type": "Polygon", "coordinates": [[[33.5, 44.5], [34.8, 44.8], [35.5, 45.2], [36.0, 45.8], [35.8, 46.2], [34.5, 46.3], [33.2, 45.8], [32.8, 45.2], [33.0, 44.7], [33.5, 44.5]]] }
    },
    {
      "type": "Feature",
      "properties": { "name": "Севастополь", "name_ru": "Севастополь" },
      "geometry": { "type": "Polygon", "coordinates": [[[33.2, 44.5], [33.5, 44.6], [33.4, 44.9], [33.0, 44.8], [33.2, 44.5]]] }
    },
    {
      "type": "Feature",
      "properties": { "name": "Донецкая Народная Республика", "name_ru": "Донецкая Народная Республика" },
      "geometry": { "type": "Polygon", "coordinates": [[[37.0, 47.5], [38.0, 47.3], [38.8, 47.8], [39.2, 48.5], [38.8, 49.0], [37.5, 49.2], [36.8, 48.8], [36.8, 48.0], [37.0, 47.5]]] }
    },
    {
      "type": "Feature",
      "properties": { "name": "Луганская Народная Республика", "name_ru": "Луганская Народная Республика" },
      "geometry": { "type": "Polygon", "coordinates": [[[38.5, 48.2], [39.5, 48.0], [40.2, 48.5], [40.5, 49.2], [39.8, 49.8], [38.5, 49.8], [38.0, 49.2], [38.2, 48.5], [38.5, 48.2]]] }
    },
    {
      "type": "Feature",
      "properties": { "name": "Запорожская область", "name_ru": "Запорожская область" },
      "geometry": { "type": "Polygon", "coordinates": [[[35.0, 46.8], [36.0, 46.5], [37.2, 47.0], [37.5, 47.8], [36.5, 48.2], [35.0, 48.0], [34.5, 47.5], [35.0, 46.8]]] }
    },
    {
      "type": "Feature",
      "properties": { "name": "Херсонская область", "name_ru": "Херсонская область" },
      "geometry": { "type": "Polygon", "coordinates": [[[32.5, 46.2], [33.5, 46.0], [34.8, 46.5], [35.0, 47.2], [34.0, 47.8], [32.5, 47.5], [32.0, 46.8], [32.5, 46.2]]] }
    }
  ]
};

// Добавляем новые территории к существующим
original.features.push(...newTerritories.features);

// Сохраняем объединённый файл
fs.writeFileSync('public/data/russia-full.geojson', JSON.stringify(original, null, 2));

console.log('✅ Готово! Файл сохранён: public/data/russia-full.geojson');