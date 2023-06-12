export enum PinType {
  Input,
  Output,
}

export type HardwareProps = {
  pins: Array<Pin>;
  height?: number;
  width?: number;
  name?: string;
  pos: number[];
  tag: string;
};

export type Pin = {
  name: string;
  value: number;
  bits: number;
  type: PinType;
  pos?: number[];
};

type Point = {
  x: number;
  y: number;
  occupied: boolean;
  visited: boolean;
};

function manhattan(a: Point, b: Point): number {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

export class Heap<T> {
  private _heap: Array<T> = [];
  private _comparator: (a: T, b: T) => boolean;

  constructor(comparator: (a: T, b: T) => boolean) {
    this._comparator = comparator;
  }

  public push(element: T): void {
    this._heap.push(element);
    this._bubbleUp(this._heap.length - 1);
  }

  public peek(): T | undefined {
    return this._heap[0];
  }

  public pop(): T | undefined {
    const poppedElement = this._heap[0];
    const bottom = this._heap.pop();

    if (bottom === undefined || this._heap.length === 0) {
      return poppedElement;
    }

    this._heap[0] = bottom;
    this._bubbleDown(0);

    return poppedElement;
  }

  private swap(i: number, j: number): void {
    const temp = this._heap[i];
    this._heap[i] = this._heap[j];
    this._heap[j] = temp;
  }

  private _parent(index: number): number {
    if (index < 0) return -1;
    return Math.floor((index - 1) / 2);
  }

  private _leftChild(index: number): number {
    return Math.floor((2 * index + 1) / 2);
  }

  private _rightChild(index: number): number {
    return Math.floor((2 * index + 2) / 2);
  }

  private _bubbleUp(index: number): void {
    while (
      index > 0 &&
      this._comparator(this._heap[this._parent(index)], this._heap[index])
    ) {
      this.swap(this._parent(index), index);
      index = this._parent(index);
    }
  }

  private _bubbleDown(index: number): void {
    while (
      this._leftChild(index) < this._heap.length &&
      this._comparator(this._heap[index], this._heap[this._leftChild(index)]) &&
      this._rightChild(index) < this._heap.length &&
      this._comparator(this._heap[index], this._heap[this._rightChild(index)])
    ) {
      const smallerIndex = this._comparator(
        this._heap[this._leftChild(index)],
        this._heap[this._rightChild(index)]
      )
        ? this._leftChild(index)
        : this._rightChild(index);

      this.swap(index, smallerIndex);
      index = smallerIndex;
    }
  }
}

//singleton class
export default class HardwareRenderer {
  private static _instance: HardwareRenderer;
  public draw: CanvasRenderingContext2D | undefined;
  public components: Array<HardwareProps> = [];
  public matrix: Array<Array<Point>> = [];
  public matrixXoffset: number = 20;
  public matrixYoffset: number = 20;

  public static get instance(): HardwareRenderer {
    if (!HardwareRenderer._instance) {
      HardwareRenderer._instance = new HardwareRenderer();
    }

    return HardwareRenderer._instance;
  }

  public setCanvas(ctx: CanvasRenderingContext2D) {
    this.draw = ctx;
  }

  /*
    * Updates the matrix tiles to occupied if a component is on top of it
    @returns void
  */
  public checkCollision() {
    this.components.forEach((component) => {
      let width = component.width ?? 0;
      let height = component.height ?? 0;

      let cx = component.pos[0];
      let cy = component.pos[1];

      if (this.draw == undefined) return false;

      this.matrix.forEach((row) => {
        row.forEach((point) => {
          //OBS: cx + 5 is a quick fix to make pins walkable in a* pathfinding
          if (
            point.x >= cx + 5 &&
            point.x <= cx + width &&
            point.y >= cy &&
            point.y <= cy + height
          ) {
            point.occupied = true;
          }
        });
      });
    });
  }

  /*
    * Initializes the matrix with the canvas width and height
    @returns void
  */
  public initializeMatrix() {
    let height = this.draw?.canvas.height ?? 0;
    let width = this.draw?.canvas.width ?? 0;

    this.matrix = [];

    for (let x = 0; x < width; x += this.matrixXoffset) {
      let row: Array<Point> = [];
      for (let y = 0; y < height; y += this.matrixYoffset) {
        row.push({ x: x, y: y, occupied: false, visited: false });
      }
      this.matrix.push(row);
    }
  }

  /*
    * Draws the matrix tiles on the canvas  
    @returns void
  */
  public drawMatrix() {
    this.matrix.forEach((row) => {
      row.forEach((point) => {
        if (this.draw == undefined) return;
        if (point.occupied) this.draw.fillStyle = "red";
        else this.draw.fillStyle = "green";
        this.draw.fillRect(point.x - 7 / 2, point.y - 7 / 2, 7, 7);
      });
    });
  }

  /*
    * Draws all the registered components on the canvas 
    @returns void
  */
  public drawComponents() {
    this.components.forEach((component) => {
      this.drawComponent(component);
    });
  }

  /*
    * Adds a component to the list of components to be drawn
    @param component - The component to be added
    @returns void
  */
  public addComponent(component: HardwareProps) {
    this.components.push(component);
  }

  /*
    * Updates the canvas reference from the document
    @param doc - The document to be used as reference
    @returns void
  */
  public setCanvasFromDoc(doc: Document) {
    if (doc.getElementById("canvas")) {
      let ctx: CanvasRenderingContext2D =
        (doc.getElementById("canvas") as HTMLCanvasElement).getContext("2d") ??
        new CanvasRenderingContext2D();

      ctx.canvas.width = window.innerWidth * 2;
      ctx.canvas.height = window.innerHeight * 2 - 40;
      ctx.strokeStyle = "black";
      ctx.fillStyle = "black";
      ctx.lineWidth = 7;

      this.setCanvas(ctx);
    }
  }

  /*
    * Draws a component's pin on the canvas
    @param x - The x position of the pin
    @param y - The y position of the pin
    @param size - The size of the pin
    @returns void
  */
  public drawPin(x: number, y: number, size: number) {
    if (this.draw == undefined) return;
    this.draw.fillRect(x - size / 2, y - size / 2, size, size);
  }

  /*
    * Gets the widest pin width from a list of pins given a font
    @param pins - The list of pins to be checked
    @param font - The font to be used
    @returns The width of the widest pin
  */
  public getWidestPinWidth(pins: Array<Pin>, font: string): number {
    let max = "";
    if (this.draw == undefined) return 0;

    this.draw.font = font;

    pins.forEach((pin) => {
      if (pin.name.length > max.length) {
        max = pin.name;
      }
    });

    return this.draw.measureText(max).width;
  }

  /*
    * Gets the width of a title given a font
    @param title - The title to be checked
    @param font - The font to be used
    @returns The width of the title
  */
  public getTitleWidth(title: string, font: string): number {
    if (this.draw == undefined) return 0;

    this.draw.font = font;
    return this.draw.measureText(title).width;
  }

  /*
    * Filters a list of pins by type
    @param pins - The list of pins to be filtered
    @param type - The type of pin to be filtered
    @returns The filtered list of pins
  */
  public filterPins(pins: Array<Pin>, type: PinType): Array<Pin> {
    return pins.filter((pin) => pin.type == type);
  }

  /*
    * Gets what the height of a component has to be given a list of pins and a pin offset
    @param pins - The list of pins to be checked
    @param pinYoffset - The offset of the pins
    @returns The height of the component
  */
  public getAutoHeight(pins: Array<Pin>, pinYoffset: number): number {
    let p: Array<Pin> =
      this.filterPins(pins, PinType.Input).length >
      this.filterPins(pins, PinType.Output).length
        ? this.filterPins(pins, PinType.Input)
        : this.filterPins(pins, PinType.Output);

    return p.length * pinYoffset + 150;
  }

  /*
    * Draws a component on the canvas
    @param component - The component to be drawn
    @returns void    
  */
  public drawComponent(component: HardwareProps) {
    if (this.draw == undefined) return;

    let inputPins = this.filterPins(component.pins, PinType.Input);
    let outputPins = this.filterPins(component.pins, PinType.Output);

    let titleWidth = this.getTitleWidth(
      component.name ?? "",
      "bold 55px Arial"
    );
    let widestInput = this.getWidestPinWidth(inputPins, "40px Arial");
    let widestOutput = this.getWidestPinWidth(outputPins, "40px Arial");

    let widest = Math.max(widestInput, widestOutput);

    titleWidth = Math.min(titleWidth, widest * 4 - 30);

    let x = component.pos[0];
    let y = component.pos[1];

    //draw pins
    let pinSize = 20;
    let pinYoffset = 40;

    let height = this.getAutoHeight(component.pins, pinYoffset);

    //draw box
    this.draw.strokeStyle = "black";
    this.draw.strokeRect(x, y, widest * 4, height);
    component.width = widest * 4;
    component.height = height;

    //draw title
    this.draw.font = "bold 50px Arial";
    this.draw.fillText(
      component.name ?? "",
      x + (widest * 4 - titleWidth) / 2,
      y + height - 50,
      titleWidth
    );
    this.draw.font = "40px Arial";

    //draw input pins
    inputPins.forEach((pin, index) => {
      if (this.draw == undefined) return;

      this.drawPin(x, y + pinYoffset + index * pinYoffset, pinSize);
      this.draw.fillText(
        pin.name,
        x + pinSize * 2,
        y + pinYoffset + 10 + index * pinYoffset
      );
    });

    //draw output pins
    outputPins.forEach((pin, index) => {
      if (this.draw == undefined) return;

      this.drawPin(
        x + widest * 4,
        y + pinYoffset + index * pinYoffset,
        pinSize
      );
      this.draw.fillText(
        pin.name,
        x + widest * 4 - pinSize * 2 - this.draw.measureText(pin.name).width,
        y + pinYoffset + 10 + index * pinYoffset
      );
    });
  }
}
