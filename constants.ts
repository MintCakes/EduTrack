import { Grade, PriceRule, Subject } from './types';

export const INITIAL_PRICE_RULES: PriceRule[] = [{
  id: 'default-v1',
  name: '2024年标准价格体系',
  isActive: true,
  isLocked: true,
  createdAt: new Date().toISOString(),
  chinesePrice: 100,
  nonChineseBasePrice: 85,    // 1-2 Subjects
  nonChineseDiscountNew: 76,  // 3 Subjects (New)
  nonChineseDiscountOld: 72,  // 3 Subjects (Old)
  nonChineseFourSubPrice: 72, // 4 Subjects (Any)
}];

export const SUBJECT_OPTIONS = Object.values(Subject);
export const GRADE_OPTIONS = Object.values(Grade);

export const SUBJECT_COLORS: Record<Subject, string> = {
  [Subject.CHINESE]: 'bg-rose-100 text-rose-700 border-rose-200',
  [Subject.MATH]: 'bg-blue-100 text-blue-700 border-blue-200',
  [Subject.ENGLISH]: 'bg-violet-100 text-violet-700 border-violet-200',
  [Subject.PHYSICS]: 'bg-cyan-100 text-cyan-700 border-cyan-200',
  [Subject.CHEMISTRY]: 'bg-emerald-100 text-emerald-700 border-emerald-200',
};

export const MOCK_STUDENTS = [
  {
    id: '1',
    name: '刘爱丽',
    grade: Grade.M2,
    phone: '13800138000',
    isOldStudent: true,
    subjects: [Subject.MATH, Subject.PHYSICS, Subject.ENGLISH],
    remarks: '重点辅导几何',
  },
  {
    id: '2',
    name: '张波',
    grade: Grade.H1,
    phone: '13900139000',
    isOldStudent: false,
    subjects: [Subject.CHINESE, Subject.MATH],
  }
];