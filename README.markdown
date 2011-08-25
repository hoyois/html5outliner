# HTMLOutliner.js

A Javascript implementation of the HTML [outline algorithm](http://www.whatwg.org/specs/web-apps/current-work/multipage/sections.html#outline).

This script provides the function

<pre>void <b>HTMLOutline</b>(Node <i>root</i>);</pre>

and defines a new object type `Section` implementing the concept of [HTML section](http://www.whatwg.org/specs/web-apps/current-work/multipage/sections.html#concept-section). A section has the following properties:

* `parentSection` is the parent section if any, `null` otherwise;
* `childSections` is the array of subsections;
* `heading` is the heading content element associated with the section if any, `null` otherwise;
* `associatedNodes` is the array of all DOM nodes that are associated with the section, in algorithm order (in particular, `associatedNodes[0]` is a sectioning element for explicit sections).

The function `HTMLOutline` adds several properties to the nodes in the DOM subtree of `root`:

* `associatedSection` is the section associated with a node if any, `null` otherwise;
* `sectionList` is the outline of a sectioning element, i.e., the list of its top-level sections;
* `text` is the [text](http://www.whatwg.org/specs/web-apps/current-work/multipage/sections.html#the-hgroup-element) of a heading content element;
* `rank` is the [rank](http://www.whatwg.org/specs/web-apps/current-work/multipage/sections.html#rank) of a heading content element;
* `depth` is the [depth](http://www.whatwg.org/specs/web-apps/current-work/multipage/sections.html#outline-depth) of a heading content element.

## Note on the outline algorithm

The outline algorithm only produces the correct result when the input is a sectioning element, and the steps 5 and 6 of the algorithm are vacuous. One can try to apply the algorithm directly to an arbitrary node, but it only produces the outline of the first sectioning descendent of the node and associates unrelated nodes to the first section of that outline. For example, if the algorithm is applied to

	<div>
		<section></section>
		<section></section>
		<h1></h1>
	</div>
	
only one section is created for the first `section` element, and all nodes are associated with that section. Applying the `HTMLOutline` function, however, results in two sections being created, each associated with a `section` element, and no other node is associated to a section.
