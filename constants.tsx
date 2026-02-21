
import React from 'react';
import { 
  Users, 
  LayoutDashboard, 
  Layers, 
  Calendar as CalendarIcon, 
  Settings, 
  ClipboardCheck,
  Briefcase,
  AlertTriangle,
  Umbrella,
  Clock
} from 'lucide-react';
import { EmployeeStatus, EmployeeRole, EventType } from './types';

export const GROUPS = [1, 2, 3, 4, 5, 6, 7];

export const STATUS_COLORS = {
  [EmployeeStatus.TRABALHANDO]: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  [EmployeeStatus.FERIAS]: 'bg-amber-100 text-amber-700 border-amber-200',
  [EmployeeStatus.AFASTADO]: 'bg-rose-100 text-rose-700 border-rose-200',
  [EmployeeStatus.AVISO_PREVIO]: 'bg-orange-100 text-orange-700 border-orange-200',
  [EmployeeStatus.LICENCA]: 'bg-blue-100 text-blue-700 border-blue-200',
};

export const ROLE_ICONS = {
  [EmployeeRole.AUXILIAR]: <Briefcase className="w-4 h-4" />,
  [EmployeeRole.OPERADOR]: <Settings className="w-4 h-4" />,
  [EmployeeRole.ASSISTENTE]: <Users className="w-4 h-4" />,
  [EmployeeRole.SUPERVISOR]: <ClipboardCheck className="w-4 h-4" />,
};

export const EVENT_TYPE_COLORS = {
  [EventType.REUNIAO]: 'bg-blue-500',
  [EventType.TREINAMENTO]: 'bg-emerald-500',
  [EventType.VISITA]: 'bg-orange-500',
  [EventType.MANUTENCAO]: 'bg-rose-500',
  [EventType.OUTRO]: 'bg-slate-500',
};
