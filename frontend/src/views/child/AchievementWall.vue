<template>
  <div class="page-container" style="background: var(--theme-gradient-soft)">
    <!-- 顶部 -->
    <div class="px-page pt-4 pb-4">
      <h1 class="text-2xl font-bold" style="color: var(--theme-text)">我的勋章墙 🏆</h1>
      <div class="flex items-center gap-2 mt-2">
        <span class="text-xs px-3 py-1 rounded-full font-semibold"
              style="background: var(--theme-bg-secondary); color: var(--theme-primary)">
          已获得 {{ unlockedIds.size }} / {{ allAchievements.length }} 枚
        </span>
      </div>
    </div>

    <!-- 勋章网格 -->
    <div class="px-page grid grid-cols-3 gap-4">
      <div v-for="(ach, idx) in allAchievements" :key="ach.id"
           class="flex flex-col items-center gap-2.5 py-5 cursor-pointer transition-all active:scale-95"
           :style="{ animationDelay: `${idx * 0.08}s` }"
           :class="unlockedIds.has(ach.id) ? 'animate-bounce-in' : ''"
           @click="showDetail(ach)">
        <div class="w-20 h-20 rounded-full flex items-center justify-center text-3xl transition-all"
             :style="{
               background: unlockedIds.has(ach.id) ? 'var(--theme-gradient)' : '#F0F0F0',
               boxShadow: unlockedIds.has(ach.id) ? '0 4px 20px color-mix(in srgb, var(--theme-primary) 30%, transparent)' : 'none',
               opacity: unlockedIds.has(ach.id) ? 1 : 0.5,
             }">
          {{ unlockedIds.has(ach.id) ? ach.icon : '🔒' }}
        </div>
        <span class="text-xs font-semibold text-center"
              :style="{ color: unlockedIds.has(ach.id) ? 'var(--theme-text)' : 'var(--theme-text-light)' }">
          {{ ach.name }}
        </span>
      </div>
    </div>

    <!-- 底部激励 -->
    <div class="px-page mt-6 mb-4">
      <div class="p-4 rounded-2xl text-center text-sm font-semibold"
           style="background: var(--theme-bg-secondary); color: var(--theme-primary)">
      ✨ {{ encouragement }}
      </div>
    </div>

    <!-- 详情弹窗 -->
    <ConfirmDialog
      v-model:visible="showDialog"
      :title="selectedAchievement?.name || ''"
      :icon="selectedAchievement?.icon || ''"
      :message="selectedAchievement?.description || ''"
      confirm-text="知道了"
    >
      <div v-if="selectedUnlockTime" class="text-xs mb-2" style="color: var(--theme-success)">
        🎉 获得时间：{{ selectedUnlockTime }}
      </div>
      <div v-else class="text-xs mb-2" style="color: var(--theme-text-light)">
        {{ getConditionText(selectedAchievement!) }}
      </div>
    </ConfirmDialog>

    <BottomNav />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '../../stores/auth'
import { achievementApi } from '../../services/achievementService'
import type { Achievement, UserAchievement } from '../../types'
import BottomNav from '../../components/common/BottomNav.vue'
import ConfirmDialog from '../../components/common/ConfirmDialog.vue'

const authStore = useAuthStore()

const allAchievements = ref<Achievement[]>([])
const unlockedList = ref<UserAchievement[]>([])
const showDialog = ref(false)
const selectedAchievement = ref<Achievement | null>(null)

const unlockedIds = computed(() => new Set(unlockedList.value.map(u => u.achievement_id)))

const selectedUnlockTime = computed(() => {
  if (!selectedAchievement.value) return ''
  const ua = unlockedList.value.find(u => u.achievement_id === selectedAchievement.value!.id)
  return ua ? ua.unlocked_at : ''
})

const encouragement = computed(() => {
  const remaining = allAchievements.value.filter(a => !unlockedIds.value.has(a.id))
  if (remaining.length === 0) return '太厉害了，全部勋章都获得啦！👏'
  const next = remaining[0]
  return `再加把劲就能获得「${next.name}」勋章啦！`
})

onMounted(async () => {
  try {
    const [allRes, unlockedRes] = await Promise.all([
      achievementApi.getAll(),
      achievementApi.getUnlocked(authStore.user!.id),
    ])
    if (allRes.data.data) allAchievements.value = allRes.data.data
    if (unlockedRes.data.data) unlockedList.value = unlockedRes.data.data
  } catch (e) {
    console.error(e)
  }
})

function showDetail(ach: Achievement) {
  selectedAchievement.value = ach
  showDialog.value = true
}

function getConditionText(ach: Achievement) {
  if (!ach) return ''
  const map: Record<string, string> = {
    total_points: `累计获得 ${ach.condition_value} 分`,
    consecutive_days: `连续打卡 ${ach.condition_value} 天`,
    life_count: `完成 ${ach.condition_value} 次生活习惯`,
    learn_count: `完成 ${ach.condition_value} 次学习技能`,
    social_count: `完成 ${ach.condition_value} 次社交品格`,
    total_records: `累计记录 ${ach.condition_value} 次`,
  }
  return `解锁条件：${map[ach.condition_type] || '未知条件'}`
}
</script>
