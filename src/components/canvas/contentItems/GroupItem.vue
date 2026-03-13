<script setup lang="ts">
import { useObjectsStore, type Group } from '@/stores/object.store';
import { ref, nextTick } from 'vue';

defineProps<{
  group: Group
}>();

const objectsStore = useObjectsStore();
const dragging = ref<{ id: string, offsetX: number, offsetY: number } | null>(null);
const resizing = ref<{ id: string, startX: number, startY: number, height: number, width: number } | null>(null);

// --- Başlık edit state ---
const editingTitleId = ref<string | null>(null);
const newTitle = ref<string>("");

// --- Drag ---
function startDrag(e: MouseEvent, objId: string, objX: number, objY: number) {
  e.stopPropagation();
  const offsetX = (e.clientX - objX * objectsStore.canvasScale) / objectsStore.canvasScale;
  const offsetY = (e.clientY - objY * objectsStore.canvasScale) / objectsStore.canvasScale;
  dragging.value = { id: objId, offsetX, offsetY };
  window.addEventListener("mousemove", onDrag);
  window.addEventListener("mouseup", stopDrag);
}
function onDrag(e: MouseEvent) {
  if (!dragging.value) return;
  const group = objectsStore.groups.find(o => o.id === dragging.value!.id);
  if (group) {
    group.x = (e.clientX / objectsStore.canvasScale) - dragging.value.offsetX;
    group.y = (e.clientY / objectsStore.canvasScale) - dragging.value.offsetY;
  }
}
function stopDrag() {
  dragging.value = null;
  window.removeEventListener("mousemove", onDrag);
  window.removeEventListener("mouseup", stopDrag);
  objectsStore.saveToStorage();
}

// --- Resize ---
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
  const obj = objectsStore.groups.find(o => o.id === resizing.value!.id);
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

// --- Başlık edit fonksiyonları ---
function startEditTitle(group: Group) {
  editingTitleId.value = group.id??"";
  newTitle.value = group.title;
  nextTick(() => {
    const el = document.getElementById(`group-title-${group.id}`) as HTMLInputElement;
    if (el) el.focus();
  });
}
function saveTitle(group: Group) {
  const item = objectsStore.groups.find(o => o.id === group.id);
  if (item) item.title = newTitle.value;
  editingTitleId.value = null;
}
</script>

<template>
  <div :style="{ width: group.width + 'px', height: group.height + 'px', position: 'relative' }">

    <div :style="{
      position: 'absolute',
      top: '-1px',
      left: '50%',
      transform: 'translateX(-50%)',
      fontWeight: 'bold',
      borderRadius: '4px',
      width: 'max-content'
    }">

      <!-- Başlık -->
      <div @mousedown="(e) => startDrag(e, group.id ?? '', group.x, group.y)"
           class="bg-yellow-400 flex justify-between items-center p-1 rounded-t font-bold cursor-grab select-none text-black">

        <span v-if="editingTitleId !== group.id" @dblclick="startEditTitle(group)">
          {{ group.title }}
        </span>

        <input v-else @mousedown.stop
               v-model="newTitle"
               :id="`group-title-${group.id}`"
               @blur="() => saveTitle(group)"
               @keyup.enter="() => saveTitle(group)"
               class="px-1 text-black border rounded w-full" />

        <button @mousedown.stop @click="objectsStore.removeItem(group.id ?? '')"
                class="ml-2 px-2 hover:bg-red-200 rounded">✕</button>
      </div>
    </div>

    <!-- Resize handle -->
    <div @mousedown="(e) => startResize(e, group.id ?? '', group.height, group.width)"
         class="absolute bottom-0 right-0 w-3 h-3 bg-white border border-gray-600 cursor-se-resize"
         style="touch-action: none;"></div>
  </div>
</template>

<style scoped></style>
