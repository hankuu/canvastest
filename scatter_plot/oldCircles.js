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
let svg = d3.select("#bottom")
.append("svg")
.attr("width",plotSize.width) //should this be size.width?
.attr("height",plotSize.height) //should this be size.height?
.append("g") //append group to the SVG
.attr("transform","translate("+padding.left+", "+padding.top+")") //move top left inside the padding


//Create canvas
let canvas = d3.select("#bottom")
.append("canvas")
.attr("width",plotSize.width) //should this be size.width?
.attr("height",plotSize.height) //should this be size.height?
//Can't do this. Don't exactly know why...
//.on("mousemove", function() { checkMouse() }) //take care of events, but logic is handled elsewhere.

// get context
let cx = canvas.node().getContext("2d")
//move top left inside the padding
cx.translate(padding.left, padding.top)


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
// rScale = d3.scaleSqrt()
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


//This is a function. Run only when diagram voronoi(data) is called!!
const voronoi = d3.voronoi()
    .x(function (d) { return xScale(d.rating) })
    .y(function (d) { return yScale(d.budget) })
    .extent([[0, 0], [size.width, size.height]])

/**************************
** Rendering functions. Outside d3.csv
***************************/
    function drawFullCircle(x,y,r, opacity, color) {
      cx.fillStyle = color
      cx.globalAlpha = opacity
      cx.beginPath()
      cx.arc(x,y,r,0,2*Math.PI)
      cx.fill()
      cx.closePath()
    } //drawFullCircle



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

    function draw_all(data){
      // cx.translate(-padding.left, -padding.top)
      //TODO: find out why svg diappears with fillRect
      // cx.fillStyle="rgba(255,255,255,0.5)"
      // cx.fillRect(0,0,plotSize.width,plotSize.height)
      cx.clearRect(0,0,plotSize.width,plotSize.height)
      // cx.translate(padding.left, padding.top)

      data.forEach(function(d){
        drawFullCircle(xScale(d.rating),
              yScale(d.budget),
              rScale(d.profit_ratio),
              opScale(d.profit_ratio),
              colorScale(d.release_year))
      })//data draw circles
   }//draw_all


   //highlight_circle nearest circle
   function highlight_circle(nearest_movie){


       drawFullCircle(xScale(nearest_movie.rating),
       yScale(nearest_movie.budget),
       rScale(nearest_movie.profit_ratio),
       1,
       // opScale(nearest_movie.profit_ratio),
       "#000000")
       // colorScale(nearest_movie.release_year))

       // requestAnimationFrame(highlight_circle(nearest_movie))
   }//highlight_circle


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

//Pass the data to the function. Otherwise it can't draw it properly
 draw_all(data)


  //Draw rest of the graph
  renderAxes()
  addTitles()

  //Needs to be inside d3.csv
  let diagram = voronoi(data)


//Add event listening and handling
//Needs to be inside d3.csv
  canvas.on("mousemove", function checkMouse(){
    let myMouse = d3.mouse(this) //works because inside d3.csv????

    draw_all(data)

    //Find the nearest circle center from mouse coordinates
    //Search radius specified
    let nearest = diagram.find(myMouse[0]-padding.left, myMouse[1], 10)
    //If there is a movie circle within the search radius, then print it's name and highlight it
    if(nearest){
      console.log(nearest.data.title)
      highlight_circle(nearest.data)
    }
  })//on mousemove


})//d3.csv
