import {Box, BezierCurve, Vector2D} from './UtilityClasses.js';
import {BezierFunctions} from "./BezierFunctions.js";

/**
 * A class that describes a cowfriend.
 */
class CowFriend {
    #bodyRadius;
    #legRadius;
    #footAngle;
    #moseyAngle;
    #footBodyDistance;
    #footPosition;
    #footLegDistance;
    #target;
    #direction;
    #maxMoseyAngle = Math.PI /12;
    #moseyDirection = 1;
    #speed = 20.0; // units per second
    #moseyRate = Math.PI / 7;

    /**
     * Create a cowfriend
     * @param {Number} footX The x coordinate of the point directly between the feet
     * @param {Number} footY The y coordinate of the point directly between the feet
     * @param {Number} bodyRadius The radius of the circle that describes the cowfriend's tophalf
     * @param {Number} legRadius the radius of the two arc that make up the legs
     * @param {Number} footAngle in radians, the angle added to the semi-circle of the legs
     * @param {Vector2D} target the coordinates of this cowfriend's destination
     * @param {Number} moseyAngle in radians, how tilted the cowfriend is at creation\
     */
    constructor(footX,footY,bodyRadius,legRadius,footAngle, target, moseyAngle = 0){
        this.#footPosition = {
            x: footX,
            y: footY
        }
        this.#bodyRadius = bodyRadius;
        this.#legRadius = legRadius;
        this.#footAngle = footAngle;
        this.#moseyAngle = moseyAngle;

        
        this.SetTarget(target);

        // randomly assign the distance between the leg and body circle centers
        this.#footLegDistance = Math.sin(footAngle) * legRadius //+ this.#bodyRadius - Math.sin(footAngle) * legRadius;    
            
        let legBodyDistance =  (legRadius < bodyRadius) ? this.#bodyRadius + legRadius * Math.random()
                                                        : this.#legRadius + this.#footLegDistance - this.#bodyRadius * Math.random();   //(legRadius - this.#footLegDistance) + Math.random() * legRadius;
        this.#footBodyDistance = this.#footLegDistance + legBodyDistance;

        //console.log("foot to leg: ", this.#footLegDistance ,"\nleg to body: ",legBodyDistance, "\nfoot to body: ",this.#footBodyDistance )
    }

    TiltMosey(deltaTime) {
        let deltaAngle = deltaTime * this.#moseyRate / 1000.0;
        deltaAngle *= this.#moseyDirection;
        // with a big enough delta this could shoot the mosey from one extreme to PAST the other
        if(Math.abs(this.#moseyAngle + deltaAngle) > this.#maxMoseyAngle ){
            let diff = (this.#maxMoseyAngle * this.#moseyDirection) - this.#moseyAngle;
            deltaAngle = deltaAngle - diff;
            this.#moseyAngle = (this.#maxMoseyAngle * this.#moseyDirection) - deltaAngle;
            this.#moseyDirection *= -1;
        } else {
            this.#moseyAngle += deltaAngle;
        }
    }

    Draw(context) {
        

        let moseySin = Math.sin(this.#moseyAngle);
        let moseyCos = Math.cos(this.#moseyAngle);

        // calculate center of the legs arc based on the mosey angle 
        let legsCenter = {
            x: this.#footPosition.x + moseySin * this.#footLegDistance,
            y: this.#footPosition.y - moseyCos * this.#footLegDistance
        }


        context.save();

        context.strokeStyle = "red"
        
        context.lineWidth = 3 // + Math.random() * this.#legRadius/2

        context.beginPath()
        context.arc(legsCenter.x, legsCenter.y, this.#legRadius, Math.PI - this.#footAngle + this.#moseyAngle, this.#footAngle + this.#moseyAngle);
        context.stroke();


        // /** draw body */ 
        context.strokeStyle = "black"
        context.fillStyle = "purple"
        context.beginPath();
        context.arc(this.#footPosition.x + moseySin * this.#footBodyDistance, this.#footPosition.y - moseyCos * this.#footBodyDistance, this.#bodyRadius, 0, Math.PI * 2);
        context.stroke();
        context.fill();


        context.restore();
    }

    SetTarget(point) {
        // set the cowfriend's target
        this.#target = {
            x: point.x,
            y: point.y
        }
        
        // calculate the normalized vector that describes the cowfriend's direction 
        this.#direction = {
            x: this.#target.x - this.#footPosition.x,
            y: this.#target.y - this.#footPosition.y
        }

        let magnitude = Math.hypot( this.#direction.x, this.#direction.y);

        this.#direction.x /= magnitude;
        this.#direction.y /= magnitude;

    }
    MoveTowardsTarget(deltaTime) {
        if(this.#direction !=  undefined){
            let movement = deltaTime * this.#speed / 1000.0; 
            if(this.#target!= undefined && movement > Math.hypot(this.#target.x - this.#footPosition.x, this.#target.y - this.#footPosition.y)) {
                this.#footPosition.x = this.#target.x;
                this.#footPosition.y = this.#target.y; 

                return true;
            } else {
                this.#footPosition.x += this.#direction.x * movement;
                this.#footPosition.y += this.#direction.y * movement;
            }    
        } else {
            console.log("undefined target for: ", this);
        }
    }

    /**
     * Getters
     */
    get direction() {
        return new Vector2D(this.#direction.x, this.#direction.y);
    }

    get x() {
        return this.#footPosition.x;
    }

    get y() {
        return this.#footPosition.y;
    }
    get roughHeight() {
        return (this.#bodyRadius * 2) + (this.#legRadius * 2);
    }

}

/**
 * A class that descrbes a scene of cowfolk moseying up a hill towards sunset.
 */
class CowfolkScene {
    #interval
    #isRunning
    #frameRate
    #ascendingCowfolk = [];
    #descendingCowfolk = [];
    #box
    #birthRate
    #maxCowfolk
    #hillCurve
    #time = new Date();
    #birthTimer = 0;
    #context

    constructor(context, box, maxCowfolk = 30, birthRate = 500, startScene = true, frameRate = 24.0){

        this.#box = new Box(box.x,box.y,box.w,box.h);
        this.#maxCowfolk = maxCowfolk;
        this.#birthRate = birthRate;
        this.#context = context;
        this.#frameRate = frameRate;

        // define the hill as a bezier curve
        
        let middleXValue = (this.#box.topRight.x - this.#box.topLeft.x) / 2
        
        
        let startPoint = Vector2D.RandomPointBetween(this.#box.topLeft, this.#box.bottomLeft);
        let endPoint = Vector2D.RandomPointBetween(this.#box.topRight, this.#box.bottomRight)
        
        let controlPointOne = new Vector2D(this.#box.x + middleXValue * Math.random(), this.#box.y + this.#box.h * Math.random())
        let controlPointTwo = new Vector2D(this.#box.x + this.#box.w - middleXValue * Math.random(), this.#box.y + this.#box.h * Math.random())
        
        this.#hillCurve = new BezierCurve(startPoint, controlPointOne, controlPointTwo, endPoint);
        
        
        // place the first of the cowfolk in the scene
        //this.#ascendingCowfolk.push(this.#CreateRandomCowfriend());
        
        this.#isRunning = startScene
        if(this.#isRunning){
            this.StartScene(this.#frameRate);
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
    #CreateRandomCowfriend = () => {
        // build the details of the cowfriend
        let bodyRadius = 1 + Math.random() * 20
        let legRadius = bodyRadius * (0.5 + Math.random());
        let footAngle = (Math.PI/10) + Math.random() * Math.PI / 3;
    
        // decide the path for the cowfriend 
        // start anywhere on the bottom of the box
        // let startPoint = this.#box.bottomRight.Minus(new Vector2D(0,50))//Vector2D.RandomPointBetween(this.#box.bottomLeft, this.#box.bottomRight);
        let startPoint = Vector2D.RandomPointBetween(this.#box.bottomLeft, this.#box.bottomRight);

        // start with a target point on the top of the box 
        let targetPoint = Vector2D.RandomPointBetween(this.#box.topLeft, this.#box.topRight);
        
        // find the closest point where the line from  start to target intersects the hill

        let intersections =  BezierFunctions.computeIntersections(this.#hillCurve, {start: startPoint, end:targetPoint})
        // let intersections =  BezierFunctions.computeIntersections(this.#hillCurve, {start: this.#box.bottomRight, end:this.#box.topLeft})
        //console.log(intersections);
        let t_count = 0;
        intersections.forEach(tValue => {
            if(tValue >= 0 && tValue <= 1){
                targetPoint = this.#hillCurve.GetPointAt_T(tValue);
                t_count++;
            }
        })

        if(t_count > 1) {
            console.log(intersections);
        }


        return new CowFriend(startPoint.x, startPoint.y, bodyRadius, legRadius, footAngle, targetPoint);
    }

    Control () {
        // update the clock and calculate delta time
        let newTime = new Date();
        let deltaTime = newTime - this.#time;
        this.#time = newTime;
        this.#birthTimer += deltaTime;
    
    
        // add new cowfolk
        while(this.#birthTimer >= this.#birthRate){
            if( this.#ascendingCowfolk.length + this.#descendingCowfolk.length < this.#maxCowfolk){
                this.#ascendingCowfolk.push(this.#CreateRandomCowfriend());
                this.#birthTimer -= this.#birthRate;
            } else {
                this.#birthTimer = 0;
            }
            
        }
    
        /**
         * Move The Cowfolk
         */
    
         this.MoveCowfolk(deltaTime)
    
         /** 
          * Draw The scene
          */
         this.Draw();
    }
    
    Draw(){
    
        this.#context.save()
        
        this.#box.Clear(this.#context);
        
        
        this.#box.Draw(this.#context);
        this.#context.clip();
    
        // draw the sky
        this.#context.fillStyle="blue";
        this.#context.beginPath();
        this.#hillCurve.CreateCurve(this.#context);
        this.#context.lineTo(this.#box.topRight.x, this.#box.topRight.y);
        this.#context.lineTo(this.#box.topLeft.x, this.#box.topLeft.y);
        this.#context.fill();
    
        // draw the descending cowfolk
        let context = this.#context;
        this.#descendingCowfolk.forEach(cowfriend => {
            cowfriend.Draw(this.#context);
        })
        // draw the hill
        this.#context.beginPath();
        this.#context.fillStyle="green";
        this.#hillCurve.CreateCurve(this.#context);
        this.#context.lineTo(this.#box.bottomRight.x, this.#box.bottomRight.y);
        this.#context.lineTo(this.#box.bottomLeft.x, this.#box.bottomLeft.y);
        this.#context.fill();
    
        // draw the climbing cowfolk
        this.#ascendingCowfolk.forEach(cowfriend => {
            cowfriend.Draw(this.#context);
        })
        
        this.#context.restore();
    }

    MoveCowfolk(deltaTime){

        let crestingCowfolk = [];
    
        // move the cowfolk who are climbing
        for(let i = 0; i < this.#ascendingCowfolk.length;){
            // mosey the cowfolk
            this.#ascendingCowfolk[i].TiltMosey(deltaTime);
    
            // move the cowfolk and check that it reaches its target
            if( this.#ascendingCowfolk[i].MoveTowardsTarget(deltaTime))
            {
                CrestCowFriend(this.#ascendingCowfolk[i], this.#box);
                crestingCowfolk.push(this.#ascendingCowfolk[i]);
                this.#ascendingCowfolk.splice(i,1);
    
            } else {
                i++;
            }
        }
    
        // move the descending cowfolk
        for(let i = 0; i < this.#descendingCowfolk.length; ){
            this.#descendingCowfolk[i].TiltMosey(deltaTime);
            if(this.#descendingCowfolk[i].MoveTowardsTarget(deltaTime)){
                this.#descendingCowfolk.splice(i,1);
            } else {
                i++;
            }
        }
    
        // add the cowfolk that crested to the array of descending cowfolk
        crestingCowfolk.forEach(cowfriend => {
            this.#descendingCowfolk.push(cowfriend)
        });    
    }
}

/**
 * Function Definitions
 */
const CrestCowFriend = (cowfriend, cowBox) => {
    let dir = cowfriend.direction;
    
    dir.x *= -1;
    dir.y *= -1;

    let dirAngle = Math.atan(dir.y/dir.x);

    let vertDist = cowBox.bottom - cowfriend.y + cowfriend.roughHeight;
    
    let horDist = vertDist / Math.tan(dirAngle) ;

    let newTarget = {
        x: cowfriend.x + horDist,
        y: cowfriend.y + vertDist
    }


    cowfriend.SetTarget(newTarget);
    

//    console.log(cowfriend.direction);
}


export {CowfolkScene}