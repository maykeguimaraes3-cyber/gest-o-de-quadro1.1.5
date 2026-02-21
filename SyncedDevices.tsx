
import React, { useState, useEffect, useRef } from 'react';
import { UserPlus, Shield, Trash2, Edit2, X, Key, Building2, User as UserIcon, Check, Layers, FileUp, ExternalLink, ChevronDown, ChevronUp, Users } from 'lucide-react';
import { User, AppConfig, Sector, UserSectorConfig, Employee, EmployeeRole, EmployeeStatus, SectorData } from '../types';
import * as XLSX from 'xlsx';

interface UserManagementProps {
  config: AppConfig;
  onUpdate: (config: AppConfig) => void;
  notify: (msg: string, type?: 'success' | 'error') => void;
  onLog: (action: 'CREATE' | 'UPDATE' | 'DELETE', details: string) => void;
  onOpenSector: (sectorId: Sector) => void;
}

const BASE_STORAGE_KEY = 'gestaoquadro_sector_data_';

const UserManagement: React.FC<UserManagementProps> = ({ config, onUpdate, notify, onLog, onOpenSector }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [expandedUserId, setExpandedUserId] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [targetSector, setTargetSector] = useState<Sector | null>(null);
  const [targetLabel, setTargetLabel] = useState<string>('');
  
  const [numSectors, setNumSectors] = useState<number>(1);
  const [s1Label, setS1Label] = useState('');
  const [s1Auth, setS1Auth] = useState(40);
  const [s2Label, setS2Label] = useState('');
  const [s2Auth, setS2Auth] = useState(40);

  useEffect(() => {
    if (editingUser) {
      setNumSectors(editingUser.sectors.length);
      setS1Label(editingUser.sectors[0]?.label || '');
      setS1Auth(editingUser.sectors[0]?.authorizedCount || 40);
      if (editingUser.sectors.length > 1) {
        setS2Label(editingUser.sectors[1]?.label || '');
        setS2Auth(editingUser.sectors[1]?.authorizedCount || 40);
      }
    } else {
      setNumSectors(1);
      setS1Label('');
      setS1Auth(40);
      setS2Label('');
      setS2Auth(40);
    }
  }, [editingUser, isModalOpen]);

  const toggleExpand = (userId: string) => {
    setExpandedUserId(expandedUserId === userId ? null : userId);
  };

  const handleTriggerImport = (sector: Sector, label: string) => {
    setTargetSector(sector);
    setTargetLabel(label);
    fileInputRef.current?.click();
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !targetSector) return;

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
          if (window.confirm(`Importar ${newEmployees.length} registros para o setor "${targetLabel}"?`)) {
            const storageKey = `${BASE_STORAGE_KEY}${targetSector}`;
            const existingRaw = localStorage.getItem(storageKey);
            let existing: Partial<SectorData> = {};
            if (existingRaw) try { existing = JSON.parse(existingRaw); } catch(e) {}

            localStorage.setItem(storageKey, JSON.stringify({
              employees: newEmployees,
              events: existing.events || [],
              config: existing.config || { ...config, sectorName: targetLabel }
            }));
            onLog('CREATE', `Equipe importada via ADM para "${targetLabel}"`);
            notify(`Setor ${targetLabel} atualizado!`);
          }
        }
      } catch (err) { notify('Erro na leitura do arquivo.', 'error'); }
    };
    reader.readAsBinaryString(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const updateAuthCount = (userId: string, sectorId: Sector, count: number) => {
    const updatedUsers = config.users.map(u => {
      if (u.id === userId) {
        return {
          ...u,
          sectors: u.sectors.map(s => s.sectorId === sectorId ? { ...s, authorizedCount: count } : s)
        };
      }
      return u;
    });
    onUpdate({ ...config, users: updatedUsers });
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const username = formData.get('username') as string;
    const password = formData.get('password') as string;

    const sectors: UserSectorConfig[] = [
      { 
        sectorId: editingUser?.sectors[0]?.sectorId || `sec_${Math.random().toString(36).substr(2, 5)}`, 
        label: s1Label || 'Setor A', 
        authorizedCount: s1Auth 
      }
    ];

    if (numSectors === 2) {
      sectors.push({ 
        sectorId: editingUser?.sectors[1]?.sectorId || `sec_${Math.random().toString(36).substr(2, 5)}`, 
        label: s2Label || 'Setor B', 
        authorizedCount: s2Auth 
      });
    }

    const userData: User = {
      id: editingUser?.id || Math.random().toString(36).substr(2, 9),
      username,
      password,
      role: 'sector',
      sectors
    };

    const newUsers = editingUser 
      ? config.users.map(u => u.id === editingUser.id ? userData : u)
      : [...config.users, userData];

    onUpdate({ ...config, users: newUsers });
    onLog(editingUser ? 'UPDATE' : 'CREATE', `ADM gerenciou acesso de ${username}`);
    setIsModalOpen(false);
    setEditingUser(null);
    notify('Acesso salvo com sucesso');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 font-sans">
      <input type="file" ref={fileInputRef} onChange={handleFileImport} accept=".xlsx, .xls" className="hidden" />
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <Shield className="text-blue-600" size={24} /> Gestão de Acessos
          </h2>
          <p className="text-slate-500 dark:text-slate-400 font-medium">Cadastre usuários e configure os quadros autorizados de cada setor.</p>
        </div>
        <button 
          onClick={() => { setEditingUser(null); setIsModalOpen(true); }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-black shadow-xl shadow-blue-500/20 transition-all flex items-center gap-2 active:scale-95"
        >
          <UserPlus size={20} /> CADASTRAR ACESSO
        </button>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-[2rem] border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
        <div className="p-8 space-y-4">
          {config.users.map(u => (
            <div key={u.id} className="border border-slate-100 dark:border-slate-700 rounded-3xl overflow-hidden bg-slate-50/30 dark:bg-slate-900/10">
              <div 
                onClick={() => toggleExpand(u.id)}
                className="p-5 flex items-center justify-between cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-700 flex items-center justify-center text-blue-600">
                    <UserIcon size={24} />
                  </div>
                  <div>
                    <h4 className="font-black text-slate-800 dark:text-white tracking-tight leading-none mb-1">{u.username}</h4>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{u.sectors.length} Setor(es) Atribuído(s)</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="hidden md:flex gap-1">
                    <button onClick={(e) => { e.stopPropagation(); setEditingUser(u); setIsModalOpen(true); }} className="p-2 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-xl transition-all">
                      <Edit2 size={16} />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); if(window.confirm('Excluir acesso?')) onUpdate({...config, users: config.users.filter(usr => usr.id !== u.id)}); }} className="p-2 text-rose-600 hover:bg-rose-100 dark:hover:bg-rose-900/30 rounded-xl transition-all">
                      <Trash2 size={16} />
                    </button>
                  </div>
                  {expandedUserId === u.id ? <ChevronUp className="text-slate-400" /> : <ChevronDown className="text-slate-400" />}
                </div>
              </div>

              {expandedUserId === u.id && (
                <div className="p-5 bg-white dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-700 animate-in slide-in-from-top-2 duration-300">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {u.sectors.map((s, idx) => (
                      <div key={idx} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-700 flex flex-col gap-4">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black uppercase text-blue-600 dark:text-blue-400 tracking-widest">{s.label}</span>
                          <div className="flex items-center gap-2">
                             <span className="text-[10px] font-black text-slate-400 uppercase">Quadro Autorizado:</span>
                             <input 
                               type="number" 
                               value={s.authorizedCount}
                               onClick={(e) => e.stopPropagation()}
                               onChange={(e) => updateAuthCount(u.id, s.sectorId, parseInt(e.target.value))}
                               className="w-16 bg-white dark:bg-slate-800 border-none rounded-lg px-2 py-1 text-xs font-black outline-none ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-blue-500 shadow-sm"
                             />
                          </div>
                        </div>
                        
                        <div className="flex gap-2">
                          <button 
                            onClick={() => handleTriggerImport(s.sectorId, s.label)}
                            className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 bg-emerald-600 text-white text-[10px] font-black rounded-xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-500/10"
                          >
                            <FileUp size={14} /> IMPORTAR EQUIPE
                          </button>
                          <button 
                            onClick={() => onOpenSector(s.sectorId)}
                            className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 bg-blue-600 text-white text-[10px] font-black rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/10"
                          >
                            <ExternalLink size={14} /> ABRIR SETOR
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
          {config.users.length === 0 && (
            <div className="py-20 text-center opacity-20">
               <Users size={64} className="mx-auto mb-4" />
               <p className="font-black uppercase tracking-[0.2em]">Nenhum usuário ativo</p>
            </div>
          )}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white dark:bg-slate-800 w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300">
            <div className="p-8 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
              <h3 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">{editingUser ? 'Ajustar Credenciais' : 'Novo Usuário'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 text-slate-400 hover:bg-slate-100 rounded-full transition-all"><X size={24}/></button>
            </div>
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Usuário</label>
                  <input required name="username" defaultValue={editingUser?.username} className="w-full bg-slate-50 dark:bg-slate-900 border-none px-5 py-3 rounded-2xl font-bold outline-none ring-1 ring-slate-100 dark:ring-slate-700 focus:ring-blue-500" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Senha</label>
                  <input required name="password" type="password" defaultValue={editingUser?.password} className="w-full bg-slate-50 dark:bg-slate-900 border-none px-5 py-3 rounded-2xl font-bold outline-none ring-1 ring-slate-100 dark:ring-slate-700 focus:ring-blue-500" />
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-700">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-widest">Quantidade de Setores</label>
                  <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-xl">
                    <button type="button" onClick={() => setNumSectors(1)} className={`px-4 py-1.5 rounded-lg text-xs font-black transition-all ${numSectors === 1 ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-sm' : 'text-slate-400'}`}>1</button>
                    <button type="button" onClick={() => setNumSectors(2)} className={`px-4 py-1.5 rounded-lg text-xs font-black transition-all ${numSectors === 2 ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-sm' : 'text-slate-400'}`}>2</button>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="p-5 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-700 space-y-3">
                    <p className="text-[9px] font-black text-blue-600 uppercase tracking-widest">Configuração Setor Principal</p>
                    <div className="grid grid-cols-2 gap-4">
                      <input value={s1Label} onChange={(e) => setS1Label(e.target.value)} placeholder="Nome do Setor" className="bg-white dark:bg-slate-800 border-none px-4 py-3 rounded-xl text-sm font-bold outline-none ring-1 ring-slate-100 dark:ring-slate-700 shadow-sm" />
                      <input type="number" value={s1Auth} onChange={(e) => setS1Auth(parseInt(e.target.value))} placeholder="Quadro Aut." className="bg-white dark:bg-slate-800 border-none px-4 py-3 rounded-xl text-sm font-bold outline-none ring-1 ring-slate-100 dark:ring-slate-700 shadow-sm" />
                    </div>
                  </div>

                  {numSectors === 2 && (
                    <div className="p-5 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-700 space-y-3 animate-in slide-in-from-top-2">
                      <p className="text-[9px] font-black text-indigo-600 uppercase tracking-widest">Configuração Setor Secundário</p>
                      <div className="grid grid-cols-2 gap-4">
                        <input value={s2Label} onChange={(e) => setS2Label(e.target.value)} placeholder="Nome do Setor" className="bg-white dark:bg-slate-800 border-none px-4 py-3 rounded-xl text-sm font-bold outline-none ring-1 ring-slate-100 dark:ring-slate-700 shadow-sm" />
                        <input type="number" value={s2Auth} onChange={(e) => setS2Auth(parseInt(e.target.value))} placeholder="Quadro Aut." className="bg-white dark:bg-slate-800 border-none px-4 py-3 rounded-xl text-sm font-bold outline-none ring-1 ring-slate-100 dark:ring-slate-700 shadow-sm" />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-4 flex gap-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 rounded-2xl bg-slate-100 dark:bg-slate-700 font-black text-slate-500 transition-all uppercase tracking-widest text-xs">CANCELAR</button>
                <button type="submit" className="flex-1 py-4 rounded-2xl bg-blue-600 text-white font-black shadow-xl shadow-blue-500/20 active:scale-95 transition-all flex items-center justify-center gap-2 uppercase tracking-widest text-xs"><Check size={20} /> FINALIZAR</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
