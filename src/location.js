/**
 *  (c) Julius Peinelt
 *  	Anna Neovesky - Digitale Akademie, Akademie der Wissenschaften und der Literatur | Mainz - Anna.Neovesky@adwmainz.de
 */

/**
 * Describes on point of view where one can look around.
 * @param texture Panoramic image.
 * @constructor
 */
Location = function (texture) {
	var geometry = new THREE.SphereGeometry(200, 50, 30);
	geometry.applyMatrix(new THREE.Matrix4().makeScale(-1, 1, 1));

	var material = new THREE.MeshBasicMaterial({
		map: texture
	});
	THREE.Mesh.call(this, geometry, material);
};

Location.prototype = Object.create(THREE.Mesh.prototype);

/**
 * Adds Hotspots to current location
 * @param parameters Parameters for Hotspots like images, content and audio.
 * @returns {Hotspot} Hotspots specified in json
 */
Location.prototype.addHotspot = function (parameters) {
	var hotspot = new Hotspot(parameters);
	this.add(hotspot);
	return hotspot;
};

/**
 * Adds transitions to current location
 * @param parameters like target location
 * @returns {Transition} Transitions specified in json
 */
Location.prototype.addTransition = function (parameters) {
	var transition = new Transition(parameters);
	this.add(transition);
	return transition;
};

/**
 * Configures the map for the location
 * @param parameters dictionary that should have fields: image, mapSpots.
 */
Location.prototype.configureMap = function (parameters, locationUid) {
	var map = _('map');
	if (!map) {
		return;
	}

	for (var i = map.childNodes.length - 1; i > 0; i--) {
		if (map.childNodes[i].id === "mapSpot" || map.childNodes[i].id === "mapSpotCurrent") {
			map.removeChild(map.childNodes[i]);
		}
	}

	if (parameters.hasOwnProperty('image')) {
		var image = _('mapImage');
		if (image) {
			image.src = parameters['image'];
		}
	} else {
		console.log("error: no map image provided!");
	}

	if (parameters.hasOwnProperty('mapSpots')) {
		var spots = parameters['mapSpots'];
		// position of map spots is declared in json
		spots.forEach(function (spot) {
			var spotButton = document.createElement("button");
			if (spot.uid === locationUid) {
				spotButton.id = "mapSpotCurrent";
			} else {
				spotButton.id = "mapSpot";
			}
			spotButton.style.left = spot.mapPosX + "px";
			spotButton.style.top = spot.mapPosY + "px";
			spotButton.addEventListener('mousedown', function (event) {
				event.preventDefault();
				transitToLocation(spot.uid);
			});
			spotButton.addEventListener('touchstart', function (event) {
				event.preventDefault();
				transitToLocation(spot.uid);
			});
			map.appendChild(spotButton);
		});
	}
	// Position of Map
	map.style.display = "block";
	map.style.left = 10 + "px";
	map.style.top = 10 + "px";
};
