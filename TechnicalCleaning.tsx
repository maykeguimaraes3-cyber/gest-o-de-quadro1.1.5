
import React from 'react';
import { Smartphone, Monitor, Globe, Clock, ShieldCheck, Wifi, ExternalLink, MapPin } from 'lucide-react';
import { DeviceInfo } from '../types';

interface SyncedDevicesProps {
  devices: DeviceInfo[];
  cloudId: string | null;
}

const SyncedDevices: React.FC<SyncedDevicesProps> = ({ devices, cloudId }) => {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
          <Smartphone className="text-blue-600" size={28} /> Terminais Sincronizados
        </h2>
        <p className="text-slate-500 dark:text-slate-400 font-medium font-sans">
          Monitoramento de dispositivos ativos vinculados ao ID da Planta: <span className="text-blue-600 font-black">{cloudId || 'NÃO VINCULADO'}</span>
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {devices.map((device) => (
          <div key={device.id} className="bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-700 shadow-sm relative overflow-hidden group hover:shadow-2xl hover:-translate-y-1 transition-all">
             <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform duration-700">
               {device.name.includes('Mobile') ? <Smartphone size={80} /> : <Monitor size={80} />}
             </div>

             <div className="relative z-10 space-y-6">
                <div className="flex items-center justify-between">
                   <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 ${device.isOnline ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${device.isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
                      {device.isOnline ? 'Conectado' : 'Offline'}
                   </div>
                   <span className="text-[10px] font-black text-slate-300 font-mono">ID: {device.id}</span>
                </div>

                <div>
                   <h3 className="text-lg font-bold text-slate-800 dark:text-white leading-tight mb-1">{device.name}</h3>
                   <div className="flex items-center gap-2 text-slate-400 text-xs font-medium">
                      <Wifi size={14} className="text-blue-500" /> {device.ip}
                   </div>
                </div>

                <div className="pt-6 border-t border-slate-50 dark:border-slate-700 space-y-3">
                   <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400">
                      <MapPin size={16} className="text-slate-300" />
                      <span className="text-xs font-bold uppercase tracking-tight">{device.location}</span>
                   </div>
                   <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400">
                      <Clock size={16} className="text-slate-300" />
                      <span className="text-xs font-medium">Último acesso: {new Date(device.lastSeen).toLocaleString('pt-BR')}</span>
                   </div>
                </div>

                <button className="w-full py-3 bg-slate-50 dark:bg-slate-900 hover:bg-rose-50 dark:hover:bg-rose-900/20 text-slate-400 hover:text-rose-600 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">
                   Revogar Acesso Remoto
                </button>
             </div>
          </div>
        ))}

        {devices.length === 0 && (
          <div className="col-span-full py-24 bg-slate-100 dark:bg-slate-900/50 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-[3rem] text-center">
             <div className="w-16 h-16 bg-white dark:bg-slate-800 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm">
                <Smartphone className="text-slate-300" size={32} />
             </div>
             <p className="text-slate-400 font-bold italic tracking-wide">Nenhum terminal remoto detectado no momento.</p>
          </div>
        )}
      </div>

      <div className="bg-blue-600 rounded-[2.5rem] p-10 text-white relative overflow-hidden shadow-2xl">
         <div className="absolute top-[-20%] right-[-10%] w-64 h-64 bg-white/10 rounded-full blur-[80px]" />
         <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
            <div className="w-20 h-20 bg-white/10 rounded-3xl flex items-center justify-center backdrop-blur-md border border-white/20">
               <ShieldCheck size={40} />
            </div>
            <div className="flex-1 text-center md:text-left">
               <h3 className="text-2xl font-black uppercase tracking-tight mb-2">Segurança de Ponto a Ponto</h3>
               <p className="text-blue-100 text-sm font-medium leading-relaxed max-w-2xl">
                  Cada terminal sincronizado possui uma chave de criptografia única. Se um dispositivo for perdido ou o acesso for indevido, você pode revogar a conexão instantaneamente através deste painel administrativo.
               </p>
            </div>
            <button className="px-8 py-4 bg-white text-blue-600 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:scale-105 active:scale-95 transition-all">
               Gerenciar Certificados
            </button>
         </div>
      </div>
    </div>
  );
};

export default SyncedDevices;
