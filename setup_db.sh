#!/bin/sh/bash
echo "Restoring MongoDB Database..."
mongorestore -d InteractiveLanguageMap WikidataQuery/mongo_db_dump/interactiveLanguageMap
echo "MongoDB Database Restored Successfully! Maybe!"
echo Install pymongo
python -m pip install pymongo
python WikidataQuery/db_verification.py