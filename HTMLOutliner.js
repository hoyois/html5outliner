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
				// if(currentOutlinee !== null && !currentSection.heading) {
					// Algorithm says to "create implied heading" here, which is pointless:
					// a section has an "implied heading" iff it has no explicit heading
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
				else if(node.rank >= currentOutlinee.lastSection.heading.rank) {
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
				// The algorith says to end the walk here, but that's assuming root is a sectioning element
				// Instead we reset the algorithm for subsequent top-level sectioning elements
				currentOutlinee = null;
				currentSection = null;
			} // else if(currentOutlinee === null) {
				// Do nothing
			// } else {
				// Do nothing
			// }
		}
		if(node.associatedSection === null && currentSection !== null) associateNodeWithSection(node, currentSection);
	}
	
	// STEP 5 and 6
	// Vacuous steps
	// STEP 7
	// The heading associated to node is node.associatedSection.heading, if any
	// STEP 8
	// Nothing to do
	// END OUTLINE ALGORITHM
	
	// Now we must make the necessary definitions for the above to make sense
	function associateNodeWithSection(node, section) {
		section.associatedNodes.push(node);
		node.associatedSection = section;
	}
	
	function isElement(node) {
		return node.nodeType === 1;
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
		node.sectionType = 1;
	}
	
	function extendSectioningRootElement(node) {
		extendSectioningElement(node);
		node.sectionType = 2;
	}
	
	function extendHeadingContentElement(node) {
		extendNode(node);
		Object.defineProperty(node, "depth", {"get": function(){
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

