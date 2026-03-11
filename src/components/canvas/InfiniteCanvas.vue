<script setup lang="ts">
import { ref, computed } from "vue";

const x = ref(0);
const y = ref(0);
const scale = ref(1);

let dragging = false;
let startX = 0;
let startY = 0;

const canvasRef = ref<HTMLDivElement | null>(null); // canvas wrapper

function mouseDown(e: MouseEvent) {
  dragging = true;
  startX = e.clientX;
  startY = e.clientY;
}

function mouseMove(e: MouseEvent) {
  if (!dragging) return;

  const dx = e.clientX - startX;
  const dy = e.clientY - startY;

  x.value += dx;
  y.value += dy;

  startX = e.clientX;
  startY = e.clientY;
}

function mouseUp() {
  dragging = false;
}

function wheel(e: WheelEvent) {
  e.preventDefault();

  const zoomIntensity = 0.1;
  const delta = e.deltaY > 0 ? -zoomIntensity : zoomIntensity;

  const newScale = scale.value + delta;
  if (newScale < 0.2 || newScale > 4) return;

  const rect = canvasRef.value!.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  const mouseY = e.clientY - rect.top;

  // Mouse'un world koordinatları
  const wx = (mouseX - x.value) / scale.value;
  const wy = (mouseY - y.value) / scale.value;

  scale.value = newScale;

  // Pan'ı güncelle, fare sabit kalacak
  x.value = mouseX - wx * scale.value;
  y.value = mouseY - wy * scale.value;
}

const canvasStyle = computed(() => ({
  transform: `translate(${x.value}px, ${y.value}px) scale(${scale.value})`,
  transformOrigin: "0 0"
}));
const gridStyle = computed(() => ({
  backgroundSize: `${40 * scale.value}px ${40 * scale.value}px`,
  backgroundPosition: `${x.value * scale.value}px ${y.value * scale.value}px`
}))
</script>

<template>
  <div
    class="viewport"
    @mousedown="mouseDown"
    @mousemove="mouseMove"
    @mouseup="mouseUp"
    @mouseleave="mouseUp"
    @wheel.prevent="wheel"
  >
    <div class="grid" :style="gridStyle"></div>

    <div ref="canvasRef" class="canvas" :style="canvasStyle">
      <slot/>
    </div>
  </div>

</template>

<style>
.viewport{
  width:100vw;
  height:100vh;
  overflow:hidden;
  position:relative;
  background:#111;
  cursor: grab;
}
.viewport:active { cursor: grabbing; }

.grid{
  position:absolute;
   inset:0;
  pointer-events:none;
  background-image:
    linear-gradient(#222 1px, transparent 1px),
    linear-gradient(90deg,#222 1px, transparent 1px);
  background-size:40px 40px;
}

.canvas{
  position:absolute;
  width:100000px;
  height:100000px;
}
</style>
