class Vector2D{
    /**
     * Create a point with coordinates (x,y)
     * @param {Number} x
     * @param {Number} y
     */
    constructor(x,y){
        this.x = x;
        this.y = y
    }
    get magnitude() {
        return Math.hypot(this.x, this.y);
    }
    get normal() {
        let mag = this.magnitude;
        return new Vector2D(this.x/mag, this.y/mag );
    }

    Draw(context){
        context.save();

        context.fillStyle = "black";
        context.beginPath();
        context.arc(this.x, this.y, 3, 0, Math.PI *2);
        context.fill();

        context.restore();
    }

    /**
     * return the sum of the given point and this point. Does not change this point.
     * @param {Vector2D} point
     */
    Plus(point) {
        return new Vector2D(this.x + point.x, this.y + point.y);
    }

    /**
     * return the value of the given point subtracted from this point. Does not change this point.
     * @param {Vector2D} point
     */
    Minus(point) {
        return new Vector2D(this.x - point.x, this.y - point.y)
    }

    /**
     * multiply this point by a coefficient
     * @param {Number} coefficient
     */
    MultiplyBy(coefficient) {
        return new Vector2D(this.x * coefficient, this.y * coefficient);
    }

    /**
     * return a random point on a line between the two given points
     * @param {Vector2D} point1
     * @param {Vector2D} point2
     */
    static RandomPointBetween(point1, point2){
        return point1.Plus( point2.Minus(point1).MultiplyBy(Math.random()))
    }
}


class BezierCurve {
    #startPt;
    #ctrlPts;
    #endPoint;
    #points;
    
    /**
     * Create a box with coordinates (x,y) and 
     * dimensions of w by h
     * @param {Vector2D} startPt
     * @param {Vector2D} controlPt1
     * @param {Vector2D} controlPt2
     * @param {Vector2D} endPoint
     */
     constructor(startPt,controlPt1,controlPt2,endPoint) {
        this.#startPt = startPt;
        this.#ctrlPts = [
            controlPt1,
            controlPt2
        ]
        this.#endPoint = endPoint;
        

    }

    GetPointAt_T(t) {
        // calculate the coeffecients for each control point
        let startCoefficient = -(t**3) + 3 * (t**2) - 3*t + 1;
        let ctrlPntCoefficients = [
            3*(t**3) - 6*(t**2) + 3*t,
            -3*(t**3) + 3*(t**2)
        ]
        let endPointCoeffecient = t**3
        
        let point = this.#startPt.MultiplyBy(startCoefficient);
        point = point.Plus(this.#ctrlPts[0].MultiplyBy(ctrlPntCoefficients[0]));
        point = point.Plus(this.#ctrlPts[1].MultiplyBy(ctrlPntCoefficients[1]));
        point = point.Plus(this.#endPoint.MultiplyBy(endPointCoeffecient))

        return point;

    }
    Draw(context){
        context.save();

        context.beginPath();
        context.strokeStyle = "red"
        context.lineWidth = 7;
        context.moveTo(this.#startPt.x, this.#startPt.y);
        context.bezierCurveTo(this.#ctrlPts[0].x, this.#ctrlPts[0].y, this.#ctrlPts[1].x, this.#ctrlPts[1].y, this.#endPoint.x, this.#endPoint.y)
        context.stroke();
        //context.fill();
        context.restore();
    }

    CreateCurve(context){
        context.moveTo(this.#startPt.x, this.#startPt.y);
        context.bezierCurveTo(this.#ctrlPts[0].x, this.#ctrlPts[0].y, this.#ctrlPts[1].x, this.#ctrlPts[1].y, this.#endPoint.x, this.#endPoint.y)
    }

    get startPoint() {
        return new Vector2D(this.#startPt.x, this.#startPt.y);
    }
    get points() {
        return [this.#startPt, this.#ctrlPts[0], this.#ctrlPts[1], this.#endPoint,]
    }
}

class Box {
    /**
     * Create a box with coordinates (x,y) and 
     * dimensions of w by h
     * @param {Number} x
     * @param {Number} y
     * @param {Number} w
     * @param {Number} h
     * @param {Number} margin
     */
    constructor(x,y,w,h, margin = 10) {
        this.x = x;
        this.y = y;
        this.h = h;
        this.w = w;
        this.margin = margin;
    }

    get topLeft() {
        return new Vector2D(this.x, this.y);
    }
    get topRight() {
        return new Vector2D(this.x + this.w, this.y);
    }
    get bottomLeft() {
        return new Vector2D(this.x, this.y + this.h);
    }
    get bottomRight(){
        return new Vector2D(this.x + this.w, this.y + this.h)
    }

    get bottom(){
        return this.y + this.h;
    }
    get top(){
        return this.y;
    }
    get left() {
        return this.x;
    }
    get right() { 
        return this.x + this.w;
    }


    Draw(context){
        context.save()

        context.beginPath();
        context.strokeStyle = "black"
        context.lineWidth = 1;
        context.rect(this.x, this.y, this.w, this.h);
        context.stroke();
        
        context.restore();
    }

    Clear(context){
        context.beginPath();
        context.clearRect(this.x, this.y, this.w , this.h);
    }

    ClearWithMargin(context) {
        context.beginPath();
        context.clearRect(this.x -  this.margin, this.y -  this.margin, cowBox.w +  this.margin*2, cowBox.h + this.margin*2);
    }
}

export {Box, BezierCurve, Vector2D}