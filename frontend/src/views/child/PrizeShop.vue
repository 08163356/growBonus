<template>
  <div class="page-container" style="background: var(--theme-gradient-soft)">
    <!-- 顶部积分条 -->
    <div class="px-page pt-4 pb-3 flex items-center justify-between">
      <div class="flex items-center gap-2">
        <span class="text-xl">⭐</span>
        <span class="text-2xl font-black" style="color: var(--theme-primary)">{{ summary.availablePoints }}</span>
        <span class="text-xs" style="color: var(--theme-text-secondary)">可用积分</span>
      </div>
    </div>

    <!-- 商城/记录切换 -->
    <div class="px-page flex gap-2 mb-4">
      <button v-for="tab in mainTabs" :key="tab.key"
        class="flex-1 py-2.5 rounded-2xl text-sm font-bold transition-all active:scale-95"
        :style="{
          background: activeMainTab === tab.key ? 'var(--theme-gradient)' : 'var(--theme-bg-card)',
          color: activeMainTab === tab.key ? 'white' : 'var(--theme-text-light)',
          boxShadow: activeMainTab === tab.key ? '0 2px 12px color-mix(in srgb, var(--theme-primary) 30%, transparent)' : '0 1px 4px rgba(0,0,0,0.04)',
        }"
        @click="activeMainTab = tab.key">
        {{ tab.icon }} {{ tab.label }}
      </button>
    </div>

    <!-- ====== 商城 Tab ====== -->
    <template v-if="activeMainTab === 'shop'">
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
             class="card overflow-hidden transition-all active:scale-[0.98]"
             @click="openPrizeDetail(prize)">
          <div class="h-24 flex items-center justify-center overflow-hidden rounded-t-[20px]"
               :style="{ background: 'var(--theme-bg-secondary)' }">
            <img v-if="getPrizeMainImage(prize)" :src="getPrizeMainImage(prize)!" class="w-full h-full object-cover" />
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
              <span class="text-[10px] px-1.5 py-0.5 rounded-full"
                    :style="{ background: getTierColor(prize.tier) + '22', color: getTierColor(prize.tier) }">
                {{ getTierLabel(prize.tier) }}
              </span>
            </div>
            <h4 class="text-sm font-bold truncate" style="color: var(--theme-text)">{{ prize.name }}</h4>
            <p class="text-[10px] truncate mt-0.5" style="color: var(--theme-text-light)">{{ prize.description }}</p>
            <div class="flex items-center justify-between mt-3">
              <span class="text-sm font-bold" style="color: var(--theme-primary)">⭐ {{ prize.points_cost }}</span>
              <button v-if="canRedeem(prize)"
                class="px-3 py-1.5 rounded-xl text-xs font-bold text-white transition-all active:scale-90"
                style="background: var(--theme-gradient)"
                @click.stop="startRedeem(prize)">
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
    </template>

    <!-- ====== 兑换记录 Tab ====== -->
    <template v-if="activeMainTab === 'records'">
      <!-- 状态筛选 -->
      <div class="px-page flex gap-1.5 mb-4 overflow-x-auto hide-scrollbar">
        <button v-for="s in recordFilters" :key="s.key"
          class="shrink-0 px-3 py-1.5 rounded-full text-[11px] font-semibold transition-all"
          :style="{
            background: recordFilter === s.key ? 'var(--theme-primary)' : 'var(--theme-bg-card)',
            color: recordFilter === s.key ? 'white' : 'var(--theme-text-light)',
          }"
          @click="recordFilter = s.key">
          {{ s.label }}
        </button>
      </div>

      <div class="px-page space-y-3">
        <div v-for="item in filteredRecords" :key="item.id" class="card p-3.5"
             @click="openRecordDetail(item)">
          <div class="flex items-center gap-2.5 mb-2">
            <div class="w-10 h-10 rounded-lg overflow-hidden shrink-0 flex items-center justify-center bg-white"
                 style="background: var(--theme-bg-secondary)">
              <img v-if="item.prize_image" :src="getImageUrl(item.prize_image)" class="w-full h-full object-cover" />
              <span v-else class="text-lg">🎁</span>
            </div>
            <div class="flex-1 min-w-0">
              <h4 class="text-sm font-bold truncate" style="color: var(--theme-text)">{{ item.prize_name }}</h4>
              <p class="text-[11px]" style="color: var(--theme-text-light)">⭐{{ item.points_cost }}分 · {{ formatDate(item.created_at) }}</p>
            </div>
            <span class="text-[11px] px-2 py-0.5 rounded-full font-semibold" :style="getStatusStyle(item.status)">
              {{ getStatusLabel(item.status) }}
            </span>
          </div>

          <!-- 审批留言预览 -->
          <div v-if="(item.status === 'approved' || item.status === 'rejected') && (item.approve_message || item.approve_images)"
               class="mt-2 p-2.5 rounded-xl" style="background: var(--theme-bg-secondary)">
            <p class="text-[11px] font-semibold mb-1" :style="{ color: item.status === 'approved' ? '#00B894' : '#FF7675' }">
              {{ item.status === 'approved' ? '✅ 已通过' : '❌ 已拒绝' }} · 点击查看详情
            </p>
            <p v-if="item.approve_message" class="text-xs truncate" style="color: var(--theme-text)">
              💬 {{ item.approve_message }}
            </p>
          </div>
        </div>

        <div v-if="filteredRecords.length === 0"
             class="card p-8 text-center text-sm" style="color: var(--theme-text-light)">
          {{ recordFilter === 'all' ? '还没有兑换记录哦' : '暂无' + getStatusLabel(recordFilter) + '的记录' }} 🎈
        </div>
      </div>
    </template>

    <!-- ====== 奖品详情弹窗（支持多图轮播） ====== -->
    <teleport to="body">
      <transition name="page">
        <div v-if="showPrizeDetail" class="fixed inset-0 z-[100] flex items-end justify-center"
             @click.self="showPrizeDetail = false">
          <div class="absolute inset-0 bg-black/40"></div>
          <div class="relative w-full max-w-[430px] card rounded-b-none animate-slide-up max-h-[85vh] overflow-y-auto">
            <!-- 图片区（可滑动） -->
            <div class="relative">
              <div v-if="detailImages.length > 0" class="flex overflow-x-auto snap-x snap-mandatory hide-scrollbar">
                <div v-for="(img, idx) in detailImages" :key="idx"
                     class="w-full shrink-0 snap-center h-56 flex items-center justify-center"
                     style="background: var(--theme-bg-secondary)">
                  <img :src="img" class="w-full h-full object-contain cursor-pointer" @click="zoomImage(img)" />
                </div>
              </div>
              <div v-else class="h-40 flex items-center justify-center" style="background: var(--theme-bg-secondary)">
                <span class="text-6xl">{{ detailPrize?.type === 'virtual' ? '💫' : '🎁' }}</span>
              </div>
              <div v-if="detailImages.length > 1" class="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
                <span v-for="(_, idx) in detailImages" :key="idx"
                      class="w-1.5 h-1.5 rounded-full" style="background: white; opacity: 0.6"></span>
              </div>
              <button class="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center bg-black/30 text-white"
                      @click="showPrizeDetail = false">✕</button>
            </div>
            <div class="p-5">
              <div class="flex items-center gap-2 mb-2">
                <span class="text-[11px] px-2 py-0.5 rounded-full"
                      :style="{ background: detailPrize?.type === 'virtual' ? '#F0E6FF' : '#FFF3E0', color: detailPrize?.type === 'virtual' ? '#A29BFE' : '#FF9F43' }">
                  {{ detailPrize?.type === 'virtual' ? '💫 特别' : '🎁 实物' }}
                </span>
                <span class="text-[11px] px-2 py-0.5 rounded-full"
                      :style="{ background: getTierColor(detailPrize?.tier || 'small') + '22', color: getTierColor(detailPrize?.tier || 'small') }">
                  {{ getTierLabel(detailPrize?.tier || 'small') }}
                </span>
              </div>
              <h2 class="text-xl font-black mb-1" style="color: var(--theme-text)">{{ detailPrize?.name }}</h2>
              <p class="text-sm mb-4" style="color: var(--theme-text-light)">{{ detailPrize?.description }}</p>
              <div class="flex items-center justify-between">
                <span class="text-xl font-black" style="color: var(--theme-primary)">⭐ {{ detailPrize?.points_cost }}</span>
                <button v-if="detailPrize && canRedeem(detailPrize)"
                  class="px-6 py-2.5 rounded-2xl text-sm font-bold text-white transition-all active:scale-90"
                  style="background: var(--theme-gradient)"
                  @click="startRedeem(detailPrize); showPrizeDetail = false">
                  兑换
                </button>
                <span v-else-if="detailPrize && summary.availablePoints < detailPrize.points_cost"
                      class="text-sm" style="color: var(--theme-danger)">
                  还差 {{ detailPrize.points_cost - summary.availablePoints }} 分
                </span>
              </div>
            </div>
          </div>
        </div>
      </transition>
    </teleport>

    <!-- ====== 兑换记录详情弹窗 ====== -->
    <teleport to="body">
      <transition name="page">
        <div v-if="showRecordDetail" class="fixed inset-0 z-[100] flex items-end justify-center"
             @click.self="showRecordDetail = false">
          <div class="absolute inset-0 bg-black/40"></div>
          <div class="relative w-full max-w-[430px] card rounded-b-none p-6 animate-slide-up max-h-[85vh] overflow-y-auto">
            <button class="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center text-sm"
                    style="background: var(--theme-bg-secondary); color: var(--theme-text-light)"
                    @click="showRecordDetail = false">✕</button>

            <div class="text-center mb-4">
              <div class="text-4xl mb-2">{{ detailRecord?.status === 'approved' ? '✅' : detailRecord?.status === 'rejected' ? '❌' : '⏳' }}</div>
              <h3 class="text-lg font-bold" style="color: var(--theme-text)">{{ detailRecord?.prize_name }}</h3>
              <span class="text-[11px] px-2 py-0.5 rounded-full font-semibold inline-block mt-1"
                    :style="getStatusStyle(detailRecord?.status || 'pending')">
                {{ getStatusLabel(detailRecord?.status || 'pending') }}
              </span>
              <p class="text-xs mt-1" style="color: var(--theme-text-light)">⭐{{ detailRecord?.points_cost }}分 · {{ formatDate(detailRecord?.created_at || '') }}</p>
            </div>

            <!-- 审批留言内容 -->
            <template v-if="detailRecord?.approve_message || detailRecord?.approve_images">
              <div class="p-4 rounded-2xl mb-3" style="background: var(--theme-bg-secondary)">
                <p class="text-xs font-semibold mb-2" style="color: var(--theme-text-secondary)">💬 大人的留言</p>

                <!-- 文字留言（可复制） -->
                <div v-if="detailRecord.approve_message" class="relative">
                  <p class="text-sm leading-relaxed p-3 rounded-xl" style="background: var(--theme-bg-card); color: var(--theme-text)">
                    {{ detailRecord.approve_message }}
                  </p>
                  <button class="mt-1.5 text-[11px] px-3 py-1 rounded-full active:scale-95 transition-all"
                          style="background: var(--theme-primary); color: white"
                          @click="copyText(detailRecord.approve_message)">
                    {{ copied ? '✅ 已复制' : '📋 复制文字' }}
                  </button>
                </div>

                <!-- 图片（可放大，可能是二维码） -->
                <div v-if="detailRecord.approve_images" class="mt-3">
                  <p class="text-[11px] mb-1.5" style="color: var(--theme-text-light)">📸 附带图片（点击放大查看/扫码）</p>
                  <div class="flex gap-2 flex-wrap">
                    <div v-for="(img, idx) in detailRecord.approve_images.split(',')" :key="idx"
                         class="w-28 h-28 rounded-xl overflow-hidden cursor-pointer active:scale-95 transition-all"
                         @click="zoomImage(getImageUrl(img))">
                      <img :src="getImageUrl(img)" class="w-full h-full object-cover" />
                    </div>
                  </div>
                </div>
              </div>
            </template>

            <!-- 等待审批提示 -->
            <div v-if="detailRecord?.status === 'pending'" class="text-center py-4">
              <p class="text-sm" style="color: var(--theme-text-light)">等大人确认后就能看到结果啦 ⏳</p>
            </div>

            <button class="btn-secondary w-full mt-2" @click="showRecordDetail = false">关闭</button>
          </div>
        </div>
      </transition>
    </teleport>

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

    <!-- 图片放大预览 -->
    <teleport to="body">
      <transition name="page">
        <div v-if="zoomedImage" class="fixed inset-0 z-[300] flex items-center justify-center bg-black/90"
             @click="zoomedImage = ''">
          <img :src="zoomedImage" class="max-w-[95vw] max-h-[90vh] object-contain rounded-xl" />
          <p class="absolute bottom-8 text-white/70 text-xs">点击任意处关闭 · 长按可保存图片</p>
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
import { formatDate } from '../../utils/constants'
import type { Prize, PointSummary, Redemption } from '../../types'
import BottomNav from '../../components/common/BottomNav.vue'
import ConfirmDialog from '../../components/common/ConfirmDialog.vue'

const authStore = useAuthStore()

// 主Tab
const mainTabs = [
  { key: 'shop', icon: '🛒', label: '商城' },
  { key: 'records', icon: '📋', label: '兑换记录' },
]
const activeMainTab = ref('shop')

// 商城
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

// 兑换记录
const records = ref<Redemption[]>([])
const recordFilter = ref('all')
const recordFilters = [
  { key: 'all', label: '📋 全部' },
  { key: 'pending', label: '⏳ 待审批' },
  { key: 'approved', label: '✅ 已通过' },
  { key: 'rejected', label: '❌ 已拒绝' },
]

const filteredRecords = computed(() =>
  recordFilter.value === 'all' ? records.value : records.value.filter(r => r.status === recordFilter.value)
)

// 奖品详情
const showPrizeDetail = ref(false)
const detailPrize = ref<Prize | null>(null)
const detailImages = computed(() => {
  if (!detailPrize.value) return []
  const imgs: string[] = []
  if (detailPrize.value.images) {
    detailPrize.value.images.split(',').filter(Boolean).forEach(img => imgs.push(getImageUrl(img)))
  } else if (detailPrize.value.image) {
    imgs.push(getImageUrl(detailPrize.value.image))
  }
  return imgs
})

// 记录详情
const showRecordDetail = ref(false)
const detailRecord = ref<Redemption | null>(null)

// 图片缩放
const zoomedImage = ref('')
const copied = ref(false)

function getPrizeMainImage(prize: Prize): string | null {
  if (prize.images) {
    const first = prize.images.split(',')[0]
    if (first) return getImageUrl(first)
  }
  if (prize.image) return getImageUrl(prize.image)
  return null
}

function getTierColor(tier: string): string {
  return TIER_CONFIG[tier]?.color || '#999'
}

function getTierLabel(tier: string): string {
  const cfg = TIER_CONFIG[tier]
  return cfg ? `${cfg.emoji} ${cfg.label}` : tier
}

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
      const summaryRes = await pointApi.getSummary(authStore.user!.id)
      if (summaryRes.data.data) summary.value = summaryRes.data.data
      await loadRecords()
    }
  } catch (e: any) {
    alert(e.response?.data?.message || '兑换失败')
  }
}

function openPrizeDetail(prize: Prize) {
  detailPrize.value = prize
  showPrizeDetail.value = true
}

function openRecordDetail(item: Redemption) {
  detailRecord.value = item
  showRecordDetail.value = true
}

function zoomImage(url: string) {
  zoomedImage.value = url
}

async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text)
    copied.value = true
    setTimeout(() => { copied.value = false }, 2000)
  } catch {
    const el = document.createElement('textarea')
    el.value = text
    document.body.appendChild(el)
    el.select()
    document.execCommand('copy')
    document.body.removeChild(el)
    copied.value = true
    setTimeout(() => { copied.value = false }, 2000)
  }
}

function getStatusLabel(status: string) {
  const map: Record<string, string> = { pending: '待审批', approved: '已通过', rejected: '已拒绝', fulfilled: '已完成' }
  return map[status] || status
}

function getStatusStyle(status: string) {
  const styles: Record<string, Record<string, string>> = {
    pending: { background: '#FFF3E0', color: '#E17055' },
    approved: { background: '#E8F8F0', color: '#00B894' },
    rejected: { background: '#FFF0F0', color: '#FF7675' },
    fulfilled: { background: '#F0F8FF', color: '#0984E3' },
  }
  return styles[status] || { background: '#F0F0F0', color: '#666' }
}

async function loadRecords() {
  try {
    const res = await prizeApi.getChildRedemptions()
    if (res.data.data) records.value = res.data.data
  } catch (e) { console.error(e) }
}

onMounted(async () => {
  try {
    const [prizeRes, summaryRes] = await Promise.all([
      prizeApi.getAll(),
      pointApi.getSummary(authStore.user!.id),
    ])
    if (prizeRes.data.data) prizes.value = prizeRes.data.data
    if (summaryRes.data.data) summary.value = summaryRes.data.data
    await loadRecords()
  } catch (e) {
    console.error(e)
  }
})
</script>
