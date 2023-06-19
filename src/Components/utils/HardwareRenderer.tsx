export enum PinType {
  Input,
  Output,
}

export enum HardwareType {
  Block,
  Mux,
  Adder,
  Rounder, //general purpose rounded block
}

export type HardwareProps = {
  pins: Array<Pin>;
  height?: number;
  width?: number;
  name?: string;
  pos: number[];
  tag: string;
  type: HardwareType;
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
  f: number;
  g: number;
  parent?: Point | undefined;
};

function manhattan(a: Point, b: Point): number {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

function backtrace(node: Point): Array<Point> {
  let path: Array<Point> = [node];
  while (node.parent) {
    node = node.parent;
    path.push(node);
  }
  return path.reverse();
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

  public pop(): T {
    const poppedElement = this._heap[0];
    const bottom = this._heap.pop();

    if (bottom === undefined || this._heap.length === 0) {
      return poppedElement;
    }

    this._heap[0] = bottom;
    this._bubbleDown(0);

    return poppedElement;
  }

  public updateItem(item: T): void {
    const index = this._heap.indexOf(item);
    this._bubbleUp(index);
    this._bubbleDown(index);
  }

  public isEmpty(): boolean {
    return this._heap.length === 0;
  }

  public toArray(): Array<T> {
    return this._heap;
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
    let parent = this._parent(index);
    if (
      parent >= 0 &&
      this._comparator(this._heap[index], this._heap[parent])
    ) {
      this.swap(index, parent);
      this._bubbleUp(parent);
    }
  }

  private _bubbleDown(index: number): void {
    let smallest = index;
    let left = this._leftChild(index);
    let right = this._rightChild(index);
    if (
      left < this._heap.length &&
      this._comparator(this._heap[left], this._heap[smallest])
    ) {
      smallest = left;
    }

    if (
      right < this._heap.length &&
      this._comparator(this._heap[right], this._heap[smallest])
    ) {
      smallest = right;
    }

    if (smallest !== index) {
      this.swap(index, smallest);
      this._bubbleDown(smallest);
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
  public scale: number = 0.7;

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
            point.x >= cx &&
            point.x <= cx + width + 10 &&
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
  public initializeMatrix(
    xOffset: number = this.matrixXoffset,
    yOffset: number = this.matrixYoffset
  ) {
    let height = this.draw?.canvas.height ?? 0;
    let width = this.draw?.canvas.width ?? 0;

    this.matrixXoffset = xOffset;
    this.matrixYoffset = yOffset;

    this.matrix = [];

    for (let x = 0; x < width; x += this.matrixXoffset) {
      let row: Array<Point> = [];
      for (let y = 0; y < height; y += this.matrixYoffset) {
        row.push({
          x: x,
          y: y,
          occupied: false,
          visited: false,
          f: 999999,
          g: 0,
        });
      }
      this.matrix.push(row);
    }
  }

  /*
    * Resets the matrix tiles to their default values except for occupied
    @returns void
  */
  public resetMatrix() {
    for (let i = 0; i < this.matrix.length; i++) {
      for (let j = 0; j < this.matrix[i].length; j++) {
        this.matrix[i][j].occupied = this.matrix[i][j].occupied;
        this.matrix[i][j].visited = false;
        this.matrix[i][j].f = 999999;
        this.matrix[i][j].g = 0;
        this.matrix[i][j].parent = undefined;
      }
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
      if (component.type == HardwareType.Block) this.drawComponent(component);
      else if (component.type == HardwareType.Mux) this.drawMux(component);
      else if (component.type == HardwareType.Adder) this.drawAdder(component);
      else if (component.type == HardwareType.Rounder)
        this.drawRounder(component);
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
      ctx.lineWidth = 7; //* this.scale;

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

  private get nullPoint(): Point {
    return { x: -1, y: -1, occupied: false, visited: false, f: -1, g: -1 };
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
    * Gets the euclidian distance between two points
    @param x1 - The x position of the first point
    @param y1 - The y position of the first point
    @param x2 - The x position of the second point
    @param y2 - The y position of the second point
    @returns The euclidian distance between the two points
  */
  private euclidian(x1: number, y1: number, x2: number, y2: number): number {
    return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
  }

  /*
    * Gets the closest tile from the matrix to a pin   
    @param pin - The pin to be checked
    @returns The closest tile to the pin 
  */
  private getsPinClosestTile(pin: Pin): Point {
    if (pin.pos == undefined)
      return { x: -1, y: -1, occupied: false, visited: false, f: -1, g: -1 };
    let x = pin.pos[0];
    let y = pin.pos[1];

    let closest: Array<Point> = [];
    this.matrix.forEach((row) => {
      row.forEach((point) => {
        if (this.euclidian(point.x, point.y, x, y) < 20) {
          //&& !point.occupied
          closest.push(point);
          // if (this.draw == undefined) return closest[0];
          // this.draw.strokeStyle = "red";
          // this.draw.strokeRect(point.x - 1, point.y - 1, 2, 2);
        }
      });
    });

    closest.sort((p) => this.euclidian(p.x, p.y, x, y));
    if (closest.length == 0) return this.nullPoint;
    closest[0].occupied = false;

    /*TODO: remove this section */
    // if (this.draw == undefined) return closest[0];
    // this.draw.strokeStyle = "purple";
    // this.draw.strokeRect(closest[0].x - 2, closest[0].y - 2, 4, 4);

    return closest[0];
  }

  private getTileNeighbors(tile: Point): Array<Point> {
    let neighbors: Array<Point> = [];

    let i = tile.x / this.matrixXoffset;
    let j = tile.y / this.matrixYoffset;

    if (i + 1 >= this.matrix.length) {
      // console.log("i + 1 >= this.matrix.length", i + 1, this.matrix.length);
      return neighbors;
    }
    if (j + 1 >= this.matrix[0].length) {
      // console.log(
      //   "j + 1 >= this.matrix[0].length",
      //   j + 1,
      //   this.matrix[0].length
      // );
      return neighbors;
    }

    if (this.matrix[i + 1][j].occupied == false)
      neighbors.push(this.matrix[i + 1][j]);

    if (this.matrix[i][j + 1].occupied == false)
      neighbors.push(this.matrix[i][j + 1]);

    if (j - 1 < 0) return neighbors;

    if (this.matrix[i][j - 1].occupied == false)
      neighbors.push(this.matrix[i][j - 1]);

    if (i - 1 < 0) return neighbors;

    if (this.matrix[i - 1][j].occupied == false)
      neighbors.push(this.matrix[i - 1][j]);

    return neighbors;
  }

  public aStarPathFiding(
    a: Point,
    b: Point,
    debug: boolean = false
  ): Array<Point> {
    //A* pathfinding
    let weight = 1;

    let openSet: Heap<Point> = new Heap<Point>((a, b) => a.f < b.f);
    a.f = 0;
    a.g = 0;

    openSet.push(a);
    a.visited = true;

    //initializes the direction
    let direction = Math.atan2(b.y - a.y, b.x - a.x);

    function isSameDirection(node: Point): boolean | undefined {
      if (node.parent == undefined) return undefined;
      if (node.parent.parent == undefined) return undefined;

      let prev = node.parent;
      let prevprev = node.parent.parent;

      let dx = Math.abs(prev.x - prevprev.x);
      let dy = Math.abs(prev.y - prevprev.y);

      if (dx == 0 && dy == 0) return undefined;
      if (dx == 0) return prev.x > prevprev.x && prev.y == prevprev.y;
      if (dy == 0) return prev.y > prevprev.y && prev.x == prevprev.x;
    }

    while (openSet.isEmpty() == false) {
      let node = openSet.pop(); //gets the node with the lowest f value
      node.visited = true;

      // if (node === b) {
      //   //return backtrace
      //   return backtrace(node);
      // }

      if (node.x == b.x && node.y == b.y) return backtrace(node);

      let neighbors = this.getTileNeighbors(node);

      if (debug) {
        if (this.draw == undefined) return [];
        this.draw.strokeStyle = "orange";
        this.draw.strokeRect(node.x - 2, node.y - 2, 4, 4);

        // console.log("heap", openSet.toArray());
        // console.log("neighbors", neighbors);
      }

      for (let i = 0; i < neighbors.length; i++) {
        let neighbor = neighbors[i];

        if (neighbor.visited) continue;

        let turnCost = 0;

        //calculate the current direction and apply a turn cost if the direction changes
        if (node.parent) {
          let dx1 = node.x - node.parent.x;
          let dy1 = node.y - node.parent.y;
          let dx2 = neighbor.x - node.x;
          let dy2 = neighbor.y - node.y;

          if (dx1 != dx2 || dy1 != dy2) {
            turnCost = 200;
          }
        }

        // get the distance between current node and the neighbor
        // and calculate the next g score

        //TODO: verify if this is correct
        // let ng = node.g + 1; // 1 is the distance between two nodes (1 tile) since diagonal movement is not allowed
        let ng = node.g + weight + turnCost; // 1 is the distance between two nodes (1 tile) since diagonal movement is not allowed

        if (!neighbor.visited || ng < neighbor.g) {
          neighbor.g = ng;
          // neighbor.f = ng + weight * manhattan(neighbor, b);
          neighbor.f = ng + manhattan(neighbor, b);
          neighbor.parent = node;

          if (!neighbor.visited) {
            neighbor.visited = true;
            openSet.push(neighbor);
          } else {
            // the neighbor can be reached with smaller cost.
            // Since its f value has been updated, we have to
            // update its position in the open list
            openSet.updateItem(neighbor);
          }
        }
      }
    }

    return [];
  }

  /*
    * Draws a wire between two pins using A* pathfinding
    @param pinA - The first pin
    @param pinB - The second pin
    @returns void
  */
  public drawWire(pinA: Pin, pinB: Pin): Array<Point> {
    if (this.draw == undefined) return [];

    let a: Point = this.getsPinClosestTile(pinA);
    let b: Point = this.getsPinClosestTile(pinB);

    let path: Array<Point> = this.aStarPathFiding(a, b);

    this.draw.strokeStyle = "black";
    this.draw.beginPath();

    path.forEach((point, index) => {
      if (this.draw == undefined) return;

      if (index == 0) this.draw.moveTo(point.x, point.y);
      else this.draw.lineTo(point.x, point.y);
    });

    this.draw.stroke();

    return path;
  }

  /*
    * Connects two pins using A* pathfinding
    @param c1 - The name of the first component
    @param c2 - The name of the second component
    @param p1 - The name of the first pin
    @param p2 - The name of the second pin
    @returns The path between the two pins
  */
  public connect(c1: string, c2: string, p1: string, p2: string): Array<Point> {
    c1 = c1.toLowerCase();
    c2 = c2.toLowerCase();
    p1 = p1.toLowerCase();
    p2 = p2.toLowerCase();

    let pinA = this.components
      .find((c) => c.name?.toLowerCase() == c1)
      ?.pins.find((p) => p.name.toLowerCase() == p1);
    let pinB = this.components
      .find((c) => c.name?.toLowerCase() == c2)
      ?.pins.find((p) => p.name.toLowerCase() == p2);

    if (pinA == undefined || pinB == undefined) return [];

    return this.drawWire(pinA, pinB);
  }

  /*
    * Makes a branch from a wire to a pin using A* pathfinding
    @param wire - The wire to be branched
    @param c1 - The name of the component
    @param p1 - The name of the pin
    @param branch - The index of the wire to be branched
    @param delta - The offset for the branch, for example [0, 1] will make the branch go down one tile
    @returns The path between the wire and the pin  
  */
  public branch(
    wire: Array<Point>,
    c1: string,
    p1: string,
    branch: number | undefined = undefined,
    delta: number[] = [0, 0]
  ): Array<Point> {
    /* Finds the pin using the names given */
    c1 = c1.toLowerCase();
    p1 = p1.toLowerCase();
    let pinA = this.components
      .find((c) => c.name?.toLowerCase() == c1)
      ?.pins.find((p) => p.name.toLowerCase() == p1);

    if (pinA == undefined || wire.length == 0) return [];
    /* --- */

    //Point a is where the wire is branched from
    let a: Point = wire[branch ?? Math.floor(Math.random() * wire.length)];
    //copy of the original point
    let originalA: Point = { ...a };
    //Point b is the destination pin
    let b: Point = this.getsPinClosestTile(pinA);

    a.visited = false;
    a.occupied = false;
    a.x += delta[0] * this.matrixXoffset;
    a.y += delta[1] * this.matrixYoffset;

    //reset the matrix to its default values
    this.resetMatrix();

    //get the path with a* pathfinding
    let path: Array<Point> = this.aStarPathFiding(a, b, false);

    if (this.draw == undefined) return [];

    this.draw.strokeStyle = "black";
    this.draw.beginPath();
    path.forEach((point, index) => {
      if (this.draw == undefined) return;

      if (index == 0) this.draw.moveTo(point.x, point.y);
      else this.draw.lineTo(point.x, point.y);
    });

    this.draw.stroke();

    if (delta[0] != 0 || delta[1] != 0) {
      this.draw.beginPath();
      this.draw.moveTo(originalA.x, originalA.y);

      if (delta[1] != 0) this.draw.lineTo(a.x, a.y + 4 * this.scale);
      else this.draw.lineTo(a.x, a.y);

      this.draw.stroke();
    }

    return path;
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

    let titleWidth = this.getTitleWidth(component.name ?? "", this.bigText);
    let widestInput = this.getWidestPinWidth(inputPins, this.shortText);
    let widestOutput = this.getWidestPinWidth(outputPins, this.shortText);

    let widest = Math.max(widestInput, widestOutput);

    titleWidth = Math.min(titleWidth, widest * 4 - 30);

    let x = component.pos[0];
    let y = component.pos[1];

    //draw pins
    let pinSize = 20 * this.scale;
    let pinYoffset = 80 * this.scale;

    let height = this.getAutoHeight(component.pins, pinYoffset);

    //draw box
    this.draw.strokeStyle = "black";
    this.draw.strokeRect(x, y, widest * 4, height);
    component.width = widest * 4;
    component.height = height;

    //draw title
    this.draw.font = this.bigText;
    this.draw.fillText(
      component.name ?? "",
      x + (widest * 4 - titleWidth) / 2,
      y + height - 50,
      titleWidth
    );
    this.draw.font = this.shortText;

    //draw input pins
    inputPins.forEach((pin, index) => {
      if (this.draw == undefined) return;

      this.drawPin(x, y + pinYoffset + index * pinYoffset, pinSize);
      this.draw.fillText(
        pin.name,
        x + pinSize * 2,
        y + pinYoffset + 10 + index * pinYoffset
      );

      //updates the pin position
      pin.pos = [
        x - pinSize / 2,
        y + pinYoffset + index * pinYoffset - pinSize / 2,
      ];
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

      //updates the pin position
      pin.pos = [
        x + widest * 4 - pinSize / 2,
        y + pinYoffset + index * pinYoffset - pinSize / 2,
      ];
    });
  }

  /*
   * Gets the font for the short text of a component
   */
  private get shortText(): string {
    return `${40 * this.scale}px Arial`;
  }

  /*
   * Gets the font for the title text of a component
   */
  private get bigText(): string {
    return `bold ${55 * this.scale}px Arial`;
  }

  /*
    * Draws a mux on the canvas with variable input and output pins
    @param props - The component to be drawn
    @returns void
  */
  public drawMux(props: HardwareProps) {
    if (this.draw == undefined) return;

    // filters the pins by type
    let inputPins = this.filterPins(props.pins, PinType.Input);
    let outputPins = this.filterPins(props.pins, PinType.Output);

    // automatically calculates the height of the component
    let height =
      inputPins.length * this.matrixYoffset * 2 + this.matrixYoffset * 2;
    let width = this.matrixXoffset * 3;

    //draws the rounded body
    this.draw.strokeStyle = "black";
    this.draw.beginPath();
    this.draw.roundRect(props.pos[0], props.pos[1], width, height, 50);
    this.draw.stroke();

    /* Updates the props height and width to account for in collision */
    props.height = height;
    props.width = width - 20;
    /* */

    this.draw.font = this.shortText;

    //offset between input pins
    let inputOffset = height / (inputPins.length + 1);
    let pinSize = this.matrixXoffset / 1.5; //general size of the pins

    //calculates the margin between the pins so that they are centered
    function margin(length: number, offset: number): number {
      return (height - (length - 1) * offset) / 2;
    }

    /* draws the input pins */
    inputPins.forEach((pin, index) => {
      if (this.draw == undefined) return;

      this.drawPin(
        props.pos[0],
        props.pos[1] +
          margin(inputPins.length, inputOffset) +
          index * inputOffset,
        pinSize
      );

      //updates the pin position
      inputPins[index].pos = [
        props.pos[0] - pinSize / 2,
        props.pos[1] +
          margin(inputPins.length, inputOffset) +
          index * inputOffset -
          pinSize / 2,
      ];
    });

    //offset between output pins
    let outputOffset = 40 * this.scale;

    /* Draws the output pins */
    outputPins.forEach((pin, index) => {
      if (this.draw == undefined) return;

      this.drawPin(
        props.pos[0] + width,
        props.pos[1] +
          +margin(outputPins.length, outputOffset) +
          index * outputOffset,
        pinSize
      );

      //updates the pin position
      outputPins[index].pos = [
        props.pos[0] + width - pinSize / 2,
        props.pos[1] +
          margin(outputPins.length, outputOffset) +
          index * outputOffset -
          pinSize / 2,
      ];
    });
  }

  public drawAdder(props: HardwareProps) {
    if (this.draw == undefined) return;

    let x = props.pos[0];
    let y = props.pos[1];

    let s = this.scale * 1.5;

    //draw body
    this.draw.strokeStyle = "black";
    this.draw.beginPath();
    this.draw.moveTo(x, y);
    this.draw.lineTo(x, y + 50 * s);
    this.draw.lineTo(x + 40 * s, y + 75 * s);
    this.draw.lineTo(x, y + 100 * s);
    this.draw.lineTo(x, y + 150 * s);
    this.draw.lineTo(x + 80 * s, y + 100 * s);
    this.draw.lineTo(x + 80 * s, y + 50 * s);
    this.draw.lineTo(x, y);
    this.draw.stroke();

    //updates the component size
    props.height = 200 * s;
    props.width = 80 * s;

    //draw text
    this.draw.font = this.bigText;
    this.draw.fillText("Adder", x - 15 * s, y + 190 * s);

    //draw pins
    let pinSize = 20 * this.scale;
    let inputPins = this.filterPins(props.pins, PinType.Input);
    let outputPins = this.filterPins(props.pins, PinType.Output);

    this.drawPin(x, y + 25 * s, pinSize); //a
    this.drawPin(x, y + 125 * s, pinSize); //b
    this.drawPin(x + 84, y + 75 * s, pinSize); //output

    inputPins[0].pos = [x, y + 25 * s];
    inputPins[1].pos = [x, y + 125 * s];
    outputPins[0].pos = [x + 84, y + 75 * s];
  }

  public drawRounder(props: HardwareProps) {
    let titleWidth = this.getTitleWidth(props.name ?? "", this.bigText);

    let x = props.pos[0];
    let y = props.pos[1];

    if (this.draw == undefined) return;

    let width = titleWidth + 3 * this.matrixXoffset;
    let height = 3 * this.matrixYoffset;

    //draw box
    this.draw.strokeStyle = "black";
    this.draw.beginPath();
    this.draw.roundRect(x, y, width, height, 50);
    this.draw.stroke();

    //draw title
    this.draw.font = this.bigText;
    this.draw.fillText(
      props.name ?? "",
      x + titleWidth / 8,
      y + 60 * this.scale,
      width
    );

    //draw pins
    let pinSize = 20 * this.scale;
    let inputPins = this.filterPins(props.pins, PinType.Input);
    let outputPins = this.filterPins(props.pins, PinType.Output);

    this.drawPin(x, y + height / 2, pinSize); //a
    this.drawPin(x + width, y + height / 2, pinSize); //output

    //updates the pin position
    inputPins[0].pos = [x - pinSize / 2, y + height / 2 - pinSize / 2];
    outputPins[0].pos = [x + width - pinSize / 2, y + height / 2 - pinSize / 2];

    //updates the component size
    props.height = height;
    props.width = width;
  }
}
