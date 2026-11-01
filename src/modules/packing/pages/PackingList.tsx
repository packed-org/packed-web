import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ChevronLeft, 
  Edit3, 
  Info, 
  Shirt, 
  Droplet, 
  Star, 
  ExternalLink,
  CheckCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

type Category = 'Roupas' | 'Higiene' | 'Itens gerais';

interface PackingItem {
  id: string;
  name: string;
  category: Category;
  checked: boolean;
}

// Os mesmos itens mockados da TripsList para fallback
const DEFAULT_TRIPS = [
  { id: '1', destination: 'Buenos Aires', country: 'Argentina', startDate: new Date().toISOString(), endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() },
  { id: '2', destination: 'Alagoinha', country: 'Brasil', startDate: new Date().toISOString(), endDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString() },
];

const INITIAL_ITEMS: PackingItem[] = [
  { id: '1', name: 'Camisetas leves x4', category: 'Roupas', checked: false },
  { id: '2', name: 'Calças x2', category: 'Roupas', checked: false },
  { id: '3', name: 'Suéter fino x2', category: 'Roupas', checked: true },
  { id: '4', name: 'Casaco impermeável x1', category: 'Roupas', checked: false },
  { id: '5', name: 'Roupa social x1', category: 'Roupas', checked: true },
  { id: '6', name: 'Tênis confortável', category: 'Roupas', checked: true },
  { id: '7', name: 'Protetor solar FPS 30', category: 'Higiene', checked: false },
  { id: '8', name: 'Shampoo e condicionador', category: 'Higiene', checked: false },
  { id: '9', name: 'Escova e pasta de dente', category: 'Higiene', checked: true },
  { id: '10', name: 'Desodorante', category: 'Higiene', checked: true },
  { id: '11', name: 'Passaporte e documentos oficiais', category: 'Itens gerais', checked: false },
  { id: '12', name: 'Guarda-chuva compacto', category: 'Itens gerais', checked: false },
  { id: '13', name: 'Notebook e carregador', category: 'Itens gerais', checked: true },
  { id: '14', name: 'Adaptador de tomada', category: 'Itens gerais', checked: true },
];

const CATEGORY_CONFIG = {
  'Roupas': { icon: Shirt, color: 'text-orange-500' },
  'Higiene': { icon: Droplet, color: 'text-blue-600' },
  'Itens gerais': { icon: Star, color: 'text-red-500' },
};

export function PackingList() {
  const navigate = useNavigate();
  const { id } = useParams();
  
  const [trip, setTrip] = useState<any>(null);
  const [items, setItems] = useState<PackingItem[]>(INITIAL_ITEMS);
  const [activeFilter, setActiveFilter] = useState<Category | 'Todos'>('Todos');

  useEffect(() => {
    // 1. Primeiro tenta buscar do localStorage
    const storedTrips = localStorage.getItem('packed_trips');
    let foundTrip = null;

    if (storedTrips) {
      const trips = JSON.parse(storedTrips);
      // Garantimos que a comparação é em string
      foundTrip = trips.find((t: any) => String(t.id) === String(id));
    }

    // 2. Se não achou no localStorage, tenta buscar nos itens padrão (para os IDs '1' e '2')
    if (!foundTrip) {
      foundTrip = DEFAULT_TRIPS.find(t => String(t.id) === String(id));
    }

    // 3. Define a viagem ou redireciona
    if (foundTrip) {
      setTrip(foundTrip);
    } else {
      toast.error('Viagem não encontrada');
      navigate('/viagens');
    }
  }, [id, navigate]);

  const formatDate = (isoString: string) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short' }).format(date);
  };

  const totalItems = items.length;
  const completedItems = items.filter(item => item.checked).length;
  const pendingItems = totalItems - completedItems;
  const progressPercentage = totalItems === 0 ? 0 : Math.round((completedItems / totalItems) * 100);

  const toggleItem = (itemId: string) => {
    setItems(currentItems => 
      currentItems.map(item => 
        item.id === itemId ? { ...item, checked: !item.checked } : item
      )
    );
  };

  const handleSave = () => {
    toast.success('Progresso salvo com sucesso!', {
      description: `Sua mala para ${trip?.destination} foi atualizada.`,
    });
  };

  const groupedItems = items.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {} as Record<Category, PackingItem[]>);

  const displayCategories = activeFilter === 'Todos' 
    ? (Object.keys(groupedItems) as Category[]) 
    : [activeFilter];

  if (!trip) {
    return <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">Carregando...</div>;
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-24 font-sans select-none">
      <header className="flex items-center justify-between px-6 pt-10 pb-4 bg-white/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-1 -ml-1 text-slate-700 hover:text-slate-900 transition-colors">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-slate-900 leading-tight">Mala para {trip.destination}</h1>
            <p className="text-xs font-medium text-slate-500 mt-0.5 capitalize">
              {trip.startDate && trip.endDate 
                ? `${formatDate(trip.startDate)} - ${formatDate(trip.endDate)}`
                : 'Datas não definidas'}
            </p>
          </div>
        </div>
        <button className="p-2 text-slate-700 hover:bg-slate-100 rounded-full transition-colors">
          <Edit3 className="w-5 h-5" />
        </button>
      </header>

      <main className="px-5 flex flex-col gap-6 mt-2 max-w-md mx-auto">
        <div className="bg-[#0A2E3F] rounded-[1.25rem] p-5 shadow-lg relative overflow-hidden text-white">
          <div className="flex justify-between items-end mb-4">
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-extrabold tracking-tight">{completedItems}</span>
              <span className="text-sm font-medium text-slate-300">/{totalItems}</span>
            </div>
            <span className="text-sm font-medium text-slate-300">{pendingItems} pendentes</span>
          </div>
          
          <div className="h-2 w-full bg-white/20 rounded-full overflow-hidden mb-5">
            <div 
              className="h-full bg-amber-400 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-xs font-medium text-slate-300 pt-4 border-t border-white/10">
            <span>Consultando clima...</span>
            <Info className="w-4 h-4" />
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide -mx-1 px-1">
          <Badge 
            variant={activeFilter === 'Todos' ? 'default' : 'outline'}
            onClick={() => setActiveFilter('Todos')}
            className={`cursor-pointer px-4 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
              activeFilter === 'Todos' 
                ? 'bg-blue-100 text-blue-700 hover:bg-blue-200 border-transparent shadow-none' 
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border-transparent'
            }`}
          >
            Todos
          </Badge>
          {(Object.keys(CATEGORY_CONFIG) as Category[]).map(cat => (
            <Badge 
              key={cat}
              variant={activeFilter === cat ? 'default' : 'outline'}
              onClick={() => setActiveFilter(cat)}
              className={`cursor-pointer px-4 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
                activeFilter === cat 
                  ? 'bg-blue-100 text-blue-700 hover:bg-blue-200 border-transparent shadow-none' 
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border-transparent'
              }`}
            >
              {cat}
            </Badge>
          ))}
        </div>

        <div className="flex flex-col gap-5">
          {displayCategories.map(category => {
            const categoryItems = groupedItems[category] || [];
            if (categoryItems.length === 0) return null;

            const CatIcon = CATEGORY_CONFIG[category].icon;
            const catColor = CATEGORY_CONFIG[category].color;
            const completedInCategory = categoryItems.filter(i => i.checked).length;

            return (
              <div key={category} className="bg-white rounded-[1.25rem] p-5 shadow-sm border border-slate-100">
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-50">
                  <div className={`flex items-center gap-2 font-bold text-lg ${catColor}`}>
                    <CatIcon className="w-5 h-5 stroke-[2.5]" />
                    {category}
                  </div>
                  <span className="text-xs font-semibold text-slate-500">
                    {completedInCategory} de {categoryItems.length}
                  </span>
                </div>

                <div className="flex flex-col gap-4">
                  {categoryItems.map(item => (
                    <div 
                      key={item.id} 
                      onClick={() => toggleItem(item.id)}
                      className="flex items-center gap-3 cursor-pointer group"
                    >
                      {item.checked ? (
                        <CheckCircle className="w-5 h-5 text-[#5F8D4E] shrink-0 transition-transform group-hover:scale-110" />
                      ) : (
                        <div className="w-5 h-5 rounded-md border-2 border-slate-200 shrink-0 transition-colors group-hover:border-slate-300" />
                      )}
                      
                      <span className={`text-sm font-medium transition-all ${
                        item.checked 
                          ? 'text-[#5F8D4E] line-through decoration-[#5F8D4E]/50' 
                          : 'text-slate-700'
                      }`}>
                        {item.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex items-center gap-3 pt-4">
          <Button 
            variant="outline" 
            className="flex-1 bg-transparent border-[#0D9488] text-[#0D9488] hover:bg-[#0D9488]/5 h-12 rounded-full font-bold shadow-none"
            onClick={() => navigate(`/mala/${id}/insights`)}
          >
            Por que essa lista? <ExternalLink className="w-4 h-4 ml-1.5" />
          </Button>
          <Button 
            className="px-8 bg-[#5F8D4E] hover:bg-[#4a703d] text-white h-12 rounded-full font-bold shadow-md"
            onClick={handleSave}
          >
            Salvar
          </Button>
        </div>
      </main>
    </div>
  );
}