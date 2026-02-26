<template>
  <div class="page-container" style="background: var(--theme-gradient-soft)">
    <!-- 顶部 -->
    <div class="px-page pt-4 pb-3">
      <div class="flex items-center justify-between mb-5">
        <h1 class="text-xl font-bold" style="color: var(--theme-text)">积分打卡 ⭐</h1>
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

      <!-- 积分摘要 -->
      <div class="card p-3 flex items-center justify-around">
        <div class="text-center">
          <span class="text-lg font-black" style="color: var(--theme-primary)">{{ summary.totalPoints }}</span>
          <p class="text-[10px]" style="color: var(--theme-text-light)">总积分</p>
        </div>
        <div class="w-px h-8" style="background: #E8E8E8"></div>
        <div class="text-center">
          <span class="text-lg font-black" style="color: var(--theme-success)">{{ summary.availablePoints }}</span>
          <p class="text-[10px]" style="color: var(--theme-text-light)">可用积分</p>
        </div>
        <div class="w-px h-8" style="background: #E8E8E8"></div>
        <div class="text-center">
          <span class="text-lg font-black" style="color: var(--theme-info)">{{ todayCount }}</span>
          <p class="text-[10px]" style="color: var(--theme-text-light)">今日录入</p>
        </div>
      </div>
    </div>

    <!-- 分类标签 -->
    <div class="px-page flex gap-2 mb-5 overflow-x-auto hide-scrollbar">
      <button v-for="(cfg, key) in CATEGORY_CONFIG" :key="key"
        class="shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-all active:scale-95 flex items-center gap-1"
        :style="{
          background: activeCategory === key ? cfg.color : 'transparent',
          color: activeCategory === key ? 'white' : 'var(--theme-text-secondary)',
          border: activeCategory === key ? 'none' : '2px solid #E8E8E8',
        }"
        @click="activeCategory = key">
        {{ cfg.icon }} {{ cfg.label }}
      </button>
    </div>

    <!-- 行为模板网格 -->
    <div class="px-page grid grid-cols-2 gap-4 mb-6">
      <button v-for="tpl in filteredTemplates" :key="tpl.id"
        class="card p-4 text-center transition-all active:scale-[0.96] relative"
        @click="openScoreDialog(tpl)">
        <div v-if="authStore.isGuest" class="absolute top-1 right-1 text-[9px] px-1.5 py-0.5 rounded-full font-bold"
             style="background: var(--theme-warning, #F39C12); color: white">只读</div>
        <div class="text-3xl mb-2">{{ tpl.icon }}</div>
        <h4 class="text-sm font-bold truncate" style="color: var(--theme-text)">{{ tpl.name }}</h4>
        <span class="text-xs font-bold mt-1 inline-block px-2 py-0.5 rounded-full"
              style="background: var(--theme-bg-secondary); color: var(--theme-primary)">
          +{{ tpl.points }}分
        </span>
      </button>
    </div>

    <!-- 今日记录 -->
    <div v-if="todayRecords.length > 0" class="px-page mb-6">
      <button class="w-full text-left text-sm font-bold mb-3 flex items-center gap-1"
              style="color: var(--theme-text)"
              @click="showTodayRecords = !showTodayRecords">
        今日记录 ({{ todayRecords.length }}) {{ showTodayRecords ? '▲' : '▼' }}
      </button>
      <div v-if="showTodayRecords" class="space-y-3">
        <div v-for="record in todayRecords" :key="record.id"
             class="card p-3 cursor-pointer active:scale-[0.98] transition-all"
             @click="openRecordDetail(record)">
          <div class="flex items-center gap-3">
            <span class="text-xl">{{ record.template_icon || '⭐' }}</span>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-semibold truncate">{{ record.template_name }}</p>
              <p class="text-[10px]" style="color: var(--theme-text-light)">{{ record.created_at }}</p>
            </div>
            <span class="text-sm font-bold" style="color: var(--theme-primary)">+{{ record.points }}</span>
          </div>
          <div v-if="record.photo_url || record.encouragement" class="mt-2 flex items-center gap-2">
            <img v-if="record.photo_url" :src="getImageUrl(record.photo_url)"
                 class="w-10 h-10 rounded-lg object-cover shrink-0" />
            <p v-if="record.encouragement" class="text-xs truncate" style="color: var(--theme-text-secondary)">
              💬 {{ record.encouragement }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- 录入弹窗 -->
    <teleport to="body">
      <transition name="page">
        <div v-if="showScoreDialog" class="fixed inset-0 z-[100] flex items-end justify-center"
             @click.self="showScoreDialog = false">
          <div class="absolute inset-0 bg-black/40"></div>
          <div class="relative w-full max-w-[430px] card rounded-b-none p-6 animate-slide-up max-h-[85vh] overflow-y-auto">
            <div class="text-center mb-5">
              <span class="text-4xl">{{ currentTemplate?.icon }}</span>
              <h3 class="text-lg font-bold mt-1">{{ currentTemplate?.name }}</h3>
              <span class="text-sm font-bold" style="color: var(--theme-primary)">+{{ currentTemplate?.points }}分</span>
            </div>
            <textarea v-model="encouragement" class="input mb-4 resize-none" rows="2"
                      placeholder="写一句话留给宝贝（可选）" />
            
            <!-- 照片上传 -->
            <div class="mb-4">
              <label class="block">
                <div class="card !p-3 text-center cursor-pointer active:scale-95 transition-all"
                     style="border: 2px dashed var(--theme-primary-light)">
                  <div class="flex items-center justify-center gap-2">
                    <span class="text-xl">📷</span>
                    <span class="text-sm" style="color: var(--theme-text-light)">
                      {{ photoFile ? photoFile.name : '上传照片记录美好瞬间' }}
                    </span>
                  </div>
                  <input type="file" accept="image/jpeg,image/png,image/webp" class="hidden"
                         @change="onPhotoChange" />
                </div>
              </label>
              <div v-if="photoPreview" class="mt-2 flex justify-center">
                <div class="relative">
                  <img :src="photoPreview" class="w-32 h-32 rounded-2xl object-cover" />
                  <button class="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-400 text-white text-xs flex items-center justify-center"
                          @click="removePhoto">✕</button>
                </div>
              </div>
            </div>

            <div class="flex gap-3">
              <button class="btn-secondary flex-1" @click="showScoreDialog = false">取消</button>
              <button class="btn-primary flex-1" @click="submitScore" :disabled="submitting">
                {{ submitting ? '录入中...' : '确认加分 ✨' }}
              </button>
            </div>
          </div>
        </div>
      </transition>
    </teleport>

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
              <h3 class="text-lg font-bold mt-1" style="color: var(--theme-text)">{{ detailRecord?.template_name }}</h3>
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
import { ref, computed, onMounted, watch } from 'vue'
import { useAuthStore } from '../../stores/auth'
import { templateApi } from '../../services/templateService'
import { pointApi } from '../../services/pointService'
import { CATEGORY_CONFIG } from '../../utils/constants'
import { getImageUrl } from '../../services/api'
import type { BehaviorTemplate, PointRecord, PointSummary, ChildInfo } from '../../types'
import BottomNav from '../../components/common/BottomNav.vue'
import BackgroundSetter from '../../components/common/BackgroundSetter.vue'
import RoleSwitcher from '../../components/common/RoleSwitcher.vue'

const authStore = useAuthStore()

const children = ref<ChildInfo[]>([])
const selectedChildId = ref(0)
const templates = ref<BehaviorTemplate[]>([])
const activeCategory = ref('life')
const summary = ref<PointSummary>({ totalPoints: 0, usedPoints: 0, availablePoints: 0, consecutiveDays: 0 })
const todayRecords = ref<PointRecord[]>([])
const showTodayRecords = ref(false)
const showScoreDialog = ref(false)
const currentTemplate = ref<BehaviorTemplate | null>(null)
const encouragement = ref('')
const submitting = ref(false)
const photoFile = ref<File | null>(null)
const photoPreview = ref('')
const showRecordDetail = ref(false)
const detailRecord = ref<PointRecord | null>(null)

const todayCount = computed(() => todayRecords.value.length)

const filteredTemplates = computed(() => {
  return templates.value.filter(t => t.category === activeCategory.value)
})

function selectChild(id: number) {
  selectedChildId.value = id
  authStore.selectChild(id)
}

function openScoreDialog(tpl: BehaviorTemplate) {
  if (authStore.isGuest) return
  currentTemplate.value = tpl
  encouragement.value = ''
  photoFile.value = null
  photoPreview.value = ''
  showScoreDialog.value = true
}

function onPhotoChange(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (file) {
    photoFile.value = file
    photoPreview.value = URL.createObjectURL(file)
  }
}

function removePhoto() {
  photoFile.value = null
  photoPreview.value = ''
}

function openRecordDetail(record: PointRecord) {
  detailRecord.value = record
  showRecordDetail.value = true
}

async function submitScore() {
  if (!currentTemplate.value || !selectedChildId.value) return
  submitting.value = true
  try {
    const formData = new FormData()
    formData.append('childId', String(selectedChildId.value))
    formData.append('templateId', String(currentTemplate.value.id))
    formData.append('points', String(currentTemplate.value.points))
    formData.append('note', currentTemplate.value.name)
    if (encouragement.value) formData.append('encouragement', encouragement.value)
    if (photoFile.value) formData.append('photo', photoFile.value)

    await pointApi.create(formData)
    showScoreDialog.value = false
    await refreshData()
  } catch (e: any) {
    alert(e.response?.data?.message || '录入失败')
  } finally {
    submitting.value = false
  }
}

async function refreshData() {
  if (!selectedChildId.value) return
  try {
    const [summaryRes, todayRes] = await Promise.all([
      pointApi.getSummary(selectedChildId.value),
      pointApi.getTodayRecords(selectedChildId.value),
    ])
    if (summaryRes.data.data) summary.value = summaryRes.data.data
    if (todayRes.data.data) todayRecords.value = todayRes.data.data
  } catch (e) {
    console.error(e)
  }
}

watch(selectedChildId, () => {
  if (selectedChildId.value) refreshData()
})

onMounted(async () => {
  await authStore.fetchChildren()
  children.value = authStore.children
  if (children.value.length > 0) {
    selectedChildId.value = authStore.selectedChildId || children.value[0].id
    authStore.selectChild(selectedChildId.value)
  }

  try {
    const tplRes = await templateApi.getAll()
    if (tplRes.data.data) templates.value = tplRes.data.data
  } catch (e) {
    console.error(e)
  }

  refreshData()
})


</script>
