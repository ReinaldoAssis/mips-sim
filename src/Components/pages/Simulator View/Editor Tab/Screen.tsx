
import React from 'react';
import Draggable from 'react-draggable';
// import BinaryNumber from '../../../../Hardware/BinaryNumber';
import { addr } from '../../../../Hardware/TemplatePorcessor';

/*
    IMPORTANT: screen memory starts at 2000 (decimal) and goes to 162.000 (decimal)
*/


const SCREEN_DIV_SIZE = 500

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
    this._draw.canvas.height = SCREEN_DIV_SIZE;
    this._draw.canvas.width = SCREEN_DIV_SIZE;
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

    value = value & 0xffff;
    let r = (value & 0b1111100000000000) >> 8;
    let g = (value & 0b0000011111100000) >> 3;
    let b = (value & 0b0000000000011111) << 3;


    this._draw.fillStyle = `rgb(${r},${g},${b})`;
    this._draw.fillRect(x, y, RATIO, RATIO);

  }

}

export default function Screen() {

  // boxshadow: 0 0 10px 10px rgba(0, 0, 0, 0.5);
  return <>
    <Draggable>
      <div style={{cursor: "grab" ,backgroundColor: "grey", width: SCREEN_DIV_SIZE, height: SCREEN_DIV_SIZE, left: window.screen.width / 2 - 200, top: window.screen.height / 2 - 300, zIndex: 10, position: "absolute", boxShadow: "0 2 10px 20px rgba(0, 0, 0, 0.5)"}}>
        <canvas style={{ imageRendering: 'pixelated', position: "absolute"}} id="screenCanvas"></canvas>
      </div>
    </Draggable>
  </>
}
