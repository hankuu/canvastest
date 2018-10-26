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

//Create SVG container before CANVAS to catch the mouse
//TODO: is this necessary? created in animate() too
let svg = d3.select("#bottom")
.append("svg")
.attr("width",plotSize.width) //should this be size.width?
.attr("height",plotSize.height) //should this be size.height?
.append("g") //append group to the SVG
.attr("transform","translate("+padding.left+", "+padding.top+")") //move top left inside the padding

//Create canvas
//TODO: is this necessary? created in animate() too
let canvas = d3.select("#bottom")
.append("canvas")
.attr("width",plotSize.width) //should this be size.width?
.attr("height",plotSize.height) //should this be size.height?
.on("mousemove", function() { checkMouse() }) //take care of events, but logic is handled elsewhere.

// get context
let cx = canvas.node().getContext("2d")
//move top left inside the padding
cx.translate(padding.left, padding.top)


//movie container
let movies=[];

//catch mouse
//first set to 0,0
let myMouse = {
  x: 0,
  y: 0
}


//Set Scales
//Domain only after we have data
const xScale = d3.scaleLinear()
.range([0,size.width])

//Y-axis: budget in USD
//logaritmic scale: distance means 10x
//rounding to nearest 1000 down and 100e6 up
//I happen to know that max is 100e6 so we need to add one 100e6
const yScale = d3.scaleLog()
.domain([500, 700e6])
.range([size.height, 0])

//r: profit_ratio
//values copied from NB to understand the L&F
//why 6 when max > 400? More dramatic?
const rScale = d3.scaleSqrt()
.domain([0, 6])
.range([0, 10])

//opacity: larget profit_ratio -> more transparent
//values copied from NB to understand the L&F
//domain and data values don't match. More dramatic this way?
const opScale = d3.scaleLinear()
.domain([0, 100])
.range([0.2, 0.01])
.clamp(true)

//color: release_year
//Domain only after we have data
const colorScale = d3.scaleSequential()
.interpolator(d3.interpolateViridis)


/**************************
** Rendering functions.
***************************/
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
        .attr("class", "chartTitle")
        .attr("transform", "translate("+(padding.right)+","+(padding.top)+")")
        .attr("textLength", ""+size.width) //stretch!
        .text("How have movies from 1929 to 2016 performed? Exploring profit against IMDB ratings")

        //X-axis: IMDB rating
        let xAxisTitle = svg.append("text")
        .attr("class", "axisTitle")
        .text("IMDB rating")

        //Centering the text on x-axis
        xAxisTitle.attr("transform", "translate("+((size.width/2)-(xAxisTitle.node().getBoundingClientRect().width/2))+", "+(size.height+padding.top+30)+")")


        //Y-axis: Movie profit
        let yAxisTitle = svg.append("text")
        .attr("class", "axisTitle")
        .text("Profit")

        //Centering the text on y-axis
        yAxisTitle.attr("transform", "translate(-50,"+((size.height/2)+(yAxisTitle.node().getBoundingClientRect().width/2))+") rotate(-90)")
    }


/*********************
** Utilities
**********************/
function getDistance(x1,y1,x2,y2){
  return Math.sqrt(Math.pow((x2-x1),2) + Math.pow((y2-y1),2))
}


/*********************
** Object
**********************/
function Movie(title, release_year, budget,
revenue, rating, num_voted_users, profit_ratio){
  this.title = title
  this.release_year = release_year
  this.budget = budget
  this.revenue = revenue
  this.rating = rating
  this.num_voted_users = num_voted_users
  this.profit_ratio = profit_ratio

  this.x = xScale(rating)

  //Draw in place
  this.y = yScale(budget)

  //for descending bubbles
  // this.y = 0
  // //TODO needs a bit more work. min speed set ok
  // this.dy = (rScale(profit_ratio)<1) ? 1 : rScale(profit_ratio)
  // this.finaly = yScale(budget)

  // for rising bubbles
  // this.y = yScale(plotSize.height)
  // //TODO needs a bit more work. min speed set ok
  // this.dy = (rScale(profit_ratio)<1) ? 1 : rScale(profit_ratio)
  // this.finaly = yScale(budget)

  //original drawing properties
  this.origColor = colorScale(release_year)
  this.origOpacity = opScale(profit_ratio)
  this.origR = rScale(profit_ratio)

  //current drawing properties
  this.r = rScale(profit_ratio)
  this.color = colorScale(release_year)
  this.opacity = opScale(profit_ratio)

  //for changing Size
  //TODO: can this be optimized?
  this.growing = false
  this.growProgress = 0
  this.growSpeed = 0
  this.growToR = 1.5*this.origR-this.origR
  this.ease = d3.easeSinInOut

}//object Movie

//Prototype for drawing a movie
Movie.prototype.draw = function(){
    cx.fillStyle = this.color
    cx.globalAlpha = this.opacity
    cx.beginPath()
    cx.arc(this.x,this.y,this.r,0,2*Math.PI)
    cx.fill()
    cx.closePath()
}// Movie draw


//Prototype for updating object properties
//calls draw
Movie.prototype.update = function(){

  //for rising bubbles
  // if(this.y > this.finaly){
  //   this.y -= this.dy
  // }

  //for descending bubbles
  // if(this.y < this.finaly){
  //   this.y += this.dy
  // }

  //Checking how close the mouse is
  //If inside bubble and bublle not yet growing -> set growing
  if(getDistance(myMouse.x, myMouse.y, this.x, this.y) < this.r && !this.growing) {
    this.growing = true
    this.growSpeed = 0.02
    this.opacity = 1

    //set text to titles
    let selected = d3.select("#selected")
    .text("Last hovered over: "+this.title)

  }

  this.growProgress = this.growProgress + this.growSpeed

  this.r = this.origR + this.growToR * this.ease(this.growProgress)
  this.opacity = this.origOpacity + this.ease(this.growProgress)

  //Opacity cannot go past 1, 0
  this.opacity = (this.opacity>1) ? 1 : this.opacity

  if(this.growProgress>=1){
    this.growSpeed = this.growSpeed*-1
  }else if(this.growProgress <= 0 && this.growing){
    //reset
    this.r = this.origR
    this.growSpeed = 0
    this.growProgress = 0
    this.opacity = opScale(this.profit_ratio)
    this.growing = false
  }

  //Draw bubble
  this.draw()
}

/*********************
** Checking mouse
**********************/
function checkMouse() {
    myMouse.x = event.clientX - canvas.node().getBoundingClientRect().left - padding.left
    myMouse.y = event.clientY - canvas.node().getBoundingClientRect().top - padding.top
}

/*********************
** Read in data. Apparently needs quite a lot stuff inside to work properly
**********************/
d3.csv("data/imdb-movies.csv", function(error, data){
  if(error) throw error

  data.forEach(function(d){
    d.title=d.title;
    d.release_year=+d.release_year;
    d.budget=+d.budget;
    d.revenue=+d.revenue;
    d.rating=+d.rating;
    d.num_voted_users=+d.num_voted_users;
    d.profit_ratio=+d.profit_ratio

  })//forEach

  //ADJUST scales
  xScale.domain(d3.extent(data, d => d.rating)).nice()
  colorScale.domain(d3.extent(data, function(d){return d.release_year}))

 //create objects
 data.forEach(function(d){
   movies.push(
     new Movie(d.title, d.release_year, d.budget, d.revenue, d.rating, d.num_voted_users, d.profit_ratio)
   )
 })

 //Try with 1 for debugging
   // movies.push(
   //   new Movie(data[0].title, data[0].release_year, data[0].budget, data[0].revenue, data[0].rating, data[0].num_voted_users, data[0].profit_ratio)
   // )

 //call to drawing
 animate();



})//d3.csv


/**********************
** Animating the scene
***********************/
function animate(){
  //clear everything
  d3.select("#bottom").html(null)

  //create svg container for axis
  svg = d3.select("#bottom")
  .append("svg")
  .attr("width",plotSize.width) //should this be size.width?
  .attr("height",plotSize.height) //should this be size.height?
  .append("g") //append group to the SVG
  .attr("transform","translate("+padding.left+", "+padding.top+")") //move top left inside the padding


  //Create canvas container for bubbles
  canvas = d3.select("#bottom")
  .append("canvas")
  .attr("width",plotSize.width) //should this be size.width?
  .attr("height",plotSize.height) //should this be size.height?
  .on("mousemove", function() { checkMouse() }) //take care of events, but logic is handled elsewhere.

  // get context
  cx = canvas.node().getContext("2d")
  //move top left inside the padding
  cx.translate(padding.left, padding.top)

  //update and draw movies
  movies.forEach((movie)=>{
    movie.update()
  })

  //draw axis and add titles
  renderAxes();
  addTitles();

  //redraw!
  requestAnimationFrame(animate)
}


//animate();
