function outline() {

var url = document.getElementById("url_input").value;
var text = document.getElementById("direct_input").value;
var output = document.getElementById("output");
output.innerHTML = "";
var notes;

// Options
var deep = document.getElementById("deep_outline").checked;
var XML = document.getElementById("xml_parser").checked;

// Direct input first
if(text) {
	processInput(text);
} else {
	var xhr = new XMLHttpRequest();
	xhr.open("GET", url, true);
	xhr.onload = function() {
		processInput(xhr.responseText);
	};
	// output.innerHTML = "<p>Fetching URL…</p>";
	xhr.send(null);
}

function processInput(source) {
	try {
		try{
			processNode(parseXML(source));
			return;
		} catch(parserError) {
			if(XML) { // Report XML error
				if(parserError === true) throw new Error("Invalid XML");
				var errorDiv = parserError.getElementsByTagName("div")[0]; // WebKit
				if(!errorDiv) errorDiv = parserError; // Mozilla, Opera
				var error = new Error(errorDiv.textContent);
				var match = errorDiv.textContent.match(/line\s(\d+)/);
				if(match) error.line = parseInt(match[1]) - 1;
				match = errorDiv.textContent.match(/column\s(\d+)/);
				if(match) error.column = parseInt(match[1]) - 1;
				throw error;
			}
		}
		addNote("Used HTML parser");
		try {
			processNode(parseHTML(source));
		} catch(error) {
			throw new Error("Invalid HTML");
		}
	} catch(error) {
		output.appendChild(printError(error, source));
	}
}

function processNode(node) {
	HTMLOutline(node);
	
	var ownerDocument = node.nodeType === 9 ? node : node.ownerDocument;
	var roots = getSectioningElements(node, deep);
	if(roots.length === 0) { // create virtual root
		var root = ownerDocument.createElement("body");
		while(node.childNodes.length > 0) {
			if(node.childNodes[0].nodeType === 10) node.removeChild(node.childNodes[0]);
			else root.appendChild(node.childNodes[0]);
		}
		node.appendChild(root);
		HTMLOutline(node);
		roots = [root];
		addNote("No sectioning element found: added <code>&lt;body&gt;</code>");
	} else if(!deep && roots.length > 1) {
		addNote("Several top-level sectioning root elements found");
	}
   
	for(var i = 0; i < roots.length; i++) {
		var span = document.createElement("span");
		span.className = "root";
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
	
	var details = document.createElement("div");
	details.className = "details";
	details.style.display = "none";
	var s = "";
	if(section.associatedNodes[0].sectionType) s += "<code>&lt;" + section.associatedNodes[0].nodeName.toLowerCase() + "&gt;</code>, ";
	if(section.heading) s+= "rank: " + section.heading.rank + ", depth: " + section.heading.depth + ", ";
	s+= "#nodes: " + section.associatedNodes.length;
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

function getSectioningElements(root, deep) {
	var roots = new Array();
	var node = root;
	var stack = new Array();
	start: while(node) {
		if((node.sectionType && stack.length === 0) || (node.sectionType === 2 && deep)) roots.push(node);
		if(node.sectionType === 2) stack.push(node);
		if((!node.sectionType || deep) && node.firstChild) {
			node = node.firstChild;
			continue start;
		}
		while(node) {
			if(node === stack[stack.length - 1]) stack.pop();
			if(node.nextSibling) {
				node = node.nextSibling;
				continue start;
			}
			if(node === root) break start;
			node = node.parentNode;
		}
	}
	return roots;
}

}

