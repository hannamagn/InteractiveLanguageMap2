import logging
import os
import json
import query_service
import query_cleaner
import mongo_handler
logger = logging.getLogger(__name__)
#logging.basicConfig(level=logging.DEBUG)

def main():
    fname = os.path.isfile("WikidataQuery/debug/langmetadata.json")
    if fname:
        print("The language metadata was last pulled at [time] in debug/langmetadata.json")
        refetch_me = input("Do you want to refetch it? y/n: ")

        if refetch_me == "y":
            logger.info('Call wikidata api')
            api_data = query_service.get_lang_base(False)

            # check agains the iso file put in debug 
            
            logger.info('Format the response data')
            lang_data = query_cleaner.format_api_response(api_data, "formatted_api_response", True)
            logger.info(len(lang_data))    

            logger.info("Clean dead languages")
            lang_data = query_cleaner.clean_dead_lang(lang_data, "cleaned_dead_lang", False)
            logger.info(len(lang_data))

            logger.info("Remove retired codes")
            lang_data = query_cleaner.remove_retired_languages(lang_data, "cleaned_retired_lang", False)
            logger.info(len(lang_data))

            logger.info("Fetch and populate all language metadata")
            lang_data = query_service.get_lang_metadata(lang_data)
            logger.info("Updated metadata dumped to debug/langmetadata.json")
        else: 
            with open("WikidataQuery/debug/langmetadata.json", "r", encoding="utf-8") as f:
                lang_data = json.load(f)

    lang_data = query_cleaner.clean_missing_data(lang_data)

    # the complete langmetadata is saved to not accidentally overwrite the dialect/sign/missing language files 
    logger.info("Filter out dialects, sign langauges and languages missing all metadata")
    lang_data = query_cleaner.filter_lang_data(lang_data) # lang_data is now only language.json filtered out

    repopulate_metadata = input("Repopulate metadata into database? y/n: ")
    if repopulate_metadata == "y":
        logger.info("Populate metadata into the database")
        mongo_handler.populate_metadata_mongodb(lang_data)
    
    repopulate_regiondata = input("Repopulate regiondata into database? y/n: ")
    if repopulate_regiondata == "y":
        logger.info("Populate regiondata into the database")
        query_service.get_regions(lang_data)
        with open("WikidataQuery/debug/minifiedFormattedRegionData.geojson", "r", encoding="utf-8") as f:
            minified_Region_Data = json.load(f)
        mongo_handler.populate_regions_mongodb_from_full_list(minified_Region_Data)

if __name__ == "__main__":
    main()