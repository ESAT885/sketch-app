<script setup lang="ts">
import { useObjectsStore, type CanvasTitle } from '@/stores/object.store';
import { nextTick, ref } from 'vue';
defineProps<{ obj: CanvasTitle }>();
const objectsStore = useObjectsStore();
// Drag & Resize state (senin kodun)
const dragging = ref<{ id: string, offsetX: number, offsetY: number } | null>(null);
const resizing = ref<{ id: string, startX: number, startY: number,  height: number, width: number } | null>(null);
// Edit state
const editingTitleId = ref<string | null>(null);
const newTitle = ref<string>("");
// --- Drag & Resize ---
function startDrag(e: MouseEvent, objId: string, objX: number, objY: number) {

  e.stopPropagation();
  const offsetX = (e.clientX - objX * objectsStore.canvasScale) / objectsStore.canvasScale;
  const offsetY = (e.clientY - objY * objectsStore.canvasScale) / objectsStore.canvasScale;
  dragging.value = { id: objId, offsetX, offsetY };
  window.addEventListener("mousemove", onDrag);
  window.addEventListener("mouseup", stopDrag);
}
function startResize(e: MouseEvent, objId: string, height: number, width: number) {
  e.stopPropagation();
  resizing.value = { id: objId, startX: e.clientX, startY: e.clientY, height, width };
  window.addEventListener('mousemove', onResize);
  window.addEventListener('mouseup', stopResize);
}
function onResize(e: MouseEvent) {
  if (!resizing.value) return;
  const dx = e.clientX - resizing.value.startX;
  const dy = e.clientY - resizing.value.startY;
  const obj = objectsStore.canvasTitles.find(o => o.id === resizing.value!.id);
  if (obj) {
    obj.width = Math.max(80, resizing.value.width + dx)
    obj.height = Math.max(60, resizing.value.height + dy)
  }
}
function stopResize() {
  resizing.value = null;
  window.removeEventListener('mousemove', onResize);
  window.removeEventListener('mouseup', stopResize);
}
function onDrag(e: MouseEvent) {
  if (!dragging.value) return;
  const obj = objectsStore.canvasTitles.find(o => o.id === dragging.value!.id);
  if (obj) {
    obj.x = (e.clientX / objectsStore.canvasScale) - dragging.value.offsetX;
    obj.y = (e.clientY / objectsStore.canvasScale) - dragging.value.offsetY;
  }
}
function stopDrag() {
  dragging.value = null;
  window.removeEventListener("mousemove", onDrag);
  window.removeEventListener("mouseup", stopDrag);
  objectsStore.saveToStorage();
}
// --- Title edit ---
function startEditTitle(obj: CanvasTitle) {
  editingTitleId.value = obj.id ?? "";
  newTitle.value = obj.title;
  nextTick(() => {
    const el = document.getElementById(`title-${obj.id}`) as HTMLInputElement;
    if (el) el.focus();
  });
}
function saveTitle(obj: CanvasTitle) {
  const item = objectsStore.canvasTitles.find(o => o.id === obj.id);
  if (item) item.title = newTitle.value;
  editingTitleId.value = null;
}
</script>
<template>

  <div @mousedown="(e) => startDrag(e, obj.id ?? '', obj.x, obj.y)"
    class="h-full bg-yellow-400 p-2 flex justify-between items-center p-1 rounded-t font-bold cursor-grab select-none text-black">

    <span v-if="editingTitleId !== obj.id" @dblclick="startEditTitle(obj)" class=" text-2xl">
      {{ obj.title || 'Başlık' }}
    </span>

    <input v-else @mousedown.stop v-model="newTitle" id="title-{{obj.id}}" @blur="saveTitle(obj)"
      @keyup.enter="saveTitle(obj)" class="h-full px-1 text-black border rounded w-full" />

    <button @mousedown.stop @click="objectsStore.removeItem(obj.id ?? '')"
      class="px-2 pl-2 hover:bg-red-200 rounded">✕</button>
  </div>
 <div
  @mousedown="(e) => startResize(e, obj.id ?? '', obj.height, obj.width)"
  class="absolute bottom-0 right-0 w-3 h-3 bg-white border border-gray-600 cursor-se-resize translate-x-1/2 translate-y-1/2"
  style="touch-action: none;"
></div>


</template>
