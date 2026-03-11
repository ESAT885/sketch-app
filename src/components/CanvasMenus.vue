<script setup lang="ts">
import { ref } from "vue";

import { useObjectsStore } from "@/stores/object.store";

const objectsStore = useObjectsStore();



const menuOpen = ref(false);

function toggleMenu() {
  menuOpen.value = !menuOpen.value;
}

function addBox() {
  objectsStore.addObject({
    type: "note",
    x: 100 + Math.random() * 500,
    y: 100 + Math.random() * 500,
    size: 150,
    title: ""
  });
  if (objectsStore.objects.length >= 2) {
    objectsStore.connections.push({
      from: objectsStore.objects[0]?.id ?? "",
      to: objectsStore.objects[1]?.id ?? ""
    })
  }

}
function addDiagram() {

  objectsStore.addObject({

    x: 400,
    y: 200,
    size: 400,
    type: "diagram",
    title: "Diagram",


  })


}


</script>

<template>
  <div class="relative flex h-screen">
    <!-- Menü Toggle İkonu -->
    <button @click="toggleMenu"
      class="absolute top-4 left-4 z-50 w-12 h-12 bg-gray-700 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-gray-600 transition">
      ☰
    </button>

    <!-- Açılır Menü -->
    <transition name="fade-slide">
      <div v-if="menuOpen"
        class="absolute top-16 left-4 bg-gray-800 text-white p-4 rounded-lg shadow-lg flex flex-col gap-2 z-50 w-48">
        <button class=" p-2 rounded b-3" @click="addBox" style="background-color: rgb(255, 250, 119);color: black;">
          📦 Not Ekle
        </button>
        <button class=" p-2 rounded b-3" @click="addDiagram" style="background-color: rgb(255, 250, 119);color: black;">
          📦 Diagram Ekle
        </button>

        <button class=" p-2 rounded b-3" @click="objectsStore.toggleConnectionMode()"
          :class="objectsStore.connectionMode ? 'bg-green-500' : 'bg-blue-500'">
          Bağlantı
        </button>

        <p class="text-sm text-gray-300 mt-2">Version: 1.0.0</p>
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
