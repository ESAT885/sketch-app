import { defineStore } from "pinia";

/* ================================
BASE
================================ */

interface BaseCanvasItem {
  id: string;
  x: number;
  y: number;
  size: number;
  width: number;
  height: number;
  title: string;
  color?: string;
}

/* ================================
ITEM TYPES
================================ */

export interface CanvasObject extends BaseCanvasItem {
  kind: "object";
  type: "note" | "doc";
  titlecolor?: string;
  text?: string;
}

export interface Group extends BaseCanvasItem {
  kind: "group";
  canvasObjects?: string[]; // içindeki object id'leri
}

export interface CanvasTitle extends BaseCanvasItem {
  kind: "title";
}
export interface CheckList extends BaseCanvasItem {
  kind: "checkList";
  checkListDetails: CheckListDetail[]
}
export interface CheckListDetail {
  check: boolean;
  title: string
}
export type CanvasItem =
  | CanvasObject
  | Group
  | CanvasTitle
  | CheckList;

/* ================================
CONNECTION
================================ */

export interface Connection {
  from: string;
  to: string;
}

/* ================================
STORE STATE
================================ */

interface CanvasStoreState {
  items: CanvasItem[];
  connections: Connection[];

  connectionMode: boolean;
  noteMode: boolean;
  docMode: boolean;
  groupMode: boolean;
  canvasTitleMode: boolean;
  checkListMode: boolean;
  selectedNodes: string[];
  selectedConnection: Connection | null;

  canvasX: number;
  canvasY: number;
  canvasScale: number;
}

/* ================================
STORE
================================ */

export const useObjectsStore = defineStore("objects", {

  state: (): CanvasStoreState => ({
    items: [
      {
        id: crypto.randomUUID(),
        kind: "object",
        type: "note",
        x: 49992,
        y: 50000,
        size: 150,
        title: "Alışveriş Listesi",
        text: "Alışveriş listesi",
        width: 150,
        height: 150
      }
    ],

    connections: [],

    connectionMode: false,
    noteMode: false,
    docMode: false,
    groupMode: false,
    canvasTitleMode: false,
    checkListMode: false,
    selectedNodes: [],
    selectedConnection: null,

    canvasX: window.innerWidth / 2 - 50000,
    canvasY: window.innerHeight / 2 - 50000,
    canvasScale: 1
  }),

  /* ================================
  GETTERS
  ================================= */

  getters: {

    objects: (state) =>
      state.items.filter(i => i.kind === "object") as CanvasObject[],

    groups: (state) =>
      state.items.filter(i => i.kind === "group") as Group[],

    canvasTitles: (state) =>
      state.items.filter(i => i.kind === "title") as CanvasTitle[],
    checkLists: (state) =>
      state.items.filter(i => i.kind === "checkList") as CheckList[]
  },

  /* ================================
  ACTIONS
  ================================= */

  actions: {

    /* Load */

    loadFromStorage() {

      const saved = localStorage.getItem("canvas_data");
      if (!saved) return;

      const data = JSON.parse(saved);

      this.items = data.items ?? [];
      this.connections = data.connections ?? [];

      if (data.canvas) {

        this.canvasX = data.canvas.x ?? this.canvasX;
        this.canvasY = data.canvas.y ?? this.canvasY;
        this.canvasScale = data.canvas.scale ?? this.canvasScale;

      }

    },

    /* Save */

    saveToStorage() {

      localStorage.setItem(
        "canvas_data",
        JSON.stringify({

          items: this.items,
          connections: this.connections,

          canvas: {
            x: this.canvasX,
            y: this.canvasY,
            scale: this.canvasScale
          }

        })
      );

    },

    /* ==========================
       ADD
    ========================== */

    addObject(obj: Omit<CanvasObject, "id" | "kind">) {

      this.items.push({
        ...obj,
        kind: "object",
        id: crypto.randomUUID()
      });

      this.resetModes();

    },

    addGroup(group: Omit<Group, "id" | "kind">) {

      this.items.push({
        ...group,
        kind: "group",
        id: crypto.randomUUID()
      });

      this.resetModes();

    },

    addCanvasTitle(title: Omit<CanvasTitle, "id" | "kind">) {

      this.items.push({
        ...title,
        kind: "title",
        id: crypto.randomUUID()
      });

      this.resetModes();

    },
    addCheckList(title: Omit<CheckList, "id" | "kind">) {

      this.items.push({
        ...title,
        kind: "checkList",
        id: crypto.randomUUID()
      });

      this.resetModes();

    },

    /* ==========================
       REMOVE
    ========================== */

    removeItem(id: string) {

      this.items = this.items.filter(i => i.id !== id);

      this.connections =
        this.connections.filter(
          c => c.from !== id && c.to !== id
        );

    },

    /* ==========================
       CONNECTION
    ========================== */

    connect(a: string, b: string) {

      this.connections.push({
        from: a,
        to: b
      });

    },

    selectNode(id: string) {

      if (!this.connectionMode) return;

      this.selectedNodes.push(id);

      if (this.selectedNodes.length === 2) {

        this.connections.push({
          from: this.selectedNodes[0] ?? '',
          to: this.selectedNodes[1] ?? ''
        });

        this.selectedNodes = [];
        this.resetModes();

      }

    },

    /* ==========================
       MODES
    ========================== */

    toggleConnectionMode() {

      this.connectionMode = !this.connectionMode;
      this.selectedNodes = [];

    },

    toggleNoteMode() {

      this.resetModes();
      this.noteMode = true;

    },

    toggleDocMode() {

      this.resetModes();
      this.docMode = true;

    },

    toggleGroupMode() {

      this.resetModes();
      this.groupMode = true;

    },

    toggleCanvasTitle() {

      this.resetModes();
      this.canvasTitleMode = true;

    },
    toggleCheckList() {
      this.resetModes();
      this.checkListMode = true;
    },
    resetModes() {

      this.connectionMode = false;
      this.noteMode = false;
      this.docMode = false;
      this.groupMode = false;
      this.canvasTitleMode = false;
      this.checkListMode = false;
    },

    /* ==========================
       CURRENT TYPE
    ========================== */

    getCurrentType(): CanvasObject["type"] {

      if (this.noteMode) return "note";
      if (this.docMode) return "doc";

      return "note";

    }

  }

});
