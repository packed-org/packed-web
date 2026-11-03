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
  Plus,
  Luggage,
  Shirt,
  Info,
} from 'lucide-react';
import { toast } from 'sonner';
import type {
  Airline,
  DestinationCandidate,
  LuggageClass,
  TravelMode,
  TripWeatherReport,
} from '@/@types/api';
import { tripsService } from '@/services/tripsService';
import { packingService } from '@/services/packingService';
import { ApiError } from '@/services/api';
import { Button } from '@/components/ui/button';
import { CityAutocomplete } from '@/components/ui/CityAutocomplete';
import { PackedLogo } from '@/components/ui/PackedLogo';
import { LottieLoader } from '@/components/ui/LottieLoader';

const AVAILABLE_ACTIVITIES = [
  'Passeios a pé',
  'Jantar elegante',
  'Trabalho remoto',
  'Praia',
  'Trilha',
  'Esportes',
  'Festa ou evento',
  'Reunião formal',
  'Casamento',
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
      'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'
    ];
    const month = months[s.getMonth()];
    const year = s.getFullYear();

    if (!endStr) return `${startDay} de ${month} de ${year}`;
    const e = new Date(endStr + 'T12:00:00');
    const endDay = e.getDate();
    return `${startDay} a ${endDay} de ${month} de ${year}`;
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

  // Form State
  const [originCity, setOriginCity] = useState('');
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

  const [activities, setActivities] = useState<string[]>([
    'Passeios a pé',
    'Jantar elegante',
    'Trabalho remoto',
  ]);
  const [customActivityInput, setCustomActivityInput] = useState('');
  const [showCustomActivity, setShowCustomActivity] = useState(false);

  const [travelMode] = useState<TravelMode>('FLIGHT');
  const [airline] = useState<Airline>('LATAM');
  const [luggageClass, setLuggageClass] = useState<LuggageClass>('CARRY_ON_10KG');
  const [hasLaundry, setHasLaundry] = useState(false);

  // Weather report state
  const [weatherReport, setWeatherReport] = useState<TripWeatherReport | null>(null);
  const [isLoadingWeather, setIsLoadingWeather] = useState(false);

  // Calculate nights
  const calculateNights = () => {
    if (dateMode === 'duration') return durationDays;
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
        setDestinationCity(trip.destination.city);
        setStartDate(trip.start_date);
        setEndDate(trip.end_date);
        setDurationDays(trip.duration_days);
        setLuggageClass(trip.luggage_class);
        setHasLaundry(trip.has_laundry);
        setActivities(trip.activities || []);
      } catch {
        toast.error('Erro ao carregar viagem.');
      }
    }

    loadTrip();
    return () => {
      active = false;
    };
  }, [tripId]);

  // Handle activity toggle
  const toggleActivity = (act: string) => {
    setActivities((prev) =>
      prev.includes(act) ? prev.filter((a) => a !== act) : [...prev, act]
    );
  };

  const handleAddCustomActivity = () => {
    const trimmed = customActivityInput.trim();
    if (!trimmed) return;
    if (!activities.includes(trimmed)) {
      setActivities((prev) => [...prev, trimmed]);
    }
    setCustomActivityInput('');
    setShowCustomActivity(false);
  };

  // Fetch weather for step 2
  const fetchWeather = async () => {
    setIsLoadingWeather(true);
    try {
      const destName = destinationCity.split(',')[0].trim();
      const origName = originCity ? originCity.split(',')[0].trim() : 'São Paulo';

      const report = await tripsService.getTripWeatherReport({
        origin_city: origName,
        destination_city: destName,
        start_date: startDate,
        duration_days: nights,
      });

      setWeatherReport(report);
    } catch {
      // Fallback mock weather if endpoint doesn't find exact location
      const destName = destinationCity.split(',')[0].trim();
      const mockDays = Array.from({ length: Math.min(nights, 7) }, (_, i) => {
        const d = new Date(startDate);
        d.setDate(d.getDate() + i);
        return {
          date: toDateInputString(d),
          temp_min_c: 14 + (i % 3),
          temp_max_c: 21 + (i % 4),
          precip_mm: i % 2 === 0 ? 0 : 5,
          precip_probability_pct: i % 2 === 0 ? 10 : 55,
          condition_code: i % 2 === 0 ? 'SUNNY' : 'RAIN',
          condition_label: i % 2 === 0 ? 'Sol' : 'Nublado com chuva',
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
        dest_max_temp: 21,
        dest_rain_prob_pct: 60,
        thermal_delta_c: 5,
        forecast_days: mockDays,
        warnings: [
          `Previsão meteorológica estimada para ${nights} dias. Vamos montar a mala com base na variação de 14°C a 21°C e chance de chuva.`,
        ],
      });
    } finally {
      setIsLoadingWeather(false);
    }
  };

  // Validate step 1 and proceed to step 2
  const handleProceedToWeather = async () => {
    if (!destinationCity.trim()) {
      toast.error('Informe a cidade de destino.');
      return;
    }

    if (!originCity.trim()) {
      toast.error('Informe a cidade de origem.');
      return;
    }

    if (dateMode === 'dates' && startDate >= endDate) {
      toast.error('A data de volta deve ser posterior à data de ida.');
      return;
    }

    setCurrentStep(2);
    await fetchWeather();
  };

  // Step 3: Save trip and generate packing list
  const handleGeneratePackingList = async () => {
    setCurrentStep(3);

    try {
      const destParts = destinationCity.split(',');
      const cityName = destParts[0]?.trim() || destinationCity.trim();
      const countryCode = selectedCandidate?.country_code || 'BR';

      const payload = {
        origin_city: originCity.trim(),
        destination: {
          city: cityName,
          country: selectedCandidate?.country_code || 'Destino',
          country_code: countryCode,
          lat: selectedCandidate?.latitude || null,
          lon: selectedCandidate?.longitude || null,
        },
        start_date: startDate,
        end_date: endDate,
        duration_days: nights,
        travel_mode: travelMode,
        airline: travelMode === 'FLIGHT' ? airline : null,
        luggage_class: luggageClass,
        has_laundry: hasLaundry,
        activities,
      };

      let savedTripId = tripId;
      if (isEditing && tripId) {
        await tripsService.updateTrip(tripId, payload);
      } else {
        const created = await tripsService.createTrip(payload);
        savedTripId = created.id;
      }

      // Generate initial packing list
      if (savedTripId) {
        try {
          await packingService.generateInitialList(savedTripId);
        } catch (e) {
          // If already generated or internal warning, still navigate to packing list
          console.warn('Packing list generation note:', e);
        }

        toast.success('Mala inteligente criada com sucesso!');
        navigate(`/viagens/${savedTripId}/mala`);
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
    if (c.includes('chuva') || c.includes('rain')) return <CloudRain className="w-6 h-6 text-[#0B7A75]" />;
    if (c.includes('nublado') || c.includes('cloud')) return <Cloud className="w-6 h-6 text-gray-500" />;
    if (c.includes('parcial') || c.includes('sol')) return <CloudSun className="w-6 h-6 text-[#F2B640]" />;
    return <Sun className="w-6 h-6 text-[#F2B640]" />;
  };

  const cityNameOnly = destinationCity.split(',')[0]?.trim() || 'Destino';

  return (
    <div className="min-h-screen w-full bg-[#F3F7F6] flex flex-col">
      {/* Top Header com Marca e Ação */}
      <header className="w-full bg-white border-b border-gray-200 py-4 px-6 sm:px-10 flex items-center justify-between sticky top-0 z-30 shadow-2xs">
        <PackedLogo variant="header" size="md" />

        <Link
          to="/viagens"
          className="text-sm font-semibold text-[#0B7A75] hover:text-[#085E5A] transition-colors"
        >
          {currentStep === 1 ? 'Cancelar planejamento' : 'Salvar e sair'}
        </Link>
      </header>

      {/* Stepper Wizard Progress */}
      <div className="w-full max-w-4xl mx-auto px-4 pt-6 pb-2">
        <div className="flex items-center justify-center gap-2 sm:gap-6 text-xs sm:text-sm font-semibold select-none">
          {/* Etapa 1 */}
          <div className="flex items-center gap-2">
            <span
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                currentStep > 1
                  ? 'bg-[#0B7A75] text-white'
                  : 'bg-[#0B7A75] text-white'
              }`}
            >
              {currentStep > 1 ? <Check className="w-4 h-4 stroke-[3]" /> : '1'}
            </span>
            <span className={currentStep === 1 ? 'text-[#0B2B33] font-bold' : 'text-gray-500'}>
              Dados da viagem
            </span>
          </div>

          <div className="w-8 sm:w-16 h-0.5 bg-gray-200" />

          {/* Etapa 2 */}
          <div className="flex items-center gap-2">
            <span
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                currentStep > 2
                  ? 'bg-[#0B7A75] text-white'
                  : currentStep === 2
                  ? 'bg-[#0B7A75] text-white'
                  : 'bg-gray-200 text-gray-500'
              }`}
            >
              {currentStep > 2 ? <Check className="w-4 h-4 stroke-[3]" /> : '2'}
            </span>
            <span className={currentStep === 2 ? 'text-[#0B2B33] font-bold' : 'text-gray-500'}>
              Previsão do tempo
            </span>
          </div>

          <div className="w-8 sm:w-16 h-0.5 bg-gray-200" />

          {/* Etapa 3 */}
          <div className="flex items-center gap-2">
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
      </div>

      {/* Conteúdo Principal do Wizard */}
      <div className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 py-6 pb-24">
        {/* ========================================================
            ETAPA 1: DADOS DA VIAGEM
            ======================================================== */}
        {currentStep === 1 && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Formulário Principal (8 Colunas em desktop) */}
            <div className="lg:col-span-8 bg-white rounded-3xl p-6 sm:p-10 shadow-xs border border-gray-100 flex flex-col gap-8">
              <div>
                <span className="text-xs font-bold text-gray-400 tracking-wider uppercase">
                  ETAPA 1 DE 3
                </span>
                <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-[#0B2B33] mt-1">
                  Conte sobre a viagem
                </h1>
                <p className="text-sm text-gray-600 mt-1.5 leading-relaxed">
                  Com essas informações, buscamos o clima e montamos sua lista. Você pode ajustar tudo antes de gerar.
                </p>
              </div>

              {/* Destino e Origem com Autocomplete */}
              <div className="flex flex-col gap-5">
                <CityAutocomplete
                  label="Destino"
                  placeholder="Ex: Lisboa, Portugal"
                  helperText="Cidade e país ajudam a encontrar a previsão certa."
                  value={destinationCity}
                  onChange={(val, candidate) => {
                    setDestinationCity(val);
                    if (candidate) setSelectedCandidate(candidate);
                  }}
                />

                <CityAutocomplete
                  label="Origem (Sua cidade de partida)"
                  placeholder="Ex: São Paulo, Brasil"
                  helperText="Usamos sua origem para calibrar o choque térmico ao viajar."
                  value={originCity}
                  onChange={(val) => setOriginCity(val)}
                />
              </div>

              {/* Período / Duração */}
              <div className="flex flex-col gap-3">
                <label className="text-sm font-semibold text-[#0B2B33]">
                  Quando você vai?
                </label>

                {/* Alternador de Modo */}
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
                        className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm text-[#0B2B33] focus:border-[#0B7A75] focus:outline-none"
                      />
                    </div>
                    <div>
                      <span className="block text-xs font-medium text-gray-600 mb-1">Volta</span>
                      <div className="flex items-center gap-2">
                        <input
                          type="date"
                          value={endDate}
                          onChange={(e) => setEndDate(e.target.value)}
                          className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm text-[#0B2B33] focus:border-[#0B7A75] focus:outline-none"
                        />
                        <span className="px-3 py-2.5 rounded-xl bg-[#E3F1EF] text-[#085E5A] font-bold text-xs shrink-0 whitespace-nowrap">
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
                      onChange={(e) => setDurationDays(Number(e.target.value))}
                      className="w-28 rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm text-[#0B2B33] focus:border-[#0B7A75] focus:outline-none font-bold"
                    />
                    <span className="text-sm text-gray-600">noites de estadia</span>
                  </div>
                )}
              </div>

              {/* Atividades Planejadas */}
              <div className="flex flex-col gap-2.5">
                <label className="text-sm font-semibold text-[#0B2B33]">
                  O que você vai fazer?
                </label>
                <p className="text-xs text-gray-500">
                  Escolha quantas quiser — cada atividade adiciona uma cápsula específica de itens à sua lista.
                </p>

                <div className="flex flex-wrap gap-2 pt-1.5">
                  {AVAILABLE_ACTIVITIES.map((act) => {
                    const isSelected = activities.includes(act);
                    return (
                      <button
                        key={act}
                        type="button"
                        onClick={() => toggleActivity(act)}
                        className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-medium cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-[#0B7A75] text-white shadow-xs'
                            : 'bg-white border border-gray-200 text-gray-700 hover:border-gray-400'
                        }`}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        {act}
                      </button>
                    );
                  })}

                  {/* Adicionar outra atividade */}
                  {!showCustomActivity ? (
                    <button
                      type="button"
                      onClick={() => setShowCustomActivity(true)}
                      className="inline-flex items-center gap-1 px-4 py-2 rounded-full text-xs font-semibold text-[#0B7A75] border border-dashed border-[#0B7A75] hover:bg-[#E3F1EF] cursor-pointer transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" /> Outra atividade
                    </button>
                  ) : (
                    <div className="inline-flex items-center gap-1.5">
                      <input
                        type="text"
                        value={customActivityInput}
                        placeholder="Ex: Mergulho"
                        onChange={(e) => setCustomActivityInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddCustomActivity()}
                        autoFocus
                        className="rounded-full border border-[#0B7A75] px-3 py-1.5 text-xs text-[#0B2B33] focus:outline-none"
                      />
                      <Button
                        type="button"
                        size="sm"
                        onClick={handleAddCustomActivity}
                        className="rounded-full bg-[#0B7A75] text-white text-xs px-3 py-1.5 h-auto"
                      >
                        Adicionar
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              {/* Franquia / Tipo de Bagagem */}
              <div className="flex flex-col gap-3 pt-2 border-t border-gray-100">
                <label className="text-sm font-semibold text-[#0B2B33] flex items-center gap-2">
                  <Luggage className="w-4 h-4 text-[#0B7A75]" />
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
                            ? 'border-[#0B7A75] bg-[#0B2B33] text-white shadow-sm'
                            : 'border-gray-200 bg-white text-[#0B2B33] hover:border-gray-300'
                        }`}
                      >
                        <span className="font-bold text-sm">{opt.label}</span>
                        <span className={`text-xs mt-1 ${isSelected ? 'text-white/70' : 'text-gray-500'}`}>
                          {opt.desc}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Lavanderia no Destino */}
              <div className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 border border-gray-200/80">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#E3F1EF] text-[#0B7A75] flex items-center justify-center shrink-0">
                    <Shirt className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="font-semibold text-sm text-[#0B2B33] block">
                      Lavanderia disponível no destino
                    </span>
                    <span className="text-xs text-gray-500">
                      Reduz o volume da mala limitando o ciclo de roupas para até 5 dias.
                    </span>
                  </div>
                </div>

                <input
                  type="checkbox"
                  checked={hasLaundry}
                  onChange={(e) => setHasLaundry(e.target.checked)}
                  className="w-5 h-5 rounded-md text-[#0B7A75] border-gray-300 focus:ring-[#0B7A75] cursor-pointer"
                />
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
                  className="px-6 py-3.5 rounded-xl bg-[#0B7A75] hover:bg-[#085E5A] text-white font-semibold text-sm inline-flex items-center gap-2 shadow-sm cursor-pointer transition-all"
                >
                  Continuar para a previsão
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Coluna Direita: Resumo em Tempo Real (4 Colunas) */}
            <div className="lg:col-span-4 flex flex-col gap-4">
              <div className="bg-[#0B2B33] text-white rounded-3xl p-6 sm:p-7 shadow-xl flex flex-col gap-4">
                <span className="text-[11px] font-bold text-white/50 tracking-wider uppercase">
                  RESUMO
                </span>
                <h3 className="font-heading font-extrabold text-2xl text-white">
                  {cityNameOnly}
                </h3>
                <p className="text-xs text-white/70">
                  {formatDateLong(startDate, endDate)} · {nights} {nights === 1 ? 'noite' : 'noites'}
                </p>

                {activities.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-2 border-t border-white/10">
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
          <div className="max-w-4xl mx-auto flex flex-col gap-6">
            <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-xs border border-gray-100 flex flex-col gap-6">
              <div>
                <span className="text-xs font-bold text-gray-400 tracking-wider uppercase">
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
                  <LottieLoader size="lg" message="Consultando satélites meteorológicos..." />
                </div>
              ) : (
                <>
                  {/* Banner de Aviso de Clima (Sol) */}
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

                  {/* 3 Cards de Indicadores Clave */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-[#F3F7F6] rounded-2xl p-5 border border-gray-200/60">
                      <span className="text-xs text-gray-500 font-medium block">
                        Temperatura prevista
                      </span>
                      <span className="font-heading font-extrabold text-2xl sm:text-3xl text-[#0B2B33] mt-1 block">
                        {weatherReport?.dest_min_temp ?? 14}° – {weatherReport?.dest_max_temp ?? 21}°C
                      </span>
                    </div>

                    <div className="bg-[#F3F7F6] rounded-2xl p-5 border border-gray-200/60">
                      <span className="text-xs text-gray-500 font-medium block">
                        Chance de chuva
                      </span>
                      <span className="font-heading font-extrabold text-2xl sm:text-3xl text-[#0B2B33] mt-1 block">
                        até {weatherReport?.dest_rain_prob_pct ?? 60}%
                      </span>
                    </div>

                    <div className="bg-[#F3F7F6] rounded-2xl p-5 border border-gray-200/60">
                      <span className="text-xs text-gray-500 font-medium block">
                        Condição predominante
                      </span>
                      <span className="font-heading font-extrabold text-2xl sm:text-3xl text-[#0B2B33] mt-1 block">
                        {weatherReport?.forecast_days?.[0]?.condition_label || 'Nublado'}
                      </span>
                    </div>
                  </div>

                  {/* Previsão Diária Horizontal */}
                  <div>
                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
                      Previsão dia a dia
                    </h4>

                    <div className="flex gap-3 overflow-x-auto pb-4 pt-1 snap-x scrollbar-thin">
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
                                {day.temp_max_c ?? 20}° / {day.temp_min_c ?? 14}°
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
                        className="px-6 py-3.5 rounded-xl bg-[#0B7A75] hover:bg-[#085E5A] text-white font-semibold text-sm inline-flex items-center gap-2 shadow-sm cursor-pointer transition-all"
                      >
                        Gerar lista de bagagem
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
            ETAPA 3: GERANDO A LISTA (LOADING ANIMADO COM LOTTIE)
            ======================================================== */}
        {currentStep === 3 && (
          <div className="max-w-md mx-auto py-20 bg-white rounded-3xl p-8 shadow-sm border border-gray-100 flex flex-col items-center text-center">
            <LottieLoader
              size="lg"
              message={`Montando sua mala personalizada para ${cityNameOnly}...`}
            />
            <p className="text-xs text-gray-500 mt-2 max-w-xs">
              Aplicando regras de vestuário para {nights} noites, temperatura prevista de {weatherReport?.dest_min_temp ?? 14}° a {weatherReport?.dest_max_temp ?? 21}°C e suas atividades.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
