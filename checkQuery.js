if(location.search) {
	function parseWithRegExp(string, regex) {
		var match;
		var obj = new Object();
		while((match = regex.exec(string)) !== null) {
			obj[match[1]] = match[2];
		}
		return obj;
	}
	var queryOptions = parseWithRegExp(location.search.substr(1), /([^&=]*)=([^&]*)/g);
	
	if(queryOptions.url) {
		document.getElementById("url_input").value = decodeURIComponent(queryOptions.url);
		document.getElementById("direct_input").value = "";
	}
	if(queryOptions.input) document.getElementById("direct_input").value = decodeURIComponent(queryOptions.input);
	if(queryOptions.deep !== undefined) document.getElementById("deep_outline").checked = true;
	if(queryOptions.xml !== undefined) document.getElementById("xml_parser").checked = true;
	
	if(queryOptions.url || queryOptions.input) outline();
}