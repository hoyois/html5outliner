function createOutline() {

var text = document.getElementById("html_input_area").value;
var output = document.getElementById("output");
output.innerHTML = "";
var deep = document.getElementById("deep_outline").checked;
var notes;

try{
	// try XML parser first
	var xml = (new DOMParser()).parseFromString(text, "text/xml");
	var parserError = xml.getElementsByTagName("parsererror")[0];
	if(parserError) {
		addNote("Used HTML parser (<code>&lt;body&gt;</code> was added if not present)");
		var xml = document.implementation.createHTMLDocument("");
		try {
			xml.documentElement.innerHTML = text;
		} catch(error) {
			throw new Error("Invalid HTML");
		}
	} // else addNote("Used XML parser")
	
	var roots = getSectioningRoots(xml, deep);
	if(roots.length === 0) { // create virtual root
		var root = document.createElement("body");
		for(var i = 0; i < xml.childNodes.length; i++) {
			if(xml.childNodes[i].nodeType !== 10) root.appendChild(xml.childNodes[i]);
		}
		root.isVirtual = true;
		roots = [root];
		addNote("No sectioning root element found: added virtual root");
	} else if(!deep && roots.length > 1) {
		addNote("Several top-level sectioning roots elements found");
	}
	
	for(var i = 0; i < roots.length; i++) {
		output.appendChild(printOutline(HTMLOutline(roots[i], true)));
	}
	
	if(notes) output.appendChild(notes);
	
} catch(error) {
	output.appendChild(printError(error.message));
}

function addNote(html) {
	if(!notes) {
		notes = document.createElement("div");
		notes.className = "notes";
		notes.innerHTML = "<b>Notes</b><ol></ol>";
	}
	var li = document.createElement("li");
	li.innerHTML = html;
	notes.childNodes[1].appendChild(li);
}

function printOutline(outline) {
	var ol = document.createElement("ol");
	ol.className = "outline";
	for(var i = 0; i < outline.length; i++) {
		ol.appendChild(printSection(outline[i]));
	}
	return ol;
}

function printSection(section) {
	var li = document.createElement("li");
	var title = document.createElement("span");
	title.className = "sec_title";
	//var details = document.createElement("span");
	li.appendChild(title);
	//li.appendChild(details)
	//details.style.fontSize = "small";
	
	if(section.heading === null) {
		title.textContent = "Untitled section";
		title.style.fontStyle = "italic";
	} else {
		title.textContent = section.heading.text;
	}
	
	// var element = "", heading = "";
	// 	if(section.associatedNodes[0].sectionType === 1 || section.associatedNodes[0].sectionType === 2) {
	// 		if(section.associatedNodes[0].isVirtual) {
	// 			title.style.color = "gray";
	// 		} else {
	// 			element = "<" + section.associatedNodes[0].nodeName.toLowerCase() + ">";
	// 		}
	// 	}
	// 	if(section.heading !== null) {
	// 		heading = "<" + section.heading.nodeName.toLowerCase() + ">";
	// 	}
	// 	if(element && heading) element += ", ";
	// 	details.textContent = " — " + element + heading;
	
	var details = document.createElement("ul");
	details.className = "details";
	details.style.display = "none";
	var type;
	if(section.associatedNodes[0].sectionType === 1 || section.associatedNodes[0].sectionType === 2) {
		if(section.associatedNodes[0].isVirtual) {
			title.style.color = "gray";
		} else {
			type = "<code>&lt;" + section.associatedNodes[0].nodeName.toLowerCase() + "&gt;</code>";
		}
	} else if(section.associatedNodes[0].sectionType === 2) {
		type = "<code>&lt;" + section.associatedNodes[0].nodeName.toLowerCase() + "&gt;</code>";
	} else type ="Implied section";
	var s = "";
	if(type) s += "<li>" + type + "</li>";
	if(section.heading) s+="<li>Heading rank: " + (-section.heading.rank) + "</li>"
	s+= "<li># of associated elements: " + section.associatedElements.length + "</li>";
	details.innerHTML = s;
	li.appendChild(details);
	
	var triangle = document.createElement("span");
	triangle.className = "triangle";
	triangle.textContent = "▶";
	triangle.addEventListener("click", function() {
		if(details.style.display === "none") {
			details.style.display = "block";
			this.textContent = "▼";
		} else {
			details.style.display = "none";
			this.textContent = "▶";
		}
	}, false);
	li.insertBefore(triangle, li.firstChild);
	
	li.appendChild(printOutline(section.childSections));
	return li;
}

function printError(message) {
	var div = document.createElement("div");
	div.innerHTML = "<h4>Error!</h4>";
	var p = document.createElement("pre");
	p.className = "error";
	p.textContent = message;
	div.appendChild(p)
	return div;
}

function getSectioningRoots(xml, deep) {
	var roots = new Array();
	var node = xml;
	start: while(node) {
		var isRoot = isSectioningRoot(node);
		if(isRoot) roots.push(node);
		if((!isRoot || deep) && node.firstChild) {
			node = node.firstChild;
			continue start;
		}
		while(node) {
			if(node.nextSibling) {
				node = node.nextSibling;
				continue start;
			}
			if(node === xml) break start;
			node = node.parentNode;
		}
	}
	return roots;
}

function isSectioningRoot(node) {
	var t = node.nodeName.toLowerCase();
	return t === "blockquote" || t === "body" || t === "details" || t === "fieldset" || t === "figure" || t === "td";
}

}

