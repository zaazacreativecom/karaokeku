<template>
  <div
    v-if="authStore.isLoggedIn"
    class="chat-widget-container"
    :class="{ open: chatStore.isWidgetOpen }"
    :style="karaokeDockStyle"
  >
    <button
      v-if="chatStore.isWidgetOpen"
      class="chat-backdrop"
      type="button"
      aria-label="Tutup chat"
      @click="chatStore.toggleWidget"
    />

    <div class="chat-popup" :class="{ open: chatStore.isWidgetOpen }" role="dialog" aria-label="Chat">
      <div class="sheet-handle" aria-hidden="true"></div>

      <!-- Conversation List View -->
      <div v-if="!chatStore.isChatOpen" class="chat-panel">
        <div class="popup-header">
          <div class="header-left">
            <div class="header-icon" aria-hidden="true">
              <i class="bi bi-chat-heart-fill"></i>
            </div>

            <div class="header-text">
              <div class="header-title">
                <h3>Chat</h3>
                <span class="header-sparkle" aria-hidden="true"><i class="bi bi-stars"></i></span>
              </div>
              <p class="header-subtitle">Ngobrol bareng teman karaoke</p>
            </div>
          </div>

          <button class="icon-btn" type="button" aria-label="Tutup" @click="toggleChat">
            <i class="bi bi-x-lg"></i>
          </button>
        </div>

        <div class="chat-tabs" role="tablist" aria-label="Chat navigation">
          <button
            class="chat-tab"
            type="button"
            role="tab"
            :aria-selected="activeTab === 'conversations'"
            :class="{ active: activeTab === 'conversations' }"
            @click="activeTab = 'conversations'"
          >
            <i class="bi bi-chat-dots-fill"></i>
            <span>Percakapan</span>
            <span v-if="chatStore.unreadCount > 0" class="tab-badge">{{ chatStore.unreadCount }}</span>
          </button>
          <button
            class="chat-tab"
            type="button"
            role="tab"
            :aria-selected="activeTab === 'users'"
            :class="{ active: activeTab === 'users' }"
            @click="activeTab = 'users'"
          >
            <i class="bi bi-people-fill"></i>
            <span>Cari</span>
          </button>
        </div>

        <div v-if="activeTab === 'users'" class="search-bar">
          <i class="bi bi-search" aria-hidden="true"></i>
          <input
            ref="searchInput"
            v-model="searchQuery"
            placeholder="Cari pengguna…"
            type="text"
            autocomplete="off"
            @keydown.esc="clearSearch"
          />
          <button
            v-if="searchQuery"
            class="btn-clear"
            type="button"
            aria-label="Hapus pencarian"
            @click="clearSearch"
          >
            <i class="bi bi-x"></i>
          </button>
        </div>

        <div class="chat-list">
          <!-- Conversations -->
          <template v-if="activeTab === 'conversations'">
            <div v-if="chatStore.conversations.length === 0" class="empty-state">
              <div class="empty-emoji" aria-hidden="true">
                <i class="bi bi-chat-square-heart"></i>
                <i class="bi bi-stars"></i>
              </div>
              <p>Belum ada percakapan.</p>
              <button class="btn btn-primary btn-sm empty-cta" type="button" @click="activeTab = 'users'">
                <i class="bi bi-person-plus-fill"></i>
                Mulai Chat
              </button>
            </div>

            <button
              v-for="conv in chatStore.conversations"
              :key="conv.partner.id"
              class="chat-item"
              type="button"
              @click="openConversation(conv.partner.id)"
            >
              <div class="avatar" aria-hidden="true">
                <span class="avatar-initial">{{ getInitial(conv.partner.name) }}</span>
              </div>

              <div class="item-body">
                <div class="item-top">
                  <span class="item-name">{{ conv.partner.name }}</span>
                  <span v-if="conv.lastMessage" class="item-time">{{ formatTime(conv.lastMessage.created_at) }}</span>
                </div>

                <div class="item-bottom">
                  <span class="item-last text-truncate">{{ conv.lastMessage?.message || 'Memulai percakapan' }}</span>
                  <span v-if="conv.unreadCount > 0" class="badge-unread">{{ conv.unreadCount }}</span>
                </div>
              </div>

              <i class="bi bi-chevron-right item-chevron" aria-hidden="true"></i>
            </button>
          </template>

          <!-- Users search -->
          <template v-else>
            <div v-if="!searchQuery" class="empty-state empty-state--compact">
              <div class="empty-emoji" aria-hidden="true">
                <i class="bi bi-emoji-smile"></i>
                <i class="bi bi-stars"></i>
              </div>
              <p>Ketik nama untuk mencari pengguna.</p>
              <div class="empty-hint">
                <i class="bi bi-lightning-charge-fill"></i>
                Cari cepat dan mulai chat.
              </div>
            </div>

            <div v-else-if="filteredUsers.length === 0" class="empty-state empty-state--compact">
              <div class="empty-emoji" aria-hidden="true">
                <i class="bi bi-person-x-fill"></i>
              </div>
              <p>Tidak ada pengguna yang cocok.</p>
            </div>

            <template v-else>
              <div class="section-label">
                <i class="bi bi-magic" aria-hidden="true"></i>
                Hasil ({{ filteredUsers.length }})
              </div>

              <button
                v-for="user in filteredUsers"
                :key="user.id"
                class="chat-item"
                type="button"
                @click="openConversation(user.id)"
              >
                <div class="avatar avatar--soft" aria-hidden="true">
                  <i class="bi bi-person-fill"></i>
                </div>

                <div class="item-body">
                  <div class="item-top">
                    <span class="item-name">{{ user.name }}</span>
                    <span v-if="user.role" class="role-pill">{{ user.role }}</span>
                  </div>

                  <div class="item-bottom">
                    <span class="item-last item-last--hint">
                      <i class="bi bi-chat-dots"></i>
                      Mulai chat
                    </span>
                  </div>
                </div>

                <i class="bi bi-chevron-right item-chevron" aria-hidden="true"></i>
              </button>
            </template>
          </template>
        </div>
      </div>

      <!-- Active Chat Window -->
      <ChatWindow v-else :partnerId="chatStore.activePartnerId" @close="chatStore.closeChat()" />
    </div>

    <!-- Floating Trigger Button (hidden on mobile, mobile uses bottom nav) -->
    <button
      class="chat-trigger-btn"
      type="button"
      :aria-label="chatStore.isWidgetOpen ? 'Tutup chat' : 'Buka chat'"
      @click="toggleChat"
    >
      <i class="bi" :class="chatStore.isWidgetOpen ? 'bi-x-lg' : 'bi-chat-dots-fill'"></i>
      <span class="trigger-sparkle" aria-hidden="true">
        <i class="bi bi-stars"></i>
      </span>
      <span v-if="chatStore.unreadCount > 0 && !chatStore.isWidgetOpen" class="main-badge-unread">
        {{ chatStore.unreadCount }}
      </span>
    </button>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch, onUnmounted, nextTick } from 'vue';
import { useRoute } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { useChatStore } from '@/stores/chat';
import ChatWindow from './ChatWindow.vue';

const authStore = useAuthStore();
const chatStore = useChatStore();
const route = useRoute();

const activeTab = ref('conversations');
const searchQuery = ref('');
const searchInput = ref(null);

const isCompactViewport = ref(false);
const karaokeDockPosition = ref({ bottomPx: 32, rightPx: 32 });

const isKaraokeRoute = computed(() => route.path?.startsWith('/karaoke'));
const shouldDockToControlsBar = computed(() => isKaraokeRoute.value && !isCompactViewport.value);

const updateViewportMode = () => {
  if (typeof window === 'undefined') return;
  isCompactViewport.value = window.matchMedia?.('(max-width: 768px)')?.matches ?? false;
};

const updateKaraokeDockPosition = () => {
  if (typeof window === 'undefined') return;
  updateViewportMode();

  if (!shouldDockToControlsBar.value) {
    karaokeDockPosition.value = { bottomPx: 32, rightPx: 32 };
    return;
  }

  const controlsBarEl = document.querySelector('.karaoke-layout .controls-bar');
  if (!controlsBarEl) return;

  const rect = controlsBarEl.getBoundingClientRect();
  const gap = 12;

  const bottomPx = Math.round(Math.max(32, window.innerHeight - rect.top + gap));
  const rightPx = Math.round(Math.max(16, window.innerWidth - rect.right));
  karaokeDockPosition.value = { bottomPx, rightPx };
};

const scheduleDockUpdate = () => {
  if (typeof window === 'undefined') return;
  requestAnimationFrame(() => {
    updateKaraokeDockPosition();
    requestAnimationFrame(updateKaraokeDockPosition);
  });
};

const karaokeDockStyle = computed(() => {
  if (!shouldDockToControlsBar.value) return {};
  return {
    '--chat-dock-bottom': `${karaokeDockPosition.value.bottomPx}px`,
    '--chat-dock-right': `${karaokeDockPosition.value.rightPx}px`
  };
});

const normalizedQuery = computed(() => searchQuery.value.trim().toLowerCase());

const filteredUsers = computed(() => {
  const q = normalizedQuery.value;
  if (!q) return [];

  const list = Array.isArray(chatStore.users) ? chatStore.users : [];
  return list
    .filter((u) => (u?.name || '').toLowerCase().includes(q))
    .slice(0, 20);
});

const clearSearch = async () => {
  searchQuery.value = '';
  await nextTick();
  searchInput.value?.focus?.();
};

const toggleChat = () => {
  chatStore.toggleWidget();
};

const openConversation = (partnerId) => {
  activeTab.value = 'conversations';
  searchQuery.value = '';
  chatStore.openChat(partnerId);
};

const formatTime = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const getInitial = (name) => {
  const trimmed = (name || '').trim();
  if (!trimmed) return '•';
  return trimmed[0].toUpperCase();
};

watch(
  () => chatStore.isWidgetOpen,
  async (open) => {
    await nextTick();
    scheduleDockUpdate();

    if (open) {
      activeTab.value = 'conversations';
      searchQuery.value = '';
    }
  }
);

watch(
  () => route.path,
  async () => {
    await nextTick();
    scheduleDockUpdate();
  }
);

watch(activeTab, async (tab) => {
  if (tab !== 'users') return;
  await nextTick();
  searchInput.value?.focus?.();
});

onMounted(() => {
  if (authStore.isLoggedIn) {
    chatStore.init();
  }

  if (typeof window !== 'undefined') {
    updateViewportMode();
    scheduleDockUpdate();
    window.addEventListener('resize', scheduleDockUpdate);
  }
});

onUnmounted(() => {
  if (typeof window !== 'undefined') {
    window.removeEventListener('resize', scheduleDockUpdate);
  }
});
</script>

<style scoped>
.chat-widget-container {
  --chat-dock-bottom: 2rem;
  --chat-dock-right: 2rem;
  --chat-trigger-size: 58px;

  --chat-gradient: linear-gradient(135deg, #22c55e 0%, #06b6d4 55%, #3b82f6 100%);
  --chat-glow: linear-gradient(
    135deg,
    rgba(34, 197, 94, 0.26) 0%,
    rgba(6, 182, 212, 0.22) 55%,
    rgba(59, 130, 246, 0.18) 100%
  );
  --chat-border: rgba(94, 234, 212, 0.16);
  --chat-surface: rgba(255, 255, 255, 0.06);
  --chat-surface-2: rgba(255, 255, 255, 0.1);
  --chat-text: rgba(255, 255, 255, 0.92);
  --chat-muted: rgba(255, 255, 255, 0.68);
  --chat-bg: rgba(4, 12, 16, 0.88);
  --chat-radius: 24px;

  /* Override global vars just for chat subtree */
  --primary: #06b6d4;
  --primary-light: #5eead4;
  --primary-dark: #0891b2;
  --accent: #06b6d4;
  --gradient-primary: var(--chat-gradient);
  --gradient-glow: var(--chat-glow);
  --bg-main: #070c10;
  --bg-card: rgba(4, 12, 16, 0.92);
  --bg-darker: rgba(4, 12, 16, 0.72);
  --border-color: rgba(94, 234, 212, 0.14);
  --border-color-light: rgba(94, 234, 212, 0.24);

  position: fixed;
  bottom: var(--chat-dock-bottom);
  right: var(--chat-dock-right);
  z-index: 2500;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.85rem;
}

.chat-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.55);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  opacity: 0;
  pointer-events: none;
  transition: opacity var(--transition-normal);
}

.chat-widget-container.open .chat-backdrop {
  opacity: 1;
  pointer-events: auto;
}

.chat-popup {
  position: absolute;
  right: 0;
  bottom: calc(var(--chat-trigger-size) + 0.85rem);
  width: 390px;
  height: 560px;
  max-height: calc(100vh - var(--chat-dock-bottom) - var(--chat-trigger-size) - 3.5rem);
  background: var(--chat-bg);
  border-radius: var(--chat-radius);
  border: 1px solid var(--chat-border);
  box-shadow: 0 28px 90px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(94, 234, 212, 0.06) inset;
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  transform-origin: bottom right;
  transform: translate3d(0, 10px, 0) scale(0.98);
  opacity: 0;
  pointer-events: none;
  transition: transform var(--transition-normal), opacity var(--transition-normal);
  isolation: isolate;
}

.chat-popup::before {
  content: '';
  position: absolute;
  left: 18px;
  right: 18px;
  top: 0;
  height: 1px;
  border-radius: 999px;
  background: var(--chat-glow);
  opacity: 0.85;
  pointer-events: none;
  z-index: 1;
}

.chat-popup::after {
  content: '';
  position: absolute;
  inset: 0;
  background:
    radial-gradient(650px 420px at 15% 0%, rgba(34, 197, 94, 0.18) 0%, transparent 60%),
    radial-gradient(700px 460px at 90% 10%, rgba(6, 182, 212, 0.16) 0%, transparent 60%),
    radial-gradient(760px 520px at 60% 100%, rgba(59, 130, 246, 0.12) 0%, transparent 65%);
  opacity: 0.75;
  pointer-events: none;
  z-index: 0;
}

.chat-popup > * {
  position: relative;
  z-index: 2;
}

.chat-popup.open {
  transform: translate3d(0, 0, 0) scale(1);
  opacity: 1;
  pointer-events: auto;
}

.sheet-handle {
  display: none;
  width: 46px;
  height: 5px;
  border-radius: 999px;
  margin: 0.75rem auto 0.35rem;
  background: rgba(255, 255, 255, 0.16);
}

.chat-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.popup-header {
  padding: 0.95rem 1rem 0.75rem;
  border-bottom: 1px solid rgba(94, 234, 212, 0.14);
  background: linear-gradient(180deg, rgba(34, 197, 94, 0.12) 0%, rgba(6, 182, 212, 0.06) 100%);
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  min-width: 0;
}

.header-icon {
  width: 44px;
  height: 44px;
  border-radius: 16px;
  background: var(--chat-gradient);
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(4, 12, 16, 0.9);
  box-shadow: 0 18px 46px rgba(0, 0, 0, 0.55), 0 0 40px rgba(6, 182, 212, 0.24);
  flex: 0 0 auto;
}

.header-icon i {
  font-size: 1.15rem;
}

.header-text {
  min-width: 0;
}

.header-title {
  display: flex;
  align-items: center;
  gap: 0.45rem;
}

.header-title h3 {
  margin: 0;
  font-size: 1.05rem;
  font-weight: 850;
  letter-spacing: -0.02em;
  color: var(--chat-text);
}

.header-sparkle {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  border-radius: 9px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(94, 234, 212, 0.12);
  color: rgba(94, 234, 212, 0.95);
}

.header-subtitle {
  margin: 0.15rem 0 0;
  font-size: 0.82rem;
  color: var(--chat-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.icon-btn {
  width: 40px;
  height: 40px;
  border-radius: 14px;
  border: 1px solid rgba(94, 234, 212, 0.16);
  background: rgba(255, 255, 255, 0.06);
  color: rgba(255, 255, 255, 0.9);
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: transform var(--transition-fast), background var(--transition-fast), border-color var(--transition-fast);
  flex: 0 0 auto;
}

.icon-btn:hover {
  transform: translateY(-1px);
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(94, 234, 212, 0.24);
}

.chat-tabs {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.55rem;
  padding: 0.75rem 1rem 0.65rem;
}

.chat-tab {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.45rem;
  padding: 0.55rem 0.75rem;
  border-radius: 999px;
  border: 1px solid rgba(94, 234, 212, 0.14);
  background: rgba(255, 255, 255, 0.05);
  color: rgba(255, 255, 255, 0.82);
  font-weight: 750;
  font-size: 0.82rem;
  cursor: pointer;
  transition: transform var(--transition-fast), background var(--transition-fast), border-color var(--transition-fast);
}

.chat-tab:hover {
  transform: translateY(-1px);
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(94, 234, 212, 0.22);
}

.chat-tab.active {
  background: var(--chat-gradient);
  border-color: rgba(4, 12, 16, 0.5);
  color: rgba(4, 12, 16, 0.92);
  box-shadow: 0 18px 50px rgba(0, 0, 0, 0.55), 0 0 44px rgba(6, 182, 212, 0.18);
}

.tab-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 20px;
  height: 20px;
  padding: 0 6px;
  border-radius: 999px;
  background: rgba(4, 12, 16, 0.82);
  color: #bff6ff;
  font-size: 0.72rem;
  border: 1px solid rgba(255, 255, 255, 0.18);
}

.search-bar {
  position: relative;
  margin: 0 1rem 0.75rem;
}

.search-bar i {
  position: absolute;
  left: 0.95rem;
  top: 50%;
  transform: translateY(-50%);
  color: rgba(255, 255, 255, 0.55);
  pointer-events: none;
}

.search-bar input {
  width: 100%;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(94, 234, 212, 0.14);
  border-radius: 18px;
  padding: 0.75rem 2.7rem 0.75rem 2.6rem;
  color: rgba(255, 255, 255, 0.92);
  outline: none;
  transition: box-shadow var(--transition-fast), border-color var(--transition-fast);
}

.search-bar input:focus {
  border-color: rgba(94, 234, 212, 0.28);
  box-shadow: 0 0 0 4px rgba(6, 182, 212, 0.16);
}

.btn-clear {
  position: absolute;
  right: 0.55rem;
  top: 50%;
  transform: translateY(-50%);
  width: 34px;
  height: 34px;
  border-radius: 14px;
  border: 1px solid rgba(94, 234, 212, 0.14);
  background: rgba(255, 255, 255, 0.06);
  color: rgba(255, 255, 255, 0.82);
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: transform var(--transition-fast), background var(--transition-fast), border-color var(--transition-fast);
}

.btn-clear:hover {
  transform: translateY(-50%) scale(1.02);
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(94, 234, 212, 0.24);
}

.chat-list {
  flex: 1;
  overflow-y: auto;
  padding: 0 1rem 1rem;
}

.section-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0.25rem 0 0.65rem;
  color: rgba(255, 255, 255, 0.72);
  font-size: 0.78rem;
  font-weight: 750;
  letter-spacing: 0.02em;
}

.chat-item {
  width: 100%;
  text-align: left;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.8rem 0.85rem;
  border-radius: 18px;
  border: 1px solid rgba(94, 234, 212, 0.12);
  background: rgba(255, 255, 255, 0.035);
  color: rgba(255, 255, 255, 0.9);
  cursor: pointer;
  margin-bottom: 0.55rem;
  transition: transform var(--transition-fast), background var(--transition-fast), border-color var(--transition-fast);
}

.chat-item:hover {
  transform: translateY(-1px);
  background: rgba(255, 255, 255, 0.06);
  border-color: rgba(94, 234, 212, 0.22);
}

.chat-item:focus-visible {
  outline: none;
  border-color: rgba(94, 234, 212, 0.32);
  box-shadow: 0 0 0 4px rgba(6, 182, 212, 0.16);
}

.avatar {
  width: 46px;
  height: 46px;
  border-radius: 16px;
  border: 1px solid rgba(94, 234, 212, 0.16);
  background: rgba(255, 255, 255, 0.06);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  flex: 0 0 auto;
}

.avatar::before {
  content: '';
  position: absolute;
  inset: 0;
  background: var(--chat-glow);
  opacity: 0.32;
  pointer-events: none;
}

.avatar-initial {
  position: relative;
  z-index: 1;
  font-weight: 900;
  color: rgba(255, 255, 255, 0.9);
}

.avatar--soft {
  background: rgba(6, 182, 212, 0.1);
  border-color: rgba(94, 234, 212, 0.2);
  color: #bff6ff;
}

.avatar--soft::before {
  opacity: 0.22;
}

.item-body {
  flex: 1;
  min-width: 0;
}

.item-top {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 0.75rem;
}

.item-name {
  font-weight: 850;
  letter-spacing: -0.01em;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.item-time {
  font-size: 0.72rem;
  color: rgba(255, 255, 255, 0.6);
  flex: 0 0 auto;
}

.role-pill {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.18rem 0.55rem;
  border-radius: 999px;
  border: 1px solid rgba(94, 234, 212, 0.16);
  background: rgba(255, 255, 255, 0.06);
  color: rgba(255, 255, 255, 0.78);
  font-size: 0.72rem;
  font-weight: 750;
}

.item-bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  margin-top: 0.25rem;
}

.item-last {
  font-size: 0.82rem;
  color: rgba(255, 255, 255, 0.68);
  max-width: 100%;
}

.item-last--hint {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  color: rgba(255, 255, 255, 0.72);
}

.badge-unread {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 22px;
  height: 22px;
  padding: 0 7px;
  border-radius: 999px;
  background: var(--chat-gradient);
  color: rgba(4, 12, 16, 0.92);
  font-size: 0.72rem;
  font-weight: 900;
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.45);
}

.item-chevron {
  color: rgba(255, 255, 255, 0.45);
  flex: 0 0 auto;
}

.empty-state {
  text-align: center;
  padding: 1.8rem 0.75rem;
  color: rgba(255, 255, 255, 0.72);
  border: 1px dashed rgba(94, 234, 212, 0.18);
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.03);
  margin-bottom: 0.75rem;
}

.empty-state--compact {
  padding: 1.4rem 0.75rem;
}

.empty-emoji {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.45rem;
  font-size: 1.8rem;
  margin-bottom: 0.65rem;
  color: rgba(94, 234, 212, 0.95);
}

.empty-cta {
  margin-top: 0.6rem;
  border-radius: 999px;
  padding: 0.5rem 0.9rem;
}

.empty-hint {
  margin-top: 0.45rem;
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  font-size: 0.78rem;
  color: rgba(255, 255, 255, 0.6);
}

.chat-trigger-btn {
  width: var(--chat-trigger-size);
  height: var(--chat-trigger-size);
  border-radius: 50%;
  border: 1px solid rgba(94, 234, 212, 0.18);
  background: var(--chat-gradient);
  color: rgba(4, 12, 16, 0.92);
  cursor: pointer;
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  box-shadow: 0 18px 54px rgba(0, 0, 0, 0.6), 0 0 40px rgba(6, 182, 212, 0.25);
  transition: transform var(--transition-fast), box-shadow var(--transition-fast);
}

.chat-trigger-btn:hover {
  transform: translateY(-2px) scale(1.02);
  box-shadow: 0 22px 70px rgba(0, 0, 0, 0.7), 0 0 52px rgba(6, 182, 212, 0.34);
}

.trigger-sparkle {
  position: absolute;
  left: 6px;
  top: 6px;
  width: 18px;
  height: 18px;
  border-radius: 9px;
  background: rgba(255, 255, 255, 0.14);
  border: 1px solid rgba(4, 12, 16, 0.22);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: rgba(4, 12, 16, 0.75);
  font-size: 0.75rem;
  pointer-events: none;
}

.main-badge-unread {
  position: absolute;
  top: -6px;
  right: -6px;
  min-width: 22px;
  height: 22px;
  padding: 0 7px;
  border-radius: 999px;
  background: rgba(239, 68, 68, 0.98);
  color: white;
  font-size: 0.72rem;
  font-weight: 900;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 2px solid var(--bg-main);
  box-shadow: 0 14px 30px rgba(0, 0, 0, 0.55);
}

/* Make ChatWindow + bubbles match the new theme without editing those files */
:deep(.chat-window) {
  background: transparent;
}

:deep(.chat-header) {
  background: var(--chat-gradient);
  color: rgba(4, 12, 16, 0.92);
}

:deep(.chat-header .avatar) {
  background: rgba(4, 12, 16, 0.18);
}

:deep(.chat-header .status) {
  opacity: 0.75;
}

:deep(.chat-messages) {
  background: rgba(4, 12, 16, 0.35);
}

:deep(.chat-input) {
  background: rgba(4, 12, 16, 0.6);
  border-top: 1px solid rgba(94, 234, 212, 0.14);
}

:deep(.chat-input input) {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(94, 234, 212, 0.14);
}

:deep(.chat-input input:focus) {
  border-color: rgba(94, 234, 212, 0.28);
  box-shadow: 0 0 0 4px rgba(6, 182, 212, 0.16);
}

:deep(.chat-input button) {
  background: var(--chat-gradient);
  color: rgba(4, 12, 16, 0.92);
}

:deep(.chat-bubble.mine .bubble-content) {
  background: var(--chat-gradient);
  color: rgba(4, 12, 16, 0.92);
}

:deep(.chat-bubble:not(.mine) .bubble-content) {
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(94, 234, 212, 0.12);
}

/* Mobile: full-screen sheet, trigger hidden (use MobileNav) */
@media (max-width: 768px) {
  .chat-trigger-btn {
    display: none !important;
  }

  .chat-widget-container {
    inset: 0;
    width: 100%;
    height: 100vh;
    height: 100dvh;
    align-items: stretch;
    justify-content: flex-end;
    z-index: 3600;
    padding-bottom: 0;
    pointer-events: none;
  }

  .chat-widget-container.open {
    pointer-events: auto;
  }

  .chat-popup {
    position: relative;
    width: 100%;
    height: 100%;
    max-height: none;
    border-radius: 0;
    margin: 0;
    transform-origin: bottom center;
    transform: translate3d(0, 110%, 0);
  }

  .chat-popup.open {
    transform: translate3d(0, 0, 0);
  }

  .sheet-handle {
    display: none;
  }

  .chat-list {
    padding-bottom: calc(1rem + env(safe-area-inset-bottom));
  }

  :deep(.chat-input) {
    padding-bottom: calc(0.75rem + env(safe-area-inset-bottom));
  }

  :deep(.chat-header) {
    border-top-left-radius: 0;
    border-top-right-radius: 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .chat-backdrop,
  .chat-popup,
  .chat-trigger-btn,
  .chat-tab,
  .chat-item,
  .icon-btn,
  .btn-clear {
    transition: none !important;
  }
}
</style>
