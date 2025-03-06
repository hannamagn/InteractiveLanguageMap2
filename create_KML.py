import json
import time
import os
import requests
import simplekml
import xml.etree.ElementTree as ET
from alive_progress import alive_bar

def create_KML(requestedKMLfile, languageLabel, countries):
    tree = ET.parse(requestedKMLfile)
    root = tree.getroot()
    kml = simplekml.Kml()

    for place in root.findall(".//place"):
        place_name = place.get("display_name", "Unknown")
        for coords_element in place.findall(".//Polygon/outerBoundaryIs/LinearRing/coordinates"):
            coordinates_text = coords_element.text.strip()           
            coords = [(float(coord.split(",")[0]), float(coord.split(",")[1])) for coord in coordinates_text.split()]

            pol = kml.newpolygon(
                name=place_name,
                outerboundaryis=coords
            )
            pol.extendeddata.newdata(name="Language", value=languageLabel, displayname="Language")
            pol.extendeddata.newdata(name="Countries", value=", ".join(countries), displayname="Countries")
            pol.description = f"""
            <![CDATA[
            <h3>{languageLabel}</h3>
            <p><b>Countries:</b> {', '.join(countries)}</p>
            ]]>"""

    output_folder = "KML_output"
    os.makedirs(output_folder, exist_ok=True)
    kml_file = f"{languageLabel.replace(' ', '_')}.kml"
    kml_path = os.path.join(output_folder, kml_file)
    kml.save(kml_path)
    print(f"New KML created for {languageLabel} in: [{kml_path}]")

def nominatim_create_OSMquery(osmid):
    osm_ids = ",".join([f"R{id}" for id in osmid])
    return f"https://nominatim.openstreetmap.org/lookup?osm_ids={osm_ids}&polygon_kml=1"

def create_kml_files(language_json_object):
    headers = {"User-Agent": "Testing for a school project - felixjon@net.chalmers.se"}
    total_entries = len(language_json_object)
    with alive_bar(total_entries, title="🛌🛌🛌zzzZZZZ") as bar:
        for entry in language_json_object:
            if "countryOSM" not in entry or "languageLabel" not in entry or "countryLabel" not in entry:
                continue
            
            language_kml_query = nominatim_create_OSMquery([entry["countryOSM"]])
            response = requests.get(language_kml_query, headers=headers)
            time.sleep(0.5) 
            bar()

            apidata_folder = "RAW_output"
            os.makedirs(apidata_folder, exist_ok=True)
            file_title = f"{entry['languageLabel'].replace(' ', '_')}raw.kml"
            file_path = os.path.join(apidata_folder, file_title)

            with open(file_path, "wb") as f:
                f.write(response.content)

            print(f"API data saved to: [{file_path}]")
            create_KML(file_path, entry["languageLabel"], [entry["countryLabel"]])

def main():
    user_input = input("Input JSON file name here (Sweden_entries.json): ")
    with open(f"wikidata/countryData/{user_input}", "r", encoding="utf-8") as file:
        language_data = json.load(file)
    create_kml_files(language_data)
    print("WAKE UP 🧍‍🧍‍🧍 WAKE UP")
    print("Check KML_output folder!")

if __name__ == "__main__":
    main()
