# Force.js documentation
This script is responsible for creating network elements, communicating with the FlaskAPI and creating event listeners for the buttons on the controls container.

__force_curved_links.js__ has the same functionality but it has slight differences when defining the links and nodes regarding their structure. We use there [Bézier curves](https://pomax.github.io/bezierinfo/).

### Legend
|Line nr. &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;  &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;|Function|Notes|
|---|---|---|
|1-9|Select controls container container||
|__10-11__|Define empty variables that are used to manipulate centrality and groups||
|13-15|Initilize the empty variables from __10-11__||
|17-24|Intilaze createGraph()|__createGraph()__ handels network generation (defenied at lines __171-715__)|
|27-39|Add event listener to `show edge weight` checkbox|calls __createGraph()__ when triggered|
|41-53|Add event listener to `edge count` input|calls __createGraph()__ when triggered|
|55-71|Add event listener to `tfidf` checkbox|calls __createGraph()__ when triggered|
|73-85|Add event listener to `tokens to skip` input|calls __createGraph()__ when triggered|
|87-110|Add event listener to `show closeness centrailty` checkbox|calls __createGraph()__ when triggered|
|112-135|Add event listener to `show degree centrailty` checkbox|calls __createGraph()__ when triggered|
|137-159|Add event listener to `groups` checkbox|calls __createGraph()__ when triggered|
|__171-715__|Generates a network||
|179-186|Initilaze sendRequest()|__sendRequest()__ handels the communication with the server (__729-788__)|
|189-194|Define global variables used by the network||
|200-544|Callback function, called at __185__. Waits for the payload and creates network||
|202-204|Checks if a SVG DOM element exists. If true remove it||
|__206-210__|Selects the root elemnt on index.html and appends a svg element||
|212-245|Create simulations|See https://github.com/d3/d3-force|
|248|Append a global element to SVG element|Is zoomable and dragable|
|251-257|Append link elements into the global element||
|259-269|Checks if `show edge weight` is checked. If true change links width||
|271-287|Append nodes into the global element.|Hover(__569-612__), click (__361-378__) and drag(__418-433__) function are called|
|289-295|Append SVG circle into the nodes||
|__297-907_9|Checks if `groups` is checked. If true change circle color and create `groups container` (see __653-712__)||
|309-317|Checks if any from the centrality checboxes is checked. If true change circle radius||
|319-329|Append labels to the nodes||
|332|Callable function that adds zoom functionality to the svg|__zoom_handler()__|
|334|Call __zoom_handler()__ on svg element.|SVG element defined at __206-210__|
|337-339|Zoom function that handels element dimension transformation||
|341|Assign simmulation to nodes|__ticked()__ is called (see __385-415__)|
|345-383|The find neigbour logic|When a node is clicked (__285__) only its direct neighbors are shown|
|385-415|Simmulates forces and makes network elements interactive|See https://github.com/d3/d3-force|
|418-433|Simmulates draging forces||
|438-466|Creates a voronoi layout if `groups` is checked||
|473-543|Assign to every vornoi cell, nodes that are members of the same group|Called at __412-414__|
|549-551|Render vornoi cells|Called at __542__|
|560-563|Maps POS tags to a color||
|__569-612__|When hovered over a node its POS tag will be revealed|Also if `groups` is checked focus on the hovered node group and expand it|
|623-645|Creates an Object that contains groups as key and as value the group nodes|Used by __createGroupsTaskbar()__ on __302__|
|__653-712__|Creates the `group container`||
|__729-788__|Ajax requests to FlaskAPI||


# force_curved_links.js documentation

### Legend
|Line nr. &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;  &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;|Function|Notes|
|---|---|---|
|1-9|Select controls container container||
|__10-11__|Define empty variables that are used to manipulate centrality and groups||
|13-15|Initilize the empty variables from __10-11__||
|17-24|Intilaze createGraph()|__createGraph()__ handels network generation (defenied at lines __171-715__)|
|27-39|Add event listener to `show edge weight` checkbox|calls __createGraph()__ when triggered|
|41-53|Add event listener to `edge count` input|calls __createGraph()__ when triggered|
|55-71|Add event listener to `tfidf` checkbox|calls __createGraph()__ when triggered|
|73-85|Add event listener to `tokens to skip` input|calls __createGraph()__ when triggered|
|87-110|Add event listener to `show closeness centrailty` checkbox|calls __createGraph()__ when triggered|
|112-135|Add event listener to `show degree centrailty` checkbox|calls __createGraph()__ when triggered|
|137-159|Add event listener to `groups` checkbox|calls __createGraph()__ when triggered|
|__171-721__|Generates a network||
|179-186|Initilaze sendRequest()|__sendRequest()__ handels the communication with the server (__735-794__)|
|189-194|Define global variables used by the network||
|200-548|Callback function, called at __185__. Waits for the payload and creates network||
|202-204|Checks if a SVG DOM element exists. If true remove it||
|__206-210__|Selects the root elemnt on index.html and appends a svg element||
|212-224|Create simulations|See https://github.com/d3/d3-force|
|227|Append a global element to SVG element|Is zoomable and dragable|
|__--__|__Curved Links Start__|__--__|
|229|Get the links from API provides data and save them to a variable||
|230|Create a new variable __bilinks__|Used to contain the new links data|
|231|Get the nodes from API provides data and save them to a variable||
|232-234|A function used for getting nodes by their ID||
|235-245|Loop through every link and add complementary intermediate nodes and links|Needed to create curved links. The new links will be added to __bilinks__. This infor is needed for rendering the path, which is handled by *positionLink()* at __405-420__|
|__--__|__Curved Links End__|__--__|
|249-255|Append link elements into the global element||
|257-267|Checks if `show edge weight` is checked. If true change links width||
|269-289|Append nodes into the global element.|Hover(__573-616__), click (__361-378__) and drag(__423-438__) function are called|
|291-297|Append SVG circle into the nodes||
|__299-309__|Checks if `groups` is checked. If true change circle color and create `groups container` (see __658-718__)||
|311-319|Checks if any from the centrality checboxes is checked. If true change circle radius||
|321-331|Append labels to the nodes||
|335|Callable function that adds zoom functionality to the svg|__zoom_handler()__|
|337|Call __zoom_handler()__ on svg element.|SVG element defined at __206-210__|
|340-342|Zoom function that handels element dimension transformation||
|344|Assign simmulation to nodes|__ticked()__ is called (see __387-420__)|
|346|Assign simmulation to edges||
|350-384|The find neigbour logic|When a node is clicked (__287__) only its direct neighbors are shown|
|387-420|Simmulates forces and makes network elements interactive|See https://github.com/d3/d3-force|
|423-438|Simmulates draging forces||
|443-470|Creates a voronoi layout if `groups` is checked||
|477-547|Assign to every vornoi cell, nodes that are members of the same group|Called at __400-402__|
|553-553|Render vornoi cells|Called at __546__|
|564-567|Maps POS tags to a color||
|__573-616__|When hovered over a node its POS tag will be revealed|Also if `groups` is checked focus on the hovered node group and expand it|
|627-650|Creates an Object that contains groups as key and as value the group nodes|Used by __createGroupsTaskbar()__ on __304__|
|__658-718__|Creates the `group container`||
|__729-788__|Ajax requests to FlaskAPI||