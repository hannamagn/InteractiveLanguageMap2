from shapely.ops import transform
from shapely.geometry import Polygon
import xml.etree.ElementTree as ET
import json

'''Very work-in-progress but proves it is possible for a 15x file size 
   decrease, see results in the optimized_testfiles folder.
   (Note: the fgb files are not created here)'''

# Load the KML file
tree = ET.parse("KML_output/Northern Sami.kml")
root = tree.getroot()

# Define KML namespace (sometimes required)
ns = {'kml': 'http://www.opengis.net/kml/2.2'}

polygon_metadata = [
    {"name": "Polygon 1", "id": "p1", "description": "First polygon in the region"},
    {"name": "Polygon 2", "id": "p2", "description": "Second polygon in the region"},
    {"name": "Polygon 23", "id": "p23", "description": "third polygon in the region"},
    {"name": "Polygon 42", "id": "p42", "description": "fourth polygon in the region"},
    {"name": "Polygon 5", "id": "p5", "description": "fifth polygon in the region"},
    #{"name": "Polygon 6", "id": "p6", "description": "sixth polygon in the region"}
    # Add more metadata as needed
]

def simplify_polygon(coords, tolerance):
    polygon = Polygon(coords)
    simplified_polygon = polygon.simplify(tolerance, preserve_topology=True)
    return list(simplified_polygon.exterior.coords)

def truncate(num, precision):
    factor = 10 ** precision
    return int(num * factor) / factor

# Find all polygons
features = []
for i, polygon in enumerate(root.findall(".//kml:Polygon/kml:outerBoundaryIs/kml:LinearRing/kml:coordinates", ns)):
    raw_coords = polygon.text.strip()  # Get the coordinates as text
    coords = [
        # cut at 5 digits, in coordinate terms it an accuracy at a meter
         (truncate(float(coord.split(",")[0]), 5), truncate(float(coord.split(",")[1]), 5)) 
              for coord in raw_coords.split()]  # Convert to (lon, lat)
    
    # higher tolerance = more basic shape
    simplified_coords = simplify_polygon(coords, tolerance=0.005)

    feature = {
        "type": "Feature",
        "geometry": {
            "type": "Polygon",
            "coordinates": [simplified_coords]  # Wrap coordinates in a list for GeoJSON Polygon format
        },
       
        "properties": {
            **polygon_metadata[i],  # Attach metadata to each polygon
            "fill-opacity": 0.5,
            "fill": "#853e6348",
            "stroke-opacity": 1,
            "stroke": "#ff00ff",
            "stroke-width": 3, 
        },
    }
    
    features.append(feature)

geojson = {
    "type": "FeatureCollection",
    "features": features
}

with open("Swedish-0.005-nowhitespace.geojson", "w") as f:
    json.dump(geojson, f, separators=(',', ':'))


print("Extracted simplified 0.005", len(features))