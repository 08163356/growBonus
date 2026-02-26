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

    <!-- 最近记录 -->
    <div class="px-page mb-6">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-base font-bold" style="color: var(--theme-text)">最近表现 ✨</h3>
        <button class="text-xs font-semibold px-3 py-1.5 rounded-full active:scale-95 transition-all"
                style="background: var(--theme-bg-secondary); color: var(--theme-primary)"
                @click="showAllRecords = !showAllRecords">
          {{ showAllRecords ? '收起' : '查看全部' }}
        </button>
      </div>

      <!-- 横滑卡片（默认） -->
      <div v-if="!showAllRecords" class="flex gap-3 overflow-x-auto hide-scrollbar snap-x snap-mandatory pb-2 scroll-area-safe">
        <div v-for="(record, idx) in recentRecords" :key="record.id"
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

      <!-- 全部记录列表 -->
      <div v-if="showAllRecords" class="space-y-3">
        <!-- 日期选择 -->
        <div class="flex gap-2 mb-4 overflow-x-auto hide-scrollbar">
          <button v-for="d in recentDates" :key="d"
            class="shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
            :style="{
              background: selectedDate === d ? 'var(--theme-primary)' : 'var(--theme-bg-card)',
              color: selectedDate === d ? 'white' : 'var(--theme-text-secondary)',
            }"
            @click="selectedDate = d">
            {{ formatShortDate(d) }}
          </button>
        </div>

        <div v-for="record in filteredRecords" :key="record.id"
             class="card p-3 cursor-pointer active:scale-[0.98] transition-all"
             @click="openRecordDetail(record)">
          <div class="flex items-center gap-3">
            <span class="text-xl">{{ record.template_icon || '⭐' }}</span>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-semibold truncate" style="color: var(--theme-text)">{{ record.template_name || '获得积分' }}</p>
              <p class="text-[10px]" style="color: var(--theme-text-light)">{{ formatDate(record.created_at) }}</p>
            </div>
            <span class="text-sm font-bold" style="color: var(--theme-primary)">+{{ record.points }}分</span>
          </div>
          <div v-if="record.photo_url || record.encouragement" class="mt-2 flex items-center gap-2">
            <img v-if="record.photo_url" :src="getImageUrl(record.photo_url)"
                 class="w-10 h-10 rounded-lg object-cover shrink-0" />
            <p v-if="record.encouragement" class="text-xs truncate" style="color: var(--theme-text-secondary)">
              💬 {{ record.encouragement }}
            </p>
          </div>
        </div>

        <div v-if="filteredRecords.length === 0"
             class="card p-6 text-center text-sm" style="color: var(--theme-text-light)">
          这天没有记录哦
        </div>
      </div>
    </div>

    <!-- 家人鼓励 -->
    <div v-if="likes.length > 0" class="px-page mb-6">
      <h3 class="text-base font-bold mb-4" style="color: var(--theme-text)">家人的鼓励 ❤️</h3>
      <div class="space-y-3">
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
import { getLevel, getNextLevel, formatDate } from '../../utils/constants'
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
const showAllRecords = ref(false)
const selectedDate = ref('')
const showRecordDetail = ref(false)
const detailRecord = ref<PointRecord | null>(null)

const level = computed(() => getLevel(summary.value.totalPoints))
const nextLevel = computed(() => getNextLevel(summary.value.totalPoints))

// 提取所有不重复日期
const recentDates = computed(() => {
  const dates = new Set<string>()
  recentRecords.value.forEach(r => {
    const d = r.created_at.split(' ')[0] || r.created_at.split('T')[0]
    if (d) dates.add(d)
  })
  return Array.from(dates).sort().reverse()
})

// 按日期筛选记录
const filteredRecords = computed(() => {
  if (!selectedDate.value) return recentRecords.value
  return recentRecords.value.filter(r => {
    const d = r.created_at.split(' ')[0] || r.created_at.split('T')[0]
    return d === selectedDate.value
  })
})

function formatShortDate(dateStr: string) {
  const d = new Date(dateStr)
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(today.getDate() - 1)

  if (dateStr === today.toISOString().split('T')[0] ||
      dateStr === `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`) {
    return '今天'
  }
  const yStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth()+1).padStart(2,'0')}-${String(yesterday.getDate()).padStart(2,'0')}`
  if (dateStr === yStr) return '昨天'
  return `${d.getMonth() + 1}/${d.getDate()}`
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

    // 默认选中第一个日期
    if (recentDates.value.length > 0) {
      selectedDate.value = recentDates.value[0]
    }
  } catch (e) {
    console.error(e)
  }
})
</script>
