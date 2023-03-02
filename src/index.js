import mapboxgl from "mapbox-gl";
import "threebox-plugin/dist/threebox.js";
// import "../styles.css";

const Threebox = window.Threebox;
mapboxgl.accessToken =
  "pk.eyJ1IjoiZXZhbmRlbGJlY3EiLCJhIjoiY2wyeWxnMnplMDNmbjNqcW80OXo5ZjR4NyJ9.b9tdFTYQ13LuscLgGq0v2A";
const origin = [13.183444499597574, 55.71892456947439];

const map = new mapboxgl.Map({
  container: "map",
  style: "mapbox://styles/mapbox/dark-v9",
  center: origin,
  pitch: 45,
  zoom: 10
});
var destination, line;
		var soldier;

map.addControl(new mapboxgl.NavigationControl());
var lines = new Array();
    lines.push([139.6503, 35.6762, 80000]);
    lines.push([-149.073, 62.4114, 9]);

    console.log("lineGeometries of the lines: ", lines); 

const tb = (window.tb = new Threebox(map, map.getCanvas().getContext("webgl"), {
  defaultLights: true,
  enableSelectingObjects: true //change this to false to disable 3D objects selection
  // change this to false to disable default tooltips on fill-extrusion and 3D models
}));

map.on("style.load", function () {
  const options = {
    id: "123123",
    type: "gltf",
    obj:
      "assets/scene.gltf",
    scale: .1,
    units: "scene",
    anchor: "center",
    rotation: { x: 90, y: 90, z: 0 }
  };

  tb.loadObj(options, (model) => {
    const obj = model.setCoords(origin);
    obj.addEventListener("SelectedChange", onSelectedChange, false);
    tb.add(obj);
  })

  map.addLayer({
    id: "custom_layer",
    type: "custom",
    render: function (gl, matrix) {
      tb.update();
    }
  });

  function onSelectedChange(e) {
    let selected = e.detail.selected; //we get if the object is selected after the event
    //if selected
    console.log("selected? " + selected);
  }
});



    // instantiate threebox

    map.on("style.load", function () {
      map.addLayer({
        id: "custom_layer_line",
        type: "custom",
        onAdd: function (map, mbxContext) {
          // const tb = new Threebox(map, mbxContext, { defaultLights: true });

          const coords = createGeometry(true);
          console.log(coords);
          var lineOptions = {
            geometry: coords,
            color: (coords[1][1] / 180) * 0xffffff, // color based on latitude of endpoint
            width: Math.random() + 1, // random width between 1 and 2
          };

          var lineMesh = tb.line(lineOptions);

          tb.add(lineMesh);
        },

        render: function (gl, matrix) {
          tb.update();
        },
      });
    })
    .on('click', function (e) {
			var pt = [e.lngLat.lng, e.lngLat.lat];
			travelPath(pt);
		})

		function travelPath(destination) {

			// request directions. See https://docs.mapbox.com/api/navigation/#directions for details

			var url = "https://api.mapbox.com/directions/v5/mapbox/driving/" + [origin, destination].join(';') + "?geometries=geojson&access_token=" + 'pk.eyJ1IjoiZXZhbmRlbGJlY3EiLCJhIjoiY2wyeWxnMnplMDNmbjNqcW80OXo5ZjR4NyJ9.b9tdFTYQ13LuscLgGq0v2A'
      


			fetchFunction(url, function (data) {

				let duration = 10000;
				// extract path geometry from callback geojson, and set duration of travel
				var options = {
					animation: 1,
					path: data.routes[0].geometry.coordinates,
					duration: duration
				}


				// start the soldier animation with above options, and remove the line when animation ends
				soldier.followPath(
					options,
					function () {
						tb.remove(line);
					}
				);

				soldier.playAnimation(options);

				// set up geometry for a line to be added to map, lofting it up a bit for *style*
				var lineGeometry = options.path
					.map(function (coordinate) {
						return coordinate.concat([15])
					})

				// create and add line object
				line = tb.line({
					geometry: lineGeometry,
					width: 5,
					color: 'steelblue'
				})

				tb.add(line);

				// set destination as the new origin, for the next trip
				origin = destination;

			})
		}


    function createGeometry(doesCrossAntimeridian) {
      const geometry = [
        [139.6503, 35.6762, 0],
        [-149.073, 62.4114, 20000],
      ];

      // To draw a line across the 180th meridian,
      // if the longitude of the second point minus
      // the longitude of original (or previous) point is >= 180,
      // subtract 360 from the longitude of the second point.
      // If it is less than 180, add 360 to the second point.

      if (doesCrossAntimeridian) {
        const startLng = geometry[0][0];
        const endLng = geometry[1][0];

        if (  endLng - startLng >= 180) {
          geometry[1][0] += 360;
        } else if (startLng- endLng  < 180) {
          geometry[1][0] -= 360;
        }
      }

      return geometry;
    }
