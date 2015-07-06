/**
 * Created by julius on 15/01/15.
 */


/**
 * LocationLoader
 * @constructor
 */
LocationLoader = function () {
};


//TODO: targetList, panoramaData unknown, should check if properties of panoramaData exists
/**
 * load Location with uid, adds all hotspots and transitions for the location.
 * @param uid UID of Location
 * @param onLoadComplete callback, gets called when loading complete
 */
LocationLoader.prototype.loadLocation = function (uid, onLoadComplete) {
	var location;
	panoramaData.locations.forEach(function (item, index) {
		if (item.uid === undefined || uid === undefined) {
			console.log("error: uid undefined");
			return;
		}
		if (item.uid !== uid) {
			return
		}

		var imgUrl = item.image.default;
		if (resolution === "mobile") {
			imgUrl = item.image.mobile;
		} else if (resolution === "hq") {
			imgUrl = item.image.hq;
		}


		THREE.ImageUtils.loadTexture(imgUrl,
			{},
			function (texture) {
				location = new Location(texture);

				location.cameraTargets = item.cameraTargets;
				location.uid = item.uid;
				location.mapUid = item.mapUid;

				//Hotspots
				item.hotspots.forEach(function (hotspot) {
					var hData = hotspot;
					var hParam = {
						position: new THREE.Vector3(hData.posX, hData.posY, hData.posZ),
						content: hData.text,
						title: hData.title,
						images: hData.images,
						audio: hData.audio,
						tooltip: hData.tooltip
					};
					location.addHotspot(hParam);
				});

				//Transitions
				item.transitions.forEach(function (transition) {
					var tData = transition;
					var tParam = {
						position: new THREE.Vector3(tData.posX, tData.posY, tData.posZ),
						targetLocation: tData.target_location,
						tooltip: tData.tooltip
					};
					location.addTransition(tParam);
				});

				// loading map
				for (var i = 0; panoramaData.maps.length; i++) {
					if (panoramaData.maps[i].uid == item.mapUid) {
						location.configureMap(panoramaData.maps[i], item.uid);
						break;
					}
				}
				onLoadComplete(location);
			}
		);

	});
};
