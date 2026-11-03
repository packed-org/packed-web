import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Luggage,
  Trash2,
  MapPin,
  Calendar,
  Plane,
  Bus,
  Car,
  Plus,
  AlertTriangle,
  Edit3,
  Sparkles,
} from 'lucide-react';
import { toast } from 'sonner';
import type { TripResponse } from '@/@types/api';
import { tripsService } from '@/services/tripsService';
import { ApiError } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const FILTER_OPTIONS = ['Todas', 'Próximas', 'Com Alerta'] as const;
type FilterOption = (typeof FILTER_OPTIONS)[number];

const LUGGAGE_LABELS: Record<string, string> = {
  PERSONAL_ITEM: 'Mochila (Item Pessoal)',
  CARRY_ON_10KG: 'Bordo 10kg',
  CHECKED_23KG: 'Despachada 23kg',
};

export function TripsList() {
  const navigate = useNavigate();

  const [trips, setTrips] = useState<TripResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<FilterOption>('Todas');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    tripsService
      .listTrips()
      .then((data) => {
        if (active) setTrips(data);
      })
      .catch((error) => {
        if (!active) return;
        if (error instanceof ApiError) {
          toast.error('Erro ao carregar viagens', { description: error.message });
        } else {
          toast.error('Não foi possível carregar suas viagens.');
        }
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const handleDelete = async (id: string, city: string) => {
    setDeletingId(id);
    try {
      await tripsService.deleteTrip(id);
      setTrips((prev) => prev.filter((t) => t.id !== id));
      toast.success(`Viagem para ${city} removida.`);
    } catch (error) {
      if (error instanceof ApiError) {
        toast.error(error.message);
      } else {
        toast.error('Erro ao excluir viagem.');
      }
    } finally {
      setDeletingId(null);
    }
  };

  const todayIso = new Date().toISOString().slice(0, 10);

  const filteredTrips = trips.filter((trip) => {
    if (activeFilter === 'Próximas') return trip.end_date >= todayIso;
    if (activeFilter === 'Com Alerta') return trip.list_outdated;
    return true;
  });

  const formatPeriod = (startIso: string, endIso: string) => {
    const fmt = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short' });
    const start = new Date(`${startIso}T12:00:00`);
    const end = new Date(`${endIso}T12:00:00`);
    return `${fmt.format(start)} — ${fmt.format(end)}`;
  };

  const getTransportIcon = (mode: string) => {
    if (mode === 'BUS') return Bus;
    if (mode === 'CAR') return Car;
    return Plane;
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-5 pt-8 pb-12 flex flex-col gap-6 select-none">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-petroleo tracking-tight">
            Minhas Viagens
          </h1>
          <p className="text-sm font-medium text-slate-500 mt-0.5">
            {trips.length === 0
              ? 'Crie seu primeiro roteiro para gerar sua mala inteligente.'
              : `${filteredTrips.length} ${
                  filteredTrips.length === 1 ? 'viagem encontrada' : 'viagens encontradas'
                }`}
          </p>
        </div>

        <Button
          onClick={() => navigate('/viagens/nova')}
          variant="teal"
          className="h-12 px-6 rounded-2xl font-bold text-sm shadow-sm flex items-center gap-2 cursor-pointer"
        >
          <Plus className="w-5 h-5" />
          Nova viagem
        </Button>
      </div>

      {/* Filtros */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {FILTER_OPTIONS.map((filter) => (
          <Badge
            key={filter}
            variant={activeFilter === filter ? 'default' : 'outline'}
            onClick={() => setActiveFilter(filter)}
            className={`cursor-pointer px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap shadow-none ${
              activeFilter === filter
                ? 'bg-petroleo text-white hover:bg-petroleo/90 border-transparent'
                : 'bg-white text-slate-600 hover:bg-slate-100 border-slate-200'
            }`}
          >
            {filter}
          </Badge>
        ))}
      </div>

      {/* Estado de Carregamento */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {[1, 2].map((skeleton) => (
            <div
              key={skeleton}
              className="h-56 rounded-3xl bg-white/70 animate-pulse p-6 flex flex-col justify-between"
            >
              <div className="h-6 w-1/3 bg-slate-200 rounded-full" />
              <div className="h-10 w-2/3 bg-slate-200 rounded-xl" />
              <div className="h-9 w-full bg-slate-200 rounded-xl" />
            </div>
          ))}
        </div>
      ) : filteredTrips.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredTrips.map((trip) => {
            const TransportIcon = getTransportIcon(trip.travel_mode);
            return (
              <Card
                key={trip.id}
                className="bg-white border-none rounded-3xl p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <CardContent className="p-0 flex flex-col gap-4">
                  {/* Linha 1: Status e Ações Rápidas */}
                  <div className="flex items-center justify-between gap-2">
                    {trip.list_outdated ? (
                      <Badge className="bg-sol-light text-sol-dark border-none px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        Mala desatualizada
                      </Badge>
                    ) : (
                      <Badge className="bg-teal-light text-teal-dark border-none px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5" />
                        {trip.duration_days} {trip.duration_days === 1 ? 'dia' : 'dias'}
                      </Badge>
                    )}

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        title="Editar parâmetros da viagem"
                        onClick={() => navigate(`/viagens/${trip.id}/editar`)}
                        className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-500 hover:bg-teal-light hover:text-teal-dark transition-colors cursor-pointer"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        title="Excluir viagem"
                        disabled={deletingId === trip.id}
                        onClick={() => handleDelete(trip.id, trip.destination.city)}
                        className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-erro-light hover:text-erro transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Linha 2: Destino e Origem */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <Luggage className="w-5 h-5 text-teal shrink-0" />
                        <h2 className="text-xl font-extrabold text-petroleo leading-tight">
                          {trip.destination.city}
                        </h2>
                      </div>
                      <p className="text-xs font-semibold text-slate-500">
                        {trip.destination.country || trip.destination.country_code} · Saindo de{' '}
                        {trip.origin_city}
                      </p>
                    </div>

                    <div className="w-10 h-10 rounded-2xl bg-sol-light flex items-center justify-center shrink-0">
                      <MapPin className="w-5 h-5 text-sol-dark" />
                    </div>
                  </div>

                  {/* Linha 3: Datas e Bagagem */}
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-petroleo bg-petroleo-light px-3 py-1.5 rounded-xl">
                      <Calendar className="w-3.5 h-3.5 text-teal" />
                      {formatPeriod(trip.start_date, trip.end_date)}
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-clima-dark bg-clima-light px-3 py-1.5 rounded-xl">
                      <TransportIcon className="w-3.5 h-3.5" />
                      {LUGGAGE_LABELS[trip.luggage_class] || trip.luggage_class}
                    </span>
                  </div>

                  {/* Linha 4: Rodapé */}
                  <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                    <span className="text-xs font-medium text-slate-400 truncate max-w-[55%]">
                      {trip.activities.length > 0
                        ? `${trip.activities.length} atividade(s)`
                        : 'Roteiro essencial'}
                    </span>
                    <Button
                      onClick={() => navigate(`/mala/${trip.id}`)}
                      variant="outline"
                      className="rounded-full border-teal text-teal hover:bg-teal hover:text-white font-bold h-9 px-5 text-xs transition-colors cursor-pointer"
                    >
                      Abrir mala
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="bg-white border-none rounded-3xl p-10 text-center shadow-xs">
          <CardContent className="p-0 flex flex-col items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-teal-light flex items-center justify-center text-teal">
              <Luggage className="w-7 h-7" />
            </div>
            <div className="flex flex-col gap-1 max-w-sm">
              <h2 className="text-lg font-bold text-petroleo">Nenhuma viagem por aqui</h2>
              <p className="text-xs text-slate-500">
                Informe seu destino, datas e estilo de bagagem para gerarmos um checklist sob
                medida com previsão climática.
              </p>
            </div>
            <Button
              onClick={() => navigate('/viagens/nova')}
              variant="teal"
              className="h-11 px-6 rounded-xl font-bold text-sm mt-1 cursor-pointer"
            >
              Criar primeira viagem
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
