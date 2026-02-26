<template>
  <div class="page-container" style="background: var(--theme-gradient-soft)">
    <!-- 顶部 -->
    <div class="px-page pt-4 pb-4">
      <div class="flex items-center justify-between mb-5">
        <h1 class="text-xl font-bold" style="color: var(--theme-text)">成长报告 📊</h1>
        <div class="flex items-center gap-2">
          <RoleSwitcher />
          <BackgroundSetter />
        </div>
      </div>

      <!-- 孩子选择器 -->
      <div class="flex gap-3 mb-5 overflow-x-auto hide-scrollbar scroll-area-safe">
        <button v-for="child in children" :key="child.id"
          class="shrink-0 flex flex-col items-center gap-1 p-2 rounded-2xl transition-all active:scale-95"
          :style="{
            background: selectedChildId === child.id ? 'var(--theme-primary)' : 'var(--theme-bg-card)',
            boxShadow: selectedChildId === child.id ? '0 4px 12px color-mix(in srgb, var(--theme-primary) 30%, transparent)' : '0 2px 8px rgba(0,0,0,0.06)',
          }"
          @click="selectChild(child.id)">
          <span class="text-2xl" :class="selectedChildId === child.id ? 'scale-110' : ''">{{ child.avatar || '👧' }}</span>
          <span class="text-xs font-semibold"
                :style="{ color: selectedChildId === child.id ? 'white' : 'var(--theme-text)' }">
            {{ child.name }}
          </span>
        </button>
      </div>

      <!-- 周/月切换 -->
      <div class="flex gap-3 mb-4">
        <button v-for="p in periods" :key="p.key"
          class="flex-1 py-2.5 rounded-2xl text-sm font-bold transition-all active:scale-95"
          :style="{
            background: period === p.key ? 'var(--theme-gradient)' : 'var(--theme-bg-card)',
            color: period === p.key ? 'white' : 'var(--theme-text-secondary)',
            boxShadow: period === p.key ? '0 4px 12px color-mix(in srgb, var(--theme-primary) 30%, transparent)' : '0 1px 4px rgba(0,0,0,0.06)',
          }"
          @click="switchPeriod(p.key)">
          {{ p.label }}
        </button>
      </div>
    </div>

    <!-- 加载中 -->
    <div v-if="loading" class="flex flex-col items-center justify-center py-20">
      <span class="text-4xl animate-float">📊</span>
      <p class="text-sm mt-3" style="color: var(--theme-text-light)">加载报告中...</p>
    </div>

    <template v-else>
      <!-- 积分总览卡片 -->
      <div class="px-page mb-6">
        <div class="card p-5">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-base font-bold" style="color: var(--theme-text)">
              {{ period === 'weekly' ? '本周' : '本月' }}积分
            </h3>
            <div v-if="reportData" class="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold"
                 :style="{
                   background: reportData.changePercent >= 0 ? '#E8F8F0' : '#FFF0F0',
                   color: reportData.changePercent >= 0 ? '#00B894' : '#FF7675',
                 }">
              {{ reportData.changePercent >= 0 ? '↑' : '↓' }}
              {{ Math.abs(reportData.changePercent) }}%
            </div>
          </div>

          <div class="flex items-end gap-2 mb-1">
            <span class="text-4xl font-black" style="color: var(--theme-primary)">
              {{ reportData?.totalPoints ?? 0 }}
            </span>
            <span class="text-sm mb-1" style="color: var(--theme-text-light)">分</span>
          </div>

          <p class="text-xs" style="color: var(--theme-text-light)">
            {{ reportData?.startDate }} ~ {{ reportData?.endDate }}
          </p>
        </div>
      </div>

      <!-- 积分趋势折线图 -->
      <div class="px-page mb-6">
        <div class="card p-5">
          <h3 class="text-base font-bold mb-4" style="color: var(--theme-text)">积分趋势 📈</h3>
          <div ref="lineChartRef" class="w-full" style="height: 220px"></div>
          <p v-if="!reportData?.dailyData?.length" class="text-center text-sm py-8" style="color: var(--theme-text-light)">
            暂无数据
          </p>
        </div>
      </div>

      <!-- 行为分类饼图 -->
      <div class="px-page mb-6">
        <div class="card p-5">
          <h3 class="text-base font-bold mb-4" style="color: var(--theme-text)">行为分类 🎯</h3>
          <div ref="pieChartRef" class="w-full" style="height: 240px"></div>
          <p v-if="!reportData?.categoryData?.length" class="text-center text-sm py-8" style="color: var(--theme-text-light)">
            暂无数据
          </p>
        </div>
      </div>

      <!-- 预算卡片 -->
      <div class="px-page mb-6">
        <div class="card p-5">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-base font-bold" style="color: var(--theme-text)">实物预算 💰</h3>
            <button v-if="authStore.isAdmin && !authStore.isGuest"
              class="text-xs font-semibold px-3 py-1.5 rounded-full active:scale-95 transition-all"
              style="background: var(--theme-bg-secondary); color: var(--theme-primary)"
              @click="showAddBudget = true">
              ＋ 追加预算
            </button>
          </div>

          <div class="flex items-center gap-4 mb-4">
            <div class="flex-1">
              <div class="flex justify-between text-xs mb-1.5">
                <span style="color: var(--theme-text-secondary)">已使用</span>
                <span class="font-bold" style="color: var(--theme-primary)">
                  ¥{{ budget.materialUsed }} / ¥{{ budget.materialBudget }}
                </span>
              </div>
              <div class="w-full h-3 rounded-full overflow-hidden" style="background: var(--theme-bg-secondary)">
                <div class="h-full rounded-full transition-all duration-700"
                     :style="{
                       width: budgetPercent + '%',
                       background: budgetPercent >= 80 ? 'linear-gradient(90deg, #FF7675, #E17055)' : 'var(--theme-gradient)',
                     }"></div>
              </div>
            </div>
            <div class="text-center shrink-0">
              <span class="text-2xl font-black" :style="{ color: budgetPercent >= 80 ? '#FF7675' : 'var(--theme-success)' }">
                {{ budgetPercent }}%
              </span>
            </div>
          </div>

          <div class="flex gap-3">
            <div class="flex-1 p-2.5 rounded-xl text-center" style="background: var(--theme-bg-secondary)">
              <p class="text-[10px]" style="color: var(--theme-text-light)">年度预算</p>
              <p class="text-sm font-bold" style="color: var(--theme-text)">¥{{ budget.materialBudget }}</p>
            </div>
            <div class="flex-1 p-2.5 rounded-xl text-center" style="background: var(--theme-bg-secondary)">
              <p class="text-[10px]" style="color: var(--theme-text-light)">已使用</p>
              <p class="text-sm font-bold" style="color: var(--theme-primary)">¥{{ budget.materialUsed }}</p>
            </div>
            <div class="flex-1 p-2.5 rounded-xl text-center" style="background: var(--theme-bg-secondary)">
              <p class="text-[10px]" style="color: var(--theme-text-light)">剩余</p>
              <p class="text-sm font-bold" style="color: var(--theme-success)">¥{{ budget.remaining }}</p>
            </div>
          </div>

          <p v-if="budgetPercent >= 80" class="text-xs mt-3 p-2 rounded-xl text-center font-semibold"
             style="background: #FFF0F0; color: #FF7675">
            ⚠️ 实物预算已使用超80%，请注意控制
          </p>
        </div>
      </div>
    </template>

    <!-- 追加预算弹窗 -->
    <teleport to="body">
      <transition name="page">
        <div v-if="showAddBudget" class="fixed inset-0 z-[100] flex items-center justify-center"
             @click.self="showAddBudget = false">
          <div class="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>
          <div class="relative mx-4 w-full max-w-[360px] card animate-bounce-in p-6 text-center">
            <div class="text-4xl mb-4">💰</div>
            <h3 class="text-lg font-bold mb-2" style="color: var(--theme-text)">追加预算</h3>
            <p class="text-sm mb-5" style="color: var(--theme-text-secondary)">
              当前预算 ¥{{ budget.materialBudget }}，输入追加金额
            </p>
            <input v-model.number="addBudgetAmount" type="number" class="input mb-5 text-center text-xl font-bold"
                   placeholder="输入金额" min="100" />
            <div class="flex gap-3">
              <button class="btn-secondary flex-1" @click="showAddBudget = false">取消</button>
              <button class="btn-primary flex-1" @click="doAddBudget" :disabled="!addBudgetAmount || addBudgetAmount < 100">
                确认追加
              </button>
            </div>
          </div>
        </div>
      </transition>
    </teleport>

    <BottomNav />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useAuthStore } from '../../stores/auth'
import { reportApi } from '../../services/reportService'
import { CATEGORY_CONFIG } from '../../utils/constants'
import type { ChildInfo, ReportData, BudgetStatus } from '../../types'
import BottomNav from '../../components/common/BottomNav.vue'
import BackgroundSetter from '../../components/common/BackgroundSetter.vue'
import RoleSwitcher from '../../components/common/RoleSwitcher.vue'

const authStore = useAuthStore()

const children = ref<ChildInfo[]>([])
const selectedChildId = ref(0)
const period = ref<'weekly' | 'monthly'>('weekly')
const loading = ref(false)
const reportData = ref<ReportData | null>(null)
const budget = ref<BudgetStatus>({ materialBudget: 3000, materialUsed: 0, remaining: 3000, pointsPerYuan: 10 })
const showAddBudget = ref(false)
const addBudgetAmount = ref<number>(1000)

const lineChartRef = ref<HTMLElement | null>(null)
const pieChartRef = ref<HTMLElement | null>(null)
let lineChart: any = null
let pieChart: any = null

const periods = [
  { key: 'weekly' as const, label: '📅 本周' },
  { key: 'monthly' as const, label: '📆 本月' },
]

const budgetPercent = computed(() => {
  if (budget.value.materialBudget === 0) return 0
  return Math.round((budget.value.materialUsed / budget.value.materialBudget) * 100)
})

function selectChild(id: number) {
  selectedChildId.value = id
  authStore.selectChild(id)
}

function switchPeriod(p: 'weekly' | 'monthly') {
  period.value = p
  loadReport()
}

async function loadReport() {
  if (!selectedChildId.value) return
  loading.value = true
  try {
    const [reportRes, budgetRes] = await Promise.all([
      period.value === 'weekly'
        ? reportApi.getWeekly(selectedChildId.value)
        : reportApi.getMonthly(selectedChildId.value),
      reportApi.getBudgetStatus(),
    ])
    if (reportRes.data.data) reportData.value = reportRes.data.data
    if (budgetRes.data.data) budget.value = budgetRes.data.data

    await nextTick()
    renderCharts()
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

async function renderCharts() {
  const echarts = await import('echarts')

  // 折线图
  if (lineChartRef.value && reportData.value?.dailyData?.length) {
    if (lineChart) lineChart.dispose()
    lineChart = echarts.init(lineChartRef.value)

    const dates = reportData.value.dailyData.map(d => {
      const date = new Date(d.date)
      return `${date.getMonth() + 1}/${date.getDate()}`
    })
    const points = reportData.value.dailyData.map(d => d.total_points)

    lineChart.setOption({
      grid: { left: 40, right: 16, top: 16, bottom: 30 },
      xAxis: {
        type: 'category',
        data: dates,
        axisLine: { lineStyle: { color: '#E8E8E8' } },
        axisLabel: { color: '#B2BEC3', fontSize: 11 },
      },
      yAxis: {
        type: 'value',
        axisLine: { show: false },
        splitLine: { lineStyle: { color: '#F5F5F5' } },
        axisLabel: { color: '#B2BEC3', fontSize: 11 },
      },
      series: [{
        type: 'line',
        data: points,
        smooth: true,
        symbol: 'circle',
        symbolSize: 8,
        lineStyle: {
          color: getComputedStyle(document.documentElement).getPropertyValue('--theme-primary').trim() || '#FF9F43',
          width: 3,
        },
        itemStyle: {
          color: getComputedStyle(document.documentElement).getPropertyValue('--theme-primary').trim() || '#FF9F43',
          borderColor: '#fff',
          borderWidth: 2,
        },
        areaStyle: {
          color: {
            type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: (getComputedStyle(document.documentElement).getPropertyValue('--theme-primary').trim() || '#FF9F43') + '40' },
              { offset: 1, color: (getComputedStyle(document.documentElement).getPropertyValue('--theme-primary').trim() || '#FF9F43') + '05' },
            ],
          },
        },
      }],
      tooltip: {
        trigger: 'axis',
        backgroundColor: '#fff',
        borderColor: '#E8E8E8',
        textStyle: { color: '#2D3436', fontSize: 13 },
        formatter: (params: any) => `${params[0].name}<br/>积分: <b>${params[0].value}</b>`,
      },
    })
  }

  // 饼图
  if (pieChartRef.value && reportData.value?.categoryData?.length) {
    if (pieChart) pieChart.dispose()
    pieChart = echarts.init(pieChartRef.value)

    const categoryColors: Record<string, string> = {
      life: '#00B894', learn: '#74B9FF', social: '#FF9F43', achievement: '#A29BFE',
    }

    const data = reportData.value.categoryData.map(d => ({
      name: CATEGORY_CONFIG[d.category]?.label || d.category,
      value: d.total_points,
      itemStyle: { color: categoryColors[d.category] || '#ccc' },
    }))

    pieChart.setOption({
      series: [{
        type: 'pie',
        radius: ['42%', '70%'],
        center: ['50%', '50%'],
        data,
        label: {
          show: true,
          formatter: '{b}\n{d}%',
          fontSize: 12,
          color: '#636E72',
        },
        labelLine: { lineStyle: { color: '#E8E8E8' } },
        emphasis: {
          scaleSize: 8,
          label: { fontSize: 14, fontWeight: 'bold' },
        },
      }],
      tooltip: {
        backgroundColor: '#fff',
        borderColor: '#E8E8E8',
        textStyle: { color: '#2D3436', fontSize: 13 },
        formatter: (params: any) => `${params.name}<br/>积分: <b>${params.value}</b> (${params.percent}%)`,
      },
    })
  }
}

async function doAddBudget() {
  if (!addBudgetAmount.value || addBudgetAmount.value < 100) return
  try {
    const res = await reportApi.addBudget(addBudgetAmount.value)
    if (res.data.data) budget.value = res.data.data
    showAddBudget.value = false
    addBudgetAmount.value = 1000
  } catch (e: any) {
    alert(e.response?.data?.message || '追加失败')
  }
}

watch(selectedChildId, () => {
  if (selectedChildId.value) loadReport()
})

// 响应窗口变化
function handleResize() {
  lineChart?.resize()
  pieChart?.resize()
}

onMounted(async () => {
  await authStore.fetchChildren()
  children.value = authStore.children
  if (children.value.length > 0) {
    selectedChildId.value = authStore.selectedChildId || children.value[0].id
    authStore.selectChild(selectedChildId.value)
  }
  await loadReport()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  lineChart?.dispose()
  pieChart?.dispose()
  window.removeEventListener('resize', handleResize)
})
</script>
