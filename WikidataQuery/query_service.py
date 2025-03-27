import requests
import json
import util
import time
import os
import xml.etree.ElementTree as ET
import simplekml
import query_cleaner
import mongo_handler


sparql_api_url = "https://query.wikidata.org/sparql"
headers = {
        "User-Agent": "Testing for a school project - felixjon@net.chalmers.se" 
    }

def call_wikidata_api(query, output_file, timeout, dump_to_file):
    response = requests.get(sparql_api_url, params={'query': query, 'format': 'json' }, headers=headers, timeout=timeout)
    api_data = response.json()
    # handle exceptions of response
   
    if dump_to_file:
        with open(f"WikidataQuery/debug/{output_file}.json", "w", encoding="utf-8") as f:
            json.dump(api_data, f, indent=4, ensure_ascii=False)
    return api_data

def get_lang_base(dump_to_file):
    query_iso_lang_type = (
        """
        SELECT ?language ?languageLabel ?iso639_3 ?instanceOfLabel
        WHERE
        {
            ?language wdt:P220 ?iso639_3 .
            ?language wdt:P31 ?instanceOf .
                                    
            SERVICE wikibase:label { bd:serviceParam wikibase:language "en, [AUTO_LANGUAGE]" }
        }
        ORDER BY ASC(UCASE(str(?iso639_3)))
        """)
    api_data = call_wikidata_api(query_iso_lang_type, "wikidata_query", 30, dump_to_file)
    return api_data

def get_lang_metadata(lang_data):
    all_iso_codes = list(lang_data.keys())
    chunked_iso_codes = list(util.chunk_list(all_iso_codes, 200))
    print(len(chunked_iso_codes))

    for iso_list in chunked_iso_codes:
        query_string = util.array_to_string(iso_list)

        query = f'''
        SELECT ?language ?languageLabel ?iso_code ?region ?regionLabel ?country ?countryLabel ?osm_id WHERE {{
            VALUES ?iso_code {query_string}  # Add more ISO codes here

            ?language wdt:P220 ?iso_code.  

            OPTIONAL {{ ?language wdt:P17 ?country. }}
            OPTIONAL {{ ?language wdt:P2341 ?region 
                OPTIONAL {{ ?region wdt:P402 ?osm_id }}
            }} 

            SERVICE wikibase:label {{ bd:serviceParam wikibase:language "en,[AUTO_LANGUAGE]". }}
        }}'''

        api_data = call_wikidata_api(query, "langmetadatachunk.json", 20, False)
        lang_data = query_cleaner.populate_metadata(api_data, lang_data)
        
    with open(f"WikidataQuery/debug/langmetadata.json", "w", encoding="utf-8") as f:
        json.dump(lang_data, f, indent=4, ensure_ascii=False)
    return lang_data


def call_nomimantim_api(osmid):
    osm_ids = ",".join([f"R{id}" for id in osmid])
    query = f"https://nominatim.openstreetmap.org/lookup?osm_ids={osm_ids}&format=geojson&polygon_geojson=1&polygon_threshold=0.002"
    response = requests.get(query, headers=headers)
    content = response.json()

    with open("WikidataQuery/debug/raw4.geojson", "w", encoding="utf-8") as f:
        json.dump(content, f, indent=4, ensure_ascii=False)  

    return content

def get_region_coords(lang_data):
    osm_id_list = []
    get_all_osm_id(lang_data, osm_id_list)
    
    osm_id_list = list(util.chunk_list(osm_id_list, 50))  # 47 lists = 47 queries
    # allResponses = []
    total_batches = len(osm_id_list)
    for i in range(total_batches):
        response = call_nomimantim_api(osm_id_list[i])
        formattedResponse = format_response(response)
        mongo_handler.populate_regions_mongodb(formattedResponse)

        #can be saved for debug purposes
        #allResponses.append(formattedResponse)

        print(f"Batch {i + 1}/{total_batches} done")
        print("Sleeping 2 sec")
        time.sleep(2)
        

    #saves the regiondata in minified form
    # with open(f"WikidataQuery/debug/formattedRegionData.geojson", "w", encoding="utf-8") as f:
    #      json.dump(allResponses, f, separators=(',', ':'), ensure_ascii=False) 

    

    
    # TODO try and directly feed the 50 done into the database every loop, might be better
   
    # response = call_nomimantim_api([41255]) 

    # with open(f"WikidataQuery/debug/campobassoFormattedTest.geojson", "w", encoding="utf-8") as f:
    #      json.dump(format_response(response), f, separators=(',', ':'), ensure_ascii=False)   

    #returns a list of the regions queried with name data, osm id and polygondata in geojson format
    #formatted_response =format_response(response)

    # response [features] -> formaterad response [features] -> MongoDB

    #total_batches = len(osm_id_list)
    #want to directly insert into the mongodb as a geojson structure probably, do 50 at a time and it wont overflow the memory
    '''
    for i in range(total_batches):
        response = call_nomimantim_api(osm_id_list[i])
        print(f"API data put in: [{file_path}]")
        

        print(f"Batch {i + 1}/{total_batches} done")
        print("Sleeping 2 sec")
        time.sleep(2)
    '''
    print("Finished fetching coordinates")
    return 

def get_all_osm_id(lang_data, list):
    for iso_code, languages in lang_data.items():
        for language_name, data in languages.items():
            regionNames = data.get("Regions", [])
            regionOSM = data.get("RegionsOSM", [])
            for i in range(len(regionNames)): 
                r_name = regionNames[i]
                r_osm = regionOSM[i]
                if r_name == "Missing" or r_osm == "Missing": # at this stage just skip anything missing so the api doesnt crash 
                    continue
                if r_osm not in list: 
                    list.append(r_osm)
    print(f"The nr# of all regions: {len(list)}")
    return list

def format_response(response):
    decimals = 4
    features = response["features"]
    regions = []

    for feature in features:
        properties = feature["properties"]
        for property, value in properties.items():
            if property == "osm_id":
                osm_id = value
            if property == "address":
                address = value
        geometry = feature["geometry"]
        type = geometry["type"]

        if type == "Polygon":
            polygon = geometry["coordinates"]
            newGeometry = {"geometry": {"type": "Polygon", "coordinates": []}}
            for linear_rings in polygon:
                a_ring = []
                for coordinates in linear_rings:
                    rounded_cords = [round(coordinates[0], decimals), round(coordinates[1], decimals)]
                    a_ring.append(rounded_cords)
                newGeometry["geometry"]["coordinates"].append(a_ring)
            formatted_response = {"osm_id": osm_id, "address": address, "geometry": newGeometry["geometry"]}

        elif type == "MultiPolygon":
            polygons = geometry["coordinates"]
            newGeometry = {"geometry": {"type": "MultiPolygon", "coordinates": []}}
            for polygon in polygons:
                p_list = []
                for linear_rings in polygon:
                    a_border = []
                    for coordinates in linear_rings:
                        rounded_cords = [round(coordinates[0], decimals), round(coordinates[1], decimals)]
                        a_border.append(rounded_cords)
                    p_list.append(a_border)
                newGeometry["geometry"]["coordinates"].append(p_list)
            formatted_response = {"osm_id": osm_id, "address": address, "geometry": newGeometry["geometry"]}

        regions.append(formatted_response)
    # with open("WikidataQuery/debug/formattedTest1.geojson", "w", encoding="utf-8") as f:
    #     json.dump(regions, f, indent=4, ensure_ascii=False)   
     
    return regions


'''
def add_kml_poly(requestedKMLfile, kml):
    # TODO this needs to accomadate
    
    tree = ET.parse(requestedKMLfile)
    root = tree.getroot()
    
    for place in root.findall(".//place"):
        place_name = place.get("osm_id", "Unknown region")
        multi_geometry = place.findall(".//MultiGeometry/Polygon/outerBoundaryIs/LinearRing/coordinates")
        polygons = []

        if multi_geometry:
            print("Is a multigeom adding new")
            for coords_element in multi_geometry:
                coordinates_text = coords_element.text.strip()           
                coords = []
                for coord in coordinates_text.split():
                    lon, lat = map(float, coord.split(",")[:2])  
                    coords.append((round(lon, 5), round(lat, 5)))
                polygons.append(coords)
        else:
            print("Is apolygon, adding new")
            # normal polygon
            for coords_element in place.findall(".//Polygon/outerBoundaryIs/LinearRing/coordinates"):
                coordinates_text = coords_element.text.strip()           
                coords = []
                for coord in coordinates_text.split():
                    lon, lat = map(float, coord.split(",")[:2])  
                    coords.append((round(lon, 5), round(lat, 5)))
                polygons.append(coords)

        if len(polygons) > 1:
            print("New multi made")
            print(len(polygons))
            geom = kml.newmultigeometry(name=place_name)
            for poly in polygons:
                geom.newpolygon(outerboundaryis=poly)
        elif polygons:
            print("new polygon added")
            kml.newpolygon(name=place_name, outerboundaryis=polygons[0])
'''