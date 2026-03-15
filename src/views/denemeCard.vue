<script setup lang="ts">
import { ref } from "vue";

const pos = ref({ x: 100, y: 100 });
const size = ref({ width: 150, height: 100 });
const dragging = ref(false);
const resizing = ref(false);
const offset = ref({ x: 0, y: 0 });
const text = ref("Buraya yazabilirsin");

// Drag işlemleri
function startDrag(e: MouseEvent | TouchEvent) {
  if ((e.target as HTMLElement).classList.contains("resize-handle")) return;
  dragging.value = true;

  const clientX = "touches" in e ? e.touches[0]?.clientX : e.clientX;
  const clientY = "touches" in e ? e.touches[0]?.clientY : e.clientY;
  if (!clientX || !clientY)
    return

  offset.value.x = clientX - pos.value.x;
  offset.value.y = clientY - pos.value.y;
}

function drag(e: MouseEvent | TouchEvent) {
  if (!dragging.value) return;
  const clientX = "touches" in e ? e.touches[0]?.clientX : e.clientX;
  const clientY = "touches" in e ? e.touches[0]?.clientY : e.clientY;
  if (!clientX || !clientY)
    return
  pos.value.x = clientX - offset.value.x;
  pos.value.y = clientY - offset.value.y;
}

function endDrag() {
  dragging.value = false;
}

// Resize işlemleri
function startResize(e: MouseEvent | TouchEvent) {
  resizing.value = true;
  e.stopPropagation(); // Drag ile karışmasın
}

function resize(e: MouseEvent | TouchEvent) {
  if (!resizing.value) return;

  const clientX = "touches" in e ? e.touches[0]?.clientX : e.clientX;
  const clientY = "touches" in e ? e.touches[0]?.clientY : e.clientY;
  if (!clientX || !clientY)
    return
  size.value.width = Math.max(50, clientX - pos.value.x);
  size.value.height = Math.max(30, clientY - pos.value.y);
}

function endResize() {
  resizing.value = false;
}
</script>

<template>
  <div class="absolute bg-blue-200 rounded-lg p-1 shadow-lg touch-none select-none"
    :style="{ left: pos.x + 'px', top: pos.y + 'px', width: size.width + 'px', height: size.height + 'px' }"
    @mousedown="startDrag" @mousemove="drag" @mouseup="endDrag" @mouseleave="endDrag" @touchstart.prevent="startDrag"
    @touchmove.prevent="drag" @touchend.prevent="endDrag">
    <textarea v-model="text"
      class="w-full h-full p-1 resize-none bg-transparent border-none outline-none text-black"></textarea>

    <!-- Resize Handle -->
    <div class="resize-handle absolute right-0 bottom-0 w-4 h-4 bg-blue-500 cursor-se-resize"
      @mousedown.stop="startResize" @mousemove.stop="resize" @mouseup.stop="endResize"
      @touchstart.prevent.stop="startResize" @touchmove.prevent.stop="resize" @touchend.prevent.stop="endResize"></div>
  </div>
</template>

<style scoped>
/* Küçük kare resize tutamacı */
.resize-handle {
  touch-action: none;
  /* Mobilde tutmayı engelleme */
}
</style>
