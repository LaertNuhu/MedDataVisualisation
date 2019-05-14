/**
 * Responsible for loading different scripts. Used for swiching between two scripts
 * 
 * @param {String} url the source of the script that should be loaded
 * @param {Function} implementationCode the code that will run after the script is added
 * @param {Object} location the location where the script tag should be added. Should be a DOM object
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

/**
 * This method will be initialized after the script is loaded
 */
var internalScriptCode = function() {
  document.querySelector("#nodeNames").checked = false;
};


// initialize
loadJS("js/force.js", internalScriptCode, document.body);
document.querySelector("#displayExtrasCv").style.display = "none";

// variable definition
var straightLine = document.querySelector("#straight");
var curvedLine = document.querySelector("#curved");
var displayNodes = document.querySelector("#nodeNames");

// add event listener. If the event is trigered force.js script is loaded
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

// add event listener. If the event is trigered force_curved_links.js script is loaded
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

// add event listener. If the event is trigered node label is showed
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

// We define different + - buttons for the input type number
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
