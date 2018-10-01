//https://lyondataviz.github.io/teaching/lyon1-m2/2017/pdfs/2_D3_intro.pdf
var winH = window.innerHeight
var winW = window.innerWidth

d3.select(window).on('resize', resize);

function resize() {
  winH = window.innerHeight
  winW = window.innerWidth

  canvas.attr("width", winW)
  .attr("height", winH)

  //TODO draw everything back in
}

var x = 200;
var y = 200;
var side = 100;
var dx = 5;
var dy = 5;
function animate() {
    window.requestAnimationFrame(animate);
    context.clearRect(0,0, winW, winH)

    context.fillStyle = "rgba(150, 248, 30, .6)"
    context.fillRect(x, y, side, side);

    //Check window left&right
    if(x > (winW-side) || x < 0) {
      dx = -dx;
    }

    //Check window top&bottom
    if(y > (winH-side) || y < 0) {
      dy = -dy;
    }

    x += dx
    y += dy
}

//Create Canvas
var canvas = d3.select("body")
  .append("canvas")
  .attr("width", winW)
  .attr("height", winH)

//Test style
//canvas.style("border","20px solid green")

//Get context
var context = canvas.node().getContext("2d")

//Define fill color
//context.fillStyle = "rgba(150, 248, 30, .6)"

//for (var i=0; i < 10; i++) {
  //context.fillRect(10,10,100,100)
//}
animate();
