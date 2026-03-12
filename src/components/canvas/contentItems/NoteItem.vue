<script setup lang="ts">
import { useObjectsStore, type CanvasObject } from "@/stores/object.store";
import { onMounted, ref, nextTick } from "vue";

const objectsStore = useObjectsStore();
const props = defineProps<{ obj: CanvasObject }>();

// Drag & Resize state (senin kodun)
const dragging = ref<{ id: string, offsetX: number, offsetY: number } | null>(null);
const resizing = ref<{ id: string, startX: number, startY: number, startSize: number } | null>(null);

// Edit state
const editingTitleId = ref<string | null>(null);
const newTitle = ref<string>("");

const editingTextId = ref<string | null>(null);
const newText = ref<string>("");

// Başlangıç text yükleme
onMounted(() => {
  const el = document.getElementById(`note-${props.obj.id}`);
  if (!el) return;
  el.innerText = props.obj.text ?? "";
});

// --- Drag & Resize ---
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
  const obj = objectsStore.objects.find(o => o.id === dragging.value!.id);
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

function startResize(e: MouseEvent, objId: string, objSize: number) {
  e.stopPropagation();
  resizing.value = { id: objId, startX: e.clientX, startY: e.clientY, startSize: objSize };
  window.addEventListener('mousemove', onResize);
  window.addEventListener('mouseup', stopResize);
}
function onResize(e: MouseEvent) {
  if (!resizing.value) return;
  const dx = e.clientX - resizing.value.startX;
  const dy = e.clientY - resizing.value.startY;
  const newSize = Math.max(10, resizing.value.startSize + Math.max(dx, dy));
  const obj = objectsStore.objects.find(o => o.id === resizing.value!.id);
  if (obj) obj.size = newSize;
}
function stopResize() {
  resizing.value = null;
  window.removeEventListener('mousemove', onResize);
  window.removeEventListener('mouseup', stopResize);
}

// --- Title edit ---
function startEditTitle(obj: CanvasObject) {
  editingTitleId.value = obj.id;
  newTitle.value = obj.title;
  nextTick(() => {
    const el = document.getElementById(`title-${obj.id}`) as HTMLInputElement;
    if (el) el.focus();
  });
}
function saveTitle(obj: CanvasObject) {
  const item = objectsStore.objects.find(o => o.id === obj.id);
  if (item) item.title = newTitle.value;
  editingTitleId.value = null;
}

// --- Text edit ---
function startEditText(obj: CanvasObject) {
  editingTextId.value = obj.id;
  newText.value = obj.text ?? "";
  nextTick(() => {
    const el = document.getElementById(`note-${obj.id}`) as HTMLTextAreaElement;
    if (el) el.focus();
  });
}
function saveText(obj: CanvasObject) {
  const item = objectsStore.objects.find(o => o.id === obj.id);
  if (item) item.text = newText.value;
  editingTextId.value = null;
}
</script>

<template>
  <!-- Header -->
  <div @mousedown="(e) => startDrag(e, obj.id, obj.x, obj.y)"
    class="bg-yellow-400 flex justify-between items-center p-1 rounded-t font-bold cursor-grab select-none text-black">

    <span v-if="editingTitleId !== obj.id" @dblclick="startEditTitle(obj)">
      {{ obj.title || 'Başlık' }}
    </span>

    <input v-else @mousedown.stop v-model="newTitle" id="title-{{obj.id}}" @blur="saveTitle(obj)"
      @keyup.enter="saveTitle(obj)" class="px-1 text-black border rounded w-full" />

    <button @mousedown.stop @click="objectsStore.removeObject(obj.id)" class="px-2 hover:bg-red-200 rounded">✕</button>
  </div>

  <!-- Note Text -->
  <div v-if="editingTextId !== obj.id" :id="`note-${obj.id}`"
    class="flex-1 p-2 overflow-auto text-sm text-black text-lg" @dblclick="startEditText(obj)" @mousedown.stop>
    {{ obj.text }}
  </div>

  <textarea v-else v-model="newText" :id="`note-${obj.id}`" @mousedown.stop @blur="saveText(obj)" @keyup.enter="saveText(obj)"
    class="flex-1 p-2 text-black border rounded resize-none w-full h-full"
    style="outline: none; overflow:auto;"></textarea>

  <!-- Resize handle -->
  <div @mousedown="(e) => startResize(e, obj.id, obj.size)"
    class="absolute bottom-0 right-0 w-3 h-3 bg-white border border-gray-600 cursor-se-resize"
    style="touch-action: none;"></div>
</template>

<style>
div:hover {
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.3);
}
</style>
