export interface MilitaryAirport {
  icao: string;
  name: string;
  lat: number;
  lng: number;
  country: string;
}

const RAW_MILITARY_AIRPORTS: MilitaryAirport[] = [
  // Indonesia
  { icao: "WIHH", name: "Halim Perdanakusuma AFB (Jakarta)", lat: -6.2667, lng: 106.8833, country: "Indonesia" },
  { icao: "WIII", name: "Soekarno-Hatta International (Tangerang)", lat: -6.1256, lng: 106.6558, country: "Indonesia" },
  { icao: "WICC", name: "Husein Sastranegara AFB (Bandung)", lat: -6.9006, lng: 107.5764, country: "Indonesia" },
  { icao: "WIMB", name: "Soewondo AFB (Medan)", lat: 3.5583, lng: 98.6722, country: "Indonesia" },
  { icao: "WIKN", name: "Sultan Syarif Kasim II AFB (Pekanbaru)", lat: 0.4608, lng: 101.4478, country: "Indonesia" },
  { icao: "WIDN", name: "Raja Haji Fisabilillah AFB (Tanjung Pinang)", lat: 0.9175, lng: 104.5311, country: "Indonesia" },
  { icao: "WIPL", name: "Sultan Mahmud Badaruddin II AFB (Palembang)", lat: -2.8978, lng: 104.7011, country: "Indonesia" },
  { icao: "WIOO", name: "Supadio AFB (Pontianak)", lat: -0.15, lng: 109.4033, country: "Indonesia" },
  { icao: "WAHQ", name: "Adi Soemarmo AFB (Solo)", lat: -7.5158, lng: 110.7569, country: "Indonesia" },
  { icao: "WIAH", name: "Adi Sucipto AFB (Yogyakarta)", lat: -7.7881, lng: 110.4317, country: "Indonesia" },
  { icao: "WAHH", name: "Yogyakarta International (Kulon Progo)", lat: -7.9011, lng: 110.0622, country: "Indonesia" },
  { icao: "WARI", name: "Iswahjudi AFB (Madiun)", lat: -7.615, lng: 111.4344, country: "Indonesia" },
  { icao: "WARR", name: "Juanda AFB (Surabaya)", lat: -7.3794, lng: 112.7869, country: "Indonesia" },
  { icao: "WARS", name: "Abdul Rachman Saleh AFB (Malang)", lat: -7.9267, lng: 112.7139, country: "Indonesia" },
  { icao: "WADD", name: "I Gusti Ngurah Rai (Bali)", lat: -8.7481, lng: 115.1672, country: "Indonesia" },
  { icao: "WAAA", name: "Sultan Hasanuddin AFB (Makassar)", lat: -5.0614, lng: 119.5539, country: "Indonesia" },
  { icao: "WAMM", name: "Sam Ratulangi AFB (Manado)", lat: 1.5492, lng: 124.9264, country: "Indonesia" },
  { icao: "WAPP", name: "Pattimura AFB (Ambon)", lat: -3.7103, lng: 128.0892, country: "Indonesia" },
  { icao: "WAJJ", name: "Sentani AFB (Jayapura)", lat: -2.5761, lng: 140.5161, country: "Indonesia" },
  { icao: "WAKK", name: "Syamsudin Noor AFB (Banjarmasin)", lat: -3.4422, lng: 114.7617, country: "Indonesia" },
  { icao: "WAOO", name: "Sultan Aji Muhammad Sulaiman AFB (Balikpapan)", lat: -1.2683, lng: 116.8911, country: "Indonesia" },
  { icao: "WATT", name: "El Tari AFB (Kupang)", lat: -10.1717, lng: 123.6658, country: "Indonesia" },
  { icao: "WIDD", name: "Hang Nadim (Batam)", lat: 1.1211, lng: 104.1189, country: "Indonesia" },
  { icao: "WIBB", name: "Pekanbaru AFB (Roesmin Nurjadin)", lat: 0.4608, lng: 101.4478, country: "Indonesia" },
  { icao: "WAWW", name: "Sultan Hasanuddin (Makassar)", lat: -5.0614, lng: 119.5539, country: "Indonesia" },
  { icao: "WALL", name: "Lombok International", lat: -8.7583, lng: 116.2764, country: "Indonesia" },

  // USA
  { icao: "KEDW", name: "Edwards AFB", lat: 34.905, lng: -117.883, country: "USA" },
  { icao: "KLSV", name: "Nellis AFB", lat: 36.236, lng: -115.034, country: "USA" },
  { icao: "KOFF", name: "Offutt AFB", lat: 41.119, lng: -95.912, country: "USA" },
  { icao: "KADW", name: "Andrews AFB", lat: 38.811, lng: -76.867, country: "USA" },
  { icao: "KHIK", name: "Hickam AFB", lat: 21.318, lng: -157.922, country: "USA" },
  { icao: "KFFW", name: "Fort Worth NAS", lat: 32.776, lng: -97.441, country: "USA" },
  { icao: "KDOV", name: "Dover AFB", lat: 39.13, lng: -75.466, country: "USA" },
  { icao: "KMCF", name: "MacDill AFB", lat: 27.849, lng: -82.521, country: "USA" },
  { icao: "KDMA", name: "Davis-Monthan AFB", lat: 32.166, lng: -110.883, country: "USA" },
  { icao: "KLRF", name: "Little Rock AFB", lat: 34.917, lng: -92.15, country: "USA" },

  // UK
  { icao: "EGVA", name: "RAF Fairford", lat: 51.682, lng: -1.79, country: "UK" },
  { icao: "EGDL", name: "RAF Lyneham", lat: 51.504, lng: -1.993, country: "UK" },
  { icao: "EGXC", name: "RAF Coningsby", lat: 53.093, lng: -0.165, country: "UK" },
  { icao: "EGXW", name: "RAF Waddington", lat: 53.166, lng: -0.526, country: "UK" },
  { icao: "EGXU", name: "RAF Cottesmore", lat: 52.738, lng: -0.648, country: "UK" },

  // Russia
  { icao: "UUBW", name: "Zhukovsky International", lat: 55.553, lng: 38.15, country: "Russia" },
  { icao: "XLLI", name: "Lipetsk Air Base", lat: 52.64, lng: 39.43, country: "Russia" },
  { icao: "XLLK", name: "Kubinka Air Base", lat: 55.61, lng: 36.65, country: "Russia" },

  // China
  { icao: "ZBBB", name: "Beijing Nanyuan", lat: 39.782, lng: 116.388, country: "China" },

  // Australia
  { icao: "YAMB", name: "RAAF Amberley", lat: -27.64, lng: 152.711, country: "Australia" },
  { icao: "YSRI", name: "RAAF Richmond", lat: -33.6, lng: 150.78, country: "Australia" },
  { icao: "YPED", name: "RAAF Edinburgh", lat: -34.702, lng: 138.621, country: "Australia" },

  // Japan
  { icao: "RJTY", name: "Yokota Air Base", lat: 35.748, lng: 139.348, country: "Japan" },
  { icao: "RJAF", name: "Matsushima Air Base", lat: 38.403, lng: 141.214, country: "Japan" },
  { icao: "RJAK", name: "Kasumigaura Air Base", lat: 36.03, lng: 140.19, country: "Japan" },

  // South Korea
  { icao: "RKSS", name: "Gimpo International (Military)", lat: 37.558, lng: 126.791, country: "South Korea" },
  { icao: "RKSO", name: "Osan Air Base", lat: 37.09, lng: 127.03, country: "South Korea" },
  { icao: "RKJK", name: "Kunsan Air Base", lat: 35.903, lng: 126.615, country: "South Korea" },

  // Singapore
  { icao: "WSAP", name: "Paya Lebar Air Base", lat: 1.36, lng: 103.91, country: "Singapore" },
  { icao: "WSAT", name: "Tengah Air Base", lat: 1.38, lng: 103.71, country: "Singapore" },
  { icao: "WSAG", name: "Sembawang Air Base", lat: 1.42, lng: 103.81, country: "Singapore" },

  // Germany
  { icao: "ETAR", name: "Ramstein Air Base", lat: 49.436, lng: 7.6, country: "Germany" },
  { icao: "ETAD", name: "Spangdahlem Air Base", lat: 49.97, lng: 6.69, country: "Germany" },
  { icao: "ETNN", name: "Norvenich Air Base", lat: 50.83, lng: 6.65, country: "Germany" },

  // France
  { icao: "LFMY", name: "Istres-Le Tubé Air Base", lat: 43.52, lng: 4.92, country: "France" },
  { icao: "LFMO", name: "Orange-Caritat Air Base", lat: 44.14, lng: 4.85, country: "France" },
  { icao: "LFBM", name: "Mont-de-Marsan Air Base", lat: 43.91, lng: -0.5, country: "France" },

  // Middle East
  { icao: "LLOV", name: "Ovda Airbase", lat: 29.94, lng: 34.935, country: "Israel" },
  { icao: "LLHA", name: "Haifa Airbase", lat: 32.81, lng: 35.04, country: "Israel" },
  { icao: "OEDF", name: "King Abdulaziz AB", lat: 26.26, lng: 50.15, country: "Saudi Arabia" },
  { icao: "OERY", name: "Riyadh Air Base", lat: 24.71, lng: 46.72, country: "Saudi Arabia" },
  { icao: "OMAM", name: "Al Dhafra Air Base", lat: 24.24, lng: 54.54, country: "UAE" },
  { icao: "OIIE", name: "Imam Khomeini (Military)", lat: 35.41, lng: 51.15, country: "Iran" },
  { icao: "LTAC", name: "Esenboğa (Military)", lat: 40.12, lng: 32.99, country: "Turkey" },
  { icao: "LTAG", name: "Incirlik Air Base", lat: 37.00, lng: 35.42, country: "Turkey" },

  // South America
  { icao: "SBGL", name: "Galeão AFB", lat: -22.81, lng: -43.25, country: "Brazil" },
  { icao: "SBSP", name: "Congonhas AFB", lat: -23.62, lng: -46.65, country: "Brazil" },
  { icao: "SABE", name: "Aeroparque (Military)", lat: -34.55, lng: -58.41, country: "Argentina" },
  { icao: "SCEL", name: "Arturo Merino Benítez (Military)", lat: -33.39, lng: -70.78, country: "Chile" },
  { icao: "SKBO", name: "El Dorado (Military)", lat: 4.70, lng: -74.14, country: "Colombia" },

  // Africa
  { icao: "HECA", name: "Cairo West Air Base", lat: 30.11, lng: 30.91, country: "Egypt" },
  { icao: "FABL", name: "Bloemspruit Air Force Base", lat: -29.11, lng: 26.30, country: "South Africa" },
  { icao: "FAWK", name: "Waterkloof Air Force Base", lat: -25.83, lng: 28.22, country: "South Africa" },
  { icao: "DNMM", name: "Murtala Muhammed (Military)", lat: 6.57, lng: 3.32, country: "Nigeria" },
  { icao: "HKJK", name: "Jomo Kenyatta (Military)", lat: -1.31, lng: 36.92, country: "Kenya" },

  // More Europe
  { icao: "LIRE", name: "Pratica di Mare Air Base", lat: 41.65, lng: 12.44, country: "Italy" },
  { icao: "LIRP", name: "Pisa Air Base", lat: 43.68, lng: 10.39, country: "Italy" },
  { icao: "LETO", name: "Torrejón Air Base", lat: 40.49, lng: -3.44, country: "Spain" },
  { icao: "LEZG", name: "Zaragoza Air Base", lat: 41.66, lng: -1.04, country: "Spain" },
  { icao: "EPWA", name: "Warsaw Chopin (Military)", lat: 52.16, lng: 20.96, country: "Poland" },
  { icao: "ESOW", name: "Västerås Air Base", lat: 59.58, lng: 16.63, country: "Sweden" },
  { icao: "ENFB", name: "Fornebu (Military)", lat: 59.89, lng: 10.61, country: "Norway" },

  // More Asia
  { icao: "VIDP", name: "Palam Air Force Station", lat: 28.56, lng: 77.10, country: "India" },
  { icao: "VABB", name: "Santaruz Air Force Station", lat: 19.08, lng: 72.86, country: "India" },
  { icao: "OPRN", name: "Nur Khan Airbase", lat: 33.61, lng: 73.09, country: "Pakistan" },
  { icao: "VTBD", name: "Don Mueang (Military)", lat: 13.91, lng: 100.60, country: "Thailand" },
  { icao: "VVTS", name: "Tan Son Nhat (Military)", lat: 10.81, lng: 106.65, country: "Vietnam" },
  { icao: "RPLL", name: "Villamor Air Base", lat: 14.52, lng: 121.02, country: "Philippines" },

  // North America
  { icao: "CYOW", name: "CFB Rockcliffe", lat: 45.46, lng: -75.64, country: "Canada" },
  { icao: "CYTR", name: "CFB Trenton", lat: 44.11, lng: -77.52, country: "Canada" },
  { icao: "MMMX", name: "Santa Lucía Air Force Base", lat: 19.74, lng: -98.99, country: "Mexico" },

  // Major International Hubs (Civilian but often used for military transport)
  { icao: "WSSS", name: "Changi Airport", lat: 1.36, lng: 103.99, country: "Singapore" },
  { icao: "EGLL", name: "London Heathrow", lat: 51.47, lng: -0.45, country: "UK" },
  { icao: "KJFK", name: "New York JFK", lat: 40.64, lng: -73.77, country: "USA" },
  { icao: "RJAA", name: "Tokyo Narita", lat: 35.77, lng: 140.39, country: "Japan" },
  { icao: "VHHH", name: "Hong Kong International", lat: 22.30, lng: 113.91, country: "Hong Kong" },
  { icao: "EDDF", name: "Frankfurt Airport", lat: 50.03, lng: 8.57, country: "Germany" },
  { icao: "LFPG", name: "Paris Charles de Gaulle", lat: 49.00, lng: 2.55, country: "France" },
  { icao: "OMDB", name: "Dubai International", lat: 25.25, lng: 55.36, country: "UAE" },
  { icao: "WMKK", name: "Kuala Lumpur Int'l", lat: 2.74, lng: 101.70, country: "Malaysia" },
  { icao: "VTBS", name: "Suvarnabhumi Airport", lat: 13.69, lng: 100.75, country: "Thailand" },
  { icao: "RKSI", name: "Incheon International", lat: 37.46, lng: 126.44, country: "South Korea" },
  { icao: "ZSPD", name: "Shanghai Pudong", lat: 31.14, lng: 121.80, country: "China" },
  { icao: "UUEE", name: "Sheremetyevo Int'l", lat: 55.97, lng: 37.41, country: "Russia" },
  { icao: "LSZH", name: "Zurich Airport", lat: 47.46, lng: 8.54, country: "Switzerland" },
  { icao: "EHAM", name: "Amsterdam Schiphol", lat: 52.31, lng: 4.76, country: "Netherlands" },
  { icao: "LEMD", name: "Madrid-Barajas", lat: 40.49, lng: -3.56, country: "Spain" },
  { icao: "LIRF", name: "Rome Fiumicino", lat: 41.80, lng: 12.23, country: "Italy" },
  { icao: "FACT", name: "Cape Town Int'l", lat: -33.97, lng: 18.60, country: "South Africa" },
  { icao: "KLAX", name: "Los Angeles Int'l", lat: 33.94, lng: -118.40, country: "USA" },
  { icao: "KSFO", name: "San Francisco Int'l", lat: 37.62, lng: -122.37, country: "USA" },
  { icao: "KORD", name: "Chicago O'Hare", lat: 41.97, lng: -87.90, country: "USA" },
  { icao: "KATL", name: "Atlanta Hartsfield-Jackson", lat: 33.64, lng: -84.42, country: "USA" },
  { icao: "YMML", name: "Melbourne Airport", lat: -37.67, lng: 144.84, country: "Australia" },
  { icao: "YSSY", name: "Sydney Kingsford Smith", lat: -33.94, lng: 151.17, country: "Australia" },
  { icao: "NZAA", name: "Auckland Airport", lat: -37.00, lng: 174.79, country: "New Zealand" },
  { icao: "SAEZ", name: "Ezeiza Int'l", lat: -34.82, lng: -58.53, country: "Argentina" },
  { icao: "MPTO", name: "Tocumen Int'l", lat: 9.07, lng: -79.38, country: "Panama" },
  { icao: "TJSJ", name: "Luis Muñoz Marín Int'l", lat: 18.43, lng: -66.00, country: "Puerto Rico" },

  // Strategic Military Bases & More Global Locations
  { icao: "PGUA", name: "Andersen AFB", lat: 13.58, lng: 144.92, country: "Guam" },
  { icao: "FJDG", name: "Diego Garcia NSF", lat: -7.31, lng: 72.41, country: "British Indian Ocean Territory" },
  { icao: "BGTL", name: "Thule Air Base", lat: 76.53, lng: -68.70, country: "Greenland" },
  { icao: "RODN", name: "Kadena Air Base", lat: 26.35, lng: 127.76, country: "Japan" },
  { icao: "RJSM", name: "Misawa Air Base", lat: 40.70, lng: 141.36, country: "Japan" },
  { icao: "LIPA", name: "Aviano Air Base", lat: 46.03, lng: 12.59, country: "Italy" },
  { icao: "EGUL", name: "RAF Lakenheath", lat: 52.40, lng: 0.55, country: "UK" },
  { icao: "EGUN", name: "RAF Mildenhall", lat: 52.36, lng: 0.48, country: "UK" },
  { icao: "OBBI", name: "Bahrain International (Military)", lat: 26.27, lng: 50.63, country: "Bahrain" },
  { icao: "OTBH", name: "Al Udeid Air Base", lat: 25.11, lng: 51.31, country: "Qatar" },
  { icao: "HDAM", name: "Camp Lemonnier", lat: 11.54, lng: 43.15, country: "Djibouti" },
  { icao: "OAKB", name: "Kabul International (Military)", lat: 34.56, lng: 69.21, country: "Afghanistan" },
  { icao: "OAIX", name: "Bagram Airfield", lat: 34.94, lng: 69.26, country: "Afghanistan" },
  { icao: "ORBI", name: "Baghdad International (Military)", lat: 33.26, lng: 44.23, country: "Iraq" },
  { icao: "HESH", name: "Sharm El Sheikh (Military)", lat: 27.97, lng: 34.39, country: "Egypt" },
  { icao: "GMMN", name: "Casablanca Mohammed V (Military)", lat: 33.36, lng: -7.58, country: "Morocco" },
  { icao: "DAAG", name: "Algiers Houari Boumediene (Military)", lat: 36.69, lng: 3.21, country: "Algeria" },
  { icao: "DTTA", name: "Tunis-Carthage (Military)", lat: 36.85, lng: 10.22, country: "Tunisia" },
  { icao: "LOWW", name: "Vienna International (Military)", lat: 48.11, lng: 16.56, country: "Austria" },
  { icao: "EBBR", name: "Brussels Airport (Military)", lat: 50.90, lng: 4.48, country: "Belgium" },
  { icao: "EKCH", name: "Copenhagen Airport (Military)", lat: 55.61, lng: 12.65, country: "Denmark" },
  { icao: "EFHK", name: "Helsinki-Vantaa (Military)", lat: 60.31, lng: 24.96, country: "Finland" },
  { icao: "ESSA", name: "Stockholm Arlanda (Military)", lat: 59.65, lng: 17.91, country: "Sweden" },
  { icao: "ENGM", name: "Oslo Gardermoen (Military)", lat: 60.19, lng: 11.10, country: "Norway" },
  { icao: "BIRK", name: "Reykjavik Airport (Military)", lat: 64.12, lng: -21.94, country: "Iceland" },
  { icao: "LPPT", name: "Lisbon Airport (Military)", lat: 38.77, lng: -9.13, country: "Portugal" },
  { icao: "LGAV", name: "Athens Eleftherios Venizelos (Military)", lat: 37.93, lng: 23.94, country: "Greece" },
  { icao: "LTAF", name: "Adana Şakirpaşa (Military)", lat: 36.98, lng: 35.28, country: "Turkey" },
  { icao: "VGTJ", name: "Kurmitola Air Force Base", lat: 23.84, lng: 90.39, country: "Bangladesh" },
  { icao: "VCBI", name: "Bandaranaike (Military)", lat: 7.18, lng: 79.88, country: "Sri Lanka" },
  { icao: "VNKT", name: "Tribhuvan (Military)", lat: 27.69, lng: 85.35, country: "Nepal" },
  { icao: "ZBAA", name: "Beijing Capital (Military)", lat: 40.07, lng: 116.58, country: "China" },
  { icao: "ZGGG", name: "Guangzhou Baiyun (Military)", lat: 23.39, lng: 113.29, country: "China" },
  { icao: "VMMC", name: "Macau International (Military)", lat: 22.14, lng: 113.59, country: "Macau" },
  { icao: "RCKH", name: "Kaohsiung International (Military)", lat: 22.57, lng: 120.35, country: "Taiwan" },
  { icao: "RCTP", name: "Taiwan Taoyuan (Military)", lat: 25.07, lng: 121.23, country: "Taiwan" },
  { icao: "PHNL", name: "Daniel K. Inouye Int'l (Hickam)", lat: 21.31, lng: -157.92, country: "USA (Hawaii)" },
  { icao: "PANC", name: "Ted Stevens Anchorage (Military)", lat: 61.17, lng: -149.99, country: "USA (Alaska)" },
  { icao: "PAEI", name: "Eielson AFB", lat: 64.66, lng: -147.10, country: "USA (Alaska)" },
  { icao: "TAPA", name: "V.C. Bird International (Military)", lat: 17.13, lng: -61.79, country: "Antigua and Barbuda" },
  { icao: "MKJP", name: "Norman Manley (Military)", lat: 17.93, lng: -76.78, country: "Jamaica" },
  { icao: "TXKF", name: "L.F. Wade International (Military)", lat: 32.36, lng: -64.67, country: "Bermuda" },
  { icao: "LPLA", name: "Lajes Field", lat: 38.76, lng: -27.09, country: "Portugal (Azores)" },
  { icao: "GCLP", name: "Gran Canaria (Military)", lat: 27.93, lng: -15.38, country: "Spain (Canary Islands)" },
  { icao: "SBBR", name: "Brasília AFB", lat: -15.86, lng: -47.91, country: "Brazil" },
  { icao: "SUMU", name: "Carrasco (Military)", lat: -34.83, lng: -56.03, country: "Uruguay" },
  { icao: "SGAS", name: "Silvio Pettirossi (Military)", lat: -25.23, lng: -57.51, country: "Paraguay" },
  { icao: "SLCB", name: "Jorge Wilstermann (Military)", lat: -17.42, lng: -66.17, country: "Bolivia" },
  { icao: "SPJC", name: "Jorge Chávez (Military)", lat: -12.02, lng: -77.11, country: "Peru" },
  { icao: "SEQU", name: "Mariscal Sucre (Military)", lat: -0.12, lng: -78.35, country: "Ecuador" },
  { icao: "SVMI", name: "Simón Bolívar (Military)", lat: 10.60, lng: -66.99, country: "Venezuela" },

  // Japan & Korea (Expanded)
  { icao: "RJFF", name: "Fukuoka Airport", lat: 33.58, lng: 130.45, country: "Japan" },
  { icao: "RKPC", name: "Jeju International", lat: 33.51, lng: 126.49, country: "South Korea" },
  { icao: "RJBB", name: "Kansai International", lat: 34.43, lng: 135.23, country: "Japan" },
  { icao: "RJGG", name: "Chubu Centrair", lat: 34.86, lng: 136.81, country: "Japan" },
  { icao: "RJCC", name: "New Chitose", lat: 42.77, lng: 141.69, country: "Japan" },
  { icao: "RJOO", name: "Osaka Itami", lat: 34.78, lng: 135.44, country: "Japan" },
  { icao: "RKPK", name: "Gimhae International", lat: 35.18, lng: 128.94, country: "South Korea" },
  { icao: "RKTN", name: "Daegu Air Base", lat: 35.89, lng: 128.66, country: "South Korea" },
  { icao: "RKNY", name: "Yangyang International", lat: 38.06, lng: 128.67, country: "South Korea" },
  { icao: "RKTH", name: "Pohang Airport", lat: 35.99, lng: 129.42, country: "South Korea" },
  { icao: "RKNW", name: "Wonju Airport", lat: 37.44, lng: 127.96, country: "South Korea" },

  // Japan (Regional)
  { icao: "RJSN", name: "Niigata Airport", lat: 37.96, lng: 139.11, country: "Japan" },
  { icao: "RJNK", name: "Komatsu Airport", lat: 36.40, lng: 136.41, country: "Japan" },
  { icao: "RJNT", name: "Toyama Airport", lat: 36.65, lng: 137.19, country: "Japan" },
  { icao: "RJCW", name: "Wakkanai Airport", lat: 45.40, lng: 141.80, country: "Japan" },
  { icao: "RJOT", name: "Takamatsu Airport", lat: 34.21, lng: 134.02, country: "Japan" },

  // Indonesia (Regional/Small)
  { icao: "WICA", name: "Sultan Thaha (Jambi)", lat: -1.64, lng: 103.64, country: "Indonesia" },
  { icao: "WIKK", name: "Depati Amir (Pangkal Pinang)", lat: -2.16, lng: 106.14, country: "Indonesia" },
  { icao: "WIIH", name: "Halim Perdanakusuma", lat: -6.27, lng: 106.89, country: "Indonesia" },
  { icao: "WIKL", name: "Fatmawati Soekarno", lat: -3.86, lng: 102.34, country: "Indonesia" },
  { icao: "WIPP", name: "Sultan Mahmud Badaruddin II", lat: -2.90, lng: 104.70, country: "Indonesia" },
  { icao: "WIPT", name: "Radin Inten II", lat: -5.24, lng: 105.18, country: "Indonesia" },
  { icao: "WAHS", name: "Achmad Yani", lat: -6.97, lng: 110.38, country: "Indonesia" },

  // Indonesia (Expanded - Major & Regional)
  { icao: "WILL", name: "Lombok International", lat: -8.76, lng: 116.27, country: "Indonesia" },
  { icao: "WAKC", name: "Syamsudin Noor (Banjarmasin)", lat: -3.44, lng: 114.76, country: "Indonesia" },
  { icao: "WAMG", name: "Zainuddin Abdul Madjid", lat: -8.76, lng: 116.27, country: "Indonesia" },
  { icao: "WABP", name: "Frans Kaisiepo (Biak)", lat: -1.19, lng: 136.11, country: "Indonesia" },
  { icao: "WASN", name: "Sentani (Jayapura)", lat: -2.57, lng: 140.51, country: "Indonesia" },

  // Southeast Asia (Expanded)
  { icao: "VTCC", name: "Chiang Mai Int'l", lat: 18.77, lng: 98.96, country: "Thailand" },
  { icao: "VTSP", name: "Phuket International", lat: 8.11, lng: 98.31, country: "Thailand" },
  { icao: "WMKP", name: "Penang International", lat: 5.30, lng: 100.27, country: "Malaysia" },
  { icao: "WBKK", name: "Kota Kinabalu Int'l", lat: 5.94, lng: 116.05, country: "Malaysia" },
  { icao: "WBGG", name: "Kuching International", lat: 1.48, lng: 110.34, country: "Malaysia" },
  { icao: "VVNB", name: "Noi Bai (Hanoi)", lat: 21.22, lng: 105.81, country: "Vietnam" },
  { icao: "VVDN", name: "Da Nang International", lat: 16.04, lng: 108.20, country: "Vietnam" },
  { icao: "RPMD", name: "Davao International", lat: 7.12, lng: 125.64, country: "Philippines" },
  { icao: "RPVM", name: "Mactan-Cebu Int'l", lat: 10.31, lng: 123.98, country: "Philippines" },

  // Australia & New Zealand (Expanded)
  { icao: "YBBN", name: "Brisbane Airport", lat: -27.38, lng: 153.12, country: "Australia" },
  { icao: "YPPH", name: "Perth Airport", lat: -31.94, lng: 115.97, country: "Australia" },
  { icao: "YPAD", name: "Adelaide Airport", lat: -34.95, lng: 138.53, country: "Australia" },
  { icao: "YMHB", name: "Hobart International", lat: -42.84, lng: 147.51, country: "Australia" },
  { icao: "NZCH", name: "Christchurch Int'l", lat: -43.49, lng: 172.53, country: "New Zealand" },
  { icao: "NZWN", name: "Wellington Int'l", lat: -41.33, lng: 174.81, country: "New Zealand" },

  // USA & Canada (Expanded)
  { icao: "KSEA", name: "Seattle-Tacoma Int'l", lat: 47.45, lng: -122.31, country: "USA" },
  { icao: "KDEN", name: "Denver International", lat: 39.86, lng: -104.67, country: "USA" },
  { icao: "KDFW", name: "Dallas/Fort Worth", lat: 32.90, lng: -97.04, country: "USA" },
  { icao: "KMIA", name: "Miami International", lat: 25.79, lng: -80.29, country: "USA" },
  { icao: "KBOS", name: "Boston Logan", lat: 42.36, lng: -71.01, country: "USA" },
  { icao: "KIAD", name: "Washington Dulles", lat: 38.95, lng: -77.46, country: "USA" },
  { icao: "CYVR", name: "Vancouver International", lat: 49.19, lng: -123.18, country: "Canada" },
  { icao: "CYYZ", name: "Toronto Pearson", lat: 43.68, lng: -79.63, country: "Canada" },
  { icao: "CYUL", name: "Montreal-Trudeau", lat: 45.47, lng: -73.74, country: "Canada" },

  // Europe (Expanded)
  { icao: "EGKK", name: "London Gatwick", lat: 51.15, lng: -0.19, country: "UK" },
  { icao: "EGSS", name: "London Stansted", lat: 51.89, lng: 0.23, country: "UK" },
  { icao: "LFML", name: "Marseille Provence", lat: 43.44, lng: 5.21, country: "France" },
  { icao: "LFMN", name: "Nice Côte d'Azur", lat: 43.66, lng: 7.21, country: "France" },
  { icao: "EDDM", name: "Munich Airport", lat: 48.35, lng: 11.79, country: "Germany" },
  { icao: "EDDS", name: "Stuttgart Airport", lat: 48.69, lng: 9.22, country: "Germany" },
  { icao: "LEBL", name: "Barcelona-El Prat", lat: 41.30, lng: 2.08, country: "Spain" },
  { icao: "LPPR", name: "Porto Airport", lat: 41.25, lng: -8.68, country: "Portugal" },
  { icao: "LIMC", name: "Milan Malpensa", lat: 45.63, lng: 8.73, country: "Italy" },
  { icao: "LIME", name: "Milan Bergamo", lat: 45.67, lng: 9.70, country: "Italy" },
  { icao: "LOWS", name: "Salzburg Airport", lat: 47.79, lng: 13.00, country: "Austria" },
  { icao: "LSGG", name: "Geneva Airport", lat: 46.24, lng: 6.11, country: "Switzerland" },

  // Central Asia & Eastern Europe
  { icao: "UAAA", name: "Almaty International (Military)", lat: 43.35, lng: 77.04, country: "Kazakhstan" },
  { icao: "UACC", name: "Astana International (Military)", lat: 51.02, lng: 71.46, country: "Kazakhstan" },
  { icao: "UTTT", name: "Tashkent International (Military)", lat: 41.25, lng: 69.28, country: "Uzbekistan" },
  { icao: "UAFM", name: "Manas International (Military)", lat: 43.06, lng: 74.47, country: "Kyrgyzstan" },
  { icao: "UTDL", name: "Dushanbe International (Military)", lat: 38.54, lng: 68.82, country: "Tajikistan" },
  { icao: "UKBB", name: "Boryspil International (Military)", lat: 50.34, lng: 30.89, country: "Ukraine" },
  { icao: "UMMS", name: "Minsk National (Military)", lat: 53.88, lng: 28.03, country: "Belarus" },
  { icao: "LBSF", name: "Sofia Airport (Military)", lat: 42.69, lng: 23.41, country: "Bulgaria" },
  { icao: "LROP", name: "Bucharest Henri Coandă (Military)", lat: 44.57, lng: 26.08, country: "Romania" },
  { icao: "LHBP", name: "Budapest Ferenc Liszt (Military)", lat: 47.43, lng: 19.26, country: "Hungary" },
  { icao: "LKPR", name: "Prague Václav Havel (Military)", lat: 50.10, lng: 14.26, country: "Czech Republic" },
  { icao: "LZIB", name: "Bratislava Airport (Military)", lat: 48.17, lng: 17.21, country: "Slovakia" },

  // More Africa
  { icao: "DGAA", name: "Kotoka International (Military)", lat: 5.60, lng: -0.16, country: "Ghana" },
  { icao: "DNAA", name: "Nnamdi Azikiwe (Military)", lat: 9.00, lng: 7.26, country: "Nigeria" },
  { icao: "GOBD", name: "Blaise Diagne (Military)", lat: 14.67, lng: -17.07, country: "Senegal" },
  { icao: "GVAC", name: "Amílcar Cabral (Military)", lat: 16.74, lng: -22.94, country: "Cape Verde" },
  { icao: "DIAP", name: "Félix-Houphouët-Boigny (Military)", lat: 5.26, lng: -3.92, country: "Ivory Coast" },
  { icao: "FTTJ", name: "N'Djamena (Military)", lat: 12.13, lng: 15.03, country: "Chad" },
  { icao: "HSSS", name: "Khartoum International (Military)", lat: 15.58, lng: 32.55, country: "Sudan" },
  { icao: "HAAB", name: "Addis Ababa Bole (Military)", lat: 8.97, lng: 38.79, country: "Ethiopia" },
  { icao: "FMMI", name: "Ivato International (Military)", lat: -18.79, lng: 47.47, country: "Madagascar" },
  { icao: "FQMA", name: "Maputo International (Military)", lat: -25.92, lng: 32.57, country: "Mozambique" },
  { icao: "FLHN", name: "Kenneth Kaunda (Military)", lat: -15.33, lng: 28.45, country: "Zambia" },
  { icao: "FVHA", name: "Robert Gabriel Mugabe (Military)", lat: -17.93, lng: 31.09, country: "Zimbabwe" },

  // More Oceania
  { icao: "NWWW", name: "La Tontouta (Military)", lat: -22.01, lng: 166.21, country: "New Caledonia" },
  { icao: "NFFN", name: "Nadi International (Military)", lat: -17.75, lng: 177.44, country: "Fiji" },
  { icao: "AYPY", name: "Jacksons International (Military)", lat: -9.44, lng: 147.22, country: "Papua New Guinea" },
  { icao: "ANYN", name: "Honiara International (Military)", lat: -9.42, lng: 160.05, country: "Solomon Islands" },
  { icao: "NSTU", name: "Pago Pago (Military)", lat: -14.33, lng: -170.71, country: "American Samoa" },
  { icao: "PLCH", name: "Cassidy International (Military)", lat: 1.98, lng: -157.34, country: "Kiribati" },
];

export const MILITARY_AIRPORTS: MilitaryAirport[] = Array.from(
  new Map(RAW_MILITARY_AIRPORTS.map(ap => [ap.icao, ap])).values()
);

