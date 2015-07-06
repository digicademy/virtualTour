/**
 *  (c) Julius Peinelt
 *  	Anna Neovesky - Digitale Akademie, Akademie der Wissenschaften und der Literatur | Mainz - Anna.Neovesky@adwmainz.de
 */

/**
 * Describes a clickable object in a location that shows a popup with information.
 * @param parameters Object which should have fields: content, title and images
 * @constructor
 */
Hotspot = function (parameters) {

	if (parameters === undefined) parameters = {};

	this.infoContent = parameters.hasOwnProperty('content') ? parameters['content'] : "No content";
	this.infoTitle = parameters.hasOwnProperty('title') ? parameters['title'] : "";
	this.infoImages = parameters.hasOwnProperty('images') ? parameters['images'] : null;


	this.tooltip = parameters.hasOwnProperty('tooltip') ? parameters['tooltip'] : null;
	this.audio = parameters.hasOwnProperty('audio') ? parameters['audio'] : null;

	// setting size and material of hotspot icon in panorama
	var geometry = new THREE.PlaneGeometry(16, 16);
	var material = new THREE.MeshBasicMaterial({
		map: THREE.ImageUtils.loadTexture("resources/icons/information.png"),
		transparent: true

	});
	THREE.Mesh.call(this, geometry, material);
	this.position.set(parameters.position.x, parameters.position.y, parameters.position.z);

};

Hotspot.prototype = Object.create(THREE.Mesh.prototype);

/**
 * Handle the click on the Hotspot and fills the Pop Up Window with content.
 */
Hotspot.prototype.onClick = function (event) {
	//init info view
	var infoView = _('infoView');

	//set title
	var infoTitle = _('infoTitle');
	infoTitle.innerHTML = this.infoTitle;
	//set text content
	var infoContent = _('infoContent');
	infoContent.innerHTML = this.infoContent;

	if (this.infoImages && this.infoImages.length == 1) {
		var infoImageBox = _('infoImageBox');
		//set image
		var infoImage = _('infoImage');
		infoImage.src = this.infoImages[0].figure;
		//set caption
		var infoCaption = _('infoCaption');
		infoCaption.textContent = this.infoImages[0].caption;
		infoImageBox.style.display = 'block';
	} else {
		var infoImageBox = _('infoImageBox');
		infoImageBox.style.display = 'none';
	}

	//sets audio

	var audioControls = _('audioControls');
	if (this.audio) {
		audioControls.style.display = 'block';
		var audioSourceOgg = _('audioSourceOgg');
		audioSourceOgg.src = this.audio + ".ogg";
		var audioSourceMp3 = _('audioSourceMp3');
		audioSourceMp3.src = this.audio + ".mp3";
		audioControls.load();
	} else {
		audioControls.style.display = 'none';
	}

	infoView.style.display = "block";
};


