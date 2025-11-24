import React, { useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Student, ClassRecord, PriceRule, Subject } from '../types';
import { calculateSettlement } from '../services/calculator';
import { analyzeFinancials } from '../services/geminiService';
import { Sparkles, TrendingUp, Users, Clock, Loader2, ArrowRight, Calendar, List, ChevronLeft, ChevronRight, CheckCircle2, XCircle, Filter, X } from 'lucide-react';
import Markdown from 'react-markdown';
import { SUBJECT_COLORS } from '../constants';

interface DashboardProps {
    students: Student[];
    records: ClassRecord[];
    priceRule: PriceRule;
}

const Dashboard: React.FC<DashboardProps> = ({ students, records, priceRule }) => {
    const [aiAnalysis, setAiAnalysis] = useState<string>('');
    const [analyzing, setAnalyzing] = useState(false);
    
    // Schedule View State
    const [scheduleView, setScheduleView] = useState<'calendar' | 'list'>('calendar');
    const today = new Date();
    const [viewMonth, setViewMonth] = useState(today.getMonth());
    const [viewYear, setViewYear] = useState(today.getFullYear());
    const [filterStatus, setFilterStatus] = useState<'all' | 'present' | 'absent'>('all');

    // Detail Modal State
    const [dashboardModalData, setDashboardModalData] = useState<{date: string, subject: Subject} | null>(null);

    const settlements = useMemo(() => {
        return students.map(s => calculateSettlement(s, records.filter(r => r.studentId === s.id), priceRule));
    }, [students, records, priceRule]);

    const totalRevenue = settlements.reduce((acc, s) => acc + s.totalAmount, 0);
    const totalHours = settlements.reduce((acc, s) => acc + s.totalHours, 0);

    const subjectData = useMemo(() => {
        const map: Record<string, number> = {};
        records.forEach(r => {
            map[r.subject] = (map[r.subject] || 0) + (r.status === 'present' ? r.count : 0);
        });
        return Object.entries(map).map(([name, hours]) => ({ name, hours }));
    }, [records]);

    const COLORS = ['#10b981', '#f59e0b', '#3b82f6', '#8b5cf6', '#ec4899']; // Emerald, Amber, Blue, Violet, Pink

    const handleAnalyze = async () => {
        setAnalyzing(true);
        const result = await analyzeFinancials(settlements);
        setAiAnalysis(result);
        setAnalyzing(false);
    };

    // Helper for calendar
    const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
    const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();
    
    const monthlyRecords = useMemo(() => {
         return records.filter(r => {
            const date = new Date(r.date);
            const matchMonth = date.getMonth() === viewMonth && date.getFullYear() === viewYear;
            const matchStatus = filterStatus === 'all' || r.status === filterStatus;
            return matchMonth && matchStatus;
        });
    }, [records, viewMonth, viewYear, filterStatus]);

    // Modal Records for Dashboard (Read Only)
    const modalRecords = useMemo(() => {
        if (!dashboardModalData) return [];
        return records.filter(r => 
            r.date === dashboardModalData.date && 
            r.subject === dashboardModalData.subject &&
            (filterStatus === 'all' || r.status === filterStatus)
        );
    }, [records, dashboardModalData, filterStatus]);

    const renderDetailModal = () => {
        if (!dashboardModalData) return null;
        return createPortal(
            <div className="fixed inset-0 bg-zinc-900/40 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
                 <div className="absolute inset-0" onClick={() => setDashboardModalData(null)} />
                 <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg animate-fade-in-up overflow-hidden max-h-[80vh] flex flex-col relative z-10">
                    <div className="p-5 border-b border-zinc-100 flex justify-between items-center bg-zinc-50 shrink-0">
                        <div>
                            <h3 className="font-bold text-lg text-zinc-900 flex items-center gap-2">
                                {dashboardModalData.date} 
                                <span className={`px-2 py-0.5 rounded-md text-sm border ${SUBJECT_COLORS[dashboardModalData.subject]}`}>{dashboardModalData.subject}</span>
                            </h3>
                            <p className="text-xs text-zinc-500 mt-1">当日学生名单 (仅预览)</p>
                        </div>
                        <button onClick={() => setDashboardModalData(null)} className="text-zinc-400 hover:text-zinc-600 bg-white p-2 rounded-full shadow-sm"><X size={20}/></button>
                    </div>
                    
                    <div className="p-5 overflow-y-auto custom-scrollbar flex-1 space-y-3">
                        {modalRecords.length === 0 ? (
                            <div className="text-center text-zinc-400 py-8">无记录</div>
                        ) : (
                            modalRecords.map(r => {
                                const stu = students.find(s => s.id === r.studentId);
                                return (
                                    <div key={r.id} className="flex justify-between items-center p-3 rounded-xl border border-zinc-100 hover:bg-zinc-50 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white ${r.status === 'present' ? 'bg-emerald-400' : 'bg-rose-400'}`}>
                                                {stu?.name[0]}
                                            </div>
                                            <div>
                                                <p className="font-bold text-zinc-800 text-sm">{stu?.name}</p>
                                                <p className="text-xs text-zinc-400 flex items-center gap-1">
                                                    {r.count}课时 
                                                    {r.status === 'absent' && <span className="text-rose-500 font-medium">• 请假</span>}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })
                        )}
                    </div>
                 </div>
            </div>,
            document.body
        );
    };

    return (
        <div className="space-y-8 animate-fade-in-up">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div className="flex-1 min-w-0">
                    <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 tracking-tight">仪表盘</h2>
                    <p className="text-sm sm:text-base text-zinc-500 mt-1 truncate">欢迎回来，今日数据概览 (当前计费: {priceRule.name})。</p>
                </div>
                <div className="text-xs sm:text-sm text-zinc-400 bg-white px-3 py-1.5 rounded-full shadow-sm border border-zinc-100 flex items-center gap-2 flex-shrink-0">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    数据实时同步中
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
                {/* Revenue Card */}
                <div className="relative overflow-hidden bg-white p-3 sm:p-4 lg:p-6 rounded-2xl lg:rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-zinc-100 group hover:border-emerald-200 transition-colors">
                    <div className="absolute top-0 right-0 p-2 sm:p-3 lg:p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                         <TrendingUp size={40} className="text-emerald-500" />
                    </div>
                    <div className="flex items-center gap-2 mb-3 sm:mb-4">
                        <div className="p-1.5 sm:p-2 bg-emerald-50 text-emerald-600 rounded-lg lg:rounded-xl">
                            <TrendingUp size={14} />
                        </div>
                        <span className="text-xs font-semibold text-zinc-500">本月营收</span>
                    </div>
                    <div className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold text-zinc-900 tracking-tight">
                        ¥{totalRevenue.toLocaleString()}
                    </div>
                    <div className="mt-2 sm:mt-3 lg:mt-4 flex items-center gap-2 text-xs text-emerald-600 font-medium bg-emerald-50 w-fit px-2 py-1 rounded-full">
                        <ArrowRight size={10} /> 状况良好
                    </div>
                </div>

                {/* Hours Card */}
                <div className="relative overflow-hidden bg-white p-3 sm:p-4 lg:p-6 rounded-2xl lg:rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-zinc-100 group hover:border-orange-200 transition-colors">
                     <div className="absolute top-0 right-0 p-2 sm:p-3 lg:p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                         <Clock size={40} className="text-orange-500" />
                    </div>
                    <div className="flex items-center gap-2 mb-3 sm:mb-4">
                         <div className="p-1.5 sm:p-2 bg-orange-50 text-orange-600 rounded-lg lg:rounded-xl">
                            <Clock size={14} />
                        </div>
                        <span className="text-xs font-semibold text-zinc-500">总课时</span>
                    </div>
                    <div className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold text-zinc-900 tracking-tight">
                        {totalHours} <span className="text-sm sm:text-base lg:text-xl text-zinc-400 font-normal">小时</span>
                    </div>
                     <div className="mt-2 sm:mt-3 lg:mt-4 text-xs text-zinc-400">
                        {records.length} 条记录
                    </div>
                </div>

                {/* Students Card */}
                <div className="relative overflow-hidden bg-white p-3 sm:p-4 lg:p-6 rounded-2xl lg:rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-zinc-100 group hover:border-blue-200 transition-colors sm:col-span-2 lg:col-span-1">
                     <div className="absolute top-0 right-0 p-2 sm:p-3 lg:p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                         <Users size={40} className="text-blue-500" />
                    </div>
                    <div className="flex items-center gap-2 mb-3 sm:mb-4">
                         <div className="p-1.5 sm:p-2 bg-blue-50 text-blue-600 rounded-lg lg:rounded-xl">
                            <Users size={14} />
                        </div>
                        <span className="text-xs font-semibold text-zinc-500">在读学员</span>
                    </div>
                    <div className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold text-zinc-900 tracking-tight">
                        {students.length} <span className="text-sm sm:text-base lg:text-xl text-zinc-400 font-normal">人</span>
                    </div>
                    <div className="mt-2 sm:mt-3 lg:mt-4 flex -space-x-1 overflow-hidden">
                        {students.slice(0,4).map((s,i) => (
                             <div key={i} className={`inline-block h-5 w-5 sm:h-6 sm:w-6 lg:h-8 lg:w-8 rounded-full ring-2 ring-white flex items-center justify-center text-xs text-white font-bold ${['bg-emerald-400', 'bg-orange-400', 'bg-blue-400'][i%3]}`}>
                                {s.name[0]}
                             </div>
                        ))}
                         {students.length > 4 && <div className="h-5 w-5 sm:h-6 sm:w-6 lg:h-8 lg:w-8 rounded-full bg-zinc-100 ring-2 ring-white flex items-center justify-center text-xs text-zinc-500">+{students.length - 4}</div>}
                    </div>
                </div>
            </div>

            {/* Analysis & Chart Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-3 sm:gap-4 lg:gap-6">
                <div className="bg-white p-3 sm:p-4 lg:p-6 xl:p-8 rounded-2xl lg:rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-zinc-100">
                    <h3 className="text-sm sm:text-base font-bold text-zinc-900 mb-3 sm:mb-4 lg:mb-6">课时分布</h3>
                    <div className="h-40 sm:h-48 lg:h-64 xl:h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={subjectData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f4f4f5" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#a1a1aa', fontSize: 10, fontWeight: 500}} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{fill: '#a1a1aa', fontSize: 10}} />
                                <Tooltip 
                                    cursor={{fill: '#f4f4f5'}} 
                                    contentStyle={{
                                        borderRadius: '16px', 
                                        border: 'none', 
                                        boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                                        padding: '12px 16px',
                                        fontFamily: 'inherit'
                                    }} 
                                />
                                <Bar dataKey="hours" radius={[4, 4, 4, 4]} barSize={window.innerWidth < 640 ? 20 : 30}>
                                    {subjectData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-white p-3 sm:p-4 lg:p-6 xl:p-8 rounded-2xl lg:rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-zinc-100 flex flex-col">
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-3 sm:gap-4 mb-3 sm:mb-4 lg:mb-6">
                        <div className="flex-1 min-w-0">
                            <h3 className="text-sm sm:text-base font-bold text-zinc-900 flex items-center gap-2">
                                <Sparkles className="text-orange-500 fill-orange-500" size={14} /> AI 经营分析
                            </h3>
                            <p className="text-[10px] text-zinc-500 mt-1">基于当前数据的智能洞察。</p>
                        </div>
                        
                        {!aiAnalysis && (
                            <button 
                                onClick={handleAnalyze} 
                                disabled={analyzing}
                                className="text-[10px] bg-zinc-900 text-white px-2.5 py-1.5 rounded-lg hover:bg-zinc-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-zinc-200 flex-shrink-0"
                            >
                                {analyzing ? <Loader2 className="animate-spin inline mr-1" size={10} /> : <Sparkles className="inline mr-1" size={10} />}
                                {analyzing ? '分析中...' : '生成报告'}
                            </button>
                        )}
                    </div>
                    
                    <div className="flex-1 bg-zinc-50 rounded-xl p-2.5 text-[10px] text-zinc-700 overflow-y-auto max-h-32 border border-zinc-100">
                        {analyzing ? (
                            <div className="flex flex-col items-center justify-center h-full text-zinc-400 gap-2">
                                <Loader2 className="animate-spin text-emerald-500" size={20} /> 
                                <span className="font-medium text-xs">AI 正在分析财务数据...</span>
                            </div>
                        ) : aiAnalysis ? (
                            <div className="prose prose-sm prose-zinc prose-headings:text-zinc-900 prose-strong:text-emerald-700">
                                <div className="markdown-body">
                                     <Markdown>{aiAnalysis}</Markdown>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-zinc-400 text-center">
                                <div className="bg-white p-2 rounded-full mb-2 shadow-sm">
                                    <Sparkles size={16} className="text-zinc-300" />
                                </div>
                                <p className="text-xs">点击按钮获取<br/>基于 Gemini AI 的营收分析。</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Comprehensive Schedule View */}
            <div className="bg-white p-3 sm:p-4 lg:p-6 xl:p-8 rounded-2xl lg:rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-zinc-100">
                 <div className="flex flex-col gap-3 mb-3">
                     <div className="flex items-center gap-2">
                         <div className="bg-zinc-100 text-zinc-600 p-1.5 rounded-lg">
                            <Calendar size={14} />
                         </div>
                         <div>
                            <h3 className="text-sm font-bold text-zinc-900">全校总览</h3>
                            <p className="text-[10px] text-zinc-500">所有历史课时记录</p>
                         </div>
                     </div>

                     <div className="flex flex-col gap-2">
                         {/* Status Filter for Read-only view */}
                         <div className="flex items-center gap-1.5 bg-zinc-50 px-2 py-1.5 rounded-lg border border-zinc-100">
                             {filterStatus === 'present' ? <CheckCircle2 size={10} className="text-emerald-500"/> : 
                              filterStatus === 'absent' ? <XCircle size={10} className="text-rose-500"/> :
                              <Filter size={10} className="text-zinc-400"/>}
                             <select 
                                className="bg-transparent outline-none text-[10px] font-medium text-zinc-700 flex-1"
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value as any)}
                             >
                                 <option value="all">所有</option>
                                 <option value="present">到课</option>
                                 <option value="absent">请假</option>
                             </select>
                        </div>

                         {/* Toggle */}
                         <div className="flex bg-zinc-100 p-0.5 rounded-lg">
                            <button
                                onClick={() => setScheduleView('calendar')}
                                className={`px-2 py-1 rounded-md text-[10px] font-medium flex items-center gap-1 transition-all ${scheduleView === 'calendar' ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500 hover:text-zinc-700'}`}
                            >
                                <Calendar size={10} /> 看板
                            </button>
                            <button
                                onClick={() => setScheduleView('list')}
                                className={`px-2 py-1 rounded-md text-[10px] font-medium flex items-center gap-1 transition-all ${scheduleView === 'list' ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500 hover:text-zinc-700'}`}
                            >
                                <List size={10} /> 列表
                            </button>
                        </div>
                     </div>
                 </div>

                 {/* Month Nav for Calendar View - separate row */}
                 {scheduleView === 'calendar' && (
                    <div className="flex justify-center mb-3">
                        <div className="flex items-center gap-1.5 bg-zinc-50 rounded-lg p-1 border border-zinc-100">
                            <button onClick={() => {
                                if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); } else { setViewMonth(m => m - 1); }
                            }} className="p-0.5 hover:bg-white rounded-md text-zinc-500 transition-colors"><ChevronLeft size={10}/></button>
                            <span className="text-[10px] font-bold text-zinc-700 min-w-[70px] text-center px-1.5">{viewYear}.{viewMonth + 1}</span>
                            <button onClick={() => {
                                if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); } else { setViewMonth(m => m + 1); }
                            }} className="p-0.5 hover:bg-white rounded-md text-zinc-500 transition-colors"><ChevronRight size={10}/></button>
                        </div>
                    </div>
                 )}

                 {scheduleView === 'calendar' ? (
                     <div className="border border-zinc-200 rounded-xl overflow-hidden animate-fade-in">
                        <div className="grid grid-cols-7 border-b border-zinc-200 bg-zinc-50">
                            {['日','一','二','三','四','五','六'].map(d => (
                                <div key={d} className="py-1.5 text-center text-[10px] font-bold text-zinc-400 uppercase tracking-wider">{d}</div>
                            ))}
                        </div>
                        <div className="grid grid-cols-7 min-h-[280px] bg-zinc-100 gap-px border-b border-zinc-200">
                             {Array.from({ length: getFirstDayOfMonth(viewYear, viewMonth) }).map((_, i) => (
                                <div key={`prev-${i}`} className="bg-white/50 h-10 p-0.5" />
                            ))}
                            {Array.from({ length: getDaysInMonth(viewYear, viewMonth) }, (_, i) => i + 1).map(day => {
                                const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                                const dayRecords = monthlyRecords.filter(r => r.date === dateStr);
                                
                                // Group by Subject for display (Consistent with RecordManager)
                                const subjectsOnDay = Array.from(new Set(dayRecords.map(r => r.subject)));

                                return (
                                    <div key={day} className="bg-white h-10 p-0.5 overflow-y-auto custom-scrollbar transition-colors hover:bg-zinc-50/50">
                                        <div className="text-[10px] font-semibold text-zinc-500 mb-0.5 flex justify-between">
                                            <span>{day}</span>
                                        </div>
                                        <div className="flex flex-wrap gap-0.5 content-start">
                                            {subjectsOnDay.slice(0, 2).map(sub => {
                                                const count = dayRecords.filter(r => r.subject === sub).length;
                                                return (
                                                    <button
                                                        key={sub}
                                                        onClick={() => setDashboardModalData({ date: dateStr, subject: sub })}
                                                        className={`w-full text-left px-0.5 py-0.5 rounded-md border text-[6px] font-bold transition-all hover:scale-[1.02] shadow-sm flex justify-between items-center ${SUBJECT_COLORS[sub]}`}
                                                    >
                                                        <span className="truncate">{sub}</span>
                                                        <span className="bg-white/50 px-0.5 rounded-sm text-[5px]">{count}</span>
                                                    </button>
                                                );
                                            })}
                                            {subjectsOnDay.length > 2 && (
                                                <div className="text-[6px] text-zinc-400 text-center w-full">+{subjectsOnDay.length - 2}</div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                            {Array.from({ length: 42 - (getFirstDayOfMonth(viewYear, viewMonth) + getDaysInMonth(viewYear, viewMonth)) }).map((_, i) => (
                                <div key={`next-${i}`} className="bg-white/50 h-10" />
                            ))}
                        </div>
                     </div>
                 ) : (
                     <div className="overflow-x-auto animate-fade-in">
                         <table className="w-full text-[10px] min-w-[400px]">
                            <thead className="text-zinc-400 bg-zinc-50 uppercase text-[10px] font-medium">
                                <tr>
                                    <th className="px-2 py-1.5 rounded-l-lg">日期</th>
                                    <th className="px-2 py-1.5">学生</th>
                                    <th className="px-2 py-1.5">科目</th>
                                    <th className="px-2 py-1.5">课时</th>
                                    <th className="px-2 py-1.5">状态</th>
                                    <th className="px-2 py-1.5 rounded-r-lg">备注</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-50">
                                {records.slice().sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 15).map(r => {
                                     const stu = students.find(s => s.id === r.studentId);
                                     return (
                                         <tr key={r.id} className="hover:bg-zinc-50/50 transition-colors">
                                             <td className="px-2 py-2 text-zinc-500 font-mono">{r.date}</td>
                                             <td className="px-2 py-2 font-bold text-zinc-700 max-w-[60px] truncate">{stu?.name}</td>
                                             <td className="px-2 py-2">
                                                 <span className={`px-1 py-0.5 rounded-md text-[10px] border font-medium ${SUBJECT_COLORS[r.subject]}`}>{r.subject}</span>
                                             </td>
                                             <td className="px-2 py-2 text-zinc-600">{r.count}</td>
                                             <td className="px-2 py-2">
                                                 <span className={`px-1 py-0.5 rounded-md text-[10px] font-medium ${r.status === 'present' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                                                     {r.status === 'present' ? '到课' : '请假'}
                                                 </span>
                                             </td>
                                             <td className="px-2 py-2 text-zinc-400 text-[10px] max-w-[80px] truncate">{r.remarks || '-'}</td>
                                         </tr>
                                     )
                                })}
                            </tbody>
                        </table>
                        <div className="text-center mt-2 text-[10px] text-zinc-400">仅显示最近 15 条记录</div>
                     </div>
                 )}
            </div>

            {/* Render Portal Modal */}
            {renderDetailModal()}
        </div>
    );
};

export default Dashboard;