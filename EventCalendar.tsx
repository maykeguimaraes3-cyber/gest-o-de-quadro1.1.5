
import React from 'react';
import { FileText, Download, Users, Layers, Calendar, ClipboardCheck, Building2, Share2 } from 'lucide-react';
import { Employee, CalendarEvent, EmployeeStatus, EmployeeRole } from '../types';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface ReportsProps {
  employees: Employee[];
  events: CalendarEvent[];
  sectorName: string;
  responsibleName: string;
  notify: (msg: string, type?: 'success' | 'info' | 'error') => void;
}

const Reports: React.FC<ReportsProps> = ({ employees, events, sectorName, responsibleName, notify }) => {
  
  const generatePDF = async (title: string, data: any[][], headers: string[]) => {
    try {
      const doc = new jsPDF();
      const dateStr = new Date().toLocaleDateString('pt-BR');
      const filename = `${title.toLowerCase().replace(/ /g, '_')}_${dateStr.replace(/\//g, '-')}.pdf`;
      
      // Header
      doc.setFontSize(22);
      doc.setTextColor(37, 99, 235);
      doc.text(title, 14, 25);
      
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(`Setor: ${sectorName}`, 14, 33);
      doc.text(`Responsável: ${responsibleName}`, 14, 38);
      doc.text(`Data de Emissão: ${dateStr}`, 14, 43);
      
      autoTable(doc, {
        startY: 50,
        head: [headers],
        body: data,
        theme: 'grid',
        headStyles: { fillColor: [37, 99, 235], textColor: 255, fontSize: 10, fontStyle: 'bold' },
        styles: { fontSize: 9, cellPadding: 3 },
        didDrawPage: (data) => {
          doc.setFontSize(8);
          doc.setTextColor(150);
          doc.text('© 2026 M.Guimarães - Gestão de Quadro', data.settings.margin.left, doc.internal.pageSize.height - 10);
        }
      });
      
      const pdfBlob = doc.output('blob');
      const file = new window.File([pdfBlob], filename, { type: 'application/pdf' });

      // Tenta compartilhar nativamente (melhor para mobile)
      if (window.navigator.share) {
        await window.navigator.share({
          files: [file],
          title: title,
          text: `Relatório exportado do sistema Gestão de Quadro - ${sectorName}`
        });
        notify('Relatório compartilhado com sucesso');
      } else {
        // Fallback para download padrão
        doc.save(filename);
        notify('Relatório baixado no dispositivo');
      }
    } catch (error) {
      console.error(error);
      notify('Erro ao gerar relatório', 'error');
    }
  };

  const reportTypes = [
    {
      id: 'general',
      title: 'Lista Geral de Funcionários',
      description: 'Todos os funcionários cadastrados com status e função.',
      icon: <Users className="text-blue-500" size={28} />,
      action: () => {
        const headers = ['Matrícula', 'Nome', 'Função', 'Grupo', 'Status'];
        const data = employees.map(e => [e.registration, e.name, e.role, e.group, e.status]);
        generatePDF('Lista Geral de Equipe', data, headers);
      }
    },
    {
      id: 'cleaning',
      title: 'Relatório Limpeza Técnica',
      description: 'Apenas funcionários atualmente trabalhando no turno.',
      icon: <ClipboardCheck className="text-emerald-500" size={28} />,
      action: () => {
        const headers = ['Matrícula', 'Nome', 'Função', 'Grupo'];
        const working = employees.filter(e => e.status === EmployeeStatus.TRABALHANDO);
        const data = working.map(e => [e.registration, e.name, e.role, e.group]);
        generatePDF('Relatório de Limpeza Técnica', data, headers);
      }
    },
    {
      id: 'events',
      title: 'Agenda de Eventos',
      description: 'Compromissos e treinamentos agendados para o mês.',
      icon: <Calendar className="text-indigo-500" size={28} />,
      action: () => {
        const headers = ['Data', 'Hora', 'Evento', 'Tipo', 'Descrição'];
        const data = events
          .sort((a,b) => a.date.localeCompare(b.date))
          .map(e => [new Date(e.date).toLocaleDateString('pt-BR'), e.time, e.title, e.type, e.description]);
        generatePDF('Calendário de Eventos', data, headers);
      }
    },
    {
      id: 'vacations',
      title: 'Controle de Férias/Afastamentos',
      description: 'Funcionários ausentes ou em processo de desligamento.',
      icon: <FileText className="text-rose-500" size={28} />,
      action: () => {
        const headers = ['Nome', 'Status', 'Início/Alteração', 'Função'];
        const absent = employees.filter(e => e.status !== EmployeeStatus.TRABALHANDO);
        const data = absent.map(e => [e.name, e.status, new Date(e.statusDate).toLocaleDateString('pt-BR'), e.role]);
        generatePDF('Relatório de Ausências e Avisos', data, headers);
      }
    }
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reportTypes.map((report) => (
          <div key={report.id} className="bg-white dark:bg-slate-800 p-8 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col justify-between group hover:shadow-xl transition-all card-hover">
            <div>
              <div className="w-14 h-14 rounded-2xl bg-slate-50 dark:bg-slate-700/50 flex items-center justify-center mb-6 transition-transform group-hover:scale-110">
                {report.icon}
              </div>
              <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">{report.title}</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-8 leading-relaxed">
                {report.description}
              </p>
            </div>
            <button 
              onClick={report.action}
              className="w-full py-4 bg-slate-900 dark:bg-blue-600 hover:bg-slate-800 dark:hover:bg-blue-700 text-white rounded-2xl font-bold flex items-center justify-center gap-3 transition-all shadow-lg"
            >
              <Share2 size={20} /> COMPARTILHAR PDF
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Reports;
