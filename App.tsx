
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Layers, 
  Calendar as CalendarIcon, 
  ClipboardCheck, 
  Settings,
  Sun,
  Moon,
  FileBarChart2,
  AlertCircle,
  CheckCircle,
  Wifi,
  WifiOff,
  Building2,
  LogOut,
  ShieldCheck,
  History,
  ChevronLeft,
  Cloud,
  RefreshCw,
  CloudOff,
  Database,
  Smartphone,
  Copyright
} from 'lucide-react';
import { syncWithCloud as firebaseSync, loadFromCloud as firebaseLoad } from './firebase';
import { Employee, CalendarEvent, AppConfig, EmployeeStatus, Sector, SectorData, User, AuditEntry, DeviceInfo } from './types';
import Dashboard from './components/Dashboard';
import EmployeeList from './components/EmployeeList';
import GroupManager from './components/GroupManager';
import TechnicalCleaning from './components/TechnicalCleaning';
import EventCalendar from './components/EventCalendar';
import AppSettings from './components/AppSettings';
import Reports from './components/Reports';
import Login from './components/Login';
import UserManagement from './components/UserManagement';
import AuditHistory from './components/AuditHistory';
import SyncedDevices from './components/SyncedDevices';

const BASE_STORAGE_KEY = 'gestaoquadro_sector_data_';
const GLOBAL_CONFIG_KEY = 'gestaoquadro_global_config';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeSector, setActiveSector] = useState<Sector>('sector1');
  const [activeTab, setActiveTab] = useState<'dashboard' | 'funcionarios' | 'groups' | 'calendar' | 'cleaning' | 'reports' | 'settings' | 'users' | 'history' | 'devices'>('dashboard');
  
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [syncStatus, setSyncStatus] = useState<'local' | 'syncing' | 'synced' | 'error'>('local');
  const [isSyncingInitial, setIsSyncingInitial] = useState(false);
  
  const [config, setConfig] = useState<AppConfig>(() => {
    const saved = localStorage.getItem(GLOBAL_CONFIG_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          authorizedCount: parsed.authorizedCount || 40,
          darkMode: parsed.darkMode ?? false,
          sectorName: parsed.sectorName || 'Setor 1',
          responsibleName: parsed.responsibleName || 'Supervisor',
          hideSector2: parsed.hideSector2 ?? false,
          users: parsed.users || [],
          auditLog: parsed.auditLog || [],
          cloudSyncId: parsed.cloudSyncId || null,
          isCloudMode: parsed.isCloudMode || false,
          syncedDevices: parsed.syncedDevices || []
        };
      } catch (e) { console.error(e); }
    }
    return { 
      authorizedCount: 40, 
      darkMode: false, 
      sectorName: 'Setor 1', 
      responsibleName: 'Supervisor', 
      hideSector2: false,
      users: [],
      auditLog: [],
      cloudSyncId: null,
      isCloudMode: false,
      syncedDevices: []
    };
  });

  const [notifications, setNotifications] = useState<{id: string, message: string, type: 'success' | 'info' | 'error'}[]>([]);

  const addNotification = useCallback((message: string, type: 'success' | 'info' | 'error' = 'success') => {
    const id = Math.random().toString(36).substr(2, 9);
    setNotifications(prev => [...prev, { id, message, type }]);
    setTimeout(() => setNotifications(prev => prev.filter(n => n.id !== id)), 4000);
  }, []);

  const syncWithCloud = useCallback(async (isInitial = false) => {
    if (!config.cloudSyncId || !isOnline) {
      setSyncStatus('local');
      return;
    }

    if (isInitial) setIsSyncingInitial(true);
    setSyncStatus('syncing');

    try {
      // Use Firebase instead of local API
      const result = await firebaseLoad(config.cloudSyncId);
      const remoteData = result.success ? result.data : null;

      if (isInitial && remoteData && remoteData.config) {
        // Update local state with remote data
        const remoteLastSync = remoteData.config.lastSync;
        
        setConfig(prev => ({
          ...prev,
          ...remoteData.config,
          users: remoteData.config.users || prev.users,
          auditLog: remoteData.config.auditLog || prev.auditLog,
          syncedDevices: remoteData.config.syncedDevices || prev.syncedDevices,
          lastSync: remoteLastSync || prev.lastSync
        }));
        
        if (remoteData.sectors && remoteData.sectors[activeSector]) {
          const sData = remoteData.sectors[activeSector];
          setEmployees(sData.employees || []);
          setEvents(sData.events || []);
        }

        addNotification('Dados sincronizados com Firebase!', 'success');
      } else {
        // Push local state to Firebase
        const allSectorsData: Record<string, any> = {};
        const sectors = Array.from(new Set([
          ...config.users.flatMap(u => u.sectors.map(s => s.sectorId)),
          activeSector
        ]));

        sectors.forEach(sId => {
          const saved = localStorage.getItem(`${BASE_STORAGE_KEY}${sId}`);
          if (saved) {
            try { allSectorsData[sId] = JSON.parse(saved); } catch(e) {}
          }
        });
        
        allSectorsData[activeSector] = { employees, events, config };

        const now = new Date().toISOString();
        const updatedConfig = { ...config, lastSync: now };

        const syncResult = await firebaseSync(config.cloudSyncId, {
          config: updatedConfig,
          sectors: allSectorsData
        });

        if (!syncResult.success) throw new Error('Firebase sync failed');

        setConfig(updatedConfig);
      }

      setSyncStatus('synced');
      if (isInitial) setIsSyncingInitial(false);
    } catch (err) {
      console.error('Sync error:', err);
      setSyncStatus('error');
      setIsSyncingInitial(false);
      addNotification('Falha na sincronização Firebase', 'error');
    }
  }, [config.cloudSyncId, isOnline, activeSector, employees, events, config, addNotification]);

  useEffect(() => {
    if (config.isCloudMode && config.cloudSyncId) {
      syncWithCloud(true);
    }
  }, [config.isCloudMode, config.cloudSyncId, syncWithCloud]);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    const storageKey = `${BASE_STORAGE_KEY}${activeSector}`;
    const savedData = localStorage.getItem(storageKey);
    const currentSectorConfig = currentUser?.sectors.find(s => s.sectorId === activeSector);
    
    if (savedData) {
      try {
        const parsed: SectorData = JSON.parse(savedData);
        setEmployees(parsed.employees || []);
        setEvents(parsed.events || []);
        setConfig(prev => ({
          ...prev,
          sectorName: currentSectorConfig?.label || parsed.config?.sectorName || 'Setor',
          authorizedCount: currentSectorConfig?.authorizedCount ?? 40,
        }));
      } catch (e) {}
    }
  }, [activeSector, currentUser]);

  useEffect(() => {
    const storageKey = `${BASE_STORAGE_KEY}${activeSector}`;
    localStorage.setItem(storageKey, JSON.stringify({ employees, events, config }));
    
    if (config.isCloudMode && syncStatus !== 'syncing') {
      const timer = setTimeout(() => syncWithCloud(), 2000);
      return () => clearTimeout(timer);
    }
  }, [employees, events, config, activeSector, syncWithCloud, config.isCloudMode, syncStatus]);

  useEffect(() => {
    localStorage.setItem(GLOBAL_CONFIG_KEY, JSON.stringify(config));
    const html = document.documentElement;
    if (config.darkMode) html.classList.add('dark');
    else html.classList.remove('dark');
  }, [config]);

  const addAuditEntry = useCallback((action: AuditEntry['action'], details: string) => {
    if (!currentUser) return;
    const newEntry: AuditEntry = {
      id: Math.random().toString(36).substr(2, 9),
      userId: currentUser.id,
      username: currentUser.username,
      action,
      details,
      sector: config.sectorName,
      timestamp: new Date().toISOString()
    };
    setConfig(prev => ({
      ...prev,
      auditLog: [newEntry, ...(prev.auditLog || [])].slice(0, 1000)
    }));
  }, [currentUser, config.sectorName]);

  const globalStats = useMemo(() => {
    if (currentUser?.role !== 'master') return null;
    const allSectors = new Set<string>();
    config.users.forEach(u => u.sectors.forEach(s => allSectors.add(s.sectorId)));
    let totalEmployeesCount = 0;
    allSectors.forEach(sectorId => {
      if (sectorId === activeSector) {
        totalEmployeesCount += employees.length;
      } else {
        const data = localStorage.getItem(`${BASE_STORAGE_KEY}${sectorId}`);
        if (data) {
          try {
            const parsed = JSON.parse(data);
            totalEmployeesCount += (parsed.employees || []).length;
          } catch (e) {}
        }
      }
    });
    return {
      totalSectors: allSectors.size,
      totalEmployees: totalEmployeesCount,
      totalUsers: config.users.length,
      isSystemOnline: isOnline
    };
  }, [config.users, isOnline, currentUser, employees, activeSector]);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    if (user.sectors?.length > 0) setActiveSector(user.sectors[0].sectorId);
    if (user.role === 'master') setActiveTab('dashboard');
    addNotification(`Acesso autorizado: ${user.username}`, 'success');

    const deviceName = /Mobi|Android|iPhone/i.test(navigator.userAgent) ? 'Mobile Device' : 'Desktop Terminal';
    const newDevice: DeviceInfo = {
      id: Math.random().toString(36).substr(2, 6).toUpperCase(),
      name: `${deviceName} (${navigator.platform})`,
      ip: '192.168.0.' + Math.floor(Math.random() * 255),
      location: 'Unidade Operacional Central',
      lastSeen: new Date().toISOString(),
      isOnline: true
    };

    setConfig(prev => ({
      ...prev,
      syncedDevices: [newDevice, ...(prev.syncedDevices || []).filter(d => d.name !== newDevice.name)].slice(0, 10)
    }));
  };

  return (
    <div className="flex flex-col md:flex-row h-full bg-slate-50 dark:bg-slate-950 overflow-hidden font-sans">
      
      {isSyncingInitial && (
        <div className="fixed inset-0 z-[100] bg-slate-900/80 backdrop-blur-md flex flex-col items-center justify-center text-white">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-6"></div>
          <h3 className="text-xl font-black uppercase tracking-widest">Sincronizando Nuvem</h3>
          <p className="text-slate-400 mt-2 font-medium">Limpando cache e atualizando lista de usuários...</p>
        </div>
      )}

      {!currentUser ? (
        <Login onLogin={handleLogin} config={config} onUpdateConfig={setConfig} />
      ) : (
        <>
          <aside className="hidden md:flex w-64 bg-slate-900 text-white flex-col h-screen sticky top-0 shrink-0 border-r border-white/5">
            <div className="px-4 py-10 flex flex-col items-center">
               <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center shadow-2xl mb-4 transition-transform hover:scale-110 active:scale-95 cursor-pointer">
                  <Building2 className="text-white" size={28} />
               </div>
            </div>
            <nav className="flex-1 px-3 space-y-1 overflow-y-auto custom-scrollbar">
              {(currentUser.role === 'master' ? [
                { id: 'dashboard', label: 'Painel', icon: <LayoutDashboard size={20} /> },
                { id: 'funcionarios', label: 'Equipe', icon: <Users size={20} /> },
                { id: 'users', label: 'Acessos ADM', icon: <ShieldCheck size={20} /> },
                { id: 'devices', label: 'Terminais', icon: <Smartphone size={20} /> },
                { id: 'history', label: 'Auditoria', icon: <History size={20} /> },
                { id: 'settings', label: 'Config', icon: <Settings size={20} /> },
              ] : [
                { id: 'dashboard', label: 'Painel', icon: <LayoutDashboard size={20} /> },
                { id: 'funcionarios', label: 'Equipe', icon: <Users size={20} /> },
                { id: 'groups', label: 'Grupos', icon: <Layers size={20} /> },
                { id: 'calendar', label: 'Agenda', icon: <CalendarIcon size={20} /> },
                { id: 'cleaning', label: 'Limpeza', icon: <ClipboardCheck size={20} /> },
                { id: 'reports', label: 'Relatos', icon: <FileBarChart2 size={20} /> },
                { id: 'settings', label: 'Config', icon: <Settings size={20} /> },
              ]).map((item) => (
                <button key={item.id} onClick={() => setActiveTab(item.id as any)} className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all ${activeTab === item.id ? 'bg-blue-600 shadow-lg text-white' : 'text-slate-400 hover:bg-slate-800'}`}>
                  {item.icon} <span className="font-bold text-sm">{item.label}</span>
                </button>
              ))}
            </nav>
            <div className="p-4 border-t border-white/5">
              <button onClick={() => setCurrentUser(null)} className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-rose-400 hover:bg-rose-500/10 transition-all font-bold text-sm mb-4">
                <LogOut size={20} /> Sair
              </button>
              <div className="flex flex-col items-center gap-1 opacity-30 select-none">
                <Copyright size={10} className="text-slate-400" />
                <span className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-500">2026 M.Guimarães</span>
              </div>
            </div>
          </aside>

          <main className="flex-1 flex flex-col min-h-0 relative h-full overflow-hidden">
            <header className="h-20 md:h-24 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 md:px-8 shrink-0 z-30 shadow-sm transition-colors">
              <div className="flex items-center gap-4">
                {activeTab !== 'users' && currentUser.role === 'master' && activeTab !== 'dashboard' && (
                  <button onClick={() => setActiveTab('dashboard')} className="p-2 text-slate-400 hover:text-blue-600 transition-colors">
                    <ChevronLeft size={24} />
                  </button>
                )}
                <h2 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-widest flex items-center gap-3">
                  {currentUser.role === 'master' ? 'Painel Administrativo' : config.sectorName}
                </h2>
              </div>
              
              <div className="flex items-center gap-4">
                <button onClick={() => syncWithCloud()} className="flex flex-col items-end mr-2 group">
                  <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Estado Remoto</span>
                  <div className="flex items-center gap-2">
                    {syncStatus === 'synced' && <span className="text-[9px] font-bold text-emerald-500 flex items-center gap-1 uppercase"><Cloud size={12}/> Disponível</span>}
                    {syncStatus === 'syncing' && <span className="text-[9px] font-bold text-blue-500 flex items-center gap-1 animate-pulse uppercase"><RefreshCw size={12} className="animate-spin"/> Atualizando</span>}
                    {syncStatus === 'local' && <span className="text-[9px] font-bold text-slate-400 flex items-center gap-1 uppercase"><CloudOff size={12}/> Offline</span>}
                    {syncStatus === 'error' && <span className="text-[9px] font-bold text-rose-500 flex items-center gap-1 uppercase"><AlertCircle size={12}/> Falha</span>}
                  </div>
                </button>

                <button onClick={() => setConfig({ ...config, darkMode: !config.darkMode })} className="p-2.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all">
                  {config.darkMode ? <Sun size={20} /> : <Moon size={20} />}
                </button>
                
                <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black text-sm shadow-xl shadow-blue-500/20">
                  {currentUser.username.charAt(0).toUpperCase()}
                </div>
              </div>
            </header>

            <div className="flex-1 overflow-y-auto overscroll-contain p-4 md:p-8 max-w-7xl mx-auto w-full pb-24 md:pb-8">
              {activeTab === 'dashboard' && <Dashboard employees={employees} config={config} events={events} onUpdateConfig={setConfig} isAdmin={currentUser.role === 'master'} globalStats={globalStats} />}
              {activeTab === 'funcionarios' && (
                <EmployeeList employees={employees} onUpdate={setEmployees} notify={addNotification} sectorName={config.sectorName} currentUser={currentUser} config={config} onSwitchSector={setActiveSector} onLog={addAuditEntry} />
              )}
              {activeTab === 'groups' && <GroupManager employees={employees} onUpdate={setEmployees} />}
              {activeTab === 'calendar' && <EventCalendar events={events} employees={employees} onUpdate={setEvents} />}
              {/* FIXED: Removed statusDate and added responsibleName required by TechnicalCleaningProps */}
              {activeTab === 'cleaning' && <TechnicalCleaning employees={employees} sectorName={config.sectorName} responsibleName={config.responsibleName} notify={addNotification} />}
              {activeTab === 'reports' && <Reports employees={employees} events={events} sectorName={config.sectorName} responsibleName={config.responsibleName} notify={addNotification} />}
              {activeTab === 'settings' && <AppSettings config={config} onUpdate={setConfig} notify={addNotification} currentUser={currentUser} onLogout={() => setCurrentUser(null)} />}
              {activeTab === 'users' && currentUser.role === 'master' && <UserManagement config={config} onUpdate={setConfig} notify={addNotification} onLog={addAuditEntry} onOpenSector={(s) => { setActiveSector(s); setActiveTab('dashboard'); }} />}
              {activeTab === 'history' && currentUser.role === 'master' && <AuditHistory auditLog={config.auditLog} />}
              {activeTab === 'devices' && currentUser.role === 'master' && <SyncedDevices devices={config.syncedDevices} cloudId={config.cloudSyncId} />}
              
              <div className="mt-16 mb-8 flex flex-col items-center gap-1 opacity-20 md:hidden">
                <Copyright size={12} className="text-slate-400" />
                <span className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-500">© 2026 M.Guimarães</span>
              </div>
            </div>

            <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center justify-around py-3 safe-pb z-50">
              {(currentUser.role === 'master' ? [
                { id: 'dashboard', label: 'Painel', icon: <LayoutDashboard size={20} /> },
                { id: 'funcionarios', label: 'Equipe', icon: <Users size={20} /> },
                { id: 'devices', label: 'Terminais', icon: <Smartphone size={20} /> },
                { id: 'settings', label: 'Config', icon: <Settings size={20} /> },
              ] : [
                { id: 'dashboard', label: 'Painel', icon: <LayoutDashboard size={20} /> },
                { id: 'funcionarios', label: 'Equipe', icon: <Users size={20} /> },
                { id: 'groups', label: 'Grupos', icon: <Layers size={20} /> },
                { id: 'calendar', label: 'Agenda', icon: <CalendarIcon size={20} /> },
              ]).map((item) => (
                <button key={item.id} onClick={() => setActiveTab(item.id as any)} className={`flex flex-col items-center gap-1 p-2 ${activeTab === item.id ? 'text-blue-600' : 'text-slate-400'}`}>
                  {item.icon}
                  <span className="text-[9px] font-black uppercase tracking-tighter">{item.label}</span>
                </button>
              ))}
            </nav>
          </main>
        </>
      )}

      <div className="fixed top-4 right-4 z-[100] space-y-2 pointer-events-none">
        {notifications.map(n => (
          <div key={n.id} className="p-4 rounded-2xl shadow-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center gap-3 animate-in slide-in-from-right duration-300 pointer-events-auto">
            {n.type === 'error' ? <AlertCircle className="text-rose-500" /> : <CheckCircle className="text-emerald-500" />}
            <span className="text-xs font-black text-slate-700 dark:text-white uppercase tracking-wider">{n.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default App;
