<script setup lang="ts">
import { useObjectsStore, type CanvasObject } from "@/stores/object.store";
import {  onMounted, ref } from "vue";
const objectsStore = useObjectsStore();
const props = defineProps<{
  obj: CanvasObject
}>();

onMounted(() => {
 const el = document.getElementById(`note-${props.obj.id}`);
  if(!el)
  return
 el.innerText = props.obj.text??"";

});
const dragging = ref<{
  id: string,
  startX: number,
  startY: number,
  startObjX: number,
  startObjY: number
} | null>(null);
const resizing = ref<{ id: string, startX: number, startY: number, startSize: number } | null>(null);

function startDrag(e: MouseEvent, objId: string, objX: number, objY: number) {
  e.stopPropagation(); // diğer eventleri engelle
  dragging.value = {
    id: objId,
    startX: e.clientX,
    startY: e.clientY,
    startObjX: objX,
    startObjY: objY
  };

  // Mouse hareketini ve bırakmayı global takip et
  window.addEventListener("mousemove", onDrag);
  window.addEventListener("mouseup", stopDrag);
}
function onDrag(e: MouseEvent) {
  if (!dragging.value) return;
  const dx = e.clientX - dragging.value.startX;
  const dy = e.clientY - dragging.value.startY;

  const obj = objectsStore.objects.find(o => o.id === dragging.value!.id);
  if (obj) {
    obj.x = dragging.value.startObjX + dx;
    obj.y = dragging.value.startObjY + dy;
  }
}

// Drag bitiş
function stopDrag() {
  dragging.value = null;
  window.removeEventListener("mousemove", onDrag);
  window.removeEventListener("mouseup", stopDrag);
}
function startResize(e: MouseEvent, objId: string, objSize: number) {
  e.stopPropagation(); // başka dragleri engelle
  resizing.value = {
    id: objId,
    startX: e.clientX,
    startY: e.clientY,
    startSize: objSize
  }
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
function updateText(id: string, newText: string) {
  const item = objectsStore.objects.find(o => o.id === id);
  if (item) item.text = newText; // store üzerinden güncelleme
}
</script>

<template>
  <div @mousedown="(e) => startDrag(e, obj.id, obj.x, obj.y)"
    class="bg-yellow-400 text-center font-bold cursor-grab select-none p-1 rounded-t text-black">
    {{ obj.title || 'Başlık' }}
  </div>


  <div :id="`note-${obj.id}`" class="flex-1 p-2 overflow-auto text-sm text-black text-lg" contenteditable="true"
    @input="(e) => updateText(obj.id, (e.target as HTMLDivElement).innerText)" @mousedown.stop></div>

  <div @mousedown="(e) => startResize(e, obj.id, obj.size)"
    class="absolute bottom-0 right-0 w-3 h-3 bg-white border border-gray-600 cursor-se-resize"
    style="touch-action: none;"></div>

</template>

<style>
/* Hover efekti ile daha “yapışkan” görünümü */
div:hover {
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.3);
}

/* Editable içerik seçimi için */
[contenteditable]:focus {
  outline: 2px dashed rgba(0, 0, 0, 0.3);
}
</style>
