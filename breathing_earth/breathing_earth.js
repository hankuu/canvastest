/*
  This is a remake of the Brething Earth viz by Nadieh Bremer.

  author: Hanna Kumpula
*/


//Related to canvas size
let winH = window.innerHeight;
let winW = window.innerWidth;

var h1_height = d3.select("h1").node().getBoundingClientRect().height;

//Create Canvas
const canvas = d3
  .select("body")
  .append("canvas")
  .attr("width", winW)
  .attr("height", winH - 2*h1_height); //take the twice the height of <h1> element out

//Get context
const context = canvas.node().getContext("2d");

//React to window resizing
d3.select(window).on("resize", resize);

//React to resized window
function resize() {
  winH = window.innerHeight;
  winW = window.innerWidth;

  var h1_height = d3.select("h1").node().getBoundingClientRect().height;

  canvas.attr("width", winW)
    .attr("height", winH - 2*h1_height); //take the twice the height of <h1> element out

  //Initialize
  init();
} // resize()

function init() {
    drawCanvas();
}//init()

function drawCanvas() {
  console.log("drawCanvas")
  fillStyle = "#20B2AA"
  fillRect(0, 0, canvas.node().width, canvas.node().height)
}//drawCanvas

init();
