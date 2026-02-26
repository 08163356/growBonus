import { pointRecordDAO } from '../database/dao/PointRecordDAO';
import { familyDAO } from '../database/dao/FamilyDAO';

function localDateStr(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export const reportService = {
  getWeeklyReport(childId: number) {
    const now = new Date();
    // 本周一为起始（周一=1）
    const dayOfWeek = now.getDay() || 7; // Sunday=7
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - dayOfWeek + 1);
    const startDate = localDateStr(weekStart);
    const endDate = localDateStr(now);

    // 上周数据
    const lastWeekStart = new Date(weekStart);
    lastWeekStart.setDate(lastWeekStart.getDate() - 7);
    const lastWeekEnd = new Date(weekStart);
    lastWeekEnd.setDate(lastWeekEnd.getDate() - 1);

    const dailyData = pointRecordDAO.getDateRangeSummary(childId, startDate, endDate);
    const categoryData = pointRecordDAO.getCategorySummary(childId, startDate, endDate);

    const currentTotal = dailyData.reduce((sum: number, d: any) => sum + d.total_points, 0);

    const lastWeekData = pointRecordDAO.getDateRangeSummary(
      childId,
      localDateStr(lastWeekStart),
      localDateStr(lastWeekEnd)
    );
    const lastTotal = lastWeekData.reduce((sum: number, d: any) => sum + d.total_points, 0);

    const changePercent = lastTotal > 0 ? Math.round(((currentTotal - lastTotal) / lastTotal) * 100) : (currentTotal > 0 ? 100 : 0);

    return {
      period: 'weekly',
      startDate,
      endDate,
      totalPoints: currentTotal,
      changePercent,
      dailyData,
      categoryData,
    };
  },

  getMonthlyReport(childId: number) {
    const now = new Date();
    const startDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
    const endDate = localDateStr(now);

    // 上月数据
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

    const dailyData = pointRecordDAO.getDateRangeSummary(childId, startDate, endDate);
    const categoryData = pointRecordDAO.getCategorySummary(childId, startDate, endDate);

    const currentTotal = dailyData.reduce((sum: number, d: any) => sum + d.total_points, 0);

    const lastMonthData = pointRecordDAO.getDateRangeSummary(
      childId,
      localDateStr(lastMonth),
      localDateStr(lastMonthEnd)
    );
    const lastTotal = lastMonthData.reduce((sum: number, d: any) => sum + d.total_points, 0);

    const changePercent = lastTotal > 0 ? Math.round(((currentTotal - lastTotal) / lastTotal) * 100) : (currentTotal > 0 ? 100 : 0);

    return {
      period: 'monthly',
      startDate,
      endDate,
      totalPoints: currentTotal,
      changePercent,
      dailyData,
      categoryData,
    };
  },

  getBudgetStatus(familyId: number) {
    return familyDAO.getBudgetStatus(familyId);
  },
};
