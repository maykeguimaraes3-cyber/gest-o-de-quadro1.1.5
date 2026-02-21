
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  Plus, Search, Edit2, Trash2, 
  X, Clock, Trash, Users, FileUp, Building2, ChevronRight, User as UserIcon, Download, Table as TableIcon
} from 'lucide-react';
import { Employee, EmployeeRole, EmployeeStatus, User, AppConfig, Sector } from '../types';
import { STATUS_COLORS, ROLE_ICONS } from '../constants';
import * as XLSX from 'xlsx';

interface EmployeeListProps {
  employees: Employee[];
  onUpdate: (employees: Employee[]) => void;
  notify: (msg: string, type?: 'success' | 'info' | 'error') => void;
  sectorName: string;
  currentUser: User;
  config: AppConfig;
  onSwitchSector: (sector: Sector) => void;
  onLog: (action: 'CREATE' | 'UPDATE' | 'DELETE', details: string) => void;
}

const EmployeeList: React.FC<EmployeeListProps> = ({ 
  employees, onUpdate, notify, sectorName, currentUser, config, onSwitchSector, onLog 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<string>('All');
  const [filterGroup, setFilterGroup] = useState<string>('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Estado para controlar se o Master está visualizando um setor específico ou o Hub
  const [isViewingSpecificSector, setIsViewingSpecificSector] = useState(false);

  const [sortField, setSortField] = useState<keyof Employee>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const filteredEmployees = useMemo(() => {
    return employees
      .filter(e => 
        (e.name.toLowerCase().includes(searchTerm.toLowerCase()) || String(e.registration).toLowerCase().includes(searchTerm.toLowerCase())) &&
        (filterRole === 'All' || e.role === filterRole) &&
        (filterGroup === 'All' || e.group === parseInt(filterGroup))
      )
      .sort((a, b) => {
        const aVal = String(a[sortField] || '').toLowerCase();
        const bVal = String(b[sortField] || '').toLowerCase();
        return sortDirection === 'asc' 
          ? aVal.localeCompare(bVal, undefined, { numeric: true }) 
          : bVal.localeCompare(aVal, undefined, { numeric: true });
      });
  }, [employees, searchTerm, filterRole, filterGroup, sortField, sortDirection]);

  const handleImportExcel = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws) as any[];

        const newEmployees: Employee[] = data.map((row: any) => {
          let role = EmployeeRole.AUXILIAR;
          const excelRole = String(row['Cargo'] || row['role'] || '').trim().toLowerCase();
          if (excelRole.includes('operador')) role = EmployeeRole.OPERADOR;
          else if (excelRole.includes('assistente')) role = EmployeeRole.ASSISTENTE;
          else if (excelRole.includes('supervisor')) role = EmployeeRole.SUPERVISOR;

          let status = EmployeeStatus.TRABALHANDO;
          const excelStatus = String(row['Situação'] || row['status'] || '').trim().toLowerCase();
          if (excelStatus.includes('férias') || excelStatus.includes('ferias')) status = EmployeeStatus.FERIAS;
          else if (excelStatus.includes('afastado')) status = EmployeeStatus.AFASTADO;
          else if (excelStatus.includes('aviso')) status = EmployeeStatus.AVISO_PREVIO;
          else if (excelStatus.includes('licença') || excelStatus.includes('licenca')) status = EmployeeStatus.LICENCA;

          return {
            id: Math.random().toString(36).substr(2, 9),
            registration: String(row['Cadastro'] || row['registration'] || ''),
            name: String(row['Nome'] || row['name'] || 'Sem Nome'),
            group: parseInt(row['Turma'] || row['group'] || '1'),
            role: role,
            status: status,
            statusDate: new Date().toISOString(),
            createdAt: new Date().toISOString()
          };
        }).filter(emp => emp.registration && emp.name !== 'Sem Nome');

        if (newEmployees.length > 0) {
          if (window.confirm(`Deseja importar ${newEmployees.length} funcionários para o setor ${sectorName}? Isso substituirá a lista atual.`)) {
            onUpdate(newEmployees);
            onLog('CREATE', `Importou ${newEmployees.length} funcionários via Excel para ${sectorName}`);
            notify(`${newEmployees.length} funcionários importados com sucesso!`);
          }
        } else {
          notify('Nenhum dado válido encontrado no Excel. Verifique as colunas.', 'error');
        }
      } catch (err) {
        notify('Erro ao processar o arquivo Excel.', 'error');
      }
    };
    reader.readAsBinaryString(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const downloadTemplate = () => {
    const templateData = [
      { 'Cadastro': '12345', 'Nome': 'Fulano de Tal', 'Turma': 1, 'Cargo': 'Auxiliar', 'Situação': 'Trabalhando' },
      { 'Cadastro': '67890', 'Nome': 'Ciclano Oliveira', 'Turma': 2, 'Cargo': 'Operador', 'Situação': 'Férias' }
    ];
    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template");
    XLSX.writeFile(wb, "modelo_importacao_equipe.xlsx");
    notify('Modelo baixado!');
  };

  // Hub de Setores para o Mestre
  if (currentUser.role === 'master' && !isViewingSpecificSector) {
    return (
      <div className="space-y-8 animate-in fade-in duration-500">
        <div className="flex flex-col gap-2">
          <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <Building2 className="text-blue-600" size={28} /> Central de Gestão Setorial
          </h2>
          <p className="text-slate-500 dark:text-slate-400 font-medium font-sans">Acesse o quadro de funcionários através dos acessos configurados abaixo.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {config.users.map(u => (
            u.sectors.map((s, idx) => (
              <button 
                key={`${u.id}-${idx}`}
                onClick={() => {
                  onSwitchSector(s.sectorId);
                  setIsViewingSpecificSector(true);
                }}
                className="bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-700 shadow-sm text-left hover:shadow-2xl hover:-translate-y-2 transition-all group relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-8 opacity-5 transition-transform group-hover:scale-125 duration-700">
                  <Users size={80} />
                </div>
                
                <div className="flex flex-col h-full justify-between gap-8 relative z-10">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center text-blue-600">
                        <UserIcon size={24} />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Dono do Acesso</p>
                        <h3 className="text-lg font-bold text-slate-800 dark:text-white leading-tight">{u.username}</h3>
                      </div>
                    </div>
                    <div className="pt-4 border-t border-slate-100 dark:border-slate-700">
                      <span className="px-3 py-1 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest rounded-lg">
                        {s.label}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 text-blue-600 font-black text-xs uppercase tracking-widest group-hover:gap-4 transition-all">
                    GERENCIAR QUADRO <ChevronRight size={16} />
                  </div>
                </div>
              </button>
            ))
          ))}
          {config.users.length === 0 && (
            <div className="col-span-full py-20 bg-slate-100 dark:bg-slate-900/50 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-[3rem] text-center">
              <p className="text-slate-400 font-bold italic">Nenhum usuário cadastrado com setores vinculados.</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  const handleSort = (field: keyof Employee) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleDelete = (id: string) => {
    const emp = employees.find(e => e.id === id);
    if (window.confirm(`Tem certeza que deseja excluir ${emp?.name}?`)) {
      const newList = employees.filter(e => e.id !== id);
      onUpdate(newList);
      onLog('DELETE', `Excluiu funcionário: ${emp?.name} (${emp?.registration})`);
      notify('Colaborador removido com sucesso');
    }
  };

  const handleSaveEmployee = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      registration: formData.get('registration') as string,
      name: formData.get('name') as string,
      role: formData.get('role') as EmployeeRole,
      group: parseInt(formData.get('group') as string),
      status: formData.get('status') as EmployeeStatus,
    };

    if (editingEmployee) {
      const updated = employees.map(emp => 
        emp.id === editingEmployee.id ? { 
          ...emp, 
          ...data, 
          statusDate: emp.status !== data.status ? new Date().toISOString() : emp.statusDate 
        } : emp
      );
      onUpdate(updated);
      onLog('UPDATE', `Editou dados de: ${data.name}`);
      notify('Dados atualizados');
    } else {
      const newEmp: Employee = {
        id: Math.random().toString(36).substr(2, 9),
        ...data,
        statusDate: new Date().toISOString(),
        createdAt: new Date().toISOString()
      };
      onUpdate([...employees, newEmp]);
      onLog('CREATE', `Cadastrou novo funcionário: ${data.name}`);
      notify('Colaborador cadastrado');
    }
    setIsModalOpen(false);
    setEditingEmployee(null);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      {currentUser.role === 'master' && (
        <button 
          onClick={() => {
            setIsViewingSpecificSector(false);
            setSearchTerm('');
          }} 
          className="text-xs font-black text-blue-600 uppercase tracking-widest flex items-center gap-2 mb-4 hover:gap-3 transition-all"
        >
          <ChevronRight className="rotate-180" size={16} /> VOLTAR AO HUB DE SETORES
        </button>
      )}

      {/* Seção de Importação e Ações Rápidas */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-[2rem] border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/10">
            <TableIcon size={24} />
          </div>
          <div>
            <h3 className="font-black text-slate-800 dark:text-white uppercase tracking-tight">Importação Setorial</h3>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Alimente o quadro via Excel (.xlsx)</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button 
            onClick={downloadTemplate}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 font-bold text-xs hover:bg-slate-50 dark:hover:bg-slate-700 transition-all"
          >
            <Download size={16} /> MODELO
          </button>
          
          <label className="flex-1 md:flex-none cursor-pointer flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-black text-xs transition-all shadow-xl shadow-emerald-500/20 active:scale-95">
            <FileUp size={16} /> CARREGAR EQUIPE
            <input 
              type="file" 
              accept=".xlsx, .xls" 
              className="hidden" 
              onChange={handleImportExcel}
              ref={fileInputRef}
            />
          </label>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Pesquisar por nome ou cadastro..."
            className="w-full pl-12 pr-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 outline-none focus:ring-4 focus:ring-blue-500/10 transition-all shadow-sm font-bold"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-black transition-all shadow-lg active:scale-95">
            <Plus size={18} /> <span className="hidden xs:inline uppercase tracking-widest">NOVO CADASTRO</span>
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-[2rem] border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
        <div className="overflow-x-auto max-h-[60vh]">
          <table className="w-full text-left">
            <thead className="sticky top-0 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 z-10">
              <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                <th className="px-6 py-5 cursor-pointer hover:text-blue-500 transition-colors" onClick={() => handleSort('registration')}>Matrícula</th>
                <th className="px-6 py-5 cursor-pointer hover:text-blue-500 transition-colors" onClick={() => handleSort('name')}>Funcionário</th>
                <th className="px-6 py-5">Cargo</th>
                <th className="px-6 py-5 text-center">Turma</th>
                <th className="px-6 py-5">Situação</th>
                <th className="px-6 py-5 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {filteredEmployees.map(emp => (
                <tr key={emp.id} className="group hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-all">
                  <td className="px-6 py-4 font-mono text-xs text-slate-500">{emp.registration}</td>
                  <td className="px-6 py-4 font-bold text-slate-800 dark:text-white">{emp.name}</td>
                  <td className="px-6 py-4 text-xs font-medium text-slate-500">
                     <div className="flex items-center gap-2">
                        {ROLE_ICONS[emp.role]} {emp.role}
                     </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="bg-slate-100 dark:bg-slate-900 px-3 py-1 rounded-lg text-[10px] font-black border border-slate-200 dark:border-slate-700">G{emp.group}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider border ${STATUS_COLORS[emp.status]}`}>
                      {emp.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-1 md:opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => { setEditingEmployee(emp); setIsModalOpen(true); }} className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"><Edit2 size={16}/></button>
                      <button onClick={() => handleDelete(emp.id)} className="p-2 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-lg transition-colors"><Trash2 size={16}/></button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredEmployees.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center gap-3 opacity-30">
                       <Users size={48} />
                       <p className="font-bold uppercase tracking-widest text-sm italic">Quadro vazio ou nenhum resultado</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-800 w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden transform animate-in slide-in-from-bottom-4">
            <div className="p-8 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
              <h3 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">{editingEmployee ? 'Editar Perfil' : 'Novo Registro'}</h3>
              <button onClick={() => { setIsModalOpen(false); setEditingEmployee(null); }} className="p-2 text-slate-400 hover:bg-slate-100 rounded-full transition-all"><X size={24}/></button>
            </div>
            <form onSubmit={handleSaveEmployee} className="p-8 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Matrícula</label>
                  <input required name="registration" defaultValue={editingEmployee?.registration} className="w-full px-5 py-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border-none font-bold outline-none ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-blue-500 transition-all" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Turma (Grupo)</label>
                  <select name="group" defaultValue={editingEmployee?.group} className="w-full px-5 py-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border-none font-bold outline-none ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-blue-500 transition-all">
                    {[1,2,3,4,5,6,7].map(g => <option key={g} value={g}>Turma {g}</option>)}
                  </select>
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nome Completo</label>
                <input required name="name" defaultValue={editingEmployee?.name} className="w-full px-5 py-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border-none font-bold outline-none ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-blue-500 transition-all" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Cargo</label>
                <select name="role" defaultValue={editingEmployee?.role} className="w-full px-5 py-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border-none font-bold outline-none ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-blue-500 transition-all">
                  {Object.values(EmployeeRole).map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Situação</label>
                <select name="status" defaultValue={editingEmployee?.status} className="w-full px-5 py-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border-none font-bold outline-none ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-blue-500 transition-all">
                  {Object.values(EmployeeStatus).map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="pt-6 flex gap-4">
                <button type="button" onClick={() => { setIsModalOpen(false); setEditingEmployee(null); }} className="flex-1 py-4 rounded-2xl bg-slate-100 dark:bg-slate-700 font-black text-slate-700 dark:text-slate-200 transition-all uppercase tracking-widest text-xs">CANCELAR</button>
                <button type="submit" className="flex-1 py-4 rounded-2xl bg-blue-600 text-white font-black shadow-xl shadow-blue-500/20 active:scale-95 transition-all uppercase tracking-widest text-xs">SALVAR</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeList;
