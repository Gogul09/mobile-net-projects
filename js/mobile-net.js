let model;
async function loadModel() {
	console.log("model loading..");
	loader = document.getElementById("progress-box");
	load_button = document.getElementById("load-button");
	loader.style.display = "block";
	modelName = "mobilenet";
	model = undefined;
	model = await tf.loadLayersModel('https://gogul09.github.io/models/mobilenet/model.json');
	loader.style.display = "none";
	load_button.disabled = true;
	load_button.innerHTML = "Loaded Model";
	console.log("model loaded..");
}

$("#select-file-image").change(function() {
  	document.getElementById("select-file-box").style.display = "table-cell";
  	document.getElementById("predict-box").style.display = "table-cell";
  	document.getElementById("prediction").innerHTML = "Click predict to find my label!";
    renderImage(this.files[0]);
});

function renderImage(file) {
  var reader = new FileReader();
  reader.onload = function(event) {
    img_url = event.target.result;
    document.getElementById("test-image").src = img_url;
  }
  reader.readAsDataURL(file);
}

$("#predict-button").click(async function () {
	if (model == undefined) {
		alert("Please load the model first..")
	}
	if (document.getElementById("predict-box").style.display == "none") {
		alert("Please load an image using 'Demo Image' or 'Upload Image' button..")
	}
	console.log(model);
	let image  = document.getElementById("test-image");
	let tensor = preprocessImage(image, modelName);

	let predictions = await model.predict(tensor).data();
	let results = Array.from(predictions)
		.map(function (p, i) {
			return {
				probability: p,
				className: IMAGENET_CLASSES[i]
			};
		}).sort(function (a, b) {
			return b.probability - a.probability;
		}).slice(0, 5);

	document.getElementById("predict-box").style.display = "block";
	document.getElementById("prediction").innerHTML = "MobileNet prediction <br><b>" + results[0].className + "</b>";

	var ul = document.getElementById("predict-list");
	ul.innerHTML = "";
	results.forEach(function (p) {
		console.log(p.className + " " + p.probability.toFixed(6));
		var li = document.createElement("LI");
		li.innerHTML = p.className + " " + p.probability.toFixed(6);
		ul.appendChild(li);
	});
});

function preprocessImage(image, modelName) {
	let tensor = tf.browser.fromPixels(image)
		.resizeNearestNeighbor([224, 224])
		.toFloat();

	if (modelName === undefined) {
		return tensor.expandDims();
	} else if (modelName === "mobilenet") {
		let offset = tf.scalar(127.5);
		return tensor.sub(offset)
			.div(offset)
			.expandDims();
	} else {
		alert("Unknown model name..")
	}
}

function loadDemoImage() {
	document.getElementById("predict-box").style.display = "table-cell";
  	document.getElementById("prediction").innerHTML = "Click predict to find my label!";
	document.getElementById("select-file-box").style.display = "table-cell";
	document.getElementById("predict-list").innerHTML = "";

	base_path = "dataset/test/test_image_"
	maximum = 4;
	minimum = 1;
	var randomnumber = Math.floor(Math.random() * (maximum - minimum + 1)) + minimum;
	img_path = base_path + randomnumber + ".jpg"
	document.getElementById("test-image").src = img_path;
}
