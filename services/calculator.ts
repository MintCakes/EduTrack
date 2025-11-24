import { ClassRecord, PriceRule, Student, StudentSettlement, Subject, SettlementItem } from '../types';

export const calculateSettlement = (
  student: Student,
  records: ClassRecord[],
  priceRule: PriceRule
): StudentSettlement => {
  
  // 1. Group records by subject
  const recordsBySubject: Record<string, ClassRecord[]> = {};
  records.forEach(r => {
    if (!recordsBySubject[r.subject]) recordsBySubject[r.subject] = [];
    recordsBySubject[r.subject].push(r);
  });

  // 2. Identify Subject Categories
  const subjectsTaken = Object.keys(recordsBySubject) as Subject[];
  // const chineseTaken = subjectsTaken.includes(Subject.CHINESE); // Unused variable
  const nonChineseSubjects = subjectsTaken.filter(s => s !== Subject.CHINESE);
  const nonChineseCount = nonChineseSubjects.length;

  // 3. Determine Non-Chinese Price per Hour
  let nonChinesePrice = priceRule.nonChineseBasePrice; // Default 85

  if (nonChineseCount >= 4) {
    nonChinesePrice = priceRule.nonChineseFourSubPrice; // 72
  } else if (nonChineseCount === 3) {
    nonChinesePrice = student.isOldStudent 
      ? priceRule.nonChineseDiscountOld // 72
      : priceRule.nonChineseDiscountNew; // 76
  }
  // Else (1-2 subjects) remains base price (85)

  const items: SettlementItem[] = [];

  subjectsTaken.forEach(sub => {
    const subjectRecords = recordsBySubject[sub];
    
    // Calculate Total Hours (Only 'present' counts for tuition)
    const totalHours = subjectRecords.reduce((acc, r) => acc + (r.status === 'present' ? r.count : 0), 0);
    
    // Material Fee Logic: 
    // "Once per subject per month". We take the MAXIMUM value entered in any record for this month/subject.
    // This prevents double counting if entered multiple times and allows specific setting on a single record.
    const materialFeeTotal = Math.max(...subjectRecords.map(r => r.materialFee || 0), 0);

    let pricePerHour = 0;
    if (sub === Subject.CHINESE) {
      pricePerHour = priceRule.chinesePrice; // 100 Fixed
    } else {
      pricePerHour = nonChinesePrice;
    }

    const tuitionTotal = totalHours * pricePerHour;

    items.push({
      subject: sub,
      totalHours,
      pricePerHour,
      tuitionTotal,
      materialFeeTotal,
      subtotal: tuitionTotal + materialFeeTotal
    });
  });

  const totalAmount = items.reduce((acc, item) => acc + item.subtotal, 0);
  const totalHours = items.reduce((acc, item) => acc + item.totalHours, 0);

  return {
    student,
    items,
    totalAmount,
    totalHours,
    month: records[0]?.date.substring(0, 7) || new Date().toISOString().substring(0, 7)
  };
};