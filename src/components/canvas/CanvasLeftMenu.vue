<template>
  <div
    v-if="visible"
    :style="{ top: y + 'px', left: x + 'px' }"
    class="absolute bg-gray-800 text-white rounded-md shadow-lg py-1 z-50 min-w-[150px]"
  >
    <div
      v-for="option in options"
      :key="option"
      @click="select(option)"
      class="px-4 py-2 hover:bg-gray-700 cursor-pointer"
    >
      {{ option }}
    </div>
  </div>
</template>

<script setup lang="ts">


const props = defineProps<{
  x: number,
  y: number,
  visible: boolean,
  options?: string[]
}>();

const emit = defineEmits<{
  (e: 'select', option: string): void
}>();

// Varsayılan seçenekler
const options = props.options || [];

function select(option: string) {
  alert("asdasd")
  emit('select', option);
}
</script>

<style scoped>
/* Gerekirse ekstra efekt ekleyebilirsin */
</style>
