from SPARQLWrapper import SPARQLWrapper, JSON
import json

sparql = SPARQLWrapper("https://query.wikidata.org/sparql")
sparql.setTimeout(60)

query = """
SELECT ?language ?languageLabel ?isoCode ?country ?countryLabel ?countryOSM WHERE {
  ?language wdt:P31 wd:Q34770.  # Instans av mänskligt språk
  ?language wdt:P220 ?isoCode.   # Hämtar ISO 639-3-kod
  
  OPTIONAL { ?language wdt:P17 ?country. 
    OPTIONAL { ?country wdt:P402 ?countryOSM. }
    }

  SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
} LIMIT 20
"""

sparql.setQuery(query)
sparql.setReturnFormat(JSON)

results = sparql.query().convert()
languages_dict = {}

for result in results["results"]["bindings"]:
    language_id = result["language"]["value"]
    language_label = result["languageLabel"]["value"]
    iso_code = result["isoCode"]["value"]
    countryLabel = result.get("countryLabel", {}).get("value", "Unknown")
    countryOSM = result.get("countryOSM", {}).get("value", "Unknown")
    
    if iso_code not in languages_dict:
        languages_dict[iso_code] = {
            "language": language_id,
            "languageLabel": language_label,
            "isoCode": iso_code,
            "countryLabels": [],
            "countryOSMs": []
        }
    
    languages_dict[iso_code]["countryLabels"].append(countryLabel)
    languages_dict[iso_code]["countryOSMs"].append(countryOSM)

languages_list = list(languages_dict.values())

print(type(languages_list))

print(f"Hittade {len(languages_list)} språk.")

with open("languages_with_countries_test1.json", "w", encoding="utf-8") as outfile:
    json.dump(languages_list, outfile, ensure_ascii=False, indent=2)

print("JSON-filen 'languages_with_countries_test1.json' har skapats.")