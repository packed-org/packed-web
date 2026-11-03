import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ChevronLeft,
  Info,
  Check,
  MapPin,
  Plane,
  Bus,
  Car,
  Briefcase,
  Shirt,
  Search,
} from 'lucide-react';
import { toast } from 'sonner';
import type {
  Airline,
  DestinationCandidate,
  LuggageClass,
  TravelMode,
} from '@/@types/api';
import { tripsService } from '@/services/tripsService';
import { packingService } from '@/services/packingService';
import { ApiError } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { DatePicker } from '@/components/ui/datepicker';

const AVAILABLE_ACTIVITIES = [
  'Trilhas',
  'Esporte',
  'Praia & Mar',
  'Trabalho',
  'Vida noturna',
  'Museus',
  'Turismo',
];

const TRAVEL_MODES: { value: TravelMode; label: string; icon: typeof Plane }[] = [
  { value: 'FLIGHT', label: 'Avião', icon: Plane },
  { value: 'BUS', label: 'Ônibus', icon: Bus },
  { value: 'CAR', label: 'Carro', icon: Car },
];

const AIRLINES: { value: Airline; label: string }[] = [
  { value: 'LATAM', label: 'LATAM' },
  { value: 'GOL', label: 'GOL' },
  { value: 'AZUL', label: 'Azul' },
  { value: 'OTHER', label: 'Outra Cia' },
];

const LUGGAGE_CLASSES: { value: LuggageClass; label: string; desc: string }[] = [
  { value: 'PERSONAL_ITEM', label: 'Mochila', desc: 'Item pessoal compacto' },
  { value: 'CARRY_ON_10KG', label: 'Mala de Bordo', desc: 'Cabine até 10kg' },
  { value: 'CHECKED_23KG', label: 'Despachada', desc: 'Porão até 23kg' },
];

function toDateInputString(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function NewTrip() {
  const navigate = useNavigate();
  const { id: tripId } = useParams<{ id?: string }>();
  const isEditing = Boolean(tripId);

  const [originCity, setOriginCity] = useState('Fortaleza, BR');
  const [destinationText, setDestinationText] = useState('');
  const [selectedCandidate, setSelectedCandidate] = useState<DestinationCandidate | null>(null);
  const [candidates, setCandidates] = useState<DestinationCandidate[]>([]);
  const [isSearchingDest, setIsSearchingDest] = useState(false);

  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();

  const [travelMode, setTravelMode] = useState<TravelMode>('FLIGHT');
  const [airline, setAirline] = useState<Airline>('LATAM');
  const [luggageClass, setLuggageClass] = useState<LuggageClass>('CARRY_ON_10KG');
  const [hasLaundry, setHasLaundry] = useState(false);
  const [selectedActivities, setSelectedActivities] = useState<string[]>(['Turismo']);

  const [isLoadingTrip, setIsLoadingTrip] = useState(isEditing);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Carrega dados da viagem quando estiver em modo de edição
  useEffect(() => {
    if (!tripId) return;

    const fetchExisting = async () => {
      try {
        const trip = await tripsService.getTrip(tripId);
        setOriginCity(trip.origin_city);
        setDestinationText(
          `${trip.destination.city}, ${trip.destination.country || trip.destination.country_code}`
        );
        setStartDate(new Date(`${trip.start_date}T12:00:00`));
        setEndDate(new Date(`${trip.end_date}T12:00:00`));
        setTravelMode(trip.travel_mode);
        if (trip.airline) setAirline(trip.airline);
        setLuggageClass(trip.luggage_class);
        setHasLaundry(trip.has_laundry);
        setSelectedActivities(trip.activities);
      } catch {
        toast.error('Não foi possível carregar os dados da viagem.');
        navigate('/viagens', { replace: true });
      } finally {
        setIsLoadingTrip(false);
      }
    };

    void fetchExisting();
  }, [tripId, navigate]);

  // Autocomplete de destinos com debounce
  useEffect(() => {
    const query = destinationText.trim();
    if (query.length < 2 || selectedCandidate) {
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearchingDest(true);
      try {
        const results = await tripsService.searchDestinations(query, 5);
        setCandidates(results);
      } catch {
        setCandidates([]);
      } finally {
        setIsSearchingDest(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [destinationText, selectedCandidate]);

  const toggleActivity = (activity: string) => {
    setSelectedActivities((prev) =>
      prev.includes(activity) ? prev.filter((a) => a !== activity) : [...prev, activity]
    );
  };

  const handleStartDateChange = (date?: Date) => {
    setStartDate(date);
    if (date && endDate && endDate < date) {
      setEndDate(undefined);
    }
  };

  const handleSelectCandidate = (c: DestinationCandidate) => {
    setSelectedCandidate(c);
    setDestinationText(`${c.name}, ${c.country_code}`);
    setCandidates([]);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!originCity.trim()) {
      toast.error('Informe sua cidade de origem.');
      return;
    }

    if (!destinationText.trim()) {
      toast.error('Por favor, informe o destino da viagem.');
      return;
    }

    if (!startDate || !endDate) {
      toast.error('Selecione as datas de ida e volta.');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        origin_city: originCity.trim(),
        destination_ref: selectedCandidate?.provider_ref || null,
        destination_city: selectedCandidate ? selectedCandidate.name : destinationText.trim(),
        destination_country: selectedCandidate?.region || null,
        destination_country_code: selectedCandidate?.country_code || null,
        destination_lat: selectedCandidate?.latitude ?? null,
        destination_lon: selectedCandidate?.longitude ?? null,
        start_date: toDateInputString(startDate),
        end_date: toDateInputString(endDate),
        travel_mode: travelMode,
        airline: travelMode === 'FLIGHT' ? airline : null,
        luggage_class: luggageClass,
        has_laundry: hasLaundry,
        activities: selectedActivities,
      };

      if (isEditing && tripId) {
        const updated = await tripsService.updateTrip(tripId, payload);
        if (updated.list_outdated) {
          await packingService.regeneratePackingList(tripId);
          toast.success('Viagem e mala atualizadas!', {
            description: 'Seus itens marcados e customizados foram preservados.',
          });
        } else {
          toast.success('Viagem atualizada com sucesso!');
        }
        navigate(`/mala/${tripId}`);
      } else {
        const created = await tripsService.createTrip(payload);
        await packingService.generatePackingList(created.id);
        toast.success('Mala inteligente gerada!', {
          description: `Planejamento para ${created.destination.city} criado com sucesso.`,
        });
        navigate(`/mala/${created.id}`);
      }
    } catch (error) {
      if (error instanceof ApiError) {
        toast.error('Não foi possível salvar a viagem', { description: error.message });
      } else {
        toast.error('Erro inesperado ao salvar sua viagem.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingTrip) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-petroleo-light text-petroleo font-bold">
        Carregando dados da viagem...
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto px-5 pt-6 pb-12 select-none">
      <div className="flex flex-col gap-6">
        {/* Topo / Voltar */}
        <button
          type="button"
          onClick={() => navigate(isEditing && tripId ? `/mala/${tripId}` : '/viagens')}
          className="flex items-center gap-2 text-petroleo hover:text-teal font-bold transition-colors self-start cursor-pointer"
        >
          <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
          <span className="text-base">{isEditing ? 'Voltar para a mala' : 'Minhas viagens'}</span>
        </button>

        {/* Título */}
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-extrabold text-petroleo tracking-tight">
            {isEditing ? 'Ajustar parâmetros da viagem' : 'Para onde vamos?'}
          </h1>
          <p className="text-sm text-slate-600 font-medium">
            {isEditing
              ? 'Altere datas, transporte ou atividades — sua mala será reconciliada sem perder seus checks.'
              : 'Informe origem, destino e estilo de viagem para calcularmos clima, tomadas e roupas ideais.'}
          </p>
        </div>

        {/* Formulário */}
        <form id="trip-form" onSubmit={handleSubmit} className="flex flex-col gap-6">
          {/* Origem e Destino */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="origin" className="text-sm font-bold text-petroleo">
                Cidade de Origem
              </Label>
              <div className="relative flex items-center">
                <MapPin className="absolute left-3.5 w-4 h-4 text-teal pointer-events-none" />
                <Input
                  id="origin"
                  type="text"
                  placeholder="Fortaleza, BR"
                  value={originCity}
                  onChange={(e) => setOriginCity(e.target.value)}
                  required
                  className="bg-white border-none shadow-xs text-petroleo h-12 pl-10 pr-4 rounded-xl text-sm"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2 relative">
              <Label htmlFor="destination" className="text-sm font-bold text-petroleo">
                Cidade de Destino
              </Label>
              <div className="relative flex items-center">
                <Search className="absolute left-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
                <Input
                  id="destination"
                  type="text"
                  placeholder="Ex: Lisboa, PT ou Praga, CZ"
                  value={destinationText}
                  onChange={(e) => {
                    const val = e.target.value;
                    setDestinationText(val);
                    setSelectedCandidate(null);
                    if (val.trim().length < 2) {
                      setCandidates([]);
                    }
                  }}
                  required
                  className="bg-white border-none shadow-xs text-petroleo h-12 pl-10 pr-4 rounded-xl text-sm"
                />
              </div>

              {/* Sugestões do Autocomplete da API */}
              {(candidates.length > 0 || isSearchingDest) && (
                <div className="absolute top-20 left-0 z-30 w-full bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
                  {isSearchingDest ? (
                    <div className="px-4 py-3 text-xs text-slate-400 font-medium">
                      Buscando destinos...
                    </div>
                  ) : (
                    candidates.map((cand) => (
                      <button
                        key={cand.provider_ref}
                        type="button"
                        onClick={() => handleSelectCandidate(cand)}
                        className="w-full text-left px-4 py-3 hover:bg-teal-light/50 flex items-center justify-between border-b border-slate-50 last:border-none cursor-pointer"
                      >
                        <div>
                          <p className="text-sm font-bold text-petroleo">{cand.name}</p>
                          <p className="text-xs text-slate-500">
                            {cand.region ? `${cand.region} · ` : ''}
                            {cand.country_code}
                          </p>
                        </div>
                        <Badge className="bg-petroleo-light text-petroleo border-none text-[10px]">
                          {cand.country_code}
                        </Badge>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Período da Viagem */}
          <div className="flex flex-col gap-2">
            <Label className="text-sm font-bold text-petroleo">Período da viagem</Label>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-semibold text-slate-500">Ida</span>
                <DatePicker
                  date={startDate}
                  setDate={handleStartDateChange}
                  placeholder="Data de ida"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-semibold text-slate-500">Volta</span>
                <DatePicker
                  date={endDate}
                  setDate={setEndDate}
                  placeholder="Data de volta"
                  disabled={(date) => (startDate ? date < startDate : false)}
                />
              </div>
            </div>
          </div>

          {/* Meio de Transporte */}
          <div className="flex flex-col gap-2.5">
            <Label className="text-sm font-bold text-petroleo">Meio de transporte</Label>
            <div className="grid grid-cols-3 gap-3">
              {TRAVEL_MODES.map((mode) => {
                const Icon = mode.icon;
                const active = travelMode === mode.value;
                return (
                  <button
                    key={mode.value}
                    type="button"
                    onClick={() => setTravelMode(mode.value)}
                    className={`h-14 rounded-2xl flex items-center justify-center gap-2 font-bold text-sm transition-all cursor-pointer ${
                      active
                        ? 'bg-petroleo text-white shadow-sm'
                        : 'bg-white text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {mode.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Companhia Aérea (se Avião) */}
          {travelMode === 'FLIGHT' && (
            <div className="flex flex-col gap-2.5">
              <Label className="text-sm font-bold text-petroleo">
                Companhia aérea (regras de bordo)
              </Label>
              <div className="grid grid-cols-4 gap-2">
                {AIRLINES.map((item) => {
                  const active = airline === item.value;
                  return (
                    <button
                      key={item.value}
                      type="button"
                      onClick={() => setAirline(item.value)}
                      className={`h-11 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                        active
                          ? 'bg-teal text-white shadow-xs'
                          : 'bg-white text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Classe de Bagagem */}
          <div className="flex flex-col gap-2.5">
            <Label className="text-sm font-bold text-petroleo flex items-center gap-1.5">
              <Briefcase className="w-4 h-4 text-teal" />
              Franquia / Tipo de bagagem
            </Label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {LUGGAGE_CLASSES.map((lug) => {
                const active = luggageClass === lug.value;
                return (
                  <button
                    key={lug.value}
                    type="button"
                    onClick={() => setLuggageClass(lug.value)}
                    className={`p-3.5 rounded-2xl text-left transition-all flex flex-col gap-0.5 cursor-pointer ${
                      active
                        ? 'bg-petroleo text-white shadow-sm ring-2 ring-teal'
                        : 'bg-white text-petroleo hover:bg-slate-100'
                    }`}
                  >
                    <span className="text-sm font-bold">{lug.label}</span>
                    <span className={`text-[11px] ${active ? 'text-teal-soft' : 'text-slate-500'}`}>
                      {lug.desc}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Lavanderia disponível */}
          <div
            onClick={() => setHasLaundry((prev) => !prev)}
            className="bg-white rounded-2xl p-4 flex items-center justify-between cursor-pointer shadow-xs hover:bg-slate-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal-light flex items-center justify-center text-teal">
                <Shirt className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-petroleo">Lavanderia disponível no destino</p>
                <p className="text-xs text-slate-500">
                  Reduz o volume da mala limitando o ciclo de roupas para 5 dias.
                </p>
              </div>
            </div>
            <div
              className={`w-6 h-6 rounded-lg flex items-center justify-center transition-colors ${
                hasLaundry ? 'bg-teal text-white' : 'border-2 border-slate-300'
              }`}
            >
              {hasLaundry && <Check className="w-4 h-4 stroke-[3]" />}
            </div>
          </div>

          {/* Atividades */}
          <div className="flex flex-col gap-3">
            <Label className="text-sm font-bold text-petroleo">Atividades planejadas</Label>

            <div className="bg-white/80 border border-slate-200/80 rounded-2xl p-3.5 flex items-start gap-3">
              <Info className="w-4 h-4 text-teal shrink-0 mt-0.5" />
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                Cada atividade selecionada adiciona uma cápsula específica de itens ao seu
                checklist.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {AVAILABLE_ACTIVITIES.map((activity) => {
                const isSelected = selectedActivities.includes(activity);
                return (
                  <Badge
                    key={activity}
                    variant={isSelected ? 'default' : 'outline'}
                    onClick={() => toggleActivity(activity)}
                    className={`cursor-pointer px-4 py-2.5 rounded-full text-xs font-bold transition-all select-none ${
                      isSelected
                        ? 'bg-petroleo text-white hover:bg-petroleo/90 shadow-xs'
                        : 'bg-white text-teal-dark border-dashed border-teal/40 hover:bg-teal-light'
                    }`}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5 mr-1.5 stroke-[3]" />}
                    {activity}
                  </Badge>
                );
              })}
            </div>
          </div>

          <Button
            type="submit"
            variant="teal"
            disabled={isSubmitting}
            className="w-full h-14 rounded-2xl text-base font-bold shadow-md mt-2 cursor-pointer"
          >
            {isSubmitting
              ? 'Calculando clima e salvando...'
              : isEditing
                ? 'Salvar e atualizar mala'
                : 'Gerar mala inteligente'}
          </Button>
        </form>
      </div>
    </div>
  );
}
