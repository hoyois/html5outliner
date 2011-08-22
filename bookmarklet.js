// Strip spaces and comments:
// replace \s?([=+<;?&|>:}{\(\)-])\s? by $1
// replace \s!== by !==
// remove \s*//.*
// remove \s*\\?\n\s*
(function() {
/*____BEGIN_OPTIONS____*/
var numbering = 1, showTags = true, clickOutside = true, createLinks = true;
/*_____END_OPTIONS_____*/

/*_____BEGIN_CSS_____*/
var CSSRules = [
	// CSS reset (except: text-rendering, link color)
	// directional properties should not be reset, but no browser implements
	// the abstractions of the CSS3 writing mode module
	// and not setting direction:ltr breaks the layout...
	"#h5o-outside,#h5o-outside *{\
		background-color:transparent;\
		border:none;\
		border-radius:0;\
		bottom:auto;\
		box-shadow:none;\
		box-sizing:content-box;\
		clear:none;\
		cursor:auto;\
		direction:ltr;\
		float:none;\
		font-family:sans-serif;\
		font-size:small;\
		font-stretch:normal;\
		font-style:normal;\
		font-variant:normal;\
		font-weight:normal;\
		height:auto;\
		left:auto;\
		letter-spacing:normal;\
		line-height:normal;\
		margin:0;\
		opacity:1;\
		outline:none;\
		overflow:visible;\
		padding:0;\
		position:static;\
		right:auto;\
		text-align:left;\
		text-decoration:none;\
		text-indent:0;\
		text-overflow:clip;\
		text-shadow:none;\
		text-transform:none;\
		top:auto;\
		vertical-align:baseline;\
		visibility:visible;\
		white-space:normal;\
		width:auto;\
		word-break:normal;\
		word-spacing:normal;\
		word-wrap:normal;\
		zoom:normal;\
	}",
	"#h5o-inside *:not([href]){\
		color:black;\
	}",
	"#h5o-outside{\
		background-color:transparent;\
		box-sizing:border-box;\
		display:block;\
		height:100%;\
		padding:10px;\
		pointer-events:none;\
		position:fixed;\
		right:0px;\
		top:0px;\
		max-width:40%;\
		z-index:2147483647;\
	}",
	"#h5o-inside{\
		background-color:white;\
		border:2px solid black;\
		box-sizing:border-box;\
		display:block;\
		max-width:100%;\
		max-height:100%;\
		opacity:.9;\
		overflow:auto;\
		padding:10px;\
		pointer-events:auto;\
	}",
	"#h5o-inside ol{\
		counter-reset:li;\
		display:block;\
		margin:0;\
		padding:0;\
	}",
	"#h5o-inside li{\
		counter-increment:li;\
		display:list-item;\
		list-style-type:none;\
		margin-left:" + (numbering === 2 ? "2em" : "1.5em") + ";\
		position:relative;\
	}",
	"#h5o-inside a{\
		display:inline;\
	}",
	"#h5o-inside a:hover{\
		text-decoration:underline;\
	}",
	"#h5o-inside li.h5o-notitle>a{\
		font-style:italic;\
	}",
];
if(numbering > 0) {
	CSSRules.push("#h5o-inside li::before{\
		content:" + (numbering === 2 ? "counters(li,\".\")" : "counter(li)") + "\".\";\
		display:block;\
		left:-10.5em;\
		position:absolute;\
		text-align:right;\
		width:10em;\
	}");
} else {
	CSSRules.push("#h5o-inside>ol>li{\
		margin-left:0;\
	}");
}
/*_____END_CSS_____*/

// This must be global so that event listener can be removed when clicking on bookmarklet again
if(!window.h5o_sdWoNJpsAgQGAaf) window.h5o_sdWoNJpsAgQGAaf = function() {
	document.removeEventListener("click", h5o_sdWoNJpsAgQGAaf, false);
	var i = 0;
	var e;
	while(e = document.getElementById("h5o-id-" + i)) {
		e.removeAttribute("id");
		++i;
	}
	document.body.removeChild(document.getElementById("h5o-outside"));
};

if(document.getElementById("h5o-outside")) {
	h5o_sdWoNJpsAgQGAaf();
	return;
}

var toc = document.createElement("div");
toc.id = "h5o-outside";

// Stylesheet
var style = document.createElement("style");
style.type = "text/css";
toc.appendChild(style);
document.body.appendChild(toc);

for(var i = 0; i < CSSRules.length; i++) {
	try {
		style.sheet.insertRule(CSSRules[i].replace(/;/g, " !important;"), i);
	} catch(e) {}
}

var inside = document.createElement("div");
inside.id = "h5o-inside";

if(clickOutside) {
	inside.addEventListener("click", function(event) {event.stopPropagation();}, false);
	document.addEventListener("click", h5o_sdWoNJpsAgQGAaf, false);
}

// Create outline
var idCounter = 0;
var outline = printOutline(HTMLOutline(document.body, true));
inside.appendChild(outline);
toc.appendChild(inside);


function printOutline(outline) {
	var ol = document.createElement("ol");
	for(var i = 0; i < outline.length; i++) {
		ol.appendChild(printSection(outline[i]));
	}
	return ol;
}

function printSection(section) {
	var li = document.createElement("li");
	var title = document.createElement("a");
	li.appendChild(title);

	if(section.heading === null) {
		title.textContent = "No title" + (showTags ? " " + "(" + section.associatedNodes[0].nodeName.toLowerCase() + ")" : "");
		li.className = "h5o-notitle";
	} else if(section.heading.text === "") {
		title.textContent = "Empty title";
		li.className = "h5o-notitle";
	} else {
		title.textContent = section.heading.text;
	}
	
	if(createLinks) {
		var node = section.associatedNodes[0];
		if(node.sectionType !== 1 && node.sectionType !== 2) node = section.heading;
		if(!node.id) {
			node.id = "h5o-id-" + idCounter;
			++idCounter;
		}
		title.href = "#" + node.id;
	}
	
	li.appendChild(printOutline(section.childSections));
	return li;
}

// Section class
function Section() {
	this.parentSection = null;
	this.childSections = new Array();
	this.firstChild = null;
	this.lastChild = null;
	this.appendChild = function(section) {
		section.parentSection = this;
		this.childSections.push(section);
		if(this.firstChild === null) this.firstChild = section;
		this.lastChild = section;
	};

	this.heading = null; // heading element associated with the section, if any

	this.associatedNodes = new Array(); // DOM nodes associated with the section
	this.associatedElements = new Array();
}

// Main function
function HTMLOutline(root, modifyDOM) {
	if(root === undefined) root = document.body;

	if(!modifyDOM) root = root.cloneNode(true);

	// BEGIN OUTLINE ALGORITHM
	// STEP 1
	var currentOutlinee = null; // element whose outline is being created
	// STEP 2
	var currentSection = null; // current section

	// STEP 3
	// Minimal stack object
	var stack = {"lastIndex": -1, "isEmpty": true};
	stack.push = function(e) {
		stack[++stack.lastIndex] = e;
		stack.top = e;
		stack.isEmpty = false;
	};
	stack.pop = function() {
		var e = stack.top;
		delete stack[stack.lastIndex--];
		if(stack.lastIndex === -1) stack.isEmpty = true;
		else stack.top = stack[stack.lastIndex];
		return e;
	};

	// STEP 4 (minus DOM walk which is at the end)
	// The following functions implement word for word the substeps of step 4
	function enter(node) {
		if(isElement(node)) {
			if(!stack.isEmpty && isHeadingElement(stack.top)) {
				// Do nothing
			} else if(isSectioningContentElement(node) || isSectioningRootElement(node)) {
				if(currentOutlinee !== null && !currentSection.heading) {
					// Algorithm says to "create implied heading" here,
					// which is pointless in this implementation
				}
				if(currentOutlinee !== null) stack.push(currentOutlinee);
				currentOutlinee = node;
				currentSection = new Section();
				associateNodeWithSection(currentOutlinee, currentSection);
				currentOutlinee.appendSection(currentSection);
			} else if(currentOutlinee === null) {
				// Do nothing
			} else if(isHeadingElement(node)) {
				if(currentSection.heading === null) currentSection.heading = node;
				else if(node.rank >= currentOutlinee.lastSection.heading.rank) {
					var newSection = new Section();
					currentOutlinee.appendSection(newSection);
					currentSection = newSection;
					currentSection.heading = node;
				} else {
					var candidateSection = currentSection;
					do {
						if(node.rank < candidateSection.heading.rank) {
							var newSection = new Section();
							candidateSection.appendChild(newSection);
							currentSection = newSection;
							currentSection.heading = node;
							break;
						}
						var newCandidate = candidateSection.parentSection;
						candidateSection = newCandidate;
					} while(true);
				}
				stack.push(node);
			} else {
				// Do nothing
			}
		}
	}

	function exit(node) {
		if(isElement(node)) {
			if(!stack.isEmpty && node === stack.top) stack.pop();
			else if(!stack.isEmpty && isHeadingElement(stack.top)) {
				// Do nothing
			} else if(!stack.isEmpty && isSectioningContentElement(node)) {
				currentOutlinee = stack.pop();
				currentSection = currentOutlinee.lastSection;
				for(var i = 0; i < node.sectionList.length; i++) {
					currentSection.appendChild(node.sectionList[i]);
				}
			} else if(!stack.isEmpty && isSectioningRootElement(node)) {
				currentOutlinee = stack.pop();
				currentSection = currentOutlinee.lastSection;
				while(currentSection.childSections.length > 0) {
					currentSection = currentSection.lastChild;
				}
			} else if(isSectioningContentElement(node) || isSectioningRootElement(node)) {
				currentSection = currentOutlinee.firstSection;
				endWalk(); // Jump to step 5
			} else if(currentOutlinee === null) {
				// Do nothing
			} else {
				// Do nothing
			}
		}
		if(node.associatedSection === null && currentSection !== null) associateNodeWithSection(node, currentSection);
	}

	function endWalk() {
		// STEP 5
		// According to the algorithm, we should check if currentOutlinee is null,
		// but this can't actually happen since root is a sectioning element
		// STEP 6
		enter = function(node) {associateNodeWithSection(node, currentOutlinee.firstSection);};
		exit = function(node) {};
		// STEP 7
		// The heading associated to node is node.associatedSection.heading, if any
		// STEP 8
		// Nothing to do
		// END OUTLINE ALGORITHM
	}

	// Now we must make the necessary definitions for the above to make sense...
	function associateNodeWithSection(node, section) {
		section.associatedNodes.push(node);
		if(isElement(node)) section.associatedElements.push(node);
		node.associatedSection = section;
	}

	function isElement(node) {
		return node.nodeType === node.ELEMENT_NODE;
	}

	function isSectioningContentElement(node) {
		return node.sectionType === node.SECTION_CONTENT;
	}

	function isSectioningRootElement(node) {
		return node.sectionType === node.SECTION_ROOT;
	}

	function isHeadingElement(node) {
		return node.sectionType === node.SECTION_HEADING;
	}

	function extend(node) {
		if(node.nodeType === 1) {
			switch(node.nodeName.toLowerCase()) {
				case "blockquote": case "body": case "details": case "fieldset": case "figure": case "td":
					extendSectioningRootElement(node);
					break;
				case "article": case "aside": case "nav": case "section":
					extendSectioningContentElement(node);
					break;
				case "hgroup":
					extendHeadingGroupElement(node);
					break;
				case "h1": case "h2": case "h3": case "h4": case "h5": case "h6": case "hgroup":
					extendHeadingTitleElement(node);
					break;
				default:
					extendElement(node);
			}
		} else extendNode(node);
	}

	function extendNode(node) {
		node.associatedSection = null;

		// Sectioning type constants
		node.SECTION_ROOT = 1;
		node.SECTION_CONTENT = 2;
		node.SECTION_HEADING = 3;
	}

	function extendElement(node) {
		extendNode(node);
	}

	function extendSectioningElement(node) {
		extendElement(node);
		node.sectionList = new Array();
		node.firstSection = null;
		node.lastSection = null;

		node.appendSection = function(section) {
			this.sectionList.push(section);
			if(this.firstSection === null) this.firstSection = section;
			this.lastSection = section;
		};
	}

	function extendSectioningContentElement(node) {
		extendSectioningElement(node);
		node.sectionType = node.SECTION_CONTENT;
	}

	function extendSectioningRootElement(node) {
		extendSectioningElement(node);
		node.sectionType = node.SECTION_ROOT;
	}

	function extendHeadingElement(node) {
		extendElement(node);
		node.sectionType = node.SECTION_HEADING;
	}

	function extendHeadingTitleElement(node) {
		extendHeadingElement(node);
		node.rank = -parseInt(node.nodeName.charAt(1));
		node.text = node.textContent;
	}

	function extendHeadingGroupElement(node) {
		extendHeadingElement(node);

		for(var i = 1; i <= 6; i++) {
			var h = node.getElementsByTagName("h" + i);
			if(h.length > 0) {
				node.rank = -i;
				node.text = h[0].textContent;
				break;
			}
		}

		if(node.rank === undefined) {
			node.rank = -1;
			node.text = "";
		}
	}

	try {
		extend(root);
		if(!isSectioningContentElement(root) && !isSectioningRootElement(root)) {
			throw new Error(root.toString() + " is not a sectioning content element or a sectioning root element.");
		}
		// Walk the DOM subtree of root
		enter(root);
		var node = root.firstChild;
		start: while(node) {
			extend(node);
			enter(node);
			if(node.firstChild) {
				node = node.firstChild;
				continue start;
			}
			while(node) {
				if(node === root) break start;
				exit(node);
				if(node.nextSibling) {
					node = node.nextSibling;
					continue start;
				}
				node = node.parentNode;
			}
		}
		exit(root);
	} catch(error) {
		return error;
	}
	return root.sectionList;
}

})();

