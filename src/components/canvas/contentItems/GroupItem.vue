<script setup lang="ts">
import { useObjectsStore, type Group } from '@/stores/object.store';
import { ref } from 'vue';

defineProps<{
  group: Group
}>();
const objectsStore = useObjectsStore();
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

  const obj = objectsStore.groups.find(o => o.id === dragging.value!.id);
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
  objectsStore.saveToStorage()
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

  const obj = objectsStore.groups.find(o => o.id === resizing.value!.id);
  if (obj) obj.size = newSize;
}

function stopResize() {
  resizing.value = null;
  window.removeEventListener('mousemove', onResize);
  window.removeEventListener('mouseup', stopResize);
}

</script>

<template>

  <div :style="{
    width: group.size + 'px',
    height: group.size + 'px',


  }">
    <div :style="{
      position: 'absolute',
      top: '-' + -1 + 'px', // border'ın üstüne taşı
      left: '50%',
      transform: 'translateX(-50%)',

   
      fontWeight: 'bold',

      borderRadius: '4px',
    }">

      <div @mousedown="(e) => startDrag(e, group.id ?? '', group.x, group.y)"
        class="bg-yellow-400 flex justify-between items-center p-1 rounded-t font-bold cursor-grab select-none text-black">
        <span> {{ group.title }}</span>
        <button @mousedown.stop @click="objectsStore.removeGroup(group.id??'')"
          class="px-2 hover:bg-red-200 rounded">✕</button>
      </div>
    </div>
    <div @mousedown="(e) => startResize(e, group.id ?? '', group.size)"
      class="absolute bottom-0 right-0 w-3 h-3 bg-white border border-gray-600 cursor-se-resize"
      style="touch-action: none;"></div>
  </div>
</template>

<style scoped></style>
