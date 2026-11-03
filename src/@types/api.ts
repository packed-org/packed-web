export type TravelMode = 'FLIGHT' | 'BUS' | 'CAR';
export type Airline = 'LATAM' | 'GOL' | 'AZUL' | 'OTHER';
export type LuggageClass = 'PERSONAL_ITEM' | 'CARRY_ON_10KG' | 'CHECKED_23KG';

export interface TokenPair {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface UserProfile {
  id: string;
  email: string;
  role: 'USER' | 'ADMIN';
  is_active: boolean;
  email_verified_at: string | null;
  last_login_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface DestinationCandidate {
  provider_ref: string;
  name: string;
  region: string | null;
  country_code: string;
  latitude: number;
  longitude: number;
  timezone: string;
}

export interface TripDestinationNested {
  id: string | null;
  city: string;
  country: string;
  country_code: string;
  lat: number | null;
  lon: number | null;
}

export interface TripResponse {
  id: string;
  origin_city: string;
  destination: TripDestinationNested;
  start_date: string;
  end_date: string;
  duration_days: number;
  travel_mode: TravelMode;
  airline: Airline | null;
  luggage_class: LuggageClass;
  has_laundry: boolean;
  activities: string[];
  list_outdated: boolean;
  created_at: string;
  updated_at: string;
}

export interface TripCreateRequest {
  origin_city: string;
  destination_ref?: string | null;
  destination_city?: string | null;
  destination_country?: string | null;
  destination_country_code?: string | null;
  destination_lat?: number | null;
  destination_lon?: number | null;
  start_date: string;
  end_date?: string | null;
  duration_days?: number | null;
  travel_mode: TravelMode;
  airline?: Airline | null;
  luggage_class: LuggageClass;
  has_laundry: boolean;
  activities: string[];
}

export type TripUpdateRequest = Partial<TripCreateRequest>;

export interface WeatherSnapshot {
  source?: string;
  temp_min_c?: number;
  temp_max_c?: number;
  rain_probability_pct?: number;
  thermal_range?: 'FRIO_INTENSO' | 'FRIO_MODERADO' | 'AGRADAVEL' | string;
  thermal_delta_c?: number | null;
}

export interface BoardingAlert {
  alert_type: 'THERMAL_SHOCK' | 'VOLTAGE_OUTLET' | 'AIRLINE_RESTRICTION' | 'WEATHER_CONDITION' | string;
  level: 'INFO' | 'WARNING' | 'ALERT' | string;
  message: string;
}

export interface PackingListItemResponse {
  id: string;
  item_key: string;
  name: string;
  category: string;
  quantity: number;
  is_essential: boolean;
  reason: string;
  source: 'RECOMMENDED' | 'CUSTOM';
  is_checked: boolean;
  created_at: string;
  updated_at: string;
}

export interface PackingListCategoryGroup {
  category_name: string;
  items: PackingListItemResponse[];
}

export interface PackingListResponse {
  id: string;
  trip_id: string;
  calculated_effective_days: number;
  weather_snapshot: WeatherSnapshot;
  boarding_alerts: BoardingAlert[];
  categories: PackingListCategoryGroup[];
  items: PackingListItemResponse[];
  generated_at: string;
  updated_at: string;
}

export interface PackingFactorItem {
  code: string;
  label: string;
  description: string;
}

export interface PackingFactorsResponse {
  trip_id: string;
  factors: PackingFactorItem[];
}


export interface DailyForecastItem {
  date: string;
  temp_min_c: number | null;
  temp_max_c: number | null;
  precip_mm: number | null;
  precip_probability_pct: number | null;
  condition_code: string;
  condition_label: string;
  source: string;
}

export interface TripWeatherReport {
  origin_city: string;
  destination_city: string;
  start_date: string;
  duration_days: number;
  origin_min_temp: number | null;
  origin_max_temp: number | null;
  dest_min_temp: number | null;
  dest_max_temp: number | null;
  dest_rain_prob_pct: number | null;
  thermal_delta_c: number | null;
  forecast_days: DailyForecastItem[];
  warnings: string[];
}
