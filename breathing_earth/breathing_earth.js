/*
This is a remake of the Brething Earth viz by Nadieh Bremer.

author: Hanna Kumpula
*/


//Get current window dimensions
//let winH = window.innerHeight;
let winW = window.innerWidth;

// Aspect ratio of (orig) mercator: 198/120=1.65
// Finnish school map: 1.97
//set Width according to window width -> find out Height
//trying 1.65: w/h=1.65 -> h=w/1.65
// Result: 1.97 fits better
const mapRatio = 1.97; //1.65;
let canvasHeight = winW/mapRatio;

//TODO: fix so that assumption does not interfere!!
//assumes that winH is larger !
//let h1_height = winH-canvasHeight;

//Adjust the h1 size according to winH and canvasHeight
//let h1_element = d3.select("h1")
//.attr("height", 200)
//.style("height", h1_height+"px")
//.style("lineHeight", h1_height+"px")


//Create Canvas
const canvas = d3
.select("body")
.append("canvas")
.attr("width", winW)
.attr("height", canvasHeight) //take the twice the height of <h1> element out
//TODO: retina crisp doesn't work?
// .attr("width", 2*winW)
// .attr("height", 2*canvasHeight) //take the twice the height of <h1> element out
// .style("width", winW+"px")
// .style("height", canvasHeight+"px"); //take the twice the height of <h1> element out

// console.log(winH)
// console.log(h1_height)
// console.log(winH-2*h1_height)
// console.log(canvas.node().height)

//Get context
const context = canvas.node().getContext("2d");
//context.scale(2,2)


//React to window resizing
d3.select(window).on("resize", resize);


/************
*Create scales
*************/

const minGreenness = 0; //-0.03;
const maxGreenness = 0.81;

//Greenness scale
//This is a kind of diverging color scale with middle color defined
const greennessScale = d3.scaleLinear()
.domain([minGreenness, 0.1, maxGreenness])
.range(["#FAECAB", "#F2EC82", "#0C750C"]);

//Opacity scale
//so map min value to opacity of 1 and max to 0.5
const opacityScale = d3.scaleLinear()
.domain([minGreenness, maxGreenness])
.range([1, 0.5]);

//Radii of the circles
//scaleSqrt : y = m*x^0.5+b
//useful for circles, because doubling inserted value then doubles the circle by size.
//and it's better to set the circles' area proportionally than the radius
const radiusScale = d3.scaleSqrt()
.domain([minGreenness, maxGreenness])
.range([0, 2.5])
.clamp(true) //The end values are the end values

//scale for x-axis
//domain values from the first time run
const xScale = d3.scaleLinear()
.domain([1,501])
.range([0,canvas.node().width])

//scale for y-axis
//domain values from the first time run
//map y the other way!
const yScale = d3.scaleLinear()
.domain([1,251])
.range([canvas.node().height,0])

/*******************
* Utility functions
********************/

//React to resized window
//TODO calculates only according to width change. Not working properly
function resize() {
  //  winH = window.innerHeight;
  winW = window.innerWidth;
  canvasHeight = winW/mapRatio;

  //TODO: Fix so that assumption does not interfere
  //Assumes that winH > canvasHeight
  //Adjust the h1 size according to winH and canvasHeight
  //  h1_element = d3.select("h1")
  //.attr("height", 200)
  // .style("height", (winH-canvasHeight)+"px")
  // .style("lineHeight", (winH-canvasHeight)+"px")


  canvas.attr("width", winW)
  .attr("height", canvasHeight); //take the twice the height of <h1> element out
  // .attr("height", winH - 2*h1_height); //take the twice the height of <h1> element out

  //Initialize again
  init();
} // resize()

/*
Draw canvas
*/
function drawCanvas() {
  context.fillStyle = "#BFE9E6"
  context.fillRect(0, 0, canvas.node().width, canvas.node().height)
}//drawCanvas

//Draw full circle
function drawFullCircle(x, y, greenness){
  context.fillStyle = greennessScale(greenness);
  //globalAlpha is a global transparency setting
  context.globalAlpha = opacityScale(greenness);
  //Circle radius according to greenness as well
  let r = radiusScale(greenness);
  //Draw the circle and fill it
  context.beginPath()
  context.arc(xScale(x), yScale(y), r, 0, 2*Math.PI)
  context.closePath()
  context.fill()
}

/*
Read data and set scales
TODO: extract drawCircle
*/
function readData() {
  d3.json("data/greenness-map-data.json", function(error, map_data) {
    if(error) throw error

    //draw map by looping over circles
    map_data.forEach(function(d, i) {
      // context.fillStyle = greennessScale(d.greenness);
      // //globalAlpha is a global transparency setting
      // context.globalAlpha = opacityScale(d.greenness);
      // //Circle radius according to greenness as well
      // let r = radiusScale(d.greenness);
      // //Draw the circle and fill it
      // context.beginPath()
      // context.arc(xScale(d.x), yScale(d.y), r, 0, 2*Math.PI)
      // context.closePath()
      // context.fill()
      d.x=+d.x;
      d.y=+d.y;
      d.greenness=+d.greenness;
      drawFullCircle(d.x, d.y, d.greenness)
    })//forEach

    //After first run move values to const
    // let maxX = d3.max(map_data, function(d){ return d.x}) //501
    // let minX = d3.min(map_data, function(d){ return d.x}) //1
    // let maxY = d3.max(map_data, function(d){ return d.y}) //251
    // let minY = d3.min(map_data, function(d){ return d.y}) //1
    // let maxG = d3.max(map_data, function(d){ return d.greenness}) //0.81
    // let minG = d3.min(map_data, function(d){ return d.greenness}) //-0.03
    // console.log("x: "+minX+" - "+maxX)
    // console.log("y: "+minY+" - "+maxY)
    // console.log("greenness: "+minG+" - "+maxG)
  })//d3.json
}



/*******************
* Initialize
********************/
function init() {
  //Draw canvas first
  drawCanvas();

  //color blend
  context.globalCompositeOperation = "multiply";

  //read data and draw circles
  readData();
}//init()

/* Main */
init();
