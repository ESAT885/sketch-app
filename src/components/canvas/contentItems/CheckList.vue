<script setup lang="ts">
import { useObjectsStore, type CheckList } from "@/stores/object.store"
import { nextTick, onMounted, ref } from "vue"

const objectsStore = useObjectsStore()

const props = defineProps<{
  obj: CheckList
}>()

onMounted(() => {
  const el = document.getElementById(`note-${props.obj.id}`);
  if (!el) return;
  el.innerText = props.obj.title ?? "";
});
function addItem() {



  const checkList = objectsStore.checkLists.find(o => o.id === props.obj.id)
  checkList?.checkListDetails.push({
    check: false,
    title: "Madde"
  })


  objectsStore.saveToStorage()
}

function removeItem(index: number) {
  const checkList = objectsStore.checkLists.find(o => o.id === props.obj.id)
  if (!checkList) return
  checkList.checkListDetails.splice(index, 1)
  objectsStore.saveToStorage()
}

function toggle(itemIndex: number) {
  const checkList = objectsStore.checkLists.find(o => o.id === props.obj.id)
  if (!checkList || !checkList.checkListDetails[itemIndex]) return

  checkList.checkListDetails[itemIndex].check = !checkList.checkListDetails[itemIndex].check
  objectsStore.saveToStorage()
}

function updateTitle(itemIndex: number, title: string) {
  const checkList = objectsStore.checkLists.find(o => o.id === props.obj.id)
  if (!checkList || !checkList.checkListDetails[itemIndex]) return

  checkList.checkListDetails[itemIndex].title = title
}
// --- Drag & Resize ---
const dragging = ref<{ id: string, offsetX: number, offsetY: number } | null>(null);
const editingTitleId = ref<string | null>(null);
const newTitle = ref<string>("");

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
  const obj = objectsStore.checkLists.find(o => o.id === dragging.value!.id);
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
const resizing = ref<{ id: string, startX: number, startY: number, height: number, width: number } | null>(null);

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
  const obj = objectsStore.checkLists.find(o => o.id === resizing.value!.id);
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
function startEditTitle(obj: CheckList) {
  editingTitleId.value = obj.id ?? "";
  newTitle.value = obj.title;
  nextTick(() => {
    const el = document.getElementById(`title-${obj.id}`) as HTMLInputElement;
    if (el) el.focus();
  });
}
function saveTitle(obj: CheckList) {
  const item = objectsStore.checkLists.find(o => o.id === obj.id);
  if (item) item.title = newTitle.value;
  editingTitleId.value = null;
}
</script>

<template>

  <div class="flex flex-col w-full h-full bg-white rounded shadow relative ">

    <!-- HEADER -->

    <div @mousedown="(e) => startDrag(e, obj.id ?? '', obj.x, obj.y)"
      class="bg-yellow-400 flex justify-between items-center p-1 rounded-t font-bold cursor-grab select-none text-black">

      <span v-if="editingTitleId !== obj.id" @dblclick="startEditTitle(obj)">
        {{ obj.title || 'Başlık' }}
      </span>


      <input v-else @mousedown.stop v-model="newTitle" :id="`title-${obj.id}`" @blur="saveTitle(obj)"
        @keyup.enter="saveTitle(obj)" class="px-1 text-black border rounded w-full" />

      <button @mousedown.stop @click="objectsStore.removeItem(obj.id ?? '')"
        class="px-2 hover:bg-red-200 rounded">✕</button>
    </div>


    <div class="overflow-auto flex gap-1 flex-col">
      <li v-for="(task, index) in obj.checkListDetails" :key="index" class="task-row group flex items-center gap-4
             border border-white/8
             rounded-xl px-4 py-3.5 transition-all duration-200 bg-gray-800 ">
        <!-- Checkbox -->
        <div @click="toggle(index)" :class="['checkbox-custom', task.check ? 'checked' : '']">
          <svg v-if="task.check" class="checkmark" width="12" height="10" viewBox="0 0 12 10" fill="none">
            <path d="M1 5L4.5 8.5L11 1" stroke="#0e0e0e" stroke-width="2" stroke-linecap="round"
              stroke-linejoin="round" />
          </svg>
        </div>


        <input @mousedown.stop v-model="task.title" :id="`title-${obj.id}`" @blur="updateTitle(index, task.title)"
          @keyup.enter="saveTitle(obj)" :class="[
            'flex-1 text-sm transition-all duration-300',
            task.check ? 'line-through text-muted' : 'text-paper'
          ]" />
        <!-- Delete -->
        <button @click="removeItem(index)"
          class="delete-btn bg-red-500 hover:bg-red-600 transition-colors duration-150 p-1 rounded-lg text-white cursor-pointer">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M1 1L13 13M13 1L1 13" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
          </svg>
        </button>
      </li>
      <div v-if="!(obj.checkListDetails.length > 0)" class="text-center py-12 text-muted text-sm font-body">

        <span class="text-black">Henüz tanımlanan görev yok</span>

      </div>
    </div>

    <button @mousedown.stop @click="addItem"
    class="w-full btn px-2 p-2 bg-yellow-400 rounded-t absolute bottom-0 text-black font-bold">Ekle</button>
    <div @mousedown="(e) => startResize(e, obj.id ?? '', obj.height, obj.width)" class="absolute bottom-0 right-0 w-3 h-3 bg-white border border-gray-600 cursor-se-resize
           translate-x-1/2 translate-y-1/2" style="touch-action: none;"></div>
  </div>

</template>
<style>
body {
  background-color: #0e0e0e;
}

.task-enter-active {
  animation: slideIn 0.35s cubic-bezier(0.16, 1, 0.3, 1);
}

.task-leave-active {
  animation: fadeOut 0.25s ease forwards;
}

.task-leave-to {
  opacity: 0;
  transform: scale(0.96);
}

.task-move {
  transition: transform 0.35s ease;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeOut {
  to {
    opacity: 0;
    transform: scale(0.96);
  }
}

.checkbox-custom {
  width: 22px;
  height: 22px;
  border: 2px solid #a09080;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.checkbox-custom.checked {
  background: #e8a020;
  border-color: #e8a020;
}

.checkbox-custom:hover:not(.checked) {
  border-color: #e8a020;
}

.checkmark {
  animation: checkPop 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes checkPop {
  from {
    transform: scale(0);
  }

  to {
    transform: scale(1);
  }
}

.progress-bar {
  transition: width 0.5s cubic-bezier(0.16, 1, 0.3, 1);
}

input[type="text"]:focus {
  outline: none;
}

.delete-btn {
  opacity: 0;
  transition: opacity 0.15s ease;
}

.task-row:hover .delete-btn {
  opacity: 1;
}

/* Grain overlay */
.grain::after {
  content: '';
  position: fixed;
  inset: 0;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E");
  pointer-events: none;
  z-index: 100;
  opacity: 0.35;
}
</style>
