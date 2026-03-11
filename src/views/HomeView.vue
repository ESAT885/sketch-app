<script setup lang="ts">
import InfiniteCanvas from "@/components/canvas/InfiniteCanvas.vue"
import CanvasContent from "@/components/canvas/CanvasContent.vue"
import CanvasMenus from "@/components/CanvasMenus.vue"


</script>

<template>

  <CanvasMenus>
    <InfiniteCanvas>
      <CanvasContent></CanvasContent>
    </InfiniteCanvas>
  </CanvasMenus>

</template>
