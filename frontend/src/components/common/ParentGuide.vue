<template>
  <teleport to="body">
    <transition name="page">
      <div v-if="visible" class="fixed inset-0 z-[100] flex items-center justify-center"
           @click.self="$emit('update:visible', false)">
        <div class="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>
        <div class="relative mx-3 w-full max-w-[420px] card animate-bounce-in p-5 max-h-[88vh] overflow-y-auto">
          <!-- 标题 -->
          <div class="text-center mb-5">
            <span class="text-4xl">📖</span>
            <h2 class="text-lg font-bold mt-2" style="color: var(--theme-text)">父母使用守则</h2>
            <p class="text-xs mt-1" style="color: var(--theme-text-light)">和孩子一起成长的正确姿势</p>
          </div>

          <!-- 内容 -->
          <div class="flex flex-col gap-5">
            <!-- 核心理念 -->
            <section>
              <h3 class="text-sm font-bold mb-2 flex items-center gap-1.5" style="color: var(--theme-primary)">
                💡 核心理念
              </h3>
              <div class="text-xs leading-relaxed flex flex-col gap-2" style="color: var(--theme-text-secondary)">
                <p>这个系统的目的是<b style="color: var(--theme-text)">鼓励</b>，而非控制。我们希望通过正向反馈帮助孩子建立好习惯，而不是用积分来"交易"行为。</p>
                <p>积分是一种<b style="color: var(--theme-text)">看得见的认可</b>，让孩子知道"我做得好，爸爸妈妈看到了"。</p>
              </div>
            </section>

            <!-- 录入原则 -->
            <section>
              <h3 class="text-sm font-bold mb-2 flex items-center gap-1.5" style="color: var(--theme-primary)">
                ⭐ 录入原则
              </h3>
              <div class="flex flex-col gap-2.5">
                <div class="flex gap-2 text-xs" style="color: var(--theme-text-secondary)">
                  <span class="shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold" style="background: var(--theme-bg-secondary); color: var(--theme-primary)">1</span>
                  <div><b style="color: var(--theme-text)">及时录入</b>：行为发生后尽快记录，让孩子感受到即时反馈，强化正向连接。</div>
                </div>
                <div class="flex gap-2 text-xs" style="color: var(--theme-text-secondary)">
                  <span class="shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold" style="background: var(--theme-bg-secondary); color: var(--theme-primary)">2</span>
                  <div><b style="color: var(--theme-text)">关注过程</b>：录入时附上一句鼓励语，肯定的是努力和态度，而非天赋。比如"你今天练琴很认真"比"你真聪明"更好。</div>
                </div>
                <div class="flex gap-2 text-xs" style="color: var(--theme-text-secondary)">
                  <span class="shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold" style="background: var(--theme-bg-secondary); color: var(--theme-primary)">3</span>
                  <div><b style="color: var(--theme-text)">保持一致</b>：同样的行为给同样的分值，不因心情好坏而波动，让规则可预期。</div>
                </div>
                <div class="flex gap-2 text-xs" style="color: var(--theme-text-secondary)">
                  <span class="shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold" style="background: var(--theme-bg-secondary); color: var(--theme-primary)">4</span>
                  <div><b style="color: var(--theme-text)">不要扣分</b>：系统不设扣分机制。孩子做得不好时，用沟通代替惩罚，"今天没有加分"本身就是信号。</div>
                </div>
              </div>
            </section>

            <!-- 沟通技巧 -->
            <section>
              <h3 class="text-sm font-bold mb-2 flex items-center gap-1.5" style="color: var(--theme-primary)">
                💬 沟通技巧
              </h3>
              <div class="flex flex-col gap-2.5">
                <div class="p-2.5 rounded-xl text-xs" style="background: var(--theme-bg-secondary)">
                  <p class="font-bold mb-1" style="color: var(--theme-text)">✅ 好的表达</p>
                  <p style="color: var(--theme-text-secondary)">"你今天主动整理了书包，妈妈很开心！给你加了3分哦～"</p>
                </div>
                <div class="p-2.5 rounded-xl text-xs" style="background: #FFF0F0">
                  <p class="font-bold mb-1" style="color: var(--theme-danger)">❌ 避免的表达</p>
                  <p style="color: var(--theme-text-secondary)">"你再不听话就不给你加分了！"——不要把积分当威胁工具。</p>
                </div>
                <div class="p-2.5 rounded-xl text-xs" style="background: var(--theme-bg-secondary)">
                  <p class="font-bold mb-1" style="color: var(--theme-text)">✅ 好的表达</p>
                  <p style="color: var(--theme-text-secondary)">"这首曲子你练了好多遍，虽然还有点难，但比昨天进步了！"</p>
                </div>
                <div class="p-2.5 rounded-xl text-xs" style="background: #FFF0F0">
                  <p class="font-bold mb-1" style="color: var(--theme-danger)">❌ 避免的表达</p>
                  <p style="color: var(--theme-text-secondary)">"别的小朋友都能弹好，你怎么还不会？"——不做横向比较。</p>
                </div>
              </div>
            </section>

            <!-- 奖品兑换 -->
            <section>
              <h3 class="text-sm font-bold mb-2 flex items-center gap-1.5" style="color: var(--theme-primary)">
                🎁 奖品兑换建议
              </h3>
              <div class="text-xs leading-relaxed flex flex-col gap-2" style="color: var(--theme-text-secondary)">
                <p>• <b style="color: var(--theme-text)">和孩子一起选奖品</b>：让她参与奖品设置，有期待感才有动力。</p>
                <p>• <b style="color: var(--theme-text)">体验优于物质</b>：去公园野餐、和好朋友玩等体验奖励，比单纯买东西更有教育意义。</p>
                <p>• <b style="color: var(--theme-text)">兑换是庆祝时刻</b>：孩子兑换奖品时，认真说"你通过自己的努力赢得了它"，建立成就感。</p>
                <p>• <b style="color: var(--theme-text)">别催促消费</b>：孩子攒着积分不花也没关系，存的过程本身也是一种自控力训练。</p>
              </div>
            </section>

            <!-- 常见误区 -->
            <section>
              <h3 class="text-sm font-bold mb-2 flex items-center gap-1.5" style="color: var(--theme-primary)">
                ⚠️ 常见误区
              </h3>
              <div class="text-xs leading-relaxed flex flex-col gap-2" style="color: var(--theme-text-secondary)">
                <p>• <b style="color: var(--theme-danger)">误区一</b>：事事都打分 → 日常行为选几个重点即可，不需要每件小事都记录。</p>
                <p>• <b style="color: var(--theme-danger)">误区二</b>：只关注分数 → 分数只是工具，别让孩子觉得"做好事=为了积分"。</p>
                <p>• <b style="color: var(--theme-danger)">误区三</b>：标准不统一 → 爸爸妈妈之间要提前沟通好标准，避免"妈妈给分、爸爸不给"的混乱。</p>
                <p>• <b style="color: var(--theme-danger)">误区四</b>：忽视内在动机 → 随着孩子长大，逐渐减少外在奖励，引导她因为"自己想做好"而行动。</p>
              </div>
            </section>

            <!-- 长期目标 -->
            <section>
              <h3 class="text-sm font-bold mb-2 flex items-center gap-1.5" style="color: var(--theme-primary)">
                🌱 长期目标
              </h3>
              <div class="text-xs leading-relaxed" style="color: var(--theme-text-secondary)">
                <p>这个系统是脚手架，不是永久建筑。它帮助孩子在成长初期建立好习惯的框架，当这些习惯内化为她自己的一部分后，积分系统就可以慢慢淡出了。</p>
                <p class="mt-2">我们的终极目标是：<b style="color: var(--theme-text)">有一天，她不需要积分也能自律地做好每一件事</b>。</p>
              </div>
            </section>
          </div>

          <!-- 关闭按钮 -->
          <button class="btn-primary w-full mt-5" @click="$emit('update:visible', false)">
            我知道了 ✨
          </button>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script setup lang="ts">
defineProps<{ visible: boolean }>()
defineEmits<{ 'update:visible': [value: boolean] }>()
</script>
