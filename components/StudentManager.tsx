import React, { useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Student, Grade, Subject } from '../types';
import { GRADE_OPTIONS, SUBJECT_OPTIONS } from '../constants';
import { Search, Plus, Grid, List, Trash2, Edit3, ChevronDown } from 'lucide-react';

function StudentModal({ isOpen, onClose, editingStudent, formData, setFormData, onSave, onDelete }) {
  if (!isOpen) return null;

  const handleSave = useCallback(() => {
    if (onSave) onSave();
  }, [onSave]);

  const handleCancel = useCallback(() => {
    if (onClose) onClose();
  }, [onClose]);

  return createPortal(
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
        <h3 className="text-xl font-bold text-zinc-900 mb-4">
          {editingStudent ? '编辑学生' : '添加学生'}
        </h3>
        
        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">姓名</label>
            <input
              type="text"
              value={formData.name || ''}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-zinc-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              placeholder="请输入学生姓名"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">手机号</label>
            <input
              type="tel"
              value={formData.phone || ''}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-3 py-2 border border-zinc-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              placeholder="请输入手机号"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">年级</label>
            <select
              value={formData.grade || ''}
              onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
              className="w-full px-3 py-2 border border-zinc-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            >
              <option value="">请选择年级</option>
              {GRADE_OPTIONS.map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">科目 (可多选)</label>
            <div className="flex flex-wrap gap-2">
              {SUBJECT_OPTIONS.map((subject) => {
                const isSelected = formData.subjects?.includes(subject) || false;
                return (
                  <button
                    key={subject}
                    type="button"
                    onClick={() => {
                      const currentSubjects = formData.subjects || [];
                      let newSubjects;
                      if (isSelected) {
                        newSubjects = currentSubjects.filter((s) => s !== subject);
                      } else {
                        newSubjects = [...currentSubjects, subject];
                      }
                      setFormData({ ...formData, subjects: newSubjects });
                    }}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium border transition-all ${isSelected
                      ? 'bg-emerald-500 border-emerald-500 text-white shadow-sm'
                      : 'bg-white border-zinc-200 text-zinc-700 hover:bg-zinc-50'}`}
                  >
                    {subject}
                  </button>
                );
              })}
            </div>
            {formData.subjects?.length === 0 && (
              <p className="text-xs text-zinc-400 mt-1">请至少选择一个科目</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">是否老生</label>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isOldStudent"
                checked={formData.isOldStudent || false}
                onChange={(e) => setFormData({ ...formData, isOldStudent: e.target.checked })}
                className="h-4 w-4 text-emerald-600 border-zinc-300 rounded focus:ring-emerald-500"
              />
              <label htmlFor="isOldStudent" className="ml-2 text-sm text-zinc-700">标记为老生</label>
            </div>
          </div>
        </div>
        
        <div className="flex justify-end gap-3">
          {editingStudent && (
            <button
              onClick={() => {
                if (onDelete) onDelete();
              }}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors"
            >
              删除
            </button>
          )}
          <button
            onClick={handleCancel}
            className="px-4 py-2 text-sm font-medium text-zinc-700 bg-zinc-100 rounded-md hover:bg-zinc-200 transition-colors"
          >
            取消
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-md hover:bg-emerald-700 transition-colors"
          >
            保存
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

function StudentManager({ students, setStudents }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterGrade, setFilterGrade] = useState('All');
  const [filterSubject, setFilterSubject] = useState('All');
  const [viewMode, setViewMode] = useState('card');
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    grade: '',
    subjects: [],
    isOldStudent: false
  });

  const handleOpenModal = useCallback((student = null) => {
    if (student) {
      setEditingStudent(student);
      setFormData({
        name: student.name,
        phone: student.phone,
        grade: student.grade,
        subjects: student.subjects || [],
        isOldStudent: student.isOldStudent || false
      });
    } else {
      setEditingStudent(null);
      setFormData({
        name: '',
        phone: '',
        grade: '',
        subjects: [],
        isOldStudent: false
      });
    }
    setIsModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setEditingStudent(null);
  }, []);

  const handleSave = useCallback(() => {
    if (!formData.name || !formData.phone || !formData.grade || formData.subjects.length === 0) {
      alert('请填写所有必填字段');
      return;
    }

    if (editingStudent) {
      setStudents(students.map(s => 
        s.id === editingStudent.id 
          ? { ...s, ...formData }
          : s
      ));
    } else {
      const newStudent = {
        id: Date.now().toString(),
        ...formData,
        createdAt: new Date().toISOString()
      };
      setStudents([...students, newStudent]);
    }
    handleCloseModal();
  }, [formData, editingStudent, students, setStudents, handleCloseModal]);

  const handleDelete = useCallback(() => {
    if (editingStudent) {
      setStudents(students.filter(s => s.id !== editingStudent.id));
      handleCloseModal();
    }
  }, [editingStudent, students, setStudents, handleCloseModal]);

  const filteredStudents = students.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) || s.phone.includes(searchQuery);
    const matchesGrade = filterGrade === 'All' || s.grade === filterGrade;
    const matchesSubject = filterSubject === 'All' || s.subjects.includes(filterSubject);
    return matchesSearch && matchesGrade && matchesSubject;
  });

  return (
    <div className="space-y-8">
      {/* 头部区域 */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h2 className="text-3xl font-bold text-zinc-900 tracking-tight">学生档案</h2>
          <p className="text-zinc-500 mt-1">管理所有学员信息与课程。</p>
        </div>
        
        <button
          onClick={() => handleOpenModal()}
          className="px-4 py-2 bg-emerald-600 text-white rounded-md flex items-center gap-2 hover:bg-emerald-700 transition-colors"
        >
          <Plus size={18} />
          <span>添加学生</span>
        </button>
      </div>

      {/* 筛选栏 */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-zinc-100">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* 搜索框 */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400" size={18} />
            <input
              type="text"
              placeholder="搜索学生姓名或手机号"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-zinc-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>
          
          {/* 年级筛选 */}
          <div>
            <select
              value={filterGrade}
              onChange={(e) => setFilterGrade(e.target.value)}
              className="w-full px-3 py-2 border border-zinc-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent appearance-none bg-white pr-10 relative"
            >
              <option value="All">全部年级</option>
              {GRADE_OPTIONS.map(g => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-zinc-400">
              <ChevronDown size={18} />
            </div>
          </div>
          
          {/* 科目筛选 */}
          <div>
            <select
              value={filterSubject}
              onChange={(e) => setFilterSubject(e.target.value)}
              className="w-full px-3 py-2 border border-zinc-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent appearance-none bg-white pr-10 relative"
            >
              <option value="All">全部科目</option>
              {SUBJECT_OPTIONS.map(subject => (
                <option key={subject} value={subject}>{subject}</option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-zinc-400">
              <ChevronDown size={18} />
            </div>
          </div>
          
          {/* 视图切换 */}
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setViewMode('card')}
              className={`p-2.5 rounded-md transition-colors ${viewMode === 'card' ? 'bg-white text-emerald-600 shadow-sm' : 'text-zinc-500 hover:text-zinc-700'}`}
              title="卡片视图"
              aria-label="卡片视图"
            >
              <Grid size={18} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2.5 rounded-md transition-colors ${viewMode === 'list' ? 'bg-white text-emerald-600 shadow-sm' : 'text-zinc-500 hover:text-zinc-700'}`}
              title="列表视图"
              aria-label="列表视图"
            >
              <List size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* 卡片视图 */}
      {viewMode === 'card' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredStudents.map(student => (
            <div key={student.id} className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-lg border border-zinc-100 hover:border-zinc-200 transition-all duration-300 ease-in-out transform hover:-translate-y-1 overflow-hidden group relative">
              {/* 学生信息 */}
              <div className="relative z-10">
                <h3 className="text-lg font-semibold text-zinc-900 mb-2">{student.name}</h3>
                <p className="text-zinc-600 text-sm mb-1">手机: {student.phone}</p>
                <p className="text-zinc-600 text-sm mb-1">年级: {student.grade}</p>
                <p className="text-zinc-600 text-sm mb-3">科目: {student.subjects?.join(', ') || '-'}</p>
                
                {/* 操作按钮 */}
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => handleOpenModal(student)}
                    className="flex-1 px-3 py-1.5 text-sm text-emerald-600 bg-emerald-50 rounded-md hover:bg-emerald-100 transition-colors"
                  >
                    编辑
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`确定要删除学生 ${student.name} 吗？`)) {
                        setStudents(students.filter(s => s.id !== student.id));
                      }
                    }}
                    className="flex-1 px-3 py-1.5 text-sm text-red-600 bg-red-50 rounded-md hover:bg-red-100 transition-colors"
                  >
                    删除
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 列表视图 */}
      {viewMode === 'list' && (
        <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-zinc-50 border-b border-zinc-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">姓名</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">手机</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">年级</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">科目</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">是否老生</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-zinc-500 uppercase tracking-wider">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200">
                {filteredStudents.map(student => (
                  <tr key={student.id} className="hover:bg-zinc-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-zinc-900">{student.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-600">{student.phone}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-600">{student.grade}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-600">{student.subjects?.join(', ') || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-600">
                      {student.isOldStudent ? '是' : '否'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-3">
                        <button
                          onClick={() => handleOpenModal(student)}
                          className="text-emerald-600 hover:text-emerald-800"
                          aria-label="编辑"
                        >
                          <Edit3 size={18} />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`确定要删除学生 ${student.name} 吗？`)) {
                              setStudents(students.filter(s => s.id !== student.id));
                            }
                          }}
                          className="text-red-600 hover:text-red-800"
                          aria-label="删除"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* 移动端列表视图 */}
          <div className="md:hidden">
            {filteredStudents.map(student => (
              <div key={student.id} className="p-4 border-b border-zinc-200 last:border-0">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-semibold text-zinc-900">{student.name}</h4>
                    <p className="text-sm text-zinc-600">{student.phone}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleOpenModal(student)}
                      className="p-1.5 text-emerald-600"
                      aria-label="编辑"
                    >
                      <Edit3 size={18} />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`确定要删除学生 ${student.name} 吗？`)) {
                          setStudents(students.filter(s => s.id !== student.id));
                        }
                      }}
                      className="p-1.5 text-red-600"
                      aria-label="删除"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
                <div className="text-sm text-zinc-600 space-y-1">
                  <p>年级: {student.grade}</p>
                  <p>科目: {student.subjects?.join(', ') || '-'}</p>
                  <p>是否老生: {student.isOldStudent ? '是' : '否'}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 学生编辑模态框 */}
      <StudentModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        editingStudent={editingStudent}
        formData={formData}
        setFormData={setFormData}
        onSave={handleSave}
        onDelete={handleDelete}
      />
    </div>
  );
}

export default StudentManager;