import { defineStore } from "pinia"

export const useCameraStore = defineStore("camera", {
  state: () => ({
    x: 0,
    y: 0,
    scale: 1
  }),

  actions: {
    move(dx: number, dy: number) {
      this.x += dx
      this.y += dy
    },

    zoom(delta: number) {
      this.scale += delta
    }
  }
})
