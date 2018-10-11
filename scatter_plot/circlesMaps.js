let winH = window.innerHeight;
let winW = window.innerWidth;

let canvasHeight = winH-100; //taking out 100 px
let canvasWidth = winW;


let canvas = d3.select("body")
.append("canvas")
.attr("width",canvasWidth)
.attr("height",canvasHeight)

//context
let cx = canvas.node().getContext("2d")

// function piirraYmpyra(x,y,r) {
//   cx.beginPath()
//   cx.arc(x,y,r,0,2*Math.PI)
//   cx.fill()
//   cx.closePath()
// }

/******************
* Utilities
*******************/
let imdbData = null;
function readData() {
  imdbData = d3.csv("data/imdb-movies.csv", function(error, data){
    if(error) throw Error

    data.forEach(function(d){
      d.title=d.title;
      d.release_year=+d.release_year;
      d.budget=+d.budget;
      d.revenue=+d.revenue;
      d.rating=+d.rating;
      d.num_voted_users=+d.num_voted_users;
      d.profit_ratio=+d.profit_ratio

      cx.fillStyle = "black"
      cx.beginPath()
      cx.arc(xScale(d.rating), yScale(d.budget), 2, 0, 2*Math.PI)
      cx.closePath()
      cx.fill()

    })//forEach



    //minmax
    // let max = d3.max(data, function(d){ return d.release_year}) //2016
    // let min = d3.min(data, function(d){ return d.release_year}) //1929
    // console.log("release_year min: "+min+" max: "+max)
    // max = d3.max(data, function(d){ return d.budget}) //600000000
    // min = d3.min(data, function(d){ return d.budget}) //1100
    // console.log("budget min: "+min+" max: "+max)
    // max = d3.max(data, function(d){ return d.rating}) //9.3
    // min = d3.min(data, function(d){ return d.rating}) //1.6
    // console.log("budget min: "+min+" max: "+max)
    // //calculates profit_ratio on the fly!
    // // max = d3.max(data, function(d){ return d.revenue/d.budget})
    // // min = d3.min(data, function(d){ return d.revenue/d.budget})
    // // console.log("profit min: "+min+" max: "+max)
    // max = d3.max(data, function(d){ return d.profit_ratio}) // 409.864
    // min = d3.min(data, function(d){ return d.profit_ratio}) //0.000018
    // console.log("profit_ratio min: "+min+" max: "+max)
  });//d3.csv
}

/*******************
* Scales
********************/

//X-axis: IMDB rating
const xScale = d3.scaleLinear()
.domain([1, 10]) //data: [1.6 , 9.3]
.range([0,canvasWidth])

//Y-axis: budget in USD
//logaritmic scale: distance means 10x
const yScale = d3.scaleLog()
.domain([1000, 700e6])
.range([canvasHeight, 0])

//r: profit_ratio

//color: release_year



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
