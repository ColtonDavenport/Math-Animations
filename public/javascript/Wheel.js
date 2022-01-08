import {Box, Vector2D} from './UtilityClasses.js';

/**
 * A class that descrbes a wheel, a circle with coloured slices
 */
class Wheel {
    #position
    #radius
    #numSlices
    #rotation // was called spinangle
    static #colours = [
    '#eeeee4',
    '#1e81b0',
    '#e28743',
    '#76b5c5',
    '#ffe1d5'
    ]

    /**
     * @param {number} x The x part of the center's coordinate.
     * @param {number} y The y part of the center's coordinate.
     * @param {number} radius The radius of the wheel
     * @param {number} rotation the rotation of the wheel, in radians
     */
    constructor(x,y,radius, numSlices, rotation = 0.0){
        this.#position = new Vector2D(x,y);
        this.#radius = radius;
        this.#numSlices = numSlices
        this.#rotation = rotation;
    }

    /**
     * Draws the wheel in the provided context.
     * @param {!CanvasRenderingContext2D} context The 2d context of a canvas.
     */
    Draw(context){

        let sliceAngle = Math.PI * 2 / this.#numSlices;
        let angle = this.#rotation;

        context.save();
        // draw the wheel slice-by-slice
        for(let i = 0; i < this.#numSlices; i++) {
            // select this slice's colour, cycling through the wheel's colours 
            context.fillStyle = Wheel.#colours[i % Wheel.#colours.length];
            this.DrawSlice(context, angle, angle + sliceAngle);
            angle += sliceAngle;
        }
        context.restore();
    }
    /**
     * Draws a slice of the wheel in the provided context.
     * @param {!CanvasRenderingContext2D} context The 2d context of a canvas.
     * @param {number} startAngle The angle along the wheel's circumference to start drawing a slice at, in radians
     * @param {number} endAngle The angle along the wheel's circumference to end drawing a slice at, in radians
     */
    DrawSlice(context, startAngle, endAngle){
        context.beginPath();
        context.arc(this.#position.x, this.#position.y, this.#radius, startAngle, endAngle);
        context.lineTo(this.#position.x, this.#position.y);
        context.lineTo(this.#position.x + Math.cos(startAngle) * this.#radius, this.#position.y + Math.sin(startAngle)* this.#radius); // necessary to fill one pixel gaps
        context.fill();
    }

    set position(position){
        if(typeof position.x != 'number' || typeof position.y != 'number' || position.x == NaN || position.y == NaN){
            console.log("Position must be set with vaild x and y coordinates. No change made, position stays: ", position)
            return;
        }
        this.#position.x = position.x
        this.#position.y = position.y
    }
    set rotation(rotation){
        if(typeof rotation != 'number' ) {
            console.log("Must set rotation to a number, rotation reset to 0")
            return;
        }
        while(rotation >= Math.PI * 2 ){
            rotation -= Math.PI * 2;
        }
        while(rotation < 0) {
            rotation += Math.PI * 2;
        }

        this.#rotation = rotation;
    }
    get rotation() {
        return this.#rotation;
    }
    get position() {
        return new Vector2D(this.#position.x, this.#position.y)
    }
    get radius() {
        return this.#radius;
    }
    static GetColoursLength() {
        return this.#colours.length;
    }
}

/**
 * A class that descrbes a path along the perimeter of an equilateral polygon.
 */
class PolygonalPath {
    #rotation
    #path
    /**
     * @param {number} centerX the X coordinate of the polygon's center
     * @param {number} centerY the Y coordinate of the polygon's center
     * @param {number} radius the distance from each point to the polygon's center
     * @param {number} numSides the number of sides of the polygon
     * @param {number} rotation the rotation of the polygon, in radians
     */
    constructor (centerX, centerY, radius, numSides, rotation = 0) {
    
        this.#rotation = rotation
        this.#path = [];

        /**
         * Create the path
         * 
         *  * each point will have data on their position 
         *  * and a normalized vector to the next point clockwise 
         */

        // create the points, at first only defining positional data
        
        let angle = this.#rotation;
        let wedgeAngle = Math.PI * 2 / numSides;
        for (let i = 0; i< numSides; i++){
            this.#path.push({
                    x: centerX + Math.cos(angle) * radius,
                    y: centerY + Math.sin(angle) * radius
            });
            angle += wedgeAngle;
        }
    
        // add detail to each point about the direction to the next point
        for (let i = 0; i < this.#path.length; i++){
            let nextIdx = (i + 1) % this.#path.length;
            // calculate the vector & magnitude between the current and next points
            let direction = new Vector2D(this.#path[nextIdx].x - this.#path[i].x, this.#path[nextIdx].y - this.#path[i].y );
            // add the normalized vector from the current point to the next point
            this.#path[i].normalVector = direction.normal;
            // calculate the slope from the current point to the next
            this.#path[i].slopeAngle = Math.atan2(direction.y, direction.x);
    
            this.#path[i].perpSlopeAngle = Math.atan2(-direction.x, direction.y);
        }
    }

    Draw(context) {
        if(this.#path.length > 0){
            context.save();
            context.fillStyle = "black"
            context.beginPath();
            context.moveTo(this.#path[0].x, this.#path[0].y);
            for(let i = 0; i < this.#path.length; i++){
                
                let nextIdx = (i + 1) % this.#path.length;
                // context.arc(this.#path[i].x, this.#path[i].y, 2,0,Math.PI * 2);
                // context.fill();
                // context.moveTo(this.#path[i].x, this.#path[i].y);
                context.lineTo(this.#path[nextIdx].x, this.#path[nextIdx].y);
                context.stroke();
            }
            context.fill();
        }
    }
    
    get numSides() {
        return this.#path.length;
    }
    GetCorner(i){
        if(i > -1 && i < this.#path.length) {
            return new Vector2D(this.#path[i].x, this.#path[i].y)
        }
        console.log("Invalid corner index. Returning undefined")
        return undefined;
    }
    GetPerpendicularSlopeAngle(i){
        if(i > -1 && i < this.#path.length) {
            return this.#path[i].perpSlopeAngle
        }
        console.log("Invalid corner index. Returning undefined")
        return undefined;
    }
    GetSlopeAngle(i){
        if(i > -1 && i < this.#path.length) {
            return this.#path[i].slopeAngle
        }
        console.log("Invalid corner index. Returning undefined")
        return undefined;
    }

}

class WheelScene{
    #interval
    #frameRate
    #isRunning
    #context
    #box
    #wheel
    #polygon
    #time

    #pathIdx = 0 // wheel.pathIdx
    #wheelIsRolling = true // wheel.isRolling
    #wheelPointOnLine // wheel.pointOnLine
    #wheelPeriod = 3000;
    #pivotAngle
    #pivotEndAngle

    constructor(context, box, startScene = true, frameRate = 24){
        this.#context = context
        this.#box = new Box(box.x, box.y, box.w, box.h);
        this.#time = new Date(); 

        // define the wheel and polygon based on box size 

        let maxTotalRadius = Math.min(box.w, box.h) / 2;
        let polyRadius = 0.4 * maxTotalRadius;
        let wheelRadius = (maxTotalRadius - polyRadius) / 2;

        let numSides = Math.floor( Math.random() * 9 + 3)
        this.#polygon = new PolygonalPath(box.x + 0.5 * box.w, box.y + 0.5 * box.h, polyRadius, numSides);

        let numSlices = Math.floor( Math.random() * 9 + 3)
        if (numSlices % Wheel.GetColoursLength() == 1) {
            numSlices++;
        }
        this.#wheel = new Wheel(0,0,wheelRadius, numSlices);
        // position the wheel just touching its corner
        this.#wheelPointOnLine = this.#polygon.GetCorner(this.#pathIdx); 

        // offset the wheel

        this.#wheel.position = new Vector2D(
            this.#wheelPointOnLine.x + Math.cos(this.#polygon.GetPerpendicularSlopeAngle(this.#pathIdx)) * this.#wheel.radius,
            this.#wheelPointOnLine.y + Math.sin(this.#polygon.GetPerpendicularSlopeAngle(this.#pathIdx)) * this.#wheel.radius
        )
        
        this.#frameRate = frameRate;
        this.#isRunning = startScene
        if(this.#isRunning){
            this.StartScene();
        }
        
    }
    StartScene(){
		this.#isRunning = true;
		this.#time = new Date()
		this.#interval = setInterval(this.Control.bind(this), 1000/this.#frameRate)
	}
	StopScene(){
		this.#isRunning = false;
		clearInterval(this.#interval)
	}
	ToggleScene(){
		if(this.#isRunning){
			this.StopScene();
		} else {
			this.StartScene();
		}
	}

    Control() {
        // calculate change in angle since last draw 
        let newTime = new Date()
        let deltaTime = Math.abs(this.#time - newTime);
        this.#time = newTime;
    

        // move the wheel
        this.moveWheel(deltaTime)

        // draw the scene
        this.#box.Clear(this.#context);
        this.#box.Draw(this.#context);
        this.#polygon.Draw(this.#context);
        this.#wheel.Draw(this.#context);
        //this.#wheelPointOnLine.Draw(this.#context);
    }




    moveWheel(deltaTime) {
        // calculate change in angle since last draw
        let deltaAngle = deltaTime * Math.PI / this.#wheelPeriod;
        
        /** 
         * Spin Wheel
         */
        this.#wheel.rotation += deltaAngle;// * wheel.directionSign;
        
    
        // calculate movement along the line
        // calculate vector to next point
        
        while(deltaAngle > 0) {
            /**
             * Roll Wheel
             */
            
            let nextIdx = (this.#pathIdx + 1) % this.#polygon.numSides;
            
            if(this.#wheelIsRolling){
                
                // check how far the wheel will be travelling and how far it is from the next corner

                let distanceVector = this.#polygon.GetCorner(nextIdx).Minus(this.#wheelPointOnLine)
                let distanceFromEnd = Math.hypot(distanceVector.x, distanceVector.y);

                let distanceTravelling = deltaAngle * this.#wheel.radius;
    
                // only calculate calculate the wheel's new position if the wheel won't be overshooting next point
                if(distanceTravelling < distanceFromEnd) {

                    let deltaVector = new Vector2D ( 
                        distanceTravelling * Math.cos(this.#polygon.GetSlopeAngle(this.#pathIdx)),
                        distanceTravelling * Math.sin(this.#polygon.GetSlopeAngle(this.#pathIdx))
                    )
                    
                    this.#wheel.position = this.#wheel.position.Plus(deltaVector);
                    this.#wheelPointOnLine = this.#wheelPointOnLine.Plus(deltaVector);
    
                    // if in this block, you've used all deltaangle
                    deltaAngle = 0;
                } else {
                    // remove from deltaAngle however much is needed to reach the next point
                    // distance = angle * radius
                    // angle = distance / radius
                    deltaAngle -= distanceFromEnd / this.#wheel.radius;
                    
                    // switch to pivoting
                    this.#wheelIsRolling = false;
    
                    // move wheel to the next point on the line
                    this.#wheelPointOnLine = this.#polygon.GetCorner(nextIdx);
    
                    // the wheel starts pivoting at 90 degrees to the slope it's on
                    //  and ends at 90 degrees to the next slope
    
                    this.#pivotAngle = this.#polygon.GetPerpendicularSlopeAngle(this.#pathIdx);
                    this.#pivotEndAngle = this.#polygon.GetPerpendicularSlopeAngle(nextIdx);
    
                    if(this.#pivotEndAngle < 0){
                        this.#pivotEndAngle += Math.PI * 2;
                        if(this.#pivotAngle < 0){
                            this.#pivotAngle += Math.PI * 2;
                        }
                    }
    
                    this.#pathIdx = nextIdx;

                    nextIdx = (this.#pathIdx + 1) % this.#polygon.numSides;
                }
            }
    
    
            /** 
             * Pivot Wheel
             * 
             * Rotate the wheel around a point on it's edge
             */
            if(!this.#wheelIsRolling){
    
                // check whether the pivoting wheel will overshoot the ending angle of the pivot
                let targetAngle = this.#pivotAngle + deltaAngle;
                if(targetAngle < this.#pivotEndAngle )
                {

                    this.#pivotAngle += deltaAngle;
    

                    // wheel.x = path[this.#pathIdx].x + Math.cos(wheel.pivotAngle) * wheel.radius;
                    // wheel.y = path[this.#pathIdx].y + Math.sin(wheel.pivotAngle) * wheel.radius;
                    
                    deltaAngle = 0;
                } else {
                    // the wheel is done pivoting
    
                    // subtract the remaining angle to pivot from the intended change in angle
                    // calculate difference in current and end angle
                    deltaAngle -= this.#pivotEndAngle, - targetAngle

                    this.#pivotAngle = this.#pivotEndAngle;
                    // wheel.x = path[this.#pathIdx].x + Math.cos(wheel.pivotEndAngle) * wheel.radius;
                    // wheel.y = path[this.#pathIdx].y + Math.sin(wheel.pivotEndAngle) * wheel.radius;
                        
                    this.#wheelIsRolling = true;
                }
                let pivotPosition = this.#polygon.GetCorner(this.#pathIdx);
                let offsetVector = new Vector2D(
                    Math.cos(this.#pivotAngle) * this.#wheel.radius,
                    Math.sin(this.#pivotAngle) * this.#wheel.radius
                )
                this.#wheel.position = pivotPosition.Plus(offsetVector)


            }
        }
        
    }
}



export {Wheel, PolygonalPath, WheelScene};








// let canvas = document.querySelector('canvas');
// let context = canvas.getContext('2d');

// let time = new Date();
// const TwoPI = Math.PI * 2;
// const drawsPerSecond = 60;
// const redraw = true;
// const box = {
//     x: 570,
//     y: 150,
//     h: 400,
//     w: 400
// }

// const hubPolygon = {
//     x: box.w/2.0,
//     y: box.h/2.0,
//     radius: 100,
//     numSides: 6
// }


// let wheel = { // remaining here controlled by scene?
//     angleToCorner: Math.PI / 2,
//     pivotAngle: 0,
//     pivotEndAngle: 0,
//     rolling: true,
//     pathIdx: 0,
//     period: 1000,
//     pointOnLine: {
//         x:0,
//         y:0
//     },
//     directionSign: 1,
// }


// //let time = new Date();


// 




// 





