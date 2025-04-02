import json
import time 
import util
from osm_data import non_region_tags, misfiltered_regions, region_codes_by_country, deprecated_regions, replacement_region_codes, replacement_region_ids


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


def format_api_response(api_data, output_file, dump_to_file):
    '''From the inital wikidata query format the fetched data in a 
       more readable format for us.'''
    
    cleaned_query_json = {}

    for item in api_data["results"]["bindings"]:
        iso_code = item["iso639_3"]["value"]
        language_name = item["languageLabel"]["value"]
        language_id = item["language"]["value"]
        instanceOf = item["instanceOfLabel"]["value"]
        if "immediate_language_family_Label" in item:
            immediate_Language_Family = item["immediate_language_family_Label"]["value"]
        else:
            immediate_Language_Family = "Missing"
    #       isApple = True if fruit == 'Apple' else False
        if "number_of_speakers" in item:
            number_of_speakers = item["number_of_speakers"]["value"]

            if "nos_place_Label" in item:
                nos_place = item["nos_place_Label"]["value"]
            else:
                nos_place = "Missing"
            
            if "nos_time" in item:
                nos_time = item["nos_time"]["value"]
            else:
                nos_time = "Missing"

            if "nos_applies_to_Label" in item: 
                nos_applies_to = item["nos_applies_to_Label"]["value"]
            else:
                nos_applies_to = "Missing"
        else:
            number_of_speakers = "Missing"
            nos_time = "Missing"
            nos_place = "Missing"
            nos_applies_to = "Missing"
        
        if iso_code not in cleaned_query_json:
            cleaned_query_json[iso_code] = {}

        if language_name not in cleaned_query_json[iso_code]:  # adds a new entry in the output json 
            cleaned_query_json[iso_code][language_name] = {
                "Language": language_name,
                "LanguageID": language_id,
                "Regions": [],
                "RegionsID": [],
                "RegionsOSM": [],
                "Countries": [],
                "CountriesID": [],
                "CountriesOSM": [],
                "Instances": [],
                "immediate_Language_Families": [],
                "number_of_speakers": []
            }
        # squash the multiple entries adding all instances of a language in an array
        if instanceOf not in cleaned_query_json[iso_code][language_name]["Instances"]:
            cleaned_query_json[iso_code][language_name]["Instances"].append(instanceOf)

        if immediate_Language_Family not in cleaned_query_json[iso_code][language_name]["immediate_Language_Families"]:
            cleaned_query_json[iso_code][language_name]["immediate_Language_Families"].append(immediate_Language_Family)

        number_of_speakers_dict = {"number": number_of_speakers, "place surveyed": nos_place, "number applies to": nos_applies_to, "time surveyed": nos_time}
        if number_of_speakers_dict not in cleaned_query_json[iso_code][language_name]["number_of_speakers"]:
            cleaned_query_json[iso_code][language_name]["number_of_speakers"].append(number_of_speakers_dict)
        
    
    if dump_to_file:
        with open(f"WikidataQuery/debug/{output_file}.json", "w", encoding="utf-8") as f:
            json.dump(cleaned_query_json, f, indent=4, ensure_ascii=False)
 
    return cleaned_query_json
    #print(len(cleaned_query_json)) #8236   

def clean_dead_lang(lang_data, output_file, dump_to_file):
    '''Clean out dead and non-languages based of their "Instance" tag'''

    cleaned_query_json = {}
    excluded_instances = {"extinct language", "dead language", "ancient language", "historical language", "spurious language", "constructed language"}

    # dealing with the nested mess of json structure 
    for iso_code, languages in lang_data.items():
        filtered_lang = {}

        # for each lang in one iso_code
        for language_name, data in languages.items():
            # if the current lang's instanceof is one of the forbidden ones, skip
            if any(instance in excluded_instances for instance in data["Instances"]):
                continue
    
            filtered_lang[language_name] = {
                "Language": data["Language"],
                "LanguageID": data["LanguageID"],
                "Regions": data["Regions"],
                "RegionsID": data["RegionsID"],
                "RegionsOSM": data["RegionsOSM"],
                "Countries": data["Countries"],
                "CountriesID": data["CountriesID"],
                "CountriesOSM": data["CountriesOSM"],
                "Instances": data["Instances"],
                "immediate_Language_Families": data["immediate_Language_Families"],
                "number_of_speakers": data["number_of_speakers"]
            }
            
        if filtered_lang: 
            cleaned_query_json[iso_code] = filtered_lang

    if dump_to_file:    
        with open(f"WikidataQuery/debug/{output_file}.json", "w", encoding="utf-8") as f:
            json.dump(cleaned_query_json, f, indent=4, ensure_ascii=False)
    
    #print(len(cleaned_query_json)) #7401 -> 7337  -> 7292 // after json refactor stays the same (good)
    return cleaned_query_json

def remove_retired_languages(lang_data, output_file, dump_to_file): 
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

    cleaned_query_json = {}
    for iso_code, languages in lang_data.items():
        if iso_code not in retired_codes:
            cleaned_query_json[iso_code] = languages
    
    if dump_to_file:    
        with open(f"WikidataQuery/debug/{output_file}.json", "w", encoding="utf-8") as f:
            json.dump(cleaned_query_json, f, indent=4, ensure_ascii=False)

    return cleaned_query_json
        
def populate_metadata(api_data, lang_data):
    for entry in api_data["results"]["bindings"]:
        language = entry["languageLabel"]["value"]
        region = entry["regionLabel"]["value"] if "regionLabel" in entry else "Missing"
        regionID = entry["region"]["value"] if "region" in entry else "Missing"
        region_osm_id = entry["region_osm_id"]["value"] if "region_osm_id" in entry else "Missing"
        country = entry["countryLabel"]["value"] if "countryLabel" in entry else "Missing"
        countryID = entry["country"]["value"] if "country" in entry else "Missing"
        country_osm_id = entry["country_osm_id"]["value"] if "country_osm_id" in entry else "Missing"
        iso_code = entry["iso_code"]["value"] 
        
        # keep the old structure
        if language not in lang_data[iso_code]:
            lang_data[iso_code][language] = {
                "Language": language,
                "LanguageID": entry["language"]["value"],  
                "Regions": [],
                "RegionsID": [],
                "RegionsOSM": [],
                "Countries": [],
                "CountriesID": [],
                "CountriesOSM": [],
                "Instances": [],
                "immediate_Language_Families": [],
                "number_of_speakers": [] 
            }

        if region not in lang_data[iso_code][language]["Regions"]:
            lang_data[iso_code][language]["Regions"].append(region)
        if regionID not in lang_data[iso_code][language]["RegionsID"]:
            lang_data[iso_code][language]["RegionsID"].append(regionID)
            lang_data[iso_code][language]["RegionsOSM"].append(region_osm_id) # put in multiple missings of the regionosm id matching in placement to the region names
        if country not in lang_data[iso_code][language]["Countries"]:
            lang_data[iso_code][language]["Countries"].append(country)
        if countryID not in lang_data[iso_code][language]["CountriesID"]:
            lang_data[iso_code][language]["CountriesID"].append(countryID)
            lang_data[iso_code][language]["CountriesOSM"].append(country_osm_id)
    print(f"200 done, sleeping for 1.5 seconds...") # get better logging
    time.sleep(1.5) 
    return lang_data
    
def clean_missing_data(lang_data):
    # this file is just here for now, get a way to create it from scratch later
    with open("WikidataQuery/debug/ethnic_groups.json", "r", encoding="utf-8") as f:
        ethnic_groups_data = json.load(f)
    non_region_links = util.unique_instanceoflabels(ethnic_groups_data, non_region_tags) # probably no reason to send it as an argument when its already a global var
    
    for iso_code, languages in lang_data.items():
        for language_name, data in languages.items():
            filter_non_regions(data, non_region_links)
            remove_missing_region_name(data)
            remove_non_regions(data)
            add_missing_region_osm(data)
            replace_region_with_many(data)
            update_nepal_regions(data) # this is still such a dumb function

    return lang_data

def filter_non_regions(data, non_region_links):
    '''Filters out and removes regions and all their data based of the
       regionID aka the wikidata link'''

    regionsIDs = data.get("RegionsID", [])
    regionNames = data.get("Regions", [])
    regionOSM = data.get("RegionsOSM", [])
    if any(regionid in non_region_links for regionid in regionsIDs):
        #print(f"Nonregion spotted in: {iso_code}")

        for i in reversed(range(len(regionsIDs))): # traverse reverse order
            regionLink = regionsIDs[i]

            if regionLink in non_region_links:
                groupName = regionNames[i]
               # print(f"   Removing group {groupName} regionIDLink: {regionLink} at index {i}")
                regionsIDs.pop(i)
                regionNames.pop(i)
                regionOSM.pop(i)

def remove_missing_region_name(data):
    # For specifically any region that was missing a name and only took the code 
    # e.g Q21091247 for example
    if any(region.startswith("Q") and region[1:].isdigit() for region in data.get("Regions", [])):
        osmCode = data.get("RegionsOSM", [])
        regionsLink = data.get("RegionsID", [])
        regions = data.get("Regions", [])

        for i in reversed(range(len(regions))): # traverse reverse order
            region = regions[i]
            if region.startswith("Q") and region[1:].isdigit():
                curOSM = osmCode[i]
               # print(f"Removing region: {region} and OSM code: {curOSM} at index {i}")
                regions.pop(i)
                osmCode.pop(i)
                regionsLink.pop(i)

def remove_non_regions(data):
    '''Remove regions and their metadata based of the region name'''
    
    countries = data.get("Countries", [])
    # Edge case of kenya having regions sharing names with other countries regions
    if "Kenya" in countries:
        for region in ["Central Province", "Coast Province", "Eastern Province"]:
            util.remove_region(data, region)

    for region in misfiltered_regions:
        util.remove_region(data, region)       

def add_missing_region_osm(data):
    '''Replaces all the "Missing" in the json with their found osm id codes to 
       their respective region'''
    
    for country in data.get("Countries", []):
        if country in region_codes_by_country:
          #  print(f"-----{country}-------")
            util.replace_missingcodes(data, region_codes_by_country[country])

def replace_region_with_many(data): # consider splitting this out into a util
    '''Replace a single region missing osm id with the several smaller regions it 
       is made up of, data is imported from osm_data.py for deprecated_regions, 
       new_region_codes and new_region_ids'''
            
    regions = data.get("Regions", [])
    regions_osm = data.get("RegionsOSM", [])
    regions_id = data.get("RegionsID", [])
    
    updated_regions = []
    updated_region_osm = []
    updated_region_id = []
    for i, region in enumerate(regions):
        if region in deprecated_regions:
            updated_regions.extend(deprecated_regions[region])

            osm_list =  map(replacement_region_codes.get, deprecated_regions[region])
            updated_region_osm.extend(osm_list) 

            id_list = map(replacement_region_ids.get, deprecated_regions[region])
            updated_region_id.extend(id_list)
        else: 
            updated_regions.append(region)
            updated_region_osm.append(regions_osm[i])
            updated_region_id.append(regions_id[i])
    data["Regions"] = updated_regions
    data["RegionsOSM"] = updated_region_osm
    data["RegionsID"] = updated_region_id

def update_nepal_regions(data):
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
    #print("Nepal zones update Done")

def filter_lang_data(lang_data):
    languages_data = {}
    dialects_data = {}
    signlang_data = {}
    missing_data = {}

    for iso_code, languages in lang_data.items():
        language_list = {}
        dialect_list = {}
        signlang_list = {}   
        missing_list = {}

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

    print("Length of language list: ")
    print(len(languages_data))
    with open("WikidataQuery/debug/languages.json", "w", encoding="utf-8") as f:
        json.dump(languages_data, f, indent=4, ensure_ascii=False)

    # anything tagged as a dialect of some sort according to wikidata
    print("Length of dialect list: ")
    print(len(dialects_data))
    with open("WikidataQuery/debug/dialects.json", "w", encoding="utf-8") as f:
        json.dump(dialects_data, f, indent=4, ensure_ascii=False)

    # all sign lagnuages
    print("Length of sign language list: ")
    print(len(signlang_data))
    with open("WikidataQuery/debug/signlanguage.json", "w", encoding="utf-8") as f:
        json.dump(signlang_data, f, indent=4, ensure_ascii=False)

    # these are the languages that has no data at all form wikidata (no regions or country just says its a langauge, most of these are now defunct codes or extinct)
    print("Length of missing list: ")
    print(len(missing_data))
    with open("WikidataQuery/debug/lang_missing_everything.json", "w", encoding="utf-8") as f:
        json.dump(missing_data, f, indent=4, ensure_ascii=False)

    return languages_data
    