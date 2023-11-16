
import React from 'react';
// import BinaryNumber from '../../../../Hardware/BinaryNumber';
import { addr } from '../../../../Hardware/TemplatePorcessor';

/*
    IMPORTANT: screen memory starts at 2000 (decimal) and goes to 162.000 (decimal)
*/


const SCREEN_DIV_SIZE = 400

const SCREEN_SIZE = 100

const RATIO = SCREEN_DIV_SIZE / SCREEN_SIZE

// const PIXEL_SIZE = 8

export class ScreenRenderer {
  public _draw: CanvasRenderingContext2D | null = null;

  private static _instance: ScreenRenderer;

  public static get instance() {
    if (ScreenRenderer._instance == null) {
      ScreenRenderer._instance = new ScreenRenderer(null);
    }
    return ScreenRenderer._instance;
  }

  public set draw(value: CanvasRenderingContext2D | null) {
    this._draw = value;
    if (this._draw == null) return;
    this._draw.canvas.height = 400;
    this._draw.canvas.width = 400;

    // remove this later
    // let mem = new Array<addr>();
    // for (let i = 0; i < 10000; i++) {
    //   let color = Math.floor(Math.random()*100) % 2 == 0 ? 0 : 65535;
    //   mem.push({address: new BinaryNumber(i + 2000), value: new BinaryNumber(color)});
    // }

    // mem.forEach((addr) => {
    //   this.drawPixel(addr);
    //   // console.log(`addr ${addr.address.value} value ${addr.value.value}`)
    // })

  }

  public get draw() {
    return this._draw;
  }

  constructor(_draw: CanvasRenderingContext2D | null) {
    this._draw = _draw;

  }

  public _setPixel(x: number, y: number, color: string, pixelSize?: number) {
    if (this._draw == null) return;
    this._draw.fillStyle = color.replace("0x", "#") 
    this._draw.fillRect(x, y, pixelSize ?? RATIO, pixelSize ?? RATIO);
  }

  public drawPixel(address: number, value: number) {
    if (this._draw == null) return;
    // where 2000 is the start address of screen memory map
    
    let y = Math.floor((address - 2000)/SCREEN_SIZE);
    let x = (address - 2000) % (SCREEN_SIZE);

    x *= RATIO;
    y *= RATIO;

    //convert hex to fillcolor
    let color = '#' + (value&0xffffff).toString(16);

    this._draw.fillStyle = color;
    this._draw.fillRect(x, y, RATIO, RATIO);

  }

}

export default function Screen() {

  // boxshadow: 0 0 10px 10px rgba(0, 0, 0, 0.5);
  return <div style={{ backgroundColor: "grey", width: SCREEN_DIV_SIZE, height: SCREEN_DIV_SIZE, left: window.screen.width / 2 - 200, top: window.screen.height / 2 - 300, zIndex: 10, position: "absolute", boxShadow: "0 2 10px 20px rgba(0, 0, 0, 0.5)" }}>
    <canvas style={{ imageRendering: 'pixelated' }} id="screenCanvas"></canvas>
  </div>
}
