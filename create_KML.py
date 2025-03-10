import json
import time
import os
import requests
import simplekml
import xml.etree.ElementTree as ET
from alive_progress import alive_bar

duplicateCountries = []
countryLanguagesSpoken = dict()

def create_KML(requestedKMLfile, languageLabels, country):
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
            pol.extendeddata.newdata(name="Country", value=country, displayname="Country")
            #pol.extendeddata.newdata(name="Country", value=", ".join(countries), displayname="Country")
            pol.extendeddata.newdata(name="Languages", value=", ".join(languageLabels), displayname="Language")
            pol.description = f"""
            <![CDATA[
            <h3>{country}</h3>
            <p><b>Languages:</b> {', '.join(languageLabels)}</p>
            ]]>"""

    output_folder = "KML_output"
    os.makedirs(output_folder, exist_ok=True)
    kml_file = f"{country.replace(' ', '_')}KML.kml"
    kml_path = os.path.join(output_folder, kml_file)
    kml.save(kml_path)
    print(f"New KML created for {country} in: [{kml_path}]")

def nominatim_create_OSMquery(osmid):
    osm_ids = ",".join([f"R{id}" for id in osmid])
    return f"https://nominatim.openstreetmap.org/lookup?osm_ids={osm_ids}&polygon_kml=1"

def create_kml_files(language_json_object):
    headers = {"User-Agent": "Testing for a school project - eldb@net.chalmers.se"}
    total_entries = len(language_json_object)
    with alive_bar(total_entries, title="🛌🛌🛌zzzZZZZ") as bar:
        for entry in language_json_object:
            if "countryOSMs" not in entry or "languageLabel" not in entry or "countryLabels" not in entry:
                continue
            osms = entry["countryOSMs"]
            countries = entry["countryLabels"]
            language = entry["languageLabel"]
            for i in range(len(osms)):
                osm = osms[i]
                country = countries[i].replace(' ', '_')
                if osm == "Unknown" or country == "Unknown":
                    continue
                if country not in duplicateCountries:
                    language_kml_query = nominatim_create_OSMquery([osm])
                    response = requests.get(language_kml_query, headers=headers)
                    time.sleep(0.5) 
                    bar()
                    apidata_folder = "RAW_output"
                    os.makedirs(apidata_folder, exist_ok=True)
                    file_title = f"{country.replace(' ', '_')}.kml"
                    file_path = os.path.join(apidata_folder, file_title)
                    print(file_path)

                    with open(file_path, "wb") as f:
                        f.write(response.content)
                    print(f"API data saved to: [{file_path}]")
                    duplicateCountries.append(country)
                    countryLanguagesSpoken[country] = [language]
                else:
                    countryLanguagesSpoken[country].append(language)
           # create_KML(file_path, entry["languageLabel"], [entry["countryLabels"]])

def main():
    user_input = input("Input JSON file name here (Sweden_entries.json): ")
    with open(f"wikidata/countryData/{user_input}", "r", encoding="utf-8") as file:
        language_data = json.load(file)
    create_kml_files(language_data)
    directory = "RAW_output"
    rawToKML(directory)
    print("WAKE UP 🧍‍🧍‍🧍 WAKE UP")
    print("Check KML_output folder!")
    

def rawToKML(directory):
    for file in os.listdir(directory):
        if file.endswith(".kml"):
            filedir = directory + "/" + file
            country = file.replace(".kml", "")
            create_KML(filedir, countryLanguagesSpoken[country], country)

if __name__ == "__main__":
    # create_KML("RAW_output/Indiaraw.kml", ["Hindi", "Urdu"], "India")
    main()
    
