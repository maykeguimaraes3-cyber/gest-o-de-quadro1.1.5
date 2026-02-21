
import React, { useState } from 'react';
import { History, Search, Filter, Clock, User as UserIcon, Building2, ChevronRight } from 'lucide-react';
import { AuditEntry } from '../types';

interface AuditHistoryProps {
  auditLog: AuditEntry[];
}

const AuditHistory: React.FC<AuditHistoryProps> = ({ auditLog }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredLogs = auditLog.filter(log => 
    log.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.sector.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getActionColor = (action: AuditEntry['action']) => {
    switch (action) {
      case 'CREATE': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'UPDATE': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'DELETE': return 'bg-rose-100 text-rose-700 border-rose-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <History className="text-blue-600" size={28} /> Histórico de Auditoria
          </h2>
          <p className="text-slate-500 dark:text-slate-400 font-medium">Rastreamento de todas as alterações realizadas no sistema.</p>
        </div>
        
        <div className="relative w-full md:w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Filtrar histórico..."
            className="w-full pl-12 pr-4 py-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none focus:ring-4 focus:ring-blue-500/10 transition-all font-bold text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
        <div className="p-8">
          <div className="relative space-y-8 before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 dark:before:via-slate-700 before:to-transparent">
            {filteredLogs.map((log, idx) => (
              <div key={log.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active animate-in slide-in-from-bottom duration-500" style={{ animationDelay: `${idx * 50}ms` }}>
                {/* Icone do Centro */}
                <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white dark:border-slate-800 bg-slate-100 dark:bg-slate-900 text-slate-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 transition-transform group-hover:scale-110">
                  <Clock size={16} />
                </div>
                
                {/* Conteúdo */}
                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-6 rounded-3xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest border ${getActionColor(log.action)}`}>
                        {log.action}
                      </span>
                      <div className="text-xs font-black text-slate-800 dark:text-white flex items-center gap-1.5">
                        <UserIcon size={12} className="text-blue-500" />
                        {log.username}
                      </div>
                    </div>
                    <time className="text-[10px] font-bold text-slate-400 font-mono">
                      {new Date(log.timestamp).toLocaleString('pt-BR')}
                    </time>
                  </div>
                  
                  <div className="space-y-3">
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-300 leading-relaxed">
                      {log.details}
                    </p>
                    <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      <Building2 size={10} /> {log.sector}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {filteredLogs.length === 0 && (
              <div className="py-20 text-center">
                <History className="mx-auto mb-4 text-slate-200" size={64} />
                <p className="text-slate-400 font-bold italic tracking-wide">Nenhum registro de atividade encontrado.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuditHistory;
