/**
 *  (c) Julius Peinelt
 *  	Anna Neovesky - Digitale Akademie, Akademie der Wissenschaften und der Literatur | Mainz - Anna.Neovesky@adwmainz.de
 */


/**
 * Describes a clickable object in a location that allows users to navigate between locations.
 * @param parameters Object with should have fields: ...
 * @constructor
 */
Transition = function (parameters) {
	if (parameters === undefined) parameters = {};
	this.panoImg = parameters.hasOwnProperty('panoImg') ? parameters['panoImg'] : "";
	this.targetLocation = parameters.hasOwnProperty('targetLocation') ? parameters['targetLocation'] : -1;
	this.tooltip = parameters.hasOwnProperty('tooltip') ? parameters['tooltip'] : null;

	var geometry = new THREE.PlaneGeometry(15, 15);
	var material = new THREE.MeshBasicMaterial({
		map: THREE.ImageUtils.loadTexture("resources/icons/transfer.png"),
		transparent: true
	});
	THREE.Mesh.call(this, geometry, material);
	this.position.set(parameters.position.x, parameters.position.y, parameters.position.z);
};


Transition.prototype = Object.create(THREE.Mesh.prototype);

/**
 * Transit to other Location
 * @param event not used
 */
Transition.prototype.onClick = function (event) {
	if (this.targetLocation > -1) {
		transitToLocation(this.targetLocation);
	} else {
		console.log("error: targetLocation not specified!!!");
	}
};
