import requests
import json
import time
# This file is planned to become a one-click-get-all-languages automating the wikidata sparql api but
# need major refactoring. 


sparql = "https://query.wikidata.org/sparql"

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
    response1 = requests.get(sparql, params={'query': query, 'format': 'json' })
    data1 = response1.json()

    with open(f"WikidataQuery/{outputFile}", "w", encoding="utf-8") as f:
            json.dump(data1, f, indent=4, ensure_ascii=False)

def clean_api_query():
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

    # Här ska man kunna lägga till så man kör flera requests i taget :) lägg in array, eventuellt köra denna array igen sen   
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
            response = requests.get(sparql, params={'query': query, 'format': 'json' }, headers=headers, timeout=3)
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

    # final write not hitting here
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



png_region_osm = {
    "Sandaun Province": "311777",
    "Madang Province": "311779",
    "Oro Province": "311781",
    "East Sepik Province": "311778",
    "Morobe Province": "311780",
    "Western Province": "311776",
    "West New Britain Province": "3777384",
    "East New Britain Province": "3777381",
    "Gulf Province": "311775",
    "Manus Province": "3777382",
    "Eastern Highlands Province": "311774",
    "Southern Highlands Province": "311770",
    "Western Highlands Province": "311772",
    "New Ireland Province": "3777383",
    "Chimbu Province": "311773",
    "Milne Bay Province": "311782",
    "Central Province": "311783",
    "Enga Province": "311771"
}

def add_png_region_osm(data):
    for iso_code, languages in data.items(): 
        for language_name, details in languages.items():
            if "Papua New Guinea" in details.get("Countries", []):

                # avoid out of bounds by keeping the osm array as big as the region one
                while len(details["RegionsOSM"]) < len(details["Regions"]):
                    details["RegionsOSM"].append("Missing")

                for i, region in enumerate(details.get("Regions", [])):
                    if region in png_region_osm:
                        # If the OSM ID is missing overwrite it
                        if details["RegionsOSM"][i] == "Missing":
                            details["RegionsOSM"][i] = png_region_osm[region]
                            print(f"Updated {region} with OSM ID {png_region_osm[region]} for language {language_name}")
                       
def remove_wikidata_ids(data):
    for iso_code, languages in data.items(): 
        for language_name, details in languages.items():
            if any(region.startswith("Q") and region[1:].isdigit() for region in details.get("Regions", [])):
                print(f"Found in {iso_code} - {language_name} ")
                
                osmCode = details.get("RegionsOSM", [])
                regions = details.get("Regions", [])

                for i in reversed(range(len(regions))): # traverse reverse order
                    region = regions[i]
                    if region.startswith("Q") and region[1:].isdigit():
                        curOSM = osmCode[i]
                        print(f"Removing region: {region} and OSM code: {curOSM} at index {i}")

                        regions.pop(i)
                        osmCode.pop(i)


# old file used was the new_cleaned_query_complete
def filter_dialects_missing():
    with open("WikidataQuery/new_cleaned_query_333333.json", "r", encoding="utf-8") as f:
        json_data = json.load(f)
    
    retired_codes = ["xmi", "atf", "amd", "akn", "dyk", "wre", "bwv", "knh", "xkm", "ubm", "aex", "ggh", "suf", "aay", "ppv", "eur", "chs", "cmk", "btb", "ayx", "dha", "mja", "pbz", "pgy", "elp", "wiw", "mld", "myq", "ggm", "mhh", "emo", "yuu", "lmm", "ymt", "yds", "thx", "ime", "bxx", "bmy", "sgo", "dzd", "byy", "kbf", "xsj", "ynh", "aue", "btl", "cbh", "cbe", "kox", "iap", "xbx", "rna", "svr", "xip", "yri", "cum", "ome", "pod", "toe", "prb", "rsi", "rie", "snh", "puk", "lsg", "mwx", "mwy", "lba", "llo", "myi", "aoh", "ayy", "bbz", "bpb", "cca", "cdg", "dgu", "ekc", "kjf", "lmz", "plp", "tbb", "bic", "wrd", "pii", "ajt", "tpw", "kgm", "kbz", "slq", "prp", "wma", "dek", "mis", "mul", "und", "zxx", "okz", "xpw", "xpx"]
    
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

    add_png_region_osm(languages_data)
    remove_wikidata_ids(languages_data)
    remove_native_speakers(languages_data)

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

    # these are the languages that has no data at all form wikidata (no regions or country just says its a langauge)
    print("Length of missing list: ")
    print(len(missing_data))
    with open("WikidataQuery/complete/lang_missing_everything.json", "w", encoding="utf-8") as f:
        json.dump(missing_data, f, indent=4, ensure_ascii=False)

    print("Sorting complete: languages.json and dialects.json created.")


# util function
def find_missing_entries():
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
    print("in langauge.json how many are missing some data:")
    print(len(incomplete_data))
    with open("WikidataQuery/complete/incomplete_data.json", "w", encoding="utf-8") as f:
        json.dump(incomplete_data, f, indent=4, ensure_ascii=False)

# util function
def find_entries_with_missing_regionsosm():
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
    
    print("Entries with RegionsID present but containing 'Missing' in RegionsOSM:")
    print(len(filtered_data))
    
    regions_missing_osm_wikidataID = list_missing_regions(filtered_data)
    indiginous_query(regions_missing_osm_wikidataID) # saved in ethnic_groups.json



    with open("WikidataQuery/complete/missing_regionsosm.json", "w", encoding="utf-8") as f:
        json.dump(filtered_data, f, indent=4, ensure_ascii=False)

def list_missing_regions(data):
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

        response = requests.get(sparql, params={'query': query_ethnic_groups, 'format': 'json' }, headers=headers, timeout=3)
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


def remove_native_speakers(lang_data):
    ethnic_wikiLinks = util_unique_instanceoflabels()

    for iso_code, languages in lang_data.items():
        for language_name, data in languages.items():
            regionsID = data.get("RegionsID", [])


    
    return

# had chatgpt sort out which were ethnicgroups and which were actual region instances
def util_unique_instanceoflabels():
    with open("WikidataQuery/complete/ethnic_groups.json", "r", encoding="utf-8") as f:
        ethnic_groups_data = json.load(f)

    people_ethnic_groups = []

    for entry in ethnic_groups_data.values(): 
        instanceof = entry.get("instanceOfLabel", [])
        for instanceLabel in instanceof:
            if instanceLabel not in people_ethnic_groups:
                people_ethnic_groups.append(instanceLabel)

    people_ethnic_groups = [
        "ethnic group",
        "indigenous people",
        "ethnic groups in Indonesia",
        "native Indonesians",
        "Indigenous peoples of the Americas",
        "Apache",
        "indigenous peoples in Ecuador",
        "ethnic minority group",
        "indigenous peoples in Bolivia",
        "historical ethnic group",
        "peoples of the Quran",
        "panethnicity",
        "North Halmahera peoples",
        "ethnoreligious group",
        "ethnic territory",
        "Indo-Aryan peoples",
        "indigenous peoples in Brazil",
        "ethnographic group",
        "itinerant groups of Europe",
        "ethnic minority",
        "uncontacted peoples",
        "ethnic community",
        "ethnolinguistic group",
        "nation",
        "people",
        "tribe",
        "federally recognized Native American tribe in the United States",
        "Native Americans in the United States",
        "First Nation band",
        "nationality"
    ]

    # want to match the wikilink to the regionosm of the langauges.json
    confirmed_ethnicWikiLink = []
    for wiki_link, entry in ethnic_groups_data.items(): 
        if any(link in people_ethnic_groups for link in entry.get("instanceOfLabel", [])):
            confirmed_ethnicWikiLink.append(wiki_link)
    
    return confirmed_ethnicWikiLink



#get_lang_data() # bka btx jhi krh with doublets get sorted out later 
#filter_dialects_missing()
find_missing_entries()
#find_entries_with_missing_regionsosm()
util_unique_instanceoflabels()
