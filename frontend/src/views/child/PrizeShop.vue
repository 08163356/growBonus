<template>
  <div class="page-container" style="background: var(--theme-gradient-soft)">
    <!-- 顶部积分条 -->
    <div class="px-page pt-4 pb-4 flex items-center justify-between">
      <div class="flex items-center gap-2">
        <span class="text-xl">⭐</span>
        <span class="text-2xl font-black" style="color: var(--theme-primary)">{{ summary.availablePoints }}</span>
        <span class="text-xs" style="color: var(--theme-text-secondary)">可用积分</span>
      </div>
    </div>

    <!-- 分档标签栏 -->
    <div class="px-page flex gap-2 mb-5 overflow-x-auto hide-scrollbar">
      <button v-for="(cfg, key) in tierTabs" :key="key"
        class="shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-all active:scale-95 whitespace-nowrap"
        :style="{
          background: activeTier === key ? cfg.color : 'transparent',
          color: activeTier === key ? 'white' : 'var(--theme-text-secondary)',
          border: activeTier === key ? 'none' : '2px solid #E8E8E8',
        }"
        @click="activeTier = key">
        {{ cfg.emoji }} {{ cfg.label }}
      </button>
      <button class="shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-all active:scale-95 whitespace-nowrap"
        :style="{
          background: activeTier === 'all' ? 'var(--theme-primary)' : 'transparent',
          color: activeTier === 'all' ? 'white' : 'var(--theme-text-secondary)',
          border: activeTier === 'all' ? 'none' : '2px solid #E8E8E8',
        }"
        @click="activeTier = 'all'">
        全部
      </button>
    </div>

    <!-- 奖品网格 -->
    <div class="px-page grid grid-cols-2 gap-4">
      <div v-for="prize in filteredPrizes" :key="prize.id"
           class="card overflow-hidden transition-all active:scale-[0.98]">
        <div class="h-24 flex items-center justify-center overflow-hidden rounded-t-[20px]"
             :style="{ background: 'var(--theme-bg-secondary)' }">
          <img v-if="prize.image" :src="getImageUrl(prize.image)" class="w-full h-full object-cover" />
          <span v-else class="text-5xl">{{ prize.type === 'virtual' ? '💫' : '🎁' }}</span>
        </div>
        <div class="p-3.5">
          <div class="flex items-center gap-1 mb-1.5">
            <span class="text-[10px] px-1.5 py-0.5 rounded-full"
                  :style="{
                    background: prize.type === 'virtual' ? '#F0E6FF' : '#FFF3E0',
                    color: prize.type === 'virtual' ? '#A29BFE' : '#FF9F43',
                  }">
              {{ prize.type === 'virtual' ? '💫 特别' : '🎁 实物' }}
            </span>
          </div>
          <h4 class="text-sm font-bold truncate" style="color: var(--theme-text)">{{ prize.name }}</h4>
          <p class="text-[10px] truncate mt-0.5" style="color: var(--theme-text-light)">{{ prize.description }}</p>
          <div class="flex items-center justify-between mt-3">
            <span class="text-sm font-bold" style="color: var(--theme-primary)">⭐ {{ prize.points_cost }}</span>
            <button v-if="canRedeem(prize)"
              class="px-3 py-1.5 rounded-xl text-xs font-bold text-white transition-all active:scale-90"
              style="background: var(--theme-gradient)"
              @click="startRedeem(prize)">
              兑换
            </button>
            <span v-else-if="isBudgetExhausted(prize)" class="text-[10px]" style="color: var(--theme-text-light)">
              暂时兑完啦
            </span>
            <span v-else class="text-[10px]" style="color: var(--theme-danger)">
              还差 {{ prize.points_cost - summary.availablePoints }} 分
            </span>
          </div>
        </div>
      </div>
    </div>

    <div v-if="filteredPrizes.length === 0" class="text-center py-12 text-sm px-page"
         style="color: var(--theme-text-light)">
      这个分类暂时没有奖品哦 🎈
    </div>

    <!-- 兑换确认弹窗 -->
    <ConfirmDialog
      v-model:visible="showConfirm"
      :title="selectedPrize?.name || ''"
      :icon="selectedPrize?.type === 'virtual' ? '💫' : '🎁'"
      :message="`需要 ${selectedPrize?.points_cost} 积分`"
      confirm-text="确认兑换"
      cancel-text="再想想"
      :show-cancel="true"
      @confirm="doRedeem"
    />

    <!-- 兑换成功动画 -->
    <teleport to="body">
      <transition name="page">
        <div v-if="showSuccess" class="fixed inset-0 z-[200] flex items-center justify-center"
             style="background: rgba(0,0,0,0.6); backdrop-filter: blur(8px)">
          <div class="text-center animate-bounce-in">
            <div class="text-8xl mb-4">🎉</div>
            <h2 class="text-2xl font-black text-white mb-2">太棒了！</h2>
            <p class="text-sm text-white/80 mb-6">已提交兑换，等大人确认哦</p>
            <button class="btn-primary" @click="showSuccess = false">好的！</button>
          </div>
          <!-- 纸屑效果 -->
          <div v-for="i in 20" :key="i"
               class="absolute w-2 h-2 rounded-full"
               :style="{
                 left: `${Math.random() * 100}%`,
                 top: `${Math.random() * 100}%`,
                 background: ['#FF9F43','#FECA57','#FF6B6B','#A29BFE','#00B894','#74B9FF'][i % 6],
                 animation: `confetti ${1 + Math.random()}s ease-out forwards`,
                 animationDelay: `${Math.random() * 0.5}s`,
               }">
          </div>
        </div>
      </transition>
    </teleport>

    <BottomNav />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '../../stores/auth'
import { prizeApi } from '../../services/prizeService'
import { pointApi } from '../../services/pointService'
import { TIER_CONFIG } from '../../utils/constants'
import { getImageUrl } from '../../services/api'
import type { Prize, PointSummary } from '../../types'
import BottomNav from '../../components/common/BottomNav.vue'
import ConfirmDialog from '../../components/common/ConfirmDialog.vue'

const authStore = useAuthStore()

const prizes = ref<Prize[]>([])
const summary = ref<PointSummary>({ totalPoints: 0, usedPoints: 0, availablePoints: 0, consecutiveDays: 0 })
const activeTier = ref('all')
const showConfirm = ref(false)
const showSuccess = ref(false)
const selectedPrize = ref<Prize | null>(null)
const budgetExhausted = ref(false)

const tierTabs = TIER_CONFIG

const filteredPrizes = computed(() => {
  if (activeTier.value === 'all') return prizes.value
  return prizes.value.filter(p => p.tier === activeTier.value)
})

function canRedeem(prize: Prize) {
  if (summary.value.availablePoints < prize.points_cost) return false
  if (prize.type === 'material' && budgetExhausted.value) return false
  if (prize.stock === 0) return false
  return true
}

function isBudgetExhausted(prize: Prize) {
  return prize.type === 'material' && budgetExhausted.value
}

function startRedeem(prize: Prize) {
  selectedPrize.value = prize
  showConfirm.value = true
}

async function doRedeem() {
  if (!selectedPrize.value) return
  try {
    const res = await prizeApi.redeem(selectedPrize.value.id)
    if (res.data.success) {
      showSuccess.value = true
      // 刷新积分
      const summaryRes = await pointApi.getSummary(authStore.user!.id)
      if (summaryRes.data.data) summary.value = summaryRes.data.data
    }
  } catch (e: any) {
    alert(e.response?.data?.message || '兑换失败')
  }
}

onMounted(async () => {
  try {
    const [prizeRes, summaryRes] = await Promise.all([
      prizeApi.getAll(),
      pointApi.getSummary(authStore.user!.id),
    ])
    if (prizeRes.data.data) prizes.value = prizeRes.data.data
    if (summaryRes.data.data) summary.value = summaryRes.data.data
  } catch (e) {
    console.error(e)
  }
})
</script>
