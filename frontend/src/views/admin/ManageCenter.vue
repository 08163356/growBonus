<template>
  <div class="page-container" style="background: var(--theme-gradient-soft)">
    <!-- 顶部 -->
    <div class="px-page pt-4 pb-3">
      <div class="flex items-center justify-between mb-4">
        <h1 class="text-xl font-bold" style="color: var(--theme-text)">管理中心 ⚙️</h1>
        <div class="flex items-center gap-2">
          <RoleSwitcher />
          <BackgroundSetter />
        </div>
      </div>
    </div>

    <!-- 侧边栏 + 内容区 -->
    <div class="flex px-2 gap-2" style="min-height: calc(100vh - 180px)">
      <!-- 侧边栏 -->
      <div class="shrink-0 transition-all duration-300"
           :style="{ width: sidebarCollapsed ? '48px' : '90px' }">
        <div class="sticky top-0 flex flex-col gap-1.5">
          <!-- 收缩按钮 -->
          <button class="w-full flex items-center justify-center py-2 rounded-xl text-xs transition-all active:scale-95"
                  style="background: var(--theme-bg-secondary); color: var(--theme-text-light)"
                  @click="sidebarCollapsed = !sidebarCollapsed">
            {{ sidebarCollapsed ? '▶' : '◀' }}
          </button>

          <!-- Tab 按钮 -->
          <button v-for="tab in tabs" :key="tab.key"
            class="w-full flex flex-col items-center gap-0.5 py-2.5 rounded-xl text-xs font-semibold transition-all active:scale-95"
            :style="{
              background: activeTab === tab.key ? 'var(--theme-gradient)' : 'var(--theme-bg-card)',
              color: activeTab === tab.key ? 'white' : 'var(--theme-text-secondary)',
              boxShadow: activeTab === tab.key ? '0 2px 8px color-mix(in srgb, var(--theme-primary) 30%, transparent)' : '0 1px 4px rgba(0,0,0,0.04)',
            }"
            @click="activeTab = tab.key">
            <span class="text-lg">{{ tab.icon }}</span>
            <span v-if="!sidebarCollapsed" class="text-[10px] leading-tight">{{ tab.label }}</span>
          </button>
        </div>
      </div>

      <!-- 内容区 -->
      <div class="flex-1 min-w-0 pr-2">
        <!-- ====== 模板管理 ====== -->
        <div v-if="activeTab === 'templates'">
          <div class="flex gap-2 mb-4 overflow-x-auto hide-scrollbar">
            <button v-for="(cfg, key) in CATEGORY_CONFIG" :key="key"
              class="shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
              :style="{
                background: templateCategory === key ? cfg.color : 'transparent',
                color: templateCategory === key ? 'white' : 'var(--theme-text-light)',
                border: templateCategory === key ? 'none' : '1.5px solid #E8E8E8',
              }"
              @click="templateCategory = key">
              {{ cfg.icon }} {{ cfg.label }}
            </button>
          </div>

          <div class="space-y-3 mb-6">
            <div v-for="tpl in filteredTemplates" :key="tpl.id"
                 class="card p-3.5 flex items-center gap-2.5">
              <span class="text-xl shrink-0">{{ tpl.icon }}</span>
              <div class="flex-1 min-w-0">
                <h4 class="text-sm font-bold truncate" style="color: var(--theme-text)">{{ tpl.name }}</h4>
                <p class="text-[11px] truncate" style="color: var(--theme-text-light)">{{ tpl.description || '暂无描述' }}</p>
              </div>
              <span class="shrink-0 text-[11px] font-bold px-2 py-0.5 rounded-full"
                    style="background: var(--theme-bg-secondary); color: var(--theme-primary)">
                +{{ tpl.points }}
              </span>
              <div v-if="authStore.isAdmin" class="shrink-0 flex gap-1">
                <button class="w-7 h-7 rounded-full flex items-center justify-center text-xs active:scale-90"
                        style="background: var(--theme-bg-secondary)" @click="editTemplate(tpl)">✏️</button>
                <button class="w-7 h-7 rounded-full flex items-center justify-center text-xs active:scale-90"
                        style="background: #FFF0F0" @click="confirmDeleteTemplate(tpl)">🗑️</button>
              </div>
            </div>
            <div v-if="filteredTemplates.length === 0"
                 class="card p-8 text-center text-sm" style="color: var(--theme-text-light)">
              暂无模板，点击下方添加 ✨
            </div>
          </div>

          <button v-if="authStore.isAdmin"
            class="fixed bottom-28 z-40 w-14 h-14 rounded-full flex items-center justify-center text-2xl active:scale-90 transition-all"
            style="background: var(--theme-gradient); color: white; box-shadow: 0 4px 20px color-mix(in srgb, var(--theme-primary) 40%, transparent); right: max(16px, calc((100vw - 430px) / 2 + 16px))"
            @click="newTemplate">
            ＋
          </button>
        </div>

        <!-- ====== 奖品管理 ====== -->
        <div v-if="activeTab === 'prizes'">
          <div class="flex gap-2 mb-4 overflow-x-auto hide-scrollbar">
            <button v-for="(cfg, key) in TIER_CONFIG" :key="key"
              class="shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
              :style="{
                background: prizeTier === key ? cfg.color : 'transparent',
                color: prizeTier === key ? 'white' : 'var(--theme-text-light)',
                border: prizeTier === key ? 'none' : '1.5px solid #E8E8E8',
              }"
              @click="prizeTier = key">
              {{ cfg.emoji }} {{ cfg.label }}
            </button>
            <button class="shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
              :style="{
                background: prizeTier === '' ? 'var(--theme-primary)' : 'transparent',
                color: prizeTier === '' ? 'white' : 'var(--theme-text-light)',
                border: prizeTier === '' ? 'none' : '1.5px solid #E8E8E8',
              }"
              @click="prizeTier = ''">
              全部
            </button>
          </div>

          <div class="space-y-3 mb-6">
            <div v-for="prize in filteredPrizes" :key="prize.id"
                 class="card p-3.5 flex items-center gap-2.5">
              <div class="w-10 h-10 rounded-xl overflow-hidden shrink-0 flex items-center justify-center"
                   style="background: var(--theme-bg-secondary)">
                <img v-if="prize.image" :src="getImageUrl(prize.image)" class="w-full h-full object-cover" />
                <span v-else class="text-xl">🎁</span>
              </div>
              <div class="flex-1 min-w-0">
                <h4 class="text-sm font-bold truncate" style="color: var(--theme-text)">{{ prize.name }}</h4>
                <p class="text-[11px]" style="color: var(--theme-text-light)">
                  ⭐{{ prize.points_cost }}分 · 库存{{ prize.stock }}
                </p>
              </div>
              <div v-if="authStore.isAdmin" class="shrink-0">
                <button class="w-7 h-7 rounded-full flex items-center justify-center text-xs active:scale-90"
                        style="background: var(--theme-bg-secondary)" @click="editPrize(prize)">✏️</button>
              </div>
            </div>
            <div v-if="filteredPrizes.length === 0"
                 class="card p-8 text-center text-sm" style="color: var(--theme-text-light)">
              暂无奖品，点击下方添加 🎁
            </div>
          </div>

          <button v-if="authStore.isAdmin"
            class="fixed bottom-28 z-40 w-14 h-14 rounded-full flex items-center justify-center text-2xl active:scale-90 transition-all"
            style="background: var(--theme-gradient); color: white; box-shadow: 0 4px 20px color-mix(in srgb, var(--theme-primary) 40%, transparent); right: max(16px, calc((100vw - 430px) / 2 + 16px))"
            @click="newPrize">
            ＋
          </button>
        </div>

        <!-- ====== 兑换审批 ====== -->
        <div v-if="activeTab === 'redemptions'">
          <div class="flex gap-1.5 mb-4 overflow-x-auto hide-scrollbar">
            <button v-for="s in redemptionFilters" :key="s.key"
              class="shrink-0 px-2.5 py-1.5 rounded-full text-[11px] font-semibold transition-all"
              :style="{
                background: redemptionFilter === s.key ? 'var(--theme-primary)' : 'var(--theme-bg-card)',
                color: redemptionFilter === s.key ? 'white' : 'var(--theme-text-light)',
                boxShadow: redemptionFilter === s.key ? '0 2px 8px color-mix(in srgb, var(--theme-primary) 30%, transparent)' : 'none',
              }"
              @click="redemptionFilter = s.key">
              {{ s.label }}
            </button>
          </div>

          <div class="space-y-3">
            <div v-for="item in filteredRedemptions" :key="item.id" class="card p-3.5">
              <div class="flex items-center gap-2.5 mb-2.5">
                <span class="text-xl">{{ item.child_avatar || '👧' }}</span>
                <div class="flex-1 min-w-0">
                  <h4 class="text-sm font-bold truncate" style="color: var(--theme-text)">{{ item.child_name }}</h4>
                  <p class="text-[11px]" style="color: var(--theme-text-light)">{{ formatDate(item.created_at) }}</p>
                </div>
                <span class="text-[11px] px-2 py-0.5 rounded-full font-semibold" :style="getStatusStyle(item.status)">
                  {{ getStatusLabel(item.status) }}
                </span>
              </div>

              <div class="flex items-center gap-2.5 p-2.5 rounded-xl" style="background: var(--theme-bg-secondary)">
                <div class="w-10 h-10 rounded-lg overflow-hidden shrink-0 flex items-center justify-center bg-white">
                  <img v-if="item.prize_image" :src="getImageUrl(item.prize_image)" class="w-full h-full object-cover" />
                  <span v-else class="text-lg">🎁</span>
                </div>
                <div class="flex-1 min-w-0">
                  <h5 class="text-sm font-bold truncate" style="color: var(--theme-text)">{{ item.prize_name }}</h5>
                  <p class="text-[11px]" style="color: var(--theme-text-light)">⭐{{ item.points_cost }}分</p>
                </div>
              </div>

              <div v-if="item.status === 'pending' && !authStore.isGuest" class="flex gap-2.5 mt-2.5">
                <button class="btn-danger flex-1 !py-2.5 !text-sm !rounded-xl" @click="openApproveDialog(item, 'reject')">拒绝</button>
                <button class="btn-primary flex-1 !py-2.5 !text-sm !rounded-xl" @click="openApproveDialog(item, 'approve')">通过</button>
              </div>

              <!-- 显示审批留言 -->
              <div v-if="item.approve_message || item.approve_images" class="mt-2.5 p-2.5 rounded-xl" style="background: var(--theme-bg-secondary)">
                <p v-if="item.approve_message" class="text-xs" style="color: var(--theme-text)">💬 {{ item.approve_message }}</p>
                <div v-if="item.approve_images" class="flex gap-2 mt-1.5">
                  <img v-for="(img, idx) in item.approve_images.split(',')" :key="idx"
                       :src="getImageUrl(img)" class="w-12 h-12 rounded-lg object-cover cursor-pointer"
                       @click="previewImage(getImageUrl(img))" />
                </div>
              </div>
            </div>

            <div v-if="filteredRedemptions.length === 0"
                 class="card p-8 text-center text-sm" style="color: var(--theme-text-light)">
              {{ redemptionFilter === 'pending' ? '暂无待审批 🎉' : '暂无记录' }}
            </div>
          </div>
        </div>

        <!-- ====== 孩子管理 ====== -->
        <div v-if="activeTab === 'children'">
          <div class="space-y-3 mb-6">
            <div v-for="child in allChildren" :key="child.id"
                 class="card p-4 flex items-center gap-3">
              <span class="text-2xl">{{ child.avatar || '👧' }}</span>
              <div class="flex-1 min-w-0">
                <h4 class="text-sm font-bold" style="color: var(--theme-text)">{{ child.name }}</h4>
                <p class="text-[11px]" style="color: var(--theme-text-light)">PIN: ****</p>
              </div>
              <div v-if="authStore.isAdmin" class="shrink-0 flex gap-1">
                <button class="w-8 h-8 rounded-full flex items-center justify-center text-sm active:scale-90"
                        style="background: var(--theme-bg-secondary)" @click="openEditChild(child)">✏️</button>
                <button class="w-8 h-8 rounded-full flex items-center justify-center text-sm active:scale-90"
                        style="background: #FFF0F0" @click="confirmDeleteChild(child)">🗑️</button>
              </div>
            </div>
            <div v-if="allChildren.length === 0"
                 class="card p-8 text-center text-sm" style="color: var(--theme-text-light)">
              暂无孩子，点击下方添加
            </div>
          </div>

          <button v-if="authStore.isAdmin"
            class="fixed bottom-28 z-40 w-14 h-14 rounded-full flex items-center justify-center text-2xl active:scale-90 transition-all"
            style="background: var(--theme-gradient); color: white; box-shadow: 0 4px 20px color-mix(in srgb, var(--theme-primary) 40%, transparent); right: max(16px, calc((100vw - 430px) / 2 + 16px))"
            @click="openAddChild">
            ＋
          </button>
        </div>
      </div>
    </div>

    <!-- ====== 模板编辑弹窗 ====== -->
    <teleport to="body">
      <transition name="page">
        <div v-if="showTemplateForm" class="fixed inset-0 z-[100] flex items-end justify-center"
             @click.self="showTemplateForm = false">
          <div class="absolute inset-0 bg-black/40"></div>
          <div class="relative w-full max-w-[430px] card rounded-b-none p-6 animate-slide-up max-h-[85vh] overflow-y-auto">
            <h3 class="text-lg font-bold mb-5 text-center" style="color: var(--theme-text)">
              {{ editingTemplate ? '编辑模板' : '新增模板' }} 📝
            </h3>
            <div class="space-y-4">
              <input v-model="templateForm.name" class="input" placeholder="行为名称" />
              <div class="flex gap-2">
                <select v-model="templateForm.category" class="input flex-1">
                  <option value="" disabled>选择分类</option>
                  <option v-for="(cfg, key) in CATEGORY_CONFIG" :key="key" :value="key">
                    {{ cfg.icon }} {{ cfg.label }}
                  </option>
                </select>
                <input v-model.number="templateForm.points" type="number" class="input flex-1" placeholder="积分" min="1" />
              </div>
              <input v-model="templateForm.icon" class="input" placeholder="图标（emoji）例: 🧹" />
              <textarea v-model="templateForm.description" class="input resize-none" rows="2" placeholder="描述（可选）" />
              <div class="flex gap-3">
                <button class="btn-secondary flex-1" @click="showTemplateForm = false">取消</button>
                <button class="btn-primary flex-1" @click="submitTemplate" :disabled="submitting">
                  {{ submitting ? '保存中...' : '保存' }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </transition>
    </teleport>

    <!-- ====== 奖品编辑弹窗 ====== -->
    <teleport to="body">
      <transition name="page">
        <div v-if="showPrizeForm" class="fixed inset-0 z-[100] flex items-end justify-center"
             @click.self="showPrizeForm = false">
          <div class="absolute inset-0 bg-black/40"></div>
          <div class="relative w-full max-w-[430px] card rounded-b-none p-6 animate-slide-up max-h-[85vh] overflow-y-auto">
            <h3 class="text-lg font-bold mb-5 text-center" style="color: var(--theme-text)">
              {{ editingPrize ? '编辑奖品' : '新增奖品' }} 🎁
            </h3>
            <div class="space-y-4">
              <input v-model="prizeForm.name" class="input" placeholder="奖品名称" />
              <textarea v-model="prizeForm.description" class="input resize-none" rows="2" placeholder="奖品描述" />
              <div class="flex gap-2">
                <input v-model.number="prizeForm.stock" type="number" class="input flex-1" placeholder="库存" min="0" />
                <select v-model="prizeForm.type" class="input flex-1">
                  <option value="material">🎁 实物</option>
                  <option value="virtual">💫 虚拟</option>
                </select>
              </div>
              <!-- 实物：输入成本自动换算积分 -->
              <template v-if="prizeForm.type === 'material'">
                <div>
                  <input v-model.number="prizeForm.material_cost" type="number" class="input"
                         placeholder="实物成本（元）" min="0" @input="onMaterialCostChange" />
                  <p class="text-[11px] mt-1" style="color: var(--theme-text-light)">
                    换算率：1元 = {{ pointsPerYuan }}积分，输入成本自动计算积分
                  </p>
                </div>
                <div>
                  <input v-model.number="prizeForm.points_cost" type="number" class="input"
                         placeholder="所需积分" min="1" />
                  <p v-if="prizeForm.material_cost && prizeForm.points_cost" class="text-[11px] mt-1" style="color: var(--theme-primary)">
                    💡 {{ prizeForm.material_cost }}元 → {{ prizeForm.points_cost }}积分
                    · 自动档位：{{ autoTierLabel }}
                  </p>
                </div>
              </template>
              <!-- 虚拟：直接填积分 -->
              <template v-else>
                <input v-model.number="prizeForm.points_cost" type="number" class="input"
                       placeholder="所需积分" min="1" />
                <p v-if="prizeForm.points_cost" class="text-[11px] mt-1" style="color: var(--theme-primary)">
                  💡 自动档位：{{ autoTierLabel }}
                </p>
              </template>
              <!-- 多图上传（最多2张） -->
              <div>
                <p class="text-xs font-semibold mb-2" style="color: var(--theme-text)">奖品图片（最多2张，无图则显示默认图标）</p>
                <div class="flex gap-2">
                  <div v-for="(preview, idx) in prizeImagePreviews" :key="idx"
                       class="w-20 h-20 rounded-2xl overflow-hidden shrink-0 relative">
                    <img :src="preview" class="w-full h-full object-cover" />
                    <button class="absolute top-0.5 right-0.5 w-5 h-5 rounded-full bg-black/50 text-white text-xs flex items-center justify-center"
                            @click="removePrizeImage(idx)">×</button>
                  </div>
                  <label v-if="prizeImagePreviews.length < 2"
                         class="w-20 h-20 rounded-2xl flex items-center justify-center cursor-pointer active:scale-95 transition-all"
                         style="border: 2px dashed var(--theme-primary-light); background: var(--theme-bg-secondary)">
                    <span class="text-2xl">📷</span>
                    <input type="file" accept="image/jpeg,image/png,image/webp" class="hidden"
                           @change="onPrizeImageChange" />
                  </label>
                </div>
              </div>
              <div class="flex gap-3">
                <button class="btn-secondary flex-1" @click="showPrizeForm = false">取消</button>
                <button class="btn-primary flex-1" @click="submitPrize" :disabled="submitting">
                  {{ submitting ? '保存中...' : '保存' }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </transition>
    </teleport>

    <!-- ====== 孩子编辑弹窗 ====== -->
    <teleport to="body">
      <transition name="page">
        <div v-if="showChildForm" class="fixed inset-0 z-[100] flex items-end justify-center"
             @click.self="showChildForm = false">
          <div class="absolute inset-0 bg-black/40"></div>
          <div class="relative w-full max-w-[430px] card rounded-b-none p-6 animate-slide-up max-h-[85vh] overflow-y-auto">
            <h3 class="text-lg font-bold mb-5 text-center" style="color: var(--theme-text)">
              {{ editingChild ? '编辑孩子' : '添加孩子' }} 👧
            </h3>
            <div class="space-y-4">
              <!-- 头像选择 -->
              <div>
                <p class="text-sm font-semibold mb-2" style="color: var(--theme-text)">选择头像</p>
                <div class="flex gap-2 flex-wrap">
                  <button v-for="av in avatarOptions" :key="av"
                    class="w-12 h-12 rounded-full flex items-center justify-center text-2xl transition-all active:scale-90"
                    :style="{
                      background: childForm.avatar === av ? 'var(--theme-primary)' : 'var(--theme-bg-secondary)',
                      boxShadow: childForm.avatar === av ? '0 2px 8px color-mix(in srgb, var(--theme-primary) 30%, transparent)' : 'none',
                    }"
                    @click="childForm.avatar = av">
                    {{ av }}
                  </button>
                </div>
              </div>
              <input v-model="childForm.name" class="input" placeholder="孩子名字" />
              <div>
                <input v-model="childForm.pin" class="input" placeholder="4位数字PIN码" maxlength="4"
                       inputmode="numeric" pattern="[0-9]*" />
                <p class="text-[11px] mt-1" style="color: var(--theme-text-light)">孩子登录时使用的密码（4位数字）</p>
              </div>
              <div class="flex gap-3">
                <button class="btn-secondary flex-1" @click="showChildForm = false">取消</button>
                <button class="btn-primary flex-1" @click="submitChild" :disabled="submitting">
                  {{ submitting ? '保存中...' : '保存' }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </transition>
    </teleport>

    <!-- ====== 删除确认 ====== -->
    <ConfirmDialog
      :visible="showDeleteConfirm"
      :title="deleteType === 'child' ? '确认删除孩子' : '确认删除'"
      :message="deleteType === 'child' ? `确定要删除「${deleteChildTarget?.name}」吗？删除后无法恢复！` : `确定要删除「${deleteTarget?.name}」吗？`"
      icon="⚠️"
      confirm-text="删除"
      cancel-text="取消"
      :show-cancel="true"
      @confirm="deleteType === 'child' ? doDeleteChild() : doDeleteTemplate()"
      @cancel="showDeleteConfirm = false"
      @update:visible="showDeleteConfirm = $event"
    />

    <!-- ====== 审批弹窗（支持留言+图片） ====== -->
    <teleport to="body">
      <transition name="page">
        <div v-if="showApproveDialog" class="fixed inset-0 z-[100] flex items-end justify-center"
             @click.self="showApproveDialog = false">
          <div class="absolute inset-0 bg-black/40"></div>
          <div class="relative w-full max-w-[430px] card rounded-b-none p-6 animate-slide-up">
            <h3 class="text-lg font-bold mb-4 text-center" style="color: var(--theme-text)">
              {{ approveAction === 'approve' ? '✅ 通过审批' : '❌ 拒绝兑换' }}
            </h3>
            <p class="text-sm mb-3 text-center" style="color: var(--theme-text-secondary)">
              {{ approveTarget?.prize_name }} — {{ approveTarget?.child_name }}
            </p>
            <div class="space-y-3">
              <textarea v-model="approveMessage" class="input resize-none" rows="3"
                        placeholder="给孩子留言（可选，如支付宝口令红包、领取说明等）" />
              <div>
                <p class="text-xs mb-1.5" style="color: var(--theme-text-light)">附带图片（可选，如二维码、截图等）</p>
                <div class="flex gap-2">
                  <div v-for="(preview, idx) in approveImagePreviews" :key="idx"
                       class="w-16 h-16 rounded-xl overflow-hidden relative">
                    <img :src="preview" class="w-full h-full object-cover" />
                    <button class="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-black/50 text-white text-[10px] flex items-center justify-center"
                            @click="removeApproveImage(idx)">×</button>
                  </div>
                  <label v-if="approveImagePreviews.length < 3"
                         class="w-16 h-16 rounded-xl flex items-center justify-center cursor-pointer"
                         style="border: 2px dashed var(--theme-primary-light); background: var(--theme-bg-secondary)">
                    <span class="text-xl">📷</span>
                    <input type="file" accept="image/jpeg,image/png,image/webp" class="hidden"
                           @change="onApproveImageChange" />
                  </label>
                </div>
              </div>
              <div class="flex gap-3">
                <button class="btn-secondary flex-1" @click="showApproveDialog = false">取消</button>
                <button :class="approveAction === 'approve' ? 'btn-primary' : 'btn-danger'" class="flex-1"
                        @click="submitApproval" :disabled="submitting">
                  {{ submitting ? '处理中...' : (approveAction === 'approve' ? '确认通过' : '确认拒绝') }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </transition>
    </teleport>

    <!-- ====== 图片预览弹窗 ====== -->
    <teleport to="body">
      <transition name="page">
        <div v-if="previewImageUrl" class="fixed inset-0 z-[200] flex items-center justify-center bg-black/80"
             @click="previewImageUrl = ''">
          <img :src="previewImageUrl" class="max-w-[90vw] max-h-[90vh] rounded-2xl object-contain" />
        </div>
      </transition>
    </teleport>

    <BottomNav />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '../../stores/auth'
import { authApi } from '../../services/authService'
import { templateApi } from '../../services/templateService'
import { prizeApi } from '../../services/prizeService'
import { reportApi } from '../../services/reportService'
import { CATEGORY_CONFIG, TIER_CONFIG, formatDate } from '../../utils/constants'
import { getImageUrl } from '../../services/api'
import type { BehaviorTemplate, Prize, Redemption, ChildInfo } from '../../types'
import BottomNav from '../../components/common/BottomNav.vue'
import BackgroundSetter from '../../components/common/BackgroundSetter.vue'
import ConfirmDialog from '../../components/common/ConfirmDialog.vue'
import RoleSwitcher from '../../components/common/RoleSwitcher.vue'

const authStore = useAuthStore()

// 侧边栏
const sidebarCollapsed = ref(false)

// Tab 切换
const tabs = computed(() => {
  const base = [
    { key: 'templates', icon: '📋', label: '模板' },
    { key: 'prizes', icon: '🎁', label: '奖品' },
    { key: 'redemptions', icon: '📬', label: '审批' },
  ]
  if (authStore.isAdmin) base.push({ key: 'children', icon: '👧', label: '孩子' })
  return base
})
const activeTab = ref('templates')

// ===== 模板管理 =====
const templates = ref<BehaviorTemplate[]>([])
const templateCategory = ref('life')
const showTemplateForm = ref(false)
const editingTemplate = ref<BehaviorTemplate | null>(null)
const templateForm = ref({ name: '', category: 'life', points: '' as any, icon: '', description: '' })
const submitting = ref(false)

const filteredTemplates = computed(() =>
  templates.value.filter(t => t.category === templateCategory.value)
)

function newTemplate() {
  editingTemplate.value = null
  templateForm.value = { name: '', category: templateCategory.value, points: '' as any, icon: '', description: '' }
  showTemplateForm.value = true
}

function editTemplate(tpl: BehaviorTemplate) {
  editingTemplate.value = tpl
  templateForm.value = {
    name: tpl.name,
    category: tpl.category,
    points: tpl.points,
    icon: tpl.icon,
    description: tpl.description || '',
  }
  showTemplateForm.value = true
}

async function submitTemplate() {
  if (!templateForm.value.name || !templateForm.value.category) return
  submitting.value = true
  try {
    if (editingTemplate.value) {
      await templateApi.update(editingTemplate.value.id, templateForm.value)
    } else {
      await templateApi.create(templateForm.value)
    }
    showTemplateForm.value = false
    await loadTemplates()
  } catch (e: any) {
    alert(e.response?.data?.message || '保存失败')
  } finally {
    submitting.value = false
  }
}

const showDeleteConfirm = ref(false)
const deleteTarget = ref<BehaviorTemplate | null>(null)
const deleteType = ref<'template' | 'child'>('template')

function confirmDeleteTemplate(tpl: BehaviorTemplate) {
  deleteTarget.value = tpl
  deleteType.value = 'template'
  showDeleteConfirm.value = true
}

async function doDeleteTemplate() {
  if (!deleteTarget.value) return
  try {
    await templateApi.delete(deleteTarget.value.id)
    await loadTemplates()
  } catch (e: any) {
    alert(e.response?.data?.message || '删除失败')
  }
  showDeleteConfirm.value = false
}

async function loadTemplates() {
  try {
    const res = await templateApi.getAll()
    if (res.data.data) templates.value = res.data.data
  } catch (e) { console.error(e) }
}

// ===== 奖品管理 =====
const prizes = ref<Prize[]>([])
const prizeTier = ref('')
const showPrizeForm = ref(false)
const editingPrize = ref<Prize | null>(null)
const prizeForm = ref({
  name: '', description: '', tier: 'small', type: 'material',
  points_cost: 20, material_cost: 25, stock: 10, image: '',
})
const prizeImageFile = ref<File | null>(null)
const prizeImagePreview = ref('')
const prizeImageFiles = ref<File[]>([])
const prizeImagePreviews = ref<string[]>([])
const pointsPerYuan = ref(10)

const filteredPrizes = computed(() =>
  prizeTier.value ? prizes.value.filter(p => p.tier === prizeTier.value) : prizes.value
)

function calcAutoTier(points: number): string {
  if (points <= 100) return 'small'
  if (points <= 500) return 'medium'
  if (points <= 2000) return 'large'
  return 'super'
}

const autoTierLabel = computed(() => {
  const pts = prizeForm.value.points_cost
  if (!pts || pts <= 0) return ''
  const tier = calcAutoTier(pts)
  const cfg = TIER_CONFIG[tier]
  return cfg ? `${cfg.emoji} ${cfg.label}` : ''
})

function newPrize() {
  editingPrize.value = null
  prizeForm.value = { name: '', description: '', tier: 'small', type: 'material', points_cost: '' as any, material_cost: '' as any, stock: 10, image: '' }
  prizeImageFile.value = null
  prizeImagePreview.value = ''
  prizeImageFiles.value = []
  prizeImagePreviews.value = []
  showPrizeForm.value = true
}

function editPrize(prize: Prize) {
  editingPrize.value = prize
  prizeForm.value = {
    name: prize.name,
    description: prize.description || '',
    tier: prize.tier,
    type: prize.type,
    points_cost: prize.points_cost,
    material_cost: prize.material_cost,
    stock: prize.stock,
    image: prize.image || '',
  }
  prizeImageFile.value = null
  prizeImagePreview.value = ''
  prizeImageFiles.value = []
  // 加载已有图片
  prizeImagePreviews.value = prize.images
    ? prize.images.split(',').filter(Boolean).map(img => getImageUrl(img))
    : prize.image ? [getImageUrl(prize.image)] : []
  showPrizeForm.value = true
}

function onMaterialCostChange() {
  if (prizeForm.value.type === 'material' && prizeForm.value.material_cost > 0) {
    prizeForm.value.points_cost = Math.round(prizeForm.value.material_cost * pointsPerYuan.value)
  }
}

function onPrizeImageChange(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (file && prizeImageFiles.value.length < 2) {
    prizeImageFiles.value.push(file)
    prizeImagePreviews.value.push(URL.createObjectURL(file))
  }
  // reset input
  ;(e.target as HTMLInputElement).value = ''
}

function removePrizeImage(idx: number) {
  prizeImageFiles.value.splice(idx, 1)
  prizeImagePreviews.value.splice(idx, 1)
}

async function submitPrize() {
  if (!prizeForm.value.name) return
  submitting.value = true
  try {
    const formData = new FormData()
    formData.append('name', prizeForm.value.name)
    formData.append('description', prizeForm.value.description)
    formData.append('type', prizeForm.value.type)
    formData.append('pointsCost', String(prizeForm.value.points_cost))
    formData.append('materialCost', String(prizeForm.value.type === 'material' ? prizeForm.value.material_cost : 0))
    formData.append('stock', String(prizeForm.value.stock))
    // 多图上传
    for (const file of prizeImageFiles.value) {
      formData.append('images', file)
    }

    if (editingPrize.value) {
      await prizeApi.update(editingPrize.value.id, formData)
    } else {
      await prizeApi.create(formData)
    }
    showPrizeForm.value = false
    await loadPrizes()
  } catch (e: any) {
    alert(e.response?.data?.message || '保存失败')
  } finally {
    submitting.value = false
  }
}

async function loadPrizes() {
  try {
    const res = await prizeApi.getAll()
    if (res.data.data) prizes.value = res.data.data
  } catch (e) { console.error(e) }
}

async function loadPointsPerYuan() {
  try {
    const res = await reportApi.getBudgetStatus()
    if (res.data.data?.pointsPerYuan) {
      pointsPerYuan.value = res.data.data.pointsPerYuan
    }
  } catch (e) { console.error(e) }
}

// ===== 兑换审批 =====
const redemptions = ref<Redemption[]>([])
const redemptionFilter = ref('pending')
const redemptionFilters = [
  { key: 'pending', label: '⏳ 待审批' },
  { key: 'approved', label: '✅ 已通过' },
  { key: 'rejected', label: '❌ 已拒绝' },
  { key: 'all', label: '📋 全部' },
]

const filteredRedemptions = computed(() =>
  redemptionFilter.value === 'all'
    ? redemptions.value
    : redemptions.value.filter(r => r.status === redemptionFilter.value)
)

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

// 审批弹窗
const showApproveDialog = ref(false)
const approveTarget = ref<Redemption | null>(null)
const approveAction = ref<'approve' | 'reject'>('approve')
const approveMessage = ref('')
const approveImageFiles = ref<File[]>([])
const approveImagePreviews = ref<string[]>([])
const previewImageUrl = ref('')

function openApproveDialog(item: Redemption, action: 'approve' | 'reject') {
  approveTarget.value = item
  approveAction.value = action
  approveMessage.value = ''
  approveImageFiles.value = []
  approveImagePreviews.value = []
  showApproveDialog.value = true
}

function onApproveImageChange(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (file && approveImageFiles.value.length < 3) {
    approveImageFiles.value.push(file)
    approveImagePreviews.value.push(URL.createObjectURL(file))
  }
  ;(e.target as HTMLInputElement).value = ''
}

function removeApproveImage(idx: number) {
  approveImageFiles.value.splice(idx, 1)
  approveImagePreviews.value.splice(idx, 1)
}

function previewImage(url: string) {
  previewImageUrl.value = url
}

async function submitApproval() {
  if (!approveTarget.value) return
  submitting.value = true
  try {
    const formData = new FormData()
    if (approveMessage.value) formData.append('message', approveMessage.value)
    for (const file of approveImageFiles.value) {
      formData.append('images', file)
    }
    const hasData = approveMessage.value || approveImageFiles.value.length > 0

    if (approveAction.value === 'approve') {
      await prizeApi.approve(approveTarget.value.id, hasData ? formData : undefined)
    } else {
      await prizeApi.reject(approveTarget.value.id, hasData ? formData : undefined)
    }
    showApproveDialog.value = false
    await loadRedemptions()
  } catch (e: any) {
    alert(e.response?.data?.message || '操作失败')
  } finally {
    submitting.value = false
  }
}

async function handleApprove(id: number) {
  try {
    await prizeApi.approve(id)
    await loadRedemptions()
  } catch (e: any) {
    alert(e.response?.data?.message || '操作失败')
  }
}

async function handleReject(id: number) {
  try {
    await prizeApi.reject(id)
    await loadRedemptions()
  } catch (e: any) {
    alert(e.response?.data?.message || '操作失败')
  }
}

async function loadRedemptions() {
  try {
    const res = await prizeApi.getRedemptions()
    if (res.data.data) redemptions.value = res.data.data
  } catch (e) { console.error(e) }
}

// ===== 孩子管理 =====
const allChildren = ref<ChildInfo[]>([])
const showChildForm = ref(false)
const editingChild = ref<ChildInfo | null>(null)
const childForm = ref({ name: '', pin: '', avatar: '👧' })
const deleteChildTarget = ref<ChildInfo | null>(null)

const avatarOptions = ['👧', '👦', '👶', '🧒', '👸', '🤴', '🐱', '🐶', '🦄', '🐼', '🐰', '🦊']

function openAddChild() {
  editingChild.value = null
  childForm.value = { name: '', pin: '', avatar: '👧' }
  showChildForm.value = true
}

function openEditChild(child: ChildInfo) {
  editingChild.value = child
  childForm.value = { name: child.name, pin: '', avatar: child.avatar || '👧' }
  showChildForm.value = true
}

function confirmDeleteChild(child: ChildInfo) {
  deleteChildTarget.value = child
  deleteType.value = 'child'
  showDeleteConfirm.value = true
}

async function submitChild() {
  if (!childForm.value.name) {
    alert('请输入名字')
    return
  }
  if (!editingChild.value && (!childForm.value.pin || childForm.value.pin.length !== 4)) {
    alert('请输入4位数字PIN码')
    return
  }
  submitting.value = true
  try {
    if (editingChild.value) {
      const updateData: any = { name: childForm.value.name, avatar: childForm.value.avatar }
      if (childForm.value.pin && childForm.value.pin.length === 4) {
        updateData.pin = childForm.value.pin
      }
      await authApi.updateChild(editingChild.value.id, updateData)
    } else {
      await authApi.addChild({
        name: childForm.value.name,
        pin: childForm.value.pin,
        avatar: childForm.value.avatar,
      })
    }
    showChildForm.value = false
    await loadChildren()
  } catch (e: any) {
    alert(e.response?.data?.message || '保存失败')
  } finally {
    submitting.value = false
  }
}

async function doDeleteChild() {
  if (!deleteChildTarget.value) return
  try {
    await authApi.deleteChild(deleteChildTarget.value.id)
    await loadChildren()
  } catch (e: any) {
    alert(e.response?.data?.message || '删除失败')
  }
  showDeleteConfirm.value = false
}

async function loadChildren() {
  await authStore.fetchChildren()
  allChildren.value = authStore.children
}

// ===== 生命周期 =====
onMounted(async () => {
  await loadChildren()
  await Promise.all([
    loadTemplates(),
    loadPrizes(),
    loadRedemptions(),
    loadPointsPerYuan(),
  ])
})
</script>
