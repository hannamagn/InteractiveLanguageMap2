import json 
# Relveant files moved to WikidataQuery\Deprecated, all wikidata sparql stuff is in WikidataQuery. 
#
# Trying to use arrays instead of to tell how many missing osmid's there are
# when it was a set it only added a single empty string regardless of how many 
# there actually where. 
#
# Update: even with array's it added only a single "" and instead 
# added multiples of the same region id, effectively making it worse.
# But one upside is that the region osm id and regions are in the same order.
# This way it simplifies the process of knowing at a glance wich regions are
# invalid (if they refer to a people) or if the id is missing from wikidata. 
#
# Next step: check if any language went missing compared to the iso database
# Sort out dead/extinct/whatever language is not relevant 
# 
# First comparison showed for example Nyimang not getting pulled since it does not 
# have any recorded "indigenous to" tagged in the database.
# Trying to add the regions as OPTIONAL but keeps timing out when running the query.
# The query times out their frontend api site thing so its time to move into calling from 
# python and splitting up the query into smaller blocks, even if this will affect the 
# performance, maybe. Query in sparQL_query.py ->

def Process_Data(json_Data):
    result = {}

    for entry in json_Data:
        iso639 = entry["iso639_3"]
        languageID = entry["language"]
        languageName = entry["languageLabel"]
        regions = entry["regionLabel"]
        regionsID = entry["region"]
        regionOSM = entry.get("osm_id", "") # if no osm_id add a blank
        countries = entry["countryLabel"]
        countriesID = entry["country"]
        instanceOf = entry["instanceOfLabel"]

        if iso639 not in result:
            result[iso639] = {
                "Language": languageName,
                "LanguageID": languageID,
                "Regions": [],
                "RegionsID": [],
                "RegionsOSM": [],
                "Countries": [],
                "CountriesID": [],
                "InstanceOfType": []
            }

        if regions not in result[iso639]["Regions"]:
            result[iso639]["Regions"].append(regions)
        if regionsID not in result[iso639]["RegionsID"]:
            result[iso639]["RegionsID"].append(regionsID)
        if regionOSM not in result[iso639]["RegionsOSM"]:
            result[iso639]["RegionsOSM"].append(regionOSM)
        if countries not in result[iso639]["Countries"]:
            result[iso639]["Countries"].append(countries)
        if countriesID not in result[iso639]["CountriesID"]:
            result[iso639]["CountriesID"].append(countriesID)
        if instanceOf not in result[iso639]["InstanceOfType"]:
            result[iso639]["InstanceOfType"].append(instanceOf)
    
    return result

#with open("WikidataQuery/uncleaned_data.json", "r", encoding="utf-8") as file:
#    data = json.load(file)

#processedData = Process_Data(data)

#with open("WikidataQuery/processedQuery.json", "w", encoding="utf-8") as out_file:
#    json.dump(processedData, out_file, indent=4, ensure_ascii=False)

## by going from using filters in the query to pulling every single lang we get only 2 missing ids vs the 500 or so with
def find_missing_wikidata_iso():
    wikidata_file = "WikidataQuery/cleaned_query_1.json"
    iso_file = "CrossRefrenceData/ISO 639-3/filtered_iso_data.json"
    output_file = "WikidataQuery/pull_all_wikidata_missing_ids"

    with open(wikidata_file, "r", encoding="utf-8") as f:
        wikidata_data = json.load(f)

    # Load the full ISO list
    with open(iso_file, "r", encoding="utf-8") as f:
        iso_data = json.load(f)

    wikidata_iso_ids = {iso_code for iso_code in wikidata_data}
    all_iso_ids = {entry['iso_639_ID'] for entry in iso_data}

    missing_iso_ids =  all_iso_ids - wikidata_iso_ids 

    with open(output_file, "w", encoding="utf-8") as f:
        f.write("\n".join(missing_iso_ids) + "\n")

    print(f"Missing ISO IDs saved to {output_file}")

find_missing_wikidata_iso()