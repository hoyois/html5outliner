// Section class
function Section(explicit) {
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
	
	this.explicit = explicit;
	this.associatedNodes = []; // DOM nodes associated with the section
	
	// this.heading is defined for all sections by the function HTMLOutline:
	// It is either a heading content element or null for an implied heading
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
	
	// STEP 4
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
	
	// When entering a node
	function enter(node) {
		if(isElement(node)) {
			if(!stack.isEmpty() && (isHeadingContentElement(stack.top) || isHidden(stack.top))) {
				// Do nothing
			} else if(isHidden(node)) {
				stack.push(node);
			} else if(isSectioningContentElement(node)) {
				if(currentOutlinee !== null) {
					if(hasNoHeading(currentSection)) createImpliedHeading(currentSection);
					stack.push(currentOutlinee);
				}
				currentOutlinee = node;
				currentSection = new Section(true);
				associateNodeWithSection(currentOutlinee, currentSection);
				currentOutlinee.appendSection(currentSection);
			} else if(isSectioningRootElement(node)) {
				if(currentOutlinee !== null) stack.push(currentOutlinee);
				currentOutlinee = node;
				currentOutlinee.parentSection = currentSection;
				currentSection = new Section(true);
				associateNodeWithSection(currentOutlinee, currentSection);
				currentOutlinee.appendSection(currentSection);
			} else if(currentOutlinee === null) {
				// Do nothing
				// (this step is not in the algorithm but is needed here since root may not be a sectioning element)
			} else if(isHeadingContentElement(node)) {
				if(hasNoHeading(currentSection)) currentSection.heading = node;
				else if(hasImpliedHeading(currentOutlinee.lastSection) || node.rank >= currentOutlinee.lastSection.heading.rank) {
					currentSection = new Section(false);
					currentSection.heading = node;
					currentOutlinee.appendSection(currentSection);
				} else {
					var candidateSection = currentSection;
					while(node.rank >= candidateSection.heading.rank) candidateSection = candidateSection.parentSection;
					currentSection = new Section(false);
					currentSection.heading = node;
					candidateSection.appendChild(currentSection);
				}
				stack.push(node);
			} // else {
				// Do nothing
			// }
		}
	}
	
	// When exiting a node
	function exit(node) {
		if(isElement(node)) {
			if(!stack.isEmpty() && node === stack.top) stack.pop();
			else if(!stack.isEmpty() && (isHeadingContentElement(stack.top) || isHidden(stack.top))) {
				// Do nothing
			} else if(!stack.isEmpty() && isSectioningContentElement(node)) {
				if(hasNoHeading(currentSection)) createImpliedHeading(currentSection);
				currentOutlinee = stack.pop();
				currentSection = currentOutlinee.lastSection;
				for(var i = 0; i < node.sectionList.length; i++) {
					currentSection.appendChild(node.sectionList[i]);
				}
			} else if(!stack.isEmpty() && isSectioningRootElement(node)) {
				if(hasNoHeading(currentSection)) createImpliedHeading(currentSection);
				currentSection = currentOutlinee.parentSection;
				currentOutlinee = stack.pop();
			} else if(isSectioningContentElement(node) || isSectioningRootElement(node)) {
				if(hasNoHeading(currentSection)) createImpliedHeading(currentSection);
				// If the root is a sectioning element, the walk ends here
				// If not, we reset the algorithm for subsequent top-level sectioning elements
				currentOutlinee = null;
				currentSection = null;
			} // else {
				// Do nothing
			// }
		}
		if(node.associatedSection === null && currentSection !== null) associateNodeWithSection(node, currentSection);
	}
	
	// STEP 5
	// The heading associated to node is node.associatedSection.heading
	// END OUTLINE ALGORITHM
	
	// Now we must make the necessary definitions for the above to make sense...
	
	function associateNodeWithSection(node, section) {
		section.associatedNodes.push(node);
		node.associatedSection = section;
	}
	
	function hasNoHeading(section) {
		return section.heading === undefined;
	}
	
	function hasImpliedHeading(section) {
		return section.heading === null;
	}
	
	function createImpliedHeading(section) {
		section.heading = null;
	}
	
	// Types of nodes
	function isElement(node) {
		return node.nodeType === 1;
	}
	
	function isHidden(node) {
		return node.hidden;
	}
	
	function isSectioningRootElement(node) {
		return ["blockquote", "body", "details", "dialog", "fieldset", "figure", "td"].indexOf(node.nodeName.toLowerCase()) !== -1;
	}
	
	function isSectioningContentElement(node) {
		return ["article", "aside", "nav", "section"].indexOf(node.nodeName.toLowerCase()) !== -1;
	}
	
	function isSectioningElement(node) {
		return isSectioningRootElement(node) || isSectioningContentElement(node);
	}
	
	function isHeadingElement(node) {
		return ["h1", "h2", "h3", "h4", "h5", "h6"].indexOf(node.nodeName.toLowerCase()) !== -1;
	}
	
	function isHeadingGroupElement(node) {
		return "hgroup" === node.nodeName.toLowerCase();
	}
	
	function isHeadingContentElement(node) {
		return isHeadingElement(node) || isHeadingGroupElement(node);
	}
	
	// Add properties to DOM nodes
	function extend(node) {
		if(isSectioningElement(node)) extendSectioningElement(node);
		else if(isHeadingElement(node)) extendHeadingElement(node);
		else if(isHeadingGroupElement(node)) extendHeadingGroupElement(node);
		else extendNode(node);
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
	
	function extendHeadingContentElement(node) {
		extendNode(node);
		Object.defineProperty(node, "depth", {"get": function() {
			var section = node.associatedSection;
			if(section === null) return undefined;
			var depth = 1;
			while(section = section.parentSection) ++depth;
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
}

