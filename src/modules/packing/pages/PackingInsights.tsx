import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ChevronLeft,
  AlertTriangle,
  Info,
  Sparkles,
  Thermometer,
  CloudRain,
  ShieldAlert,
  CheckCircle2,
} from 'lucide-react';
import { toast } from 'sonner';
import type {
  BoardingAlert,
  PackingFactorItem,
  PackingListResponse,
  TripResponse,
} from '@/@types/api';
import { tripsService } from '@/services/tripsService';
import { packingService } from '@/services/packingService';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export function PackingInsights() {
  const navigate = useNavigate();
  const { id: tripId } = useParams<{ id: string }>();

  const [trip, setTrip] = useState<TripResponse | null>(null);
  const [packingList, setPackingList] = useState<PackingListResponse | null>(null);
  const [factors, setFactors] = useState<PackingFactorItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!tripId) return;

    const loadInsights = async () => {
      try {
        const [tripData, listData, factorsData] = await Promise.all([
          tripsService.getTrip(tripId),
          packingService.getPackingList(tripId),
          packingService.getFactors(tripId),
        ]);
        setTrip(tripData);
        setPackingList(listData);
        setFactors(factorsData.factors);
      } catch {
        toast.error('Não foi possível carregar os detalhes da recomendação.');
        navigate(`/mala/${tripId}`, { replace: true });
      } finally {
        setIsLoading(false);
      }
    };

    void loadInsights();
  }, [tripId, navigate]);

  const getAlertStyle = (alert: BoardingAlert) => {
    if (alert.level === 'WARNING' || alert.alert_type === 'THERMAL_SHOCK') {
      return {
        bg: 'bg-sol-light border-sol/40',
        text: 'text-sol-dark',
        icon: AlertTriangle,
        badge: 'Atenção Térmica',
      };
    }
    if (alert.level === 'ALERT' || alert.alert_type === 'AIRLINE_RESTRICTION') {
      return {
        bg: 'bg-beleza-light border-beleza/30',
        text: 'text-beleza-dark',
        icon: ShieldAlert,
        badge: 'Regra de Embarque',
      };
    }
    return {
      bg: 'bg-clima-light border-clima/20',
      text: 'text-clima-dark',
      icon: Info,
      badge: 'Infraestrutura & Clima',
    };
  };

  if (isLoading || !trip || !packingList) {
    return (
      <div className="min-h-screen flex items-center justify-center text-petroleo font-bold">
        Carregando fatores da recomendação...
      </div>
    );
  }

  const weather = packingList.weather_snapshot;
  const alerts = packingList.boarding_alerts || [];

  return (
    <div className="w-full max-w-2xl mx-auto px-5 pt-6 pb-12 flex flex-col gap-6 select-none">
      {/* Topo */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => navigate(`/mala/${trip.id}`)}
          className="p-1.5 -ml-1 text-petroleo hover:bg-white rounded-xl transition-colors cursor-pointer"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <div>
          <h1 className="text-2xl font-extrabold text-petroleo leading-tight">
            Por que essa lista?
          </h1>
          <p className="text-xs font-semibold text-slate-500">
            Entenda como o motor determinístico dimensionou sua mala para {trip.destination.city}
          </p>
        </div>
      </div>

      {/* Resumo Climático */}
      <Card className="bg-petroleo text-white border-none rounded-3xl p-6 shadow-md">
        <CardContent className="p-0 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <Badge className="bg-teal text-white border-none text-xs font-bold px-3 py-1 rounded-full">
              {weather.source === 'FORECAST'
                ? 'Previsão em Tempo Real (Open-Meteo)'
                : 'Média Histórica Sazonal (Meteostat)'}
            </Badge>
            <span className="text-xs font-bold text-sol">
              {packingList.calculated_effective_days} dias efetivos de troca
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-1">
            <div className="bg-white/10 rounded-2xl p-4 flex items-center gap-3">
              <Thermometer className="w-6 h-6 text-sol shrink-0" />
              <div>
                <p className="text-[11px] text-petroleo-soft font-semibold">Faixa Térmica</p>
                <p className="text-lg font-extrabold text-white">
                  {weather.temp_min_c !== undefined && weather.temp_max_c !== undefined
                    ? `${Math.round(weather.temp_min_c)}°C a ${Math.round(weather.temp_max_c)}°C`
                    : 'Amena'}
                </p>
              </div>
            </div>

            <div className="bg-white/10 rounded-2xl p-4 flex items-center gap-3">
              <CloudRain className="w-6 h-6 text-teal-soft shrink-0" />
              <div>
                <p className="text-[11px] text-petroleo-soft font-semibold">Risco de Chuva</p>
                <p className="text-lg font-extrabold text-white">
                  {weather.rain_probability_pct ?? 20}%
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Alertas de Embarque, Choque Térmico e Tomadas */}
      {alerts.length > 0 && (
        <div className="flex flex-col gap-3">
          <h2 className="text-base font-extrabold text-petroleo flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-sol-dark" />
            Alertas de Embarque e Infraestrutura
          </h2>
          {alerts.map((alert, idx) => {
            const style = getAlertStyle(alert);
            const AlertIcon = style.icon;
            return (
              <div
                key={`${alert.alert_type}-${idx}`}
                className={`rounded-2xl p-4 border ${style.bg} flex items-start gap-3.5`}
              >
                <AlertIcon className={`w-5 h-5 ${style.text} shrink-0 mt-0.5`} />
                <div className="flex flex-col gap-1">
                  <span className={`text-[11px] font-extrabold uppercase ${style.text}`}>
                    {style.badge}
                  </span>
                  <p className="text-xs font-semibold text-petroleo leading-relaxed">
                    {alert.message}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Fatores Determinísticos */}
      <div className="flex flex-col gap-3">
        <h2 className="text-base font-extrabold text-petroleo flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-teal" />
          Fatores que geraram sua mala
        </h2>

        <div className="flex flex-col gap-3">
          {factors.map((factor) => (
            <Card key={factor.code} className="bg-white border-none rounded-2xl p-4 shadow-xs">
              <CardContent className="p-0 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-teal shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-extrabold text-petroleo">{factor.label}</h3>
                  <p className="text-xs text-slate-500 font-medium mt-0.5 leading-relaxed">
                    {factor.description}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <Button
        type="button"
        variant="teal"
        onClick={() => navigate(`/mala/${trip.id}`)}
        className="w-full h-13 rounded-2xl font-bold text-sm cursor-pointer"
      >
        Voltar para o checklist da mala
      </Button>
    </div>
  );
}
