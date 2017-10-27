# virtualTour - Generic Software for virtual tours

*virtualTour* is a generic software that allows to create custom virtual tours and publish them on the web.

As an example see the [Virtual Tour to the Inscriptions of the UNESCO World Heritage Site St. Michael in Hildesheim]http://www.inschriften.net/hildesheim/rundgang.html

For structure, possibilities ans usage of teh software see:
Anna Neovesky, Julius Peinelt: A virtual tour to the inscriptions of the UNESCO World Heritage Site St. Michael in Hildesheim, in: Electronic Visualisation and the Arts (EVA 2015), S. 285 - 290. [DOI: 10.14236/ewic/eva2015.31]http://ewic.bcs.org/content/ConWebDoc/54919. 


## License and Contribution

virtualTour is licensed under [GNU GPL V3]https://www.gnu.org/licenses/gpl-3.0.de.html.
virtualTour is developed at the [Digital Academy](https://www.digitale-akademie.de) of the [Academy of Sciences and Literatur | Mainz](https://www.adwmainz.de). 

Conception and Software Development:
[Anna Neovesky](http://www.adwmainz.de/mitarbeiter/profil/anna-neovesky.html)
Julius Peinelt

## Dependencies and Requirements

virtualTour depends on Three.js in revision 68 and other smaller scripts by [Mr. Doob] [1]. Further it uses a helper 
script by [stemkoski] [2] to handle full screen support. The used shader are inspired by [zz85] [3]. The effect composer
for applying shader is by [alteredq] [4].

To use virtualTour you need a web browser with WebGL support. For more information have a look at [caniuse.com] [5].

# Embed virtualTour and create a panorama

To embed virtualTour in a web page have a look at the index.html of this repository. It is a minimal example web page
with nothing but virtualTour on it. That means every DOM element listed there is needed. Also every imported JavaScript
file on top is mandatory. To create a panorama with way points between different views consider the JSON files
in the documentation folder (JsonSchema.json and LocationSchema.json). There you also find the documentation of the code.

## Positioning of Hotspots and Transitions

For easier positioning of interactive elements you can add following lines to the update() function in panorama.js

		console.log("Camera Target: " + vectorToString(camera.target));
        console.log("-----------------------------");
        
Just place them after the camera target was updated.

________________________________

[1]: http://mrdoob.com/
[2]: https://github.com/stemkoski
[3]: http://www.lab4games.net/zz85/blog
[4]: http://alteredqualia.com
[5]: http://caniuse.com/#feat=webgl
