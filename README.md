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

Starta servern i InteractiveLanguageMap2 foldern i ett separat cmd/terminal fönster med
``cd din/path/till/repot/InteractiveLanguageMap2``
``mongod --port 27017 --dbpath database``


Kör ./setup_db.bat (windows) eller ./setup_db.sh (mac/linux idk om dom fungerar) i terminalen när man är i root mappen 
/interactivelanguagemap2 

Den borde hämta all data och köra ett python script
Om detta visas borde det funkat: 
Languages in the db: 6609
Regions in the db: 2285

An interactive map application for exploring languages around the world.

## Table of Contents
1. [About the Project](#about-the-project)
2. [Features](#features)
3. [Getting Started](#getting-started)
4. [Usage](#usage)
5. [Deployment](#deployment)
6. [Contributing](#contributing)
7. [License](#license)

---

## About the Project
InteractiveLanguageMap2 is a web application that allows users to explore languages on a world map. It uses **React**, **MapLibre GL**, and **GeoJSON** for rendering and interacting with map data.

---

## Features
- Interactive world map with zoom and pan functionality.
- Upload and display KML files.
- Dynamic language selection with buttons.
- Lightweight and fast with **MapLibre GL**.

---

## Getting Started

### Prerequisites
Make sure you have the following installed:
- [Node.js](https://nodejs.org/) (LTS version recommended)
- [npm](https://www.npmjs.com/) (comes with Node.js)

### Installation
1. Clone the repository:
   ```sh
   git clone https://github.com/hannamagn/InteractiveLanguageMap2.git

2. download node.js

3. Navigate to the frontend directory:
    ```sh
    cd frontend

4.  npm installs:

    ```sh
    npm install @mui/material @emotion/react @emotion/styled
    npm install maplibre-gl maplibre-gl-vector-text-protocol
    npm install
    npm install React, Vite

5. run in dev: 
    ```sh
    npm run dev
 