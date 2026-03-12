<script setup lang="ts">
import { ref } from "vue";
import { useObjectsStore } from "@/stores/object.store";

const objectsStore = useObjectsStore();
const menuOpen = ref(false);

function toggleMenu() {
  menuOpen.value = !menuOpen.value;
}
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
      <div v-if="menuOpen"
        class="absolute top-16 left-4 bg-gray-800 p-4 rounded-lg shadow-lg flex flex-col gap-2 z-50 w-48">
        <!-- Not Ekle -->
        <button @click="objectsStore.toogleNoteMode()"
          :class="objectsStore.noteMode ? 'bg-indigo-500 text-white' : 'bg-indigo-300 text-gray-900'"
          class="rounded p-2 font-medium hover:brightness-105 transition">
          📦 Not Ekle
        </button>

        <!-- Doküman Ekle -->
        <button @click="objectsStore.toogleDocMode()"
          :class="objectsStore.docMode ? 'bg-green-500 text-white' : 'bg-green-300 text-gray-900'"
          class="rounded p-2 font-medium hover:brightness-105 transition">
          📄 Doküman Ekle
        </button>

        <!-- Bağlantı Modu -->
        <button @click="objectsStore.toggleConnectionMode()"
          :class="objectsStore.connectionMode ? 'bg-cyan-500 text-white' : 'bg-cyan-300 text-gray-900'"
          class="rounded p-2 font-medium hover:brightness-105 transition">
          🔗 Bağlantı
        </button>

        <!-- Grup Modu -->
        <button @click="objectsStore.toogleGroupMode()"
          :class="objectsStore.groupMode ? 'bg-pink-500 text-white' : 'bg-pink-300 text-gray-900'"
          class="rounded p-2 font-medium hover:brightness-105 transition">
          🗂️ Grup
        </button>

        <!-- Versiyon -->
        <p class="text-sm text-gray-400 mt-2">Version: 1.0.0</p>
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
