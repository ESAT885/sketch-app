<script setup lang="ts">

import { useObjectsStore, type Connection } from "@/stores/object.store";
import NoteItem from "@/components/canvas/contentItems/NoteItem.vue"
const objectsStore = useObjectsStore();








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
  if (objectsStore.selectedConnection == c) {
    objectsStore.selectedConnection = null
    return
  }
  objectsStore.selectedConnection = c
}

</script>

<template>
  <svg class="absolute left-0 top-0 w-full h-full pointer-events-none">

    <path v-for="c in objectsStore.connections" :key="c.from + c.to" :d="getBezierPath(c)" stroke-width="3" fill="none"
      stroke-linecap="round" class="cursor-pointer" style="pointer-events: stroke;" @click.stop="selectedNode(c)"
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
      <NoteItem :obj="obj"></NoteItem>




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
