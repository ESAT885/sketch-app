import { defineStore } from "pinia";

export type CanvasObject = {
  id: string;
  type?: "note" | "doc" | "circle" | "diagram"; // farklı şekiller
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
export const useObjectsStore = defineStore("objects", {
  state: () => ({
    objects: [
      { id: crypto.randomUUID().toString(), type: "note", x:  49992 , y: 50000, size: 150, color: "", title: 'Alışveriş Listesi', text: 'Alışveriş listesi' },
      { id: crypto.randomUUID().toString(), type: "doc", x: 300, y: 100, size: 150, color: "gray", title: 'Not 2', text: 'Not 2' },
      { id: crypto.randomUUID().toString(), type: "note", x: 500, y: 100, size: 150, color: "", title: 'Not 3', text: 'Not 3' }
    ] as CanvasObject[],
    connections: [] as Connection[],
    connectionMode: false,
     selectedNodes: [] as string[],
     selectedConnection: null as Connection | null
  }),
  actions: {
    addObject(obj: Omit<CanvasObject, "id">) {
      this.objects.push({ ...obj, id: crypto.randomUUID().toString() });
    },

    removeObject(id: string) {
      this.objects = this.objects.filter(o => o.id !== id);
    },
    connect(a: string, b: string) {
      this.connections.push({
        from: a,
        to: b
      })
    },
     selectNode(id:string){

      if(!this.connectionMode) return

      this.selectedNodes.push(id)

      if(this.selectedNodes.length === 2){

        this.connections.push({
          from: this.selectedNodes[0]??"",
          to: this.selectedNodes[1]??""
        })

        this.selectedNodes = []
        this.connectionMode = false
      }

    },
     toggleConnectionMode(){
      this.connectionMode = !this.connectionMode
      this.selectedNodes = []
    },

  },
});
