// XML and HTML parsers returning documents or document fragments

function parseXML(source) {
	var xml = (new DOMParser()).parseFromString(source, "text/xml");
	var parserError = !xml;
	if(!parserError) parserError = xml.getElementsByTagName("parsererror")[0];
	
	if(parserError) {
		xml = (new DOMParser()).parseFromString("<root>" + source + "</root>", "text/xml");
		if(xml && !xml.getElementsByTagName("parsererror")[0]) {
			var range = xml.createRange();
			range.selectNodeContents(xml.documentElement); // selects content of <root>
			return range.extractContents();
		}
		throw parserError;
	}
	
	return xml;
}

function parseHTML(source) {
	var html = document.implementation.createHTMLDocument("");
	try {
		html.documentElement.innerHTML = source;
		if(/<head|<body/i.test(source)) { // can't find another way to test that
			return html;
		} else {
			var range = html.createRange();
			range.selectNodeContents(html.body); // selects content of <body>
			return range.extractContents();
		}
	} catch(error) { // (?) should not happen with HTML5 parsing algorithm
		throw error;
	}
}
