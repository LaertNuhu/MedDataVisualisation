var edgeWeight = document.querySelector("#edgeWeight2");
var tfidf = document.querySelector("#tfidf");
var edgeCount = document.querySelector("#edge_count");
var skipgram = document.querySelector("#skipgram");
var clos_centra = document.querySelector("#clos_centra2");
var deg_centra = document.querySelector("#deg_centra2");
var displayNodes = document.querySelector("#nodeNames");
var centrality = "";

centrality = clos_centra.checked ? "c" : "";
centrality = deg_centra.checked ? "d" : "";

createGraph(
  edgeWeight.checked,
  edgeCount.value,
  tfidf.checked,
  skipgram.value,
  centrality
);

// add event listener to edge weight checkbox
edgeWeight.addEventListener("change", function() {
  var centrality = clos_centra.checked ? "c" : "";
  centrality = deg_centra.checked ? "d" : "";
  displayNodes.checked = false;
  createGraph(
    edgeWeight.checked,
    edgeCount.value,
    tfidf.checked,
    skipgram.value,
    centrality
  );
});

edgeCount.addEventListener("change", function() {
  var centrality = "";
  centrality = clos_centra.checked ? "c" : "";
  centrality = deg_centra.checked ? "d" : "";
  displayNodes.checked = false;
  createGraph(
    edgeWeight.checked,
    edgeCount.value,
    tfidf.checked,
    skipgram.value,
    centrality
  );
});

tfidf.addEventListener("change", function() {
  var centrality = "";
  centrality = clos_centra.checked ? "c" : "";
  centrality = deg_centra.checked ? "d" : "";
  displayNodes.checked = false;
  if (tfidf.checked) {
    edgeWeight.checked = true;
  }
  createGraph(
    edgeWeight.checked,
    edgeCount.value,
    tfidf.checked,
    skipgram.value,
    centrality
  );
});

skipgram.addEventListener("change", function() {
  var centrality = "";
  centrality = clos_centra.checked ? "c" : "";
  centrality = deg_centra.checked ? "d" : "";
  displayNodes.checked = false;
  createGraph(
    edgeWeight.checked,
    edgeCount.value,
    tfidf.checked,
    skipgram.value,
    centrality
  );
});

clos_centra.addEventListener("change", function() {
  displayNodes.checked = false;
  if (clos_centra.checked) {
    deg_centra.checked = false;
    createGraph(
      edgeWeight.checked,
      edgeCount.value,
      tfidf.checked,
      skipgram.value,
      "c"
    );
  } else {
    createGraph(
      edgeWeight.checked,
      edgeCount.value,
      tfidf.checked,
      skipgram.value,
      "c"
    );
  }
});

deg_centra.addEventListener("change", function() {
  displayNodes.checked = false;
  if (deg_centra.checked) {
    clos_centra.checked = false;
    createGraph(
      edgeWeight.checked,
      edgeCount.value,
      tfidf.checked,
      skipgram.value,
      "d"
    );
  } else {
    createGraph(
      edgeWeight.checked,
      edgeCount.value,
      tfidf.checked,
      skipgram.value,
      "c"
    );
  }
});

/**
 * @description handels network generation
 * @param {boolean} edgeWeight true in order to display edges with weights, false if not
 * @returns none
 */
function createGraph(edgeWeight, edgeCount, tfidf, window_size, centrality) {
  sendRequest(edgeCount, tfidf, window_size, centrality, getNetworkData);

  var w = window.innerWidth,
    h = window.outerHeight - 80;

  function getNetworkData(graph) {
    var simulation = d3
        .forceSimulation()
        .force(
          "link",
          d3.forceLink().id(function(d) {
            return d.id;
          })
        )
        .force("charge", d3.forceManyBody())
        .force("center", d3.forceCenter(w / 2, h / 2))
        .force("x", d3.forceX(w / 2).strength(0.01))
        .force("y", d3.forceY(h / 2).strength(0.01))
        .force("collide", d3.forceCollide()),
      radius = 10;
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

    //add encompassing group for the zoom
    var g = vis.append("g").attr("class", "everything");

    var links = graph.links,
      bilinks = [];
    var nodes = graph.nodes,
      nodeById = d3.map(nodes, function(d) {
        return d.id;
      });
    links.forEach(function(link) {
      var s = (link.source = nodeById.get(link.source)),
        t = (link.target = nodeById.get(link.target)),
        i = { Weight: link.Weight }; // intermediate node
      nodes.push(i);
      links.push(
        { source: s, target: i, Weight: link.Weight },
        { source: i, target: t, Weight: link.Weight }
      );
      bilinks.push([s, i, t]);
    });

    var linkWidthScale = d3.extent(links, function(d) {
      return d.Weight;
    });

    // create nodes and edges
    /**++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
    var link = g
      .append("g")
      .attr("class", "link")
      .selectAll(".link")
      .data(bilinks)
      .enter()
      .append("path");

    if (edgeWeight) {
      if (!tfidf) {
        link.attr("stroke-width", function(d) {
          return Math.sqrt(d[1].Weight);
        });
      } else {
        link.attr("stroke-width", function(d) {
          return d[1].Weight;
        });
      }
    }

    var node = g
      .append("g")
      .attr("class", "nodes")
      .selectAll("g")
      .data(
        nodes.filter(function(d) {
          return d.id;
        })
      )
      .enter()
      .append("g")
      .call(
        d3
          .drag()
          .on("start", dragstarted)
          .on("drag", dragged)
          .on("end", dragended)
      )
      .on("click", connectedNodes);

    var circles = node
      .append("circle")
      .attr("r", 5)
      .attr("fill", "#90caf9");

    if (centrality == "c") {
      circles
        .transition()
        .delay(500)
        .duration(500)
        .attr("r", function(d) {
          return graph["closeness_centrality"][d.id] * 100;
        });
    } else if (centrality == "d") {
      circles
        .transition()
        .delay(500)
        .duration(500)
        .attr("r", function(d) {
          return graph["degree_centrality"][d.id] * 100;
        });
    }

    node
      .append("text")
      .attr("x", 10)
      .attr("y", "-10px")
      .attr("class", "label")
      .text(function(d) {
        return d.id;
      })
      .style("opacity", "0")
      .style("fill", "rgb(111, 111, 111)");
    /**++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/

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
    /**++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
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
          return link[0] === d || link[2] === d ? 1 : 0;
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
    /**++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/

    function ticked() {
      link.attr("d", positionLink);
      // node
      //   .select("circle")
      //   .attr("cx", function(d) {
      //     return (d.x = Math.max(radius, Math.min(w - radius, d.x)));
      //   })
      //   .attr("cy", function(d) {
      //     return (d.y = Math.max(radius, Math.min(h - radius, d.y)));
      //   });
      node.select("circle").attr("transform", function(d) {
        return "translate(" + d.x + "," + d.y + ")";
      });
      node
        .select("text")
        .attr("dx", function(d) {
          return d.x+d.vx;
        })
        .attr("dy", function(d) {
          return d.y + d.vy;
        });
    }

    function positionLink(d) {
      return (
        "M" +
        d[0].x +
        "," +
        d[0].y +
        "S" +
        d[1].x +
        "," +
        d[1].y +
        " " +
        d[2].x +
        "," +
        d[2].y
      );
    }
    // draging functions
    /**++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
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
    /**++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
  }
}

// server request function
/**++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
/**
 *
 * @param {Integer} edgeCount the number of edges that showuld be visualized
 * @param {boolean} tfidf if true the tfidf values are showed
 * @param {Integer} window_size if it is bigger than 0 than the skipgram will be used
 * @param {Function} callback
 */
function sendRequest(edgeCount, tfidf, window_size, centrality, callback) {
  var Http = new XMLHttpRequest();
  var url = "";
  if (tfidf) {
    if (window_size == 0) {
      url =
        "https://med-data-visualisation.herokuapp.com/tfidf/" +
        edgeCount +
        "?centrality=" +
        centrality;
    } else {
      url =
        "https://med-data-visualisation.herokuapp.com/tfidf/skipgram/" +
        edgeCount +
        "?window_size=" +
        window_size +
        "&centrality=" +
        centrality;
    }
  } else {
    if (window_size == 0) {
      url =
        "https://med-data-visualisation.herokuapp.com/count/" +
        edgeCount +
        "?centrality=" +
        centrality;
    } else {
      url =
        "https://med-data-visualisation.herokuapp.com/count/skipgram/" +
        edgeCount +
        "?window_size=" +
        window_size +
        "&centrality=" +
        centrality;
    }
  }

  Http.open("GET", url);
  Http.send();
  Http.onreadystatechange = e => {
    callback(JSON.parse(Http.responseText));
  };
}
