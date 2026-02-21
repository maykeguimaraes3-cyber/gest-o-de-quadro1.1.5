
import React, { useState } from 'react';
import { Users, CheckCircle, AlertTriangle, TrendingDown, Calendar, Edit2, Layers, ArrowUpRight, ArrowDownRight, Building2, Globe, ShieldCheck, Activity } from 'lucide-react';
import { Employee, CalendarEvent, AppConfig, EmployeeStatus, EmployeeRole } from '../types';

interface DashboardProps {
  employees: Employee[];
  config: AppConfig;
  events: CalendarEvent[];
  onUpdateConfig: (config: AppConfig) => void;
  isAdmin?: boolean;
  globalStats?: {
    totalSectors: number;
    totalEmployees: number;
    totalUsers: number;
    isSystemOnline: boolean;
  } | null;
}

const Dashboard: React.FC<DashboardProps> = ({ employees, config, events, onUpdateConfig, isAdmin, globalStats }) => {
  const [isEditingAuth, setIsEditingAuth] = useState(false);
  const [tempAuth, setTempAuth] = useState(config.authorizedCount.toString());

  const stats = {
    total: employees.length,
    working: employees.filter(e => e.status === EmployeeStatus.TRABALHANDO).length,
    vacation: employees.filter(e => e.status === EmployeeStatus.FERIAS).length,
    away: employees.filter(e => [EmployeeStatus.AFASTADO, EmployeeStatus.AVISO_PREVIO, EmployeeStatus.LICENCA].includes(e.status)).length,
  };

  const availability = config.authorizedCount - stats.working;

  const today = new Date().toISOString().split('T')[0];
  const todayEvents = events.filter(e => e.date === today);

  const handleSaveAuth = () => {
    const val = parseInt(tempAuth);
    if (!isNaN(val)) {
      onUpdateConfig({ ...config, authorizedCount: val });
    }
    setIsEditingAuth(false);
  };

  const StatCard = ({ title, value, icon: Icon, color, trend, editable, isGlobal }: any) => (
    <div className={`${isGlobal ? 'bg-gradient-to-br from-slate-900 to-slate-800 text-white' : 'bg-white dark:bg-slate-800'} p-8 rounded-[2rem] shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col gap-6 relative group overflow-hidden transition-all hover:shadow-2xl hover:-translate-y-1`}>
      <div className={`absolute top-0 right-0 w-32 h-32 ${isGlobal ? 'bg-white/5' : 'bg-slate-50 dark:bg-slate-700/10'} rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-150 duration-700`}></div>
      
      <div className="flex items-center justify-between relative z-10">
        <div className={`p-4 rounded-2xl ${color} shadow-lg shadow-current/10`}>
          <Icon size={24} />
        </div>
        {trend !== undefined && (
           <div className={`flex items-center gap-1 text-[10px] font-black px-2 py-1 rounded-full uppercase tracking-widest ${trend >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
             {trend >= 0 ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
             {Math.abs(trend)}%
           </div>
        )}
      </div>

      <div className="relative z-10">
        <p className={`text-xs font-black ${isGlobal ? 'text-slate-400' : 'text-slate-400 dark:text-slate-500'} uppercase tracking-[0.15em] mb-1`}>{title}</p>
        <div className="flex items-baseline gap-2">
          {editable && isAdmin && isEditingAuth ? (
            <div className="flex items-center gap-2">
              <input 
                autoFocus
                type="number" 
                value={tempAuth}
                onChange={(e) => setTempAuth(e.target.value)}
                onBlur={handleSaveAuth}
                onKeyDown={(e) => e.key === 'Enter' && handleSaveAuth()}
                className="w-24 text-4xl font-black bg-slate-50 dark:bg-slate-700 border-none rounded-2xl px-3 outline-none focus:ring-4 focus:ring-blue-500/20 text-slate-900 dark:text-white"
              />
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <h3 className={`text-4xl font-black tracking-tighter ${!isGlobal ? 'text-slate-900 dark:text-white' : ''}`}>{value}</h3>
              {editable && isAdmin && (
                <button 
                  onClick={() => { setTempAuth(config.authorizedCount.toString()); setIsEditingAuth(true); }}
                  className="p-2 opacity-0 group-hover:opacity-100 text-slate-300 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all rounded-xl"
                >
                  <Edit2 size={16} />
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      
      {/* SEÇÃO GLOBAL - APENAS ADM */}
      {isAdmin && globalStats && (
        <section className="space-y-6">
          <div className="flex items-center gap-4 px-2">
            <div className="w-1.5 h-8 bg-blue-600 rounded-full" />
            <div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight uppercase">Indicadores Consolidados da Planta</h2>
              <p className="text-sm text-slate-500 font-medium">Gestão estratégica e monitoramento global de efetivo.</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard 
              isGlobal 
              title="Setores Cadastrados" 
              value={globalStats.totalSectors} 
              icon={Globe} 
              color="bg-blue-600 text-white" 
            />
            <StatCard 
              isGlobal 
              title="Efetivo Total (Planta)" 
              value={globalStats.totalEmployees} 
              icon={Users} 
              color="bg-indigo-600 text-white" 
            />
            <StatCard 
              isGlobal 
              title="Gestores Ativos" 
              value={globalStats.totalUsers} 
              icon={ShieldCheck} 
              color="bg-emerald-600 text-white" 
            />
            <StatCard 
              isGlobal 
              title="Status do Sistema" 
              value={globalStats.isSystemOnline ? "ONLINE" : "OFFLINE"} 
              icon={Activity} 
              color={globalStats.isSystemOnline ? "bg-emerald-500 text-white" : "bg-rose-500 text-white"} 
            />
          </div>
          
          <div className="bg-blue-50 dark:bg-blue-900/10 p-8 rounded-[2.5rem] border border-blue-100 dark:border-blue-800/50 flex items-center gap-6">
             <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-lg shadow-blue-500/20">
               <ShieldCheck size={32} />
             </div>
             <div>
               <h4 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">Modo Administrador Ativo</h4>
               <p className="text-sm text-slate-500 font-medium">As funções operacionais de setor foram ocultadas. Utilize o menu "Equipe" ou "Acessos ADM" para gerenciar setores específicos.</p>
             </div>
          </div>
        </section>
      )}

      {/* SEÇÃO SETORIAL - APENAS SUPERVISORES / NÃO-ADM */}
      {!isAdmin && (
        <section className="space-y-8">
          <div className="mb-2">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-black text-xs uppercase tracking-widest">
                <Building2 size={14} /> Detalhamento Operacional: {config.sectorName}
              </div>
              <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                {config.sectorName}
              </h2>
              <p className="text-slate-500 font-medium">
                Monitoramento sob responsabilidade de <span className="text-slate-800 dark:text-slate-200 font-bold">{config.responsibleName}</span>
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard 
              title="Equipe Total" 
              value={stats.total} 
              icon={Users} 
              color="bg-blue-500 text-white"
              trend={12}
            />
            <StatCard 
              title="Quadro Autorizado" 
              value={config.authorizedCount} 
              icon={CheckCircle} 
              color="bg-emerald-500 text-white"
              editable={true}
            />
            <StatCard 
              title="Ativos no Turno" 
              value={stats.working} 
              icon={Calendar} 
              color="bg-indigo-500 text-white"
              trend={-2}
            />
            <StatCard 
              title="Saldo de Vagas" 
              value={availability > 0 ? `+${availability}` : availability} 
              icon={availability < 0 ? TrendingDown : AlertTriangle} 
              color={availability < 0 ? "bg-rose-500 text-white" : "bg-amber-500 text-white"}
            />
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            <div className="xl:col-span-2 space-y-8">
               <div className="bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
                 <div className="flex justify-between items-center mb-8">
                    <div>
                      <h3 className="text-2xl font-black tracking-tight">Capacidade Operacional</h3>
                      <p className="text-sm text-slate-500 font-medium">Distribuição por status em tempo real</p>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-900 px-4 py-2 rounded-2xl text-xs font-black text-blue-600 uppercase tracking-widest border border-slate-100 dark:border-slate-700">
                      Setorial
                    </div>
                 </div>
                 
                 <div className="space-y-10">
                    {[
                      { label: 'Trabalhando', count: stats.working, color: 'bg-emerald-500', shadow: 'shadow-emerald-500/30' },
                      { label: 'Em Férias', count: stats.vacation, color: 'bg-amber-500', shadow: 'shadow-amber-500/30' },
                      { label: 'Indisponíveis', count: stats.away, color: 'bg-rose-500', shadow: 'shadow-rose-500/30' }
                    ].map((item, idx) => (
                      <div key={idx} className="group/bar">
                        <div className="flex justify-between items-end mb-3">
                          <span className="text-sm font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">{item.label}</span>
                          <div className="text-right">
                            <span className="text-2xl font-black tabular-nums">{item.count}</span>
                            <span className="text-xs text-slate-400 ml-1 font-bold">({stats.total > 0 ? Math.round((item.count / stats.total) * 100) : 0}%)</span>
                          </div>
                        </div>
                        <div className="w-full bg-slate-100 dark:bg-slate-900 h-4 rounded-full overflow-hidden border border-slate-200 dark:border-slate-700 shadow-inner">
                          <div 
                            className={`${item.color} ${item.shadow} h-full transition-all duration-1000 shadow-lg relative group-hover/bar:brightness-110`} 
                            style={{ width: `${stats.total > 0 ? (item.count / stats.total) * 100 : 0}%` }}
                          >
                             <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent"></div>
                          </div>
                        </div>
                      </div>
                    ))}
                 </div>
               </div>

               <div className="space-y-4">
                  <h3 className="text-lg font-black flex items-center gap-3 px-2 uppercase tracking-widest text-slate-400">
                    <Layers className="text-blue-600" size={20} />
                    Contagem de Auxiliares por Grupo
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4">
                    {[1, 2, 3, 4, 5, 6, 7].map(gNum => {
                      const count = employees.filter(e => e.group === gNum && e.role === EmployeeRole.AUXILIAR && e.status === EmployeeStatus.TRABALHANDO).length;
                      return (
                        <div key={gNum} className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col items-center justify-center text-center card-hover">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">G{gNum}</span>
                          <span className="text-3xl font-black text-blue-600 dark:text-blue-400 tracking-tighter">{count}</span>
                          <span className="text-[9px] text-slate-500 font-bold uppercase mt-1">Ativos</span>
                        </div>
                      );
                    })}
                  </div>
               </div>
            </div>

            <div className="space-y-8">
              <div className="bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm h-full flex flex-col">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold tracking-tight">Agenda Diária</h3>
                  <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600">
                    <Calendar size={20} />
                  </div>
                </div>
                
                <div className="flex-1 space-y-4 overflow-y-auto custom-scrollbar pr-2">
                  {todayEvents.length > 0 ? (
                    todayEvents.map(evt => (
                      <div key={evt.id} className="p-5 rounded-[1.5rem] bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-700 transition-all hover:border-indigo-200 dark:hover:border-indigo-900 group/evt">
                        <div className="flex items-center gap-3 mb-2">
                           <span className="px-2 py-1 rounded-lg bg-indigo-100 dark:bg-indigo-900 text-[10px] font-black text-indigo-700 dark:text-indigo-300 uppercase">{evt.time}</span>
                        </div>
                        <p className="font-extrabold text-slate-800 dark:text-white mb-1 group-hover/evt:text-indigo-600 transition-colors">{evt.title}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2">{evt.description}</p>
                      </div>
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center h-64 text-slate-300 dark:text-slate-700">
                      <Calendar className="w-20 h-20 mb-4 opacity-10" />
                      <p className="text-sm font-bold uppercase tracking-widest opacity-50">Sem compromissos</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default Dashboard;
