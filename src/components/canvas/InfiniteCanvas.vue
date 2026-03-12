<script setup lang="ts">
import { useObjectsStore } from "@/stores/object.store";
import { ref, computed, onMounted } from "vue";
import ContextMenu from "@/components/canvas/CanvasLeftMenu.vue"
const objectsStore = useObjectsStore();

const x = ref(objectsStore.canvasX);
const y = ref(objectsStore.canvasY);
const scale = ref(objectsStore.canvasScale);
onMounted(() => {
  objectsStore.loadFromStorage()
  x.value = objectsStore.canvasX
  y.value = objectsStore.canvasY
  scale.value = objectsStore.canvasScale
});

let dragging = false;
let startX = 0;
let startY = 0;

function mouseDown(e: MouseEvent) {
  dragging = true;
  startX = e.clientX;
  startY = e.clientY;
}

function mouseMove(e: MouseEvent) {
  if (!dragging) return;

  x.value += e.clientX - startX;
  y.value += e.clientY - startY;

  startX = e.clientX;
  startY = e.clientY;

  objectsStore.canvasX = x.value;
  objectsStore.canvasY = y.value;
  objectsStore.canvasScale = scale.value
  objectsStore.saveToStorage()
}

function mouseUp() {
  dragging = false;
}

function wheel(e: WheelEvent) {
  e.preventDefault();

  const zoomIntensity = 0.1;
  const delta = e.deltaY > 0 ? -zoomIntensity : zoomIntensity;

  // zoom limitleri
  const newScale = Math.min(4, Math.max(0.2, scale.value + delta));

  const mouseX = e.clientX;
  const mouseY = e.clientY;

  const wx = (mouseX - x.value) / scale.value;
  const wy = (mouseY - y.value) / scale.value;

  scale.value = newScale;

  x.value = mouseX - wx * scale.value;
  y.value = mouseY - wy * scale.value;



  objectsStore.canvasX = x.value;
  objectsStore.canvasY = y.value;
  objectsStore.canvasScale = scale.value
  objectsStore.saveToStorage()
}

const canvasStyle = computed(() => ({
  transform: `translate(${x.value}px, ${y.value}px) scale(${scale.value})`,
  transformOrigin: "0 0",
}));

const gridStyle = computed(() => ({
  backgroundSize: `${40 * scale.value}px ${40 * scale.value}px`,
  backgroundPosition: `${x.value}px ${y.value}px`,
}));

function canvasClick(e: MouseEvent) {

  // Eğer canvas sürükleniyorsa ekleme yapma
  if (dragging) return;

  const cx = (e.clientX - x.value) / scale.value;
  const cy = (e.clientY - y.value) / scale.value;


  if (objectsStore.noteMode || objectsStore.docMode) {


    objectsStore.addObject({

      type: objectsStore.getCurrentType(),
      x: cx,
      y: cy,
      size: 150, color: "", title: 'Alışveriş Listesi', text: 'Alışveriş listesi',

    });
  }
  if (objectsStore.groupMode) {
    console.log("group")
    objectsStore.addGroup({
      x: cx,
      y: cy,
      size: 500,
      title: "Grup",

    })
  }
  objectsStore.saveToStorage()
}

const menuVisible = ref(false);
const menuX = ref(0);
const menuY = ref(0);

function openMenu(event: MouseEvent) {
  menuX.value = event.offsetX;
  menuY.value = event.offsetY;
  menuVisible.value = true;
}

function handleSelect() {
  menuVisible.value = false;
}

// Sayfaya tıklayınca menüyü kapat
document.addEventListener('click', () => {
  menuVisible.value = false;
});
</script>

<template>
  <div class="viewport" @mousedown="mouseDown" @mousemove="mouseMove" @mouseup="mouseUp" @mouseleave="mouseUp"
    @wheel.prevent="wheel" @click="canvasClick">
    <div class="grid" :style="gridStyle"></div>
    <div class="canvas" :style="canvasStyle" @contextmenu.prevent="openMenu($event)">
      <slot />
           <ContextMenu
      :x="menuX"
      :y="menuY"
      :visible="menuVisible"
      @select="handleSelect"
    />
    </div>
  </div>
</template>

<style>
.viewport {
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  position: relative;
  background: #111;
  cursor: grab;
}

.viewport:active {
  cursor: grabbing;
}

.grid {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background-image:
    linear-gradient(#222 1px, transparent 1px),
    linear-gradient(90deg, #222 1px, transparent 1px);
}

.canvas {
  position: absolute;
  width: 100000px;
  height: 100000px;
}
</style>
