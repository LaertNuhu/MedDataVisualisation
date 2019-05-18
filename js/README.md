# Force.js documentation
This script is responsible for creating network elements, communicating with the FlaskAPI and creating event listeners for the buttons on the controls container.

__force_curved_links.js__ has the same functionality but it has slight differences when defining the links and nodesregarding their structure. We use there [Bézier curves](https://pomax.github.io/bezierinfo/).

### Legend
|Line nr. &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;  &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;|Function|Notes|
|---|---|---|
|1-9|Select controls container container||
|__10-11__|Define empty variables that are used to manipulate centrality and groups||
|13-15|Initilize the empty variables from __10-11__||
|17-24|Intilaze createGraph()|__createGraph()__ handels network generation (defenied at lines __176-700__)|
|26-40|Add event listener to `show edge weight` checkbox|calls __createGraph()__ when triggered|
|42-56|Add event listener to `edge count` input|calls __createGraph()__ when triggered|
|58-75|Add event listener to `tfidf` checkbox|calls __createGraph()__ when triggered|
|77-91|Add event listener to `tokens to skip` input|calls __createGraph()__ when triggered|
|93-116|Add event listener to `show closeness centrailty` checkbox|calls __createGraph()__ when triggered|
|118-141|Add event listener to `show degree centrailty` checkbox|calls __createGraph()__ when triggered|
|143-164|Add event listener to `groups` checkbox|calls __createGraph()__ when triggered|
|__176-700__|Generates a network||
|184-191|Initilaze sendRequest()|__sendRequest()__ handels the communication with the server (__714-773__)|
|194-199|Define global variables used by the network||
|205-548|Callback function, called at __190__. Waits for the payload and creates network||
|207-209|Checks if a SVG DOM element exists. If true remove it||
|__211-215__|Selects the root elemnt on index.html and appends a svg element||
|217-250|Create simulations|See https://github.com/d3/d3-force|
|253|Append a global element to SVG element|Is zoomable and dragable|
|256-262|Append link elements into the global element||
|264-274|Checks if `show edge weight` is checked. If true change links width||
|276-292|Append nodes into the global element.|Hover(__573-616__), click (__365-382__) and drag(__422-437__) function are called|
|294-300|Append SVG circle into the nodes||
|__302-312__|Checks if `groups` is checked. If true change circle color and create `groups container` (see __651-697__)||
|314-322|Checks if any from the centrality checboxes is checked. If true change circle radius||
|324-334|Append labels to the nodes||
|337|Callable function that adds zoom functionality to the svg|__zoom_handler()__|
|339|Call __zoom_handler()__ on svg element.|SVG element defined at __211-215__|
|342-344|Zoom function that handels element dimension transformation||
|346|Assign simmulation to nodes|__ticked()__ is called (see __389-419__)|
|351-386|The find neigbour logic|When a node is clicked (__276-292) only its direct neighbors are shown|
|389-419|Simmulates forces and makes network elements interactive|See https://github.com/d3/d3-force|
|422-437|Simmulates draging forces||
|442-470|Creates a voronoi layout if `groups` is checked||
|477-547|Assign to every vornoi cell nodes that are members of the same group|Called at __416-418__|
|553-555|Render vornoi cells|Called at __546__|
|564-567|Maps POS tags to a color||
|__573-616__|When hovered over a node its POS tag will be revealed|Also if `groups` is checked focus on the hovered node group and expand it|
|627-643|Creates an Object that contains groups as key and as value the group nodes|Used by __createGroupsTaskbar()__ on __307__|
|__651-697__|Creates the `group container`||
|__714-773__|Ajax requests to FlaskAPI||

