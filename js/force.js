var w = window.innerWidth,
  h = window.innerHeight - 80;

// the group is seen on https://bl.ocks.org/Andrew-Reid/e689546e3449fd9f1fba1d19c30d6f6d and adjusted to my data

var radius = 15;
var vis = d3.select("#chart").append("svg:svg").attr("width", w).attr("height", h);

var POS = JSON.parse(postagDict)
var TAGColor = JSON.parse(tagColor)
var color = d3.scaleOrdinal(d3.schemeCategory20)

var voronoi = d3.voronoi().x(function(d) {
  return d.x;
}).y(function(d) {
  return d.y;
}).extent([
  [
    -1, -1
  ],
  [
    w + 1,
    h + 1
  ]
]);

// get the groups of nodes
function getPartition(threshhold) {
  switch (threshhold) {
    case "100":
      return JSON.parse(partition100)
    case "200":
      return JSON.parse(partition200)
    case "300":
      return JSON.parse(partition300)
    case "400":
      return JSON.parse(partition400)
    case "500":
      return JSON.parse(partition500)
    case "600":
      return JSON.parse(partition600)
  }
}

// create TAGColor legend
function generateLegend() {
  var container = document.getElementById('container');
  for (var key in TAGColor) {
    var boxContainer = document.createElement("DIV");
    var box = document.createElement("DIV");
    var label = document.createElement("SPAN");
    label.innerHTML = key;
    boxContainer.className = "boxContainer"
    box.className = "box";
    box.style.backgroundColor = TAGColor[key];
    boxContainer.appendChild(label);
    boxContainer.appendChild(box);
    container.appendChild(boxContainer);
  }
}
generateLegend()

// info button for the ledgend of POS tags
var showlegend = document.querySelector(".showlegend")
var legend = document.querySelector(".legend")
showlegend.addEventListener("click", function() {
  console.log("hello");
  switch (legend.style.display) {
    case "block":
      legend.style.display = "none"
      break;
    default:
      legend.style.display = "block"
  }
})




var cutSelector = document.querySelector("#cut_container")
var centralitySelecter = document.querySelector("#centrality_container")
var show = document.querySelector("#show")
show.addEventListener("click", function() {
  d3.select("svg").remove();
  vis = d3.select("#chart").append("svg:svg").attr("width", w).attr("height", h);
  var threshhold = cutSelector.options[cutSelector.selectedIndex].value
  var centrality = centralitySelecter.options[centralitySelecter.selectedIndex].value
  if (centrality == "closeness_centrality") {
    radius = 5;
  } else {
    radius = 15;
  }
  partition = getPartition(cutSelector.options[cutSelector.selectedIndex].text)

  d3.json("json/"+threshhold + ".json", function(json) {
    var nodes = d3.values(json.nodes)
    var links = json.links
    centrality = json[centrality]
    var simulation = d3.forceSimulation()
    // .force("link", d3.forceLink().id(function(d) { return d.id; }).distance(200))
      .force("link", d3.forceLink().id(function(d) {
      return d.id;
    }).strength(function(link) {
      if (partition[link.source.id] == partition[link.target.id]) {
        return 1; // stronger link for links within a group
      } else {
        return 0.2; // weaker links for links across groups
      }
    }).distance(150))
    .force("charge", d3.forceManyBody())
    .force("center", d3.forceCenter(w / 2, h / 2))
    .force("attraceForce", d3.forceManyBody().strength(-10))

    simulation.nodes(nodes).on("tick", ticked);
    simulation.force("link").links(links);

    function mapcolorToTag(term) {
      var TAG = POS[term]
      return TAGColor[TAG]
    }

    function mapColorToPartition(term) {
      var group = partition["partition"][term]
      return color(group)
    }

    function focus(opacity, show) {
      return function(d) {
        // add posTag label on the corner
        if (show) {
          d3.select(this).append("rect").attr("x", 5).attr("y", 10).attr("width", 60).attr("height", 20).attr("class", "POSTagCircle").style("fill", function(d) {
            return mapcolorToTag(d.id)
          })
          d3.select(this).append("text").attr("dx", 10).attr("dy", 25).attr("class", "POSTag").style("fill", "#000").text(function(d) {
            return POS[d.id];
          });
        } else {
          d3.selectAll(".POSTag").remove()
          d3.selectAll(".POSTagCircle").remove()
        }

        // var sameGroupElements = document.getElementsByClassName(partition["partition"][d.id])
        // for (var element in sameGroupElements) {
        //   // console.log(sameGroupElements[element]);
        //
        //   sameGroupElements[element].setAttribute("stroke-opacity",opacity)
        //   sameGroupElements[element].setAttribute("fill-opacity",opacity)
        // }

        // manipulate node, links opacity
        node.style("stroke-opacity", function(o) {
          thisOpacity = isConnected(d, o)
            ? 1
            : opacity;
          this.setAttribute('fill-opacity', thisOpacity);
          return thisOpacity;
        });

        link.style("stroke-opacity", opacity).style("stroke-opacity", function(o) {
          linkOpacity = o.source === d || o.target === d
            ? 1
            : opacity;
          this.setAttribute('fill-opacity', linkOpacity);
          return linkOpacity;
        })
      };
    }

    function dragstarted(d) {
      if (!d3.event.active)
        simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(d) {
      d.fx = d3.event.x;
      d.fy = d3.event.y;
    }

    function dragended(d) {
      if (!d3.event.active)
        simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }

    function renderCell(d) {
      return d == null
        ? null
        : "M" + d.join("L") + "Z";
    }

    var linkedByIndex = {};
    json.links.forEach(function(d) {
      linkedByIndex[d.source.index + "," + d.target.index] = 1;
    });

    function isConnected(a, b) {
      return linkedByIndex[a.index + "," + b.index] || linkedByIndex[b.index + "," + a.index] || a.index == b.index;
    }

    var link = vis.selectAll(".link").data(json.links).enter().append("line").attr("class", "link").attr("stroke-width", function(d) {
      return Math.sqrt(d["Weight"]);
    })

    var node = vis.selectAll(".node").data(json.nodes).enter().append("g").attr("class",function (d) {
      return partition["partition"][d.id];
    }).call(d3.drag().on("start", dragstarted).on("drag", dragged).on("end", dragended)).on("mouseover", focus(.1, true)).on("mouseout", focus(0.2, false));

    node.append("circle").attr("r", function(d) {
      return centrality[d.id] * radius * 10
    })
    .style("fill", function(d) {
      return mapColorToPartition(d.id)
    })
    .attr("class","node");

    node.append("text").attr("dx", 12).attr("dy", ".35em").attr("class", "label").style("fill", "#fff").text(function(d) {
      return d.id;
    });

    var cells = vis.selectAll().data(simulation.nodes()).enter().append("g").attr("fill", function(d) {
      return mapColorToPartition(d.id);
    }).attr("class", function(d) {
      return partition["partition"][d.id]
    })

    var cell = cells.append("path").data(voronoi.polygons(simulation.nodes()))

    vis.style("opacity", 1e-6).transition().duration(1000).style("opacity", 1);

    function ticked() {
      var alpha = this.alpha();
      var nodes = this.nodes();

      var coords = {};
      var groups = [];

      // sort the nodes into groups:
      node.each(function(d) {
        if (groups.indexOf(partition["partition"][d.id]) == -1) {
          groups.push(partition["partition"][d.id]);
          coords[partition["partition"][d.id]] = [];
        }

        coords[partition["partition"][d.id]].push({x: d.x, y: d.y});
      })

      // get the centroid of each group:
      var centroids = {};

      for (var group in coords) {
        var groupNodes = coords[group];
        var n = groupNodes.length;
        var cx = 0;
        var tx = 0;
        var cy = 0;
        var ty = 0;

        groupNodes.forEach(function(d) {
          tx += d.x;
          ty += d.y;
        })

        cx = tx / n;
        cy = ty / n;

        centroids[group] = {
          x: cx,
          y: cy
        }
      }

      // don't modify points close the the group centroid:
      var minDistance = 10;

      if (alpha < 0.1) {
        minDistance = 10 + (1000 * (0.1 - alpha))
      }

      // adjust each point if needed towards group centroid:
      node.each(function(d) {
        var cx = centroids[partition["partition"][d.id]].x;
        var cy = centroids[partition["partition"][d.id]].y;
        var x = d.x;
        var y = d.y;
        var dx = cx - x;
        var dy = cy - y;

        var r = Math.sqrt(dx * dx + dy * dy)

        if (r > minDistance) {
          d.x = x * 0.9 + cx * 0.1;
          d.y = y * 0.9 + cy * 0.1;
        }
      })

      // update voronoi:
      cell = cell.data(voronoi.polygons(simulation.nodes())).attr("d", renderCell);

      link.attr("x1", function(d) {
        return d.source.x;
      }).attr("y1", function(d) {
        return d.source.y;
      }).attr("x2", function(d) {
        return d.target.x;
      }).attr("y2", function(d) {
        return d.target.y;
      });

      node.select("circle"). // select the circle element in that node
      attr("cx", function(d) {
        return d.x = Math.max(radius, Math.min(w - radius, d.x));
      }).attr("cy", function(d) {
        return d.y = Math.max(radius, Math.min(h - radius, d.y));
      });
      node.select("text").attr("dx", function(d) {
        return d.x + centrality[d.id] * radius * 10 + 5;
      }).attr("dy", function(d) {
        return d.y + 5;
      })
    };
  });
})
