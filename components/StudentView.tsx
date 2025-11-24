import React, { useState, useMemo } from 'react';
import { 
  Calendar, 
  List, 
  Filter, 
  BookOpen, 
  CheckCircle, 
  XCircle, 
  Clock,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  Phone,
  User,
  Search,
  Download
} from 'lucide-react';

interface Student {
  id: string;
  name: string;
  phone: string;
  email?: string;
  grade?: string;
}

interface Record {
  id: string;
  studentId: string;
  date: string;
  subject: string;
  attendance: 'present' | 'absent' | 'late';
  startTime?: string;
  endTime?: string;
  notes?: string;
  teacher?: string;
  courseFee?: number;
  materialFee?: number;
}

interface StudentViewProps {
  student: Student;
  records: Record[];
  onBack: () => void;
}

const SUBJECTS = ['语文', '数学', '英语', '物理', '化学', '生物', '历史', '地理', '政治'];
const ATTENDANCE_TYPES = [
  { value: 'all', label: '全部', icon: Filter, color: 'text-zinc-500' },
  { value: 'present', label: '出勤', icon: CheckCircle, color: 'text-emerald-500' },
  { value: 'late', label: '迟到', icon: Clock, color: 'text-amber-500' },
  { value: 'absent', label: '请假', icon: XCircle, color: 'text-rose-500' }
];

const StudentView: React.FC<StudentViewProps> = ({ student, records, onBack }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [selectedAttendance, setSelectedAttendance] = useState<string>('all');

  // 过滤本月记录
  const monthlyRecords = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    return records.filter(record => {
      const recordDate = new Date(record.date);
      const isCurrentMonth = recordDate.getFullYear() === year && recordDate.getMonth() === month;
      const matchesSubject = selectedSubject === 'all' || record.subject === selectedSubject;
      const matchesAttendance = selectedAttendance === 'all' || record.attendance === selectedAttendance;
      
      return isCurrentMonth && matchesSubject && matchesAttendance;
    });
  }, [records, currentMonth, selectedSubject, selectedAttendance]);

  // 统计信息
  const stats = useMemo(() => {
    const total = monthlyRecords.length;
    const present = monthlyRecords.filter(r => r.attendance === 'present').length;
    const late = monthlyRecords.filter(r => r.attendance === 'late').length;
    const absent = monthlyRecords.filter(r => r.attendance === 'absent').length;
    
    return { total, present, late, absent };
  }, [monthlyRecords]);

  // 生成月份日期
  const monthDates = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const dates = [];
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 41); // 6周
    
    for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
      dates.push(new Date(date));
    }
    
    return dates;
  }, [currentMonth]);

  const getDateRecords = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return monthlyRecords.filter(record => record.date === dateStr);
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      return newDate;
    });
  };

  const formatMonth = (date: Date) => {
    return `${date.getFullYear()}年${date.getMonth() + 1}月`;
  };

  const exportRecords = () => {
    const data = monthlyRecords.map(record => ({
      '日期': record.date,
      '科目': record.subject,
      '出勤状态': ATTENDANCE_TYPES.find(t => t.value === record.attendance)?.label || record.attendance,
      '开始时间': record.startTime || '',
      '结束时间': record.endTime || '',
      '授课教师': record.teacher || '',
      '课时费': record.courseFee || '',
      '课本费': record.materialFee || '',
      '备注': record.notes || ''
    }));
    
    const csv = [
      Object.keys(data[0] || {}).join(','),
      ...data.map(row => Object.values(row).join(','))
    ].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${student.name}_${formatMonth(currentMonth)}_出勤记录.csv`;
    link.click();
  };

  return (
    <div className="min-h-screen bg-zinc-50">
      {/* Header */}
      <div className="bg-white border-b border-zinc-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-12 sm:h-16">
            <div className="flex items-center gap-1.5 sm:gap-4">
              <button
                onClick={onBack}
                className="p-1 sm:p-1.5 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 rounded-md sm:rounded-lg transition-colors"
              >
                <ChevronLeft size={14} className="sm:w-[16px] lg:w-[18px]" />
              </button>
              <div className="flex items-center gap-1.5 sm:gap-3">
                <div className="w-7 h-7 sm:w-10 sm:h-10 bg-emerald-600 text-white rounded-md sm:rounded-xl flex items-center justify-center">
                  <GraduationCap size={12} className="sm:w-[14px] lg:w-[16px]" />
                </div>
                <div>
                  <h1 className="text-sm sm:text-lg font-semibold text-zinc-900">学生出勤查看</h1>
                  <p className="text-[10px] sm:text-sm text-zinc-500 hidden sm:block">EduTrack 课程结算管理系统</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        {/* Student Info Card */}
        <div className="bg-white rounded-lg sm:rounded-xl lg:rounded-2xl shadow-sm border border-zinc-200 p-3 sm:p-4 lg:p-6 mb-3 sm:mb-4 lg:mb-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2 sm:gap-3 lg:gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-16 lg:h-16 bg-gradient-to-br from-emerald-500 to-emerald-600 text-white rounded-lg sm:rounded-xl lg:rounded-2xl flex items-center justify-center text-base sm:text-lg lg:text-xl font-bold">
                {student.name.charAt(0)}
              </div>
              <div>
                <h2 className="text-base sm:text-lg lg:text-2xl font-bold text-zinc-900">{student.name}</h2>
                <div className="flex items-center gap-1.5 sm:gap-2 lg:gap-4 mt-1 sm:mt-2 text-zinc-600">
                  <div className="flex items-center gap-1">
                    <Phone size={11} className="sm:w-[12px] lg:w-[14px]" />
                    <span className="text-[10px] sm:text-xs lg:text-sm">{student.phone}</span>
                  </div>
                  {student.grade && (
                    <div className="flex items-center gap-1">
                      <User size={11} className="sm:w-[12px] lg:w-[14px]" />
                      <span className="text-[10px] sm:text-xs lg:text-sm hidden sm:inline">{student.grade}</span>
                      <span className="text-[10px] sm:text-xs lg:text-sm sm:hidden">{student.grade.split('级')[0]}级</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <button
              onClick={exportRecords}
              className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 lg:px-4 py-1.5 sm:py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md sm:rounded-lg lg:rounded-xl font-medium transition-colors"
            >
              <Download size={11} className="sm:w-[12px] lg:w-[14px]" />
              <span className="hidden sm:inline">导出记录</span>
              <span className="sm:hidden">导出</span>
            </button>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="bg-white rounded-lg sm:rounded-xl lg:rounded-2xl p-3 sm:p-4 lg:p-6 shadow-sm border border-zinc-200 mb-3 sm:mb-4 lg:mb-6">
          <div className="flex flex-col lg:flex-row gap-2 sm:gap-3 lg:gap-6">
            {/* Month Navigation */}
            <div className="flex items-center gap-2 sm:gap-3 lg:gap-4">
              <button
                onClick={() => navigateMonth('prev')}
                className="p-1.5 sm:p-2 lg:p-3 bg-zinc-100 hover:bg-zinc-200 rounded-md sm:rounded-lg lg:rounded-xl transition-colors"
              >
                <ChevronLeft size={12} className="sm:w-[14px] lg:w-[16px] text-zinc-600" />
              </button>
              <span className="text-xs sm:text-sm lg:text-base font-semibold text-zinc-900 min-w-[80px] sm:min-w-[100px] lg:min-w-[120px] text-center">
                {formatMonth(currentMonth)}
              </span>
              <button
                onClick={() => navigateMonth('next')}
                className="p-1.5 sm:p-2 lg:p-3 bg-zinc-100 hover:bg-zinc-200 rounded-md sm:rounded-lg lg:rounded-xl transition-colors"
              >
                <ChevronRight size={12} className="sm:w-[14px] lg:w-[16px] text-zinc-600" />
              </button>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-1.5 sm:gap-2 lg:gap-4">
              <div className="relative min-w-[80px] sm:min-w-[100px]">
                <Filter size={11} className="sm:w-[12px] lg:w-[14px] absolute left-2.5 sm:left-3 top-1/2 transform -translate-y-1/2 text-zinc-400" />
                <select
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  className="w-full pl-8 sm:pl-10 pr-2.5 sm:pr-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-zinc-300 rounded-md sm:rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                >
                  <option value="">全部科目</option>
                  {SUBJECTS.map((subject) => (
                    <option key={subject} value={subject}>{subject}</option>
                  ))}
                </select>
              </div>

              <div className="relative min-w-[80px] sm:min-w-[100px]">
                <Calendar size={11} className="sm:w-[12px] lg:w-[14px] absolute left-2.5 sm:left-3 top-1/2 transform -translate-y-1/2 text-zinc-400" />
                <select
                  value={selectedAttendance}
                  onChange={(e) => setSelectedAttendance(e.target.value)}
                  className="w-full pl-8 sm:pl-10 pr-2.5 sm:pr-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-zinc-300 rounded-md sm:rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                >
                  <option value="">全部状态</option>
                  <option value="present">出勤</option>
                  <option value="late">迟到</option>
                  <option value="absent">缺席</option>
                </select>
              </div>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-1 sm:gap-2 lg:gap-2">
              <button
                onClick={() => setViewMode('calendar')}
                className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-3 lg:px-4 py-1.5 sm:py-2 rounded-md sm:rounded-lg lg:rounded-xl transition-colors ${
                  viewMode === 'calendar'
                    ? 'bg-emerald-500 text-white'
                    : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-600'
                }`}
              >
                <Calendar size={10} className="sm:w-[12px] lg:w-[14px]" />
                <span className="text-xs sm:text-sm font-medium">月视图</span>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-3 lg:px-4 py-1.5 sm:py-2 rounded-md sm:rounded-lg lg:rounded-xl transition-colors ${
                  viewMode === 'list'
                    ? 'bg-emerald-500 text-white'
                    : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-600'
                }`}
              >
                <List size={10} className="sm:w-[12px] lg:w-[14px]" />
                <span className="text-xs sm:text-sm font-medium">列表视图</span>
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 lg:gap-6 mb-3 sm:mb-4 lg:mb-6">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="bg-white rounded-lg sm:rounded-xl lg:rounded-2xl p-3 sm:p-4 lg:p-6 shadow-sm border border-zinc-200"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] sm:text-xs lg:text-sm font-medium text-zinc-600 mb-1">{stat.label}</p>
                  <p className="text-lg sm:text-xl lg:text-2xl font-bold text-zinc-900">{stat.value}</p>
                </div>
                <div className={`p-1.5 sm:p-2 lg:p-3 rounded-md sm:rounded-lg lg:rounded-xl ${stat.bg}`}>
                  <stat.icon size={12} className={`sm:w-[14px] lg:w-[16px] ${stat.color}`} />
                </div>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2 mt-2 sm:mt-3 lg:mt-4">
                <div className="flex items-center gap-1">
                  <div className={`w-1 h-1 sm:w-1.5 sm:h-1.5 lg:w-2 lg:h-2 rounded-full ${stat.dotColor}`}></div>
                  <span className="text-[10px] sm:text-xs lg:text-sm text-zinc-600">{stat.percentage}%</span>
                </div>
                <span className="text-[10px] sm:text-xs lg:text-sm text-zinc-500">出勤率</span>
              </div>
            </div>
          ))}
        </div>

        {/* Content Area */}
        {viewMode === 'calendar' ? (
          <div className="bg-white rounded-lg sm:rounded-xl lg:rounded-2xl shadow-sm border border-zinc-200 overflow-hidden">
            {/* Calendar Header */}
            <div className="grid grid-cols-7 bg-zinc-50 border-b border-zinc-200">
              {['日', '一', '二', '三', '四', '五', '六'].map(day => (
                <div key={day} className="p-1.5 sm:p-2 lg:p-4 text-[10px] sm:text-[11px] lg:text-sm font-medium text-zinc-600 text-center">
                  {day}
                </div>
              ))}
            </div>
            {/* Calendar Grid */}
            <div className="grid grid-cols-7">
              {monthDates.map((date, index) => {
                const isCurrentMonth = date.getMonth() === currentMonth.getMonth();
                const dateRecords = getDateRecords(date);
                const isToday = date.toDateString() === new Date().toDateString();
                
                return (
                  <div
                    key={index}
                    className={`min-h-20 sm:min-h-24 lg:min-h-32 border-b border-r border-zinc-200 p-1 sm:p-1.5 lg:p-2 ${
                      !isCurrentMonth ? 'bg-zinc-50 text-zinc-400' : 'bg-white'
                    } ${isToday ? 'bg-blue-50' : ''}`}
                  >
                    <div className={`text-[10px] sm:text-[11px] lg:text-sm font-medium mb-1 sm:mb-1.5 lg:mb-2 ${isToday ? 'text-blue-600' : isCurrentMonth ? 'text-zinc-900' : 'text-zinc-400'}`}>
                      {date.getDate()}
                    </div>
                    <div className="space-y-0.5 sm:space-y-1">
                      {dateRecords.slice(0, 2).map(record => {
                        const attendanceType = ATTENDANCE_TYPES.find(t => t.value === record.attendance);
                        return (
                          <div
                            key={record.id}
                            className={`text-[9px] sm:text-[10px] lg:text-xs p-0.5 sm:p-0.5 lg:p-1 rounded border-l-2 ${
                              record.attendance === 'present' 
                                ? 'bg-emerald-50 border-emerald-500 text-emerald-700'
                                : record.attendance === 'late'
                                ? 'bg-amber-50 border-amber-500 text-amber-700'
                                : 'bg-rose-50 border-rose-500 text-rose-700'
                            }`}
                          >
                            <div className="font-medium truncate">{record.subject}</div>
                            <div className="flex items-center gap-1">
                              <attendanceType.icon size={7} className="sm:w-[8px] lg:w-[8px]" />
                              <span className="hidden lg:inline">{attendanceType?.label}</span>
                            </div>
                          </div>
                        );
                      })}
                      {dateRecords.length > 2 && (
                        <div className="text-[9px] sm:text-[10px] text-zinc-500">
                          +{dateRecords.length - 2}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg sm:rounded-xl lg:rounded-2xl shadow-sm border border-zinc-200 overflow-hidden">
            {monthlyRecords.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-zinc-50 border-b border-zinc-200">
                    <tr>
                      <th className="text-left p-2 sm:p-3 lg:p-4 text-[10px] sm:text-[11px] lg:text-sm font-semibold text-zinc-700">日期</th>
                      <th className="text-left p-2 sm:p-3 lg:p-4 text-[10px] sm:text-[11px] lg:text-sm font-semibold text-zinc-700">科目</th>
                      <th className="text-left p-2 sm:p-3 lg:p-4 text-[10px] sm:text-[11px] lg:text-sm font-semibold text-zinc-700">出勤状态</th>
                      <th className="text-left p-2 sm:p-3 lg:p-4 text-[10px] sm:text-[11px] lg:text-sm font-semibold text-zinc-700 hidden sm:table-cell">时间</th>
                      <th className="text-left p-2 sm:p-3 lg:p-4 text-[10px] sm:text-[11px] lg:text-sm font-semibold text-zinc-700 hidden sm:table-cell">教师</th>
                      <th className="text-left p-2 sm:p-3 lg:p-4 text-[10px] sm:text-[11px] lg:text-sm font-semibold text-zinc-700 hidden sm:table-cell">课时费</th>
                      <th className="text-left p-2 sm:p-3 lg:p-4 text-[10px] sm:text-[11px] lg:text-sm font-semibold text-zinc-700 hidden sm:table-cell">备注</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200">
                    {monthlyRecords.map(record => {
                      const attendanceType = ATTENDANCE_TYPES.find(t => t.value === record.attendance);
                      return (
                        <tr key={record.id} className="hover:bg-zinc-50 transition-colors">
                          <td className="p-2 sm:p-3 lg:p-4 text-[10px] sm:text-[11px] lg:text-sm text-zinc-900">
                            {new Date(record.date).toLocaleDateString('zh-CN')}
                          </td>
                          <td className="p-2 sm:p-3 lg:p-4 text-[10px] sm:text-[11px] lg:text-sm text-zinc-900 font-medium max-w-[60px] sm:max-w-[80px] truncate">
                            {record.subject}
                          </td>
                          <td className="p-2 sm:p-3 lg:p-4 text-[10px] sm:text-[11px] lg:text-sm">
                            <div className="flex items-center gap-1">
                              <attendanceType.icon size={8} className={`sm:w-[10px] lg:w-[10px] ${attendanceType.color}`} />
                              <span className={`${attendanceType.color} text-[9px] sm:text-xs lg:text-xs`}>{attendanceType.label}</span>
                            </div>
                          </td>
                          <td className="p-2 sm:p-3 lg:p-4 text-[10px] sm:text-[11px] lg:text-sm text-zinc-600 hidden sm:table-cell">
                            {record.startTime && record.endTime 
                              ? `${record.startTime}-${record.endTime}`
                              : '-'
                            }
                          </td>
                          <td className="p-2 sm:p-3 lg:p-4 text-[10px] sm:text-[11px] lg:text-sm text-zinc-600 hidden sm:table-cell max-w-[60px] sm:max-w-[80px] truncate">
                            {record.teacher || '-'}
                          </td>
                          <td className="p-2 sm:p-3 lg:p-4 text-[10px] sm:text-[11px] lg:text-sm text-zinc-600 hidden sm:table-cell">
                            {record.courseFee ? `¥${record.courseFee}` : '-'}
                          </td>
                          <td className="p-2 sm:p-3 lg:p-4 text-[10px] sm:text-[11px] lg:text-sm text-zinc-600 hidden sm:table-cell max-w-[80px] sm:max-w-[120px] truncate">
                            {record.notes || '-'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-6 sm:p-8 lg:p-12 text-center">
                <Search className="mx-auto w-6 h-6 sm:w-8 sm:h-8 lg:w-12 lg:h-12 text-zinc-300 mb-2 sm:mb-3 lg:mb-4" />
                <h3 className="text-sm sm:text-base lg:text-lg font-medium text-zinc-900 mb-1 sm:mb-2">没有找到记录</h3>
                <p className="text-[10px] sm:text-xs lg:text-sm text-zinc-500">该学生在选定条件下没有出勤记录</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentView;