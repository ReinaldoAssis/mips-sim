import React, { useEffect } from "react";
import { ReactComponent as MipsSVG } from "./mips32.svg";

export class HardwareViewService {
    private static _instance : HardwareViewService;
    
}

export default function HardwareView() {
    useEffect(() => {
        // Manipulate the SVG elements here
        const svgPath = document.getElementById("pc-out-imem");
        if (svgPath) {
            svgPath.style.stroke = "blue";
        }
    }, []);

    return (
        // <div >
            <MipsSVG style={{ width:"70%", zIndex:0, position:"absolute", left:300, top: -400 }} />
        // </div>
    );
}
