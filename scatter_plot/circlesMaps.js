let winH = window.innerHeight;
let winW = window.innerWidth;

// Modify the HTML elements
let hoo1_h = d3.select("h1").node().getBoundingClientRect().height

let hoo1 = d3.select("h1")
.style("height", hoo1_h)
.style("lineHeight", hoo1_h)

let p = d3.select("#msg")
.text("winH: "+winH+" winW: "+winW+" h1: "+hoo1_h)
////////////////////

let topper = d3.select("#top").node().getBoundingClientRect().height


let canvasHeight = winH - topper //winH-100; //taking out 100 px
let canvasWidth = winW-100; //taking out 100px just becaus




let canvas = d3.select("div")
.append("canvas")
.attr("width",canvasWidth)
.attr("height",canvasHeight)
.style("border","solid black 1px")

//context
let cx = canvas.node().getContext("2d")

/******************
* Drawing
*******************/
function drawFullCircle(x,y,r, opacity, color) {
  cx.fillStyle = color
  cx.globalAlpha = opacity
  cx.beginPath()
  cx.arc(x,y,r,0,2*Math.PI)
  cx.fill()
  cx.closePath()
}

function drawCircles() {
  setScales();
  imdbData.forEach(function(d){
    drawFullCircle(xScale(d.rating),yScale(d.budget),
    rScale(d.profit_ratio),opScale(d.profit_ratio), colorScale(d.release_year))
  })
}

/******************
* Utilities
*******************/
let imdbData = null;
function readData() {
  //imdbData = d3.csv("data/imdb-movies.csv", function(error, data){
  d3.csv("data/imdb-movies.csv", function(error, data){
    if(error) throw Error

    data.forEach(function(d){
      d.title=d.title;
      d.release_year=+d.release_year;
      d.budget=+d.budget;
      d.revenue=+d.revenue;
      d.rating=+d.rating;
      d.num_voted_users=+d.num_voted_users;
      d.profit_ratio=+d.profit_ratio

    })//forEach

    imdbData=data;
    drawCircles();

  });//d3.csv
}//readData

/*******************
* Scales
********************/
let xScale = null;
let yScale = null;
let rScale = null;
let opScale = null;
function setScales(){
  //X-axis: IMDB rating
  //round to nearest whole numbers, because ratings are decimals (1.6)
  xScale = d3.scaleLinear()
  .domain([Math.floor(d3.min(imdbData, function(d){ return d.rating})),
     Math.ceil(d3.max(imdbData, function(d){ return d.rating}))])
  .range([0,canvasWidth])

  //Y-axis: budget in USD
  //logaritmic scale: distance means 10x
  //rounding to nearest 1000 down and 100e6 up
  //I happen to know that max is 100e6 so we need to add one 100e6
  // let maxmax = Math.ceil(d3.max(imdbData, function(d){ return d.budget}))
  // if(maxmax%1e6 === 0){
  //   maxmax += 100e6
  // }
  yScale = d3.scaleLog()
  .domain([500, 700e6])
  .range([canvasHeight, 0])

  //r: profit_ratio
  // rScale = d3.scaleSqrt()
  // .domain([Math.floor(d3.min(imdbData, function(d){ return d.profit_ratio})),
  //   Math.ceil(d3.max(imdbData, function(d){ return d.profit_ratio}))])
  // .range([0, 10])
  //values copied from NB to understand the L&F
  //why 6 when max > 400? More dramatic?
  rScale = d3.scaleSqrt()
  .domain([0, 6])
  .range([0, 10])

  //opacity: larget profit_ratio -> more transparent
  //values copied from NB to understand the L&F
  //domain and data values don't match. More dramatic this way?
  opScale = d3.scaleLinear()
  .domain([0, 100])
  .range([0.2, 0.01])
  .clamp(true)

  //color: release_year
  //d3.extent finds min/max!
  colorScale = d3.scaleSequential()
  .domain(d3.extent(imdbData, function(d){return d.release_year}))
  .interpolator(d3.interpolateViridis)

} //setScales



/******************
* Initialise
*******************/
function init() {
  if(imdbData==null){
    readData();
  }

}

/***********
* main
************/

init();
