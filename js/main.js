/**
 *
 * @param {*} url
 * @param {*} implementationCode
 * @param {*} location where to add the script tag
 */
var loadJS = function(url, implementationCode, location) {
  var scriptTag = document.createElement("script");
  scriptTag.src = url;
  scriptTag.id = "forceScript";
  scriptTag.type = "text/javascript";
  scriptTag.onload = implementationCode;
  scriptTag.onreadystatechange = implementationCode;
  location.appendChild(scriptTag);
};

var internalScriptCode = function() {
  console.log("script loaded");
};

// variable definition
var straightLine = document.querySelector("#straight");
var curvedLine = document.querySelector("#curved");
var displayNodes = document.querySelector("#nodeNames");

// initialize
loadJS("js/force.js", internalScriptCode, document.body);
document.querySelector("#displayExtrasCv").style.display = "none";

straightLine.addEventListener("click", function() {
  var displayExtrasSt = document.querySelector("#displayExtrasSt");
  var displayExtrasCv = document.querySelector("#displayExtrasCv");
  var script = document.querySelector("#forceScript");
  if (script) {
    script.remove();
  }
  if (this.checked) {
    loadJS("js/force.js", internalScriptCode, document.body);
    displayExtrasCv.style.display = "none";
    displayExtrasSt.style.display = "block";
  }
});

curvedLine.addEventListener("click", function() {
  var displayExtrasSt = document.querySelector("#displayExtrasSt");
  var displayExtrasCv = document.querySelector("#displayExtrasCv");
  var script = document.querySelector("#forceScript");
  if (script) {
    script.remove();
  }
  if (this.checked) {
    displayExtrasSt.style.display = "none";
    displayExtrasCv.style.display = "block";
    loadJS("js/force_curved_links.js", internalScriptCode, document.body);
  }
});

displayNodes.addEventListener("change", function() {
  var labels = document.querySelectorAll(".label");
  if (this.checked) {
    labels.forEach(function(label) {
      label.style.transition = "all 2s";
      label.style.opacity = 1;
    });
  } else {
    labels.forEach(function(label) {
      label.style.transition = "all 1s";
      label.style.opacity = 0;
    });
  }
});

// input type numbers
var quantity = document.querySelectorAll(".quantity");
quantity.forEach(function(a) {
  var input = a.querySelector('input[type="number"]');
  var btnUp = a.querySelector(".quantity-up");
  var btnDown = a.querySelector(".quantity-down");
  var min = input.getAttribute("min");
  var max = input.getAttribute("max");
  var step = input.getAttribute("step");
  var changeEvent = new Event("change");

  btnUp.addEventListener("click", function() {
    var oldValue = parseFloat(input.value);
    if (oldValue >= max) {
      var newVal = oldValue;
    } else {
      var newVal = oldValue + parseFloat(step);
    }
    a.querySelector("input").value = newVal;
    a.querySelector("input").dispatchEvent(changeEvent);
  });

  btnDown.addEventListener("click", function() {
    var oldValue = parseFloat(input.value);
    if (oldValue <= min) {
      var newVal = oldValue;
    } else {
      var newVal = oldValue - parseFloat(step);
    }
    a.querySelector("input").value = newVal;
    a.querySelector("input").dispatchEvent(changeEvent);
  });
});
