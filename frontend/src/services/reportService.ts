import api from './api'
import type { ApiResponse, ReportData, BudgetStatus } from '../types'

export const reportApi = {
  getWeekly(childId: number) {
    return api.get<ApiResponse<ReportData>>(`/reports/weekly/${childId}`)
  },
  getMonthly(childId: number) {
    return api.get<ApiResponse<ReportData>>(`/reports/monthly/${childId}`)
  },
  getBudgetStatus() {
    return api.get<ApiResponse<BudgetStatus>>('/reports/budget')
  },
  addBudget(amount: number) {
    return api.post<ApiResponse<BudgetStatus>>('/reports/budget/add', { amount })
  },
}
