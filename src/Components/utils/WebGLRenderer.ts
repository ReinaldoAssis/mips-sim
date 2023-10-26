export default class WebGLRenderer {

    public canvas: HTMLCanvasElement | null = null;
    public gl: WebGLRenderingContext | null = null;

    public constructor(canvas: HTMLCanvasElement) {
        console.log("WebGLRenderer constructor")

        this.canvas = canvas;
        this.gl = canvas.getContext("webgl");

        if (this.gl === null) {
            console.error("Unable to initialize WebGL. Your browser or machine may not support it.");
            return;
        }

        this.gl.clearColor(0.0, 0.0, 0.0, 1.0); // Clear to black, fully opaque
        this.gl.clearDepth(1.0); // Clear everything

    }


}