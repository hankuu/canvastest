//Size for the drawing
let padding = {
  top: 10,
  right: 40,
  bottom: 60,
  left: 100
}

//Hard coded size
//1368 = 95% of 1440 (current winW in use)
//650 just a number - fits current winH and under the h1
//TODO dynamic once this works properly
let size = {
  width: 1368 - padding.left - padding.right,
  height: 650 - padding.top - padding.bottom
}

let plotSize = {
  width: size.width + padding.left + padding.right,
  height: size.height + padding.top + padding.bottom
}

//Create canvas
let canvas = d3.select("#bottom")
.append("canvas")
.attr("width",plotSize.width) //should this be size.width?
.attr("height",plotSize.height) //should this be size.height?
//.style("border","solid black 1px")

// get context
let cx = canvas.node().getContext("2d")
//move top left inside the padding
cx.translate(padding.left, padding.top)

//Create SVG container
let svg = d3.select("#bottom")
.append("svg")
.attr("width",plotSize.width) //should this be size.width?
.attr("height",plotSize.height) //should this be size.height?
.append("g") //append group to the SVG
.attr("transform","translate("+padding.left+", "+padding.top+")") //move top left inside the padding

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
} //drawFullCircle

function renderGraph() {
  setScales();
  imdbData.forEach(function(d){
    drawFullCircle(xScale(d.rating),
          yScale(d.budget),
          rScale(d.profit_ratio),
          opScale(d.profit_ratio),
          colorScale(d.release_year))
  })

  renderAxes();
  addTitles();
}//renderGraph

//draw axes
function renderAxes() {
  let xAxis = d3.axisBottom(xScale)

  svg.append("g")
  .attr("transform","translate(0,"+size.height+")")
  .attr("class", "axis")
  .call(xAxis)


  let yAxis = d3.axisLeft(yScale)
  .tickFormat(d3.format("$.0s"))
  .ticks(5)

  svg.append("g")
  .attr("transform","translate(0,0)")
  .attr("class", "axis")
  .call(yAxis)
}//renderAxes


//add titles
function addTitles(){
    //title
    svg.append("text")
    .attr("transform", "translate("+(size.width/2)+","+(padding.top)+")")
    .text("TITLE")

    //X-axis: IMDB rating
    svg.append("text")
    .attr("transform", "translate("+(size.width/2)+","+(size.height+padding.top+30)+")")
    .text("IMDB rating")


    //Y-axis: Movie profit
    svg.append("text")
    .attr("transform", "translate(-50,"+(size.height/2)+") rotate(-90)")
    .text("Profit")

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
    renderGraph();

  });//d3.csv
}//readData

/*******************
* Scales
********************/
let xScale = null;
let yScale = null;
let rScale = null;
let opScale = null;

//Set scales
function setScales(){
  //X-axis: IMDB rating
  //round to nearest whole numbers, because ratings are decimals (1.6)
  xScale = d3.scaleLinear()
  .domain([Math.floor(d3.min(imdbData, function(d){ return d.rating})),
     Math.ceil(d3.max(imdbData, function(d){ return d.rating}))])
  // .range([0,plotSize.width])
  .range([0,size.width])

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
  // .range([plotSize.height, 0])
  .range([size.height, 0])

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
  }else{
    console.log("No need to reRead data?")
    renderGraph();
  }

}

/***********
* main
************/

init();
