
export enum EmployeeRole {
  AUXILIAR = 'Auxiliar',
  OPERADOR = 'Operador',
  ASSISTENTE = 'Assistente',
  SUPERVISOR = 'Supervisor'
}

export enum EmployeeStatus {
  TRABALHANDO = 'Trabalhando',
  FERIAS = 'Férias',
  AFASTADO = 'Afastado',
  AVISO_PREVIO = 'Aviso Prévio',
  LICENCA = 'Licença'
}

export enum EventType {
  REUNIAO = 'reunião',
  TREINAMENTO = 'treinamento',
  VISITA = 'visita',
  MANUTENCAO = 'manutenção',
  OUTRO = 'outro'
}

export type Sector = string;

export interface UserSectorConfig {
  sectorId: Sector;
  label: string;
  authorizedCount: number;
}

export interface AuditEntry {
  id: string;
  userId: string;
  username: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN';
  details: string;
  sector: string;
  timestamp: string;
}

export interface DeviceInfo {
  id: string;
  name: string;
  ip: string;
  location: string;
  lastSeen: string;
  isOnline: boolean;
}

export interface User {
  id: string;
  username: string;
  password?: string;
  role: 'master' | 'sector';
  sectors: UserSectorConfig[];
}

export interface Employee {
  id: string;
  group: number;
  registration: string;
  name: string;
  role: EmployeeRole;
  status: EmployeeStatus;
  statusDate: string;
  contact?: {
    phone: string;
    email: string;
  };
  createdAt: string;
}

export interface CalendarEvent {
  id: string;
  employeeId?: string;
  date: string;
  time: string;
  type: EventType;
  title: string;
  description: string;
}

export interface AppConfig {
  authorizedCount: number;
  darkMode: boolean;
  sectorName: string;
  responsibleName: string;
  hideSector2: boolean;
  users: User[];
  auditLog: AuditEntry[];
  cloudSyncId: string | null;
  isCloudMode: boolean;
  lastSync?: string;
  syncedDevices: DeviceInfo[];
}

export interface SectorData {
  employees: Employee[];
  events: CalendarEvent[];
  config: AppConfig;
}
