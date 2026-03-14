<script setup lang="ts">
import { ref } from "vue";
import { useObjectsStore } from "@/stores/object.store";

const objectsStore = useObjectsStore();
const menuOpen = ref(false);

function toggleMenu() {
  menuOpen.value = !menuOpen.value;
}
const baseBtn =
  "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-[1.02]";

const activeIndigo =
  "bg-indigo-500 text-white shadow-md shadow-indigo-500/30";

const inactiveIndigo =
  "bg-indigo-300 text-gray-900 hover:bg-indigo-400";

const activeCyan =
  "bg-cyan-500 text-white shadow-md shadow-cyan-500/30";

const inactiveCyan =
  "bg-cyan-300 text-gray-900 hover:bg-cyan-400";

const activePink =
  "bg-pink-500 text-white shadow-md shadow-pink-500/30";

const inactivePink =
  "bg-pink-300 text-gray-900 hover:bg-pink-400";

</script>

<template>
  <div class="relative flex h-screen bg-gray-900 text-white">
    <!-- Menü Toggle İkonu -->
    <button @click="toggleMenu"
      class="absolute top-4 left-4 z-50 w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center shadow-lg hover:bg-gray-600 transition-colors">
      ☰
    </button>

    <!-- Açılır Menü -->
    <transition name="fade-slide">
  <div
    v-if="menuOpen"
    class="absolute top-16 left-4
    w-52 p-3
    bg-gray-900/90 backdrop-blur-xl
    border border-gray-700
    rounded-xl shadow-2xl
    flex flex-col gap-2
    z-50">

    <!-- Başlık -->
    <div class="text-xs text-gray-400 px-2 mb-1 tracking-wide">
      CANVAS ARAÇLARI
    </div>

    <!-- Başlık -->
    <button
      @click="objectsStore.toggleCanvasTitle()"
      :class="[
        baseBtn,
        objectsStore.canvasTitleMode ? activeIndigo : inactiveIndigo
      ]">
      🧾 Başlık
    </button>

    <!-- Not -->
    <button
      @click="objectsStore.toggleNoteMode()"
      :class="[
        baseBtn,
        objectsStore.noteMode ? activeIndigo : inactiveIndigo
      ]">
      📝 Not
    </button>

    <!-- Liste -->
    <button
      @click="objectsStore.toggleCheckList()"
      :class="[
        baseBtn,
        objectsStore.checkListMode ? activeIndigo : inactiveIndigo
      ]">
      ☑️ Liste
    </button>

    <div class="border-t border-gray-700 my-1"></div>

    <!-- Bağlantı -->
    <button
      @click="objectsStore.toggleConnectionMode()"
      :class="[
        baseBtn,
        objectsStore.connectionMode ? activeCyan : inactiveCyan
      ]">
      🔗 Bağlantı
    </button>

    <!-- Grup -->
    <button
      @click="objectsStore.toggleGroupMode()"
      :class="[
        baseBtn,
        objectsStore.groupMode ? activePink : inactivePink
      ]">
      🗂️ Grup
    </button>

    <!-- Version -->
    <div class="text-[11px] text-gray-500 mt-2 text-center">
      Canvas v1.0.0
    </div>

  </div>
</transition>

    <!-- Canvas -->
    <main class="flex-1 relative overflow-hidden">
      <slot />
    </main>
  </div>
</template>

<style>
/* Fade + slide animasyonu */
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.2s ease;
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateY(-10px);
}

.fade-slide-enter-to {
  opacity: 1;
  transform: translateY(0);
}

.fade-slide-leave-from {
  opacity: 1;
  transform: translateY(0);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
