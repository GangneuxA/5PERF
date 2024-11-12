import repositoryInstance, { WeatherDataRepository } from './repository.js';
import { WeatherData, WeatherFilter } from './dto.js';

export class WeatherService {
  private weatherRepository: WeatherDataRepository;
  constructor() {
    this.weatherRepository = repositoryInstance;
  }

  async addData(data: WeatherData) {
    return this.weatherRepository.insertWeatherData(data);
  }

  // recuduction pour faire la recherche en bdd
  async getData(location: string, options: WeatherFilter) {
    const data = await this.weatherRepository.getWeatherDataByLocation(
      location,
      options
    );
    if (data === null) {
      return null;
    }
    return data;
  }

  // avegare en bdd
  async getMean(location: string, options: WeatherFilter) {
    return this.weatherRepository.getMeanTemperature(location, options);
  }

  // ajout des dates dans la requete
  async getMax(location: string, options: WeatherFilter) {
    const data = await this.getData(location, options);

    if (data === null) {
      return null;
    }
    return data;
  }

  // ajout des dates dans la requete
  async getMin(location: string, options: WeatherFilter) {
    const data = await this.getData(location, options);

    if (data === null) {
      return null;
    }

    return data;
  }
}

export default new WeatherService();
