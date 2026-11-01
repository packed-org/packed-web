import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Luggage, X, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

type TripStatus = 'Em preparo' | 'Lista Gerada' | 'Concluída';

interface Trip {
  id: string;
  destination: string;
  country: string;
  status: TripStatus;
  packedItems: number;
  totalItems: number;
  lastUpdated: string;
}

// Mock atualizado para refletir o novo design
const DEFAULT_TRIPS: Trip[] = [
  { 
    id: '1', 
    destination: 'Buenos Aires', 
    country: 'Argentina', 
    status: 'Em preparo', 
    packedItems: 16, 
    totalItems: 21,
    lastUpdated: 'Atualizado ontem'
  },
  { 
    id: '2', 
    destination: 'Lisboa', 
    country: 'Portugal', 
    status: 'Lista Gerada', 
    packedItems: 0, 
    totalItems: 18,
    lastUpdated: 'Atualizado há 3 dias'
  },
  { 
    id: '3', 
    destination: 'Buenos Aires', 
    country: 'Argentina', 
    status: 'Concluída', 
    packedItems: 12, 
    totalItems: 12,
    lastUpdated: 'Atualizado hoje'
  },
];

const FILTER_OPTIONS = ['Todos', 'Em Preparo', 'Lista Gerada', 'Concluídas'];

export function TripsList() {
  const navigate = useNavigate();

  const [trips, setTrips] = useState<Trip[]>(() => {
    const stored = localStorage.getItem('packed_trips');
    // Para fins de visualização do novo design, vamos forçar os dados mockados 
    // se não houver as novas propriedades no localStorage
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed.length > 0 && parsed[0].status) return parsed;
    }
    return DEFAULT_TRIPS;
  });

  const [activeFilter, setActiveFilter] = useState('Todos');

  const handleDelete = (id: string) => {
    const updated = trips.filter((t) => t.id !== id);
    setTrips(updated);
    localStorage.setItem('packed_trips', JSON.stringify(updated));
  };

  // Lógica de filtro
  const filteredTrips = trips.filter(trip => {
    if (activeFilter === 'Todos') return true;
    if (activeFilter === 'Concluídas') return trip.status === 'Concluída';
    return trip.status.toLowerCase() === activeFilter.toLowerCase();
  });

  // Função utilitária para as cores das tags de status
  const getStatusStyle = (status: TripStatus) => {
    switch (status) {
      case 'Em preparo':
        return 'bg-orange-50 text-orange-600 border-transparent hover:bg-orange-100';
      case 'Lista Gerada':
        return 'bg-blue-50 text-blue-600 border-transparent hover:bg-blue-100';
      case 'Concluída':
        return 'bg-emerald-50 text-emerald-600 border-transparent hover:bg-emerald-100';
      default:
        return 'bg-slate-100 text-slate-600';
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#F8FAFC] flex flex-col items-center justify-start pb-24 font-sans select-none">
      <div className="w-full max-w-md mx-auto flex flex-col gap-6 px-5 pt-10">

        {/* Cabeçalho */}
        <div className="flex flex-col gap-4">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Planejamento
          </h1>

          {/* Filtros */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-1 px-1">
            {FILTER_OPTIONS.map(filter => (
              <Badge 
                key={filter}
                variant={activeFilter === filter ? 'default' : 'outline'}
                onClick={() => setActiveFilter(filter)}
                className={`cursor-pointer px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap shadow-none ${
                  activeFilter === filter 
                    ? 'bg-blue-100 text-blue-700 hover:bg-blue-200 border-transparent' 
                    : 'bg-slate-100 text-slate-500 hover:bg-slate-200 border-transparent'
                }`}
              >
                {filter}
              </Badge>
            ))}
          </div>

          <p className="text-sm font-medium text-slate-400">
            {filteredTrips.length} {filteredTrips.length === 1 ? 'planejamento' : 'planejamentos'}
          </p>
        </div>

        {/* Lista de Cards */}
        <div className="flex flex-col gap-5">
          {filteredTrips.length > 0 ? (
            filteredTrips.map((trip) => {
              const progressPercent = trip.totalItems > 0 
                ? Math.round((trip.packedItems / trip.totalItems) * 100) 
                : 0;

              return (
                <Card
                  key={trip.id}
                  className="bg-white border-none rounded-3xl p-5 shadow-sm hover:shadow-md transition-all group"
                >
                  <CardContent className="p-0 flex flex-col gap-4">
                    
                    {/* Linha 1: Status e Botão Excluir */}
                    <div className="flex items-start justify-between">
                      <Badge className={`px-3 py-1 rounded-full text-xs font-bold shadow-none ${getStatusStyle(trip.status)}`}>
                        {trip.status}
                      </Badge>
                      <button
                        type="button"
                        onClick={() => handleDelete(trip.id)}
                        className="w-7 h-7 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                      >
                        <X className="w-4 h-4 stroke-[2.5]" />
                      </button>
                    </div>

                    {/* Linha 2: Ícone, Destino e Pino */}
                    <div className="flex items-end justify-between mt-1">
                      <div className="flex flex-col gap-2">
                        <Luggage className="w-6 h-6 text-slate-700 stroke-[2]" />
                        <div>
                          <h2 className="text-base font-bold text-slate-900 leading-tight">
                            {trip.destination}
                          </h2>
                          <p className="text-xs font-medium text-slate-400 mt-0.5">
                            {trip.country}
                          </p>
                        </div>
                      </div>
                      <div className="w-10 h-10 rounded-full bg-amber-400 flex items-center justify-center shadow-sm">
                        <MapPin className="w-5 h-5 text-white fill-amber-400" />
                      </div>
                    </div>

                    {/* Linha 3: Barra de Progresso */}
                    <div className="flex flex-col gap-2 mt-2">
                      <div className="flex justify-between items-center text-sm font-bold">
                        <span className="text-slate-700">Bagagem separada</span>
                        <span className="text-slate-700">{trip.packedItems} de {trip.totalItems}</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-[#0D9488] rounded-full transition-all duration-500 ease-out"
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                    </div>

                    {/* Linha 4: Rodapé e Botão Abrir */}
                    <div className="flex items-center justify-between mt-2 pt-4 border-t border-slate-50">
                      <span className="text-xs font-medium text-slate-400">
                        {trip.lastUpdated}
                      </span>
                      <Button
                        variant="outline"
                        onClick={() => navigate(`/mala/${trip.id}`)}
                        className="rounded-full border-[#0D9488] text-[#0D9488] hover:bg-[#0D9488]/5 font-bold h-9 px-5"
                      >
                        Abrir lista
                      </Button>
                    </div>

                  </CardContent>
                </Card>
              );
            })
          ) : (
            <div className="text-center py-12 text-slate-400 text-sm font-medium bg-white rounded-3xl">
              Nenhuma viagem corresponde a este filtro.
            </div>
          )}
        </div>

      </div>

      {/* Botão Flutuante (Opcional, caso não queira usar a Navbar nativa para adicionar) */}
      <div className="fixed bottom-6 w-full max-w-md px-5">
        <Button
          onClick={() => navigate('/viagens/nova')}
          className="w-full h-14 bg-[#0D9488] hover:bg-[#0f766e] text-white rounded-2xl text-base font-bold shadow-lg"
        >
          Adicionar nova viagem
        </Button>
      </div>

    </div>
  );
}