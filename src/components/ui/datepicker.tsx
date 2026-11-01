import * as React from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar as CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface DatePickerProps {
  date?: Date;
  setDate: (date?: Date) => void;
  placeholder?: string;
  className?: string;
  disabled?: (date: Date) => boolean; // Nova propriedade adicionada
}

export function DatePicker({
  date,
  setDate,
  placeholder = 'Selecione uma data',
  className,
  disabled,
}: DatePickerProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            'w-full justify-start text-left font-normal bg-white border-none shadow-xs text-petroleo h-12 px-4 rounded-xl text-sm hover:bg-white/90 focus-visible:ring-2 focus-visible:ring-teal',
            !date && 'text-slate-400',
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4 text-slate-400 shrink-0" />
          {date ? (
            format(date, 'dd / MM / yyyy', { locale: ptBR })
          ) : (
            <span>{placeholder}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 bg-white rounded-2xl shadow-lg border border-slate-100" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          locale={ptBR}
          disabled={disabled} // Repassando a regra para o calendário
        />
      </PopoverContent>
    </Popover>
  );
}