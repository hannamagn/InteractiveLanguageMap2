'''Data for add_missing_region_osm()'''  
papau_region_osm = {
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
    "Enga Province": "311771",
    "Hela Province": "3778575"
}

somali_region_codes = {
    "Middle Juba": "1720061",
    "Lower Juba": "1720059",
    "Bay": "1720055",
    "Lower Shebelle": "1720060",
    "Gedo": "1720057",
    "Bakool": "1720052",
    "Hiiran": "1720058",
    "Hiran": "1720058"
}

afghanistan_region_codes = {
    "Nangarhar Province": "1674770",
    "Kunar Province": "1674607",
    "Nuristan Province": "1674544",
    "Kandahar Province": "1674567",
    "Maidan Wardak Province": "1759757",
    "Badakhshan Province": "1674535",
    "Badghis Province": "1674811",
    "Panjshir Province": "1675032",
    "Laghman Province": "1674766",
    "Kunar Province": "1674607",
    "Kabul Province": "1674876",
    "Kapisa Province": "1674767",
    "Parwan Province": "1674782",
    "Herat Province": "1674803",
    "Faryab Province": "1674814",
    "Jowzjan Province": "1674800"
}

bhutan_region_codes = {
    "Bumthang District": "3899602",
    "Haa District": "3899607",
    "Lhuntse District": "3899608",
    "Trashiyangtse District": "3899618",
    "Wangdue Phodrang District": "3899621",
    "Punakha District": "3899612",
    "Trongsa District": "3899619",
    "Samtse District": "3899614",
    "Gasa District": "3899606",
    "Punakha District": "3899612",
    "Samdrup Jongkhar District": "3899613"
}

uganda_region_codes = {
    "Bundibugyo District": "3501892",
    "Amuru District": "3501792",
    "Kapchorwa District": "3501837",
    "Lira District": "3497128",
    "Mbale District": "3498160",
    "Moyo District": "3501824"
}

guinea_regions_codes = {
    "Dinguiraye Prefecture": "12286515",
    "Faranah Prefecture": "12286515",
    "Mamou Prefecture": "3308938"
}

congo_region_codes = {
    "Lékoumou Department": "3220592",
    "Pointe-Noire": "3947631", # there was a smaller version of this of just the city
}

demCongo_region_codes = {
    "Kasaï District": "5646599" # this will overlap with another kasai
}

indonesia_region_codes = {
    "Adonara": "5182707",
    "Lesser Sunda Islands": "7226026",
    "Tidore Island": "5684718",
    "Kisar Island": "25870936",
    "West Pantai": "16091326",
    "Mamberamo Hilir": "7754447",
    "West Timor": "9426161", # cant find only west, this code is for the whole of timor island
    "Selayar Islands": "12574566",
    "Biak Island": "9538266",
    "Numfor Island": "17049024",
    "Bajo": "9368574", # not sure this is 100% right
    "Ternate Island": "24388000",
    "Kepa Island": "24387991",
    "Bacan": "7176719",
    "Kayoa": "12556588",
    "Palue Island": "24295673",
    "Pemana Kecil Island": "24295776",
    "Solor Island": "5183294",
    "Moraid": "940417592",
}

russia_region_codes = {
    "Nizhnekolymsky District": "1399826",
    "Altai Mountains": "10904143", 
    "Ulchsky District": "1651689", 
    "Rutulsky District": "1858752", 
    "Tabasaransky District": "1858755"
}

greece_region_codes = {
    "Xanthi Prefecture": "939213", 
    "Evritania Prefecture": "959069", 
    "Central Greece": "910915", 
    "Thessaly": "958236",
    "Trikala Prefecture": "558521"
}

france_region_codes = {
    "Limousin": "8644", 
    "Tuamotus": "6065911", 
    "Pointe de Givet": "1336057", 
    "Brittany": "102740"
}

japan_region_codes = {
    "Kunigami": "4533961",
    "Yaeyama Islands": "4559286",
    "Miyako Islands": "4858178"
}

# Norman nrf has no country listed so cant add it through this function
#"Normandy": "3793170"

region_codes_by_country = {
    "Papua New Guinea": papau_region_osm,
    "Somalia": somali_region_codes,
    "Afghanistan": afghanistan_region_codes,
    "Bhutan": bhutan_region_codes,
    "Uganda": uganda_region_codes,
    "Guinea": guinea_regions_codes,
    "Japan": japan_region_codes,
    "Greece": greece_region_codes,
    "Indonesia": indonesia_region_codes,
    "Republic of the Congo": congo_region_codes, 
    "Democratic Republic of the Congo": demCongo_region_codes,
    "Russia": russia_region_codes,
    "France": france_region_codes,
    "Djibouti": {"Obock Region": "3905167"},
    "Morocco": {"Sous": "2424036"},
    "Malawi": {"Zomba District": "7345872"},
    "Zimbabwe": {"Bulawayo Province": "3337019"},
    "Eritrea": {"Dahlak Archipelago": "4161588"},
    "Brunei": {"Temburong District": "7843853"},
    "Yemen": {"Hadhramaut": "383897"},
    "South Korea": {"Jeju Province": "2398560"},
    "Azerbaijan": {"Khachmaz District": "3764583"},
    "Italy": {"Mocheni Valley": "6536032"},
    "North Macedonia": {"Kisela Voda Municipality": "6966470"},
    "Malaysia": {"Labuan": "1651689"},
    "Switzerland": {"Uri": "1693971"},
    "Tanzania": {"Dar es Salaam Region": "7202037"},
    "Peru": {"Pacaraos": "1944776"},
    "India": {"Kullu Valley": "9977197"},
    "São Tomé and Príncipe": {"São Tomé Province": "9377730"},
    "Australia": {"Torres Strait Islands": "11677464"},
    "Solomon Islands": {"Reef Islands": "3593007"},
    "Wallis": {"Wallis": "22382439"},
    "Cook Islands": {"Manihiki": "618282942"},
    "Tonga": {"Tongatapu": "3772680"},
    "British Virgin Islands": {"Virgin Islands": "11944638"},
    "Sweden": {"Älvdalen": "935540"},
    "Albania": {"Gjirokastër District": "1253915"}, # may be defunct  
    "South Ossetia": {"South Ossetia": "1152717"},
}


'''Data for replace_region_with_many()'''  
deprecated_regions = {
    "Achterhook": {"Aalten", "Berkelland", "Bronckhorst", "Brummen", "Doesburg", "Doetinchem", "Lochem", "Montferland", "Oost Gelre", "Oude IJsselstreek", "Winterswijk", "Zutphen"},
    "Ennedi Region": {"Ennedi-Est", "Ennedi-Ouest"},
    "North Bengal": {"Rajshahi Division", "Rangpur Division", "Jalpaiguri District", "Maldah District"},
    "Svantei": {"Racha-Lechkhumi and Kvemo Svaneti", "Mestia Municipality"},
    "Darfur": {"Central Darfur", "East Darfur", "North Darfur", "South Darfur", "West Darfur"} 
    #"Silesia": {}
    #"Punjab": {}
}

replacement_region_codes = {
    "Aalten": "416892",
    "Berkelland": "416728",
    "Bronckhorst": "417454",
    "Brummen": "416858",
    "Doesburg": "417595",
    "Doetinchem": "417679",
    "Lochem": "416833",
    "Montferland": "417701",
    "Oost Gelre": "416729",
    "Oude IJsselstreek": "417140",
    "Winterswijk": "416742",
    "Zutphen": "416840",
    "Ennedi-Est": "7016937",
    "Ennedi-Ouest": "2537745",
    "Rajshahi Division": "3859335", 
    "Rangpur Division": "3921211",
    "Jalpaiguri District": "556150",
    "Maldah District": "1791397",
    "Racha-Lechkhumi and Kvemo Svaneti": "1997284",
    "Mestia Municipality": "2016168",
    "Central Darfur": "3774671", 
    "East Darfur": "3774670", 
    "North Darfur": "3774668", 
    "South Darfur": "3774662", 
    "West Darfur": "3774664" # fvr is getting a duplicate of this
}
replacement_region_countries = {
    "Aalten": "Netherlands",
    "Berkelland": "Netherlands",
    "Bronckhorst": "Netherlands",
    "Brummen": "Netherlands",
    "Doesburg": "Netherlands",
    "Doetinchem": "Netherlands",
    "Lochem": "Netherlands",
    "Montferland": "Netherlands",
    "Oost Gelre": "Netherlands",
    "Oude IJsselstreek": "Netherlands",
    "Winterswijk": "Netherlands",
    "Zutphen": "Netherlands",
    "Ennedi-Est": "Chad",
    "Ennedi-Ouest": "Chad",
    "Rajshahi Division": "Bangladesh", 
    "Rangpur Division": "Bangladesh",
    "Jalpaiguri District": "India",
    "Maldah District": "India",
    "Racha-Lechkhumi and Kvemo Svaneti": "Georgia",
    "Mestia Municipality": "Georgia",
    "Central Darfur": "Sudan", 
    "East Darfur": "Sudan", 
    "North Darfur": "Sudan", 
    "South Darfur": "Sudan", 
    "West Darfur": "Sudan"
}

replacement_region_ids = {
    "Aalten": "http://www.wikidata.org/entity/Q275909",
    "Berkelland": "http://www.wikidata.org/entity/Q47104",
    "Bronckhorst": "http://www.wikidata.org/entity/Q747999",
    "Brummen": "http://www.wikidata.org/entity/Q843895",
    "Doesburg": "http://www.wikidata.org/entity/Q165736",
    "Doetinchem": "http://www.wikidata.org/entity/Q145845",
    "Lochem": "http://www.wikidata.org/entity/Q932058",
    "Montferland": "http://www.wikidata.org/entity/Q952963",
    "Oost Gelre": "http://www.wikidata.org/entity/Q1147580",
    "Oude IJsselstreek": "http://www.wikidata.org/entity/Q932031",
    "Winterswijk": "http://www.wikidata.org/entity/Q72974",
    "Zutphen": "http://www.wikidata.org/entity/Q15858232",
    "Ennedi-Est": "http://www.wikidata.org/entity/Q16632169",
    "Ennedi-Ouest": "http://www.wikidata.org/entity/Q16632172",
    "Rajshahi Division": "http://www.wikidata.org/entity/Q379382", 
    "Rangpur Division": "http://www.wikidata.org/entity/Q876023",
    "Jalpaiguri District": "http://www.wikidata.org/entity/Q1351487",
    "Maldah District": "http://www.wikidata.org/entity/Q2049820",
    "Racha-Lechkhumi and Kvemo Svaneti": "http://www.wikidata.org/entity/Q38893",
    "Mestia Municipality": "http://www.wikidata.org/entity/Q2490962",
    "Central Darfur": "http://www.wikidata.org/entity/Q4116493", 
    "East Darfur": "http://www.wikidata.org/entity/Q3545641", 
    "North Darfur": "http://www.wikidata.org/entity/Q688306", 
    "South Darfur": "http://www.wikidata.org/entity/Q838778", 
    "West Darfur": "http://www.wikidata.org/entity/Q846331"
}


'''Data used for util_unique_instanceoflabels()'''
# had chatgpt sort out all tags from the list above, which were ethnicgroups and which were actual region instances in the list + a few added by hand 
non_region_tags = [
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
    "subethnic group",
    "Indo-Aryan peoples",
    "indigenous peoples in Brazil",
    "ethnographic group",
    "itinerant groups of Europe",
    "natural region of France",
    "ethnic minority",
    "uncontacted peoples",
    "ethnic community",
    "ethnolinguistic group",
    "nation",
    "people",
    "population group",
    "tribe",
    "isolated human group",
    "federally recognized Native American tribe in the United States",
    "Native Americans in the United States",
    "First Nation band",
    "nationality",
    "megacity",
    "metropolis",
    "largest city",
    "national capital",
    "city",
    "big city",
    "geographic concept",
    "former capital",
    "city of Indonesia",
    "city or town",
    "border city",
    "town",
    "human settlement",
    "village",
    "salient",
    "principality",
    "borough",
    "capital of regency",
    "historical province of Finland",
    "former province of Italy",
    "former region of Namibia",
    "Former Region of Ghana",
    "town of China",
    "ward of Nigeria",
    "kampung of Papua",
    "okrug",
    "kelurahan",
    "desa",
    "polis",
    "şəhər",  # Azerbaijani for "city"
    "sanjak",
    "tropical forest",
    "mountain system",
    "stratovolcano",
    "lake",
    "field of study",
    "Wikimedia template",
    "WWF ecoregion",
    "plateau",
    "language",
    "swamp",
    "river" # Gjersjøelva obviously know to be the native ground for Dzongkha speakers 
]

'''"Regions" that aren't regions and fell through the filtering for different reasons'''
misfiltered_regions = [
    "Lagunes region",
    "Pribilof Islands",
    "Americas",
    "Kubu people",
    "Kadu people",
    "Kei people",
    "Gouñhyàñ people",
    "Chimbu people",
    "Kurrama people",
    "Kaohsiung County",
    "Autonomous Region in Muslim Mindanao",
    "Barakai",
    "Ingria",
    "Manchuria",
    "Tainan County",
    "Kasai-Oriental",
    "Kasaï",
    "Crimea",
    "Jabodetabek",
    "Azawad",
    "Rupert's Land"
]