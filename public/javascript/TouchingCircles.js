import {Box} from './UtilityClasses.js'

let mouse = {
    x:window.innerWidth / 2,
    y:window.innerHeight / 2
}

document.addEventListener('mousemove', (event) => {
	mouse.x = event.clientX;
	mouse.y = event.clientY;
});

class TouchingCirclesScene {
    #isRunning
    #interval
    #frameRate
    #box
    #context
    #semiCircle = {
        radius: 0,
        x:0,
        y:0
    }
    #quarterCircleRadius = 0
    constructor(context, box, startScene = true, frameRate = 24.0){
        this.#context = context
        this.#box = new Box(box.x,box.y,box.w,box.h)
        this.#frameRate = frameRate;


        this.#semiCircle.y = this.#box.top;

        this.#isRunning = startScene
        if(this.#isRunning){
            this.StartScene(this.#frameRate);
        }
        
    }
    StartScene(){
		this.#isRunning = true;
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

    Control(){
        this.UpdateCircles();
        this.Draw();
    }

    UpdateCircles(){


        // determine the center of the semicircle and calculate its max radius
        this.#semiCircle.x = (mouse.x / window.innerWidth * this.#box.w) + this.#box.left;
	    
        let maxRadius = mouse.y / window.innerHeight * this.#box.h;
        
        // find the actual radius for the semi-circle
        // start by finding the closest edge other than the top 
        let distanceToClosestEdge = Math.min(this.#semiCircle.x - this.#box.left, this.#box.right - this.#semiCircle.x, this.#box.bottom - this.#semiCircle.y) 
        if(distanceToClosestEdge < 0) {
            distanceToClosestEdge = 0
        }
        // if the closest edge is closer than the maxRadius, use that distance as the actual radius
        this.#semiCircle.radius = Math.min(maxRadius, distanceToClosestEdge)
        
        // calculate the radius of the quarter circle by finding distance between the circle
        // segment centers and subtracting the semi-circle radius
        this.#quarterCircleRadius = Math.hypot(this.#box.h, this.#box.right - this.#semiCircle.x) - this.#semiCircle.radius;
    }

    Draw(){

        this.#context.save();
    
        // draw the rectangle
        this.#context.lineStyle = "black";

        this.#box.Clear(this.#context);
        this.#box.Draw(this.#context);
        // Clip any drawing outside the box
        this.#context.clip();
        
        // draw the semi circle
        this.#context.fillStyle = "#1e81b0";
        this.#context.beginPath();
        this.#context.arc(this.#semiCircle.x, this.#semiCircle.y, this.#semiCircle.radius, 0, Math.PI);
        this.#context.fill();

        // draw the quarter circle
        this.#context.fillStyle = "#e28743";
        this.#context.beginPath();
        this.#context.arc(this.#box.right, this.#box.bottom, this.#quarterCircleRadius, Math.PI, 1.5*Math.PI);
        this.#context.lineTo(this.#box.right, this.#box.bottom)
        this.#context.fill();
    
        this.#context.restore();    
    }
}



export {TouchingCirclesScene};