import pymongo
import xml.etree.ElementTree as ET

from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi
uri = "mongodb+srv://flixrolf:Pqhce9ePmiAEvpxb@languagemap.uqa8dcu.mongodb.net/?appName=LanguageMap"
# Create a new client and connect to the server
myclient = MongoClient(uri, server_api=ServerApi('1'))
mydb = myclient["LangMap"]

def populate_metadata_mongodb(data):
    LanguageMetaData_col = mydb["LanguageMetaData"]
    LanguageMetaData_col.create_index([("iso_code", pymongo.ASCENDING)], unique=True)

    # TODO: missing any type of update when running again, I think
    for lang in data.items():
        lang_entry = db_lang_formatting(lang)
        try: 
            LanguageMetaData_col.insert_one(lang_entry)
        except pymongo.errors.DuplicateKeyError:
            print("This language is already inserted")

    print(f"Language count: {LanguageMetaData_col.count_documents({})}")
    print("languagemetadata populated")

def db_lang_formatting(language):
    iso_code = language[0]

    new_format = {}
    for lang_name, value in language[1].items():
        for details_key, details_value in value.items():
            if details_key == "Regions":
                region_name_list = details_value
                #print(f"This is the region name list: {region_name_list}")
            if details_key == "RegionsOSM":
                regions_osm_list = details_value
                #print(f"This is the osm ids: {regions_osm_list}")
            if details_key == "Countries":
                country_list = details_value
                #print(f"These are the countries: {country_list}")
            if details_key == "Instances":
                instance_list = details_value

    regions = []
    for i in range(len(region_name_list)):
        r_name = region_name_list[i]
        r_osm = regions_osm_list[i]
        r_entry = {"name": r_name, "osm_id": r_osm}
        regions.append(r_entry)  
    
    countries = []
    for i in range(len(country_list)):
        c_name = country_list[i]
        c_entry = {"name": c_name} # add the id for country polygons here later 
        countries.append(c_entry)

    new_format.update({"Language": lang_name})
    new_format.update({"iso_code": iso_code})
    new_format.update({"Regions": regions})
    new_format.update({"Countries": countries})
    new_format.update({"Instances": instance_list})
    return new_format

#Inserts regiondata from batches of regions 
def populate_regions_mongodb_in_batches(regionList):
    Regions_col = mydb["Regions"]
    try: 
        Regions_col.insert_many(regionList)
    except pymongo.errors.DuplicateKeyError:
        print("This region is already inserted")
    print(f"region count: {Regions_col.count_documents({})}")
    print("regions populated")

#Inserts regiondata from full list of regions 
def populate_regions_mongodb_from_full_list(data):
    Regions_col = mydb["Regions"]
    for regionList in data:
        try: 
            Regions_col.insert_many(regionList)
        except pymongo.errors.DuplicateKeyError:
            print("This region is already inserted")
    print(f"region count: {Regions_col.count_documents({})}")
    print("regions populated")

#Old pupulate regions function

# def populate_regions_mongodb(file_path):
#     Regions_col = mydb["Regions"]
#     Regions_col.create_index([("osm_id", pymongo.ASCENDING)], unique=True)

#     kml = file_path
#     NAMESPACE = {"kml": "http://www.opengis.net/kml/2.2"}
#     tree = ET.parse(kml)
#     root = tree.getroot()
   
#     for place in root.findall(".//kml:Placemark", NAMESPACE):
#         name_element = place.find("kml:name", NAMESPACE) # osm
#         place_osm = name_element.text.strip()
#         for coords_element in place.findall(".//kml:Polygon/kml:outerBoundaryIs/kml:LinearRing/kml:coordinates", NAMESPACE):
#             coordinates_text = coords_element.text.strip()           
#             coords = []
#             for coord in coordinates_text.split():
#                 lon, lat = map(float, coord.split(",")[:2]) 
#                 coords.append([lon, lat])

#         region_entry = db_reg_format(place_osm, coords)
#         try: 
#              Regions_col.insert_one(region_entry)
#         except pymongo.errors.DuplicateKeyError:
#             print("This language is already inserted")
#     print(f"region count: {Regions_col.count_documents({})}")
#     print("regions populated")

def db_reg_format(osm, coords):
    new_format = {}

    new_format.update({"osm_id": osm})
    new_format.update({"cordinates": coords})

    return new_format