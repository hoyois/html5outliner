var input = document.getElementById("direct_input");
var output = document.getElementById("output");

if(window.FileReader) {
	var reader = new FileReader();
	reader.onload = function() {
		input.value = reader.result;
	}
	document.getElementById("file_input").addEventListener("change", function(event) {
		reader.readAsText(event.target.files[0]);
	}, false);
} else {
	document.getElementById("file_input").disabled = true;
}

document.getElementById("output_options").addEventListener("change", function(event) {
	switch(event.target.id) {
	case "show_elements":
		output.classList.toggle("show_elements");
		break;
	case "show_roots":
		output.classList.toggle("show_roots");
		break;
	case "numbering":
		output.setAttribute("data-numbering", event.target.value);
		break;
	}
}, false);
