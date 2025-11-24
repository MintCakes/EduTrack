import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { Calendar as CalendarIcon, Save, Trash2, Check, ChevronLeft, ChevronRight, Filter, X, PlusCircle, LayoutGrid, CheckSquare, Square, User, CheckCircle2, XCircle, List } from 'lucide-react';
import { Student, ClassRecord, Subject } from '../types';
import { SUBJECT_OPTIONS, SUBJECT_COLORS } from '../constants';

interface RecordManagerProps {
  students: Student[];
  records: ClassRecord[];
  setRecords: React.Dispatch<React.SetStateAction<ClassRecord[]>>;
}

const RecordManager: React.FC<RecordManagerProps> = ({ students, records, setRecords }) => {
  const [viewMode, setViewMode] = useState<'entry' | 'calendar' | 'list'>('entry');
  const [entryModeType, setEntryModeType] = useState<'student' | 'subject'>('student');
  
  // --- Common Entry States ---
  const [entryDates, setEntryDates] = useState<string[]>([]);
  const [count, setCount] = useState<number>(2);
  const [status, setStatus] = useState<'present' | 'absent'>('present');
  const [teacher, setTeacher] = useState('');
  const [materialFee, setMaterialFee] = useState<number>(0);
  const [remarks, setRemarks] = useState('');

  // --- Single Student Entry States ---
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [selectedSubjects, setSelectedSubjects] = useState<Subject[]>([]);

  // --- Batch Subject Entry States ---
  const [batchSubject, setBatchSubject] = useState<Subject | ''>('');
  const [batchStudentIds, setBatchStudentIds] = useState<string[]>([]);

  // --- Calendar/Filter States ---
  const today = new Date();
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [filterSubject, setFilterSubject] = useState<Subject | 'all'>('all');
  const [filterStudentId, setFilterStudentId] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'present' | 'absent'>('all'); // Added Status Filter
  
  // --- Modals ---
  const [dayModalData, setDayModalData] = useState<{date: string, subject: Subject} | null>(null);
  const [modalFilterStatus, setModalFilterStatus] = useState<'all' | 'present' | 'absent'>('all');

  // --- Helper Functions ---
  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const handleStudentChange = (id: string) => {
    setSelectedStudentId(id);
    if(id) setSelectedSubjects([]); 
  };

  const toggleEntrySubject = (sub: Subject) => {
    setSelectedSubjects(prev => prev.includes(sub) ? prev.filter(s => s !== sub) : [...prev, sub]);
  };

  const handleEntryDateClick = (day: number) => {
    const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    setEntryDates(prev => prev.includes(dateStr) ? prev.filter(d => d !== dateStr) : [...prev, dateStr]);
  };

  // --- Batch Selection Logic ---
  const toggleBatchStudent = (id: string) => {
    setBatchStudentIds(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]);
  };

  const toggleSelectAllBatchStudents = () => {
    if (!batchSubject) return;
    const enrolledStudents = students.filter(s => s.subjects.includes(batchSubject));
    const allIds = enrolledStudents.map(s => s.id);
    
    // If all are currently selected, deselect all. Otherwise, select all.
    const isAllSelected = allIds.every(id => batchStudentIds.includes(id));
    if (isAllSelected) {
        setBatchStudentIds([]);
    } else {
        setBatchStudentIds(allIds);
    }
  };

  // --- Submission Logic ---
  const handleSubmit = () => {
    if (entryDates.length === 0) {
        alert("请至少选择一个日期。");
        return;
    }

    const newRecords: ClassRecord[] = [];

    if (entryModeType === 'student') {
        if (!selectedStudentId || selectedSubjects.length === 0) {
            alert("请选择学生和至少一个科目。");
            return;
        }
        entryDates.forEach(date => {
            selectedSubjects.forEach(sub => {
                newRecords.push(createRecordObj(selectedStudentId, sub, date));
            });
        });
    } else {
        // Batch Subject Mode
        if (!batchSubject || batchStudentIds.length === 0) {
            alert("请选择科目和至少一名学生。");
            return;
        }
        entryDates.forEach(date => {
            batchStudentIds.forEach(stuId => {
                newRecords.push(createRecordObj(stuId, batchSubject, date));
            });
        });
    }

    saveRecords(newRecords);
    
    // Reset specific fields but keep date/teacher for convenience
    setRemarks('');
    alert(`成功录入 ${newRecords.length} 条记录！如有冲突日期已自动覆盖。`);
  };

  const createRecordObj = (studentId: string, subject: Subject, date: string): ClassRecord => ({
    id: crypto.randomUUID(),
    studentId,
    subject,
    date,
    count,
    status,
    teacher,
    materialFee, 
    remarks
  });

  const saveRecords = (newRecords: ClassRecord[]) => {
    setRecords(prev => {
        // Conflict Resolution: Overwrite same Student+Subject+Date
        const newRecordKeys = new Set(newRecords.map(r => `${r.studentId}-${r.subject}-${r.date}`));
        const cleanPrev = prev.filter(r => !newRecordKeys.has(`${r.studentId}-${r.subject}-${r.date}`));
        return [...cleanPrev, ...newRecords];
    });
  };

  const handleDeleteRecord = (id: string) => {
    if(window.confirm('确定要删除这条记录吗？此操作无法撤销。')) {
        setRecords(prev => prev.filter(r => r.id !== id));
    }
  };

  // --- Computed Data ---
  // Shared filtered records for both Calendar and List views
  const displayRecords = useMemo(() => {
    return records.filter(r => {
        const date = new Date(r.date);
        const matchMonth = date.getMonth() === viewMonth && date.getFullYear() === viewYear;
        const matchSubject = filterSubject === 'all' || r.subject === filterSubject;
        const matchStudent = filterStudentId === 'all' || r.studentId === filterStudentId;
        const matchStatus = filterStatus === 'all' || r.status === filterStatus; // Status filter
        return matchMonth && matchSubject && matchStudent && matchStatus;
    });
  }, [records, viewMonth, viewYear, filterSubject, filterStudentId, filterStatus]);

  const selectedStudent = students.find(s => s.id === selectedStudentId);

  // For Batch Mode: Students enrolled in the selected batch subject
  const batchCandidateStudents = useMemo(() => {
    if (!batchSubject) return [];
    return students.filter(s => s.subjects.includes(batchSubject));
  }, [students, batchSubject]);

  // For Modal: Records matching the clicked date/subject
  const modalRecords = useMemo(() => {
    if (!dayModalData) return [];
    return records.filter(r => 
        r.date === dayModalData.date && 
        r.subject === dayModalData.subject &&
        (modalFilterStatus === 'all' || r.status === modalFilterStatus) &&
        (filterStudentId === 'all' || r.studentId === filterStudentId)
    );
  }, [records, dayModalData, modalFilterStatus, filterStudentId]);

  // Use Portal for Modal to break out of z-index/transform issues
  const renderDayModal = () => {
    if (!dayModalData) return null;
    return createPortal(
        <div className="fixed inset-0 bg-zinc-900/40 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
             <div 
                className="absolute inset-0" 
                onClick={() => setDayModalData(null)}
             />
             <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg animate-fade-in-up overflow-hidden max-h-[80vh] flex flex-col relative z-10">
                <div className="p-5 border-b border-zinc-100 flex justify-between items-center bg-zinc-50 shrink-0">
                    <div>
                        <h3 className="font-bold text-lg text-zinc-900 flex items-center gap-2">
                            {dayModalData.date} 
                            <span className={`px-2 py-0.5 rounded-md text-sm border ${SUBJECT_COLORS[dayModalData.subject]}`}>{dayModalData.subject}</span>
                        </h3>
                        <p className="text-xs text-zinc-500 mt-1">学生到课详情 (点击垃圾桶删除)</p>
                    </div>
                    <button onClick={() => setDayModalData(null)} className="text-zinc-400 hover:text-zinc-600 bg-white p-2 rounded-full shadow-sm"><X size={20}/></button>
                </div>
                
                {/* Modal Filter */}
                <div className="px-5 py-3 border-b border-zinc-100 flex gap-2 shrink-0">
                     {['all', 'present', 'absent'].map(s => (
                         <button
                            key={s}
                            onClick={() => setModalFilterStatus(s as any)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                                modalFilterStatus === s 
                                ? 'bg-zinc-800 text-white' 
                                : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                            }`}
                         >
                            {s === 'all' ? '全部' : s === 'present' ? '到课' : '请假'}
                         </button>
                     ))}
                </div>

                <div className="p-5 overflow-y-auto custom-scrollbar flex-1 space-y-3">
                    {modalRecords.length === 0 ? (
                        <div className="text-center text-zinc-400 py-8">无符合条件的记录</div>
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
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); handleDeleteRecord(r.id); }}
                                        className="text-zinc-300 hover:text-rose-500 hover:bg-rose-50 p-2.5 rounded-lg transition-colors cursor-pointer"
                                        title="删除此条记录"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            )
                        })
                    )}
                </div>
                
                <div className="p-4 bg-zinc-50 border-t border-zinc-100 text-center text-xs text-zinc-400 shrink-0">
                    共 {modalRecords.length} 条记录
                </div>
             </div>
        </div>,
        document.body
    );
  };

  const FilterToolbar = () => (
    <div className="flex flex-col gap-3 mb-3 p-1.5 sm:p-2 lg:p-3 bg-zinc-50 rounded-lg sm:rounded-xl lg:rounded-2xl border border-zinc-100">
        {/* Month Nav */}
        <div className="flex items-center gap-1.5 sm:gap-2 lg:gap-3 w-full sm:w-auto">
            <button onClick={() => {
                if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); } else { setViewMonth(m => m - 1); }
            }} className="p-0.5 sm:p-1 lg:p-1.5 hover:bg-white rounded-md shadow-sm text-zinc-600 transition-all"><ChevronLeft size={12} className="sm:w-3.5 lg:w-[16px]"/></button>
            <span className="text-sm sm:text-lg lg:text-xl font-bold text-zinc-800 w-16 sm:w-20 lg:w-28 text-center flex-1 sm:flex-none">{viewYear}年{viewMonth + 1}月</span>
            <button onClick={() => {
                if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); } else { setViewMonth(m => m + 1); }
            }} className="p-0.5 sm:p-1 lg:p-1.5 hover:bg-white rounded-md shadow-sm text-zinc-600 transition-all"><ChevronRight size={12} className="sm:w-3.5 lg:w-[16px]"/></button>
        </div>

        <div className="flex flex-col gap-2 w-full">
            {/* Student Filter */}
            <div className="flex items-center gap-1.5 bg-white px-2 py-1.5 rounded-lg border border-zinc-200 w-full">
                <User size={10} className="sm:w-3 lg:w-[14px] text-zinc-400 flex-shrink-0"/>
                <select 
                    className="bg-transparent outline-none text-[10px] sm:text-sm font-medium text-zinc-700 min-w-[70px] sm:min-w-[90px] flex-1"
                    value={filterStudentId}
                    onChange={(e) => setFilterStudentId(e.target.value)}
                >
                    <option value="all">所有学生</option>
                    {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
            </div>

            {/* Subject Filter */}
            <div className="flex items-center gap-1.5 bg-white px-2 py-1.5 rounded-lg border border-zinc-200 w-full">
                <Filter size={10} className="sm:w-3 lg:w-[14px] text-zinc-400 flex-shrink-0"/>
                <select 
                    className="bg-transparent outline-none text-[10px] sm:text-sm font-medium text-zinc-700 min-w-[70px] sm:min-w-[90px] flex-1"
                    value={filterSubject}
                    onChange={(e) => setFilterSubject(e.target.value as Subject | 'all')}
                >
                    <option value="all">所有科目</option>
                    {SUBJECT_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
            </div>
            
            {/* Status Filter */}
            <div className="flex items-center gap-1.5 bg-white px-2 py-1.5 rounded-lg border border-zinc-200 w-full">
                {filterStatus === 'present' ? <CheckCircle2 size={10} className="sm:w-3 lg:w-[14px] text-emerald-500 flex-shrink-0"/> : 
                 filterStatus === 'absent' ? <XCircle size={10} className="sm:w-3 lg:w-[14px] text-rose-500 flex-shrink-0"/> :
                 <Filter size={10} className="sm:w-3 lg:w-[14px] text-zinc-400 flex-shrink-0"/>}
                <select 
                    className="bg-transparent outline-none text-[10px] sm:text-sm font-medium text-zinc-700 min-w-[70px] sm:min-w-[90px] flex-1"
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value as 'all' | 'present' | 'absent')}
                >
                    <option value="all">所有状态</option>
                    <option value="present">到课</option>
                    <option value="absent">请假</option>
                </select>
            </div>
        </div>
    </div>
  );

  return (
    <div className="space-y-4 sm:space-y-8 animate-fade-in-up">
        <div className="flex flex-col gap-3">
            <div className="flex-1 min-w-0">
                <h2 className="text-base sm:text-2xl lg:text-3xl font-bold text-zinc-900 tracking-tight">课时管理</h2>
                <p className="text-zinc-500 mt-1 text-[10px] sm:text-sm lg:text-base">录入新课时，或以月视图/列表管理历史记录。</p>
            </div>
            
            <div className="bg-zinc-100 p-1 rounded-lg flex flex-wrap gap-1 w-full overflow-x-auto">
                <button
                    onClick={() => setViewMode('entry')}
                    className={`px-2 py-1.5 rounded-md text-[10px] font-medium flex items-center gap-1 transition-all whitespace-nowrap ${viewMode === 'entry' ? 'bg-white text-emerald-600 shadow-sm' : 'text-zinc-500 hover:text-zinc-700'}`}
                >
                    <PlusCircle size={10} /> <span className="hidden sm:inline">课时录入</span><span className="sm:hidden">录入</span>
                </button>
                <button
                    onClick={() => setViewMode('calendar')}
                    className={`px-2 py-1.5 rounded-md text-[10px] font-medium flex items-center gap-1 transition-all whitespace-nowrap ${viewMode === 'calendar' ? 'bg-white text-emerald-600 shadow-sm' : 'text-zinc-500 hover:text-zinc-700'}`}
                >
                    <LayoutGrid size={10} /> <span className="hidden sm:inline">课时看板</span><span className="sm:hidden">看板</span>
                </button>
                <button
                    onClick={() => setViewMode('list')}
                    className={`px-2 py-1.5 rounded-md text-[10px] font-medium flex items-center gap-1 transition-all whitespace-nowrap ${viewMode === 'list' ? 'bg-white text-emerald-600 shadow-sm' : 'text-zinc-500 hover:text-zinc-700'}`}
                >
                    <List size={10} /> <span className="hidden sm:inline">列表管理</span><span className="sm:hidden">列表</span>
                </button>
            </div>
        </div>

    {viewMode === 'entry' ? (
        // ================= ENTRY MODE =================
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 sm:gap-8">
        <div className="xl:col-span-7 space-y-4 sm:space-y-6">
            <div className="bg-white p-4 sm:p-6 lg:p-8 rounded-2xl sm:rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-zinc-100">
                
                {/* Entry Type Toggle */}
                <div className="flex border-b border-zinc-100 mb-6 sm:mb-8">
                    <button
                        onClick={() => setEntryModeType('student')}
                        className={`pb-3 sm:pb-4 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-md text-[10px] font-bold transition-all border-b-2 whitespace-nowrap ${entryModeType === 'student' ? 'bg-white text-emerald-600 shadow-sm' : 'text-zinc-400 hover:text-zinc-600'}`}
                    >
                        按学生录入
                    </button>
                    <button
                        onClick={() => setEntryModeType('subject')}
                        className={`pb-3 sm:pb-4 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-md text-[10px] font-bold transition-all border-b-2 whitespace-nowrap ${entryModeType === 'subject' ? 'bg-white text-emerald-600 shadow-sm' : 'text-zinc-400 hover:text-zinc-600'}`}
                    >
                        按科目批量录入
                    </button>
                </div>

                {entryModeType === 'student' ? (
                    /* --- Single Student Entry --- */
                    <div className="grid grid-cols-1 gap-4 mb-8">
                        <div className="space-y-1.5">
                            <label className="block text-xs font-semibold text-zinc-700">选择学生</label>
                            <div className="relative">
                                <select
                                    className="w-full border border-zinc-200 p-2 rounded-xl bg-zinc-50 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none transition-colors appearance-none"
                                    value={selectedStudentId}
                                    onChange={e => handleStudentChange(e.target.value)}
                                >
                                    <option value="">请选择...</option>
                                    {students.map(s => <option key={s.id} value={s.id}>{s.name} ({s.grade})</option>)}
                                </select>
                                <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-zinc-500">
                                    <ChevronRight className="rotate-90" size={16} />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="block text-xs font-semibold text-zinc-700">上课科目 (可多选)</label>
                            <div className="flex flex-wrap gap-1.5">
                                {SUBJECT_OPTIONS.map(sub => {
                                    const isRegistered = selectedStudent?.subjects.includes(sub);
                                    const isSelected = selectedSubjects.includes(sub);
                                    return (
                                        <button
                                            key={sub}
                                            onClick={() => toggleEntrySubject(sub)}
                                            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                                                isSelected
                                                    ? 'bg-zinc-800 border-zinc-800 text-white shadow-lg shadow-zinc-200'
                                                    : isRegistered
                                                        ? 'bg-emerald-50 border-emerald-100 text-emerald-700' 
                                                        : 'bg-white border-zinc-200 text-zinc-500 hover:bg-zinc-50'
                                            }`}
                                        >
                                            {sub}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                ) : (
                    /* --- Batch Subject Entry --- */
                    <div className="grid grid-cols-1 gap-6 mb-8">
                        <div className="space-y-2">
                            <label className="block text-sm font-semibold text-zinc-700">选择科目</label>
                            <div className="flex flex-wrap gap-2">
                                {SUBJECT_OPTIONS.map(sub => (
                                    <button
                                        key={sub}
                                        onClick={() => { setBatchSubject(sub); setBatchStudentIds([]); }}
                                        className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
                                            batchSubject === sub
                                                ? SUBJECT_COLORS[sub].replace('bg-', 'ring-2 ring-offset-2 ring-') + ' bg-white font-bold shadow-sm'
                                                : 'bg-white border-zinc-200 text-zinc-500 hover:bg-zinc-50'
                                        }`}
                                    >
                                        {sub}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {batchSubject && (
                            <div className="space-y-2 animate-fade-in">
                                <div className="flex justify-between items-center">
                                    <label className="block text-sm font-semibold text-zinc-700">选择学生 (批量)</label>
                                    <button 
                                        onClick={toggleSelectAllBatchStudents}
                                        className="text-xs font-medium text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
                                    >
                                        {batchCandidateStudents.length > 0 && batchCandidateStudents.every(s => batchStudentIds.includes(s.id)) 
                                            ? <CheckSquare size={14} /> 
                                            : <Square size={14} />
                                        }
                                        全选本科目学生
                                    </button>
                                </div>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto p-1">
                                    {batchCandidateStudents.length === 0 ? (
                                        <p className="col-span-3 text-sm text-zinc-400 italic">暂无学生报读此科目</p>
                                    ) : (
                                        batchCandidateStudents.map(s => {
                                            const isSelected = batchStudentIds.includes(s.id);
                                            return (
                                                <button
                                                    key={s.id}
                                                    onClick={() => toggleBatchStudent(s.id)}
                                                    className={`p-2 rounded-lg text-sm text-left border transition-all flex items-center gap-2 ${
                                                        isSelected
                                                            ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                                                            : 'bg-white border-zinc-100 text-zinc-600 hover:bg-zinc-50'
                                                    }`}
                                                >
                                                    <div className={`w-4 h-4 rounded border flex items-center justify-center ${isSelected ? 'bg-emerald-500 border-emerald-500' : 'border-zinc-300'}`}>
                                                        {isSelected && <Check size={12} className="text-white" />}
                                                    </div>
                                                    <span className="truncate">{s.name}</span>
                                                </button>
                                            );
                                        })
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Common Fields */}
                <div className="mb-8">
                     <label className="block text-[10px] font-medium text-zinc-700 mb-1.5">出勤状态</label>
                     <div className="flex bg-zinc-100 p-1 rounded-xl w-full md:w-1/2">
                        <button onClick={() => setStatus('present')} className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all ${status === 'present' ? 'bg-white text-emerald-600 shadow-sm' : 'text-zinc-500'}`}>到课</button>
                        <button onClick={() => setStatus('absent')} className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all ${status === 'absent' ? 'bg-white text-rose-500 shadow-sm' : 'text-zinc-500'}`}>请假</button>
                    </div>
                </div>

                {/* Date Picker */}
                <div className="mb-8 border border-zinc-100 rounded-2xl overflow-hidden shadow-sm">
                    <div className="bg-zinc-50 p-3 flex justify-between items-center border-b border-zinc-100">
                        <button onClick={() => setViewMonth(p => p-1)} className="p-1.5 hover:bg-white rounded-lg text-zinc-500 transition-colors"><ChevronLeft size={14}/></button>
                        <span className="font-bold text-sm text-zinc-800">{new Date(viewYear, viewMonth).toLocaleString('zh-CN', { month: 'long', year: 'numeric' })}</span>
                        <button onClick={() => setViewMonth(p => p+1)} className="p-1.5 hover:bg-white rounded-lg text-zinc-500 transition-colors"><ChevronRight size={14}/></button>
                    </div>
                    <div className="p-6 bg-white">
                        <div className="grid grid-cols-7 gap-1 text-center mb-1.5">
                        {['日','一','二','三','四','五','六'].map(d => <span key={d} className="text-[10px] font-bold text-zinc-400">{d}</span>)}
                    </div>
                    <div className="grid grid-cols-7 gap-1 text-center">
                        {Array.from({ length: getFirstDayOfMonth(viewYear, viewMonth) }).map((_, i) => <div key={`empty-${i}`} />)}
                        {Array.from({length: getDaysInMonth(viewYear, viewMonth)}, (_, i) => i + 1).map(day => {
                            const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                            const isSelected = entryDates.includes(dateStr);
                            return (
                                <button
                                    key={day}
                                    onClick={() => handleEntryDateClick(day)}
                                    className={`w-9 h-9 rounded-lg flex items-center justify-center text-[10px] font-medium transition-all ${
                                        isSelected 
                                        ? 'bg-emerald-500 text-white shadow-md shadow-emerald-200 scale-105' 
                                        : 'hover:bg-zinc-100 text-zinc-700'
                                    }`}
                                >
                                    {day}
                                </button>
                            );
                        })}
                    </div>
                    </div>
                    <div className="px-6 py-3 bg-zinc-50 text-xs text-zinc-500 flex justify-between items-center border-t border-zinc-100">
                        <span>点击日期进行多选</span>
                        <span className="font-semibold text-emerald-600">已选 {entryDates.length} 天</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-3 mb-6">
                    <div className="space-y-1.5">
                        <label className="block text-[10px] font-medium text-zinc-700">单次课时</label>
                        <input type="number" min="1" className="w-full border border-zinc-200 p-2.5 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-[10px]" value={count} onChange={e => setCount(Number(e.target.value))} />
                    </div>
                    <div className="space-y-1.5">
                        <label className="block text-[10px] font-medium text-zinc-700">课本费 (¥)</label>
                        <input type="number" min="0" className="w-full border border-zinc-200 p-2.5 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-[10px]" value={materialFee} onChange={e => setMaterialFee(Number(e.target.value))} />
                        <p className="text-[10px] text-zinc-400">每人每科每月只计一次最高值</p>
                    </div>
                    <div className="space-y-1.5">
                        <label className="block text-[10px] font-medium text-zinc-700">授课教师</label>
                        <input type="text" className="w-full border border-zinc-200 p-2.5 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-[10px]" value={teacher} onChange={e => setTeacher(e.target.value)} placeholder="教师姓名..." />
                    </div>
                </div>
                
                <button onClick={handleSubmit} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-emerald-200 flex items-center justify-center gap-1.5 transition-all active:scale-95">
                    <Save size={18} /> 保存记录
                </button>
            </div>
        </div>

        {/* Right Panel: Recent List */}
        <div className="xl:col-span-5 space-y-3 sm:space-y-4">
            <div className="bg-white p-3 sm:p-4 rounded-xl sm:rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-zinc-100 h-full flex flex-col">
                <h3 className="font-bold text-sm sm:text-base text-zinc-900 mb-3 sm:mb-4 flex items-center gap-1.5">
                    <div className="bg-orange-100 text-orange-600 p-1 sm:p-1.5 rounded-md"><CalendarIcon size={14} /></div>
                    最近记录
                </h3>
                <div className="space-y-2 sm:space-y-3 overflow-y-auto max-h-[500px] sm:max-h-[600px] flex-1 pr-1 sm:pr-2 custom-scrollbar">
                    {records.slice().reverse().slice(0, 15).map(record => {
                        const stu = students.find(s => s.id === record.studentId);
                        return (
                            <div key={record.id} className="p-2 sm:p-3 bg-zinc-50 rounded-lg sm:rounded-xl border border-zinc-100 relative group hover:bg-white hover:shadow-sm transition-all">
                                <div className="flex justify-between items-start mb-1.5">
                                    <div className="font-bold text-zinc-800 text-[10px] sm:text-sm truncate flex-1">{stu?.name}</div>
                                    <span className="text-[9px] sm:text-[10px] text-zinc-400 bg-white px-1 sm:px-1.5 py-0.5 rounded-md border border-zinc-100 ml-1.5 flex-shrink-0">{record.date}</span>
                                </div>
                                <div className="flex items-center gap-1 sm:gap-1.5 text-[9px] sm:text-xs text-zinc-600 mb-1.5 flex-wrap">
                                    <span className={`px-1 sm:px-1.5 py-0.5 rounded-md text-[9px] border ${SUBJECT_COLORS[record.subject]} flex-shrink-0`}>{record.subject}</span>
                                    <span className="flex-shrink-0">{record.count} 课时</span>
                                    {record.materialFee > 0 && <span className="text-orange-500 text-[9px] flex items-center gap-0.5 flex-shrink-0">+¥{record.materialFee} 课本</span>}
                                </div>
                                {record.status === 'absent' && (
                                    <span className="absolute top-1.5 right-8 sm:right-12 text-rose-500 text-[9px] sm:text-[10px] font-bold border border-rose-200 bg-rose-50 px-1 sm:px-1.5 py-0.5 rounded-md">
                                        请假
                                    </span>
                                )}
                                <button 
                                    onClick={(e) => { e.stopPropagation(); handleDeleteRecord(record.id); }}
                                    className="absolute top-1.5 right-1.5 p-1 text-zinc-400 hover:text-rose-500 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
                                >
                                    <Trash2 size={12} />
                                </button>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
        </div>
    ) : viewMode === 'calendar' ? (
        // ================= CALENDAR MANAGEMENT MODE =================
        <div className="bg-white rounded-xl sm:rounded-2xl lg:rounded-3xl shadow-sm border border-zinc-200 p-3 animate-fade-in">
            <FilterToolbar />

            {/* Calendar Grid */}
            <div className="border border-zinc-200 rounded-lg sm:rounded-xl overflow-hidden mt-3">
                <div className="grid grid-cols-7 border-b border-zinc-200 bg-zinc-50">
                    {['日','一','二','三','四','五','六'].map(d => (
                        <div key={d} className="py-1 sm:text-[9px] font-bold text-zinc-400 text-center">{d}</div>
                    ))}
                </div>
                <div className="grid grid-cols-7 min-h-[320px] sm:min-h-[400px] lg:min-h-[500px] bg-zinc-100 gap-px border-b border-zinc-200">
                    {/* Empty cells */}
                    {Array.from({ length: getFirstDayOfMonth(viewYear, viewMonth) }).map((_, i) => (
                        <div key={`prev-${i}`} className="bg-white/50 h-12 sm:h-16 lg:h-20 p-0.5" />
                    ))}
                    {/* Day cells */}
                    {Array.from({ length: getDaysInMonth(viewYear, viewMonth) }, (_, i) => i + 1).map(day => {
                        const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                        const dayRecords = displayRecords.filter(r => r.date === dateStr);
                        
                        // Group by Subject for display
                        const subjectsOnDay = Array.from(new Set(dayRecords.map(r => r.subject)));

                        return (
                            <div key={day} className="bg-white h-12 sm:h-16 lg:h-20 p-0.5 overflow-y-auto custom-scrollbar group hover:bg-zinc-50/50 transition-colors">
                                <div className="text-[9px] sm:text-sm font-semibold text-zinc-700 mb-0.5 flex justify-between">
                                    <span>{day}</span>
                                </div>
                                <div className="flex flex-wrap gap-0.5 content-start">
                                    {subjectsOnDay.slice(0, window.innerWidth < 640 ? 2 : 3).map(sub => {
                                        const subRecords = dayRecords.filter(r => r.subject === sub);
                                        const count = subRecords.length;
                                        // Check if any record in this group is 'absent'
                                        const hasAbsence = subRecords.some(r => r.status === 'absent');

                                        return (
                                            <button
                                                key={sub}
                                                onClick={() => setDayModalData({ date: dateStr, subject: sub })}
                                                className={`w-full text-left px-1 py-0.5 rounded border text-[7px] sm:text-xs font-bold transition-all hover:scale-[1.02] shadow-sm flex justify-between items-center ${SUBJECT_COLORS[sub]} ${hasAbsence ? 'ring-1 ring-rose-200' : ''}`}
                                            >
                                                <span className="truncate">{sub}</span>
                                                <div className="flex items-center gap-0.5 flex-shrink-0">
                                                     {hasAbsence && <span className="w-1 h-1.5 rounded-full bg-rose-500"></span>}
                                                     <span className="bg-white/50 px-0.5 rounded text-[6px]">{count}</span>
                                                </div>
                                            </button>
                                        );
                                    })}
                                    {subjectsOnDay.length > (window.innerWidth < 640 ? 2 : 3) && (
                                        <div className="text-[6px] sm:text-xs text-zinc-400 px-1 py-0.5">+{subjectsOnDay.length - (window.innerWidth < 640 ? 2 : 3)}</div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                     {/* Fill remaining cells */}
                     {Array.from({ length: 42 - (getFirstDayOfMonth(viewYear, viewMonth) + getDaysInMonth(viewYear, viewMonth)) }).map((_, i) => (
                        <div key={`next-${i}`} className="bg-white/50 h-12 sm:h-16 lg:h-20" />
                    ))}
                </div>
            </div>
        </div>
    ) : (
        // ================= LIST MANAGEMENT MODE =================
        <div className="bg-white rounded-xl sm:rounded-2xl lg:rounded-3xl shadow-sm border border-zinc-200 p-3 animate-fade-in">
             <FilterToolbar />
             
             <div className="overflow-x-auto rounded-md border border-zinc-200 mt-3">
                <table className="w-full text-[10px] sm:text-sm text-left min-w-[350px]">
                    <thead className="bg-zinc-50 text-zinc-500 font-medium text-[9px] sm:text-xs uppercase">
                        <tr>
                            <th className="px-2 py-2 sm:py-3 rounded-tl-md sm:rounded-tl-xl">日期</th>
                            <th className="px-2 py-2 sm:py-3">学生姓名</th>
                            <th className="px-2 py-2 sm:py-3">科目</th>
                            <th className="px-2 py-2 sm:py-3 text-center">课时</th>
                            <th className="px-2 py-2 sm:py-3">状态</th>
                            <th className="px-2 py-2 sm:py-3 text-right rounded-tr-md sm:rounded-tr-xl">操作</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100 bg-white">
                        {displayRecords.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-2 py-6 text-center text-zinc-400 italic text-[9px] sm:text-sm">
                                    当前筛选条件下无记录
                                </td>
                            </tr>
                        ) : (
                            displayRecords.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(record => {
                                const stu = students.find(s => s.id === record.studentId);
                                return (
                                    <tr key={record.id} className="hover:bg-zinc-50/50 transition-colors group">
                                        <td className="px-2 py-2 font-mono text-zinc-500 text-[9px] sm:text-sm">{record.date}</td>
                                        <td className="px-2 py-2 font-bold text-zinc-800 text-[9px] sm:text-sm truncate max-w-[50px] sm:max-w-none">{stu?.name}</td>
                                        <td className="px-2 py-2">
                                            <span className={`px-1 sm:px-2 py-0.5 rounded-md text-[8px] sm:text-xs font-bold border ${SUBJECT_COLORS[record.subject]}`}>
                                                {record.subject}
                                            </span>
                                        </td>
                                        <td className="px-2 py-2 text-center">
                                            <span className="font-medium text-[9px] sm:text-sm">{record.count}</span>
                                            {record.materialFee > 0 && <div className="text-[8px] sm:text-[10px] text-orange-500 font-medium">+¥{record.materialFee}</div>}
                                        </td>
                                        <td className="px-2 py-2">
                                            <span className={`inline-flex items-center gap-1 px-1 sm:px-2 py-1 rounded-full text-[8px] sm:text-xs font-bold ${record.status === 'present' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                                                {record.status === 'present' ? <CheckCircle2 size={8} /> : <XCircle size={8} />}
                                                <span className="hidden sm:inline">{record.status === 'present' ? '正常到课' : '请假'}</span>
                                                <span className="sm:hidden">{record.status === 'present' ? '正常' : '请假'}</span>
                                            </span>
                                        </td>
                                        <td className="px-2 py-2 text-right">
                                            <button 
                                                onClick={() => handleDeleteRecord(record.id)}
                                                className="p-1 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                                                title="删除记录"
                                            >
                                                <Trash2 size={10} />
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
             </div>
             <div className="mt-2 text-right text-[9px] sm:text-xs text-zinc-400">
                共 {displayRecords.length} 条记录
             </div>
        </div>
    )}

    {/* Render Portal Modal */}
    {renderDayModal()}

    </div>
  );
};

export default RecordManager;