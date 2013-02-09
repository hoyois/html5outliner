(function() {
/*____BEGIN_OPTIONS____*/
var numbering = 0001, linkColor = '', clickOutside = true, showDetails = false;
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
		" + (linkColor ? "color:" + linkColor + ";" : "") + "\
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
		max-width:500px;\
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
if(numbering > 0) CSSRules.push("#h5o-inside li::before{\
		content:" + (numbering === 2 ? "counters(li,\".\")" : "counter(li)") + "\".\";\
		display:block;\
		left:-10.5em;\
		position:absolute;\
		text-align:right;\
		width:10em;\
	}");
else CSSRules.push("#h5o-inside>ol>li{margin-left:0;}");
/*_____END_CSS_____*/

// This must be global so that event listener can be removed when clicking on bookmarklet again
if(!window.h5o_sdWoNJpsAgQGAaf) window.h5o_sdWoNJpsAgQGAaf = function() {
	document.removeEventListener("click", h5o_sdWoNJpsAgQGAaf, false);
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
HTMLOutline(document.body);
if(!document.body.sectionList) return; // HTML4 frameset documents
inside.appendChild(printOutline(document.body.sectionList));
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
	
	if(section.heading === null || /^[ \r\n\t]*$/.test(section.heading.text)) {
		li.className = "h5o-notitle";
		switch(section.associatedNodes[0].nodeName.toLowerCase()) {
			case "body": title.textContent = "Document"; break;
			case "article": title.textContent = "Article"; break;
			case "aside": title.textContent = "Aside"; break;
			case "nav": title.textContent = "Navigation"; break;
			case "section": title.textContent = "Section"; break;
			default: title.textContent = "Empty title";
		}
	} else title.textContent = section.heading.text;
	
	var node = section.associatedNodes[0];
	if(node.sectionType !== 1 && node.sectionType !== 2) node = section.heading;
	title.href = "#" + node.id;
	
	title.addEventListener("click", function(event) {
		event.preventDefault();
		node.scrollIntoView();
	}, false);
	
	if(showDetails) {
		var details = "";
		if(section.associatedNodes[0].sectionType) details += "<" + section.associatedNodes[0].nodeName.toLowerCase() + ">, ";
		if(section.heading) details += "rank:−" + (-section.heading.rank) + ", depth:" + section.heading.depth + ", ";
		details += "#nodes:" + section.associatedNodes.length;
		title.title = details;
	}
	
	li.appendChild(printOutline(section.childSections));
	return li;
}

// Section class
function Section() {
	this.parentSection = null;
	this.childSections = [];
	this.firstChild = null;
	this.lastChild = null;
	this.appendChild = function(section) {
		section.parentSection = this;
		this.childSections.push(section);
		if(this.firstChild === null) this.firstChild = section;
		this.lastChild = section;
	};

	this.heading = null; // heading element associated with the section, if any

	this.associatedNodes = []; // DOM nodes associated with the section
}

// Main function
function HTMLOutline(root) {
	
	// BEGIN OUTLINE ALGORITHM
	// STEP 1
	var currentOutlinee = null; // element whose outline is being created
	// STEP 2
	var currentSection = null; // current section
	
	// STEP 3
	// Minimal stack object
	var stack = {"lastIndex": -1};
	stack.isEmpty = function() {
		return stack.lastIndex === -1;
	};
	stack.push = function(e) {
		stack[++stack.lastIndex] = e;
		stack.top = e;
	};
	stack.pop = function() {
		var e = stack.top;
		delete stack[stack.lastIndex--];
		stack.top = stack[stack.lastIndex];
		return e;
	};
	
	// STEP 4 (minus DOM walk which is at the end)
	function enter(node) {
		if(isElement(node)) {
			if(!stack.isEmpty() && (isHeadingElement(stack.top) || isHidden(stack.top))) {
				// Do nothing
			} else if(isHidden(node)) {
				stack.push(node);
			} else if(isSectioningContentElement(node) || isSectioningRootElement(node)) {
				// if(currentOutlinee !== null && currentSection.heading === null) {
					// Create implied heading
				// }
				if(currentOutlinee !== null) stack.push(currentOutlinee);
				currentOutlinee = node;
				currentSection = new Section();
				associateNodeWithSection(currentOutlinee, currentSection);
				currentOutlinee.appendSection(currentSection);
			} else if(currentOutlinee === null) {
				// Do nothing
			} else if(isHeadingElement(node)) {
				if(currentSection.heading === null) currentSection.heading = node;
				else if(currentOutlinee.lastSection.heading === null || node.rank >= currentOutlinee.lastSection.heading.rank) {
					currentSection = new Section();
					currentSection.heading = node;
					currentOutlinee.appendSection(currentSection);
				} else {
					var candidateSection = currentSection;
					do {
						if(node.rank < candidateSection.heading.rank) {
							currentSection = new Section();
							currentSection.heading = node;
							candidateSection.appendChild(currentSection);
							break;
						}
						var newCandidate = candidateSection.parentSection;
						candidateSection = newCandidate;
					} while(true);
				}
				stack.push(node);
			} // else {
				// Do nothing
			// }
		}
	}
	
	function exit(node) {
		if(isElement(node)) {
			if(!stack.isEmpty() && node === stack.top) stack.pop();
			else if(!stack.isEmpty() && (isHeadingElement(stack.top) || isHidden(stack.top))) {
				// Do nothing
			} else if(!stack.isEmpty() && isSectioningContentElement(node)) {
				// if(currentSection.heading === null) {
					// Create implied heading
				// }
				currentOutlinee = stack.pop();
				currentSection = currentOutlinee.lastSection;
				for(var i = 0; i < node.sectionList.length; i++) {
					currentSection.appendChild(node.sectionList[i]);
				}
			} else if(!stack.isEmpty() && isSectioningRootElement(node)) {
				// if(currentSection.heading === null) {
					// Create implied heading
				// }
				currentOutlinee = stack.pop();
				currentSection = currentOutlinee.lastSection;
				while(currentSection.childSections.length > 0) {
					currentSection = currentSection.lastChild;
				}
			} else if(isSectioningContentElement(node) || isSectioningRootElement(node)) {
				// if(currentSection.heading === null) {
					// Create implied heading
				// }
				// The algorith says to end the walk here, but that's assuming root is a sectioning element
				// Instead we reset the algorithm for subsequent top-level sectioning elements
				currentOutlinee = null;
				currentSection = null;
			} // else {
				// Do nothing
			// }
		}
		if(node.associatedSection === null && currentSection !== null) associateNodeWithSection(node, currentSection);
	}
	
	// STEP 5
	// The heading associated to node is node.associatedSection.heading, if any
	// END OUTLINE ALGORITHM
	
	// Now we must make the necessary definitions for the above to make sense
	function associateNodeWithSection(node, section) {
		section.associatedNodes.push(node);
		node.associatedSection = section;
	}
	
	function isElement(node) {
		return node.nodeType === 1;
	}
	
	function isHidden(node) {
		return node.hidden;
	}
	
	function isSectioningContentElement(node) {
		return node.sectionType === 1;
	}
	
	function isSectioningRootElement(node) {
		return node.sectionType === 2;
	}
	
	function isHeadingElement(node) {
		return node.rank !== undefined;
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
				case "h1": case "h2": case "h3": case "h4": case "h5": case "h6":
					extendHeadingElement(node);
					break;
				case "hgroup":
					extendHeadingGroupElement(node);
					break;
				default:
					extendNode(node);
			}
		} else extendNode(node);
	}
	
	function extendNode(node) {
		node.associatedSection = null;
	}
	
	function extendSectioningElement(node) {
		extendNode(node);
		node.sectionList = [];
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
		node.sectionType = 1;
	}
	
	function extendSectioningRootElement(node) {
		extendSectioningElement(node);
		node.sectionType = 2;
	}
	
	function extendHeadingContentElement(node) {
		extendNode(node);
		Object.defineProperty(node, "depth", {"get": function() {
			var section = node.associatedSection;
			var depth = 1;
			if(section !== null) {
				while(section = section.parentSection) ++depth;
			}
			return depth;
		}, "configurable": true, "enumerable": true});
	}
	
	function extendHeadingElement(node) {
		extendHeadingContentElement(node);
		node.rank = -parseInt(node.nodeName.charAt(1));
		node.text = node.textContent;
	}
	
	function extendHeadingGroupElement(node) {
		extendHeadingContentElement(node);
		
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
	
	// Walk the DOM subtree of root
	var node = root;
	start: while(node) {
		extend(node);
		enter(node);
		if(node.firstChild) {
			node = node.firstChild;
			continue start;
		}
		while(node) {
			exit(node);
			if(node === root) break start;
			if(node.nextSibling) {
				node = node.nextSibling;
				continue start;
			}
			node = node.parentNode;
		}
	}
}

})();

