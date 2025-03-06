from SPARQLWrapper import SPARQLWrapper, JSON
import json

sparql = SPARQLWrapper("https://query.wikidata.org/sparql")
sparql.setTimeout(60)

query = """
SELECT ?language ?languageLabel ?isoCode ?region ?regionOSM ?regionLabel ?country ?countryLabel WHERE {
  ?language wdt:P31 wd:Q34770.  # Instans av mänskligt språk
  ?language wdt:P220 ?isoCode.   # Hämtar ISO 639-3-kod
  
  OPTIONAL { ?language wdt:P2341 ?region. 
    OPTIONAL { ?region wdt:P402 ?regionOSM. }
    }
  OPTIONAL { ?language wdt:P17 ?country. }
  
  FILTER NOT EXISTS { ?language wdt:P31 wd:Q9143 }        # Exkludera programmeringsspråk
  FILTER NOT EXISTS { ?language wdt:P31 wd:Q11399 }       # Exkludera konstruerade språk
  FILTER NOT EXISTS { ?language wdt:P31 wd:Q3555679 }     # Exkludera utdöda språk
  FILTER NOT EXISTS { ?language wdt:P5180 ?dialekt. }     # Exkludera dialekter

  SERVICE wikibase:label { bd:serviceParam wikibase:language "sv,en". }
}
"""

sparql.setQuery(query)
sparql.setReturnFormat(JSON)

results = sparql.query().convert()
languages_dict = {}

for result in results["results"]["bindings"]:
    language_id = result["language"]["value"]
    language_label = result["languageLabel"]["value"]
    iso_code = result["isoCode"]["value"]
    region = result.get("regionLabel", {}).get("value", "Unknown")
    country = result.get("countryLabel", {}).get("value", "Unknown")
    region_osm = result.get("regionOSM", {}).get("value", "Unknown")
    
    if iso_code not in languages_dict:
        languages_dict[iso_code] = {
            "code": iso_code,
            "language": language_label,
            "language_id": language_id,
            "regions": set(),
            "countries": set(),
            "region_osm": region_osm
        }
    
    if region != "Unknown":
        languages_dict[iso_code]["regions"].add(region)
    if country != "Unknown":
        languages_dict[iso_code]["countries"].add(country)

for iso_code in languages_dict:
    languages_dict[iso_code]["regions"] = list(languages_dict[iso_code]["regions"])
    languages_dict[iso_code]["countries"] = list(languages_dict[iso_code]["countries"])

languages_list = list(languages_dict.values())

print(f"Hittade {len(languages_list)} språk.")

with open("languages_with_regions.json", "w", encoding="utf-8") as outfile:
    json.dump(languages_list, outfile, ensure_ascii=False, indent=2)

print("JSON-filen 'languages_with_regions.json' har skapats.")