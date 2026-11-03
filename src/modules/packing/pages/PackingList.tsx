import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import {
  AlertTriangle,
  Check,
  Minus,
  Plus,
  RefreshCw,
  RotateCcw,
  Sparkles,
  Trash2,
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
import { PackedLogo } from '@/components/ui/PackedLogo';
import { LottieLoader } from '@/components/ui/LottieLoader';

interface RemovedItemNotice {
  id: string;
  item: PackingListItemResponse;
}

export function PackingList() {
  const navigate = useNavigate();
  const { id: tripId } = useParams<{ id: string }>();

  const [trip, setTrip] = useState<TripResponse | null>(null);
  const [, setPackingList] = useState<PackingListResponse | null>(null);
  const [items, setItems] = useState<PackingListItemResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRegenerating, setIsRegenerating] = useState(false);

  // Edit Mode Toggle
  const [isEditMode, setIsEditMode] = useState(true);

  // Notice for removed items
  const [lastRemoved, setLastRemoved] = useState<RemovedItemNotice | null>(null);

  // Inline add item per category
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

  // Toggle item check
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

  // Change quantity
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

  // Delete item
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

  // Undo delete
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

  // Inline add item to category
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

  // Reset all checked items
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

  // Regenerate packing list
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

  // Category styles from Design System
  const getCategoryStyles = (category: string) => {
    const lower = category.toLowerCase();
    if (lower.includes('roupa') || lower.includes('calçado')) {
      return {
        bg: 'bg-[#E3F1EF]',
        text: 'text-[#085E5A]',
        border: 'border-[#0B7A75]/20',
      };
    }
    if (lower.includes('higiene') || lower.includes('saúde') || lower.includes('banho')) {
      return {
        bg: 'bg-[#DDEFF7]',
        text: 'text-[#094A74]',
        border: 'border-[#094A74]/20',
      };
    }
    if (lower.includes('beleza') || lower.includes('cosmético')) {
      return {
        bg: 'bg-[#FBE3DC]',
        text: 'text-[#9B3D0A]',
        border: 'border-[#9B3D0A]/20',
      };
    }
    // Itens gerais / Eletrônicos / Documentos / Outros
    return {
      bg: 'bg-[#FBEFD5]',
      text: 'text-[#735500]',
      border: 'border-[#F2B640]/30',
    };
  };

  // Group items by category
  const groupedItems = items.reduce<Record<string, PackingListItemResponse[]>>((acc, item) => {
    const cat = item.category || 'Itens gerais';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {});

  const totalItems = items.length;
  const completedItems = items.filter((item) => item.is_checked).length;
  const cityName = trip?.destination.city || 'Viagem';

  if (isLoading) {
    return (
      <div className="min-h-screen w-full bg-[#F3F7F6] flex items-center justify-center">
        <LottieLoader size="lg" message={`Carregando mala para ${cityName}...`} />
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-[#F3F7F6] flex flex-col">
      {/* Top Header com Marca e Link */}
      <header className="w-full bg-white border-b border-gray-200 py-4 px-6 sm:px-10 flex items-center justify-between sticky top-0 z-30 shadow-2xs">
        <PackedLogo variant="header" size="md" />

        <div className="flex items-center gap-4">
          <Link
            to={`/viagens/${tripId}/insights`}
            className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-gray-600 hover:text-[#0B7A75] transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#F2B640]" />
            Ver Insights Climáticos
          </Link>
          <Link
            to="/viagens"
            className="text-sm font-semibold text-[#0B7A75] hover:text-[#085E5A] transition-colors"
          >
            Minhas viagens
          </Link>
        </div>
      </header>

      {/* Conteúdo Principal */}
      <main className="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 flex flex-col gap-6">
        {/* Cabeçalho da Página com Modo de Edição / Concluir */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-gray-200/80">
          <div>
            <span className="text-xs font-bold text-[#0B7A75] tracking-wider uppercase">
              {isEditMode ? 'MODO DE EDIÇÃO' : 'CHECKLIST DA MALA'}
            </span>
            <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-[#0B2B33] mt-0.5">
              {isEditMode ? `Editar mala para ${cityName}` : `Mala para ${cityName}`}
            </h1>
            <p className="text-xs text-gray-500 mt-1">
              {completedItems} de {totalItems} itens organizados ({Math.round(totalItems > 0 ? (completedItems / totalItems) * 100 : 0)}% concluído)
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            {isEditMode ? (
              <>
                <button
                  type="button"
                  onClick={() => setIsEditMode(false)}
                  className="px-4 py-2.5 rounded-xl border border-gray-200 text-xs sm:text-sm font-semibold text-gray-700 hover:bg-gray-100 cursor-pointer transition-colors"
                >
                  Cancelar
                </button>
                <Button
                  type="button"
                  onClick={() => {
                    setIsEditMode(false);
                    toast.success('Edições salvas com sucesso!');
                  }}
                  className="px-5 py-2.5 rounded-xl bg-[#0B7A75] hover:bg-[#085E5A] text-white text-xs sm:text-sm font-semibold cursor-pointer shadow-sm transition-all"
                >
                  Concluir edição
                </Button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={handleResetChecklist}
                  className="px-3.5 py-2 rounded-xl border border-gray-200 text-xs font-medium text-gray-600 hover:bg-gray-100 inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Desmarcar todos
                </button>
                <Button
                  type="button"
                  onClick={() => setIsEditMode(true)}
                  className="px-4 py-2 rounded-xl bg-[#0B7A75] hover:bg-[#085E5A] text-white text-xs font-semibold cursor-pointer shadow-sm"
                >
                  Editar mala
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Alerta de Remoção de Item (Design System - Amarelo Sol) */}
        {lastRemoved && (
          <div className="bg-[#FFF8E2] border border-[#F2B640] rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs sm:text-sm text-[#0B2B33] animate-fadeIn">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-[#F2B640] shrink-0 mt-0.5" />
              <div>
                <p>
                  Você removeu <strong>{lastRemoved.item.name}</strong>.{' '}
                  {lastRemoved.item.reason
                    ? `Motivo original: ${lastRemoved.item.reason}.`
                    : 'Se mantiver a remoção, a lista segue assim.'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
              <button
                type="button"
                onClick={handleUndoDelete}
                className="px-3 py-1.5 rounded-lg border border-[#0B2B33]/20 bg-white text-xs font-bold text-[#0B2B33] hover:bg-gray-50 cursor-pointer transition-colors"
              >
                Desfazer remoção
              </button>
              <button
                type="button"
                onClick={() => setLastRemoved(null)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-gray-600 hover:text-[#0B2B33] cursor-pointer"
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
              <span>O roteiro da viagem mudou. Sincronize a mala para recalcular itens climáticos.</span>
            </div>
            <button
              type="button"
              disabled={isRegenerating}
              onClick={handleRegenerate}
              className="px-3 py-1.5 rounded-lg bg-[#0B7A75] text-white text-xs font-semibold hover:bg-[#085E5A] cursor-pointer shrink-0 transition-colors"
            >
              {isRegenerating ? 'Atualizando...' : 'Sincronizar'}
            </button>
          </div>
        )}

        {/* Grupos de Categorias de Itens */}
        <div className="flex flex-col gap-6">
          {Object.entries(groupedItems).map(([category, catItems]) => {
            const styles = getCategoryStyles(category);
            const inputVal = inlineInputs[category] || '';

            return (
              <div
                key={category}
                className="bg-white rounded-3xl overflow-hidden shadow-2xs border border-gray-200/80"
              >
                {/* Header da Categoria com Cor Suave */}
                <div
                  className={`px-6 py-4 flex items-center justify-between ${styles.bg} ${styles.text} border-b ${styles.border}`}
                >
                  <h3 className="font-heading font-extrabold text-base sm:text-lg tracking-tight">
                    {category}
                  </h3>
                  <span className="text-xs font-bold opacity-80">
                    {catItems.length} {catItems.length === 1 ? 'item' : 'itens'}
                  </span>
                </div>

                {/* Lista de Itens */}
                <div className="divide-y divide-gray-100">
                  {catItems.map((item) => (
                    <div
                      key={item.id}
                      className={`px-6 py-3.5 flex items-center justify-between gap-3 transition-colors ${
                        item.is_checked && !isEditMode ? 'bg-gray-50/70' : 'hover:bg-gray-50/40'
                      }`}
                    >
                      {/* Lado Esquerdo: Checkbox + Nome */}
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
                          className={`text-sm font-medium truncate ${
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
                        {item.reason && (
                          <span
                            className={`hidden sm:inline-block text-[11px] font-medium px-2.5 py-1 rounded-md ${
                              item.source === 'CUSTOM'
                                ? 'bg-[#FFF8E2] text-[#735500] border border-[#F2B640]/30 font-semibold'
                                : 'bg-gray-100 text-gray-600'
                            }`}
                          >
                            {item.source === 'CUSTOM' ? 'Adicionado por você' : item.reason}
                          </span>
                        )}

                        {/* Controles de Quantidade */}
                        {isEditMode ? (
                          <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-xl px-1.5 py-1">
                            <button
                              type="button"
                              onClick={() => handleUpdateQuantity(item.id, -1)}
                              className="w-6 h-6 rounded-lg flex items-center justify-center text-gray-600 hover:bg-white hover:text-[#0B2B33] cursor-pointer transition-colors"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="w-6 text-center text-xs font-bold text-[#0B2B33]">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleUpdateQuantity(item.id, 1)}
                              className="w-6 h-6 rounded-lg flex items-center justify-center text-gray-600 hover:bg-white hover:text-[#0B2B33] cursor-pointer transition-colors"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded-md">
                            {item.quantity}x
                          </span>
                        )}

                        {/* Botão de Excluir (Modo Edição) */}
                        {isEditMode && (
                          <button
                            type="button"
                            onClick={() => handleDeleteItem(item)}
                            className="p-1.5 text-gray-400 hover:text-[#C93E22] rounded-lg hover:bg-red-50 cursor-pointer transition-colors"
                            title="Remover item da mala"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Formulário Inline para Adicionar Item à Categoria */}
                {isEditMode && (
                  <div className="px-6 py-3.5 bg-gray-50/50 border-t border-gray-100 flex items-center gap-3">
                    <span className="text-xs font-bold text-gray-500 shrink-0 hidden sm:inline">
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
                      className="flex-1 rounded-xl border border-gray-200 bg-white px-3.5 py-2 text-xs sm:text-sm text-[#0B2B33] focus:border-[#0B7A75] focus:outline-none"
                    />
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => handleInlineAdd(category)}
                      className="rounded-xl bg-[#0B7A75] hover:bg-[#085E5A] text-white text-xs font-semibold px-4 py-2 h-auto cursor-pointer shrink-0 transition-colors"
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
        <p className="text-center text-xs text-gray-400 pt-4 pb-8">
          As alterações valem só para esta viagem. Para mudar as regras de recomendação climática, consulte as configurações do Packed.
        </p>
      </main>
    </div>
  );
}
