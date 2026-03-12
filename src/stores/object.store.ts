import { defineStore } from "pinia";

export type CanvasObject = {
  id: string;
  type?: "note" | "doc" | "circle" | "group"; // farklı şekiller
  x: number;
  y: number;
  size: number;
  color?: string;
  titlecolor?: string;
  title: string; // başlık içeren objeler için
  text?: string; // metin içeren objeler için

};
export interface Connection {
  from: string
  to: string
}
export interface Group {
  id?: string
  x: number;
  y: number;
  size: number;
  title: string;
  canvasObjects?: CanvasObject[]
}
export const useObjectsStore = defineStore("objects", {
  state: () => ({
    objects: [
      { id: crypto.randomUUID().toString(), type: "note", x: 49992, y: 50000, size: 150, color: "", title: 'Alışveriş Listesi', text: 'Alışveriş listesi' },

    ] as CanvasObject[],
    connections: [] as Connection[],
    groups: [] as Group[],
    connectionMode: false,
    noteMode: false,
    docMode: false,
    groupMode: false,
    selectedNodes: [] as string[],
    selectedConnection: null as Connection | null,

    canvasX: window.innerWidth / 2 - 50000,
    canvasY: window.innerHeight / 2 - 50000,
    canvasScale: 1,
  }),

  actions: {
    loadFromStorage() {
      const saved = localStorage.getItem("canvas_data");

      if (!saved) return;

      const data = JSON.parse(saved);
      this.objects = data.objects || [];
      this.connections = data.connections || [];
      this.groups = data.groups || []
      if (data.canvas) {

        this.canvasX = data.canvas.x ?? this.canvasX;
        this.canvasY = data.canvas.y ?? this.canvasY;
        this.canvasScale = data.canvas.scale ?? this.canvasScale;

      }
    },
    saveToStorage() {
      const data = {
        objects: this.objects,
        connections: this.connections,
        canvas: {
          x: this.canvasX,
          y: this.canvasY,
          scale: this.canvasScale,
        },
        groups: this.groups
      };
      localStorage.setItem("canvas_data", JSON.stringify(data));

    },
    addObject(obj: Omit<CanvasObject, "id">) {
      this.objects.push({ ...obj, id: crypto.randomUUID().toString() });
      this.allmodeFalse()
    },

    addGroup(obj: Omit<Group, "id">) {
      this.groups.push({ ...obj, id: crypto.randomUUID().toString() });
      this.allmodeFalse()
    },
    removeObject(id: string) {
      this.objects = this.objects.filter(o => o.id !== id);
      console.log(id)
      this.connections = this.connections.filter(
        c => c.from !== id && c.to !== id
      )

    },
    removeGroup(id: string) {
      this.groups = this.groups.filter(t => t.id !== id)
    },
    connect(a: string, b: string) {
      this.connections.push({
        from: a,
        to: b
      })
    },
    selectNode(id: string) {

      if (!this.connectionMode) return

      this.selectedNodes.push(id)

      if (this.selectedNodes.length === 2) {

        this.connections.push({
          from: this.selectedNodes[0] ?? "",
          to: this.selectedNodes[1] ?? ""
        })

        this.selectedNodes = []
        this.allmodeFalse()

      }

    },
    toggleConnectionMode() {
      this.connectionMode = !this.connectionMode
      this.selectedNodes = []
    },

    toogleNoteMode() {
      this.allmodeFalse()
      this.noteMode = !this.noteMode

    },
    toogleDocMode() {
      this.allmodeFalse()
      this.docMode = !this.docMode

    },
    toogleGroupMode() {
      this.allmodeFalse()
      this.groupMode = !this.groupMode

    },
    allmodeFalse() {
      this.connectionMode = false
      this.noteMode = false
      this.docMode = false
      this.groupMode = false
    },
    getCurrentType(): CanvasObject["type"] {
      console.log(this.noteMode)
      console.log(this.docMode)
      console.log(this.groupMode)

      switch (true) {

        case this.noteMode:
          return "note"

        case this.docMode:
          return "doc"

        case this.groupMode:
          return "group"

        default:
          return "circle"
      }

    }
  },
});
