function outline() {

var url = document.getElementById("url_input").value;
var text = document.getElementById("direct_input").value;
var output = document.getElementById("output");
var notes;

// Options
var deep = document.getElementById("deep_outline").checked;
var XML = document.getElementById("xml_parser").checked;

// Direct input first
if(text) {
	processHTML((new DOMParser()).parseFromString(text, "text/xml"), text);
} else {
	var xhr = new XMLHttpRequest();
	xhr.open("GET", url, true);
	xhr.onload = function() {
		processHTML(xhr.responseXML, xhr.responseText);
	};
	output.innerHTML = "<p>Fetching URL…</p>";
	xhr.send(null);
}

function parseHTML(xml, source) {
	
	var fragment;
		
	var parserError = xml.getElementsByTagName("parsererror")[0];
	
	if(!parserError) { // valid XML
		fragment = xml.documentElement;
	} else {
		if(XML) { // Report XML error
			var errorDiv = parserError.getElementsByTagName("div")[0];
			if(!errorDiv) errorDiv = parserError;
			var error = new Error(errorDiv.textContent);
			var match = errorDiv.textContent.match(/line\s(\d+)/);
			if(match) error.line = parseInt(match[1]) - 1;
			match = errorDiv.textContent.match(/column\s(\d+)/);
			if(match) error.column = parseInt(match[1]) - 1;
			throw error;
		}
		
		var html = document.implementation.createHTMLDocument("");
		try {
			if(/<body/i.test(source)) { // can't find another way to do it
				html.documentElement.innerHTML = source;
				fragment = html.body;
			} else {
				var range = html.createRange();
				range.selectNode(html.body);
				fragment = range.createContextualFragment(source);
			}
		} catch(error) {
			throw new Error("Invalid HTML"); // (?) should not happen with HTML5 parsing algorithm
		}
		addNote("Used HTML parser");
	}
	return fragment;
}

function processHTML(xml, source) {
	output.innerHTML = "";
	try{
		var fragment = parseHTML(xml, source);
	} catch(error) {
		output.appendChild(printError(error, source));
		return;
	}
	
	var roots = getSectioningRoots(fragment, deep);
	if(roots.length === 0) { // create virtual root
		
		var root = fragment.ownerDocument.createElement("body");
		while(fragment.childNodes.length > 0) {
			if(fragment.childNodes[0].nodeType === 10) fragment.removeChild(fragment.childNodes[0]);
			else root.appendChild(fragment.childNodes[0]);
		}
		root.isVirtual = true;
		fragment.appendChild(root);
		roots = [root];
		addNote("No sectioning root element found: added virtual root");
	} else if(!deep && roots.length > 1) {
		addNote("Several top-level sectioning root elements found");
	}
	
	HTMLOutline(fragment);
   
	for(var i = 0; i < roots.length; i++) {
		var span = document.createElement("span");
		span.className = "root";
		if(roots[i].isVirtual) span.className += " virtual";
		span.textContent = "<" + roots[i].nodeName.toLowerCase() + ">";
		output.appendChild(span);
		output.appendChild(printOutline(roots[i].sectionList));
	}
   
	if(notes) output.appendChild(notes);
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
	li.appendChild(title);
	
	if(section.heading === null) {
		title.textContent = "Untitled section";
		title.style.fontStyle = "italic";
	} else {
		title.textContent = section.heading.text;
	}
	
	var details = document.createElement("ul");
	details.className = "details";
	details.style.display = "none";
	var type;
	if(section.associatedNodes[0].sectionType === 1 || section.associatedNodes[0].sectionType === 2) {
			type = "<code>&lt;" + section.associatedNodes[0].nodeName.toLowerCase() + "&gt;</code>";
	} else if(section.associatedNodes[0].sectionType === 2) {
		type = "<code>&lt;" + section.associatedNodes[0].nodeName.toLowerCase() + "&gt;</code>";
	} else type ="Implied section";
	var s = "";
	if(type) s += "<li>" + type + "</li>";
	if(section.heading) {
		s+="<li>Heading rank: " + (section.heading.rank) + "</li>";
		s+="<li>Heading depth: " + (section.heading.depth) + "</li>";
	}
	s+= "<li># of associated nodes: " + section.associatedNodes.length + "</li>";
	details.innerHTML = s;
	li.appendChild(details);
	
	var triangle = document.createElement("span");
	triangle.className = "show_details";
	triangle.addEventListener("click", function() {
		if(this.className === "show_details") {
			this.className = "hide_details";
			details.style.display = "block";
		} else {
			this.className = "show_details";
			details.style.display = "none";
		}
	}, false);
	li.insertBefore(triangle, li.firstChild);
	
	li.appendChild(printOutline(section.childSections));
	return li;
}

function printError(error, source) {
	var div = document.createElement("div");
	div.innerHTML = "<h4>Error!</h4>";
	var p = document.createElement("p");
	p.className = "error";
	p.textContent = error.message;
	div.appendChild(p);
	if(error.line !== undefined) {
		var line = source.split("\n")[error.line];
		if(line !== undefined) {
			p = document.createElement("pre");
			if(error.column !== undefined) {
				var caret = document.createElement("span");
				caret.className = "error_caret";
				caret.textContent = line.length > error.column ? line.charAt(error.column) : " ";
				p.appendChild(document.createTextNode(line.substring(0,error.column)));
				p.appendChild(caret);
				p.appendChild(document.createTextNode(line.substring(error.column+1)));
			} else p.textContent = line;
			div.appendChild(p);
		}
	}
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

