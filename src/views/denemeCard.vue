<script setup lang="ts">
import { ref, computed } from "vue";

// --- Pan & Zoom ---
const x = ref(window.innerWidth / 2 - 50000);
const y = ref(window.innerHeight / 2 - 50000);
const scale = ref(1);

let dragging = false;
let startX = 0;
let startY = 0;

function mouseDown(e: MouseEvent) {
  const target = e.target as HTMLElement;
  if (target.closest(".card")) return;
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
}

function mouseUp() {
  dragging = false;
}

function wheel(e: WheelEvent) {
  e.preventDefault();
  const delta = e.deltaY > 0 ? -0.1 : 0.1;
  const newScale = Math.min(4, Math.max(0.2, scale.value + delta));

  const mouseX = e.clientX;
  const mouseY = e.clientY;
  const wx = (mouseX - x.value) / scale.value;
  const wy = (mouseY - y.value) / scale.value;

  scale.value = newScale;
  x.value = mouseX - wx * scale.value;
  y.value = mouseY - wy * scale.value;
}

const canvasStyle = computed(() => ({
  transform: `translate(${x.value}px, ${y.value}px) scale(${scale.value})`,
  transformOrigin: "0 0",
}));

const gridStyle = computed(() => ({
  backgroundSize: `${40 * scale.value}px ${40 * scale.value}px`,
  backgroundPosition: `${x.value}px ${y.value}px`,
}));

// --- Cards ---
interface Card {
  id: number;
  cx: number;  // canvas koordinatı
  cy: number;
  text: string;
  color: string;
  editing: boolean;
}

const cards = ref<Card[]>([]);
let nextId = 1;

const COLORS = ["#fef08a", "#bbf7d0", "#bfdbfe", "#fecaca", "#e9d5ff", "#fed7aa"];

function addCard(e: MouseEvent) {
  // Sadece boş alana çift tıklandığında ekle
  const target = e.target as HTMLElement;
  if (target.closest(".card")) return;

  // Ekran koordinatını canvas koordinatına çevir
  const cx = (e.clientX - x.value) / scale.value;
  const cy = (e.clientY - y.value) / scale.value;

  cards.value.push({
    id: nextId++,
    cx: cx - 100,
    cy: cy - 60,
    text: "",
    color: COLORS[Math.floor(Math.random() * COLORS.length)] || "#ffffff",
    editing: true,
  });
}

function deleteCard(id: number) {
  cards.value = cards.value.filter(c => c.id !== id);
}

// --- Card drag ---
let cardDragging: Card | null = null;
let cardStartMouseX = 0;
let cardStartMouseY = 0;
let cardStartCX = 0;
let cardStartCY = 0;

function cardMouseDown(e: MouseEvent, card: Card) {
  const target = e.target as HTMLElement;
  if (target.tagName === "TEXTAREA" || target.closest(".delete-btn")) return;
  e.stopPropagation();
  cardDragging = card;
  cardStartMouseX = e.clientX;
  cardStartMouseY = e.clientY;
  cardStartCX = card.cx;
  cardStartCY = card.cy;

  window.addEventListener("mousemove", onCardMove);
  window.addEventListener("mouseup", onCardUp);
}

function onCardMove(e: MouseEvent) {
  if (!cardDragging) return;
  const dx = (e.clientX - cardStartMouseX) / scale.value;
  const dy = (e.clientY - cardStartMouseY) / scale.value;
  cardDragging.cx = cardStartCX + dx;
  cardDragging.cy = cardStartCY + dy;
}

function onCardUp() {
  cardDragging = null;
  window.removeEventListener("mousemove", onCardMove);
  window.removeEventListener("mouseup", onCardUp);
}
</script>

<template>
  <div
    class="viewport"
    @mousedown="mouseDown"
    @mousemove="mouseMove"
    @mouseup="mouseUp"
    @mouseleave="mouseUp"
    @wheel.prevent="wheel"
    @dblclick="addCard"
  >
    <!-- Grid -->
    <div class="grid" :style="gridStyle" />

    <!-- Canvas -->
    <div class="canvas" :style="canvasStyle">
      <!-- Cards -->
      <div
        v-for="card in cards"
        :key="card.id"
        class="card"
        :style="{ left: card.cx + 'px', top: card.cy + 'px', background: card.color }"
        @mousedown="cardMouseDown($event, card)"
      >
        <button class="delete-btn" @click="deleteCard(card.id)">✕</button>
        <textarea
          v-model="card.text"
          placeholder="Notunu yaz..."
          @focus="card.editing = true"
          @blur="card.editing = false"
        />
      </div>
    </div>

    <!-- UI -->
    <div class="hint">Boş alana çift tıkla → kart ekle</div>
    <div class="zoom-info">%{{ Math.round(scale * 100) }}</div>
  </div>
</template>

<style scoped>
.viewport {
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  position: relative;
  background: #0f0f0f;
  cursor: grab;
  user-select: none;
}
.viewport:active { cursor: grabbing; }

.grid {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background-image:
    linear-gradient(#1e1e1e 1px, transparent 1px),
    linear-gradient(90deg, #1e1e1e 1px, transparent 1px);
}

.canvas {
  position: absolute;
  left: 0;
  top: 0;
  width: 100000px;
  height: 100000px;
}

.card {
  position: absolute;
  width: 200px;
  min-height: 120px;
  border-radius: 10px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.4);
  display: flex;
  flex-direction: column;
  cursor: move;
  transition: box-shadow 0.15s;
}
.card:hover {
  box-shadow: 0 8px 30px rgba(0,0,0,0.5);
}

.delete-btn {
  align-self: flex-end;
  margin: 6px 6px 0 0;
  background: transparent;
  border: none;
  font-size: 12px;
  color: rgba(0,0,0,0.35);
  cursor: pointer;
  line-height: 1;
  padding: 2px 4px;
  border-radius: 4px;
  transition: color 0.1s, background 0.1s;
}
.delete-btn:hover {
  color: #ef4444;
  background: rgba(0,0,0,0.08);
}

textarea {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  resize: none;
  padding: 4px 12px 12px;
  font-size: 14px;
  font-family: 'Georgia', serif;
  color: #1a1a1a;
  line-height: 1.5;
  cursor: text;
  min-height: 80px;
}

.hint {
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(255,255,255,0.08);
  color: rgba(255,255,255,0.4);
  font-size: 12px;
  padding: 6px 14px;
  border-radius: 20px;
  pointer-events: none;
  font-family: monospace;
}

.zoom-info {
  position: fixed;
  bottom: 20px;
  right: 20px;
  background: rgba(255,255,255,0.08);
  color: rgba(255,255,255,0.5);
  font-size: 12px;
  padding: 4px 10px;
  border-radius: 6px;
  font-family: monospace;
  pointer-events: none;
}
</style>
