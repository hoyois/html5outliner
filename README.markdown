# HTML5Outliner.js

A Javascript implementation of the 8 steps of the HTML [outline algorithm](http://www.whatwg.org/specs/web-apps/current-work/multipage/sections.html#outline).

This script provides the function

<pre>Array(Section) <b>HTMLOutline</b>(DOMNode root, boolean modifyDOM);</pre>

`Section` is a new object type implementing the concept of [HTML section](http://www.whatwg.org/specs/web-apps/current-work/multipage/sections.html#concept-section). A section has the following properties:

* `parentSection` is the parent section if any, null otherwise;
* `childSections` is the array of subsections;
* `heading` is the heading element associated with the section if any, null otherwise;
* `associatedNodes` is the array of all DOM nodes that are associated with the section, in DOM order (in particular, `associatedNodes[0]` is either a sectioning element or, for implied sections, a heading element);
* `associatedElements` is the subarray of `associatedNodes` consisting of DOM elements.

The `root` argument must be a sectioning element (it defaults to `document.body`). If the `modifyDOM` argument is `false`, `outlineDOM` first creates a deep clone of `root` to work on and does not add properties to existing DOM nodes. In either case, it adds several properties to the nodes in the DOM subtree of `root` or its clone:

* `associatedSection` is the section associated with the node (defined for all nodes);
* `sectionList` is the outline of a sectioning element, i.e., the list of its top-level sections;
* `rank` is the [rank](http://www.whatwg.org/specs/web-apps/current-work/multipage/sections.html#rank) of a heading element;
* `text` is the [text](http://www.whatwg.org/specs/web-apps/current-work/multipage/sections.html#the-hgroup-element) of a heading element.

The return value of the function is `root.sectionList`, the outline of `root`.



