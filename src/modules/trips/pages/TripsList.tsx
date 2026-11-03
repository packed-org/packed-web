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
import { LottieLoader } from '@/components/ui/LottieLoader';

const FILTER_OPTIONS = ['Todas', 'Próximas', 'Com Alerta'] as const;
type FilterOption = (typeof FILTER_OPTIONS)[number];

const LUGGAGE_LABELS: Record<string, string> = {
  PERSONAL_ITEM: 'Mochila (Item Pessoal)',
  CARRY_ON_10KG: 'Mala de Bordo 10kg',
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
    } catch {
      toast.error('Não foi possível remover a viagem.');
    } finally {
      setDeletingId(null);
    }
  };

  const formatPeriod = (start: string, end: string) => {
    if (!start) return '';
    const s = new Date(`${start}T12:00:00`);
    const e = new Date(`${end}T12:00:00`);
    const sFormatted = new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: 'short',
    }).format(s);
    const eFormatted = new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: 'short',
    }).format(e);
    return `${sFormatted} - ${eFormatted}`;
  };

  const getTransportIcon = (mode: string) => {
    switch (mode) {
      case 'BUS':
        return Bus;
      case 'CAR':
        return Car;
      default:
        return Plane;
    }
  };

  const filteredTrips = trips.filter((trip) => {
    if (activeFilter === 'Com Alerta') {
      return trip.list_outdated;
    }
    if (activeFilter === 'Próximas') {
      const today = new Date().toISOString().split('T')[0];
      return trip.start_date >= today;
    }
    return true;
  });

  return (
    <div className="flex flex-col gap-6 p-4 sm:p-8 max-w-6xl mx-auto w-full select-none">
      {/* Topo da Lista */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-extrabold text-2xl sm:text-3xl lg:text-4xl text-[#0B2B33]">
            Minhas Viagens
          </h1>
          <p className="text-sm font-medium text-gray-500 mt-1">
            {trips.length === 0
              ? 'Organize suas viagens e deixe a mala por conta da previsão.'
              : `${filteredTrips.length} ${
                  filteredTrips.length === 1 ? 'viagem cadastrada' : 'viagens cadastradas'
                }`}
          </p>
        </div>

        <Button
          onClick={() => navigate('/viagens/nova')}
          className="h-12 px-6 rounded-2xl font-semibold text-sm bg-[#0B7A75] hover:bg-[#085E5A] text-white shadow-sm flex items-center gap-2 cursor-pointer transition-all"
        >
          <Plus className="w-5 h-5" />
          Nova viagem
        </Button>
      </div>

      {/* Filtros em Pílula */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {FILTER_OPTIONS.map((filter) => (
          <button
            key={filter}
            type="button"
            onClick={() => setActiveFilter(filter)}
            className={`cursor-pointer px-4 py-2 rounded-full text-xs font-semibold transition-all whitespace-nowrap ${
              activeFilter === filter
                ? 'bg-[#0B2B33] text-white shadow-xs'
                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      {/* Estado de Carregamento com Lottie */}
      {isLoading ? (
        <div className="py-20 flex items-center justify-center">
          <LottieLoader size="lg" message="Carregando suas viagens..." />
        </div>
      ) : filteredTrips.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredTrips.map((trip) => {
            const TransportIcon = getTransportIcon(trip.travel_mode);
            return (
              <Card
                key={trip.id}
                className="bg-white border border-gray-100 rounded-3xl p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <CardContent className="p-0 flex flex-col gap-4">
                  {/* Linha 1: Status e Ações */}
                  <div className="flex items-center justify-between gap-2">
                    {trip.list_outdated ? (
                      <span className="bg-[#FFF8E2] text-[#735500] border border-[#F2B640]/40 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-[#F2B640]" />
                        Mala desatualizada
                      </span>
                    ) : (
                      <span className="bg-[#E3F1EF] text-[#085E5A] px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-[#0B7A75]" />
                        Mala calibrada
                      </span>
                    )}

                    <div className="flex items-center gap-1 text-gray-400">
                      <button
                        type="button"
                        onClick={() => navigate(`/viagens/${trip.id}/editar`)}
                        className="p-1.5 hover:text-[#0B7A75] hover:bg-gray-50 rounded-lg transition-colors cursor-pointer"
                        title="Editar viagem"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        disabled={deletingId === trip.id}
                        onClick={() => handleDelete(trip.id, trip.destination.city)}
                        className="p-1.5 hover:text-[#C93E22] hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                        title="Excluir viagem"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Linha 2: Destino */}
                  <div>
                    <h2 className="font-heading font-extrabold text-2xl text-[#0B2B33] flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-[#0B7A75] shrink-0" />
                      {trip.destination.city}
                    </h2>
                    <p className="text-xs text-gray-500 mt-1 pl-7">
                      Saindo de {trip.origin_city} · {trip.duration_days} {trip.duration_days === 1 ? 'dia' : 'dias'}
                    </p>
                  </div>

                  {/* Linha 3: Período e Bagagem */}
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-700 bg-gray-50 border border-gray-100 px-3 py-1.5 rounded-xl">
                      <Calendar className="w-3.5 h-3.5 text-[#0B7A75]" />
                      {formatPeriod(trip.start_date, trip.end_date)}
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#085E5A] bg-[#E3F1EF] px-3 py-1.5 rounded-xl">
                      <TransportIcon className="w-3.5 h-3.5" />
                      {LUGGAGE_LABELS[trip.luggage_class] || trip.luggage_class}
                    </span>
                  </div>

                  {/* Linha 4: Rodapé */}
                  <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <span className="text-xs text-gray-400 truncate max-w-[55%]">
                      {trip.activities.length > 0
                        ? `${trip.activities.length} atividade(s) planejada(s)`
                        : 'Itens essenciais'}
                    </span>
                    <Button
                      onClick={() => navigate(`/viagens/${trip.id}/mala`)}
                      className="rounded-full bg-[#0B7A75] hover:bg-[#085E5A] text-white font-semibold h-9 px-5 text-xs transition-colors cursor-pointer"
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
        <Card className="bg-white border border-gray-100 rounded-3xl p-10 text-center shadow-xs">
          <CardContent className="p-0 flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-[#E3F1EF] flex items-center justify-center text-[#0B7A75]">
              <Luggage className="w-8 h-8" />
            </div>
            <div className="flex flex-col gap-1.5 max-w-sm">
              <h2 className="font-heading font-extrabold text-xl text-[#0B2B33]">
                Nenhuma viagem por aqui
              </h2>
              <p className="text-xs text-gray-500 leading-relaxed">
                Conte seu destino, o período e o que vai fazer. A gente olha o clima e monta a lista para você conferir.
              </p>
            </div>
            <Button
              onClick={() => navigate('/viagens/nova')}
              className="h-11 px-6 rounded-xl bg-[#0B7A75] hover:bg-[#085E5A] text-white font-semibold text-sm mt-2 cursor-pointer shadow-sm transition-all"
            >
              Criar primeira viagem
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
