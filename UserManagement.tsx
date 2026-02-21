
import React, { useState, useEffect, useRef } from 'react';
import { Lock, User, Building2, ChevronRight, AlertCircle, ShieldCheck, Wifi, Cloud, RefreshCw, Smartphone, Globe, QrCode, X, Camera, Copyright, Keyboard, ArrowRight, CheckCircle } from 'lucide-react';
import { User as UserType, AppConfig } from '../types';
import { loadFromCloud } from '../firebase';

declare var Html5QrcodeScanner: any;

interface LoginProps {
  onLogin: (user: UserType) => void;
  config: AppConfig;
  onUpdateConfig: (config: AppConfig) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin, config, onUpdateConfig }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [manualSyncId, setManualSyncId] = useState('');
  const [syncTab, setSyncTab] = useState<'qr' | 'manual'>('qr');
  const scannerRef = useRef<any>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    await new Promise(resolve => setTimeout(resolve, 800));

    if (username === 'adm' && password === '311') {
      onLogin({ 
        id: 'master-adm', 
        username: 'adm', 
        role: 'master',
        sectors: [
          { sectorId: 'sector1', label: 'Setor 1', authorizedCount: 40 },
          { sectorId: 'sector2', label: 'Setor 2', authorizedCount: 40 }
        ]
      });
      setIsLoading(false);
      return;
    }

    const foundUser = config.users.find(u => u.username === username && u.password === password);
    if (foundUser) {
      onLogin(foundUser);
      setIsLoading(false);
      return;
    }

    setError('Acesso negado. Vincule este celular escaneando o QR Code no PC do Administrador.');
    setIsLoading(false);
  };

  const startScanner = () => {
    setIsScanning(true);
    setTimeout(() => {
      try {
        const scanner = new Html5QrcodeScanner("qr-reader", { 
          fps: 10, 
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0
        }, false);

        scanner.render((decodedText: string) => {
          handleScanSuccess(decodedText);
          scanner.clear();
        }, (err: any) => {});
        scannerRef.current = scanner;
      } catch (e) {
        console.error("Scanner fail:", e);
      }
    }, 300);
  };

  const handleScanSuccess = async (syncId: string) => {
    setIsScanning(false);
    setIsLoading(true);
    
    try {
      // Fetch real data from Firebase using the scanned ID
      const result = await loadFromCloud(syncId);
      
      if (result.success && result.data && result.data.config) {
        const remoteData = result.data;
        onUpdateConfig({
          ...config,
          ...remoteData.config,
          cloudSyncId: syncId,
          isCloudMode: true,
          users: remoteData.config.users || []
        });
        alert('Dispositivo vinculado com sucesso via Firebase! Todos os usuários agora podem logar neste aparelho.');
      } else {
        // If no data on Firebase yet, just set the ID
        onUpdateConfig({
          ...config,
          cloudSyncId: syncId,
          isCloudMode: true
        });
        alert('ID vinculado! Nenhuma configuração prévia encontrada no Firebase.');
      }
    } catch (err) {
      console.error('Sync error:', err);
      alert('Erro ao vincular dispositivo via Firebase. Verifique sua conexão.');
    } finally {
      setShowSyncModal(false);
      setIsLoading(false);
    }
  };

  const handleManualSync = () => {
    if (!manualSyncId.trim()) return;
    handleScanSuccess(manualSyncId.trim().toUpperCase());
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-white dark:bg-slate-950 font-sans selection:bg-blue-100 dark:selection:bg-blue-900/30">
      {/* Left Side: Branding/Visual */}
      <div className="hidden md:flex md:w-1/2 bg-slate-900 relative overflow-hidden items-center justify-center p-12">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-indigo-900/40 z-0" />
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-blue-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-indigo-500/10 rounded-full blur-[120px]" />
        
        <div className="relative z-10 max-w-lg text-center md:text-left">
          <div className="w-20 h-20 bg-blue-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-blue-500/20 mb-10 transform -rotate-6">
            <Building2 className="text-white" size={40} />
          </div>
          <h1 className="text-6xl font-black text-white tracking-tighter leading-[0.9] mb-6">
            GESTÃO DE <br />
            <span className="text-blue-500">QUADRO</span>
          </h1>
          <p className="text-slate-400 text-lg font-medium leading-relaxed mb-10">
            Sistema inteligente para otimização de processos, controle de equipes e gestão de limpeza técnica em tempo real.
          </p>
          
          <div className="grid grid-cols-2 gap-6">
            <div className="p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <ShieldCheck className="text-blue-500 mb-3" size={24} />
              <h4 className="text-white font-bold text-sm uppercase tracking-wider">Segurança</h4>
              <p className="text-slate-500 text-xs mt-1">Acesso criptografado e auditoria completa.</p>
            </div>
            <div className="p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <Cloud className="text-blue-500 mb-3" size={24} />
              <h4 className="text-white font-bold text-sm uppercase tracking-wider">Nuvem</h4>
              <p className="text-slate-500 text-xs mt-1">Sincronização instantânea entre dispositivos.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side: Login Form */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12 lg:p-20 relative">
        <div className="w-full max-w-md space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="md:hidden text-center mb-10">
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-xl shadow-blue-500/20 mx-auto mb-4 transform -rotate-6">
              <Building2 className="text-white" size={32} />
            </div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Gestão de Quadro</h1>
          </div>

          <div className="space-y-2">
            <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Bem-vindo</h2>
            <p className="text-slate-500 dark:text-slate-400 font-medium">Entre com suas credenciais para acessar o painel.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <div className="bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-800 p-4 rounded-2xl flex items-center gap-3 animate-shake">
                <AlertCircle className="text-rose-500 shrink-0" size={18} />
                <p className="text-[10px] font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider leading-tight">{error}</p>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] ml-1">Identificação</label>
              <div className="relative group">
                <User className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={20} />
                <input 
                  autoFocus
                  required
                  disabled={isLoading}
                  type="text" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl py-4.5 pl-14 pr-4 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-bold text-slate-800 dark:text-white disabled:opacity-50"
                  placeholder="Seu usuário"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] ml-1">Senha de Acesso</label>
              <div className="relative group">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={20} />
                <input 
                  required
                  disabled={isLoading}
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl py-4.5 pl-14 pr-4 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-bold text-slate-800 dark:text-white disabled:opacity-50"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-5 rounded-2xl font-black shadow-xl shadow-blue-500/20 transition-all flex items-center justify-center gap-3 group active:scale-[0.98] uppercase tracking-widest text-sm"
            >
              {isLoading ? (
                <>
                  <RefreshCw size={20} className="animate-spin" />
                  Autenticando...
                </>
              ) : (
                <>
                  Acessar Sistema
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="pt-10 border-t border-slate-100 dark:border-slate-800 flex flex-col items-center gap-6">
             <button 
               onClick={() => setShowSyncModal(true)}
               className="group flex items-center gap-3 px-6 py-3 rounded-2xl bg-slate-50 dark:bg-slate-900 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-all active:scale-95"
             >
               <QrCode size={20} className="group-hover:scale-110 transition-transform" />
               <span className="text-[10px] font-black uppercase tracking-widest">Vincular ID da Planta</span>
             </button>

             <div className="flex flex-col items-center gap-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5"><ShieldCheck size={14} className="text-blue-500"/> Segurança Ativa</div>
                  <div className="w-1 h-1 bg-slate-300 rounded-full" />
                  {config.cloudSyncId ? (
                    <div className="flex items-center gap-1.5 text-emerald-500"><Wifi size={14}/> {config.cloudSyncId}</div>
                  ) : (
                    <div className="flex items-center gap-1.5"><Globe size={14} className="text-slate-400"/> Base Local</div>
                  )}
                </div>
                <div className="flex items-center gap-1.5 opacity-50 select-none mt-2">
                  <Copyright size={12} className="text-slate-400" />
                  <span className="tracking-[0.2em]">2026 M.Guimarães</span>
                </div>
             </div>
          </div>
        </div>
      </div>

      {showSyncModal && (
        <div className="fixed inset-0 z-[100] bg-slate-900/90 backdrop-blur-xl flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-[3rem] w-full max-w-md p-10 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in zoom-in duration-300">
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <Cloud size={40} />
              </div>
              <h3 className="text-2xl font-black uppercase tracking-tight text-slate-900 dark:text-white">Sincronizar Dispositivo</h3>
              <p className="text-sm text-slate-500 font-medium mt-2 leading-relaxed">
                Escolha como deseja vincular este celular à sua planta industrial.
              </p>
            </div>

            <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl mb-8">
              <button 
                onClick={() => setSyncTab('qr')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${syncTab === 'qr' ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-sm' : 'text-slate-500'}`}
              >
                <Camera size={16} /> QR Code
              </button>
              <button 
                onClick={() => setSyncTab('manual')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${syncTab === 'manual' ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-sm' : 'text-slate-500'}`}
              >
                <Keyboard size={16} /> Manual
              </button>
            </div>
            
            <div className="mb-10">
              {syncTab === 'qr' ? (
                <div className="relative bg-slate-900 rounded-[2rem] overflow-hidden aspect-square border-4 border-blue-600/20">
                  {!isScanning ? (
                    <button 
                      onClick={startScanner}
                      className="absolute inset-0 w-full h-full flex flex-col items-center justify-center gap-4 text-white hover:bg-white/5 transition-all"
                    >
                      <QrCode size={64} className="text-blue-500" />
                      <span className="text-[10px] font-black uppercase tracking-widest">Ativar Câmera</span>
                    </button>
                  ) : (
                    <div id="qr-reader" className="w-full h-full"></div>
                  )}
                </div>
              ) : (
                <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">ID da Planta</label>
                    <input 
                      type="text"
                      value={manualSyncId}
                      onChange={(e) => setManualSyncId(e.target.value.toUpperCase())}
                      placeholder="EX: PLANTA-ABC12345"
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl py-5 px-6 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-mono font-bold text-slate-800 dark:text-white text-center text-lg"
                    />
                  </div>
                  <button 
                    onClick={handleManualSync}
                    disabled={!manualSyncId.trim() || isLoading}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 dark:disabled:bg-slate-800 text-white py-5 rounded-2xl font-black shadow-xl shadow-blue-500/20 transition-all flex items-center justify-center gap-3 uppercase tracking-widest text-xs"
                  >
                    {isLoading ? <RefreshCw size={18} className="animate-spin" /> : <CheckCircle size={18} />}
                    Vincular Manualmente
                  </button>
                </div>
              )}
            </div>
            
            <div className="flex flex-col gap-4">
              <button 
                onClick={() => {
                  if(scannerRef.current) scannerRef.current.clear();
                  setShowSyncModal(false);
                  setIsScanning(false);
                }} 
                className="w-full py-4 rounded-2xl bg-slate-100 dark:bg-slate-800 text-[10px] font-black uppercase text-slate-500 tracking-widest active:scale-95 transition-all"
              >
                Voltar
              </button>
              <p className="text-[9px] text-center text-slate-400 uppercase font-bold tracking-tighter italic">
                O ID pode ser encontrado no computador do Administrador em Configurações &gt; Globais.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
