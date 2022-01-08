let canvas = document.querySelector('canvas');
let context = canvas.getContext('2d');






const t_step = 0.01;

let bezBox ={
    x:50,  // x
    y:50,  // y
    w:900, // w
    h:900, // h
};

let bezPointIdx = 0;
let bezPoints = [
    {x: bezBox.x, y: bezBox.y + bezBox.h},
    {x: bezBox.x, y:bezBox.y},
    {x: bezBox.x + bezBox.w, y: bezBox.y},
    {x: bezBox.x + bezBox.w, y: bezBox.y + bezBox.h}
]

const drawBezBox = () => {
    
    if(bezPoints.length != 4) {
        console.log("There are not 4 points for the bezier curves. \nInstead, there are: " + bezPoints.length );
    }

    // draw the box
    context.beginPath();
    context.strokeStyle = "black"
    context.lineWidth = 3;
    context.rect(bezBox.x, bezBox.y, bezBox.w, bezBox.h);
    context.stroke();
    
    
    // draw the regular bezier curve
    context.beginPath();
    context.strokeStyle = "red"
    context.lineWidth = 7;
    context.moveTo(bezPoints[0].x, bezPoints[0].y);
    context.bezierCurveTo(bezPoints[1].x, bezPoints[1].y, bezPoints[2].x, bezPoints[2].y, bezPoints[3].x, bezPoints[3].y)
    context.stroke();

    // draw the alternate bezier curve
    
    // the alternate bezier always starts at p1
    context.beginPath();
    context.strokeStyle = "blue"
    context.lineWidth = 7;
    context.moveTo(bezPoints[1].x, bezPoints[1].y);
    for(t = t_step; t <= 1; t += t_step){
        let inv_t = 1 - t;

        //calculate the coefficients to multiply the set of points 0->3 by
        let coeffecients = [
            t * inv_t * inv_t,                  // p0
            (inv_t**3) + (2 * inv_t * t * t),   // p1
            (t**3) + (2 * inv_t * inv_t * t),   // p2
            t * t * inv_t                       // p3
        ]

        // calculate the next point
        let nextPoint = { x:0, y:0};
        for(let i = 0; i < bezPoints.length; i++){
            nextPoint.x += bezPoints[i].x * coeffecients[i];
            nextPoint.y += bezPoints[i].y * coeffecients[i];
        }

        context.lineTo(nextPoint.x, nextPoint.y);
    }
    context.stroke();


    // draw the points
    context.lineWidth = 1;
    context.strokeStyle = 'black'
    for(let i = 0; i < bezPoints.length; i++){
        context.beginPath();
        context.arc(bezPoints[i].x, bezPoints[i].y, 5, 0, Math.PI * 2);
        context.fill();
        context.fillText("p" + i, bezPoints[i].x + 3, bezPoints[i].y);
    }
}

const redrawBezBox = () => {
    context.beginPath();
    context.clearRect(bezBox.x, bezBox.y, bezBox.w, bezBox.h);
    
    drawBezBox();
}


drawBezBox();


canvas.addEventListener('mouseup', (event) => {
	
    if(event.clientX >= bezBox.x && event.clientX <= bezBox.x + bezBox.w 
        && event.clientY >= bezBox.y && event.clientY <= bezBox.y + bezBox.h) {

            bezPoints[bezPointIdx].x =  event.clientX;
	bezPoints[bezPointIdx].y = event.clientY;

    bezPointIdx = (bezPointIdx + 1) % bezPoints.length;

    redrawBezBox();


        }
    
    
});