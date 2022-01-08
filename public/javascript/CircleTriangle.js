import {Box} from './UtilityClasses.js'

const DEFAULT_FRAME_RATE = 24

let mouse = {
	x:0,
	y:0,
	prev_X:0,
	prev_Y:0
};

document.addEventListener('mousemove', (event) => {
	mouse.x = event.clientX;
	mouse.y = event.clientY;
});



class CircleTriangleScene {
	#context
	#box
	#circle
	#time
	#triangle
	#interval
	#isRunning
	constructor(context, box, startScene = true, frameRate = DEFAULT_FRAME_RATE){
		this.#context = context;
		this.#box = new Box(box.x, box.y, box.w, box.h);
		this.#time = new Date()
		// setup the circle inside the box
		this.#circle = {
			radius: Math.min(box.h, box.w) * 0.3,
			angle: Math.PI * 2 * Math.random(),
			period: 5000,
			x: this.#box.x + (this.#box.w / 2.0),
			y: this.#box.y + (this.#box.h / 2.0)
		}
		this.#triangle = []

		this.#isRunning = startScene
		if(startScene){
			this.StartScene(frameRate);
		}
		
	}
	StartScene(frameRate = DEFAULT_FRAME_RATE){
		this.#isRunning = true;
		this.#time = new Date()
		this.#interval = setInterval(this.Control.bind(this), 1000/frameRate)
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
		this.Update();
		this.Draw();
	}
	Update(){
		let newTime = new Date();
		let deltaTime = newTime - this.#time;
		this.#time = newTime;
	
		// Update Circle
		// calculate the new angle from the circle center to the edge point
		this.#circle.angle += Math.PI * 2 * deltaTime / this.#circle.period ; 
		while (this.#circle.angle >= Math.PI * 2) {
			this.#circle.angle -= Math.PI * 2;
		}

		// move the circle based on the mouse's position in the window.
		this.#circle.x = this.#box.x + this.#circle.radius + (this.#box.w - 2*this.#circle.radius)*(mouse.x / window.innerWidth) 
		this.#circle.y = this.#box.y + this.#circle.radius + (this.#box.h - 2*this.#circle.radius)*(mouse.y / window.innerHeight)

		
		// calculate the point on the circle that will serve as the base for the tangent triangle
		let edgePoint = {
			x: this.#circle.x + Math.cos(this.#circle.angle) * this.#circle.radius,
			y: this.#circle.y + Math.sin(this.#circle.angle) * this.#circle.radius
		}
	
	
		// calculate the lines needed to find the triangle points
	
		// finding the for a simple y = mx + b linear equation that represents the line 
		// extending from the circle center through the edgepoint to a single wall
		
		let slope = Math.tan(this.#circle.angle); // tan approaches infinty at pi/2 & 3pi/2, but still works
		let yIntercept = this.#circle.y - slope * this.#circle.x;
	
		// this is the equation for the line tangent to the circle
		let inverseSlope = -1.0 / slope;
		let inverseY_Intercept = edgePoint.y - inverseSlope * edgePoint.x;
	

		this.#triangle = [];
		
		

		// find the first point of the triangle directly on the line extending past the edge point
		if(edgePoint.x > this.#circle.x) {
			this.#PushVerticalWallIntercept(slope, yIntercept, this.#box.right); // right
		} else if( edgePoint.x != this.#circle.x) {
			this.#PushVerticalWallIntercept(slope, yIntercept, this.#box.left); // left
		}
		if(edgePoint.y > this.#circle.y) {
			
			this.#PushHorizontalWallIntercept(slope, yIntercept, this.#box.bottom); //bottom
		} else {
			this.#PushHorizontalWallIntercept(slope, yIntercept, this.#box.top); //top
		}

		// find the next two points of the triangle on the line tangent to the edgepoint
		this.#PushVerticalWallIntercept(inverseSlope, inverseY_Intercept, this.#box.right); // right
		this.#PushHorizontalWallIntercept(inverseSlope, inverseY_Intercept, this.#box.bottom); //bottom
		this.#PushVerticalWallIntercept(inverseSlope, inverseY_Intercept, this.#box.left); // left
		this.#PushHorizontalWallIntercept(inverseSlope, inverseY_Intercept, this.#box.top); //top
		
	}
	Draw(){
		this.#context.save();
		

		this.#box.Clear(this.#context);

		// Draw the Box
		this.#context.beginPath();
		this.#context.fillStyle = "#4a4e4d";
		this.#box.Draw(this.#context)
		//this.#context.fill();
		this.#context.clip() // nothing should be drawn outside the box
	
		
	
		// draw Circle
		this.#context.beginPath();
		this.#context.fillStyle = "#f6cd61";
		this.#context.arc(this.#circle.x, this.#circle.y, this.#circle.radius, 0, Math.PI * 2);
		this.#context.fill();
		// draw center dot
		
		// draw triangle
		if(this.#triangle.length == 3) {
			this.#context.beginPath();
			this.#context.moveTo(this.#triangle[2].x, this.#triangle[2].y);
			this.#triangle.forEach(point => this.#context.lineTo(point.x, point.y))
			this.#context.fillStyle = '#3da4ab';
			this.#context.fill();
			//this.#context.fill();
		}
		this.#context.restore();		
	}
	#PushVerticalWallIntercept(slope, yIntercept, wallX) {
		//pushVerticalInterceptInRange(inverseSlope, inverseY_Intercept, this.#box.right, this.#box.top, this.#box.bottom, this.#triangle); // right
		let y_value =  slope * (wallX) + yIntercept;
		if(y_value >= this.#box.top && y_value <= this.#box.bottom){
			this.#triangle.push({
				x: wallX,
				y: y_value
			})
		}
	}
	
	#PushHorizontalWallIntercept(slope, yIntercept, wallY, min, max, pointsArray){
		
		let x_value = (wallY - yIntercept) / slope;
		if(x_value >= this.#box.left && x_value <= this.#box.right){
			this.#triangle.push({
				x: x_value,
				y: wallY
			})
		}
	}
	get isRunning(){
		return this.#isRunning;
	}
}

export {CircleTriangleScene};