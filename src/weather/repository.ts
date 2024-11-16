import pg from 'pg';
import config from 'config';
//ajout de cache pour eviter trop de requete bdd
import NodeCache from 'node-cache';
import { WeatherData, WeatherDataSchema } from './dto.js';
import { WeatherFilter } from './dto.js';

const poolConfig = config.get<pg.PoolConfig>('database');
const cache = new NodeCache({ stdTTL: 600 }); 

export class WeatherDataRepository {
  private pool: pg.Pool;

  constructor() {
    this.pool = new pg.Pool(poolConfig);
  }

  //ajout des index pour les recherches plus rapide
  async createTable(): Promise<void> {
    const query = `
            CREATE TABLE IF NOT EXISTS weather (
                location VARCHAR(256),
                date DATE,
                temperature DECIMAL,
                humidity DECIMAL,
                PRIMARY KEY(location, date)
            );
            CREATE INDEX IF NOT EXISTS idx_location ON weather (location);
            CREATE INDEX IF NOT EXISTS idx_date ON weather (date);
        `;
    await this.pool.query(query);
  }

  async insertWeatherData(weatherData: WeatherData): Promise<void> {
    const query = `
            INSERT INTO weather (location, date, temperature, humidity)
            VALUES ($1, $2, $3, $4)
        `;

    const values = [
      weatherData.location,
      weatherData.date,
      weatherData.temperature,
      weatherData.humidity,
    ];
    await this.pool.query(query, values);
    cache.flushAll(); // Supprimez le cache pour forcer la mise à jour des données
  }

  // Effectuez autant de calculs que possible directement dans la base de données 
  // création d'une pagination pour les données météorologiques
  async getWeatherDataByLocation(
    location: string,
    options: WeatherFilter
  ): Promise<WeatherData[] | null> {
    const { from, to } = options;
    const limit = options.limit ?? 50;
    const offset = options.offset ?? 0;
    const cacheKey = `weatherData:${location}:${from}:${to}:${limit}:${offset}`;
    
    const cachedData = cache.get<WeatherData[]>(cacheKey);
    if (cachedData) {
      return cachedData;
    }

    const query = `
      SELECT * FROM weather WHERE location = $1 LIMIT $2 OFFSET $3 ${from ? 'AND date >= $4' : ''} ${to ? 'AND date <= $5' : ''}
    `;
    const values: (string | Date | number)[] = [location, limit, offset];
    if (from) values.push(from);
    if (to) values.push(to);

    const result: pg.QueryResult = await this.pool.query(query, values);

    if (result.rows.length === 0) {
      return null;
    }
  
    const data = result.rows.map((row) => WeatherDataSchema.parse(row)) as WeatherData[];
    cache.set(cacheKey, data); 
    return data;
  }

  async getAllWeatherData(): Promise<WeatherData[]> {
    const cacheKey = 'allWeatherData';
    const cachedData = cache.get<WeatherData[]>(cacheKey);
    if (cachedData) {
      return cachedData;
    }

    const query = 'SELECT * FROM weather';
    const result: pg.QueryResult = await this.pool.query(query);
    const data = result.rows as WeatherData[];
    cache.set(cacheKey, data);
    return data;
  }
  
  //calcule de la moyenne en base de données
  async getMeanTemperature(location: string, options: WeatherFilter): Promise<number | null> {
    const { from, to } = options;
    const cacheKey = `meanTemperature:${location}:${from}:${to}`;
    
    const cachedMean = cache.get<number>(cacheKey);
    if (cachedMean !== undefined) {
      return cachedMean;
    }

    const query = `
      SELECT AVG(temperature) as mean
      FROM weather
      WHERE location = $1
      ${from ? 'AND date >= $2' : ''}
      ${to ? 'AND date <= $3' : ''}
    `;
    const values: (string | Date | Number)[] = [location];
    if (from) values.push(from);
    if (to) values.push(to);
  
    const result: pg.QueryResult = await this.pool.query(query, values);
    const mean = result.rows[0]?.mean || null;
    cache.set(cacheKey, mean); 
    return mean;
  }

  //ajoute de la recuperation de la temperature max et min en bdd
  async getMaxTemperature(location: string, options: WeatherFilter): Promise<number | null> {
    const { from, to } = options;
    const cacheKey = `maxTemperature:${location}:${from}:${to}`;
    
    const cachedMax = cache.get<number>(cacheKey);
    if (cachedMax !== undefined) {
      return cachedMax;
    }

    const query = `
      SELECT MAX(temperature) as max
      FROM weather
      WHERE location = $1
      ${from ? 'AND date >= $2' : ''}
      ${to ? 'AND date <= $3' : ''}
    `;
    const values: (string | Date | Number)[] = [location];
    if (from) values.push(from);
    if (to) values.push(to);
  
    const result: pg.QueryResult = await this.pool.query(query, values);
    const max = result.rows[0]?.max || null;
    cache.set(cacheKey, max); 
    return max;
  }
//ajoute de la recuperation de la temperature max et min en bdd
  async getMinTemperature(location: string, options: WeatherFilter): Promise<number | null> {
    const { from, to } = options;
    const cacheKey = `minTemperature:${location}:${from}:${to}`;
    
    const cachedMin = cache.get<number>(cacheKey);
    if (cachedMin !== undefined) {
      return cachedMin;
    }

    const query = `
      SELECT MIN(temperature) as min
      FROM weather
      WHERE location = $1
      ${from ? 'AND date >= $2' : ''}
      ${to ? 'AND date <= $3' : ''}
    `;
    const values: (string | Date | Number)[] = [location];
    if (from) values.push(from);
    if (to) values.push(to);
  
    const result: pg.QueryResult = await this.pool.query(query, values);
    const min = result.rows[0]?.min || null;
    cache.set(cacheKey, min); 
    return min;
  }
}

export default new WeatherDataRepository();
