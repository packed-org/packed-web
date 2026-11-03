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
import { Button } from '@/components/ui/button';
import { LottieLoader } from '@/components/ui/LottieLoader';

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
        navigate(`/viagens/${tripId}/mala`, { replace: true });
      } finally {
        setIsLoading(false);
      }
    };

    void loadInsights();
  }, [tripId, navigate]);

  const getAlertStyle = (alert: BoardingAlert) => {
    if (alert.level === 'WARNING' || alert.alert_type === 'THERMAL_SHOCK') {
      return {
        card: 'bg-[#FFF8E2] border-[#F2B640]/50 text-[#735500]',
        icon: AlertTriangle,
        iconColor: 'text-[#F2B640]',
        badge: 'Alerta Climático',
      };
    }
    if (alert.level === 'ALERT' || alert.alert_type === 'AIRLINE_RESTRICTION') {
      return {
        card: 'bg-[#FDF2F0] border-[#C93E22]/30 text-[#C93E22]',
        icon: ShieldAlert,
        iconColor: 'text-[#C93E22]',
        badge: 'Regra de Bagagem',
      };
    }
    return {
      card: 'bg-[#E3F1EF] border-[#0B7A75]/20 text-[#085E5A]',
      icon: Info,
      iconColor: 'text-[#0B7A75]',
      badge: 'Dica do Destino',
    };
  };

  if (isLoading || !trip || !packingList) {
    return (
      <div className="min-h-screen w-full bg-[#F3F7F6] flex items-center justify-center">
        <LottieLoader size="lg" message="Carregando insights da sua mala..." />
      </div>
    );
  }

  const weather = packingList.weather_snapshot;
  const alerts = packingList.boarding_alerts || [];

  return (
    <div className="w-full max-w-2xl mx-auto px-5 pt-6 pb-16 flex flex-col gap-6 select-none">
      {/* Topo */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => navigate(`/viagens/${trip.id}/mala`)}
          className="p-2 -ml-2 text-[#0B2B33] hover:bg-white rounded-xl transition-colors cursor-pointer"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <div>
          <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-[#0B2B33]">
            Entenda sua lista
          </h1>
          <p className="text-xs sm:text-sm font-medium text-gray-500 mt-0.5">
            Veja como o clima e as suas atividades montaram a mala ideal para {trip.destination.city}
          </p>
        </div>
      </div>

      {/* Resumo Climático */}
      <Card className="bg-[#0B2B33] text-white border-none rounded-3xl p-6 shadow-md">
        <CardContent className="p-0 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <span className="bg-[#0B7A75] text-white text-xs font-semibold px-3 py-1 rounded-full">
              Previsão para {trip.duration_days} {trip.duration_days === 1 ? 'dia' : 'dias'}
            </span>
            <span className="text-xs font-bold text-[#F2B640]">
              {packingList.calculated_effective_days} dias calculados para roupas
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-1">
            <div className="bg-white/10 rounded-2xl p-4 flex items-center gap-3">
              <Thermometer className="w-6 h-6 text-[#F2B640] shrink-0" />
              <div>
                <p className="text-[11px] text-white/60 font-medium">Faixa Térmica</p>
                <p className="text-lg font-extrabold text-white">
                  {weather.temp_min_c !== undefined && weather.temp_max_c !== undefined
                    ? `${Math.round(weather.temp_min_c)}°C a ${Math.round(weather.temp_max_c)}°C`
                    : 'Agradável'}
                </p>
              </div>
            </div>

            <div className="bg-white/10 rounded-2xl p-4 flex items-center gap-3">
              <CloudRain className="w-6 h-6 text-[#0B7A75] shrink-0" />
              <div>
                <p className="text-[11px] text-white/60 font-medium">Prob. de Chuva</p>
                <p className="text-lg font-extrabold text-white">
                  {weather.rain_probability_pct !== undefined
                    ? `${weather.rain_probability_pct}%`
                    : 'Baixa'}
                </p>
              </div>
            </div>
          </div>

          {weather.thermal_delta_c !== null &&
            weather.thermal_delta_c !== undefined &&
            Math.abs(weather.thermal_delta_c) >= 5 && (
              <p className="text-xs text-white/80 bg-white/5 p-3 rounded-xl border border-white/10">
                Choque térmico previsto:{' '}
                <strong className="text-[#F2B640]">
                  {Math.abs(Math.round(weather.thermal_delta_c))}°C de diferença
                </strong>{' '}
                entre {trip.origin_city} e {trip.destination.city}. Incluímos peças de transição na sua mala.
              </p>
            )}
        </CardContent>
      </Card>

      {/* Alertas Importantes */}
      {alerts.length > 0 && (
        <div className="flex flex-col gap-3">
          <h2 className="font-heading font-extrabold text-lg text-[#0B2B33]">
            Avisos para sua bagagem
          </h2>
          <div className="flex flex-col gap-2.5">
            {alerts.map((alert, idx) => {
              const style = getAlertStyle(alert);
              const Icon = style.icon;
              return (
                <div
                  key={idx}
                  className={`border rounded-2xl p-4 flex items-start gap-3.5 ${style.card}`}
                >
                  <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${style.iconColor}`} />
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[11px] font-bold uppercase tracking-wider opacity-70">
                      {style.badge}
                    </span>
                    <p className="text-xs sm:text-sm font-semibold leading-relaxed">
                      {alert.message}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Fatores que definiram sua lista */}
      {factors.length > 0 && (
        <div className="flex flex-col gap-3">
          <h2 className="font-heading font-extrabold text-lg text-[#0B2B33] flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#0B7A75]" />
            Como sua lista foi montada
          </h2>
          <div className="bg-white rounded-3xl p-5 border border-gray-200/80 divide-y divide-gray-100 shadow-2xs">
            {factors.map((factor, idx) => (
              <div key={idx} className="py-3.5 first:pt-0 last:pb-0 flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-[#E3F1EF] text-[#0B7A75] flex items-center justify-center shrink-0 mt-0.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-[#0B2B33]">{factor.label}</p>
                  <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                    {factor.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="pt-2">
        <Button
          onClick={() => navigate(`/viagens/${trip.id}/mala`)}
          className="w-full h-12 rounded-2xl bg-[#0B7A75] hover:bg-[#085E5A] text-white font-semibold text-sm shadow-sm cursor-pointer"
        >
          Voltar para a mala
        </Button>
      </div>
    </div>
  );
}
