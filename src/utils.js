import * as THREE from "three";
function toDecimal(n, d) {
  return Number(n.toFixed(d));
}

function buildPoints(tb, coords, initCoords) {
  const points = [];
  for (let i = 0; i < coords.length; i++) {
    const pos = tb.projectToWorld([coords[i][0], coords[i][1], 0]);
    points.push(new THREE.Vector2(toDecimal(pos.x, 9), toDecimal(pos.y, 9)));
  }
  return points;
}
export function buildShape(tb, coords) {
  if (coords[0] instanceof (THREE.Vector2 || THREE.Vector3))
    return new THREE.Shape(coords);
  let shape = new THREE.Shape();
  for (let i = 0; i < coords.length; i++) {
    if (i === 0) {
      shape = new THREE.Shape(buildPoints(tb, coords[0], coords[0]));
    } else {
      shape.holes.push(new THREE.Path(buildPoints(tb, coords[i], coords[0])));
    }
  }
  return shape;
}

export function getCenterOfPoints(coordinates = []) {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (let i = 0, len = coordinates.length; i < len; i++) {
    const c = coordinates[i];
    const x = c[0];
    const y = c[1];

    minX = Math.min(minX, x);
    minY = Math.min(minY, y);
    maxX = Math.max(maxX, x);
    maxY = Math.max(maxY, y);
  }
  return [(minX + maxX) / 2, (minY + maxY) / 2];
}

export function getGeoJSONCenter(features = []) {
  let minX = Infinity,
    minY = Infinity,
    maxX = -Infinity,
    maxY = -Infinity;
  features.forEach((feature) => {
    const type = feature.geometry.type;
    if (!type) {
      return null;
    }
    const geometry = feature.geometry || {};
    const coordinates = geometry.coordinates;
    if (!coordinates) {
      return null;
    }
    const coords = [];
    switch (type) {
      case "Point": {
        coords.push(coordinates);
        break;
      }
      case "MultiPoint":
      case "LineString": {
        for (let i = 0, len = coordinates.length; i < len; i++) {
          coords.push(coordinates[i]);
        }
        break;
      }
      case "MultiLineString":
      case "Polygon": {
        for (let i = 0, len = coordinates.length; i < len; i++) {
          for (let j = 0, len1 = coordinates[i].length; j < len1; j++) {
            coords.push(coordinates[i][j]);
          }
        }
        break;
      }
      case "MultiPolygon": {
        for (let i = 0, len = coordinates.length; i < len; i++) {
          for (let j = 0, len1 = coordinates[i].length; j < len1; j++) {
            for (let m = 0, len2 = coordinates[i][j].length; m < len2; m++) {
              coords.push(coordinates[i][j][m]);
            }
          }
        }
        break;
      }
      default:
        break;
    }
    for (let i = 0, len = coords.length; i < len; i++) {
      const c = coords[i];
      const x = c[0],
        y = c[1];

      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);
    }
  });
  return [(minX + maxX) / 2, (minY + maxY) / 2];
}
