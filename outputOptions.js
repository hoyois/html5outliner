var output = document.getElementById("output");

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
