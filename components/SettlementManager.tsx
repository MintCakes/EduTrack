
import React, { useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { Download, Calculator, Sparkles, Loader2, ChevronDown, ChevronLeft, ChevronRight, ChevronUp, X, FileText, Calendar, BookOpen } from 'lucide-react';
import { Student, ClassRecord, PriceRule, StudentSettlement, Subject } from '../types';
import { calculateSettlement } from '../services/calculator';
import { generateParentMessage } from '../services/geminiService';

interface SettlementManagerProps {
  students: Student[];
  records: ClassRecord[];
  priceRules: PriceRule[];
}

const SettlementManager: React.FC<SettlementManagerProps> = ({ students, records, priceRules }) => {
  const [generatedMessage, setGeneratedMessage] = useState<{id: string, text: string} | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  
  // Date State for Settlement Period
  const today = new Date();
  const [selectedMonth, setSelectedMonth] = useState(today.getMonth());
  const [selectedYear, setSelectedYear] = useState(today.getFullYear());

  // Rule Selection
  const activeRule = priceRules.find(r => r.isActive) || priceRules[0];
  const [selectedRuleId, setSelectedRuleId] = useState<string>(activeRule?.id || '');

  // Accordion State
  const [expandedStudentId, setExpandedStudentId] = useState<string | null>(null);

  // Detail Modal State
  const [detailModalData, setDetailModalData] = useState<{student: Student, subject: Subject, items: ClassRecord[]} | null>(null);

  // Helper: Month Navigation
  const handlePrevMonth = () => {
    if (selectedMonth === 0) {
      setSelectedMonth(11);
      setSelectedYear(y => y - 1);
    } else {
      setSelectedMonth(m => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonth === 11) {
      setSelectedMonth(0);
      setSelectedYear(y => y + 1);
    } else {
      setSelectedMonth(m => m + 1);
    }
  };

  // Computation
  const selectedRule = priceRules.find(r => r.id === selectedRuleId) || activeRule;

  const settlements = useMemo(() => {
    if (!selectedRule) return [];
    
    // Filter records for the selected month FIRST
    const monthlyRecords = records.filter(r => {
        const d = new Date(r.date);
        return d.getMonth() === selectedMonth && d.getFullYear() === selectedYear;
    });

    return students.map(s => {
      // Pass only the records for this specific student AND specific month
      const studentRecords = monthlyRecords.filter(r => r.studentId === s.id);
      return calculateSettlement(s, studentRecords, selectedRule);
    }).filter(s => s.totalAmount > 0 || s.totalHours > 0); // Only show active students
  }, [students, records, selectedRule, selectedMonth, selectedYear]);

  const totalRevenue = settlements.reduce((acc, s) => acc + s.totalAmount, 0);

  // Handlers
  const handleGenerateMessage = async (e: React.MouseEvent, settlement: StudentSettlement) => {
    e.stopPropagation(); // Prevent accordion toggle
    setLoadingId(settlement.student.id);
    const msg = await generateParentMessage(settlement);
    setGeneratedMessage({ id: settlement.student.id, text: msg });
    setLoadingId(null);
  };

  const handleExportCSV = () => {
    const headers = ['学生姓名', '年级', '总课时', '总费用', '详情(科目/单价/课本费)'];
    const rows = settlements.map(s => [
      s.student.name,
      s.student.grade,
      s.totalHours,
      s.totalAmount,
      s.items.map(i => `${i.subject}(${i.totalHours}课时*¥${i.pricePerHour}+¥${i.materialFeeTotal})`).join('; ')
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    // Add BOM for Chinese character support in Excel
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `课程结算_${selectedYear}年${selectedMonth + 1}月.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const toggleAccordion = (studentId: string) => {
      if (expandedStudentId === studentId) {
          setExpandedStudentId(null);
      } else {
          setExpandedStudentId(studentId);
      }
  };

  const handleSubjectClick = (student: Student, subject: Subject, e: React.MouseEvent) => {
      e.stopPropagation();
      const relevantRecords = records.filter(r => 
          r.studentId === student.id && 
          r.subject === subject &&
          new Date(r.date).getMonth() === selectedMonth &&
          new Date(r.date).getFullYear() === selectedYear
      ).sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      
      setDetailModalData({ student, subject, items: relevantRecords });
  };

  // Render Portal for Details
  const renderDetailModal = () => {
      if (!detailModalData) return null;
      return createPortal(
        <div className="fixed inset-0 bg-zinc-900/40 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
             <div className="absolute inset-0" onClick={() => setDetailModalData(null)} />
             <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg animate-fade-in-up overflow-hidden max-h-[80vh] flex flex-col relative z-10">
                <div className="p-5 border-b border-zinc-100 flex justify-between items-center bg-zinc-50 shrink-0">
                    <div>
                        <h3 className="font-bold text-lg text-zinc-900 flex items-center gap-2">
                             {detailModalData.student.name} - {detailModalData.subject}
                        </h3>
                        <p className="text-xs text-zinc-500 mt-1">{selectedYear}年{selectedMonth + 1}月 上课明细</p>
                    </div>
                    <button onClick={() => setDetailModalData(null)} className="text-zinc-400 hover:text-zinc-600 bg-white p-2 rounded-full shadow-sm"><X size={20}/></button>
                </div>
                
                <div className="p-5 overflow-y-auto custom-scrollbar flex-1 space-y-3">
                    {detailModalData.items.length === 0 ? (
                        <div className="text-center text-zinc-400 py-8">无记录</div>
                    ) : (
                        detailModalData.items.map(r => (
                            <div key={r.id} className="flex justify-between items-center p-3 rounded-xl border border-zinc-100 hover:bg-zinc-50 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="bg-zinc-100 p-2 rounded-lg text-zinc-500">
                                        <Calendar size={16} />
                                    </div>
                                    <div>
                                        <p className="font-bold text-zinc-800 text-sm">{r.date}</p>
                                        <p className="text-xs text-zinc-400">
                                            {r.status === 'present' ? '正常到课' : '请假/缺勤'}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className={`inline-block px-2 py-1 rounded-md text-xs font-bold ${r.status === 'present' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                                        {r.count} 课时
                                    </span>
                                    {r.materialFee > 0 && <p className="text-[10px] text-orange-500 mt-1">+¥{r.materialFee} 课本</p>}
                                </div>
                            </div>
                        ))
                    )}
                </div>
                <div className="p-4 bg-zinc-50 border-t border-zinc-100 text-center text-xs text-zinc-400 shrink-0">
                    共 {detailModalData.items.reduce((acc, r) => acc + (r.status === 'present' ? r.count : 0), 0)} 有效课时
                </div>
             </div>
        </div>,
        document.body
      );
  };

  return (
    <div className="space-y-8 animate-fade-in-up">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 mb-8">
        <div>
          <h2 className="text-3xl font-bold text-zinc-900 tracking-tight">费用结算</h2>
          <p className="text-zinc-500 mt-2">生成月度学费结算单，支持一键导出与通知。</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-stretch gap-4 w-full lg:w-auto">
            {/* Month Selector */}
            <div className="bg-white border border-zinc-200 rounded-2xl p-1.5 flex items-center justify-between shadow-sm min-w-[160px]">
                 <button onClick={handlePrevMonth} className="p-2 hover:bg-zinc-50 rounded-xl text-zinc-400 hover:text-zinc-600 transition-colors"><ChevronLeft size={20}/></button>
                 <div className="text-center">
                     <div className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">{selectedYear}年</div>
                     <div className="text-sm font-bold text-zinc-900">{selectedMonth + 1}月</div>
                 </div>
                 <button onClick={handleNextMonth} className="p-2 hover:bg-zinc-50 rounded-xl text-zinc-400 hover:text-zinc-600 transition-colors"><ChevronRight size={20}/></button>
            </div>

            {/* Price Rule Selector */}
            <div className="bg-white border border-zinc-200 rounded-2xl px-4 py-2 flex items-center gap-3 shadow-sm flex-1 lg:flex-none min-w-[220px]">
                <div className="bg-emerald-50 text-emerald-600 p-2 rounded-lg">
                    <Calculator size={18} />
                </div>
                <div className="flex flex-col flex-1">
                    <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">计费标准</span>
                    <div className="relative">
                         <select 
                            className="bg-transparent outline-none text-sm font-bold text-zinc-900 w-full appearance-none cursor-pointer pr-4"
                            value={selectedRuleId}
                            onChange={(e) => setSelectedRuleId(e.target.value)}
                        >
                            {priceRules.map(r => (
                                <option key={r.id} value={r.id}>
                                    {r.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
                 <ChevronDown size={14} className="text-zinc-300 pointer-events-none"/>
            </div>
            
            {/* Export Button */}
            <button 
                onClick={handleExportCSV}
                className="bg-zinc-900 hover:bg-zinc-800 text-white px-6 py-3 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-zinc-200 transition-all active:scale-95 font-bold"
            >
                <Download size={18} /> 
                <span className="whitespace-nowrap">导出报表</span>
            </button>
        </div>
      </div>

      {/* Summary Card */}
      <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-3xl p-8 text-white shadow-xl shadow-emerald-200 flex flex-col md:flex-row justify-between items-center gap-6">
        <div>
            <p className="text-emerald-100 font-medium mb-1">{selectedYear}年{selectedMonth + 1}月 总营收</p>
            <h3 className="text-5xl font-bold tracking-tight">¥{totalRevenue.toLocaleString()}</h3>
        </div>
        <div className="bg-white/10 backdrop-blur-sm p-4 rounded-2xl border border-white/20 flex gap-8">
            <div>
                <p className="text-emerald-100 text-xs uppercase tracking-wider font-bold">结算人数</p>
                <p className="text-2xl font-bold">{settlements.length}</p>
            </div>
             <div className="w-px bg-white/20"></div>
            <div>
                <p className="text-emerald-100 text-xs uppercase tracking-wider font-bold">计费版本</p>
                <p className="text-lg font-medium truncate max-w-[150px]">{selectedRule?.name}</p>
            </div>
        </div>
      </div>

      {/* Settlement List */}
      <div className="space-y-4">
        {settlements.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl border border-zinc-100 text-zinc-400">
                <FileText size={48} className="mx-auto mb-4 opacity-20" />
                <p>本月暂无结算数据</p>
            </div>
        ) : (
            settlements.map((item) => (
            <div key={item.student.id} className="bg-white rounded-2xl shadow-[0_2px_10px_rgb(0,0,0,0.02)] border border-zinc-100 overflow-hidden transition-all hover:shadow-md">
                
                {/* Header (Always Visible) */}
                <div 
                    className="p-5 flex flex-col md:flex-row items-center justify-between gap-4 cursor-pointer hover:bg-zinc-50/50 transition-colors"
                    onClick={() => toggleAccordion(item.student.id)}
                >
                    <div className="flex items-center gap-4 w-full md:w-auto">
                         <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white shadow-sm ${item.student.isOldStudent ? 'bg-orange-400' : 'bg-emerald-500'}`}>
                            {item.student.name[0]}
                        </div>
                        <div>
                            <h4 className="text-lg font-bold text-zinc-900">{item.student.name}</h4>
                            <div className="flex items-center gap-2 text-xs text-zinc-500">
                                <span>{item.student.grade}</span>
                                {item.student.isOldStudent && <span className="text-orange-600 bg-orange-50 px-1.5 rounded">老生</span>}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end">
                        <div className="text-right">
                            <p className="text-2xl font-bold text-emerald-600">¥{item.totalAmount}</p>
                            <p className="text-xs text-zinc-400">{item.totalHours} 总课时</p>
                        </div>
                        
                        <div className="flex gap-2">
                             <button
                                onClick={(e) => handleGenerateMessage(e, item)}
                                className="p-2.5 text-zinc-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all relative group"
                                title="生成通知"
                             >
                                {loadingId === item.student.id ? <Loader2 size={20} className="animate-spin text-emerald-600"/> : <Sparkles size={20} />}
                            </button>
                            <button className="p-2 text-zinc-300">
                                {expandedStudentId === item.student.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Expanded Details */}
                {expandedStudentId === item.student.id && (
                    <div className="px-5 pb-6 pt-2 border-t border-zinc-50 bg-zinc-50/30 animate-fade-in">
                        {/* Table */}
                        <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-white mb-4">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-zinc-50 text-zinc-500 font-medium text-xs uppercase">
                                    <tr>
                                        <th className="px-4 py-3">科目</th>
                                        <th className="px-4 py-3 text-right">课时数</th>
                                        <th className="px-4 py-3 text-right">单价</th>
                                        <th className="px-4 py-3 text-right">课本费</th>
                                        <th className="px-4 py-3 text-right">小计</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-100">
                                    {item.items.map((sub, idx) => (
                                        <tr 
                                            key={idx} 
                                            className="text-zinc-700 hover:bg-zinc-50 cursor-pointer transition-colors group"
                                            onClick={(e) => handleSubjectClick(item.student, sub.subject, e)}
                                        >
                                            <td className="px-4 py-3 font-medium flex items-center gap-2">
                                                {sub.subject}
                                                <BookOpen size={14} className="text-zinc-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                                            </td>
                                            <td className="px-4 py-3 text-right">{sub.totalHours}</td>
                                            <td className="px-4 py-3 text-right text-zinc-400">¥{sub.pricePerHour}</td>
                                            <td className="px-4 py-3 text-right text-zinc-400">
                                                {sub.materialFeeTotal > 0 ? `¥${sub.materialFeeTotal}` : '-'}
                                            </td>
                                            <td className="px-4 py-3 text-right font-bold text-zinc-900">¥{sub.subtotal}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            <div className="px-4 py-2 bg-zinc-50 text-center text-xs text-zinc-400 border-t border-zinc-100">
                                点击科目行查看上课日期明细
                            </div>
                        </div>

                        {/* Generated AI Message Area */}
                        {generatedMessage?.id === item.student.id && (
                            <div className="bg-white rounded-xl border border-emerald-100 shadow-sm p-4 animate-fade-in relative">
                                <div className="absolute top-0 left-0 w-1 h-full bg-emerald-400 rounded-l-xl"></div>
                                <div className="flex justify-between items-start mb-2">
                                    <h5 className="font-bold text-emerald-800 flex items-center gap-2 text-sm">
                                        <Sparkles size={14} /> AI 通知草稿
                                    </h5>
                                    <button onClick={() => setGeneratedMessage(null)} className="text-zinc-300 hover:text-zinc-500"><X size={14}/></button>
                                </div>
                                <textarea 
                                    readOnly 
                                    className="w-full text-sm text-zinc-600 bg-emerald-50/30 p-3 rounded-lg border border-emerald-50 focus:outline-none resize-none h-32"
                                    value={generatedMessage.text}
                                />
                                <div className="mt-2 text-right">
                                    <button 
                                        onClick={() => navigator.clipboard.writeText(generatedMessage.text).then(() => alert('已复制到剪贴板'))}
                                        className="text-xs font-medium text-emerald-600 hover:text-emerald-700 px-3 py-1 bg-emerald-50 rounded-md transition-colors"
                                    >
                                        复制内容
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
            ))
        )}
      </div>

      {/* Render Portal Modal */}
      {renderDetailModal()}
    </div>
  );
};

export default SettlementManager;
