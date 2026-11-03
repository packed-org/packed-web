import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ChevronLeft,
  Edit3,
  Shirt,
  Droplet,
  Zap,
  Compass,
  Package,
  ExternalLink,
  CheckCircle,
  Plus,
  Trash2,
  RotateCcw,
  RefreshCw,
  CloudRain,
  Thermometer,
  AlertTriangle,
} from 'lucide-react';
import { toast } from 'sonner';
import type {
  PackingListItemResponse,
  PackingListResponse,
  TripResponse,
} from '@/@types/api';
import { tripsService } from '@/services/tripsService';
import { packingService } from '@/services/packingService';
import { ApiError } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

function getCategoryStyle(category: string) {
  const lower = category.toLowerCase();
  if (lower.includes('roupa') || lower.includes('calçado')) {
    return { icon: Shirt, color: 'text-beleza', bg: 'bg-beleza-light' };
  }
  if (lower.includes('higiene') || lower.includes('saúde')) {
    return { icon: Droplet, color: 'text-clima', bg: 'bg-clima-light' };
  }
  if (lower.includes('eletrônico') || lower.includes('conexão')) {
    return { icon: Zap, color: 'text-sol-dark', bg: 'bg-sol-light' };
  }
  if (lower.includes('atividade')) {
    return { icon: Compass, color: 'text-teal', bg: 'bg-teal-light' };
  }
  return { icon: Package, color: 'text-petroleo', bg: 'bg-petroleo-light' };
}

export function PackingList() {
  const navigate = useNavigate();
  const { id: tripId } = useParams<{ id: string }>();

  const [trip, setTrip] = useState<TripResponse | null>(null);
  const [packingList, setPackingList] = useState<PackingListResponse | null>(null);
  const [items, setItems] = useState<PackingListItemResponse[]>([]);
  const [activeFilter, setActiveFilter] = useState<string>('Todos');
  const [isLoading, setIsLoading] = useState(true);
  const [isRegenerating, setIsRegenerating] = useState(false);

  // Estado para novo item customizado
  const [showAddForm, setShowAddForm] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customCategory, setCustomCategory] = useState('Outros');
  const [customQty, setCustomQty] = useState(1);
  const [isAddingItem, setIsAddingItem] = useState(false);

  useEffect(() => {
    if (!tripId) return;
    let active = true;

    const fetchAll = async () => {
      try {
        const tripData = await tripsService.getTrip(tripId);
        if (!active) return;
        setTrip(tripData);

        let listData: PackingListResponse;
        try {
          listData = await packingService.getPackingList(tripId);
        } catch (err) {
          if (err instanceof ApiError && err.status === 404) {
            listData = await packingService.generatePackingList(tripId);
          } else {
            throw err;
          }
        }
        if (!active) return;
        setPackingList(listData);
        setItems(listData.items);
      } catch (error) {
        if (!active) return;
        if (error instanceof ApiError) {
          toast.error('Erro ao abrir mala', { description: error.message });
        } else {
          toast.error('Não foi possível carregar sua lista de bagagem.');
        }
        navigate('/viagens', { replace: true });
      } finally {
        if (active) setIsLoading(false);
      }
    };

    void fetchAll();
    return () => {
      active = false;
    };
  }, [tripId, navigate]);

  const formatDate = (isoDate: string) => {
    if (!isoDate) return '';
    const date = new Date(`${isoDate}T12:00:00`);
    return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short' }).format(date);
  };

  const totalItems = items.length;
  const completedItems = items.filter((item) => item.is_checked).length;
  const pendingItems = totalItems - completedItems;
  const progressPercentage =
    totalItems === 0 ? 0 : Math.round((completedItems / totalItems) * 100);

  const toggleItem = async (item: PackingListItemResponse) => {
    if (!tripId) return;
    const nextChecked = !item.is_checked;

    setItems((prev) =>
      prev.map((it) => (it.id === item.id ? { ...it, is_checked: nextChecked } : it))
    );

    try {
      await packingService.updateItem(tripId, item.id, { is_checked: nextChecked });
    } catch {
      setItems((prev) =>
        prev.map((it) => (it.id === item.id ? { ...it, is_checked: item.is_checked } : it))
      );
      toast.error('Não foi possível salvar a alteração do item.');
    }
  };

  const handleDeleteItem = async (itemId: string, itemName: string) => {
    if (!tripId) return;
    const backup = items;
    setItems((prev) => prev.filter((it) => it.id !== itemId));

    try {
      await packingService.deleteItem(tripId, itemId);
      toast.success(`"${itemName}" removido da lista.`);
    } catch {
      setItems(backup);
      toast.error('Não foi possível remover o item.');
    }
  };

  const handleAddCustomItem = async (e: FormEvent) => {
    e.preventDefault();
    if (!tripId || !customName.trim()) return;

    setIsAddingItem(true);
    try {
      const created = await packingService.addCustomItem(tripId, {
        name: customName.trim(),
        category: customCategory.trim() || 'Outros',
        quantity: Math.max(1, customQty),
      });
      setItems((prev) => [...prev, created]);
      setCustomName('');
      setCustomQty(1);
      setShowAddForm(false);
      toast.success('Item personalizado adicionado!');
    } catch (error) {
      if (error instanceof ApiError) {
        toast.error(error.message);
      } else {
        toast.error('Erro ao adicionar item.');
      }
    } finally {
      setIsAddingItem(false);
    }
  };

  const handleResetChecklist = async () => {
    if (!tripId) return;
    try {
      const updated = await packingService.resetChecklist(tripId);
      setPackingList(updated);
      setItems(updated.items);
      toast.success('Todos os itens foram desmarcados.');
    } catch {
      toast.error('Não foi possível desmarcar os itens.');
    }
  };

  const handleRegenerate = async () => {
    if (!tripId) return;
    setIsRegenerating(true);
    try {
      const regenerated = await packingService.regeneratePackingList(tripId);
      setPackingList(regenerated);
      setItems(regenerated.items);
      setTrip((prev) => (prev ? { ...prev, list_outdated: false } : prev));
      toast.success('Mala reconciliada com sucesso!', {
        description: 'Itens marcados e personalizados foram mantidos.',
      });
    } catch {
      toast.error('Não foi possível atualizar a mala.');
    } finally {
      setIsRegenerating(false);
    }
  };

  const categoriesList = Array.from(new Set(items.map((i) => i.category)));

  const groupedItems = items.reduce<Record<string, PackingListItemResponse[]>>((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {});

  const displayCategories =
    activeFilter === 'Todos' ? categoriesList : categoriesList.filter((c) => c === activeFilter);

  if (isLoading || !trip) {
    return (
      <div className="min-h-screen flex items-center justify-center text-petroleo font-bold">
        Preparando sua mala...
      </div>
    );
  }

  const weather = packingList?.weather_snapshot;

  return (
    <div className="w-full max-w-2xl mx-auto pb-12 font-sans select-none">
      {/* Header Fixo */}
      <header className="flex items-center justify-between px-5 pt-6 pb-4 bg-petroleo-light/90 backdrop-blur-md sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/viagens')}
            className="p-1.5 -ml-1 text-petroleo hover:bg-white rounded-xl transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-xl font-extrabold text-petroleo leading-tight">
              Mala para {trip.destination.city}
            </h1>
            <p className="text-xs font-semibold text-slate-500 mt-0.5">
              {formatDate(trip.start_date)} — {formatDate(trip.end_date)} · {trip.duration_days}{' '}
              {trip.duration_days === 1 ? 'dia' : 'dias'}
            </p>
          </div>
        </div>

        <button
          type="button"
          title="Editar parâmetros da viagem"
          onClick={() => navigate(`/viagens/${trip.id}/editar`)}
          className="p-2.5 bg-white text-petroleo hover:bg-teal hover:text-white rounded-xl shadow-xs transition-colors cursor-pointer"
        >
          <Edit3 className="w-5 h-5" />
        </button>
      </header>

      <div className="px-5 flex flex-col gap-5 mt-2">
        {/* Banner de Reconciliação Inteligente (RN-07) */}
        {trip.list_outdated && (
          <div className="bg-sol-light border border-sol/40 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-sol-dark shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-extrabold text-sol-dark uppercase tracking-wide">
                  Parâmetros da viagem alterados
                </p>
                <p className="text-xs text-petroleo font-medium mt-0.5">
                  Atualize a mala mantendo seus itens já marcados e personalizados.
                </p>
              </div>
            </div>
            <Button
              type="button"
              onClick={handleRegenerate}
              disabled={isRegenerating}
              className="bg-petroleo hover:bg-petroleo/90 text-white rounded-xl h-9 px-4 text-xs font-bold shrink-0 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isRegenerating ? 'animate-spin' : ''}`} />
              {isRegenerating ? 'Atualizando...' : 'Reconciliar mala'}
            </Button>
          </div>
        )}

        {/* Card de Progresso & Clima */}
        <div className="bg-petroleo rounded-3xl p-6 shadow-lg text-white flex flex-col gap-4">
          <div className="flex justify-between items-end">
            <div className="flex items-baseline gap-1.5">
              <span className="text-4xl font-extrabold tracking-tight">{completedItems}</span>
              <span className="text-sm font-semibold text-petroleo-soft">
                / {totalItems} separados
              </span>
            </div>
            <span className="text-xs font-bold bg-white/10 px-3 py-1 rounded-full text-sol">
              {pendingItems === 0 && totalItems > 0
                ? 'Mala pronta!'
                : `${pendingItems} pendentes`}
            </span>
          </div>

          <div className="h-2.5 w-full bg-white/15 rounded-full overflow-hidden">
            <div
              className="h-full bg-sol rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-semibold text-petroleo-soft pt-3 border-t border-white/10">
            <div className="flex items-center gap-3">
              {weather?.temp_min_c !== undefined && weather?.temp_max_c !== undefined ? (
                <span className="inline-flex items-center gap-1 text-white">
                  <Thermometer className="w-4 h-4 text-sol" />
                  {Math.round(weather.temp_min_c)}°C a {Math.round(weather.temp_max_c)}°C
                </span>
              ) : (
                <span>Clima dimensionado</span>
              )}
              {weather?.rain_probability_pct !== undefined && (
                <span className="inline-flex items-center gap-1 text-teal-soft">
                  <CloudRain className="w-4 h-4" />
                  {weather.rain_probability_pct}% chuva
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={() => navigate(`/mala/${trip.id}/insights`)}
              className="inline-flex items-center gap-1 text-sol hover:underline font-bold cursor-pointer"
            >
              Ver alertas e fatores
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Barra de Filtros de Categoria + Botão Novo Item */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            <Badge
              variant={activeFilter === 'Todos' ? 'default' : 'outline'}
              onClick={() => setActiveFilter('Todos')}
              className={`cursor-pointer px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
                activeFilter === 'Todos'
                  ? 'bg-petroleo text-white border-transparent shadow-none'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border-slate-200'
              }`}
            >
              Todos ({totalItems})
            </Badge>
            {categoriesList.map((cat) => (
              <Badge
                key={cat}
                variant={activeFilter === cat ? 'default' : 'outline'}
                onClick={() => setActiveFilter(cat)}
                className={`cursor-pointer px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
                  activeFilter === cat
                    ? 'bg-petroleo text-white border-transparent shadow-none'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border-slate-200'
                }`}
              >
                {cat}
              </Badge>
            ))}
          </div>

          <Button
            type="button"
            variant="teal"
            onClick={() => setShowAddForm((prev) => !prev)}
            className="h-9 px-3.5 rounded-full text-xs font-bold shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4 mr-1" />
            Item
          </Button>
        </div>

        {/* Formulário Inline para Adicionar Item Personalizado */}
        {showAddForm && (
          <form
            onSubmit={handleAddCustomItem}
            className="bg-white rounded-3xl p-5 shadow-sm border border-teal/30 flex flex-col gap-3"
          >
            <p className="text-sm font-extrabold text-petroleo">Adicionar item personalizado</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <Input
                type="text"
                placeholder="Nome do item (ex: Câmera)"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                required
                className="sm:col-span-2 h-11 rounded-xl bg-petroleo-light border-none text-sm"
              />
              <Input
                type="number"
                min={1}
                max={99}
                value={customQty}
                onChange={(e) => setCustomQty(Number(e.target.value) || 1)}
                className="h-11 rounded-xl bg-petroleo-light border-none text-sm"
              />
            </div>
            <div className="flex items-center justify-between gap-2">
              <Input
                type="text"
                placeholder="Categoria (ex: Eletrônicos, Roupas, Outros)"
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
                className="h-10 rounded-xl bg-petroleo-light border-none text-xs"
              />
              <div className="flex gap-2 shrink-0">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setShowAddForm(false)}
                  className="h-10 rounded-xl text-xs font-bold"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  variant="teal"
                  disabled={isAddingItem}
                  className="h-10 rounded-xl text-xs font-bold px-4 cursor-pointer"
                >
                  {isAddingItem ? 'Salvando...' : 'Adicionar'}
                </Button>
              </div>
            </div>
          </form>
        )}

        {/* Grupos de Itens por Categoria */}
        <div className="flex flex-col gap-4">
          {displayCategories.map((category) => {
            const categoryItems = groupedItems[category] || [];
            if (categoryItems.length === 0) return null;

            const style = getCategoryStyle(category);
            const CatIcon = style.icon;
            const completedInCat = categoryItems.filter((i) => i.is_checked).length;

            return (
              <div
                key={category}
                className="bg-white rounded-3xl p-5 shadow-xs border border-slate-100"
              >
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-8 h-8 rounded-xl ${style.bg} ${style.color} flex items-center justify-center`}
                    >
                      <CatIcon className="w-4 h-4 stroke-[2.5]" />
                    </div>
                    <h2 className="font-extrabold text-base text-petroleo">{category}</h2>
                  </div>
                  <span className="text-xs font-bold text-slate-400">
                    {completedInCat} de {categoryItems.length}
                  </span>
                </div>

                <div className="flex flex-col gap-3.5">
                  {categoryItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-start justify-between gap-3 group py-1"
                    >
                      <div
                        onClick={() => toggleItem(item)}
                        className="flex items-start gap-3 cursor-pointer flex-1"
                      >
                        {item.is_checked ? (
                          <CheckCircle className="w-5 h-5 text-sucesso shrink-0 mt-0.5 transition-transform group-hover:scale-110" />
                        ) : (
                          <div className="w-5 h-5 rounded-md border-2 border-slate-300 shrink-0 mt-0.5 transition-colors group-hover:border-teal" />
                        )}

                        <div className="flex flex-col">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span
                              className={`text-sm font-bold transition-all ${
                                item.is_checked
                                  ? 'text-sucesso line-through decoration-sucesso/60'
                                  : 'text-petroleo'
                              }`}
                            >
                              {item.name}
                            </span>
                            <Badge className="bg-petroleo-light text-petroleo border-none text-[11px] font-extrabold px-2 py-0.5 rounded-md">
                              x{item.quantity}
                            </Badge>
                            {item.source === 'CUSTOM' && (
                              <Badge className="bg-teal-light text-teal-dark border-none text-[10px] font-bold px-2 py-0.5 rounded-md">
                                Personalizado
                              </Badge>
                            )}
                          </div>
                          {item.reason && (
                            <p className="text-xs text-slate-400 font-medium mt-0.5 leading-snug">
                              {item.reason}
                            </p>
                          )}
                        </div>
                      </div>

                      <button
                        type="button"
                        title="Remover item da mala"
                        onClick={() => handleDeleteItem(item.id, item.name)}
                        className="p-1.5 text-slate-300 hover:text-erro rounded-lg transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Ações de Rodapé */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            className="w-full sm:flex-1 bg-white border-teal text-teal hover:bg-teal hover:text-white h-12 rounded-2xl font-bold shadow-xs cursor-pointer"
            onClick={() => navigate(`/mala/${trip.id}/insights`)}
          >
            Por que essa lista? <ExternalLink className="w-4 h-4 ml-1.5" />
          </Button>

          {completedItems > 0 && (
            <Button
              type="button"
              variant="outline"
              onClick={handleResetChecklist}
              className="w-full sm:w-auto px-6 bg-white border-slate-200 text-slate-600 hover:bg-slate-100 h-12 rounded-2xl font-bold cursor-pointer"
            >
              <RotateCcw className="w-4 h-4 mr-1.5" />
              Desmarcar tudo
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
