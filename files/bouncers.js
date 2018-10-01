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

console.log(winH)
console.log(winW)

var canvas = d3.select("body")
  .append("canvas")
  .attr("width", winW)
  .attr("height", winH)

canvas.style("border","20px solid green")

var context = canvas.node().getContext("2d")

//Define fill color
context.fillStyle = "#4DB7B0"

context.fillRect(10,10,100,100)

context.fillRect(50,50,300,300)
