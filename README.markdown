# HTMLOutliner.js

A Javascript implementation of the HTML [outline algorithm](http://www.whatwg.org/specs/web-apps/current-work/multipage/sections.html#outline).

This script provides the function

<pre>void <b>HTMLOutline</b>(Node <i>root</i>);</pre>

and defines a new object type `Section` implementing the concept of [HTML section](http://www.whatwg.org/specs/web-apps/current-work/multipage/sections.html#concept-section). A section has the following properties:

* `parentSection` is the parent section if any, `null` otherwise;
* `childSections` is the array of subsections;
* `explicit` is a boolean indicating whether the section is an explicit section, i.e., corresponds to a sectioning element;
* `heading` is the heading of the section: it can be a heading content element or `null` if the section has an implied heading;
* `associatedNodes` is the array of all DOM nodes that are associated with the section, in algorithm order (in particular, `associatedNodes[0]` is a sectioning element for explicit sections).

The function `HTMLOutline` adds several properties to the nodes in the DOM subtree of `root`:

* `associatedSection` is the section associated with a node if any, `null` otherwise;
* `parentSection` is the *parent section* of a sectioning root if any, `null` otherwise (this is defined in the outline algorithm);
* `sectionList` is the outline of a sectioning element, i.e., the list of its top-level sections;
* `text` is the [text](http://www.whatwg.org/specs/web-apps/current-work/multipage/sections.html#the-hgroup-element) of a heading content element;
* `rank` is the [rank](http://www.whatwg.org/specs/web-apps/current-work/multipage/sections.html#rank) of a heading content element (an integer between -6 and -1);
* `depth` is the [outline depth](http://www.whatwg.org/specs/web-apps/current-work/multipage/sections.html#outline-depth) of a heading content element which is associated with a section.

### License

[WTFPL-2.0](https://tldrlegal.com/license/do-wtf-you-want-to-public-license-v2-(wtfpl-2.0))
