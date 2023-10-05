
import React from 'react';
import BinaryNumber from '../../../../Hardware/BinaryNumber';
import { addr } from '../../../../Hardware/TemplatePorcessor';

/*
    IMPORTANT: screen memory starts at 2000 (decimal) and goes to 162.000 (decimal)
*/


const SCREEN_DIV_SIZE = 400

const SCREEN_SIZE = 400

const PIXEL_SIZE = 1

export class ScreenRenderer{
    public _draw: CanvasRenderingContext2D | null = null;
    public memory = Array<addr>();

    private static _instance: ScreenRenderer;

    public static get instance(){
        if(ScreenRenderer._instance == null){
            ScreenRenderer._instance = new ScreenRenderer(null);
        }
        return ScreenRenderer._instance;
    }

    public set draw(value: CanvasRenderingContext2D | null){
        this._draw = value;
        if(this._draw == null) return;
        this._draw.canvas.height = 400;
        this._draw.canvas.width = 400;
    }

    public get draw(){
        return this._draw;
    }

    constructor(_draw: CanvasRenderingContext2D | null){
        this._draw = _draw;
        
        //fill memory with junk
        for(let i = 0; i < 162000; i++){
            this.memory.push({address: new BinaryNumber(i + 2000), value: new BinaryNumber(Math.random()*0xffff)});
        }

        this.drawScreen()

    }

    public drawPixel(x: number, y: number, color: string, pixelSize?: number){
        if(this._draw == null) return;
        this._draw.fillStyle = color.replace("0x", "#") //"rgba(200,20,200)"
        this._draw.fillRect(x, y, pixelSize ?? PIXEL_SIZE, pixelSize ?? PIXEL_SIZE);
    }

    public drawScreen(){
        if(this._draw == null) return;

        //cleans the screen
        // this._draw.clearRect(0, 0, 400, 400);

        console.log("drawing screen")
        
        for(let i =0; i< this.memory.length; i++){
            let addr = this.memory[i];
            let x = (addr.address.value - 2000) % SCREEN_SIZE;
            let y = Math.floor((addr.address.value - 2000) / SCREEN_SIZE);
            this.drawPixel(x, y, addr.value.toHex());
        }

    }

    public write(address: BinaryNumber, value: BinaryNumber){
        if (this.memory.find((addr) => addr.address.value == address.value) != null) 
            this.memory.find((addr) => addr.address.value == address.value)!.value = value;
        else
            this.memory.push({address: address, value: value});
    }

    public reset_memory(){
        this.memory = [];
    }


}

export default function Screen(){

    // const [renderer, setRenderer] = React.useState<ScreenRenderer | null>(null);

    React.useEffect(( ) => {
        let canva = (document.getElementById("screenCanvas") as HTMLCanvasElement).getContext("2d");
        if(canva == null) return;
        if (ScreenRenderer.instance.draw == null) ScreenRenderer.instance.draw = canva;
        // ScreenRenderer.instance.draw = canva;
        // ScreenRenderer.instance.drawScreen()

    }, [])

    // boxshadow: 0 0 10px 10px rgba(0, 0, 0, 0.5);
    return <div style={{backgroundColor: "grey", width: SCREEN_DIV_SIZE, height: SCREEN_DIV_SIZE, left:window.screen.width/2 - 200, top: window.screen.height/2 - 300, zIndex: 10, position: "absolute", boxShadow: "0 2 10px 20px rgba(0, 0, 0, 0.5);"}}>
        <canvas id="screenCanvas"></canvas>
    </div>
}