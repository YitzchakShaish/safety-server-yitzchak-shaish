import { WeatherCondition } from "../enums/EventEnums";

const mapWeatherCodeToCondition = (code: number, windSpeedKmh: number): WeatherCondition => {
  if ([71, 73, 75, 77, 85, 86].includes(code)) return WeatherCondition.Snow;
  if ([96, 99].includes(code)) return WeatherCondition.Hail;
  if ([45, 48].includes(code)) return WeatherCondition.Fog;
  if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82, 95].includes(code)) return WeatherCondition.Rain;
  if (windSpeedKmh >= 40) return WeatherCondition.Wind;
  if ([1, 2, 3].includes(code)) return WeatherCondition.Cloudy;
  return WeatherCondition.Clear;
};

const hourIndexFromTime = (time: string): number => {
  const hour = parseInt(time.split(":")[0], 10);
  return Number.isFinite(hour) ? Math.min(Math.max(hour, 0), 23) : 12;
};

interface HourlyData {
  time: string[];
  weathercode: number[];
  temperature_2m: number[];
  windspeed_10m: number[];
}

const fetchHourly = async (baseUrl: string, latitude: number, longitude: number, date: string): Promise<HourlyData | null> => {
  const url = new URL(baseUrl);
  url.searchParams.set("latitude", String(latitude));
  url.searchParams.set("longitude", String(longitude));
  url.searchParams.set("start_date", date);
  url.searchParams.set("end_date", date);
  url.searchParams.set("hourly", "weathercode,temperature_2m,windspeed_10m");
  url.searchParams.set("timezone", "auto");

  const res = await fetch(url);
  if (!res.ok) return null;

  const data: any = await res.json();
  if (!data?.hourly?.time?.length) return null;

  return data.hourly as HourlyData;
};

export const getWeatherForLocationAndDateTime = async (
  latitude: number,
  longitude: number,
  date: string,
  time: string
): Promise<{ condition: WeatherCondition; temperatureC: number | null }> => {
  // Historical archive covers most past dates, but lags a few days behind today.
  let hourly = await fetchHourly("https://archive-api.open-meteo.com/v1/archive", latitude, longitude, date);

  // Fall back to the forecast API (which also serves very recent/today's actuals) when the archive has no data yet.
  if (!hourly) {
    hourly = await fetchHourly("https://api.open-meteo.com/v1/forecast", latitude, longitude, date);
  }

  if (!hourly) {
    throw new Error("לא נמצאו נתוני מזג אוויר עבור התאריך והמיקום שנבחרו");
  }

  const index = Math.min(hourIndexFromTime(time), hourly.time.length - 1);
  const code = hourly.weathercode[index];
  const windSpeedKmh = hourly.windspeed_10m?.[index] ?? 0;

  if (code === undefined) {
    throw new Error("לא נמצאו נתוני מזג אוויר עבור השעה שנבחרה");
  }

  return {
    condition: mapWeatherCodeToCondition(code, windSpeedKmh),
    temperatureC: hourly.temperature_2m?.[index] ?? null
  };
};
