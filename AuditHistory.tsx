
import React, { useRef } from 'react';
import { Shield, Moon, Sun, Copyright, UserCheck, User, Building2, Save, Database, Download, Upload, AlertCircle, Cloud, Link, Share2, RefreshCw, Globe, Server, QrCode, Printer, Key, ShieldCheck, LogOut } from 'lucide-react';
import { AppConfig, User as UserType } from '../types';

interface AppSettingsProps {
  config: AppConfig;
  onUpdate: (config: AppConfig) => void;
  notify: (msg: string, type?: 'success' | 'error') => void;
  currentUser: UserType;
  onLogout: () => void;
}

const AppSettings: React.FC<AppSettingsProps> = ({ config, onUpdate, notify, currentUser, onLogout }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const generateSyncId = () => {
    const id = `PLANTA-${Math.random().toString(36).substr(2, 8).toUpperCase()}`;
    onUpdate({ ...config, cloudSyncId: id, isCloudMode: true });
    notify('Novo ID de Planta Gerado!');
  };

  const handleExportSystem = () => {
    const allData: Record<string, string> = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('gestaoquadro_')) {
        allData[key] = localStorage.getItem(key) || '';
      }
    }
    const blob = new Blob([JSON.stringify(allData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const date = new Date().toISOString().split('T')[0];
    a.href = url;
    a.download = `BACKUP_TOTAL_${date}.json`;
    a.click();
    notify('Backup consolidado gerado!');
  };

  const handleImportSystem = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = JSON.parse(evt.target?.result as string);
        Object.keys(data).forEach(key => localStorage.setItem(key, data[key]));
        notify('Base de dados restaurada!');
        setTimeout(() => window.location.reload(), 1000);
      } catch (err) {
        notify('Arquivo de backup inválido.', 'error');
      }
    };
    reader.readAsText(file);
  };

  const isAdmin = currentUser.role === 'master';

  if (isAdmin) {
    const qrUrl = config.cloudSyncId 
      ? `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${config.cloudSyncId}&margin=10&bgcolor=ffffff&color=2563eb`
      : null;

    return (
      <div className="max-w-4xl space-y-8 animate-in fade-in duration-500 pb-20">
        <div className="flex flex-col gap-2">
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight uppercase">Configurações Globais</h2>
          <p className="text-slate-500 font-medium font-sans">Controle de terminais e vinculação via QR Code.</p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] border-2 border-blue-600/20 shadow-xl overflow-hidden">
          <div className="p-8 md:p-12 space-y-10">
            <div className="flex flex-col md:flex-row items-center gap-10">
               <div className="shrink-0 flex flex-col items-center gap-4">
                  <div className="p-4 bg-white rounded-3xl shadow-2xl border border-slate-100 relative group">
                    {qrUrl ? (
                      <img src={qrUrl} alt="QR Code de Vinculação" className="w-48 h-48 md:w-56 md:h-56 rounded-xl" />
                    ) : (
                      <div className="w-48 h-48 md:w-56 md:h-56 bg-slate-50 rounded-xl flex items-center justify-center border-2 border-dashed border-slate-200">
                         <QrCode size={48} className="text-slate-300" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-blue-600/0 group-hover:bg-blue-600/5 transition-colors rounded-3xl" />
                  </div>
                  {qrUrl && (
                    <button 
                      onClick={() => window.print()}
                      className="flex items-center gap-2 text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline"
                    >
                      <Printer size={14} /> Imprimir QR Code
                    </button>
                  )}
               </div>

               <div className="flex-1 space-y-6 text-center md:text-left">
                  <div className="space-y-2">
                    <h3 className="text-2xl font-black uppercase tracking-tight">Vincular Novo Celular</h3>
                    <p className="text-sm text-slate-500 font-medium leading-relaxed">
                      Para autorizar um supervisor a acessar o sistema pelo celular, peça para ele clicar em **"Vincular ID da Planta"** na tela de login e escanear este código.
                    </p>
                  </div>

                  <div className="bg-blue-50 dark:bg-blue-900/10 p-5 rounded-2xl border border-blue-100 dark:border-blue-800/50 flex items-center gap-4">
                     <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white shrink-0">
                       <Key size={24} />
                     </div>
                     <div className="flex-1 min-w-0">
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">ID da Planta Ativo</p>
                       <p className="text-lg font-mono font-bold text-blue-600 truncate">{config.cloudSyncId || 'GERAR IDENTIFICADOR'}</p>
                     </div>
                     <button onClick={generateSyncId} className="p-3 bg-white dark:bg-slate-800 text-blue-600 rounded-xl hover:shadow-md transition-all active:scale-95">
                       <RefreshCw size={20} />
                     </button>
                  </div>
               </div>
            </div>

            <div className="pt-8 border-t border-slate-100 dark:border-slate-700 flex flex-wrap gap-4 justify-center md:justify-start">
               <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  <Globe size={14} className="text-emerald-500" /> Sincronização em tempo real ativa
               </div>
            </div>
          </div>
        </div>

        <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 p-10 opacity-10">
            <Database size={120} />
          </div>
          <div className="relative z-10 space-y-8">
            <div className="space-y-2">
              <h3 className="text-2xl font-black uppercase tracking-tight">Backup de Segurança</h3>
              <p className="text-slate-400 text-sm max-w-lg">Baixe o arquivo consolidado para restaurar o sistema em caso de troca de servidor ou limpeza de navegador.</p>
            </div>
            <div className="flex flex-wrap gap-4">
               <button onClick={handleExportSystem} className="px-8 py-4 bg-white/10 hover:bg-white/20 border border-white/20 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center gap-3">
                 <Download size={18} /> Exportar Tudo (.json)
               </button>
               <button onClick={() => fileInputRef.current?.click()} className="px-8 py-4 bg-blue-600 hover:bg-blue-700 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-xl shadow-blue-500/20 flex items-center gap-3">
                 <Upload size={18} /> Importar Backup
               </button>
               <input type="file" ref={fileInputRef} onChange={handleImportSystem} accept=".json" className="hidden" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-[2rem] border border-slate-200 dark:border-slate-700 shadow-sm p-8 flex items-center justify-between">
            <div className="space-y-1">
              <h4 className="font-bold text-slate-800 dark:text-white flex items-center gap-2 uppercase tracking-tight">
                {config.darkMode ? <Moon size={18} className="text-blue-500" /> : <Sun size={18} className="text-blue-500" />} Interface Visual
              </h4>
              <p className="text-sm text-slate-500">Alternar modo noturno ou claro.</p>
            </div>
            <button onClick={() => onUpdate({ ...config, darkMode: !config.darkMode })} className={`w-16 h-9 rounded-full transition-all flex items-center px-1.5 ${config.darkMode ? 'bg-blue-600' : 'bg-slate-200 dark:bg-slate-700'}`}>
              <div className={`w-6 h-6 bg-white rounded-full shadow-lg transition-transform ${config.darkMode ? 'translate-x-7' : 'translate-x-0'}`} />
            </button>
        </div>

        <div className="p-10 border border-dashed border-slate-200 dark:border-slate-700 rounded-[2.5rem] flex flex-col items-center text-center gap-4 bg-slate-50/50 dark:bg-slate-900/20">
            <div className="w-12 h-12 bg-slate-200 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-slate-400">
               <ShieldCheck size={24} />
            </div>
            <div>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mb-2">Informações do Sistema</p>
               <div className="flex items-center justify-center gap-2 text-slate-800 dark:text-white font-black text-sm uppercase tracking-widest">
                  <Copyright size={14} className="text-blue-600" /> 2026 M.Guimarães
               </div>
               <p className="text-[9px] text-slate-500 font-bold uppercase mt-2 tracking-tighter italic">Todos os direitos reservados • Versão 3.1.5</p>
            </div>
        </div>

        <div className="pt-4">
          <button 
            onClick={onLogout}
            className="w-full py-5 rounded-[2rem] bg-rose-50 dark:bg-rose-900/10 border border-rose-100 dark:border-rose-900/30 text-rose-600 dark:text-rose-400 font-black uppercase tracking-[0.2em] text-xs flex items-center justify-center gap-3 hover:bg-rose-100 dark:hover:bg-rose-900/20 transition-all active:scale-[0.98]"
          >
            <LogOut size={20} /> Encerrar Sessão
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-8 animate-in fade-in duration-500">
      <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] p-10 border border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="flex items-center gap-4 mb-8">
           <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-2xl flex items-center justify-center">
             <UserCheck size={24} />
           </div>
           <div>
             <h2 className="text-2xl font-black tracking-tight">Preferências do Supervisor</h2>
             <p className="text-slate-500 text-sm font-medium">Configure como o sistema aparece para você.</p>
           </div>
        </div>
        
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <h4 className="font-semibold text-slate-800 dark:text-white flex items-center gap-2 uppercase text-xs tracking-widest"><Building2 size={14} /> Nome do Setor</h4>
              <p className="text-xs text-slate-500">Identificação visível nos relatórios.</p>
            </div>
            <input type="text" value={config.sectorName} onChange={(e) => onUpdate({ ...config, sectorName: e.target.value })} className="w-full md:w-64 px-5 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 dark:bg-slate-900 outline-none focus:ring-2 focus:ring-blue-500 font-bold shadow-sm transition-all" />
          </div>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-6 border-t border-slate-50 dark:border-slate-800">
            <div className="space-y-1">
              <h4 className="font-semibold text-slate-800 dark:text-white flex items-center gap-2 uppercase text-xs tracking-widest"><User size={14} /> Nome Responsável</h4>
              <p className="text-xs text-slate-500">Exibido na assinatura da limpeza técnica.</p>
            </div>
            <input type="text" value={config.responsibleName} onChange={(e) => onUpdate({ ...config, responsibleName: e.target.value })} className="w-full md:w-64 px-5 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 dark:bg-slate-900 outline-none focus:ring-2 focus:ring-blue-500 font-bold shadow-sm transition-all" />
          </div>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-6 border-t border-slate-50 dark:border-slate-800">
            <div className="space-y-1">
              <h4 className="font-semibold text-slate-800 dark:text-white flex items-center gap-2 uppercase text-xs tracking-widest">{config.darkMode ? <Moon size={14} /> : <Sun size={14} />} Tema Visual</h4>
              <p className="text-xs text-slate-500">Melhorar legibilidade conforme iluminação.</p>
            </div>
            <button onClick={() => onUpdate({ ...config, darkMode: !config.darkMode })} className={`w-14 h-8 rounded-full transition-all flex items-center px-1 ${config.darkMode ? 'bg-blue-600' : 'bg-slate-200 dark:bg-slate-700'}`}>
              <div className={`w-6 h-6 bg-white rounded-full shadow-lg transition-transform ${config.darkMode ? 'translate-x-6' : 'translate-x-0'}`} />
            </button>
          </div>
        </div>
      </div>

      <div className="pt-4">
        <button 
          onClick={onLogout}
          className="w-full py-5 rounded-[2rem] bg-rose-50 dark:bg-rose-900/10 border border-rose-100 dark:border-rose-900/30 text-rose-600 dark:text-rose-400 font-black uppercase tracking-[0.2em] text-xs flex items-center justify-center gap-3 hover:bg-rose-100 dark:hover:bg-rose-900/20 transition-all active:scale-[0.98]"
        >
          <LogOut size={20} /> Encerrar Sessão
        </button>
      </div>
      
      <div className="mt-8 flex flex-col items-center gap-1 opacity-20 select-none">
          <Copyright size={14} className="text-slate-400" />
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500">© 2026 M.Guimarães</span>
      </div>
    </div>
  );
};

export default AppSettings;
