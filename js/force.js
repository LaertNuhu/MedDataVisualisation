var edgeWeight = document.querySelector("#edgeWeight");
var tfidf = document.querySelector("#tfidf");
var edgeCount = document.querySelector("#edge_count");
var skipgram = document.querySelector("#skipgram");
var clos_centra = document.querySelector("#clos_centra");
var deg_centra = document.querySelector("#deg_centra");
var displayNodes = document.querySelector("#nodeNames");
var groups = document.querySelector("#groups");

var show_groups = "";
var centrality = "";

centrality = clos_centra.checked ? "c" : "";
centrality = deg_centra.checked ? "d" : "";
show_groups = groups.checked ? "y" : "";

createGraph(
  edgeWeight.checked,
  edgeCount.value,
  tfidf.checked,
  skipgram.value,
  centrality,
  show_groups
);

// add event listener to edge weight checkbox
edgeWeight.addEventListener("change", function() {
  var centrality = clos_centra.checked ? "c" : "";
  centrality = deg_centra.checked ? "d" : "";
  show_groups = groups.checked ? "y" : "";
  displayNodes.checked = false;
  createGraph(
    edgeWeight.checked,
    edgeCount.value,
    tfidf.checked,
    skipgram.value,
    centrality,
    show_groups
  );
});

edgeCount.addEventListener("change", function() {
  var centrality = "";
  centrality = clos_centra.checked ? "c" : "";
  centrality = deg_centra.checked ? "d" : "";
  show_groups = groups.checked ? "y" : "";
  displayNodes.checked = false;
  createGraph(
    edgeWeight.checked,
    edgeCount.value,
    tfidf.checked,
    skipgram.value,
    centrality,
    show_groups
  );
});

tfidf.addEventListener("change", function() {
  var centrality = "";
  centrality = clos_centra.checked ? "c" : "";
  centrality = deg_centra.checked ? "d" : "";
  show_groups = groups.checked ? "y" : "";
  displayNodes.checked = false;
  if (tfidf.checked) {
    edgeWeight.checked = true;
  }
  createGraph(
    edgeWeight.checked,
    edgeCount.value,
    tfidf.checked,
    skipgram.value,
    centrality,
    show_groups
  );
});

skipgram.addEventListener("change", function() {
  var centrality = "";
  centrality = clos_centra.checked ? "c" : "";
  centrality = deg_centra.checked ? "d" : "";
  show_groups = groups.checked ? "y" : "";
  displayNodes.checked = false;
  createGraph(
    edgeWeight.checked,
    edgeCount.value,
    tfidf.checked,
    skipgram.value,
    centrality,
    show_groups
  );
});

clos_centra.addEventListener("click", function() {
  displayNodes.checked = false;
  var show_groups = groups.checked ? "y" : "";
  if (this.checked) {
    deg_centra.checked = false;
    createGraph(
      edgeWeight.checked,
      edgeCount.value,
      tfidf.checked,
      skipgram.value,
      "c",
      show_groups
    );
  } else {
    createGraph(
      edgeWeight.checked,
      edgeCount.value,
      tfidf.checked,
      skipgram.value,
      "",
      show_groups
    );
  }
});

deg_centra.addEventListener("click", function() {
  displayNodes.checked = false;
  var show_groups = groups.checked ? "y" : "";
  if (this.checked) {
    clos_centra.checked = false;
    createGraph(
      edgeWeight.checked,
      edgeCount.value,
      tfidf.checked,
      skipgram.value,
      "d",
      show_groups
    );
  } else {
    createGraph(
      edgeWeight.checked,
      edgeCount.value,
      tfidf.checked,
      skipgram.value,
      "",
      show_groups
    );
  }
});

groups.addEventListener("click", function() {
  displayNodes.checked = false;
  if (this.checked) {
    createGraph(
      edgeWeight.checked,
      edgeCount.value,
      tfidf.checked,
      skipgram.value,
      centrality,
      "y"
    );
  } else {
    createGraph(
      edgeWeight.checked,
      edgeCount.value,
      tfidf.checked,
      skipgram.value,
      centrality,
      ""
    );
  }
});

/**
 * @description handels network generation
 * @param {*} edgeWeight true in order to display edges with weights, false if not
 * @param {*} edgeCount define how many edges are displayed
 * @param {*} tfidf decide if tfidf values should be used as edge weights
 * @param {*} window_size if bigger than 0 than this imlyies that skipgrams are used
 * @returns none
 */
function createGraph(
  edgeWeight,
  edgeCount,
  tfidf,
  window_size,
  centrality,
  show_groups
) {
  sendRequest(
    edgeCount,
    tfidf,
    window_size,
    centrality,
    show_groups,
    getNetworkData
  );
  // define variabels
  var w = window.innerWidth,
    h = window.outerHeight - 80,
    radius = 5,
    color = d3.scaleOrdinal(d3.schemeCategory20),
    POS = postagDict,
    TAGColor = tagColor;

  /**
   * @description gets the data and generates the node/link elements
   */
  function getNetworkData(graph) {
    // remove svg if exists
    if (d3.select("svg")) {
      d3.select("svg").remove();
    }
    // add new svg element
    var vis = d3
      .select("#chart")
      .append("svg")
      .attr("width", w)
      .attr("height", h);

    var simulation = d3
      .forceSimulation()
      .force(
        "link",
        d3
          .forceLink()
          .id(function(d) {
            return d.id;
          })
          .distance(function(d) {
            return d.Weight;
          })
          .strength(function(link) {
            if (show_groups) {
              if (link.source.group == link.target.group) {
                return 1; // stronger link for links within a group
              } else {
                return 0.2; // weaker links for links across groups
              }
            } else {
              return 0.1;
            }
          })
      )
      .force("charge", d3.forceManyBody())
      .force("center", d3.forceCenter(w / 2, h / 2))
      .force("x", d3.forceX(w / 2).strength(0.01))
      .force("y", d3.forceY(h / 2).strength(0.01))
      .force(
        "collide",
        d3.forceCollide().radius(d => {
          return d.Weight;
        })
      );

    //add encompassing group for the zoom
    var g = vis.append("g").attr("class", "everything");
    // create nodes and edges
    //--------------------------------------------------------------/
    var link = g
      .append("g")
      .attr("class", "link")
      .selectAll("line")
      .data(graph.links)
      .enter()
      .append("line");

    if (edgeWeight) {
      if (!tfidf) {
        link.attr("stroke-width", function(d) {
          return Math.sqrt(d.Weight);
        });
      } else {
        link.attr("stroke-width", function(d) {
          return d.Weight;
        });
      }
    }

    var node = g
      .append("g")
      .attr("class", "nodes")
      .selectAll("g")
      .data(graph.nodes)
      .enter()
      .append("g")
      .call(
        d3
          .drag()
          .on("start", dragstarted)
          .on("drag", dragged)
          .on("end", dragended)
      )
      .on("click", connectedNodes)
      .on("mouseover", displayPOSTag(true))
      .on("mouseout", displayPOSTag(false));

    var circles = node
      .append("circle")
      .attr("r", radius)
      .attr("fill", "#90caf9")
      .transition()
      .delay(500)
      .duration(500);

    if (show_groups) {
      circles.attr("fill", function(d) {
        return color(d.group);
      });
      // create group taskbar
      createGroupsTaskbar(displayGroupElements(graph), color);
    }

    if (centrality == "c") {
      circles.attr("r", function(d) {
        return d.closeness_centrality * 100;
      });
    } else if (centrality == "d") {
      circles.attr("r", function(d) {
        return d.degree_centrality * 100;
      });
    }

    node
      .append("text")
      .attr("x", 0)
      .attr("text-anchor", "middle")
      .attr("y", "2px")
      .attr("class", "label")
      .text(function(d) {
        return d.id;
      })
      .style("opacity", "0")
      .style("fill", "rgb(111, 111, 111)");
    //--------------------------------------------------------------/
    //add zoom capabilities
    var zoom_handler = d3.zoom().on("zoom", zoom_actions);

    zoom_handler(vis);

    //Zoom functions
    function zoom_actions() {
      g.attr("transform", d3.event.transform);
    }

    simulation.nodes(graph.nodes).on("tick", ticked);

    simulation.force("link").links(graph.links);

    // find neighbours logic
    //--------------------------------------------------------------/
    var toggle = 0;
    var linkedByIndex = {};
    for (i = 0; i < graph.nodes.length; i++) {
      linkedByIndex[i + "," + i] = 1;
    }

    graph.links.forEach(function(d) {
      linkedByIndex[d.source.index + "," + d.target.index] = 1;
    });

    function connectedNodes() {
      if (toggle == 0) {
        d = d3.select(this).node().__data__;

        node.style("opacity", function(o) {
          return neighboring(d, o) | neighboring(o, d) ? 1 : 0;
        });
        link.style("opacity", function(link) {
          return link.source === d || link.target === d ? 1 : 0;
        });

        toggle = 1;
      } else {
        node.style("opacity", 1);
        link.style("opacity", 1);
        toggle = 0;
      }
    }

    function neighboring(a, b) {
      return linkedByIndex[a.index + "," + b.index];
    }
    //--------------------------------------------------------------/

    function ticked() {
      link
        .attr("x1", function(d) {
          return d.source.x;
        })
        .attr("y1", function(d) {
          return d.source.y;
        })
        .attr("x2", function(d) {
          return d.target.x;
        })
        .attr("y2", function(d) {
          return d.target.y;
        });

      node.select("circle").attr("transform", function(d) {
        return "translate(" + d.x + "," + d.y + ")";
      });

      node
        .select("text")
        .attr("dx", function(d) {
          return d.x + d.vx;
        })
        .attr("dy", function(d) {
          return d.y + d.vy;
        });
      if (show_groups) {
        generateVornoi(this.alpha(), this.nodes());
      }
    }
    // draging functions
    //--------------------------------------------------------------/
    function dragstarted(d) {
      if (!d3.event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(d) {
      d.fx = d3.event.x;
      d.fy = d3.event.y;
    }

    function dragended(d) {
      if (!d3.event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }
    //--------------------------------------------------------------/
    // vornoi logic
    //--------------------------------------------------------------/
    if (show_groups) {
      // add vornoi element
      var voronoi = d3
        .voronoi()
        .x(function(d) {
          return d.x;
        })
        .y(function(d) {
          return d.y;
        })
        .extent([[-1 * w * w, -1 * h * h], [w * w, h * h]]);
      var cells = g
        .selectAll()
        .data(graph.nodes)
        .enter()
        .append("g")
        .attr("fill", "none")
        .attr("stroke", function(d) {
          return color(d.group);
        })
        .attr("class", function(d) {
          return d.group;
        });

      var cell = cells
        .append("path")
        .data(voronoi.polygons(simulation.nodes()));
    }
    function generateVornoi(alpha, nodes) {
      var coords = {};
      var groups = [];

      // sort the nodes into groups:
      node.each(function(d) {
        if (groups.indexOf(d.group) == -1) {
          groups.push(d.group);
          coords[d.group] = [];
        }

        coords[d.group].push({
          x: d.x,
          y: d.y
        });
      });

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
        });

        cx = tx / n;
        cy = ty / n;

        centroids[group] = {
          x: cx,
          y: cy
        };
      }

      // don't modify points close the the group centroid:
      var minDistance = 10;

      if (alpha < 0.1) {
        minDistance = 10 + 1000 * (0.1 - alpha);
      }

      // adjust each point if needed towards group centroid:
      node.each(function(d) {
        var cx = centroids[d.group].x;
        var cy = centroids[d.group].y;
        var x = d.x;
        var y = d.y;
        var dx = cx - x;
        var dy = cy - y;

        var r = Math.sqrt(dx * dx + dy * dy);

        if (r > minDistance) {
          d.x = x * 0.9 + cx * 0.1;
          d.y = y * 0.9 + cy * 0.1;
        }
      });

      // update voronoi:
      cell = cell
        .data(voronoi.polygons(simulation.nodes()))
        .attr("d", renderCell);
    }
  }
  function renderCell(d) {
    return d == null ? null : "M" + d.join("L") + "Z";
  }
  //--------------------------------------------------------------/
  // POS taggs logic
  //--------------------------------------------------------------/
  function mapcolorToTag(term) {
    var TAG = POS[term];
    return TAGColor[TAG];
  }

  function displayPOSTag(show) {
    return function(d) {
      var chart = document.querySelector("#chart");
      var div = document.createElement("div");
      div.className = "POScontainer";
      div.innerHTML = POS[d.id];
      div.style.backgroundColor = mapcolorToTag(d.id);
      if (show) {
        chart.appendChild(div);
        requestAnimationFrame(function() {
          div.className = "POScontainerC";
        });

        // focus on the group
        var allGroups = document.querySelectorAll(".group");
        allGroups.forEach(function(group) {
          if (group.getAttribute("id") != d.group) {
            group.style.display = "none";
          } else {
            var sibling = group.firstChild;
            sibling = sibling.nextSibling;
            sibling.style.display = "block";
          }
        });
      } else {
        var parentNode = document.querySelector(".POScontainerC").parentNode;
        var divCreated = document.querySelectorAll(".POScontainerC");
        if (divCreated.length > 0) {
          for (let index = 0; index < divCreated.length > 0; index++) {
            const element = divCreated[index];
            parentNode.removeChild(element);
          }
        }
        // remove group focus
        var allGroups = document.querySelectorAll(".group");
        allGroups.forEach(function(group) {
          var sibling = group.firstChild;
          sibling = sibling.nextSibling;
          group.style.display = "block";
          sibling.style.display = "none";
        });
      }
    };
  }
  //--------------------------------------------------------------/

  // groups taskbar logic
  //--------------------------------------------------------------/

  // data preparation logic
  function displayGroupElements(graph) {
    var groupElements = graph.nodes.sort(function(a, b) {
      return a.group - b.group;
    });
    var result = {};
    groupElements.forEach(function(a) {
      filtered = groupElements
        .filter(function(b) {
          return b.group === a.group;
        })
        .map(function(c) {
          return c.id;
        });
      result[a.group] = filtered;
    });
    return result;
  }

  // dom manipulation fucntion
  function createGroupsTaskbar(data, color) {
    // find root
    var root = document.querySelector(".groups");

    root.innerHTML = "";

    // get data
    for (const [key, value] of Object.entries(data)) {
      // create elements
      var group = document.createElement("div");
      group.className = "group";
      group.setAttribute("id", key);
      var text = document.createElement("div");
      text.className = "text";
      text.style.background = color(key);
      var collapsable = document.createElement("div");
      collapsable.className = "collapsable";
      collapsable.style.background = color(key);
      collapsable.style.display = "none";

      // add content to elements
      var groupNr = parseInt(key) + 1;
      text.innerHTML = "Group " + groupNr;

      // putting elements together
      group.appendChild(text);

      for (let i = 0; i < value.length; i++) {
        var node = document.createElement("div");
        node.className = "node";
        node.innerHTML = value[i];
        collapsable.appendChild(node);
      }
      group.appendChild(collapsable);
      root.appendChild(group);

      // add event listeners
      text.addEventListener("click", function() {
        var sibling = this.nextSibling;
        if (sibling.style.display == "none") {
          sibling.style.display = "block";
        } else {
          sibling.style.display = "none";
        }
      });
    }
  }

  //--------------------------------------------------------------/
}

// server request function
//--------------------------------------------------------------/
/**
 *
 * @param {Integer} edgeCount the number of edges that showuld be visualized
 * @param {boolean} tfidf if true the tfidf values are showed
 * @param {Integer} window_size if it is bigger than 0 than the skipgram will be used
 * @param {Function} callback
 */
function sendRequest(
  edgeCount,
  tfidf,
  window_size,
  centrality,
  groups,
  callback
) {
  var Http = new XMLHttpRequest();
  var url = "";
  if (tfidf) {
    if (window_size == 0) {
      url =
        "https://med-data-visualisation.herokuapp.com/tfidf/" +
        edgeCount +
        "?centrality=" +
        centrality +
        "&groups=" +
        groups;
    } else {
      url =
        "https://med-data-visualisation.herokuapp.com/tfidf/skipgram/" +
        edgeCount +
        "?window_size=" +
        window_size +
        "&centrality=" +
        centrality +
        "&groups=" +
        groups;
    }
  } else {
    if (window_size == 0) {
      url =
        "https://med-data-visualisation.herokuapp.com/count/" +
        edgeCount +
        "?centrality=" +
        centrality +
        "&groups=" +
        groups;
    } else {
      url =
        "https://med-data-visualisation.herokuapp.com/count/skipgram/" +
        edgeCount +
        "?window_size=" +
        window_size +
        "&centrality=" +
        centrality +
        "&groups=" +
        groups;
    }
  }

  Http.open("GET", url);
  Http.onreadystatechange = e => {
    if (Http.readyState === 4 && Http.status === 200) {
      callback(JSON.parse(Http.responseText));
    }
  };
  Http.send();
}
