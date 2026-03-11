<script setup lang="ts">
import { ref } from "vue";
import { useObjectsStore, type Connection } from "@/stores/object.store";

const objectsStore = useObjectsStore();

const resizing = ref<{ id: string, startX: number, startY: number, startSize: number } | null>(null);

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

const dragging = ref<{
  id: string,
  startX: number,
  startY: number,
  startObjX: number,
  startObjY: number
} | null>(null);

// Drag başlat
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

// Drag hareketi
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
function getCenter(id: string) {

  const obj = objectsStore.objects.find(o => o.id === id)

  if (!obj) return { x: 0, y: 0 }

  return {
    x: obj.x + obj.size / 2,
    y: obj.y + obj.size / 2
  }

}
function getBezierPath(c: Connection) {

  const a = getCenter(c.from)
  const b = getCenter(c.to)

  const dx = Math.abs(b.x - a.x) * 0.5

  const c1x = a.x + dx
  const c1y = a.y

  const c2x = b.x - dx
  const c2y = b.y

  return `
    M ${a.x} ${a.y}
    C ${c1x} ${c1y},
      ${c2x} ${c2y},
      ${b.x} ${b.y}
  `
}
function selectedNode(c: Connection) {
  if(objectsStore.selectedConnection == c) {
    objectsStore.selectedConnection = null
    return
  }
 objectsStore.selectedConnection = c
}
</script>

<template>
  <svg class="absolute left-0 top-0 w-full h-full pointer-events-none">

    <path v-for="c in objectsStore.connections" :key="c.from + c.to" :d="getBezierPath(c)" stroke-width="3" fill="none"
      stroke-linecap="round" class="cursor-pointer" style="pointer-events: stroke;"
      @click.stop="selectedNode(c)"
      :stroke="objectsStore.selectedConnection == c ? '#f87171' : '#facc15'" />

  </svg>
  <div @click="objectsStore.selectNode(obj.id)" v-for="obj in objectsStore.objects" :key="obj.id" :style="{
    position: 'absolute',
    left: obj.x + 'px',
    top: obj.y + 'px',
    width: obj.size + 'px',
    height: obj.size + 'px',
    background: obj.color || '#fffa77',
    display: 'flex',
    flexDirection: 'column',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
    cursor: 'default',
    fontFamily: 'sans-serif'

  }">

    <template v-if="obj.type === 'note'">

      <div @mousedown="(e) => startDrag(e, obj.id, obj.x, obj.y)"
        class="bg-yellow-400 text-center font-bold cursor-grab select-none p-1 rounded-t">
        {{ obj.title || 'Başlık' }}
      </div>


      <div class="flex-1 p-2 overflow-auto text-sm" contenteditable="true"
        @input="(e) => obj.text = (e.target as HTMLDivElement).innerText" @mousedown.stop mousedown.stop>

      </div>


      <div @mousedown="(e) => startResize(e, obj.id, obj.size)"
        class="absolute bottom-0 right-0 w-3 h-3 bg-white border border-gray-600 cursor-se-resize"
        style="touch-action: none;"></div>



    </template>
    <template v-if="obj.type === 'doc'">

      <div @mousedown="(e) => startDrag(e, obj.id, obj.x, obj.y)"
        class="bg-gray-200 text-center font-bold p-1 cursor-grab">

        📄 {{ obj.title }}

      </div>

      <div class="flex-1 p-2 overflow-auto text-sm" contenteditable="true"
        @input="(e) => obj.text = (e.target as HTMLDivElement).innerText" @mousedown.stop mousedown.stop>

      </div>


      <div @mousedown="(e) => startResize(e, obj.id, obj.size)"
        class="absolute bottom-0 right-0 w-3 h-3 bg-white border border-gray-600 cursor-se-resize"
        style="touch-action: none;"></div>

    </template>



  </div>
</template>

<style scoped>
/* Hover efekti ile daha “yapışkan” görünümü */
div:hover {
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.3);
}

/* Editable içerik seçimi için */
[contenteditable]:focus {
  outline: 2px dashed rgba(0, 0, 0, 0.3);
}
</style>
<!-- <div @mousedown="(e) => startDrag(e, obj.id, obj.x, obj.y)"
      class="bg-yellow-400 text-center font-bold cursor-grab select-none p-1 rounded-t">
      {{ obj.title || 'Başlık' }}
    </div>


    <div class="flex-1 p-2 overflow-auto text-sm" contenteditable="true"
      @input="(e) => obj.text = (e.target as HTMLDivElement).innerText" @mousedown.stop mousedown.stop>

    </div>


    <div @mousedown="(e) => startResize(e, obj.id, obj.size)"
      class="absolute bottom-0 right-0 w-3 h-3 bg-white border border-gray-600 cursor-se-resize"
      style="touch-action: none;"></div>-->
