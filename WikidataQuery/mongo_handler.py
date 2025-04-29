import pymongo
import os 
from dotenv import load_dotenv

from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi

load_dotenv() 
mongoDB_key = os.getenv("MONGO_KEY")

uri = f"mongodb+srv://{mongoDB_key}@languagemap.uqa8dcu.mongodb.net/?appName=LanguageMap"
# Create a new client and connect to the server
myclient = MongoClient(uri, server_api=ServerApi('1'))
mydb = myclient["LangMap"]

def populate_metadata_mongodb(data):
    LanguageMetaData_col = mydb["LanguageMetaDataTest"]
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
                #print(f"This is the region osm id list: {regions_osm_list}")
            if details_key == "Countries":
                country_list = details_value
                #print(f"This is the country list: {country_list}")
            if details_key == "CountriesOSM":
                countries_osm_list = details_value
                #print(f"This is the country osm id list: {countries_osm_list}")
            if details_key == "Instances":
                instance_list = details_value
                #print(f"This is the instance list: {instance_list}")
            if details_key == "immediate_Language_Families":
                language_families = details_value
                #print(f"This is the language family list: {language_families}")
            if details_key == "number_of_speakers":
                number_of_speakers = details_value
                #print(f"This is a list of recorded numbers of speakers: {number_of_speakers}")
            if details_key == "RegionsCountry":
                regions_country_list = details_value

    regions = []
    for i in range(len(region_name_list)):
        r_name = region_name_list[i]
        r_osm = regions_osm_list[i]
        r_country = regions_country_list[i]
        r_entry = {"name": r_name, "region_osm_id": r_osm, "region_Country": r_country}
        regions.append(r_entry)  
    
    countries = []
    for i in range(len(country_list)):
        countrydict = country_list[i]
        c_name = countrydict.get("Country")
        c_osm = countries_osm_list[i]
        c_isOfficialLanguage = countrydict.get("IsOfficialLanguage")
        c_entry = {"name": c_name, "country_osm_id": c_osm, "is_official_language": c_isOfficialLanguage} 
        countries.append(c_entry)

    new_format.update({"Language": lang_name})
    new_format.update({"iso_code": iso_code})
    new_format.update({"Regions": regions})
    new_format.update({"Countries": countries})
    new_format.update({"Instances": instance_list})
    new_format.update({"immediate_Language_Families": language_families})
    new_format.update({"number_of_speakers": number_of_speakers})
    return new_format

#Inserts regiondata from batches of regions NOT WORKING AT THE MOMENT, USE FUNCTION THAT TAKES FULL LIST
def populate_regions_mongodb_in_batches(regionList):
    Regions_col = mydb["PolygonData"]
    try: 
        Regions_col.insert_many(regionList)
    except pymongo.errors.DuplicateKeyError:
        print("This region is already inserted")
    print(f"region count: {Regions_col.count_documents({})}")
    print("regions populated")

#Inserts regiondata from full list of regions 
def populate_regions_mongodb_from_full_list(data):
    Regions_col = mydb["PolygonData"]
    for regionList in data:
        try: 
            Regions_col.insert_many(regionList)
        except pymongo.errors.DuplicateKeyError:
            print("This region is already inserted")
    print(f"region count: {Regions_col.count_documents({})}")
    print("regions populated")

def db_reg_format(osm, coords):
    new_format = {}

    new_format.update({"osm_id": osm})
    new_format.update({"cordinates": coords})
    return new_format

def ping_collection():
    Regions_col = mydb["Regions"]
    count = Regions_col.count_documents({})
    print(f"Number of regions in the regions collection: {count}")
    if count > 1:
        return True
    else:
        return False