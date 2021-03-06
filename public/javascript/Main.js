import {CowfolkScene } from "./cowfolk.js";
import {WheelScene} from "./Wheel.js"
import {BezierCurve, Box} from "./UtilityClasses.js"
import {TouchingCirclesScene} from './TouchingCircles.js'
import {CircleTriangleScene} from './CircleTriangle.js'

const SCENE_HEIGHT = 500
const SCENE_WIDTH = 500

const sceneClasses = [
    CowfolkScene,
    WheelScene,
    TouchingCirclesScene,
    CircleTriangleScene
] 


const CreateScene = (SceneClass, height, width) => {
    const canvas = document.createElement("canvas");
    canvas.height = height;
    canvas.width = width;
    canvas.style.margin = "5px";


    document.body.appendChild(canvas)

    

    let context = canvas.getContext('2d')
    let scene = new SceneClass(context, new Box(0,0,canvas.clientWidth,canvas.clientHeight))

    canvas.addEventListener('mousedown', (event) => {
        scene.ToggleScene();
    });
}

sceneClasses.forEach(scene => {
    CreateScene(scene,SCENE_HEIGHT,SCENE_WIDTH)
})



