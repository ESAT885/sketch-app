<script setup lang="ts">
import { useObjectsStore, type CanvasObject } from "@/stores/object.store";
import { onMounted, ref } from "vue";
const objectsStore = useObjectsStore();
const props = defineProps<{
  obj: CanvasObject
}>();

onMounted(() => {
  const el = document.getElementById(`note-${props.obj.id}`);
  if (!el)
    return
  el.innerText = props.obj.text ?? "";

});
const dragging = ref<{
  id: string,
  offsetX: number,
  offsetY: number
} | null>(null);
const resizing = ref<{ id: string, startX: number, startY: number, startSize: number } | null>(null);

function startDrag(e: MouseEvent, objId: string, objX: number, objY: number) {
  e.stopPropagation();
  // mouse ile objenin sol üst köşesi arasındaki fark
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

// Drag bitiş
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
    class="bg-yellow-400 flex justify-between items-center p-1 rounded-t font-bold cursor-grab select-none text-black">
    <span>{{ obj.title || 'Başlık' }}</span>
    <button @mousedown.stop @click="objectsStore.removeObject(obj.id)" class="px-2 hover:bg-red-200 rounded">✕</button>
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
