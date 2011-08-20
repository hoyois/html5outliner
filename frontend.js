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
	showOutline((new DOMParser()).parseFromString(text, "text/xml"), text);
} else {
	var xhr = new XMLHttpRequest();
	xhr.open("GET", url, true);
	xhr.onload = function() {
		showOutline(xhr.responseXML, xhr.responseText);
	};
	output.innerHTML = "<p>Fetching URL…</p>";
	xhr.send(null);
}

function showOutline(xml, source) {
	try {
		output.innerHTML = "";
		var parserError = xml.getElementsByTagName("parsererror")[0];
		if(parserError) {
			if(XML) {
				var errorDiv = parserError.getElementsByTagName("div")[0];
				if(!errorDiv) errorDiv = parserError;
				var error = new Error(errorDiv.textContent);
				var match = errorDiv.textContent.match(/line\s(\d+)/);
				if(match) error.line = parseInt(match[1]) - 1;
				match = errorDiv.textContent.match(/column\s(\d+)/);
				if(match) error.column = parseInt(match[1]) - 1;
				throw error;
			}
			xml = document.implementation.createHTMLDocument("");
			try {
				xml.documentElement.innerHTML = source
			} catch(error) {
				throw new Error("Invalid HTML");
			}
			addNote("Used HTML parser (<code>&lt;body&gt;</code> was added if not present)");
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
		output.appendChild(printError(error, source));
	}
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

