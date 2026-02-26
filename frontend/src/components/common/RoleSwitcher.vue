<template>
  <div class="relative" ref="containerRef">
    <!-- Trigger: avatar + name badge -->
    <button class="flex items-center gap-1.5 px-2.5 py-1 rounded-full transition-all active:scale-95"
            style="background: var(--theme-bg-secondary)"
            @click="toggleDropdown">
      <span class="text-base">{{ authStore.user?.avatar || defaultAvatar }}</span>
      <span class="text-xs font-semibold" style="color: var(--theme-text-secondary)">{{ authStore.user?.name }}</span>
      <span class="text-[10px] ml-0.5" style="color: var(--theme-text-light)">▼</span>
    </button>

    <!-- Guest badge -->
    <div v-if="authStore.isGuest" class="absolute -top-1 -right-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold"
         style="background: var(--theme-warning, #F39C12); color: white">
      游客
    </div>

    <!-- Dropdown -->
    <teleport to="body">
      <transition name="fade">
        <div v-if="showDropdown" class="fixed inset-0 z-[200]" @click="showDropdown = false">
          <div class="absolute inset-0 bg-black/20"></div>
          <div class="absolute z-[201] card p-3 min-w-[200px] max-w-[260px] animate-slide-up"
               :style="dropdownStyle">
            <p class="text-xs font-bold mb-2 px-1" style="color: var(--theme-text-secondary)">切换角色</p>

            <!-- Family members list -->
            <div class="space-y-1.5 max-h-[300px] overflow-y-auto">
              <button v-for="member in members" :key="member.id"
                class="w-full flex items-center gap-2.5 p-2 rounded-xl transition-all active:scale-[0.97]"
                :style="{
                  background: authStore.user?.id === member.id && authStore.user?.role === member.role
                    ? 'var(--theme-primary-light, rgba(99,102,241,0.1))' : 'transparent',
                }"
                @click.stop="handleMemberClick(member)">
                <span class="text-xl">{{ member.avatar || getRoleAvatar(member.role) }}</span>
                <div class="flex-1 text-left min-w-0">
                  <p class="text-sm font-semibold truncate" style="color: var(--theme-text)">{{ member.name }}</p>
                  <p class="text-[10px]" style="color: var(--theme-text-light)">{{ getRoleLabel(member.role) }}</p>
                </div>
                <span v-if="authStore.user?.id === member.id && authStore.user?.role === member.role"
                      class="text-xs" style="color: var(--theme-primary)">✓</span>
                <span v-else-if="member.role !== 'child'" class="text-[10px]" style="color: var(--theme-text-light)">🔒</span>
              </button>
            </div>

            <div class="mt-2 pt-2" style="border-top: 1px solid #E8E8E8">
              <button class="w-full flex items-center gap-2 p-2 rounded-xl transition-all active:scale-[0.97]"
                      @click.stop="handleLogout">
                <span class="text-base">🚪</span>
                <span class="text-sm font-semibold" style="color: var(--theme-danger, #E74C3C)">退出登录</span>
              </button>
            </div>
          </div>
        </div>
      </transition>
    </teleport>

    <!-- Password dialog -->
    <teleport to="body">
      <transition name="fade">
        <div v-if="showPasswordDialog" class="fixed inset-0 z-[300] flex items-center justify-center" @click.self="showPasswordDialog = false">
          <div class="absolute inset-0 bg-black/40"></div>
          <div class="relative card p-5 w-[280px] animate-bounce-in">
            <div class="text-center mb-4">
              <span class="text-3xl">{{ switchTarget?.avatar || '🔒' }}</span>
              <h3 class="text-base font-bold mt-1" style="color: var(--theme-text)">切换到 {{ switchTarget?.name }}</h3>
              <p class="text-xs mt-1" style="color: var(--theme-text-secondary)">请输入密码验证身份</p>
            </div>
            <form @submit.prevent="confirmSwitch">
              <input v-model="switchPassword" type="password" class="input mb-3" placeholder="请输入密码" autofocus />
              <p v-if="switchError" class="text-xs mb-3 text-center" style="color: var(--theme-danger)">{{ switchError }}</p>
              <div class="flex gap-2">
                <button type="button" class="btn-secondary flex-1" @click="showPasswordDialog = false">取消</button>
                <button type="submit" class="btn-primary flex-1" :disabled="switching">
                  {{ switching ? '验证中...' : '确认' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </transition>
    </teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore, type FamilyMember } from '../../stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const containerRef = ref<HTMLElement | null>(null)
const showDropdown = ref(false)
const dropdownStyle = ref<Record<string, string>>({})
const members = ref<FamilyMember[]>([])

const showPasswordDialog = ref(false)
const switchTarget = ref<FamilyMember | null>(null)
const switchPassword = ref('')
const switchError = ref('')
const switching = ref(false)

const defaultAvatar = authStore.isAdmin ? '👑' : authStore.isParent ? '❤️' : authStore.isGuest ? '👀' : '👧'

function getRoleAvatar(role: string) {
  const map: Record<string, string> = { admin: '👑', parent: '❤️', child: '👧', guest: '👀' }
  return map[role] || '👤'
}

function getRoleLabel(role: string) {
  const map: Record<string, string> = { admin: '管理员', parent: '家长', child: '宝贝' }
  return map[role] || role
}

async function toggleDropdown() {
  if (showDropdown.value) {
    showDropdown.value = false
    return
  }
  // Load family members
  if (members.value.length === 0) {
    await authStore.fetchFamilyMembers()
    members.value = authStore.familyMembers
  }
  // Position dropdown below the trigger
  await nextTick()
  if (containerRef.value) {
    const rect = containerRef.value.getBoundingClientRect()
    dropdownStyle.value = {
      top: `${rect.bottom + 4}px`,
      right: `${window.innerWidth - rect.right}px`,
    }
  }
  showDropdown.value = true
}

function handleMemberClick(member: FamilyMember) {
  // Already this user
  if (authStore.user?.id === member.id && authStore.user?.role === member.role) {
    showDropdown.value = false
    return
  }

  if (member.role === 'child') {
    // Children switch directly without password
    doSwitch(member)
  } else {
    // Adults need password
    switchTarget.value = member
    switchPassword.value = ''
    switchError.value = ''
    showDropdown.value = false
    showPasswordDialog.value = true
  }
}

async function doSwitch(member: FamilyMember) {
  try {
    const res = await authStore.switchRole(member.id)
    if (res.success) {
      showDropdown.value = false
      if (member.role === 'child') {
        router.replace('/child')
      } else {
        await authStore.fetchChildren()
        router.replace('/admin')
      }
    }
  } catch (e: any) {
    console.error('Switch failed', e)
  }
}

async function confirmSwitch() {
  if (!switchTarget.value || !switchPassword.value) {
    switchError.value = '请输入密码'
    return
  }
  switching.value = true
  switchError.value = ''
  try {
    const res = await authStore.switchRole(switchTarget.value.id, switchPassword.value)
    if (res.success) {
      showPasswordDialog.value = false
      await authStore.fetchChildren()
      router.replace('/admin')
    } else {
      switchError.value = res.message || '密码不正确'
    }
  } catch (e: any) {
    switchError.value = e.response?.data?.message || '切换失败'
  } finally {
    switching.value = false
  }
}

function handleLogout() {
  showDropdown.value = false
  authStore.logout()
  router.replace('/login')
}
</script>
