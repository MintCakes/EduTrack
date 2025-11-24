export enum Subject {
  CHINESE = '语文',
  MATH = '数学',
  ENGLISH = '英语',
  PHYSICS = '物理',
  CHEMISTRY = '化学',
}

export enum Grade {
  G1 = '一年级',
  G2 = '二年级',
  G3 = '三年级',
  G4 = '四年级',
  G5 = '五年级',
  G6 = '六年级',
  M1 = '初一',
  M2 = '初二',
  M3 = '初三',
  H1 = '高一',
  H2 = '高二',
  H3 = '高三',
}

export interface Student {
  id: string;
  name: string;
  grade: Grade;
  phone: string;
  wechat?: string;
  isOldStudent: boolean;
  subjects: Subject[];
  remarks?: string;
}

export interface PriceRule {
  id: string;
  name: string;
  isActive: boolean;
  isLocked: boolean;
  createdAt: string;
  
  // Specific Pricing Logic
  chinesePrice: number; // e.g., 100
  nonChineseBasePrice: number; // 1-2 subjects, e.g., 85
  nonChineseDiscountNew: number; // 3+ subjects New, e.g., 76
  nonChineseDiscountOld: number; // 3+ subjects Old, e.g., 72
  nonChineseFourSubPrice: number; // 4 subjects, e.g., 72
}

export interface ClassRecord {
  id: string;
  studentId: string;
  subject: Subject;
  date: string; // ISO Date string YYYY-MM-DD
  count: number;
  status: 'present' | 'absent' | 'leave';
  teacher?: string;
  remarks?: string;
  materialFee: number;
}

export interface SettlementItem {
  subject: Subject;
  totalHours: number;
  pricePerHour: number;
  tuitionTotal: number;
  materialFeeTotal: number;
  subtotal: number;
}

export interface StudentSettlement {
  student: Student;
  items: SettlementItem[];
  totalAmount: number;
  totalHours: number;
  month: string; // YYYY-MM
}