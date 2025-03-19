# InteractiveLanguageMap2

För att ladda in databasen 
ladda ner och installera: 
Mongodb, mongosh och mongotools
https://www.mongodb.com/try/download/community
https://www.mongodb.com/try/download/shell
https://www.mongodb.com/try/download/database-tools

Sätt bin folder i PATH för mongodb och mongotools
Sätt pathen till MongoShell foldern i PATH
``\yourpath\mongodb\MongoShell`` 

(Testa)
``mongod --version``
``mongosh --version``
``mongorestore --version`` 

Gå in i "databas" branchen och pulla ner den senaste versionen

Starta servern i InteractiveLanguageMap2 foldern i ett separat cmd/terminal fönster med
``cd din/path/till/repot/InteractiveLanguageMap2``
``mongod --port 27017 --dbpath database``


Kör ./setup_db.bat (windows) eller ./setup_db.sh (mac/linux idk om dom fungerar) i terminalen när man är i root mappen 
/interactivelanguagemap2 

Den borde hämta all data och köra ett python script
Om detta visas borde det funkat: 
Languages in the db: 6609
Regions in the db: 2285







