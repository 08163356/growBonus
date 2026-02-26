<template>
  <div class="page-container" style="background: var(--theme-gradient-soft)">
    <!-- 顶部栏 -->
    <div class="flex items-center justify-between px-page pt-4 pb-4">
      <div class="flex items-center gap-3 min-w-0">
        <div class="w-11 h-11 rounded-full flex items-center justify-center text-xl shrink-0"
             style="background: var(--theme-primary); box-shadow: 0 4px 12px color-mix(in srgb, var(--theme-primary) 30%, transparent)">
          {{ authStore.user?.avatar || '👧' }}
        </div>
        <div class="min-w-0">
          <h2 class="text-base font-bold truncate" style="color: var(--theme-text)">{{ authStore.user?.name || '宝贝' }}</h2>
          <p class="text-xs" style="color: var(--theme-text-secondary)">{{ level.emoji }} {{ level.name }}</p>
        </div>
      </div>
      <div class="flex items-center gap-1.5 shrink-0">
        <ThemeSwitcher />
        <BackgroundSetter />
        <RoleSwitcher />
      </div>
    </div>

    <!-- 积分气泡区 -->
    <div class="flex flex-col items-center py-6">
      <div class="relative">
        <div class="w-36 h-36 rounded-full flex flex-col items-center justify-center animate-pulse-glow"
             style="background: var(--theme-gradient); box-shadow: 0 8px 30px color-mix(in srgb, var(--theme-primary) 35%, transparent)">
          <span class="text-white text-xs font-semibold opacity-80">我的积分</span>
          <span class="text-white text-4xl font-black">{{ summary.availablePoints }}</span>
        </div>
        <!-- 装饰星星 -->
        <div v-for="i in 6" :key="i"
             class="absolute w-3 h-3 text-sm animate-spin-slow"
             :style="{
               top: `${50 + 42 * Math.sin(i * Math.PI / 3)}%`,
               left: `${50 + 42 * Math.cos(i * Math.PI / 3)}%`,
               transform: 'translate(-50%, -50%)',
               animationDuration: `${6 + i}s`,
             }">⭐</div>
      </div>
      <div class="mt-3 px-4 py-1.5 rounded-full text-sm font-bold"
           style="background: var(--theme-bg-secondary); color: var(--theme-primary)">
        {{ level.emoji }} {{ level.name }}
        <template v-if="nextLevel">
          · 还差 {{ nextLevel.minPoints - summary.totalPoints }} 分升级
        </template>
      </div>
      <div v-if="summary.consecutiveDays > 0" class="mt-2 text-xs flex items-center gap-1"
           style="color: var(--theme-primary)">
        🔥 连续打卡 {{ summary.consecutiveDays }} 天
      </div>
    </div>

    <!-- 最近表现 -->
    <div class="px-page mb-6">
      <div class="flex items-center justify-between mb-3">
        <h3 class="text-base font-bold" style="color: var(--theme-text)">最近表现 ✨</h3>
        <button class="text-xs font-semibold px-3 py-1.5 rounded-full active:scale-95 transition-all"
                style="background: var(--theme-bg-secondary); color: var(--theme-primary)"
                @click="recordViewMode = recordViewMode === 'brief' ? 'full' : 'brief'">
          {{ recordViewMode === 'full' ? '收起' : '查看全部' }}
        </button>
      </div>

      <!-- 简要模式：横滑最新几条 -->
      <div v-if="recordViewMode === 'brief'" class="flex gap-3 overflow-x-auto hide-scrollbar snap-x snap-mandatory pb-2 scroll-area-safe">
        <div v-for="(record, idx) in recentRecords.slice(0, 10)" :key="record.id"
             class="snap-start shrink-0 w-[120px] card p-3 text-center transition-all relative cursor-pointer active:scale-[0.97]"
             :style="{ animationDelay: `${idx * 0.1}s` }"
             @click="openRecordDetail(record)">
          <div v-if="record.photo_url" class="w-full h-16 rounded-xl overflow-hidden mb-1.5">
            <img :src="getImageUrl(record.photo_url)" class="w-full h-full object-cover" />
          </div>
          <div v-else class="text-2xl mb-1">{{ record.template_icon || '⭐' }}</div>
          <p class="text-xs font-semibold truncate" style="color: var(--theme-text)">{{ record.template_name || '获得积分' }}</p>
          <p class="text-sm font-bold mt-1" style="color: var(--theme-primary)">+{{ record.points }}分</p>
          <p class="text-[10px] mt-1" style="color: var(--theme-text-light)">{{ formatDate(record.created_at) }}</p>
          <div v-if="idx === 0" class="absolute -top-1 -right-1 bg-red-400 text-white text-[10px] px-1.5 py-0.5 rounded-full animate-bounce">
            NEW
          </div>
        </div>
        <div v-if="recentRecords.length === 0"
             class="w-full text-center py-8 text-sm" style="color: var(--theme-text-light)">
          还没有记录哦，继续加油！💪
        </div>
      </div>

      <!-- 完整模式：侧边栏分类 + 筛选排序 + 列表 -->
      <div v-if="recordViewMode === 'full'">
        <div class="flex gap-2" style="min-height: 300px">
          <!-- 左侧分类侧边栏 -->
          <div class="shrink-0 transition-all duration-300"
               :style="{ width: recordSidebarCollapsed ? '44px' : '80px' }">
            <div class="sticky top-0 flex flex-col gap-1.5">
              <button class="w-full flex items-center justify-center py-1.5 rounded-xl text-xs transition-all active:scale-95"
                      style="background: var(--theme-bg-secondary); color: var(--theme-text-light)"
                      @click="recordSidebarCollapsed = !recordSidebarCollapsed">
                {{ recordSidebarCollapsed ? '▶' : '◀' }}
              </button>

              <!-- 全部 -->
              <button class="w-full flex flex-col items-center gap-0.5 py-2 rounded-xl text-xs font-semibold transition-all active:scale-95"
                :style="{
                  background: recordCategory === 'all' ? 'var(--theme-gradient)' : 'var(--theme-bg-card)',
                  color: recordCategory === 'all' ? 'white' : 'var(--theme-text-secondary)',
                  boxShadow: recordCategory === 'all' ? '0 2px 8px color-mix(in srgb, var(--theme-primary) 30%, transparent)' : '0 1px 4px rgba(0,0,0,0.04)',
                }"
                @click="recordCategory = 'all'">
                <span class="text-base">📋</span>
                <span v-if="!recordSidebarCollapsed" class="text-[10px] leading-tight">全部</span>
              </button>

              <!-- 分类按钮 -->
              <button v-for="(cfg, key) in CATEGORY_CONFIG" :key="key"
                class="w-full flex flex-col items-center gap-0.5 py-2 rounded-xl text-xs font-semibold transition-all active:scale-95"
                :style="{
                  background: recordCategory === key ? cfg.color : 'var(--theme-bg-card)',
                  color: recordCategory === key ? 'white' : 'var(--theme-text-secondary)',
                  boxShadow: recordCategory === key ? `0 2px 8px ${cfg.color}44` : '0 1px 4px rgba(0,0,0,0.04)',
                }"
                @click="recordCategory = key">
                <span class="text-base">{{ cfg.icon }}</span>
                <span v-if="!recordSidebarCollapsed" class="text-[10px] leading-tight whitespace-nowrap">{{ cfg.label.length > 3 ? cfg.label.slice(0,2) : cfg.label }}</span>
              </button>
            </div>
          </div>

          <!-- 右侧内容区 -->
          <div class="flex-1 min-w-0">
            <!-- 工具栏：日期 + 排序 -->
            <div class="flex items-center gap-1.5 mb-3 flex-wrap">
              <!-- 日期快捷筛选 -->
              <div class="flex gap-1 overflow-x-auto hide-scrollbar flex-1 min-w-0">
                <button v-for="opt in dateOptions" :key="opt.key"
                  class="shrink-0 px-2 py-1 rounded-lg text-[11px] font-semibold transition-all active:scale-95"
                  :style="{
                    background: selectedDateRange === opt.key ? 'var(--theme-primary)' : 'var(--theme-bg-card)',
                    color: selectedDateRange === opt.key ? 'white' : 'var(--theme-text-light)',
                  }"
                  @click="selectedDateRange = opt.key">
                  {{ opt.label }}
                </button>
              </div>
              <!-- 排序按钮 -->
              <button class="shrink-0 px-2 py-1 rounded-lg text-[11px] font-semibold transition-all active:scale-95 flex items-center gap-0.5"
                      :style="{
                        background: sortMode !== 'time' ? 'var(--theme-primary)' : 'var(--theme-bg-card)',
                        color: sortMode !== 'time' ? 'white' : 'var(--theme-text-light)',
                      }"
                      @click="cycleSortMode">
                {{ sortMode === 'time' ? '🕐 时间' : sortMode === 'points_desc' ? '🔽 积分高' : '🔼 积分低' }}
              </button>
            </div>

            <!-- 统计摘要 -->
            <div class="flex gap-2 mb-3">
              <div class="flex-1 card p-2 text-center">
                <p class="text-lg font-black" style="color: var(--theme-primary)">{{ filteredStats.totalPoints }}</p>
                <p class="text-[10px]" style="color: var(--theme-text-light)">总积分</p>
              </div>
              <div class="flex-1 card p-2 text-center">
                <p class="text-lg font-black" style="color: var(--theme-text)">{{ filteredStats.count }}</p>
                <p class="text-[10px]" style="color: var(--theme-text-light)">次记录</p>
              </div>
              <div class="flex-1 card p-2 text-center">
                <p class="text-lg font-black" style="color: #FF9F43">{{ filteredStats.avgPoints }}</p>
                <p class="text-[10px]" style="color: var(--theme-text-light)">平均分</p>
              </div>
            </div>

            <!-- 记录列表 -->
            <div class="flex flex-col gap-3.5">
              <div v-for="record in filteredRecords" :key="record.id"
                   class="card p-3 cursor-pointer active:scale-[0.98] transition-all"
                   @click="openRecordDetail(record)">
                <div class="flex items-center gap-2.5">
                  <div class="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                       :style="{ background: getCategoryBgColor(record.category) }">
                    <span class="text-lg">{{ record.template_icon || '⭐' }}</span>
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-semibold truncate" style="color: var(--theme-text)">{{ record.template_name || '获得积分' }}</p>
                    <p v-if="record.template_description" class="text-[10px] truncate mt-0.5" style="color: var(--theme-text-light)">{{ record.template_description }}</p>
                    <div class="flex items-center gap-1.5 mt-0.5">
                      <span v-if="record.category" class="text-[9px] px-1.5 py-0.5 rounded-full"
                            :style="{ background: getCategoryColor(record.category) + '22', color: getCategoryColor(record.category) }">
                        {{ getCategoryLabel(record.category) }}
                      </span>
                      <span class="text-[10px]" style="color: var(--theme-text-light)">{{ formatDate(record.created_at) }}</span>
                    </div>
                  </div>
                  <span class="text-sm font-bold shrink-0" style="color: var(--theme-primary)">+{{ record.points }}分</span>
                </div>
                <div v-if="record.photo_url || record.encouragement" class="mt-2 flex items-center gap-2 pl-[46px]">
                  <img v-if="record.photo_url" :src="getImageUrl(record.photo_url)"
                       class="w-9 h-9 rounded-lg object-cover shrink-0" />
                  <p v-if="record.encouragement" class="text-[11px] truncate" style="color: var(--theme-text-secondary)">
                    💬 {{ record.encouragement }}
                  </p>
                </div>
              </div>

              <div v-if="filteredRecords.length === 0"
                   class="card p-8 text-center text-sm" style="color: var(--theme-text-light)">
                {{ recordCategory === 'all' ? '这段时间没有记录哦' : '该分类暂无记录' }} 🎈
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 家人鼓励 -->
    <div v-if="likes.length > 0" class="px-page mb-6">
      <h3 class="text-base font-bold mb-4" style="color: var(--theme-text)">家人的鼓励 ❤️</h3>
      <div class="flex flex-col gap-3.5">
        <div v-for="like in likes.slice(0, 3)" :key="like.id"
             class="card p-3 flex items-center gap-3">
          <span class="text-xl">❤️</span>
          <div class="flex-1 min-w-0">
            <p class="text-sm">
              <span class="font-semibold" style="color: var(--theme-primary)">{{ like.user_name }}</span>
              <span style="color: var(--theme-text-secondary)"> 为你点赞：</span>
              <span class="font-semibold">{{ like.template_name }}</span>
            </p>
            <p class="text-[10px] mt-0.5" style="color: var(--theme-text-light)">{{ formatDate(like.created_at) }}</p>
          </div>
        </div>
      </div>
    </div>

    <BottomNav />

    <!-- 记录详情弹窗 -->
    <teleport to="body">
      <transition name="page">
        <div v-if="showRecordDetail" class="fixed inset-0 z-[100] flex items-center justify-center"
             @click.self="showRecordDetail = false">
          <div class="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>
          <div class="relative mx-4 w-full max-w-[380px] card animate-bounce-in p-5 max-h-[80vh] overflow-y-auto">
            <div class="text-center mb-3">
              <span class="text-4xl">{{ detailRecord?.template_icon || '⭐' }}</span>
              <h3 class="text-lg font-bold mt-1" style="color: var(--theme-text)">{{ detailRecord?.template_name || '获得积分' }}</h3>
              <span class="text-sm font-bold" style="color: var(--theme-primary)">+{{ detailRecord?.points }}分</span>
              <p class="text-xs mt-1" style="color: var(--theme-text-light)">{{ detailRecord?.created_at }}</p>
            </div>
            <img v-if="detailRecord?.photo_url" :src="getImageUrl(detailRecord.photo_url)"
                 class="w-full rounded-2xl mb-3 max-h-[300px] object-cover" />
            <div v-if="detailRecord?.encouragement" class="p-3 rounded-2xl mb-3"
                 style="background: var(--theme-bg-secondary)">
              <p class="text-sm" style="color: var(--theme-text)">💬 {{ detailRecord.encouragement }}</p>
            </div>
            <button class="btn-primary w-full" @click="showRecordDetail = false">关闭</button>
          </div>
        </div>
      </transition>
    </teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '../../stores/auth'
import { pointApi } from '../../services/pointService'
import { getLevel, getNextLevel, formatDate, CATEGORY_CONFIG } from '../../utils/constants'
import { getImageUrl } from '../../services/api'
import type { PointRecord, PointSummary, LikeInfo } from '../../types'
import BottomNav from '../../components/common/BottomNav.vue'
import ThemeSwitcher from '../../components/common/ThemeSwitcher.vue'
import BackgroundSetter from '../../components/common/BackgroundSetter.vue'
import RoleSwitcher from '../../components/common/RoleSwitcher.vue'

const authStore = useAuthStore()

const summary = ref<PointSummary>({ totalPoints: 0, usedPoints: 0, availablePoints: 0, consecutiveDays: 0 })
const recentRecords = ref<PointRecord[]>([])
const likes = ref<LikeInfo[]>([])
const showRecordDetail = ref(false)
const detailRecord = ref<PointRecord | null>(null)

// 视图模式
const recordViewMode = ref<'brief' | 'full'>('brief')

// 侧边栏
const recordSidebarCollapsed = ref(false)

// 分类筛选
const recordCategory = ref('all')

// 日期范围筛选
const selectedDateRange = ref('all')
const dateOptions = [
  { key: 'all', label: '全部' },
  { key: 'today', label: '今天' },
  { key: '3d', label: '3天' },
  { key: '7d', label: '本周' },
  { key: '30d', label: '本月' },
]

// 排序
const sortMode = ref<'time' | 'points_desc' | 'points_asc'>('time')

function cycleSortMode() {
  if (sortMode.value === 'time') sortMode.value = 'points_desc'
  else if (sortMode.value === 'points_desc') sortMode.value = 'points_asc'
  else sortMode.value = 'time'
}

const level = computed(() => getLevel(summary.value.totalPoints))
const nextLevel = computed(() => getNextLevel(summary.value.totalPoints))

// 日期范围过滤函数
function isInDateRange(dateStr: string): boolean {
  if (selectedDateRange.value === 'all') return true
  const now = new Date()
  const d = new Date(dateStr)
  const diffMs = now.getTime() - d.getTime()
  const diffDays = diffMs / 86400000

  switch (selectedDateRange.value) {
    case 'today': {
      const todayStr = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`
      const recordDate = dateStr.split(' ')[0] || dateStr.split('T')[0]
      return recordDate === todayStr
    }
    case '3d': return diffDays <= 3
    case '7d': return diffDays <= 7
    case '30d': return diffDays <= 30
    default: return true
  }
}

// 综合过滤+排序
const filteredRecords = computed(() => {
  let result = recentRecords.value

  // 分类过滤
  if (recordCategory.value !== 'all') {
    result = result.filter(r => r.category === recordCategory.value)
  }

  // 日期范围过滤
  result = result.filter(r => isInDateRange(r.created_at))

  // 排序
  if (sortMode.value === 'points_desc') {
    result = [...result].sort((a, b) => b.points - a.points)
  } else if (sortMode.value === 'points_asc') {
    result = [...result].sort((a, b) => a.points - b.points)
  }
  // time 排序保持默认（后端已按时间倒序）

  return result
})

// 统计摘要
const filteredStats = computed(() => {
  const records = filteredRecords.value
  const totalPoints = records.reduce((sum, r) => sum + r.points, 0)
  const count = records.length
  const avgPoints = count > 0 ? Math.round(totalPoints / count) : 0
  return { totalPoints, count, avgPoints }
})

// 分类辅助函数
function getCategoryColor(category?: string): string {
  if (!category) return '#999'
  return CATEGORY_CONFIG[category]?.color || '#999'
}

function getCategoryBgColor(category?: string): string {
  const color = getCategoryColor(category)
  return color + '18'
}

function getCategoryLabel(category?: string): string {
  if (!category) return ''
  const cfg = CATEGORY_CONFIG[category]
  return cfg ? `${cfg.icon} ${cfg.label}` : ''
}

function openRecordDetail(record: PointRecord) {
  detailRecord.value = record
  showRecordDetail.value = true
}

onMounted(async () => {
  const childId = authStore.user!.id
  try {
    const [summaryRes, recordsRes, likesRes] = await Promise.all([
      pointApi.getSummary(childId),
      pointApi.getByChild(childId, 50),
      pointApi.getLatestLikes(childId),
    ])
    if (summaryRes.data.data) summary.value = summaryRes.data.data
    if (recordsRes.data.data) recentRecords.value = recordsRes.data.data
    if (likesRes.data.data) likes.value = likesRes.data.data
  } catch (e) {
    console.error(e)
  }
})
</script>
