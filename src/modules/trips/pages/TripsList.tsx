import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Luggage, X, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface Trip {
  id: string;
  destination: string;
  country: string;
}

const DEFAULT_TRIPS = [
  { id: '1', destination: 'Buenos Aires', country: 'Argentina' },
  { id: '2', destination: 'Alagoinha', country: 'Brasil' },
];

export function TripsList() {
  const navigate = useNavigate();

  // Carrega do localStorage ou assume os padrões se estiver vazio
  const [trips, setTrips] = useState<Trip[]>(() => {
    const stored = localStorage.getItem('packed_trips');
    return stored ? JSON.parse(stored) : DEFAULT_TRIPS;
  });

  const handleDelete = (id: string) => {
    const updated = trips.filter((t) => t.id !== id);
    setTrips(updated);
    localStorage.setItem('packed_trips', JSON.stringify(updated));
  };
  return (
    <div className="min-h-screen w-full bg-petroleo-light flex flex-col items-center justify-between p-6 md:p-10 select-none">
      <div className="w-full max-w-md md:max-w-xl flex flex-col justify-between min-h-[calc(100vh-3rem)] md:min-h-0 md:gap-8">
        
        {/* Cabeçalho e Lista de Viagens */}
        <div className="flex flex-col gap-6">
          <h1 className="text-3xl md:text-4xl font-extrabold text-petroleo tracking-tight">
            Planejamento
          </h1>

          {/* Lista de Cards */}
          <div className="flex flex-col gap-4">
            {trips.length > 0 ? (
              trips.map((trip) => (
                <Card
                  key={trip.id}
                  onClick={() => navigate(`/mala/${trip.id}`)}
                  className="bg-white border-none rounded-2xl p-5 shadow-xs hover:shadow-md transition-all cursor-pointer group"
                >
                  <CardContent className="p-0 flex flex-col justify-between gap-4">
                    
                    {/* Linha Superior: Ícone da Mala e Botão de Excluir */}
                    <div className="flex items-center justify-between">
                      <Luggage className="w-7 h-7 text-petroleo stroke-[2.2]" />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation(); // Evita acionar a navegação do card
                          handleDelete(trip.id);
                        }}
                        aria-label="Excluir viagem"
                        className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 hover:bg-erro/10 hover:text-erro transition-colors"
                      >
                        <X className="w-4 h-4 stroke-[2.5]" />
                      </button>
                    </div>

                    {/* Linha Inferior: Informações da Viagem e Ícone de Localização */}
                    <div className="flex items-end justify-between">
                      <div className="flex flex-col">
                        <span className="text-lg font-bold text-petroleo group-hover:text-teal transition-colors">
                          {trip.destination}
                        </span>
                        <span className="text-sm font-medium text-slate-400">
                          {trip.country}
                        </span>
                      </div>

                      {/* Pin Amarelo Sol */}
                      <div className="w-10 h-10 rounded-full bg-sol flex items-center justify-center text-petroleo shadow-xs group-hover:scale-105 transition-transform">
                        <MapPin className="w-5 h-5 fill-petroleo text-sol" />
                      </div>
                    </div>

                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center py-12 text-slate-400 text-sm">
                Nenhuma viagem planejada até o momento.
              </div>
            )}
          </div>
        </div>

        {/* Botão de Ação no Rodapé */}
        <div className="mt-8 mb-4 md:mb-0">
          <Button
            variant="teal"
            onClick={() => navigate('/viagens/nova')}
            className="w-full h-14 rounded-2xl text-base font-bold shadow-md"
          >
            Adicionar nova viagem
          </Button>
        </div>

      </div>
    </div>
  );
}