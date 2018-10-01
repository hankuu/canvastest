// var winH = window.innerHeight
// var winW = window.innerWidth

//TODO get window values back. Hardcoded for testing purposes
var winH = 500
var winW = 500

d3.select(window).on('resize', resize);


//TODO fix this
 function resize() {
  // winH = window.innerHeight
  // winW = window.innerWidth

  canvas.attr("width", 1000)
  .attr("height", 500)


  //TODO draw everything back in
 }

//Properties of the square

//starting position
var x = 0;
var y = 0;

//square side length
var side = 50;

//speed
var dx = 2;
var dy = 2;

//angle and rotation speed
var ang = 1;
var dang = 1

//This function makes things move
function animate() {
    window.requestAnimationFrame(animate);
    context.clearRect(0,0, 1000, 500)

    //rotate
    context.fillStyle = "rgba(150, 248, 30, .6)"
    //move origin
    context.translate(x, y)
    //rotate
    context.rotate(ang*Math.PI / 180);
    //draw rect in the middle
    context.fillRect(-side/2, -side/2, side, side);
    //rotate back
    context.rotate(-ang*Math.PI / 180);
    //move origin back
    context.translate(-x, -y)


    //Check window left&right
    //NOTE! Does not take into account if corner happens to cross the border
    if(x > (1000-side/2) || x < side/2) {
        dx = -dx;
        dang = -dang;
      }

    //Check window top&bottom
    //NOTE! Does not take into account if corner happens to cross the border
     if(y > (500-side/2) || y < side/2) {
       dy = -dy;
       dang = -dang;
     }

     //Reset angle around 360 and
     if(ang > 360 || ang < 0) {
       ang = 0;
     }

   x += dx
   y += dy
   ang += dang
}

//Create Canvas
var canvas = d3.select("body")
  .append("canvas")
  .attr("width", 1000)
  .attr("height", 500)

//Just to see the canvas
canvas.style("border","1px solid green")

//Get context
var context = canvas.node().getContext("2d")

//make things move
animate();
