import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Info, Check } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';

const AVAILABLE_ACTIVITIES = [
  'Trilhas',
  'Experiências gastronômicas',
  'Esporte',
  'Nadar',
  'Museus',
  'Praia & Mar',
  'Compras',
  'Vida noturna',
  'Fotografia',
  'Relaxamento & Spa',
  'Trabalho / Remote',
  'Parques de diversão',
];

export function NewTrip() {
  const navigate = useNavigate();

  const [destination, setDestination] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedActivities, setSelectedActivities] = useState<string[]>(['Trilhas']);

  const toggleActivity = (activity: string) => {
    setSelectedActivities((prev) =>
      prev.includes(activity)
        ? prev.filter((a) => a !== activity)
        : [...prev, activity]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!destination.trim()) return;

    const parts = destination.split(',');
    const destName = parts[0]?.trim() || destination;
    const countryName = parts[1]?.trim() || 'Internacional';

    const newTrip = {
      id: Date.now().toString(),
      destination: destName,
      country: countryName,
      startDate,
      endDate,
      activities: selectedActivities,
    };

    const storedTrips = localStorage.getItem('packed_trips');
    const trips = storedTrips ? JSON.parse(storedTrips) : [];
    localStorage.setItem('packed_trips', JSON.stringify([newTrip, ...trips]));

    // Disparo de toast nativo do Sonner
    toast.success('Viagem criada com sucesso!', {
      description: `Planejamento para ${destName} foi salvo.`,
    });

    navigate('/viagens');
  };

  return (
    <div className="min-h-screen w-full bg-petroleo-light flex flex-col items-center p-6 md:p-10 select-none">
      <div className="w-full max-w-md md:max-w-xl flex flex-col justify-between min-h-[calc(100vh-3rem)] md:min-h-0 md:gap-8">
        
        {/* Topo / Voltar */}
        <div className="flex flex-col gap-6">
          <button
            type="button"
            onClick={() => navigate('/viagens')}
            className="flex items-center gap-2 text-petroleo hover:text-teal font-semibold transition-colors self-start"
          >
            <ChevronLeft className="w-6 h-6 stroke-[2.5]" />
            <span className="text-lg">Nova viagem</span>
          </button>

          {/* Título e Descrição */}
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl md:text-4xl font-extrabold text-petroleo tracking-tight">
              Para onde vamos?
            </h1>
            <p className="text-sm md:text-base text-slate-600 font-medium">
              Nos conte mais sobre sua viagem para planejarmos juntos!
            </p>
          </div>

          {/* Formulário */}
          <form id="new-trip-form" onSubmit={handleSubmit} className="flex flex-col gap-6 mt-2">
            
            {/* Destino */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="destination" className="text-sm font-bold text-petroleo">
                Destino
              </Label>
              <Input
                id="destination"
                type="text"
                placeholder="Lisboa, Portugal"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                required
                className="bg-white border-none shadow-xs text-petroleo placeholder:text-slate-400 h-13 px-4 rounded-xl text-base focus-visible:ring-2 focus-visible:ring-teal"
              />
            </div>

            {/* Período da Viagem */}
            <div className="flex flex-col gap-2">
              <Label className="text-sm font-bold text-petroleo">
                Período da viagem
              </Label>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <span className="text-xs font-semibold text-slate-500">Ida</span>
                  <Input
                    type="text"
                    placeholder="18 / 10 / 2001"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    required
                    className="bg-white border-none shadow-xs text-petroleo placeholder:text-slate-400 h-12 px-4 rounded-xl text-sm focus-visible:ring-2 focus-visible:ring-teal"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <span className="text-xs font-semibold text-slate-500">Volta</span>
                  <Input
                    type="text"
                    placeholder="19 / 10 / 2001"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    required
                    className="bg-white border-none shadow-xs text-petroleo placeholder:text-slate-400 h-12 px-4 rounded-xl text-sm focus-visible:ring-2 focus-visible:ring-teal"
                  />
                </div>
              </div>
            </div>

            {/* Atividades com Badges do Shadcn */}
            <div className="flex flex-col gap-3">
              <Label className="text-sm font-bold text-petroleo">
                Atividades da viagem
              </Label>

              <div className="bg-white/80 border border-slate-200/80 rounded-2xl p-4 flex items-start gap-3 shadow-xs">
                <Info className="w-5 h-5 text-petroleo shrink-0 mt-0.5" />
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  As atividades serão utilizadas para definir a melhor organização para sua bagagem.
                </p>
              </div>

              {/* Chips / Badges */}
              <div className="flex flex-wrap gap-2.5 mt-1">
                {AVAILABLE_ACTIVITIES.map((activity) => {
                  const isSelected = selectedActivities.includes(activity);
                  return (
                    <Badge
                      key={activity}
                      variant={isSelected ? 'default' : 'outline'}
                      onClick={() => toggleActivity(activity)}
                      className={`cursor-pointer px-4 py-2.5 rounded-full text-xs font-bold transition-all duration-200 select-none ${
                        isSelected
                          ? 'bg-petroleo text-white hover:bg-petroleo/90 shadow-xs'
                          : 'bg-teal-light/60 text-teal-dark border-dashed border-teal/40 hover:bg-teal-light'
                      }`}
                    >
                      {isSelected ? (
                        <Check className="w-3.5 h-3.5 mr-1.5 stroke-[3]" />
                      ) : (
                        <span className="w-3.5 h-3.5 mr-1.5 rounded-full border border-dashed border-teal-dark/60 inline-block" />
                      )}
                      {activity}
                    </Badge>
                  );
                })}
              </div>
            </div>
          </form>
        </div>

        {/* Botão Continuar */}
        <div className="mt-8 mb-4 md:mb-0">
          <Button
            type="submit"
            form="new-trip-form"
            variant="teal"
            className="w-full h-14 rounded-2xl text-base font-bold shadow-md"
          >
            Continuar
          </Button>
        </div>

      </div>
    </div>
  );
}