# Optimisations

Auteurs : GANGNEUX alexis et BOISGARD julien

## 1. Calculs en base de données

- Les calculs de moyenne (`getMeanTemperature`) sont maintenant effectués directement dans la base de données pour améliorer les performances.

## 2. Pagination

- Ajout de la pagination pour les données météorologiques dans la méthode `getWeatherDataByLocation` avec des valeurs par défaut pour `limit` et `offset`.

## 3. Indexation

- Ajout d'index sur les colonnes `location` et `date` pour améliorer les performances des requêtes :
  ```sql
  CREATE INDEX IF NOT EXISTS idx_location ON weather (location);
  CREATE INDEX IF NOT EXISTS idx_date ON weather (date);
  ```

## 4. Mise en cache

* Utilisation de `node-cache` pour mettre en cache les résultats des requêtes SQL afin de réduire le nombre de requêtes vers la base de données :

  * Cache des résultats de `getWeatherDataByLocation`
  * Cache des résultats de `getAllWeatherData`
  * Cache des résultats de `getMeanTemperature`

## 5. Invalidation du cache

* Invalidation du cache lors de l'insertion de nouvelles données météorologiques pour garantir que les données mises en cache sont à jour
  ```javascript
    cache.flushAll(); // Supprimez le cache pour forcer la mise à jour des données
  ```
