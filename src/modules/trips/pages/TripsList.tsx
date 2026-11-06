import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Luggage, 
  X, 
  MapPin, 
  Copy, 
  Archive, 
  Trash2, 
  Plus 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

type TripStatus = 'Em preparo' | 'Lista Gerada' | 'Concluída' | 'Arquivada' | 'Rascunho';

interface Trip {
  id: string;
  destination: string;
  country: string;
  status: TripStatus;
  packedItems: number;
  totalItems: number;
  lastUpdated: string;
  dates?: string; // Adicionado para o layout desktop
}

const DEFAULT_TRIPS: Trip[] = [
  { 
    id: '1', 
    destination: 'Buenos Aires', 
    country: 'Argentina', 
    status: 'Em preparo', 
    packedItems: 16, 
    totalItems: 21,
    lastUpdated: 'Atualizado ontem',
    dates: '18–25 out 2026 · 7 noites'
  },
  { 
    id: '2', 
    destination: 'Lisboa', 
    country: 'Portugal', 
    status: 'Lista Gerada', 
    packedItems: 0, 
    totalItems: 18,
    lastUpdated: 'Atualizado há 3 dias',
    dates: '12–15 dez 2026 · 3 noites'
  },
  { 
    id: '3', 
    destination: 'Buenos Aires', 
    country: 'Argentina', 
    status: 'Concluída', 
    packedItems: 12, 
    totalItems: 12,
    lastUpdated: 'Atualizado hoje',
    dates: '5–9 mar 2026 · 4 noites'
  },
];

const FILTER_OPTIONS = ['Todos', 'Em Preparo', 'Lista Gerada', 'Concluídas'];

export function TripsList() {
  const navigate = useNavigate();

  const [trips, setTrips] = useState<Trip[]>(() => {
    const stored = localStorage.getItem('packed_trips');
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed.length > 0 && parsed[0].status) return parsed;
    }
    return DEFAULT_TRIPS;
  });

  const [activeFilter, setActiveFilter] = useState('Todos');
  const [selectedTrips, setSelectedTrips] = useState<string[]>([]); // Estado para os checkboxes do Desktop

  const handleDelete = (id: string) => {
    const updated = trips.filter((t) => t.id !== id);
    setTrips(updated);
    localStorage.setItem('packed_trips', JSON.stringify(updated));
    setSelectedTrips(prev => prev.filter(selectedId => selectedId !== id));
  };

  const toggleTripSelection = (id: string) => {
    setSelectedTrips(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const toggleAllSelections = () => {
    if (selectedTrips.length === filteredTrips.length) {
      setSelectedTrips([]);
    } else {
      setSelectedTrips(filteredTrips.map(t => t.id));
    }
  };

  const filteredTrips = trips.filter(trip => {
    if (activeFilter === 'Todos') return true;
    if (activeFilter === 'Concluídas') return trip.status === 'Concluída';
    return trip.status.toLowerCase() === activeFilter.toLowerCase();
  });

  const getStatusStyle = (status: TripStatus) => {
    switch (status) {
      case 'Em preparo': return 'bg-orange-50 text-orange-600';
      case 'Lista Gerada': return 'bg-blue-50 text-blue-600';
      case 'Concluída': return 'bg-emerald-50 text-emerald-600';
      case 'Rascunho': return 'bg-slate-100 text-slate-500 border-slate-200';
      default: return 'bg-slate-100 text-slate-600';
    }
  };

  // Estatísticas para o Header Desktop
  const stats = {
    active: trips.filter(t => t.status !== 'Arquivada').length,
    inPrep: trips.filter(t => t.status === 'Em preparo').length,
    packed: trips.reduce((acc, t) => acc + t.packedItems, 0),
    total: trips.reduce((acc, t) => acc + t.totalItems, 0),
  };
  const statsPercent = stats.total > 0 ? Math.round((stats.packed / stats.total) * 100) : 0;

  return (
    <div className="min-h-screen w-full bg-[#F8FAFC] flex flex-col items-center justify-start pb-24 md:pb-12 font-sans select-none overflow-x-hidden">
      
      {/* 
        --- ÁREA MOBILE ---
        Exibida apenas em telas pequenas (< md)
      */}
      <div className="w-full max-w-md mx-auto flex flex-col gap-6 px-5 pt-10 md:hidden">
        {/* Cabeçalho Mobile */}
        <div className="flex flex-col gap-4">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Planejamento
          </h1>
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-1 px-1">
            {FILTER_OPTIONS.map(filter => (
              <Badge 
                key={filter}
                variant={activeFilter === filter ? 'default' : 'outline'}
                onClick={() => setActiveFilter(filter)}
                className={`cursor-pointer px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap shadow-none border-transparent ${
                  activeFilter === filter 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
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

        {/* Lista de Cards Mobile */}
        <div className="flex flex-col gap-5">
          {filteredTrips.map((trip) => {
            const progressPercent = trip.totalItems > 0 ? Math.round((trip.packedItems / trip.totalItems) * 100) : 0;
            return (
              <Card key={trip.id} className="bg-white border-none rounded-3xl p-5 shadow-sm">
                <CardContent className="p-0 flex flex-col gap-4">
                  <div className="flex items-start justify-between">
                    <Badge className={`px-3 py-1 rounded-full text-xs font-bold shadow-none ${getStatusStyle(trip.status)}`}>
                      {trip.status}
                    </Badge>
                    <button onClick={() => handleDelete(trip.id)} className="w-7 h-7 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-red-50 hover:text-red-500">
                      <X className="w-4 h-4 stroke-[2.5]" />
                    </button>
                  </div>
                  <div className="flex items-end justify-between mt-1">
                    <div className="flex flex-col gap-2">
                      <Luggage className="w-6 h-6 text-slate-700 stroke-[2]" />
                      <div>
                        <h2 className="text-base font-bold text-slate-900 leading-tight">{trip.destination}</h2>
                        <p className="text-xs font-medium text-slate-400 mt-0.5">{trip.country}</p>
                      </div>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-amber-400 flex items-center justify-center shadow-sm">
                      <MapPin className="w-5 h-5 text-white fill-amber-400" />
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 mt-2">
                    <div className="flex justify-between items-center text-sm font-bold">
                      <span className="text-slate-700">Bagagem separada</span>
                      <span className="text-slate-700">{trip.packedItems} de {trip.totalItems}</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-[#0D9488] rounded-full" style={{ width: `${progressPercent}%` }} />
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-2 pt-4 border-t border-slate-50">
                    <span className="text-xs font-medium text-slate-400">{trip.lastUpdated}</span>
                    <Button variant="outline" onClick={() => navigate(`/mala/${trip.id}`)} className="rounded-full border-[#0D9488] text-[#0D9488] hover:bg-[#0D9488]/5 font-bold h-9 px-5">
                      Abrir lista
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
        
        {/* FAB Mobile */}
        <div className="fixed bottom-20 left-0 w-full px-5 pointer-events-none">
          <Button onClick={() => navigate('/viagens/nova')} className="w-full h-14 bg-[#0D9488] hover:bg-[#0f766e] text-white rounded-2xl text-base font-bold shadow-lg pointer-events-auto">
            Adicionar nova viagem
          </Button>
        </div>
      </div>


      {/* 
        --- ÁREA DESKTOP ---
        Exibida apenas em telas médias ou maiores (>= md)
      */}
      <div className="hidden md:flex w-full max-w-5xl mx-auto flex-col gap-8 px-8 pt-12">
        
        {/* Topo Desktop */}
        <div className="flex justify-between items-end">
          <div className="flex flex-col gap-2">
            <h1 className="text-4xl font-extrabold text-[#0B2B33] tracking-tight">Planejamentos</h1>
            <p className="text-[#4A666C] text-base">Encontre e organize os planejamentos de bagagem das suas viagens.</p>
          </div>
          <Button onClick={() => navigate('/viagens/nova')} className="h-12 px-6 bg-[#056B6A] hover:bg-[#04504F] text-white rounded-xl font-bold flex items-center gap-2">
            <Plus className="w-5 h-5" /> Novo planejamento
          </Button>
        </div>

        {/* Dashboard Cards Desktop */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col gap-1">
            <span className="text-xs font-bold text-[#4A666C] uppercase tracking-wider">Planejamentos ativos</span>
            <span className="text-3xl font-extrabold text-[#0B2B33] mt-1">{stats.active}</span>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col gap-1">
            <span className="text-xs font-bold text-[#4A666C] uppercase tracking-wider">Em preparo</span>
            <span className="text-3xl font-extrabold text-[#0B2B33] mt-1">{stats.inPrep}</span>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col gap-2">
            <span className="text-xs font-bold text-[#4A666C] uppercase tracking-wider">Itens separados</span>
            <span className="text-3xl font-extrabold text-[#0B2B33]">{stats.packed} de {stats.total}</span>
            <div className="h-2 w-full bg-[#CDE8E8] rounded-full overflow-hidden mt-1">
              <div className="h-full bg-[#078D8C] rounded-full" style={{ width: `${statsPercent}%` }} />
            </div>
          </div>
        </div>

        {/* Filtros Desktop */}
        <div className="flex gap-2">
          {FILTER_OPTIONS.map(filter => (
            <Badge 
              key={`desktop-${filter}`}
              variant="outline"
              onClick={() => setActiveFilter(filter)}
              className={`cursor-pointer px-4 py-2 rounded-full text-sm font-bold border ${
                activeFilter === filter 
                  ? 'bg-[#0B2B33] text-white border-[#0B2B33]' 
                  : 'bg-white text-[#0B2B33] border-slate-200 hover:bg-slate-50'
              }`}
            >
              {filter}
            </Badge>
          ))}
        </div>

        {/* Tabela de Planejamentos Desktop */}
        <div className="bg-white rounded-[20px] border border-[#D9E3E3] overflow-hidden">
          <div className="overflow-x-auto">
            <div className="min-w-[800px]">
              {/* Table Header */}
              <div className="grid grid-cols-[50px_2.5fr_1.5fr_1.5fr_1fr_120px] items-center gap-4 px-4 h-12 bg-[#F4F7F7] border-b border-[#D9E3E3] text-xs font-bold text-[#4A666C] uppercase tracking-wider">
                <div className="flex justify-center">
                  <input type="checkbox" checked={selectedTrips.length === filteredTrips.length && filteredTrips.length > 0} onChange={toggleAllSelections} className="w-5 h-5 accent-[#056B6A] cursor-pointer rounded-sm" />
                </div>
                <div>Destino e datas</div>
                <div>Situação</div>
                <div>Bagagem</div>
                <div>Atualizado</div>
                <div className="text-center">Ações</div>
              </div>

              {/* Table Body */}
              {filteredTrips.length > 0 ? filteredTrips.map((trip) => {
                const isSelected = selectedTrips.includes(trip.id);
                const progressPct = trip.totalItems > 0 ? Math.round((trip.packedItems / trip.totalItems) * 100) : 0;
                
                return (
                  <div key={`desktop-row-${trip.id}`} className={`grid grid-cols-[50px_2.5fr_1.5fr_1.5fr_1fr_120px] items-center gap-4 px-4 min-h-[72px] border-b border-[#D9E3E3] last:border-0 transition-colors ${isSelected ? 'bg-[#E1F1F1]' : 'hover:bg-[#F4F7F7]'}`}>
                    <div className="flex justify-center">
                      <input type="checkbox" checked={isSelected} onChange={() => toggleTripSelection(trip.id)} className="w-5 h-5 accent-[#056B6A] cursor-pointer rounded-sm" />
                    </div>
                    
                    <div className="flex flex-col justify-center truncate pr-4">
                      <span onClick={() => navigate(`/mala/${trip.id}`)} className="text-[17px] font-bold text-[#0B2B33] cursor-pointer hover:text-[#056B6A] hover:underline truncate">
                        {trip.destination}, {trip.country}
                      </span>
                      <span className="text-sm text-[#4A666C] truncate mt-0.5">{trip.dates || 'Datas a definir'}</span>
                    </div>

                    <div>
                      <span className={`inline-flex items-center h-[26px] px-3 rounded-full text-xs font-bold whitespace-nowrap ${getStatusStyle(trip.status)}`}>
                        {trip.status}
                      </span>
                    </div>

                    <div className="flex flex-col gap-1.5 pr-6 justify-center">
                      {trip.totalItems > 0 ? (
                        <>
                          <div className="text-sm"><strong>{trip.packedItems}</strong> <span className="text-[#4A666C]">de {trip.totalItems} itens</span></div>
                          <div className="h-2 w-full bg-[#CDE8E8] rounded-full overflow-hidden">
                            <div className="h-full bg-[#078D8C] rounded-full" style={{ width: `${progressPct}%` }} />
                          </div>
                        </>
                      ) : (
                        <span className="text-sm text-[#4A666C]">Sem lista</span>
                      )}
                    </div>

                    <div className="text-sm text-[#4A666C] truncate">{trip.lastUpdated}</div>

                    <div className="flex items-center justify-center gap-1">
                      <button className="w-10 h-10 rounded-xl text-[#056B6A] hover:bg-[#CDE8E8] flex items-center justify-center transition-colors" title="Duplicar">
                        <Copy className="w-4 h-4" />
                      </button>
                      <button className="w-10 h-10 rounded-xl text-[#056B6A] hover:bg-[#CDE8E8] flex items-center justify-center transition-colors" title="Arquivar">
                        <Archive className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(trip.id)} className="w-10 h-10 rounded-xl text-[#B00B19] hover:bg-[#FBE7E8] flex items-center justify-center transition-colors" title="Excluir">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              }) : (
                <div className="p-12 text-center text-[#4A666C]">Nenhuma viagem encontrada.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}