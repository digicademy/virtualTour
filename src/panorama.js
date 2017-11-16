/**
 *  (c) Julius Peinelt
 *  	Anna Neovesky - Digitale Akademie, Akademie der Wissenschaften und der Literatur | Mainz - Anna.Neovesky@adwmainz.de
 */


/*
 * global vars
 */
var camera, scene, renderer;
var isUserInteracting = false;
var isPopupOpen = false;
var lon = 0;
var lat = 0;
var lonFactor = 0;
var latFactor = 0;
var phi = 0;
var theta = 0;
var projector;
var mouse = {x: 0, y: 0};
var targetList = [];
var hoverIntersected;
var composer, transitionComposer;
var panoramaData;
var isLoading = false;
var lastPanoramaUID = -1;
var mapUid = 0;
var showHotspotOptions = false;

var toolTip;

var timerId;
var container;
var resolution = "default";

/**
 * Starts panorama, creates a loading scene and triggers the loading of the start location. Starts animating.
 * @param dataURL URL to the config JSON
 */
// function startPanorama(dataURL, res) {
// 	resolution = res;
// 	setMapandNavigationHidden(true);
// 	init();
// 	isLoading = true;
// 	parseConfigJSON(dataURL, function (data) {
// 		var loader = new LocationLoader();
// 		loader.loadLocation(data.startLocation, startComplete);
// 	});
// 	animate();
// }
function startPanorama(jsonData, res) {
	resolution = res;
	setMapandNavigationHidden(true);
	init();
	isLoading = true;
	parseConfigJSON(jsonData, function (data) {
		var loader = new LocationLoader();
		loader.loadLocation(data.startLocation, startComplete);
	});
	animate();
}

/**
 * Initialize Tooltip for Hotspots and Transitions.
 */
function initTooltip() {
	toolTip = _('toolTip');
}

/**
 * Loads and parses the config JSON file at given URL, when finished parsing it calls given callback.
 * @param dataURL URL to config JSON.
 * @param callback function that gets called after parsing is finished.
 */
function parseConfigJSON(jsonData, callback) {
	// var request = new XMLHttpRequest();
	// request.open("GET", dataURL, true);
	// request.onreadystatechange = function () {
		// if (request.readyState === 4 && request.status === 200) {
		// console.log(jsonData);
			// panoramaData = JSON.parse(jsonData);
			panoramaData = jsonData;
			callback(panoramaData);
	// 	}
	// };
	// request.send(null);
}
// function parseConfigJSON(dataURL, callback) {
// 	var request = new XMLHttpRequest();
// 	request.open("GET", dataURL, true);
// 	request.onreadystatechange = function () {
// 		if (request.readyState === 4 && request.status === 200) {
// 			panoramaData = JSON.parse(request.responseText);
// 			callback(panoramaData);
// 		}
// 	};
// 	request.send(null);
// }



/**
 * Initializes renderer, camera, projector, tooltip
 */
function init() {
	container = _('panorama');
	divWidth = container.offsetWidth
	divHeight = window.innerHeight-(window.innerHeight*20/100);
	// console.log(window.innerWidth);
	// console.log(divHeight);
	camera = new THREE.PerspectiveCamera(60, divWidth / divHeight, 1, 200);
	camera.target = new THREE.Vector3(0, 0, 1);
	// initialize object to perform world/screen calculations
	projector = new THREE.Projector();
	if (Detector.webgl) {
		renderer = new THREE.WebGLRenderer({antialias: true});
	} else {
		renderer = new THREE.CanvasRenderer();
	}
	renderer.setSize(divWidth, divHeight);
	// var container = _('panorama');
	container.appendChild(renderer.domElement);
	initTooltip()
}

/**
 * Callback when Loading of scene is complete, initializes event listeners and shader.
 * @param location that will be rendered
 */
function startComplete(location) {
	var panoScene = new THREE.Scene();
	panoScene.add(location);
	scene = panoScene;
	var cts = location.cameraTargets;
	lat = cts[-1].lat;
	lon = cts[-1].lon;
	lastPanoramaUID = location.uid;
	mapUid = location.mapUid;
	updateSceneSwitchButton();
	updateTargetList();
	initEventListener();
	setupDarkBlurShader();
	setupBrightBlurShader();
	isLoading = false;
	setMapandNavigationHidden(false);
}


/**
 * Updates the Array of clickable objects in the scene.
 */
function updateTargetList() {
	targetList = [];
	scene.traverse(function (object) {
		if (object instanceof Hotspot || object instanceof Transition) {
			targetList.push(object);
			object.lookAt(camera.position);
		}
	});
}


/**
 * Transit to given location and rotate camera accordingly.
 * @param locationIndex Index of target location.
 * @param reset if true camera rotates as if it is a start location.
 */
function transitToLocation(locationIndex, reset) {
	if (reset) {
		lastPanoramaUID = -1; //update lastPanoramaUID to current location.uid for transition
	}
	if (locationIndex === lastPanoramaUID) {
		return;
	}
	isLoading = true;

	setMapandNavigationHidden(true);

	setTimeout(function () {    // Hack
		var loader = new LocationLoader();
		loader.loadLocation(locationIndex, function (location) {
			var panoScene = new THREE.Scene();
			panoScene.add(location);
			scene = panoScene;
			var cts = location.cameraTargets;
			if (cts[lastPanoramaUID]) {
				lat = cts[lastPanoramaUID].lat;
				lon = cts[lastPanoramaUID].lon;
			} else if (cts[-1]) {
				lat = cts[-1].lat;
				lon = cts[-1].lon;
			} else {
				lat = 2;
				lon = -103;
			}
			lastPanoramaUID = location.uid;
			mapUid = location.mapUid;
			updateSceneSwitchButton();
			updateTargetList();
			setupDarkBlurShader();
			setupBrightBlurShader();
			isLoading = false;
			setMapandNavigationHidden(false);
			camera.fov = 60;
			camera.updateProjectionMatrix();
		});
	}, 50);
}

/**
 * Adds EventListeners to scene.
 */
function initEventListener() {
	var container = _('panorama');
	// THREEx.FullScreen.bindKey({charCode: 'f'.charCodeAt(0), element: _('panorama')});

	container.addEventListener('mousedown', onMouseDown, false);
	container.addEventListener('mousemove', onMouseMove, false);
	container.addEventListener('mouseup', onMouseUp, false);
	container.addEventListener('mousewheel', onMouseWheel, false);
	container.addEventListener('DOMMouseScroll', onMouseWheel, false);

	container.addEventListener('touchstart', onDocumentTouchStart, false);
	container.addEventListener('touchmove', onDocumentTouchMove, false);
	container.addEventListener('touchend', onDocumentTouchEnd, false);


	container.addEventListener('dragover', function (event) {
		event.preventDefault();
		event.dataTransfer.dropEffect = 'copy';
	}, false);
	container.addEventListener('dragenter', function (event) {
		document.body.style.opacity = 0.5;
	}, false);
	container.addEventListener('dragleave', function (event) {
		document.body.style.opacity = 1;
	}, false);
	container.addEventListener('drop', function (event) {
		event.preventDefault();
		return false;
		var reader = new FileReader();
		reader.addEventListener('load', function (event) {
			material.map.image.src = event.target.result;
			material.map.needsUpdate = true;

		}, false);
		reader.readAsDataURL(event.dataTransfer.files[0]);
		document.body.style.opacity = 1;
	}, false);
	document.addEventListener('keydown', onKeyDown, false);
	document.addEventListener('keyup', onKeyUp, false);

	window.addEventListener('resize', onWindowResize, false);

	_('infoCloseButton').addEventListener('click', function (event) {
		var audioControls = _('audioControls');
		audioControls.pause();
		var div = _("infoView");
		div.style.display = "none";
		isPopupOpen = false;
		setMapandNavigationHidden(false);
	}, false);
	_('infoCloseButton').addEventListener('touched', function (event) {
		var audioControls = _('audioControls');
		audioControls.pause();
		var div = _("infoView");
		div.style.display = "none";
		isPopupOpen = false;
		setMapandNavigationHidden(false);
	}, false);
	var map = _(map);
	if (map) {
		_('map').addEventListener('dragstart', function (event) {
			event.preventDefault();
		});
	}

	var navGroup = _('navigationButtonsContainer');
	if (navGroup) {
		_('upNavButton').addEventListener('mousedown', function (event) {
			isUserInteracting = true;
			latFactor = 0.5;
		}, false);
		_('downNavButton').addEventListener('mousedown', function (event) {
			isUserInteracting = true;
			latFactor = -0.5;
		}, false);
		_('leftNavButton').addEventListener('mousedown', function (event) {
			isUserInteracting = true;
			lonFactor = -0.5;
		}, false);
		_('rightNavButton').addEventListener('mousedown', function (event) {
			isUserInteracting = true;
			lonFactor = 0.5;
		}, false);
		_('zoomInButton').addEventListener('mousedown', function (event) {
			zoom(-2)
		}, false);
		_('zoomOutButton').addEventListener('mousedown', function (event) {
			zoom(2)
		}, false);
		_('navigationButtonsContainer').addEventListener('mouseup', onMouseUp, false);

		_('upNavButton').addEventListener('touchstart', function (event) {
			isUserInteracting = true;
			latFactor = 0.5;
		}, false);
		_('downNavButton').addEventListener('touchstart', function (event) {
			isUserInteracting = true;
			latFactor = -0.5;
		}, false);
		_('leftNavButton').addEventListener('touchstart', function (event) {
			isUserInteracting = true;
			lonFactor = -0.5;
		}, false);
		_('rightNavButton').addEventListener('touchstart', function (event) {
			isUserInteracting = true;
			lonFactor = 0.5;
		}, false);
		_('zoomInButton').addEventListener('touchstart', function (event) {
			zoom(-2)
		}, false);
		_('zoomOutButton').addEventListener('touchstart', function (event) {
			zoom(2)
		}, false);
		_('navigationButtonsContainer').addEventListener('touchend', onMouseUp, false);
	}

	var sceneSwitch = _('sceneSwitch')
	if (sceneSwitch) {
		_('sceneSwitch').addEventListener('mousedown', switchScene);
		_('sceneSwitch').addEventListener('touchstart', switchScene);
	}

	var fullscreen = _('fullscreen');
	if (fullscreen) {
		_('fullscreen').addEventListener('mousedown', toggleFullScreen);
		_('fullscreen').addEventListener('touchstart', toggleFullScreen);
	}
}

function toggleFullScreen(event) {
	if (THREEx.FullScreen.activated()) {
		THREEx.FullScreen.cancel();
	} else {
		THREEx.FullScreen.request(_('panorama'));
	}
}

/**
 * Switch scene between start location for map 1 and map 2
 * @param event not used
 */
function switchScene(event) {
	if (mapUid === 1) {
		transitToLocation(98, true);
	} else {
		transitToLocation(12, true);
	}
}

/**
 * Updates Scene Switch button.
 */
function updateSceneSwitchButton() {
	var button = _('sceneSwitch');
	if (button) {
		if (mapUid === 1) {
			button.textContent = 'Switch Scene';
		} else {
			button.textContent = 'Switch Scene';
		}
	}
}

/**
 * hides or unhides map and navigation group when switching scenes
 * @param hidden if true, hide map and navigation group.
 */
function setMapandNavigationHidden(hidden) {
	var map = _('map');
	var navButtons = _('navigationButtonsContainer');
	var about = _('about');
	var sceneSwitch = _('sceneSwitch');
	if (hidden) {
		if (map) map.style.display = 'none';
		if (navButtons) navButtons.style.display = 'none';
		if (about) about.style.display = 'none';
		if (sceneSwitch) sceneSwitch.style.display = 'none';
	} else {
		if (map) map.style.display = 'block';
		if (navButtons) navButtons.style.display = 'block';
		if (about) about.style.display = 'block';
		if (sceneSwitch) sceneSwitch.style.display = 'block';
	}

}

/**
 * Updates camera and renderer if window gets resized.
 * @param event not used.
 */
function onWindowResize(event) {
	divHeight = window.innerHeight-(window.innerHeight*20/100);
	camera.aspect = divWidth / divHeight;
	camera.updateProjectionMatrix();
	renderer.setSize(divWidth, divHeight);
}

/**
 * EvenListener if mouse is pressed, calls downEventHandler.
 * @param event mouse event
 */
function onMouseDown(event) {
	var eventX = event.pageX;
	var eventY = event.pageY;
	// downEventHandler(eventX, eventY, event);
}

/**
 * EventListener if mouse is moving, calls moveEventHandler.
 * @param event mouse event
 */
function onMouseMove(event) {
	var eventX = event.pageX;
	var eventY = event.pageY;
	// moveEventHandler(eventX, eventY, event);
}

/**
 * EventListener if mouse is up, calls upEventHandler.
 * @param event mouse event
 */
function onMouseUp(event) {
	upEventHandler(event);
}

/**
 * EventListener if mouse wheel is used
 * @param event mouse event
 */
function onMouseWheel(event) {
	wheelEventHandler(event.pageX, event.pageY, event);
}

/**
 * EventListener for starting touch events
 * @param event touch event
 */
function onDocumentTouchStart(event) {
	if (event.touches.length === 1) {
		var touchX = event.touches[0].pageX;
		var touchY = event.touches[0].pageY;
		downEventHandler(touchX, touchY, event);
	} else if (event.touches.length === 2) {
	}
}

/**
 * EventListener for moving touch events
 * @param event touch event
 */
function onDocumentTouchMove(event) {
	if (event.touches.length === 1) {
		var touchX = event.touches[0].pageX;
		var touchY = event.touches[0].pageY;
		moveEventHandler(touchX, touchY, event);
	}
}

/**
 * EventListener for ending touch events
 * @param event touch event
 */
function onDocumentTouchEnd(event) {
	upEventHandler(event);
}

/**
 * Handler for move Event inputs.
 * @param eventX x-Value of event
 * @param eventY y-Value of event
 * @param event input event
 */

function moveEventHandler(eventX, eventY, event) {
	// Position of toolTips
	toolTip.style.left = mouseX + 20 + "px";
	toolTip.style.top = mouseY + 20 + "px";

	if (isPopupOpen) {
		return;
	}
	// mouse.x = ( eventX / window.innerWidth ) * 2 - 1;
	// mouse.y = -( eventY / window.innerHeight ) * 2 + 1;
	mouse.x = (mouseX/ renderer.domElement.width ) * 2 - 1;
	mouse.y = - ( mouseY / renderer.domElement.height ) * 2 + 1;
	if (isUserInteracting === true) {
		lonFactor = mouse.x;
		latFactor = mouse.y;
	} else {
		// check if mouse intersects something (to let it glow)
		var vector = new THREE.Vector3(mouse.x, mouse.y, 0);
		projector.unprojectVector(vector, camera);
		var ray = new THREE.Raycaster(camera.position, vector.sub(camera.position).normalize());

		// create an array containing all objects in the scene with which the ray intersects
		var intersects = ray.intersectObjects(targetList);
		// console.log(targetList);
		// if there is one (or more) intersections
		if (intersects.length > 0) {
			if (intersects[0].object != hoverIntersected) {
				if (hoverIntersected) {
					hoverIntersected.material.color.setHex(hoverIntersected.currentHex);
				}
				hoverIntersected = intersects[0].object;
				// store color of closest object (for later restoration)
				hoverIntersected.currentHex = hoverIntersected.material.color.getHex();
				// set a new color for closest object
				hoverIntersected.material.color.setHex(0x917d4d);

				// Tooltip
				if (intersects[0].object.tooltip) {
					toolTip.innerHTML = intersects[0].object.tooltip;
					toolTip.style.display = "block";
				} else {
					toolTip.innerHTML = "";
					toolTip.style.display = "none";
				}

			}
		} else {
			if (hoverIntersected) {
				hoverIntersected.material.color.setHex(hoverIntersected.currentHex);
			}
			hoverIntersected = null;
			toolTip.style.display = "none";
		}
	}
}

/**
 * Handler for starting input events.
 * @param eventX x-Value of event
 * @param eventY y-Value of event
 * @param event input event
 */
 var mouseX,mouseY,showHotspotOptions;
function downEventHandler(eventX, eventY, event) {
	if (isPopupOpen) {
		return;
	}

	event.preventDefault();
	
	// update the mouse variable
	// canvas position has to be 'static'
	mouse.x = (mouseX/ renderer.domElement.width ) * 2 - 1;
	mouse.y = - ( mouseY / renderer.domElement.height ) * 2 + 1;
	// mouse.x = ( ( eventX - renderer.domElement.offsetLeft ) / renderer.domElement.width ) * 2 - 1;
	// mouse.y = - ( ( eventY - renderer.domElement.offsetTop ) / renderer.domElement.height ) * 2 + 1;
	// mouse.x = ( eventX / window.innerWidth ) * 2 - 1;
	// mouse.y = -( eventY / window.innerHeight ) * 2 + 1;

	// find intersections
	// create a Ray with origin at the mouse position
	//   and direction into the scene (camera direction)
	var vector = new THREE.Vector3(mouse.x, mouse.y, 0);
	projector.unprojectVector(vector, camera);
	var ray = new THREE.Raycaster(camera.position, vector.sub(camera.position).normalize());

	// create an array containing all objects in the scene with which the ray intersects
	if(showHotspotOptions){
		var intersects = ray.intersectObjects(scene.children);	
	}else{
		var intersects = ray.intersectObjects(targetList);	
	}

	// if there is one (or more) intersections
	if (intersects.length > 0) {
		
		if (intersects[0].object instanceof Hotspot) {
			intersects[0].object.onClick();
			isPopupOpen = true;
			}else{
				return intersects[0].point;
			}
	} else {
		lonFactor = mouse.x;
		latFactor = mouse.y;
		isUserInteracting = true;
	}
	toolTip.style.display = "none";
}

/**
 * Handler for ending input events.
 * @param event not used
 */
function upEventHandler(event) {
	lonFactor = 0;
	latFactor = 0;
	isUserInteracting = false;
}

/**
 * EventListener for mouse wheel events.
 * @param eventX x-Value of event
 * @param eventY y-Value of event
 * @param event input event
 */
function wheelEventHandler(eventX, eventY, event) {
	event.preventDefault();
	if (isPopupOpen) {
		return;
	}

	// WebKit
	if (event.wheelDeltaY) {
		camera.fov -= event.wheelDeltaY * 0.05;

		// Opera / Explorer 9
	} else if (event.wheelDelta) {
		camera.fov -= event.wheelDelta * 0.05;

		// Firefox
	} else if (event.detail) {
		camera.fov += event.detail * 1.0;
	}

	if (camera.fov > 60) {
		camera.fov = 60;
	} else if (camera.fov < 40) {
		camera.fov = 40;
	}
	camera.updateProjectionMatrix();
}

/**
 * Zooms scene.
 * @param amount zoom amount.
 */
function zoom(amount) {
	camera.fov += amount;
	if (camera.fov > 60) {
		camera.fov = 60;
	} else if (camera.fov < 40) {
		camera.fov = 40;
	}
	camera.updateProjectionMatrix();
}

/**
 * EventListener if & which key is down => for Key Navigation
 * @param event key event
 */
function onKeyDown(event) {
	isUserInteracting = true;
	if (event.keyCode === 37) {
		// left arrow
		lonFactor = -0.5;
	} else if (event.keyCode === 38) {
		// up arrow
		latFactor = 0.5;
	} else if (event.keyCode === 39) {
		// right arrow
		lonFactor = 0.5
	} else if (event.keyCode === 40) {
		// down arrow
		latFactor = -0.5;
	}
}

/**
 * Eventlistener if key is up => no navigation via keys.
 * @param event key event
 */
function onKeyUp(event) {
	lonFactor = 0;
	latFactor = 0;
	isUserInteracting = false;
}


/**
 * Updates mouse cursor depending of function arguments
 * @param elem element mouse hovers
 * @param cursorStyle style of cursor
 */
function updateCursor(elem, cursorStyle) {
	elem.style.cursor = cursorStyle;
}


/**
 * Shows about box.
 * @param event mouse/touch event, not used
 */
function showAbout(event) {
	var aboutBox = document.getElementById('aboutView');
	aboutBox.style.display = "block";
	isPopupOpen = true;
}


/**
 * Update for new frame from Browser.
 */
function animate() {
	requestAnimationFrame(animate);
	update();
}

/**
 * Redraw the scene with new calculated camera target, blur, ...
 */
function update() {
	if (!scene) {
		return;
	}
	if (!isUserInteracting && !timerId) {
		timerId = setTimeout(resetPanorama, 2 * 60 * 1000);
	} else if (isUserInteracting && timerId) {
		clearTimeout(timerId);
		timerId = null;
	}

	if (isLoading) {
		if (transitionComposer) {
			transitionComposer.render();
		}
		return;
	}
	// if popUp is open
	if (!isPopupOpen) {
		lon = (lon + lonFactor) % 360;
		lat = lat + latFactor;
		// console logs: coordinates for starting view of a location
		//console.log("Camera Target: " + "lat: " + lat + "  lon: " + lon);

		lat = Math.max(-35, Math.min(45, lat));
		phi = THREE.Math.degToRad(90 - lat);
		theta = THREE.Math.degToRad(lon);
		camera.target.x = 195 * Math.sin(phi) * Math.cos(theta);
		camera.target.y = 195 * Math.cos(phi);
		camera.target.z = 195 * Math.sin(phi) * Math.sin(theta);
		camera.lookAt(camera.target);
		// console logs: x, y, z coordinates for positioning of hotspots and transitions
		//console.log("Positions [posX, posY, posZ]" + vectorToString(camera.target));
		//console.log("-----------------------------");
		renderer.render(scene, camera);
	} else {
		setMapandNavigationHidden(true);
		composer.render();
	}
}

/**
 * Resets Panorama to start location.
 */
function resetPanorama() {
	lastPanoramaUID = -1;
	transitToLocation(panoramaData.startLocation, true);
}


/**
 * Sets up dark blur shader for hotspots.
 */
function setupDarkBlurShader() {
	composer = new THREE.EffectComposer(renderer);
	var renderPass = new THREE.RenderPass(scene, camera);
	composer.addPass(renderPass);

	var blurShader = new THREE.ShaderPass(THREE.BlurShader);
	blurShader.uniforms["h"].value = 1.0 / window.innerWidth;
	blurShader.uniforms["v"].value = 1.0 / window.innerHeight;
	blurShader.uniforms["strength"].value = 0.2;
	blurShader.renderToScreen = true;

	composer.addPass(blurShader);
}

/**
 * Sets up bright blur shader for transitions.
 */
function setupBrightBlurShader() {
	transitionComposer = new THREE.EffectComposer(renderer);
	var renderPass = new THREE.RenderPass(scene, camera);
	transitionComposer.addPass(renderPass);

	var blurShader = new THREE.ShaderPass(THREE.BlurShader);
	blurShader.uniforms["h"].value = 1.0 / window.innerWidth;
	blurShader.uniforms["v"].value = 1.0 / window.innerHeight;
	blurShader.uniforms["strength"].value = 0.5;
	blurShader.renderToScreen = true;

	transitionComposer.addPass(blurShader);
}

//------------------- helper functions------------------------------

/**
 * Helper for getting dom element via id
 * @param id id of dom element
 * @returns {HTMLElement} dom element
 */
function _(id) {
	return document.getElementById(id);
}

/**
 * Helper for pretty print vectors
 * @param v 3d vector to print
 * @returns {string} vector as string in form [x, y, z]
 */
function vectorToString(v) {
	return "[ " + v.x + ", " + v.y + ", " + v.z + " ]";
}