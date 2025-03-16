import requests
import json
import time
from osm_data import region_codes_by_country, old_regions, new_region_codes, new_region_ids, non_region_tags
# This file is planned to become a one-click-get-all-languages automating the wikidata sparql api but
# need major refactoring. 

# Pipeline: 
# Dump all languages with iso_codes into json -> sort out bad-languages -> populate with meta-data -> clean data -> fetch coordinates/polygons -> minimize file size -> dump into a db or folder somewhere.  

'''TODO: 
Finish function replace_region_with_many() - ✔
Better organize the osm_data.py - ✔
Move the data into osm_data.py and import for readability - ✔
Find all the offical languages and tag them
Do something about the rest of the missing data - at the moment it looks like it needs to be done by hand
Maybe move official lang into its own file
Create main function and organize the full pipeline
Remove all the json files
Get full list of all regions and osm id's to be fetched
Remake the create_kml query and code for geojson
Fetch data for all present osm ids -> save as singular data files for modularity
Way of minimizing file size - Done (in a smaller scale)
Fetch the geodata (polygons) for all countries
Decide on the mongodb structure
Could move the nepal function stuff into the replace_region_with_many() but why fix something thats not broken
Refactor / increase readability I am becoming blind 
Envariable plugg
Be happy
'''

sparql_api_url = "https://query.wikidata.org/sparql"

query_iso_lang_type = ("""
SELECT ?language ?languageLabel ?iso639_3 ?instanceOfLabel
WHERE
{
    ?language wdt:P220 ?iso639_3 .
    ?language wdt:P31 ?instanceOf .
                             
    SERVICE wikibase:label { bd:serviceParam wikibase:language "en, [AUTO_LANGUAGE]" }
}
ORDER BY ASC(UCASE(str(?iso639_3)))
""") # in test_query_1

def call_api(query, outputFile):
    response1 = requests.get(sparql_api_url, params={'query': query, 'format': 'json' })
    data1 = response1.json()

    with open(f"WikidataQuery/{outputFile}", "w", encoding="utf-8") as f:
            json.dump(data1, f, indent=4, ensure_ascii=False)

def format_api_response():
    cleaned_query_json = {}
    with open("WikidataQuery/test_query_1", "r", encoding="utf-8") as f:
        query_data = json.load(f)

    for item in query_data["results"]["bindings"]:
        iso_code = item["iso639_3"]["value"]
        language_name = item["languageLabel"]["value"]
        language_id = item["language"]["value"]
        instanceOf = item["instanceOfLabel"]["value"]

        if iso_code not in cleaned_query_json:
            cleaned_query_json[iso_code] = {}

        if language_name not in cleaned_query_json[iso_code]:  # adds a new entry in the output json 
            cleaned_query_json[iso_code][language_name] = {
                "Language": language_name,
                "LangugeID": language_id,
                "Regions": [],
                "RegionsID": [],
                "RegionsOSM": [],
                "Countries": [],
                "CountriesID": [],
                "Instances": []
            }
        # squash the multiple entries adding all instances of a language in an array
        if instanceOf not in cleaned_query_json[iso_code][language_name]["Instances"]:
             cleaned_query_json[iso_code][language_name]["Instances"].append(instanceOf)
 
    with open("WikidataQuery/new_cleaned_query_1.json", "w", encoding="utf-8") as f:
        json.dump(cleaned_query_json, f, indent=4, ensure_ascii=False)
    
    print(len(cleaned_query_json)) #8236            
    return

#clean_api_query()

# new structure handles edge cases of one iso code containing multiple languages ex. cham (cja)
def multiple_language_check():
    with open("WikidataQuery/new_cleaned_query_2.json", "r", encoding="utf-8") as f:
        json_data = json.load(f)

    multiple_lang = []

    for iso_code, languages in json_data.items():
        if len(languages) > 1: 
            multiple_lang.append(iso_code)
    print(multiple_lang)
# new_cleaned_query_1
# ['apc', 'cja', 'gby', 'heb', 'idb', 'kjv', 'msn', 'rof', 'ttt', 'xal']
# new_cleaned_query_2
# ['apc', 'cja', 'gby', 'heb', 'idb', 'msn', 'rof', 'ttt', 'xal']
#multiple_language_check()


# remove: extinct language, dead language, spurious language, constructed language   
# language group, 
# up for debate:  dialect(a lot of language+dialects), language family, macro languages (both latvian and mongolian are tagged with this), sign languages (maybe make its own thing out of it)
def clean_dead_lang():
    '''Clean out dead and non-languages based of their "Instance" tag
       Result dumped to new_cleaned_query_2.json'''

    cleaned_query_json = {}
    excluded_instances = {"extinct language", "dead language", "ancient language", "historical language", "spurious language", "constructed language"}
    
    with open("WikidataQuery/new_cleaned_query_1.json", "r", encoding="utf-8") as f:
        json_data = json.load(f)

    # dealing with the nested mess of json structure 
    for iso_code, languages in json_data.items():
        filtered_lang = {}

        # for each lang in one iso_code
        for language_name, data in languages.items():
            # if the current lang's instanceof is one of the forbidden ones, skip
            if any(instance in excluded_instances for instance in data["Instances"]):
                continue
    
            filtered_lang[language_name] = {
                "Language": data["Language"],
                "LangugeID": data["LangugeID"],
                "Regions": data["Regions"],
                "RegionsID": data["RegionsID"],
                "RegionsOSM": data["RegionsOSM"],
                "Countries": data["Countries"],
                "CountriesID": data["CountriesID"],
                "Instances": data["Instances"]
            }
            
        if filtered_lang: 
            cleaned_query_json[iso_code] = filtered_lang
        
    with open("WikidataQuery/new_cleaned_query_2.json", "w", encoding="utf-8") as f:
        json.dump(cleaned_query_json, f, indent=4, ensure_ascii=False)
    
    print(len(cleaned_query_json)) #7401 -> 7337  -> 7292 // after json refactor stays the same (good)
    
    return   

#clean_dead_lang() # -> WikidataQuery/cleaned_query_2.json

# fill in the missing data with new query
# somewhere here "indigenous to" needs to differentiate between ethnics groups and regions 
def get_lang_data():
    with open("WikidataQuery/new_cleaned_query_2.json", "r", encoding="utf-8") as f:
        json_data = json.load(f)

    headers = {
        "User-Agent": "Testing for a school project - felixjon@net.chalmers.se" 
    }

    empty_iso_codes = []
    too_many_reqs_codes = []
    iso_code_array = []

    # split the iso_codes into arrays of 10 -> ['ttw', 'ttx', 'tty', 'ttz', 'tua', 'tub', 'tuc', 'tue', 'tuf', 'tug'], ['tuh', 'tui', 'tuj', 'tuk', 'tul', 'tum', 'tuo', 'tuq', 'tur', 'tus'], etc
    iso_code_array = populate_iso_array(iso_code_array, json_data)

    for hundred_iso_codes in iso_code_array: 
        # convert to one string to fit the query
        hundred_query_string = array_to_string(hundred_iso_codes)
       
        query = f'''
        SELECT ?language ?languageLabel ?iso_code ?region ?regionLabel ?country ?countryLabel ?osm_id WHERE {{
            VALUES ?iso_code {hundred_query_string}  # Add more ISO codes here

            ?language wdt:P220 ?iso_code.  

            OPTIONAL {{ ?language wdt:P17 ?country. }}
            OPTIONAL {{ ?language wdt:P2341 ?region 
                OPTIONAL {{ ?region wdt:P402 ?osm_id }}
            }} 

            SERVICE wikibase:label {{ bd:serviceParam wikibase:language "en,[AUTO_LANGUAGE]". }}
        }}
        '''
        
        try: 
            response = requests.get(sparql_api_url, params={'query': query, 'format': 'json' }, headers=headers, timeout=3)
        except requests.exceptions.ReadTimeout:
            empty_iso_codes.append(hundred_iso_codes)
            print("death, timeout")
            continue
        
        print("failed query codes")   
        if response.text.strip():  
            try:
                api_data = response.json()

            # these shouldnt be needed with the nested optionals in query
            except requests.exceptions.JSONDecodeError:
                # Hitting the rate limit code: 429
                empty_iso_codes.append(hundred_iso_codes)
                print(f"Request failed with status code: {response.status_code}")
                if response.status_code == 429:
                    too_many_reqs_codes.append(hundred_iso_codes)
                print(hundred_iso_codes)
                # dump what we got before dying
                with open("InteractiveLanguageMap-Felix-API-Branch-/InteractiveLanguageMap-Felix-API-Branch-/WikidataQuery/new_cleaned_query_3.json", "w", encoding="utf-8") as f:
                    json.dump(json_data, f, indent=4, ensure_ascii=False)
                continue
        else:
            print("Error: Empty response body received.")
        
        for entry in api_data["results"]["bindings"]:
            language = entry["languageLabel"]["value"]
            region = entry["regionLabel"]["value"] if "regionLabel" in entry else "Missing"
            regionID = entry["region"]["value"] if "region" in entry else "Missing"
            region_osm_id = entry["osm_id"]["value"] if "osm_id" in entry else "Missing"
            country = entry["countryLabel"]["value"] if "countryLabel" in entry else "Missing"
            countryID = entry["country"]["value"] if "country" in entry else "Missing"
            iso_code = entry["iso_code"]["value"] 
            
            # keep the old structure
            if language not in json_data[iso_code]:
                json_data[iso_code][language] = {
                    "Language": language,
                    "LangugeID": entry["language"]["value"],  
                    "Regions": [],
                    "RegionsID": [],
                    "RegionsOSM": [],
                    "Countries": [],
                    "CountriesID": [],
                    "Instances": [] 
                }

            if region not in json_data[iso_code][language]["Regions"]:
                json_data[iso_code][language]["Regions"].append(region)
            if regionID not in json_data[iso_code][language]["RegionsID"]:
                json_data[iso_code][language]["RegionsID"].append(regionID)
                json_data[iso_code][language]["RegionsOSM"].append(region_osm_id) # put in multiple missings of the regionosm id matching in placement to the region names
            if country not in json_data[iso_code][language]["Countries"]:
                json_data[iso_code][language]["Countries"].append(country)
            if countryID not in json_data[iso_code][language]["CountriesID"]:
                json_data[iso_code][language]["CountriesID"].append(countryID)
                     
            print("Check language: " + iso_code)


        with open("WikidataQuery/new_cleaned_query_test123123.json", "w", encoding="utf-8") as f:
            json.dump(json_data, f, indent=4, ensure_ascii=False)

        print(f"100 done, sleeping for 2 seconds...")
        print(empty_iso_codes) 
        print("")
        time.sleep(2)  

    # final write not hitting here actually it does i think
    with open("WikidataQuery/new_cleaned_query_333333.json", "w", encoding="utf-8") as f:
        json.dump(json_data, f, indent=4, ensure_ascii=False)
    
    return 


def populate_iso_array(empty_array, json_data):
    iso_codes = list(json_data.keys()) 
    data_len = len(iso_codes)
    
    # Split into chunks of 150, upped for faster query
    for i in range(0, data_len, 150):
        little_array = iso_codes[i:i+150]  
        empty_array.append(little_array)  
    
    return empty_array

def array_to_string(iso_array):
    return "{ " + " ".join(f'"{iso_code}"' for iso_code in iso_array) + " }"

def remove_retired_languages():
    #get the array of iso codes in here

    return

def add_missing_region_osm(data):
    '''Replaces all the "Missing" in the json with their found osm id codes to 
       their respective region'''

    # the polygons for the regions could still technically be gotten with just the name of the region but it is not always 100% accurate    
    # At this point it might have been better to download those maps from the site, but not every country had the map with region version 
    # TODO move these to another file  

    for iso_code, languages in data.items(): 
        for language_name, details in languages.items():
            for country in details.get("Countries", []):
                if country in region_codes_by_country:
                    print(f"-----{country}-------")
                    util_replace_missingcodes(details, region_codes_by_country[country])
                #util_update_osm_code(details, country, region_codes_by_country)

def util_replace_missingcodes(details, osm_array,):
    regions = details.get("Regions", [])
    regions_osm = details.get("RegionsOSM", [])
    print(regions)

    for i, region in enumerate(regions):
        if region in osm_array:
            the_region = regions[i]            
            osm_id = osm_array[the_region]
            if regions_osm[i] == "Missing":
                regions_osm[i] = osm_id # replace "Missing" to the id 
                print(the_region)
                print(f"new osmid: {osm_id}")
                print(f"Regionosm[i]: {regions_osm[i]}")

                       
def remove_wikidata_ids(data):
    '''Removes regions together with their "Missing" osm ids that 
       couldn't be caught automatically '''

    for iso_code, languages in data.items(): 
        for language_name, details in languages.items():
            countries = details.get("Countries", [])

            # For specifically any region that was missing a name and only took the code 
            # e.g Q21091247 for example
            if any(region.startswith("Q") and region[1:].isdigit() for region in details.get("Regions", [])):
                #print(f"Found in {iso_code} - {language_name} ")
                
                osmCode = details.get("RegionsOSM", [])
                regionsLink = details.get("RegionsID", [])
                regions = details.get("Regions", [])

                for i in reversed(range(len(regions))): # traverse reverse order
                    region = regions[i]
                    if region.startswith("Q") and region[1:].isdigit():
                        curOSM = osmCode[i]
                        #print(f"Removing region: {region} and OSM code: {curOSM} at index {i}")

                        regions.pop(i)
                        osmCode.pop(i)
                        regionsLink.pop(i)
           
            # To not overwrite other countries with similar province names
            if "Kenya" in countries:    
                util_remove_region(details, "Central Province") # defunct province replaced by disctricts
                util_remove_region(details, "Coast Province")
                util_remove_region(details, "Eastern Province")

            # idk what to do with these so ill just remove them for now
            # Sorted out by hand regions missing a osm id that were too hard to catch automatically
            util_remove_region(details, "Lagunes region") # defunct for lagunes district
            util_remove_region(details, "Pribilof Islands") # is in alaska
            util_remove_region(details, "Americas") # not viable to have the whole americas be covered for this minor lang
            util_remove_region(details, "Kubu people") # didnt get picked up by the etnic_group query
            util_remove_region(details, "Kadu people") # No tags on wikidata
            util_remove_region(details, "Kei people")
            util_remove_region(details, "Gouñhyàñ people") # this has no tags so doesnt get picked up as a ethnic group
            util_remove_region(details, "Chimbu people") # ethnic group with no tags
            util_remove_region(details, "Kurrama people") # ethnic group with no tags
            util_remove_region(details, "Kaohsiung County") # former taiwanese county, replaced by just Kaoshiung
            util_remove_region(details, "Autonomous Region in Muslim Mindanao") # tagged as a former administrative territorial entity, but cant remove all of them since the nepal regions have the same tag and are replaced manually in the code 
            util_remove_region(details, "Barakai") # ethnic group not getting picked up by the filter
            util_remove_region(details, "Ingria") # former soviet union place
            util_remove_region(details, "Manchuria") # historical region 
            util_remove_region(details, "Tainan County") # former country
            util_remove_region(details, "Kasai-Oriental") # defunct, there is kasai district
            util_remove_region(details, "Kasaï") # former province, replaced as above
            util_remove_region(details, "Crimea") #Autonomous Republic of Crimea is a thing
            util_remove_region(details, "Jabodetabek") # the greated metropolitan area of jakarta
            util_remove_region(details, "Azawad") # former state
            util_remove_region(details, "Rupert's Land") # defunct in 1870

    print("Regions removed")

def util_remove_region(details, region_name):
    '''Removes a single specified region and its associated data from details'''
    
    if region_name in details.get("Regions", []):
        osmCode = details.get("RegionsOSM", [])
        regionsLink = details.get("RegionsID", [])
        regions = details.get("Regions", [])

        for i in reversed(range(len(regions))):  # Traverse in reverse to avoid index issues
            if region_name in regions[i]:
                regions.pop(i)
                osmCode.pop(i)
                regionsLink.pop(i)

def replace_region_with_many(data):
    '''Replace a single region missing osm id with the several smaller regions it 
       is made up of, data is imported from osm_data.py for old_regions, 
       new_region_codes and new_region_ids'''

    for iso_code, languages in data.items(): 
        for language_name, details in languages.items():
            
            regions = details.get("Regions", [])
            regions_osm = details.get("RegionsOSM", [])
            regions_id = details.get("RegionsID", [])
            
            updated_regions = []
            updated_region_osm = []
            updated_region_id = []
            for i, region in enumerate(regions):
                if region in old_regions:
                    updated_regions.extend(old_regions[region])

                    osm_list =  map(new_region_codes.get, old_regions[region])
                    updated_region_osm.extend(osm_list) 

                    id_list = map(new_region_ids.get, old_regions[region])
                    updated_region_id.extend(id_list)
                else: 
                    updated_regions.append(region)
                    updated_region_osm.append(regions_osm[i])
                    updated_region_id.append(regions_id[i])
            details["Regions"] = updated_regions
            details["RegionsOSM"] = updated_region_osm
            details["RegionsID"] = updated_region_id
                
                
                
        

    
    

# old file used was the new_cleaned_query_complete
def filter_dialects_missing():
    '''Filters out dialects, sign languages and languages with zero data into three 
       json files.  Also deletes all the retired_codes from the main language.json'''

    with open("WikidataQuery/new_cleaned_query_333333.json", "r", encoding="utf-8") as f:
        json_data = json.load(f)
    
    #remove_retired_languages(json_data)
    retired_codes = ["xmi", "atf", "amd", "akn", "dyk", "wre", "bwv", "knh", "xkm", "ubm", 
                     "aex", "ggh", "suf", "aay", "ppv", "eur", "chs", "cmk", "btb", "ayx", 
                     "dha", "mja", "pbz", "pgy", "elp", "wiw", "mld", "myq", "ggm", "mhh", 
                     "emo", "yuu", "lmm", "ymt", "yds", "thx", "ime", "bxx", "bmy", "sgo", 
                     "dzd", "byy", "kbf", "xsj", "ynh", "aue", "btl", "cbh", "cbe", "kox", 
                     "iap", "xbx", "rna", "svr", "xip", "yri", "cum", "ome", "pod", "toe", 
                     "prb", "rsi", "rie", "snh", "puk", "lsg", "mwx", "mwy", "lba", "llo", 
                     "myi", "aoh", "ayy", "bbz", "bpb", "cca", "cdg", "dgu", "ekc", "kjf", 
                     "lmz", "plp", "tbb", "bic", "wrd", "pii", "ajt", "tpw", "kgm", "kbz", 
                     "slq", "prp", "wma", "dek", "mis", "mul", "und", "zxx", "okz", "xpw", 
                     "xpx"]
    
    languages_data = {}
    dialects_data = {}
    signlang_data = {}
    missing_data = {}

    for iso_code, languages in json_data.items():
        if iso_code in retired_codes:
            print("skipped bad code")
            continue

        language_list = {}
        dialect_list = {}
        signlang_list = {}   
        missing_list = {}

        # for each lang in one iso_code
        for language_name, data in languages.items():
            instances = data.get("Instances", [])
            countries = data.get("Countries", [])
            regions = data.get("Regions", [])
            
            if all(x == "Missing" for x in countries) and all(x == "Missing" for x in regions):
                missing_list[language_name] = data  # Add to missing list
            elif "dialect" in instances or "dialect group" in instances:
                dialect_list[language_name] = data
            elif "sign language" in instances or "village sign language" in instances:
                signlang_list[language_name] = data
            else: 
                language_list[language_name]  = data
        
        if language_list:
            languages_data[iso_code] = language_list
        if dialect_list: 
            dialects_data[iso_code] = dialect_list
        if signlang_list:
            signlang_data[iso_code] = signlang_list
        if missing_list:
            missing_data[iso_code] = missing_list

    
    add_missing_region_osm(languages_data)
    remove_wikidata_ids(languages_data)
    remove_non_regions(languages_data)
    replace_region_with_many(languages_data)
    update_nepal_regions(languages_data)
    
    # all languages minus the removed below
    print("Length of language list: ")
    print(len(languages_data))
    with open("WikidataQuery/complete/languages.json", "w", encoding="utf-8") as f:
        json.dump(languages_data, f, indent=4, ensure_ascii=False)

    # anything tagged as a dialect of some sort according to wikidata
    print("Length of dialect list: ")
    print(len(dialects_data))
    with open("WikidataQuery/complete/dialects.json", "w", encoding="utf-8") as f:
        json.dump(dialects_data, f, indent=4, ensure_ascii=False)

    # all sign lagnuages
    print("Length of sign language list: ")
    print(len(signlang_data))
    with open("WikidataQuery/complete/signlanguage.json", "w", encoding="utf-8") as f:
        json.dump(signlang_data, f, indent=4, ensure_ascii=False)

    # these are the languages that has no data at all form wikidata (no regions or country just says its a langauge, most of these are now defunct codes or extinct)
    print("Length of missing list: ")
    print(len(missing_data))
    with open("WikidataQuery/complete/lang_missing_everything.json", "w", encoding="utf-8") as f:
        json.dump(missing_data, f, indent=4, ensure_ascii=False)

    print("Sorting complete: languages.json and dialects.json created.")


# util function
def find_missing_entries():
    '''Util function dumping all the languages that has at least 1 missing field in its data'''

    with open("WikidataQuery\complete\languages.json", "r", encoding="utf-8") as f:
        json_data = json.load(f)

    incomplete_data = {}
    for iso_code, languages in json_data.items():

        incomplete_list = {}

        for language_name, data in languages.items():
            regions = data.get("Regions", [])
            regionsID = data.get("RegionsID", [])
            regionosm = data.get("RegionsOSM", [])
            countries = data.get("Countries", [])
            countryID = data.get("CountriesID", [])

            if any(x == "Missing" for x in regions + regionsID + regionosm + countries + countryID):
                incomplete_list[language_name] = data

        if incomplete_list:
            incomplete_data[iso_code] = incomplete_list

    # at least 1 field is missing data        
    print("How many entries in langauge.json missing some data:")
    print(len(incomplete_data))
    with open("WikidataQuery/complete/incomplete_data.json", "w", encoding="utf-8") as f:
        json.dump(incomplete_data, f, indent=4, ensure_ascii=False)

# util function
def find_entries_with_missing_regionsosm():
    '''Util function dumping all language entries missing only the regionosm while 
       having a region present into a json'''

    with open("WikidataQuery/complete/languages.json", "r", encoding="utf-8") as f:
        json_data = json.load(f)

    filtered_data = {}
    
    for iso_code, languages in json_data.items():
        relevant_entries = {} 
        for language_name, data in languages.items():
            regionsID = data.get("RegionsID", [])
            regionOSM = data.get("RegionsOSM", [])
            if "Missing" in regionOSM and any(x != "Missing" for x in regionsID):
                relevant_entries[language_name] = data
   
        if relevant_entries:
            filtered_data[iso_code] = relevant_entries
    
    # get a list of all regions missing its osm i couldnt find 
    # gpt enhanced list comprehension but its still pretty slow, only use this for debugging
    regions_missing_osm = set(
        r_name
        for languages in filtered_data.values()
        for data in languages.values()
        for r_name, r_osm in zip(data.get("Regions", []), data.get("RegionsOSM", []))
        if r_osm == "Missing"
    )
    
    print("\n List of regions without an osm id:")
    print(regions_missing_osm)
    print("Number of regions missing an osm id I cant find:")
    print(len(regions_missing_osm))
    print("Entries with RegionsID present but containing 'Missing' in RegionsOSM:")
    print(len(filtered_data))
    
    #regions_missing_osm_wikidataID = list_missing_regions(filtered_data)
    #indiginous_query(regions_missing_osm_wikidataID) # saved in ethnic_groups.json
    with open("WikidataQuery/complete/missing_regionsosm.json", "w", encoding="utf-8") as f:
        json.dump(filtered_data, f, indent=4, ensure_ascii=False)


def list_missing_regions(data):
    '''Return a list of the wikidata links where the region osm id is missing
        List is sent to indiginous_query()'''

    little_array = []
    for iso_code, languages in data.items():
        for language_name, data in languages.items():
            regionOSM = data.get("RegionsOSM", [])
            
            if "Missing" in regionOSM:
               # print(f"Found in {iso_code} - {language_name} ")
                regions = data.get("Regions", [])
                regionID = data.get("RegionsID", [])
                
                for i in range(len(regions)):
                    cur_r = regions[i] 
                    cur_o = regionOSM[i]
                    cur_id = regionID[i]

                    if cur_o == "Missing":
                        little_array.append(cur_id)
                       # print(f"   region: {cur_r} with {cur_o} id: {cur_id}")
    print("my new list: ")
    print(f"   length of list: {len(little_array)}")  # 1026 run this one through a sparql query
    return little_array
                
def indiginous_query(wikidata_links):
    '''Call sparql for the "instance of" for all the regions to get all types they 
       are tagged with to sort out non-region related ones'''

    results = {}
    link_batches = list(link_list_splitter(wikidata_links))

    headers = {
        "User-Agent": "Testing for a school project - felixjon@net.chalmers.se" 
    }

    for batch_index, batch in enumerate(link_batches):
        print(f"Processing batch {batch_index + 1}/{len(link_batches)}...")

        links = " ".join(f"<{link}>" for link in batch)

        query_ethnic_groups = f'''
            SELECT ?originalEntity ?originalEntityLabel ?instance ?instanceLabel 
            WHERE
            {{
                VALUES ?originalEntity {{ { links } }}
                    
                ?originalEntity wdt:P31 ?instance.  
            
                SERVICE wikibase:label {{ bd:serviceParam wikibase:language "en, [AUTO_LANGUAGE]" }}
            }}
        '''

        response = requests.get(sparql_api_url, params={'query': query_ethnic_groups, 'format': 'json' }, headers=headers, timeout=3)
        response.raise_for_status()
        data = response.json()

        for item in data.get("results", {}).get("bindings", []):
            original_entity = item["originalEntity"]["value"]
            original_label = item.get("originalEntityLabel", {}).get("value", "Missing")
            instance = item["instance"]["value"]  
            instance_label = item.get("instanceLabel", {}).get("value", "Missing")
            
            if original_entity not in results:
                results[original_entity] = {
                    "entityLabel": original_label,
                    "instanceOfLabel": []
                }
            if instance_label not in results[original_entity]["instanceOfLabel"]:
                results[original_entity]["instanceOfLabel"].append(instance_label)

            
        print("Sleep for 2 seconds")
        time.sleep(2)

    with open("WikidataQuery/ethnic_groups.json", "w", encoding="utf-8") as f:
        json.dump(results, f, indent=4, ensure_ascii=False)

    print("Query completed. Results saved to 'WikidataQuery/ethnic_groups.json'.")
        
def link_list_splitter(lst):
    mini_listsize = 100
    for i in range(0, len(lst), mini_listsize):
        yield lst[i:i + mini_listsize]


def remove_non_regions(lang_data):
    '''Removes all data of "regions" that are not actual regions'''

    ethnic_wikiLinks = util_unique_instanceoflabels()

    for iso_code, languages in lang_data.items():
        for language_name, data in languages.items():
            regionsIDs = data.get("RegionsID", [])
            regionNames = data.get("Regions", [])
            regionOSM = data.get("RegionsOSM", [])
            if any(regionid in ethnic_wikiLinks for regionid in regionsIDs):
                #print(f"Nonregion spotted in: {iso_code}")

                for i in reversed(range(len(regionsIDs))): # traverse reverse order
                    regionLink = regionsIDs[i]

                    if regionLink in ethnic_wikiLinks:
                        groupName = regionNames[i]
                        #print(f"   Removing group {groupName} regionIDLink: {regionLink} at index {i}")
                        regionsIDs.pop(i)
                        regionNames.pop(i)
                        regionOSM.pop(i)


def util_unique_instanceoflabels():
    '''Loads all the "instance of" tags and sorts out each unique one sorting out 
       the non region related tags.
       Gets non_region_tags from osm_data.py'''

    with open("WikidataQuery/complete/ethnic_groups.json", "r", encoding="utf-8") as f:
        ethnic_groups_data = json.load(f)

    # create a list of all unique instance of tags
    people_ethnic_groups = []
    for entry in ethnic_groups_data.values(): 
        instanceof = entry.get("instanceOfLabel", [])
        for instanceLabel in instanceof:
            if instanceLabel not in people_ethnic_groups:
                people_ethnic_groups.append(instanceLabel)

    # Match the wikilink (which is the regionID in the json) to the regionosm of the langauges.json
    confirmed_ethnicWikiLink = []
    for wiki_link, entry in ethnic_groups_data.items(): 
        if any(link in non_region_tags for link in entry.get("instanceOfLabel", [])):
            confirmed_ethnicWikiLink.append(wiki_link)
    return confirmed_ethnicWikiLink



def update_nepal_regions(lang_data):
    '''Unique function just for nepal to fully replace all their zones with the new provinces
        since wikidata hasn't updated their database with them'''

    zone_to_province = {
        "Mechi Zone": "Koshi Province",
        "Koshi Zone": "Koshi Province",
        "Kosi Zone": "Koshi Province",
        "Sagarmatha Zone": "Koshi Province",
        "Janakpur Zone": "Madesh Province", 
        "Bagmati Zone": "Bagmati Province",
        "Narayani Zone": "Bagmati Province",
        "Gandaki Zone": "Gandaki Province",
        "Lumbini Zone": "Lumbini Province",  
        "Rapti Zone": "Lumbini Province",
        "Bheri Zone": "Karnali Province",
        "Karnali Zone": "Karnali Province",
        "Seti Zone": "Sudurpashchim Province",
        "Mahakali Zone": "Sudurpashchim Province"
    }

    province_osm = {
        "Koshi Province": "10489132",
        "Madesh Province": "10489318",
        "Bagmati Province": "10489317",
        "Gandaki Province": "10489605",
        "Lumbini Province": "10493722",
        "Karnali Province": "10493723",
        "Sudurpashchim Province": "10488187"
    }

    province_wikidataID = {
        "Koshi Province": "http://www.wikidata.org/entity/Q25104008",
        "Madesh Province": "http://www.wikidata.org/entity/Q25104009",
        "Bagmati Province": "http://www.wikidata.org/entity/Q25104015",
        "Gandaki Province": "http://www.wikidata.org/entity/Q25104016",
        "Lumbini Province": "http://www.wikidata.org/entity/Q25104014",
        "Karnali Province": "http://www.wikidata.org/entity/Q25104017",
        "Sudurpashchim Province": "http://www.wikidata.org/entity/Q25104019"
    }

    for iso_code, languages in lang_data.items():
        for language_name, data in languages.items():
            countries = data.get("Countries", [])

            if "Nepal" in countries:
                regions = data.get("Regions", [])
                regions_id = data.get("RegionsID", [])
                regions_osm = data.get("RegionsOSM", [])

                for i in range(len(regions)):
                    old_region = regions[i]

                    if old_region in zone_to_province:
                        #print(f"Decrepated zone in: {iso_code} ALERT: {old_region}")
                        
                        new_region = zone_to_province[old_region]
                        new_region_id = province_wikidataID[new_region]
                        new_region_osm = province_osm[new_region]
                        #print(f"   replacement: {new_region}, {new_region_osm}, {new_region_id}")
                        
                        regions[i] = new_region
                        regions_id[i] = new_region_id
                        regions_osm[i] = new_region_osm
    print("Nepal zones update Done")
    print("")
                        
#get_lang_data() # bka btx jhi krh with doublets get sorted out later 

def main():
    filter_dialects_missing()
    find_missing_entries()
    find_entries_with_missing_regionsosm()
    print("Yearly update done")

if __name__ == "__main__":
    main()