
import React, { useState } from 'react';
import { Calendar as LucideCalendar, ChevronLeft, ChevronRight, Plus, Clock, MapPin, User } from 'lucide-react';
import { CalendarEvent, Employee, EventType } from '../types';
import { EVENT_TYPE_COLORS } from '../constants';

interface EventCalendarProps {
  events: CalendarEvent[];
  employees: Employee[];
  onUpdate: (events: CalendarEvent[]) => void;
}

const EventCalendar: React.FC<EventCalendarProps> = ({ events, employees, onUpdate }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);

  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const monthName = new Intl.DateTimeFormat('pt-BR', { month: 'long' }).format(currentDate);

  const days = [];
  for (let i = 0; i < firstDayOfMonth(year, month); i++) days.push(null);
  for (let i = 1; i <= daysInMonth(year, month); i++) days.push(i);

  const handleSaveEvent = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newEvt: CalendarEvent = {
      id: Math.random().toString(36).substr(2, 9),
      title: formData.get('title') as string,
      date: formData.get('date') as string,
      time: formData.get('time') as string,
      type: formData.get('type') as EventType,
      description: formData.get('description') as string,
      employeeId: formData.get('employeeId') as string,
    };
    onUpdate([...events, newEvt]);
    setIsModalOpen(false);
  };

  const getDayEvents = (day: number) => {
    if (!day) return [];
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return events.filter(e => e.date === dateStr);
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-right duration-500">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-2 bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-500/20">
            <LucideCalendar size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold capitalize text-slate-800 dark:text-white">{monthName} {year}</h2>
            <p className="text-sm text-slate-500">Gestão de eventos e compromissos</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={prevMonth} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"><ChevronLeft /></button>
          <button onClick={nextMonth} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"><ChevronRight /></button>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="ml-4 bg-blue-600 text-white px-4 py-2 rounded-xl flex items-center gap-2 font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/10"
          >
            <Plus size={18} /> AGENDAR
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
        <div className="grid grid-cols-7 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
          {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(d => (
            <div key={d} className="px-4 py-4 text-xs font-bold text-slate-400 uppercase text-center">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {days.map((day, idx) => (
            <div key={idx} className={`min-h-[140px] border-r border-b border-slate-100 dark:border-slate-700 p-2 group hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors ${!day ? 'bg-slate-50/50 dark:bg-slate-900/30' : ''}`}>
              {day && (
                <>
                  <div className="flex justify-between items-start mb-2">
                    <span className={`text-sm font-bold w-7 h-7 flex items-center justify-center rounded-full ${
                      day === new Date().getDate() && month === new Date().getMonth() && year === new Date().getFullYear()
                        ? 'bg-blue-600 text-white'
                        : 'text-slate-700 dark:text-slate-300'
                    }`}>
                      {day}
                    </span>
                  </div>
                  <div className="space-y-1">
                    {getDayEvents(day).map(evt => (
                      <div key={evt.id} className={`px-2 py-1 rounded text-[10px] font-bold text-white truncate ${EVENT_TYPE_COLORS[evt.type]}`} title={evt.title}>
                        {evt.time} {evt.title}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
              <h3 className="text-xl font-bold">Novo Evento</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400"><Plus size={20} className="rotate-45" /></button>
            </div>
            <form onSubmit={handleSaveEvent} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-sm font-semibold text-slate-500">Título</label>
                <input required name="title" className="w-full px-4 py-2 rounded-lg border dark:bg-slate-700 dark:border-slate-600" placeholder="Título do evento" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-slate-500">Data</label>
                  <input required name="date" type="date" className="w-full px-4 py-2 rounded-lg border dark:bg-slate-700 dark:border-slate-600" />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-slate-500">Hora</label>
                  <input required name="time" type="time" className="w-full px-4 py-2 rounded-lg border dark:bg-slate-700 dark:border-slate-600" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-semibold text-slate-500">Tipo</label>
                <select name="type" className="w-full px-4 py-2 rounded-lg border dark:bg-slate-700 dark:border-slate-600">
                  {Object.values(EventType).map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-semibold text-slate-500">Funcionário Relacionado</label>
                <select name="employeeId" className="w-full px-4 py-2 rounded-lg border dark:bg-slate-700 dark:border-slate-600">
                  <option value="">Geral</option>
                  {employees.map(e => <option key={e.id} value={e.id}>{e.name} ({e.registration})</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-semibold text-slate-500">Descrição</label>
                <textarea name="description" className="w-full px-4 py-2 rounded-lg border dark:bg-slate-700 dark:border-slate-600" rows={3}></textarea>
              </div>
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-2 rounded-lg border border-slate-200 font-medium">Cancelar</button>
                <button type="submit" className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg font-bold">Agendar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventCalendar;
