def chunk_list(list, mini_listsize):
    for i in range(0, len(list), mini_listsize):
        yield list[i:i + mini_listsize]

def array_to_string(iso_array):
    return "{ " + " ".join(f'"{iso_code}"' for iso_code in iso_array) + " }"

def unique_instanceoflabels(ethnic_groups_data, non_region_tags):
    '''Loads all the "instance of" tags and sorts out each unique one sorting out 
       the non region related tags.
       Gets non_region_tags from osm_data.py'''

    # Match the wikilink (which is the regionID in the json) to the regionosm of the langauges.json
    confirmed_ethnicWikiLink = []
    for wiki_link, entry in ethnic_groups_data.items(): 
        if any(link in non_region_tags for link in entry.get("instanceOfLabel", [])):
            confirmed_ethnicWikiLink.append(wiki_link)
    return confirmed_ethnicWikiLink

def remove_region(data, region_name):
    '''Removes a single specified region and its associated data from details'''
    
    if region_name in data.get("Regions", []):
        osmCode = data.get("RegionsOSM", [])
        regionsLink = data.get("RegionsID", [])
        regions = data.get("Regions", [])

        for i in reversed(range(len(regions))):  # Traverse in reverse to avoid index issues
            if region_name in regions[i]:
                regions.pop(i)
                osmCode.pop(i)
                regionsLink.pop(i)

def replace_missingcodes(data, osm_array):
    regions = data.get("Regions", [])
    regions_osm = data.get("RegionsOSM", [])
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