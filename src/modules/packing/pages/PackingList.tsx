import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import {
  AlertTriangle,
  CalendarPlus,
  Check,
  ChevronLeft,
  CloudSun,
  Compass,
  Droplet,
  Edit3,
  FileText,
  Minus,
  Package,
  Plus,
  RefreshCw,
  RotateCcw,
  Shirt,
  Sparkles,
  Trash2,
  Zap,
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
import { LottieLoader } from '@/components/ui/LottieLoader';

interface RemovedItemNotice {
  id: string;
  item: PackingListItemResponse;
}

export function PackingList() {
  const navigate = useNavigate();
  const { id: tripId } = useParams<{ id: string }>();

  const [trip, setTrip] = useState<TripResponse | null>(null);
  const [packingList, setPackingList] = useState<PackingListResponse | null>(null);
  const [items, setItems] = useState<PackingListItemResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRegenerating, setIsRegenerating] = useState(false);

  // Modo de visualização padrão ao abrir a mala (só entra em Edição ao clicar em "Editar mala")
  const [isEditMode, setIsEditMode] = useState(false);

  // Filtro opcional por categoria
  const [activeCategory, setActiveCategory] = useState<string>('Todas');

  // Aviso de item removido com opção de desfazer
  const [lastRemoved, setLastRemoved] = useState<RemovedItemNotice | null>(null);

  // Inputs inline para adicionar item por categoria
  const [inlineInputs, setInlineInputs] = useState<Record<string, string>>({});

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

  // Marcar / desmarcar item no checklist
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

  // Atualizar quantidade no modo edição
  const handleUpdateQuantity = async (itemId: string, delta: number) => {
    if (!tripId) return;
    const current = items.find((it) => it.id === itemId);
    if (!current) return;

    const newQty = Math.max(1, current.quantity + delta);
    if (newQty === current.quantity) return;

    setItems((prev) =>
      prev.map((it) => (it.id === itemId ? { ...it, quantity: newQty } : it))
    );

    try {
      await packingService.updateItem(tripId, itemId, { quantity: newQty });
    } catch {
      setItems((prev) =>
        prev.map((it) => (it.id === itemId ? { ...it, quantity: current.quantity } : it))
      );
      toast.error('Erro ao atualizar quantidade.');
    }
  };

  // Excluir item
  const handleDeleteItem = async (item: PackingListItemResponse) => {
    if (!tripId) return;
    const backup = items;
    setItems((prev) => prev.filter((it) => it.id !== item.id));
    setLastRemoved({ id: item.id, item });

    try {
      await packingService.deleteItem(tripId, item.id);
      toast.info(`"${item.name}" foi removido da mala.`);
    } catch {
      setItems(backup);
      setLastRemoved(null);
      toast.error('Não foi possível remover o item.');
    }
  };

  // Desfazer remoção
  const handleUndoDelete = async () => {
    if (!tripId || !lastRemoved) return;
    const { item } = lastRemoved;

    try {
      const restored = await packingService.addCustomItem(tripId, {
        name: item.name,
        category: item.category,
        quantity: item.quantity,
      });
      setItems((prev) => [...prev, restored]);
      setLastRemoved(null);
      toast.success(`"${item.name}" restaurado para a lista.`);
    } catch {
      toast.error('Erro ao restaurar o item.');
    }
  };

  // Adicionar item inline em uma categoria
  const handleInlineAdd = async (category: string) => {
    const text = inlineInputs[category]?.trim();
    if (!tripId || !text) return;

    try {
      const created = await packingService.addCustomItem(tripId, {
        name: text,
        category,
        quantity: 1,
      });
      setItems((prev) => [...prev, created]);
      setInlineInputs((prev) => ({ ...prev, [category]: '' }));
      toast.success(`"${text}" adicionado a ${category}!`);
    } catch {
      toast.error('Erro ao adicionar item.');
    }
  };

  // Desmarcar todos os itens
  const handleResetChecklist = async () => {
    if (!tripId) return;
    try {
      const updated = await packingService.resetChecklist(tripId);
      setPackingList(updated);
      setItems(updated.items);
      toast.success('Todos os itens foram desmarcados.');
    } catch {
      toast.error('Não foi possível resetar os itens.');
    }
  };

  // Sincronizar mala com clima e roteiro
  const handleRegenerate = async () => {
    if (!tripId) return;
    setIsRegenerating(true);
    try {
      const regenerated = await packingService.regeneratePackingList(tripId);
      setPackingList(regenerated);
      setItems(regenerated.items);
      setTrip((prev) => (prev ? { ...prev, list_outdated: false } : prev));
      toast.success('Mala sincronizada com sucesso!', {
        description: 'Recomendações climáticas e itens personalizados reconciliados.',
      });
    } catch {
      toast.error('Não foi possível atualizar a mala.');
    } finally {
      setIsRegenerating(false);
    }
  };

  // Estilos e ícones semânticos por categoria (Design System Packed)
  const getCategoryMeta = (category: string) => {
    const lower = category.toLowerCase();
    if (lower.includes('roupa') || lower.includes('calçado') || lower.includes('vestuário')) {
      return {
        bg: 'bg-[#E3F1EF]',
        text: 'text-[#085E5A]',
        border: 'border-[#0B7A75]/20',
        icon: Shirt,
      };
    }
    if (lower.includes('higiene') || lower.includes('saúde') || lower.includes('cuidado') || lower.includes('banho')) {
      return {
        bg: 'bg-[#DDEFF7]',
        text: 'text-[#094A74]',
        border: 'border-[#094A74]/20',
        icon: Droplet,
      };
    }
    if (lower.includes('beleza') || lower.includes('cosmético')) {
      return {
        bg: 'bg-[#FBE3DC]',
        text: 'text-[#9B3D0A]',
        border: 'border-[#9B3D0A]/20',
        icon: Sparkles,
      };
    }
    if (lower.includes('eletrônico') || lower.includes('conexão') || lower.includes('tecnologia')) {
      return {
        bg: 'bg-[#FBEFD5]',
        text: 'text-[#735500]',
        border: 'border-[#F2B640]/30',
        icon: Zap,
      };
    }
    if (lower.includes('documento') || lower.includes('essencia')) {
      return {
        bg: 'bg-[#FBEFD5]',
        text: 'text-[#735500]',
        border: 'border-[#F2B640]/30',
        icon: FileText,
      };
    }
    if (lower.includes('atividade') || lower.includes('lazer') || lower.includes('esporte') || lower.includes('trilha')) {
      return {
        bg: 'bg-[#E3F1EF]',
        text: 'text-[#085E5A]',
        border: 'border-[#0B7A75]/20',
        icon: Compass,
      };
    }
    return {
      bg: 'bg-[#FBEFD5]',
      text: 'text-[#735500]',
      border: 'border-[#F2B640]/30',
      icon: Package,
    };
  };

  // Integração com Google Agenda por Categoria ("Lembrar de providenciar")
  const handleAddCategoryToGoogleCalendar = (
    category: string,
    catItems: PackingListItemResponse[]
  ) => {
    const cityName = trip?.destination.city || 'sua viagem';
    const pendingItems = catItems.filter((it) => !it.is_checked);
    const targetItems = pendingItems.length > 0 ? pendingItems : catItems;

    const title = `Packed: Providenciar ${category} para ${cityName}`;
    const itemsBulletList = targetItems
      .map((it) => `• ${it.quantity}x ${it.name}${it.reason ? ` (${it.reason})` : ''}`)
      .join('\n');

    const details = [
      `Lembrete do Packed para separar ou comprar os itens da categoria "${category}" antes do embarque para ${cityName}:`,
      '',
      itemsBulletList,
      '',
      `Organizado com Packed App.`,
    ].join('\n');

    // Data sugerida: 1 dia antes da viagem (ou amanhã às 10h caso já esteja em cima)
    const now = new Date();
    let reminderDate = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    if (trip?.start_date) {
      const tripStart = new Date(`${trip.start_date}T10:00:00`);
      const dayBefore = new Date(tripStart.getTime() - 24 * 60 * 60 * 1000);
      if (dayBefore > now) {
        reminderDate = dayBefore;
      }
    }

    const formatGoogleDate = (date: Date) =>
      date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

    const startStr = formatGoogleDate(reminderDate);
    const endStr = formatGoogleDate(new Date(reminderDate.getTime() + 60 * 60 * 1000));

    const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
      title
    )}&details=${encodeURIComponent(details)}&dates=${startStr}/${endStr}`;

    window.open(calendarUrl, '_blank', 'noopener,noreferrer');
  };

  // Integração com WhatsApp ("Compartilhar checklist da viagem")
  const handleShareOnWhatsApp = () => {
    const cityName = trip?.destination.city || 'Viagem';
    const total = items.length;
    const checkedCount = items.filter((it) => it.is_checked).length;

    const grouped = items.reduce<Record<string, PackingListItemResponse[]>>((acc, item) => {
      const cat = item.category || 'Itens gerais';
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(item);
      return acc;
    }, {});

    const sections = Object.entries(grouped)
      .map(([cat, catItems]) => {
        const lines = catItems
          .map((it) => `${it.is_checked ? '✅' : '⬜'} ${it.quantity}x ${it.name}`)
          .join('\n');
        return `*${cat}*\n${lines}`;
      })
      .join('\n\n');

    const message = [
      `🧳 *Mala Packed para ${cityName}*`,
      `Progresso: ${checkedCount} de ${total} itens separados`,
      '',
      sections,
    ].join('\n');

    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };

  // Agrupar itens por categoria
  const groupedItems = items.reduce<Record<string, PackingListItemResponse[]>>((acc, item) => {
    const cat = item.category || 'Itens gerais';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {});

  const categoriesList = ['Todas', ...Object.keys(groupedItems)];
  const visibleEntries = Object.entries(groupedItems).filter(
    ([category]) => activeCategory === 'Todas' || category === activeCategory
  );

  const totalItems = items.length;
  const completedItems = items.filter((item) => item.is_checked).length;
  const progressPct = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
  const cityName = trip?.destination.city || 'Viagem';
  const weather = packingList?.weather_snapshot;

  if (isLoading) {
    return (
      <div className="min-h-[80vh] w-full bg-[#F3F7F6] flex items-center justify-center">
        <LottieLoader
          size="lg"
          variant="light-bg"
          message={`Carregando mala para ${cityName}...`}
        />
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-8 py-6 sm:py-10 flex flex-col gap-6 select-none">
      {/* Navegação Superior Limpa (Sem duplicar a logo da Sidebar) */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => navigate('/viagens')}
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#0B2B33]/75 hover:text-[#0B7A75] transition-colors cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
          Voltar para Minhas Viagens
        </button>

        {/* Botão de Insights Climáticos com Destaque Visual */}
        <Link
          to={`/viagens/${tripId}/insights`}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#0B2B33] hover:bg-[#0B7A75] text-white text-xs sm:text-sm font-bold shadow-sm transition-all"
        >
          <CloudSun className="w-4 h-4 text-[#F2B640]" />
          <span>Ver insights climáticos</span>
        </Link>
      </div>

      {/* Cabeçalho Principal + Botões de Modo Visualização / Edição */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-gray-200/80">
        <div>
          <span className="text-xs font-extrabold text-[#0B7A75] tracking-wider uppercase">
            {isEditMode ? 'MODO DE EDIÇÃO' : 'CHECKLIST DA VIAGEM'}
          </span>
          <h1 className="font-heading font-extrabold text-3xl sm:text-4xl text-[#0B2B33] mt-1 tracking-tight">
            {isEditMode ? `Editar mala para ${cityName}` : `Mala para ${cityName}`}
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            {isEditMode
              ? 'Ajuste quantidades, remova sugestões ou adicione itens próprios em cada categoria.'
              : `${completedItems} de ${totalItems} itens separados (${progressPct}% concluído)`}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {isEditMode ? (
            <>
              <button
                type="button"
                onClick={() => setIsEditMode(false)}
                className="px-4 py-2.5 rounded-xl border border-[#0B2B33]/20 bg-white text-xs sm:text-sm font-bold text-[#0B2B33] hover:bg-gray-100 cursor-pointer transition-colors"
              >
                Cancelar
              </button>
              <Button
                type="button"
                onClick={() => {
                  setIsEditMode(false);
                  toast.success('Edições da mala concluídas!');
                }}
                className="px-5 py-2.5 h-auto rounded-xl bg-[#0B7A75] hover:bg-[#085E5A] text-white text-xs sm:text-sm font-bold cursor-pointer shadow-sm transition-all"
              >
                Concluir edição
              </Button>
            </>
          ) : (
            <>
              {completedItems > 0 && (
                <button
                  type="button"
                  onClick={handleResetChecklist}
                  className="px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white text-xs sm:text-sm font-semibold text-gray-600 hover:bg-gray-100 inline-flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Desmarcar todos
                </button>
              )}

              <button
                type="button"
                onClick={handleShareOnWhatsApp}
                className="px-4 py-2.5 rounded-xl bg-[#25D366]/15 hover:bg-[#25D366]/25 border border-[#128C7E]/25 text-[#075E54] text-xs sm:text-sm font-bold inline-flex items-center gap-2 cursor-pointer transition-all"
              >
                {/* Ícone oficial do WhatsApp */}
                <svg
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-4 h-4 text-[#128C7E] shrink-0"
                  aria-hidden="true"
                >
                  <path d="M12.031 2c-5.516 0-9.969 4.453-9.969 9.969 0 1.766.469 3.484 1.359 5.016L2 22l5.156-1.359c1.484.813 3.156 1.25 4.875 1.25 5.516 0 9.969-4.453 9.969-9.969S17.547 2 12.031 2zm5.828 14.125c-.25.703-1.453 1.344-2.016 1.422-.516.078-1.188.109-1.922-.125-.453-.141-1.031-.344-1.766-.656-3.094-1.328-5.109-4.469-5.266-4.672-.156-.203-1.266-1.688-1.266-3.219s.797-2.281 1.078-2.594c.281-.313.625-.391.828-.391.203 0 .406.016.594.016.188 0 .438-.078.688.516.25.609.859 2.094.938 2.25.078.156.125.344.031.547-.094.203-.141.328-.297.5-.156.172-.313.391-.453.516-.156.141-.313.313-.141.609.172.297.766 1.266 1.641 2.047 1.125 1.016 2.078 1.328 2.375 1.484.297.156.469.125.641-.078.172-.203.75-.875.953-1.172.203-.297.406-.25.672-.156.266.094 1.703.813 2 .953.297.141.484.219.563.344.078.125.078.734-.172 1.438z" />
                </svg>
                <span>Compartilhar checklist da viagem</span>
              </button>

              <Button
                type="button"
                onClick={() => setIsEditMode(true)}
                className="px-5 py-2.5 h-auto rounded-xl bg-[#0B7A75] hover:bg-[#085E5A] text-white text-xs sm:text-sm font-bold inline-flex items-center gap-2 cursor-pointer shadow-sm transition-all"
              >
                <Edit3 className="w-4 h-4" />
                Editar mala
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Card de Progresso + Clima no Modo Checklist */}
      {!isEditMode && (
        <div className="bg-[#0B2B33] text-white rounded-3xl p-5 sm:p-6 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="flex-1 flex flex-col gap-2.5">
            <div className="flex items-center justify-between text-xs sm:text-sm">
              <span className="font-bold text-[#F2B640] uppercase tracking-wider">
                Progresso da bagagem
              </span>
              <span className="font-extrabold text-white">
                {completedItems} / {totalItems} separados ({progressPct}%)
              </span>
            </div>
            <div className="w-full h-3 bg-white/15 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#F2B640] rounded-full transition-all duration-300"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 md:pl-6 md:border-l md:border-white/15">
            {weather &&
              weather.temp_min_c !== undefined &&
              weather.temp_max_c !== undefined && (
                <div className="bg-white/10 rounded-2xl px-4 py-2.5 flex items-center gap-3">
                  <CloudSun className="w-5 h-5 text-[#F2B640] shrink-0" />
                  <div>
                    <p className="text-[11px] text-white/70 font-medium">Clima previsto</p>
                    <p className="text-sm font-extrabold text-white">
                      {Math.round(weather.temp_min_c)}°C a {Math.round(weather.temp_max_c)}°C
                      {weather.rain_probability_pct !== undefined
                        ? ` · Chuva ${weather.rain_probability_pct}%`
                        : ''}
                    </p>
                  </div>
                </div>
              )}

            <Link
              to={`/viagens/${tripId}/insights`}
              className="px-4 py-2.5 rounded-2xl bg-[#0B7A75] hover:bg-[#085E5A] text-white text-xs font-bold inline-flex items-center gap-2 transition-colors shadow-xs"
            >
              <Sparkles className="w-4 h-4 text-[#F2B640]" />
              Entenda cada recomendação
            </Link>
          </div>
        </div>
      )}

      {/* Filtros de Categoria com Ícones */}
      {categoriesList.length > 2 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {categoriesList.map((cat) => {
            const isSelected = activeCategory === cat;
            const meta = cat === 'Todas' ? null : getCategoryMeta(cat);
            const CatIcon = meta?.icon;

            return (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={`px-3.5 py-2 rounded-full text-xs font-bold inline-flex items-center gap-1.5 whitespace-nowrap cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-[#0B2B33] text-white shadow-xs'
                    : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                {CatIcon && <CatIcon className="w-3.5 h-3.5" />}
                <span>{cat}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Alerta de Remoção de Item (Amarelo Sol - Design System) */}
      {lastRemoved && (
        <div className="bg-[#FFF8E2] border border-[#F2B640] rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs sm:text-sm text-[#0B2B33]">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-[#F2B640] shrink-0 mt-0.5" />
            <div>
              <p>
                <strong>Você removeu {lastRemoved.item.name}.</strong>{' '}
                {lastRemoved.item.reason
                  ? `${lastRemoved.item.reason} Se mantiver a remoção, a lista segue assim.`
                  : 'Se mantiver a remoção, a lista segue assim.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
            <button
              type="button"
              onClick={handleUndoDelete}
              className="px-3.5 py-2 rounded-xl border border-[#0B7A75] bg-white text-xs font-bold text-[#0B2B33] hover:bg-gray-50 cursor-pointer transition-colors"
            >
              Desfazer remoção
            </button>
            <button
              type="button"
              onClick={() => setLastRemoved(null)}
              className="px-3.5 py-2 rounded-xl border border-[#F2B640]/50 bg-[#FBEFD5] text-xs font-bold text-[#0B2B33] hover:bg-[#F2B640]/20 cursor-pointer transition-colors"
            >
              Manter removido
            </button>
          </div>
        </div>
      )}

      {/* Notificação de Mala Desatualizada */}
      {trip?.list_outdated && (
        <div className="bg-[#FFF8E2] border border-[#F2B640] rounded-2xl p-4 flex items-center justify-between gap-3 text-xs sm:text-sm text-[#0B2B33]">
          <div className="flex items-center gap-2.5">
            <RefreshCw className="w-4 h-4 text-[#F2B640] shrink-0" />
            <span>
              O roteiro da viagem mudou. Sincronize a mala para recalcular itens climáticos.
            </span>
          </div>
          <button
            type="button"
            disabled={isRegenerating}
            onClick={handleRegenerate}
            className="px-3.5 py-2 rounded-xl bg-[#0B7A75] text-white text-xs font-bold hover:bg-[#085E5A] cursor-pointer shrink-0 transition-colors"
          >
            {isRegenerating ? 'Atualizando...' : 'Sincronizar'}
          </button>
        </div>
      )}

      {/* Grupos de Categorias de Itens */}
      <div className="flex flex-col gap-6">
        {visibleEntries.map(([category, catItems]) => {
          const meta = getCategoryMeta(category);
          const CategoryIcon = meta.icon;
          const inputVal = inlineInputs[category] || '';

          return (
            <div
              key={category}
              className="bg-white rounded-3xl overflow-hidden shadow-2xs border border-gray-200/80"
            >
              {/* Header da Categoria com Cor Suave + Ícone + Botão Google Agenda */}
              <div
                className={`px-5 sm:px-6 py-4 flex flex-wrap items-center justify-between gap-3 ${meta.bg} ${meta.text} border-b ${meta.border}`}
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-white/70 flex items-center justify-center shadow-2xs">
                    <CategoryIcon className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-heading font-extrabold text-base sm:text-lg tracking-tight leading-tight">
                      {category}
                    </h3>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => handleAddCategoryToGoogleCalendar(category, catItems)}
                    title={`Criar lembrete no Google Agenda para ${category}`}
                    className="px-3 py-1.5 rounded-xl bg-white/85 hover:bg-white text-[#0B2B33] border border-black/10 text-xs font-bold inline-flex items-center gap-1.5 shadow-2xs cursor-pointer transition-all"
                  >
                    <CalendarPlus className="w-3.5 h-3.5 text-[#0B7A75]" />
                    <span>Lembrar de providenciar</span>
                  </button>

                  <span className="text-xs font-extrabold opacity-85">
                    {catItems.length} {catItems.length === 1 ? 'item' : 'itens'}
                  </span>
                </div>
              </div>

              {/* Lista de Itens */}
              <div className="divide-y divide-gray-100">
                {catItems.map((item) => (
                  <div
                    key={item.id}
                    className={`px-5 sm:px-6 py-3.5 flex items-center justify-between gap-3 transition-colors ${
                      item.is_checked && !isEditMode ? 'bg-gray-50/70' : 'hover:bg-gray-50/40'
                    }`}
                  >
                    {/* Lado Esquerdo: Checkbox (no modo checklist) + Nome */}
                    <div className="flex items-center gap-3.5 min-w-0">
                      {!isEditMode && (
                        <button
                          type="button"
                          onClick={() => toggleItem(item)}
                          className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 cursor-pointer transition-all ${
                            item.is_checked
                              ? 'bg-[#0B7A75] text-white shadow-xs'
                              : 'border-2 border-gray-300 hover:border-[#0B7A75]'
                          }`}
                        >
                          {item.is_checked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </button>
                      )}

                      <span
                        onClick={() => !isEditMode && toggleItem(item)}
                        className={`text-sm font-medium truncate ${
                          !isEditMode ? 'cursor-pointer' : ''
                        } ${
                          item.is_checked && !isEditMode
                            ? 'line-through text-gray-400'
                            : 'text-[#0B2B33]'
                        }`}
                      >
                        {item.name}
                      </span>
                    </div>

                    {/* Lado Direito: Badge de Contexto + Controles de Qtd */}
                    <div className="flex items-center gap-2.5 sm:gap-4 shrink-0">
                      {/* Pill de Razão / Contexto */}
                      {(item.reason || item.source === 'CUSTOM') && (
                        <span
                          className={`hidden sm:inline-block text-[11px] font-semibold px-2.5 py-1 rounded-md max-w-xs truncate ${
                            item.source === 'CUSTOM'
                              ? 'bg-[#F2B640] text-[#0B2B33]'
                              : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {item.source === 'CUSTOM' ? 'Adicionado por você' : item.reason}
                        </span>
                      )}

                      {/* Controles de Quantidade */}
                      {isEditMode ? (
                        <div className="flex items-center gap-1.5 bg-white border border-gray-200 rounded-xl px-2 py-1">
                          <button
                            type="button"
                            onClick={() => handleUpdateQuantity(item.id, -1)}
                            className="w-6 h-6 rounded-lg flex items-center justify-center text-gray-600 hover:bg-gray-100 hover:text-[#0B2B33] cursor-pointer transition-colors"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="w-6 text-center text-xs font-extrabold text-[#0B2B33]">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleUpdateQuantity(item.id, 1)}
                            className="w-6 h-6 rounded-lg flex items-center justify-center text-gray-600 hover:bg-gray-100 hover:text-[#0B2B33] cursor-pointer transition-colors"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs font-extrabold text-[#0B2B33] bg-gray-100 px-2.5 py-1 rounded-lg">
                          {item.quantity}x
                        </span>
                      )}

                      {/* Botão de Excluir (Modo Edição) */}
                      {isEditMode && (
                        <button
                          type="button"
                          onClick={() => handleDeleteItem(item)}
                          className="p-1.5 text-[#C93E22]/80 hover:text-[#C93E22] rounded-lg hover:bg-red-50 cursor-pointer transition-colors"
                          title="Remover item da mala"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Formulário Inline para Adicionar Item à Categoria (Modo Edição) */}
              {isEditMode && (
                <div className="px-5 sm:px-6 py-4 bg-gray-50/40 border-t border-gray-100 flex items-center gap-3">
                  <span className="text-xs font-extrabold text-[#0B2B33] shrink-0 hidden sm:inline">
                    Adicionar item
                  </span>
                  <input
                    type="text"
                    value={inputVal}
                    placeholder={`Ex: item para ${category.toLowerCase()}`}
                    onChange={(e) =>
                      setInlineInputs((prev) => ({ ...prev, [category]: e.target.value }))
                    }
                    onKeyDown={(e) => e.key === 'Enter' && handleInlineAdd(category)}
                    className="flex-1 rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-xs sm:text-sm text-[#0B2B33] focus:border-[#0B7A75] focus:outline-none"
                  />
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => handleInlineAdd(category)}
                    className="rounded-xl bg-[#0B7A75] hover:bg-[#085E5A] text-white text-xs sm:text-sm font-bold px-4 py-2.5 h-auto cursor-pointer shrink-0 transition-colors"
                  >
                    + Adicionar
                  </Button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Rodapé institucional com aviso */}
      <p className="text-center text-xs text-gray-500 pt-2 pb-6">
        As alterações valem só para esta viagem. Para mudar as regras de recomendação, fale com a administração do Packed.
      </p>
    </div>
  );
}
