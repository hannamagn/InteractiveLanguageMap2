import pymongo

myclient = pymongo.MongoClient("mongodb://localhost:27017/")
mydb = myclient["InteractiveLanguageMap"]

LanguageMetaData_col = mydb["LanguageMetaData"]
Regions_col = mydb["Regions"]

print(f"Languages in the db: {LanguageMetaData_col.count_documents({})}")
print(f"Regions in the db: {Regions_col.count_documents({})}")