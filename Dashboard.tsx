
import React, { useState } from 'react';
import { Layers, MoreHorizontal, Umbrella, AlertTriangle, X, User } from 'lucide-react';
import { Employee, EmployeeStatus } from '../types';
import { STATUS_COLORS } from '../constants';

interface GroupManagerProps {
  employees: Employee[];
  onUpdate: (employees: Employee[]) => void;
}

const GroupManager: React.FC<GroupManagerProps> = ({ employees }) => {
  const groups = [1, 2, 3, 4, 5, 6, 7];
  const [selectedGroup, setSelectedGroup] = useState<number | null>(null);

  const groupEmployees = selectedGroup ? employees.filter(e => e.group === selectedGroup) : [];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-in slide-in-from-bottom duration-500">
        {groups.map((groupNum) => {
          const members = employees.filter(e => e.group === groupNum);
          const workingCount = members.filter(e => e.status === EmployeeStatus.TRABALHANDO).length;
          const vacationCount = members.filter(e => e.status === EmployeeStatus.FERIAS).length;
          const otherCount = members.length - workingCount - vacationCount;
          
          const progress = members.length > 0 ? (workingCount / members.length) * 100 : 0;

          return (
            <div key={groupNum} className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 rounded-lg">
                    <Layers size={18} />
                  </div>
                  <h3 className="font-bold text-lg">Grupo {groupNum}</h3>
                </div>
                <div className="flex flex-col items-end">
                  <span className="bg-blue-600 text-white px-2.5 py-1 rounded-full text-xs font-bold shadow-sm">
                    {members.length}
                  </span>
                  <span className="text-[9px] text-slate-400 font-bold uppercase mt-1">Funcionários</span>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2 font-medium">
                    <span className="text-slate-500">Trabalhando</span>
                    <span>{workingCount}/{members.length}</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-700 h-2.5 rounded-full overflow-hidden">
                    <div 
                      className="bg-emerald-500 h-full rounded-full transition-all duration-700" 
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 flex flex-col items-center">
                    <Umbrella size={16} className="text-amber-600 mb-1" />
                    <span className="text-lg font-bold text-amber-600">{vacationCount}</span>
                    <span className="text-[10px] uppercase font-bold text-amber-500">Férias</span>
                  </div>
                  <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-900/20 flex flex-col items-center">
                    <AlertTriangle size={16} className="text-rose-600 mb-1" />
                    <span className="text-lg font-bold text-rose-600">{otherCount}</span>
                    <span className="text-[10px] uppercase font-bold text-rose-500">Indisp.</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-700 flex justify-between items-center">
                  <button 
                    onClick={() => setSelectedGroup(groupNum)}
                    className="text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors uppercase tracking-tight"
                  >
                    Ver Listagem Completa
                  </button>
                  <div className="flex items-center gap-1">
                     <MoreHorizontal size={14} className="text-slate-300" />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Group Detail Modal */}
      {selectedGroup !== null && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-800 w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden transform animate-in slide-in-from-bottom-4 duration-300 flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-600 text-white rounded-lg">
                  <Layers size={20} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-800 dark:text-white">Funcionários - Grupo {selectedGroup}</h3>
                  <p className="text-xs text-slate-500 font-medium">{groupEmployees.length} registros encontrados</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedGroup(null)} 
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-all"
              >
                <X size={20}/>
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-0">
              <table className="w-full text-left border-collapse">
                <thead className="text-[10px] text-slate-400 uppercase font-black bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-700 sticky top-0">
                  <tr>
                    <th className="px-6 py-4">Matrícula</th>
                    <th className="px-6 py-4">Nome</th>
                    <th className="px-6 py-4">Função</th>
                    <th className="px-6 py-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-slate-700/50">
                  {groupEmployees.map((emp) => (
                    <tr key={emp.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-all">
                      <td className="px-6 py-4 font-mono text-xs text-slate-500">{emp.registration}</td>
                      <td className="px-6 py-4 font-bold text-sm text-slate-800 dark:text-white">{emp.name}</td>
                      <td className="px-6 py-4 text-xs font-medium text-slate-500">{emp.role}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-[9px] font-black uppercase tracking-wider border ${STATUS_COLORS[emp.status]}`}>
                          {emp.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {groupEmployees.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-slate-400 italic">Nenhum funcionário neste grupo.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            
            <div className="p-4 border-t border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 flex justify-end">
              <button 
                onClick={() => setSelectedGroup(null)}
                className="px-6 py-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-xl font-bold text-sm transition-all"
              >
                FECHAR
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GroupManager;
