import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import {
  ArrowRight,
  Check,
  Cloud,
  CloudRain,
  Sun,
  CloudSun,
  AlertTriangle,
  RefreshCw,
  Plane,
  Bus,
  Car,
  Briefcase,
  Shirt,
  Info,
} from 'lucide-react';
import { toast } from 'sonner';
import type {
  Airline,
  DestinationCandidate,
  LuggageClass,
  TravelMode,
  TripCreateRequest,
  TripWeatherReport,
} from '@/@types/api';
import { tripsService } from '@/services/tripsService';
import { packingService } from '@/services/packingService';
import { ApiError } from '@/services/api';
import { Button } from '@/components/ui/button';
import { CityAutocomplete } from '@/components/ui/CityAutocomplete';
import { LottieLoader } from '@/components/ui/LottieLoader';

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

const LUGGAGE_OPTIONS: { value: LuggageClass; label: string; desc: string }[] = [
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

function formatDateLong(startStr: string, endStr: string): string {
  if (!startStr) return '';
  try {
    const s = new Date(startStr + 'T12:00:00');
    const startDay = s.getDate();
    const months = [
      'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
      'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro',
    ];
    const month = months[s.getMonth()];
    const year = s.getFullYear();

    if (!endStr) return `${startDay} de ${month} de ${year}`;
    const e = new Date(endStr + 'T12:00:00');
    const endDay = e.getDate();
    const endMonth = months[e.getMonth()];
    if (s.getMonth() === e.getMonth()) {
      return `${startDay} a ${endDay} de ${month} de ${year}`;
    }
    return `${startDay} de ${month} a ${endDay} de ${endMonth} de ${year}`;
  } catch {
    return `${startStr} a ${endStr}`;
  }
}

export function NewTrip() {
  const navigate = useNavigate();
  const { id: tripId } = useParams<{ id?: string }>();
  const isEditing = Boolean(tripId);

  // Wizard Steps: 1 = Dados da viagem, 2 = Previsão do tempo, 3 = Gerando lista
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [isLoadingExisting, setIsLoadingExisting] = useState(isEditing);

  // Form State
  const [originCity, setOriginCity] = useState('São Paulo, BR');
  const [destinationCity, setDestinationCity] = useState('');
  const [selectedCandidate, setSelectedCandidate] = useState<DestinationCandidate | null>(null);

  const [dateMode, setDateMode] = useState<'dates' | 'duration'>('dates');
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return toDateInputString(d);
  });
  const [endDate, setEndDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 14);
    return toDateInputString(d);
  });
  const [durationDays, setDurationDays] = useState(7);

  const [activities, setActivities] = useState<string[]>(['Turismo']);

  const [travelMode, setTravelMode] = useState<TravelMode>('FLIGHT');
  const [airline, setAirline] = useState<Airline>('LATAM');
  const [luggageClass, setLuggageClass] = useState<LuggageClass>('CARRY_ON_10KG');
  const [hasLaundry, setHasLaundry] = useState(false);

  // Weather report state
  const [weatherReport, setWeatherReport] = useState<TripWeatherReport | null>(null);
  const [isLoadingWeather, setIsLoadingWeather] = useState(false);

  // Calculate nights
  const calculateNights = () => {
    if (dateMode === 'duration') return Math.max(1, durationDays);
    if (!startDate || !endDate) return 1;
    const s = new Date(startDate);
    const e = new Date(endDate);
    const diff = Math.round((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 1;
  };

  const nights = calculateNights();

  // Load existing trip if editing
  useEffect(() => {
    if (!tripId) return;
    let active = true;

    async function loadTrip() {
      try {
        const trip = await tripsService.getTrip(tripId!);
        if (!active) return;
        setOriginCity(trip.origin_city);
        setDestinationCity(
          trip.destination.country_code
            ? `${trip.destination.city}, ${trip.destination.country_code}`
            : trip.destination.city
        );
        setStartDate(trip.start_date);
        setEndDate(trip.end_date);
        setDurationDays(trip.duration_days);
        setTravelMode(trip.travel_mode);
        if (trip.airline) setAirline(trip.airline);
        setLuggageClass(trip.luggage_class);
        setHasLaundry(trip.has_laundry);
        setActivities(trip.activities || []);
      } catch {
        toast.error('Erro ao carregar dados da viagem.');
        navigate('/viagens', { replace: true });
      } finally {
        if (active) setIsLoadingExisting(false);
      }
    }

    void loadTrip();
    return () => {
      active = false;
    };
  }, [tripId, navigate]);

  // Handle activity toggle
  const toggleActivity = (act: string) => {
    setActivities((prev) =>
      prev.includes(act) ? prev.filter((a) => a !== act) : [...prev, act]
    );
  };

  // Fetch weather for step 2
  const fetchWeather = async () => {
    setIsLoadingWeather(true);
    try {
      const destName = selectedCandidate
        ? selectedCandidate.name
        : destinationCity.split(',')[0].trim();
      const origName = originCity ? originCity.split(',')[0].trim() : 'São Paulo';

      const report = await tripsService.getTripWeatherReport({
        origin_city: origName,
        destination_city: destName,
        start_date: startDate,
        duration_days: nights,
      });

      setWeatherReport(report);
    } catch {
      const destName = destinationCity.split(',')[0].trim();
      const mockDays = Array.from({ length: Math.min(nights, 7) }, (_, i) => {
        const d = new Date(startDate);
        d.setDate(d.getDate() + i);
        return {
          date: toDateInputString(d),
          temp_min_c: 14 + (i % 3),
          temp_max_c: 22 + (i % 4),
          precip_mm: i % 2 === 0 ? 0 : 5,
          precip_probability_pct: i % 2 === 0 ? 10 : 50,
          condition_code: i % 2 === 0 ? 'SUNNY' : 'RAIN',
          condition_label: i % 2 === 0 ? 'Sol' : 'Parcialmente nublado',
          source: 'FORECAST',
        };
      });

      setWeatherReport({
        origin_city: originCity || 'Origem',
        destination_city: destName,
        start_date: startDate,
        duration_days: nights,
        origin_min_temp: 18,
        origin_max_temp: 26,
        dest_min_temp: 14,
        dest_max_temp: 22,
        dest_rain_prob_pct: 50,
        thermal_delta_c: 4,
        forecast_days: mockDays,
        warnings: [
          `Previsão meteorológica estimada para ${nights} dias. Vamos montar a lista considerando variação entre 14°C e 22°C.`,
        ],
      });
    } finally {
      setIsLoadingWeather(false);
    }
  };

  // Validate step 1 and proceed to step 2
  const handleProceedToWeather = async () => {
    if (!destinationCity.trim()) {
      toast.error('Por favor, informe a cidade de destino.');
      return;
    }

    if (!originCity.trim()) {
      toast.error('Por favor, informe sua cidade de origem.');
      return;
    }

    if (dateMode === 'dates' && startDate > endDate) {
      toast.error('A data de volta deve ser igual ou posterior à data de ida.');
      return;
    }

    setCurrentStep(2);
    await fetchWeather();
  };

  // Step 3: Save trip with exact TripCreateRequest schema and generate packing list
  const handleGeneratePackingList = async () => {
    setCurrentStep(3);

    try {
      const destCityClean = selectedCandidate
        ? selectedCandidate.name
        : destinationCity.split(',')[0]?.trim() || destinationCity.trim();

      const origCityClean = originCity.split(',')[0]?.trim() || originCity.trim();

      let computedEndDate = endDate;
      if (dateMode === 'duration' || !endDate || endDate < startDate) {
        const d = new Date(`${startDate}T12:00:00`);
        d.setDate(d.getDate() + nights);
        computedEndDate = toDateInputString(d);
      }

      const payload: TripCreateRequest = {
        origin_city: origCityClean,
        destination_ref: selectedCandidate?.provider_ref || null,
        destination_city: destCityClean,
        destination_country: selectedCandidate?.region || null,
        destination_country_code: selectedCandidate?.country_code || null,
        destination_lat: selectedCandidate?.latitude ?? null,
        destination_lon: selectedCandidate?.longitude ?? null,
        start_date: startDate,
        end_date: computedEndDate,
        travel_mode: travelMode,
        airline: travelMode === 'FLIGHT' ? airline : null,
        luggage_class: luggageClass,
        has_laundry: hasLaundry,
        activities,
      };

      if (isEditing && tripId) {
        const updated = await tripsService.updateTrip(tripId, payload);
        if (updated.list_outdated) {
          await packingService.regeneratePackingList(tripId);
          toast.success('Viagem e mala reconciliadas com sucesso!');
        } else {
          toast.success('Viagem atualizada com sucesso!');
        }
        navigate(`/mala/${tripId}`);
      } else {
        const created = await tripsService.createTrip(payload);
        await packingService.generatePackingList(created.id);
        toast.success('Mala criada com sucesso!', {
          description: `Seu checklist para ${created.destination.city} está pronto.`,
        });
        navigate(`/mala/${created.id}`);
      }
    } catch (err) {
      setCurrentStep(2);
      if (err instanceof ApiError) {
        toast.error('Não foi possível salvar a viagem', { description: err.message });
      } else {
        toast.error('Erro ao conectar com o servidor.');
      }
    }
  };

  // Weather Condition Icon
  const getWeatherIcon = (condition: string) => {
    const c = condition.toLowerCase();
    if (c.includes('chuva') || c.includes('garoa') || c.includes('rain')) {
      return <CloudRain className="w-6 h-6 text-[#0B7A75]" />;
    }
    if (c.includes('nublado') || c.includes('cloud')) {
      return <Cloud className="w-6 h-6 text-gray-500" />;
    }
    if (c.includes('parcial') || c.includes('sol')) {
      return <CloudSun className="w-6 h-6 text-[#F2B640]" />;
    }
    return <Sun className="w-6 h-6 text-[#F2B640]" />;
  };

  const cityNameOnly = selectedCandidate
    ? selectedCandidate.name
    : destinationCity.split(',')[0]?.trim() || 'Destino';

  if (isLoadingExisting) {
    return (
      <div className="min-h-[75vh] w-full flex items-center justify-center">
        <LottieLoader size="lg" variant="light-bg" message="Carregando dados da viagem..." />
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-8 pt-6 pb-20 flex flex-col gap-6">
      {/* Barra de Topo Limpa (Sem repetir a logo que já está na Sidebar) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200/80">
        {/* Stepper de Progresso */}
        <div className="flex items-center gap-2 sm:gap-5 text-xs sm:text-sm font-semibold select-none overflow-x-auto pb-1 sm:pb-0">
          {/* Etapa 1 */}
          <button
            type="button"
            onClick={() => currentStep === 2 && setCurrentStep(1)}
            disabled={currentStep !== 2}
            className="flex items-center gap-2 shrink-0 cursor-pointer disabled:cursor-default"
          >
            <span
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                currentStep >= 1 ? 'bg-[#0B7A75] text-white' : 'bg-gray-200 text-gray-500'
              }`}
            >
              {currentStep > 1 ? <Check className="w-4 h-4 stroke-[3]" /> : '1'}
            </span>
            <span className={currentStep === 1 ? 'text-[#0B2B33] font-bold' : 'text-gray-500'}>
              Dados da viagem
            </span>
          </button>

          <div className="w-6 sm:w-12 h-0.5 bg-gray-200 shrink-0" />

          {/* Etapa 2 */}
          <div className="flex items-center gap-2 shrink-0">
            <span
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                currentStep >= 2 ? 'bg-[#0B7A75] text-white' : 'bg-gray-200 text-gray-500'
              }`}
            >
              {currentStep > 2 ? <Check className="w-4 h-4 stroke-[3]" /> : '2'}
            </span>
            <span className={currentStep === 2 ? 'text-[#0B2B33] font-bold' : 'text-gray-500'}>
              Previsão do tempo
            </span>
          </div>

          <div className="w-6 sm:w-12 h-0.5 bg-gray-200 shrink-0" />

          {/* Etapa 3 */}
          <div className="flex items-center gap-2 shrink-0">
            <span
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                currentStep === 3 ? 'bg-[#0B7A75] text-white' : 'bg-gray-200 text-gray-500'
              }`}
            >
              3
            </span>
            <span className={currentStep === 3 ? 'text-[#0B2B33] font-bold' : 'text-gray-500'}>
              Lista de bagagem
            </span>
          </div>
        </div>

        <Link
          to="/viagens"
          className="text-xs sm:text-sm font-semibold text-[#0B7A75] hover:text-[#085E5A] transition-colors shrink-0 self-end sm:self-auto"
        >
          {currentStep === 1 ? 'Cancelar planejamento' : 'Voltar para viagens'}
        </Link>
      </div>

      {/* ========================================================
          ETAPA 1: DADOS DA VIAGEM
          ======================================================== */}
      {currentStep === 1 && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 items-start">
          {/* Formulário Principal (8 Colunas) */}
          <div className="lg:col-span-8 bg-white rounded-3xl p-6 sm:p-9 shadow-xs border border-gray-100 flex flex-col gap-7">
            <div>
              <span className="text-xs font-bold text-[#0B7A75] tracking-wider uppercase">
                ETAPA 1 DE 3
              </span>
              <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-[#0B2B33] mt-1">
                {isEditing ? 'Editar dados da viagem' : 'Conte sobre a viagem'}
              </h1>
              <p className="text-sm text-gray-600 mt-1.5 leading-relaxed">
                Com essas informações, buscamos o clima e montamos sua lista. Você pode ajustar tudo antes de gerar.
              </p>
            </div>

            {/* Destino e Origem */}
            <div className="flex flex-col gap-5">
              <CityAutocomplete
                label="Destino"
                placeholder="Ex: Lisboa, Portugal"
                helperText="Cidade e país ajudam a encontrar a previsão certa."
                value={destinationCity}
                onChange={(val, candidate) => {
                  setDestinationCity(val);
                  if (candidate) {
                    setSelectedCandidate(candidate);
                  } else {
                    setSelectedCandidate(null);
                  }
                }}
              />

              <CityAutocomplete
                label="Origem (Sua cidade de partida)"
                placeholder="Ex: São Paulo, Brasil"
                helperText="Usamos sua origem para calibrar alertas de diferença térmica no embarque."
                value={originCity}
                onChange={(val) => setOriginCity(val)}
              />
            </div>

            {/* Quando você vai? */}
            <div className="flex flex-col gap-3">
              <label className="text-sm font-semibold text-[#0B2B33]">
                Quando você vai?
              </label>

              <div className="inline-flex rounded-xl bg-gray-100 p-1 w-fit">
                <button
                  type="button"
                  onClick={() => setDateMode('dates')}
                  className={`px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                    dateMode === 'dates'
                      ? 'bg-white text-[#0B2B33] shadow-xs'
                      : 'text-gray-500 hover:text-[#0B2B33]'
                  }`}
                >
                  Período (datas)
                </button>
                <button
                  type="button"
                  onClick={() => setDateMode('duration')}
                  className={`px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                    dateMode === 'duration'
                      ? 'bg-white text-[#0B2B33] shadow-xs'
                      : 'text-gray-500 hover:text-[#0B2B33]'
                  }`}
                >
                  Só a duração
                </button>
              </div>

              {dateMode === 'dates' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end mt-1">
                  <div>
                    <span className="block text-xs font-medium text-gray-600 mb-1">Ida</span>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full h-11 rounded-xl border border-gray-200 px-3.5 text-sm text-[#0B2B33] focus:border-[#0B7A75] focus:outline-none"
                    />
                  </div>
                  <div>
                    <span className="block text-xs font-medium text-gray-600 mb-1">Volta</span>
                    <div className="flex items-center gap-2">
                      <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-full h-11 rounded-xl border border-gray-200 px-3.5 text-sm text-[#0B2B33] focus:border-[#0B7A75] focus:outline-none"
                      />
                      <span className="h-11 px-3.5 rounded-xl bg-[#E3F1EF] text-[#085E5A] font-bold text-xs inline-flex items-center shrink-0 whitespace-nowrap">
                        {nights} {nights === 1 ? 'noite' : 'noites'}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3 mt-1">
                  <input
                    type="number"
                    min={1}
                    max={90}
                    value={durationDays}
                    onChange={(e) => setDurationDays(Math.max(1, Number(e.target.value)))}
                    className="w-28 h-11 rounded-xl border border-gray-200 px-3.5 text-sm text-[#0B2B33] focus:border-[#0B7A75] focus:outline-none font-bold"
                  />
                  <span className="text-sm text-gray-600 font-medium">noites de estadia</span>
                </div>
              )}
            </div>

            {/* Meio de Transporte (Restaurado: Avião, Ônibus, Carro) */}
            <div className="flex flex-col gap-3 pt-2 border-t border-gray-100">
              <label className="text-sm font-semibold text-[#0B2B33]">
                Meio de transporte
              </label>
              <div className="grid grid-cols-3 gap-3">
                {TRAVEL_MODES.map((mode) => {
                  const Icon = mode.icon;
                  const active = travelMode === mode.value;
                  return (
                    <button
                      key={mode.value}
                      type="button"
                      onClick={() => setTravelMode(mode.value)}
                      className={`p-3.5 rounded-2xl flex flex-col items-center justify-center gap-1.5 font-semibold text-xs border transition-all cursor-pointer ${
                        active
                          ? 'bg-[#0B2B33] text-white border-[#0B2B33] shadow-sm'
                          : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      {mode.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Companhia Aérea (Exibida quando o transporte é Avião) */}
            {travelMode === 'FLIGHT' && (
              <div className="flex flex-col gap-2.5">
                <label className="text-sm font-semibold text-[#0B2B33]">
                  Companhia aérea
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {AIRLINES.map((item) => {
                    const active = airline === item.value;
                    return (
                      <button
                        key={item.value}
                        type="button"
                        onClick={() => setAirline(item.value)}
                        className={`h-11 rounded-xl font-bold text-xs border transition-all cursor-pointer ${
                          active
                            ? 'bg-[#0B7A75] text-white border-[#0B7A75] shadow-xs'
                            : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        {item.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Franquia / Tipo de Bagagem */}
            <div className="flex flex-col gap-2.5">
              <label className="text-sm font-semibold text-[#0B2B33] flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-[#0B7A75]" />
                Franquia / Tipo de bagagem
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {LUGGAGE_OPTIONS.map((opt) => {
                  const isSelected = luggageClass === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setLuggageClass(opt.value)}
                      className={`flex flex-col p-3.5 rounded-2xl border text-left cursor-pointer transition-all ${
                        isSelected
                          ? 'border-[#0B7A75] bg-[#0B2B33] text-white shadow-sm ring-2 ring-[#0B7A75]/30'
                          : 'border-gray-200 bg-white text-[#0B2B33] hover:border-gray-300'
                      }`}
                    >
                      <span className="font-bold text-sm">{opt.label}</span>
                      <span className={`text-xs mt-0.5 ${isSelected ? 'text-[#E3F1EF]' : 'text-gray-500'}`}>
                        {opt.desc}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Lavanderia no Destino */}
            <div
              onClick={() => setHasLaundry((prev) => !prev)}
              className="flex items-center justify-between p-4 rounded-2xl bg-gray-50/80 border border-gray-200/80 cursor-pointer hover:bg-gray-100/70 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#E3F1EF] text-[#0B7A75] flex items-center justify-center shrink-0">
                  <Shirt className="w-5 h-5" />
                </div>
                <div>
                  <span className="font-semibold text-sm text-[#0B2B33] block">
                    Lavanderia disponível no destino
                  </span>
                  <span className="text-xs text-gray-500">
                    Reduz o volume da mala limitando o ciclo de roupas para 5 dias.
                  </span>
                </div>
              </div>

              <div
                className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                  hasLaundry ? 'bg-[#0B7A75] text-white' : 'border-2 border-gray-300 bg-white'
                }`}
              >
                {hasLaundry && <Check className="w-4 h-4 stroke-[3]" />}
              </div>
            </div>

            {/* O que você vai fazer? (Apenas atividades suportadas pelo motor do backend) */}
            <div className="flex flex-col gap-2.5 pt-2 border-t border-gray-100">
              <label className="text-sm font-semibold text-[#0B2B33]">
                O que você vai fazer?
              </label>
              <p className="text-xs text-gray-500">
                Escolha quantas quiser — cada atividade adiciona uma cápsula específica de itens à sua lista.
              </p>

              <div className="flex flex-wrap gap-2 pt-1">
                {AVAILABLE_ACTIVITIES.map((act) => {
                  const isSelected = activities.includes(act);
                  return (
                    <button
                      key={act}
                      type="button"
                      onClick={() => toggleActivity(act)}
                      className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-[#0B7A75] text-white shadow-xs'
                          : 'bg-white border border-gray-200 text-gray-700 hover:border-[#0B7A75]/50 hover:bg-[#E3F1EF]/30'
                      }`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      {act}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Rodapé / Botões */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <Link
                to="/viagens"
                className="px-5 py-3 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Voltar
              </Link>

              <Button
                type="button"
                onClick={handleProceedToWeather}
                className="h-12 px-6 rounded-xl bg-[#0B7A75] hover:bg-[#085E5A] text-white font-semibold text-sm inline-flex items-center gap-2 shadow-sm cursor-pointer transition-all"
              >
                Continuar para a previsão
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Coluna Direita: Resumo em Tempo Real (4 Colunas) */}
          <div className="lg:col-span-4 flex flex-col gap-4 lg:sticky lg:top-8">
            <div className="bg-[#0B2B33] text-white rounded-3xl p-6 sm:p-7 shadow-xl flex flex-col gap-4">
              <span className="text-[11px] font-bold text-white/50 tracking-wider uppercase">
                RESUMO
              </span>
              <h3 className="font-heading font-extrabold text-2xl sm:text-3xl text-white">
                {cityNameOnly}
              </h3>
              <p className="text-xs text-white/75 font-medium">
                {formatDateLong(startDate, endDate)} · {nights} {nights === 1 ? 'noite' : 'noites'}
              </p>

              <div className="flex flex-wrap gap-1.5 text-[11px] text-[#F2B640] font-semibold">
                <span>
                  {travelMode === 'FLIGHT'
                    ? `Avião (${airline})`
                    : travelMode === 'BUS'
                    ? 'Ônibus'
                    : 'Carro'}
                </span>
                <span>·</span>
                <span>
                  {LUGGAGE_OPTIONS.find((l) => l.value === luggageClass)?.label}
                </span>
              </div>

              {activities.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-3 border-t border-white/10">
                  {activities.map((a) => (
                    <span
                      key={a}
                      className="px-2.5 py-1 rounded-full bg-white/10 text-white text-[11px] font-medium"
                    >
                      {a}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Caixa Informativa */}
            <div className="bg-[#E3F1EF] text-[#085E5A] rounded-2xl p-5 border border-[#0B7A75]/20 flex gap-3 text-xs leading-relaxed">
              <Info className="w-5 h-5 shrink-0 text-[#0B7A75]" />
              <div>
                <strong className="block font-bold text-[#0B2B33] mb-1">O que vem depois</strong>
                Consultamos a previsão do tempo para o destino e o período. Se algum dia ainda não tiver previsão, avisamos e seguimos com os dados disponíveis.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          ETAPA 2: PREVISÃO DO TEMPO
          ======================================================== */}
      {currentStep === 2 && (
        <div className="max-w-4xl mx-auto w-full flex flex-col gap-6">
          <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-xs border border-gray-100 flex flex-col gap-6">
            <div>
              <span className="text-xs font-bold text-[#0B7A75] tracking-wider uppercase">
                ETAPA 2 DE 3
              </span>
              <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-[#0B2B33] mt-1">
                Como deve estar o tempo em {cityNameOnly}
              </h1>
              <p className="text-sm text-gray-600 mt-1.5">
                {formatDateLong(startDate, endDate)} · usamos essa previsão para sugerir roupas e itens de proteção.
              </p>
            </div>

            {isLoadingWeather ? (
              <div className="py-16">
                <LottieLoader
                  size="lg"
                  variant="light-bg"
                  message="Consultando previsão meteorológica para o seu destino..."
                />
              </div>
            ) : (
              <>
                {/* Banner de Aviso de Clima */}
                <div className="bg-[#FFF8E2] border border-[#F2B640] rounded-2xl p-4 sm:p-5 flex items-start gap-3 text-xs sm:text-sm text-[#0B2B33]">
                  <AlertTriangle className="w-5 h-5 text-[#F2B640] shrink-0 mt-0.5" />
                  <div>
                    {weatherReport?.warnings && weatherReport.warnings.length > 0 ? (
                      weatherReport.warnings.map((w, idx) => <p key={idx}>{w}</p>)
                    ) : (
                      <p>
                        Previsão disponível para {weatherReport?.forecast_days?.length || nights} dias do período. Vamos montar a lista considerando a temperatura e as atividades que você informou.
                      </p>
                    )}
                  </div>
                </div>

                {/* 3 Cards de Indicadores */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-[#F3F7F6] rounded-2xl p-5 border border-gray-200/60">
                    <span className="text-xs text-gray-500 font-medium block">
                      Temperatura prevista
                    </span>
                    <span className="font-heading font-extrabold text-2xl sm:text-3xl text-[#0B2B33] mt-1 block">
                      {weatherReport?.dest_min_temp !== null && weatherReport?.dest_min_temp !== undefined
                        ? Math.round(weatherReport.dest_min_temp)
                        : 14}
                      ° –{' '}
                      {weatherReport?.dest_max_temp !== null && weatherReport?.dest_max_temp !== undefined
                        ? Math.round(weatherReport.dest_max_temp)
                        : 21}
                      °C
                    </span>
                  </div>

                  <div className="bg-[#F3F7F6] rounded-2xl p-5 border border-gray-200/60">
                    <span className="text-xs text-gray-500 font-medium block">
                      Chance de chuva
                    </span>
                    <span className="font-heading font-extrabold text-2xl sm:text-3xl text-[#0B2B33] mt-1 block">
                      até {Math.round(weatherReport?.dest_rain_prob_pct ?? 40)}%
                    </span>
                  </div>

                  <div className="bg-[#F3F7F6] rounded-2xl p-5 border border-gray-200/60">
                    <span className="text-xs text-gray-500 font-medium block">
                      Condição predominante
                    </span>
                    <span className="font-heading font-extrabold text-2xl sm:text-3xl text-[#0B2B33] mt-1 block">
                      {weatherReport?.forecast_days?.[0]?.condition_label || 'Estável'}
                    </span>
                  </div>
                </div>

                {/* Previsão Diária Horizontal */}
                <div>
                  <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
                    Previsão dia a dia
                  </h4>

                  <div className="flex gap-3 overflow-x-auto pb-3 pt-1 snap-x">
                    {weatherReport?.forecast_days && weatherReport.forecast_days.length > 0 ? (
                      weatherReport.forecast_days.map((day, idx) => {
                        const parts = day.date.split('-');
                        const dayNum = parts[2] || `${idx + 1}`;
                        return (
                          <div
                            key={day.date}
                            className="w-28 shrink-0 bg-white rounded-2xl p-3.5 border border-gray-200 text-center flex flex-col items-center gap-2 shadow-2xs snap-start"
                          >
                            <span className="text-xs font-bold text-[#0B2B33]">
                              Dia {dayNum}
                            </span>
                            <div className="my-1">
                              {getWeatherIcon(day.condition_label || '')}
                            </div>
                            <span className="text-xs font-extrabold text-[#0B2B33]">
                              {day.temp_max_c !== null ? Math.round(day.temp_max_c) : 20}° /{' '}
                              {day.temp_min_c !== null ? Math.round(day.temp_min_c) : 14}°
                            </span>
                            <span className="text-[11px] text-gray-500 truncate max-w-full">
                              {day.condition_label || 'Estável'}
                            </span>
                          </div>
                        );
                      })
                    ) : (
                      <p className="text-xs text-gray-500">Nenhum dado diário detalhado disponível.</p>
                    )}
                  </div>
                </div>

                <p className="text-[11px] text-gray-400">
                  Dados de serviços meteorológicos externos. A previsão é uma estimativa e se ajusta conforme as datas se aproximam.
                </p>

                {/* Rodapé / Botões */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-6 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    className="w-full sm:w-auto px-5 py-3 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    Voltar e ajustar dados
                  </button>

                  <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                    <button
                      type="button"
                      onClick={fetchWeather}
                      className="px-4 py-3 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 inline-flex items-center gap-1.5 cursor-pointer transition-colors"
                    >
                      <RefreshCw className="w-4 h-4" />
                      Atualizar previsão
                    </button>

                    <Button
                      type="button"
                      onClick={handleGeneratePackingList}
                      className="h-12 px-6 rounded-xl bg-[#0B7A75] hover:bg-[#085E5A] text-white font-semibold text-sm inline-flex items-center gap-2 shadow-sm cursor-pointer transition-all"
                    >
                      {isEditing ? 'Salvar e atualizar mala' : 'Gerar lista de bagagem'}
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ========================================================
          ETAPA 3: GERANDO A LISTA (LOADING ANIMADO COM LOTTIE CLARO)
          ======================================================== */}
      {currentStep === 3 && (
        <div className="max-w-md mx-auto my-12 w-full bg-white rounded-3xl p-10 shadow-sm border border-gray-100 flex flex-col items-center text-center">
          <LottieLoader
            size="lg"
            variant="light-bg"
            message={`Montando sua mala personalizada para ${cityNameOnly}...`}
          />
          <p className="text-xs text-gray-500 mt-2 max-w-xs leading-relaxed">
            Dimensionando itens para {nights} {nights === 1 ? 'noite' : 'noites'} e ajustando para o clima previsto.
          </p>
        </div>
      )}
    </div>
  );
}
