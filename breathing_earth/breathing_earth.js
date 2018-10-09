/*
  This is a remake of the Brething Earth viz by Nadieh Bremer.

  author: Hanna Kumpula
*/


//Related to canvas size
let winH = window.innerHeight;
let winW = window.innerWidth;

let h1_height = d3.select("h1").node().getBoundingClientRect().height;

//Create Canvas
const canvas = d3
  .select("body")
  .append("canvas")
  .attr("width", 2*winW)
  .attr("height", 2*(winH - 2*h1_height)) //take the twice the height of <h1> element out
  .style("width", winW+"px")
  .style("height", (winH - 2*h1_height)+"px"); //take the twice the height of <h1> element out

//Get context
const context = canvas.node().getContext("2d");

/************
 *Create scales
 *************/

const minGreenness = -0.03;
const maxGreenness = 0.81;

//Greenness scale
//This is a kind of diverging color scale with middle point defined
const greennessScale = d3.scaleLinear()
            .domain([minGreenness, 0.1, maxGreenness])
            .range(["#FAECAB", "#f2ec82", "#0c750c"]);

const opacityScale = d3.scaleLinear()
            .domain([minGreenness, maxGreenness])
            .range([1, 0.5]);


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

    //color bland
    context.globalCompositeOperation = "multiply";
    //read data
    readData();
}//init()

function drawCanvas() {
  context.fillStyle = "#20B2AA"
  context.fillRect(0, 0, canvas.node().width, canvas.node().height)
}//drawCanvas

function readData() {
  d3.json("data/greenness-map-data.json", function(error, map_data) {
    if(error) throw error

    //draw map by looping over circles
    map_data.forEach(function(d, i) {
      //console.log(d.greenness)
      context.fillStyle = greennessScale(d.greenness);
      context.globalAlpha = opacityScale(d.greenness);
    })//forEach

    //After first run move values to const
    // let max = d3.max(map_data, function(d){ return d.greenness}) //0.81
    // let min = d3.min(map_data, function(d){ return d.greenness}) //-0.03
    // console.log(max)
    // console.log(min)
  })//d3.json
}


init();
