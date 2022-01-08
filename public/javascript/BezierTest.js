// https://www.particleincell.com/2013/cubic-line-intersection/

import { Box, BezierCurve, Vector2D} from "./UtilityClasses.js";


class BezierTestScene {
    #context
    #box
    #bez
    #line
    constructor(context, box){
        this.#context = context;
        this.#box = box;

        this.#bez = new BezierCurve(this.#box.topLeft, this.#box.bottomRight, this.#box.bottomLeft, this.#box.topRight);
        
        this.#line = {
            start: new Vector2D(this.#box.x + this.#box.w * Math.random(), this.#box.y),
            end: this.#box.bottomRight
        }

        this.Draw();

        let r = computeIntersections(this.#bez.points, this.#line)

        r.forEach(value => {
            this.#bez.GetPointAt_T(value).Draw(this.#context);
        });
    }
    Draw(){
        this.#box.Draw(this.#context);
        this.#bez.Draw(this.#context);

        this.#context.beginPath();
        this.#context.moveTo(this.#line.start.x, this.#line.start.y)
        this.#context.lineTo(this.#line.end.x, this.#line.end.y)
        this.#context.stroke();
    }

}



/**
 * Calculates the coefficients of a cubic function for the given coordinates.
 * @param P0 {Number}
 * @param P1 {Number}
 * @param P2 {Number}
 * @param P3 {Number}
 * @return {Array}
 * @source https://docs.sencha.com/ext/5.1.4/api/src/PathUtil.js.html
 */
function bezierCoeffs (P0, P1, P2, P3) {
    var Z = [];
    Z[0] = -P0 + 3*P1 - 3*P2 + P3;
    Z[1] = 3*P0 - 6*P1 + 3*P2;
    Z[2] = -3*P0 + 3*P1;
    Z[3] = P0;
    return Z;
}



/**
 * Calculates the points where a line intersects a curve.  
 * @param bezPoints {![Vector2D]} -- the points that define a cubic bezier curve
 * @param Line {![Vector2D]} -- Two points that describe a line
 * @return {Array} -- The t values of the points of intersection
 * @source Modified - https://www.particleincell.com/2013/cubic-line-intersection/
 */
function computeIntersections(bezPoints, line)
{

    let px = [] // an array for the x value of the bezier points
    let py = [] // ibid, but y values
    let ly = [ line.start.y, line.end.y] // x values on the line
    let lx = [line.start.x, line.end.x]

    bezPoints.forEach(point => {
        px.push(point.x);
        py.push(point.y);
    });


    var X=Array();
 
    /**
     * using two points on the line go from:
     ***  (x - x1) / (x2 - x) = (y - y1) / (y2 - y1)
     ***  to
     ***  Ax + By + C = 0
     * 
     * where:
     *** A = y2-y1
     *** B = x1-x2
     *** C = x1 * (y1-y2) + y1 * (x2-x1)
     * 
     */
    var A=ly[1]-ly[0];	    //A=y2-y1
    var B=lx[0]-lx[1];	    //B=x1-x2
    var C=lx[0]*(ly[0]-ly[1]) + 
          ly[0]*(lx[1]-lx[0]);	//C=x1*(y1-y2)+y1*(x2-x1)
 

    var bx = bezierCoeffs(px[0],px[1],px[2],px[3]);
    var by = bezierCoeffs(py[0],py[1],py[2],py[3]);
 
    var P = Array();
    P[0] = A*bx[0]+B*by[0];		/*t^3*/
    P[1] = A*bx[1]+B*by[1];		/*t^2*/
    P[2] = A*bx[2]+B*by[2];		/*t*/
    P[3] = A*bx[3]+B*by[3] + C;	/*1*/
 
    var r=cubicRoots(P);

    console.log(r)
    return r;
}


function cubicRoots(P)
{
    var a=P[0];
    var b=P[1];
    var c=P[2];
    var d=P[3];
 
    var A=b/a;
    var B=c/a;
    var C=d/a;
 
    var Q, R, D, S, T, Im;
 
    var Q = (3*B - Math.pow(A, 2))/9;
    var R = (9*A*B - 27*C - 2*Math.pow(A, 3))/54;
    var D = Math.pow(Q, 3) + Math.pow(R, 2);    // polynomial discriminant
 
    var t=Array();
 
    if (D >= 0)                                 // complex or duplicate roots
    {
        
        var S = Math.sign(R + Math.sqrt(D))*Math.pow(Math.abs(R + Math.sqrt(D)),(1/3));
        var T = Math.sign(R - Math.sqrt(D))*Math.pow(Math.abs(R - Math.sqrt(D)),(1/3));
 
        t[0] = -A/3 + (S + T);                    // real root
        t[1] = -A/3 - (S + T)/2;                  // real part of complex root
        t[2] = -A/3 - (S + T)/2;                  // real part of complex root
        Im = Math.abs(Math.sqrt(3)*(S - T)/2);    // complex part of root pair   
 
        /*discard complex roots*/
        if (Im!=0)
        {
            t[1]=-1;
            t[2]=-1;
        }
 
    }
    else                                          // distinct real roots
    {
        var th = Math.acos(R/Math.sqrt(-Math.pow(Q, 3)));
 
        t[0] = 2*Math.sqrt(-Q)*Math.cos(th/3) - A/3;
        t[1] = 2*Math.sqrt(-Q)*Math.cos((th + 2*Math.PI)/3) - A/3;
        t[2] = 2*Math.sqrt(-Q)*Math.cos((th + 4*Math.PI)/3) - A/3;
        Im = 0.0;
    }
 
    /*discard out of spec roots*/
    for (var i=0;i<3;i++) 
        if (t[i]<0 || t[i]>1.0) t[i]=-1;
 
    /*sort but place -1 at the end*/
    //t=sortSpecial(t);
 
    console.log(t[0]+" "+t[1]+" "+t[2]);

    
    return t;
}

export {BezierTestScene}