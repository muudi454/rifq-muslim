import type { CountrySeed } from '../countryTypes';

/** All 35 sovereign states of the Americas (ISO 3166-1 alpha-2). */
export const AMERICAS: CountrySeed[] = [
  ['AG', 'Antigua and Barbuda', 'أنتيغوا وبربودا', 'America/Antigua', [
    ["Saint John's", 'Saint John', 17.1274, -61.8468],
    ['All Saints', 'Saint Peter', 17.0667, -61.8],
    ['Liberta', 'Saint Paul', 17.0333, -61.7833],
  ]],
  ['AR', 'Argentina', 'الأرجنتين', 'America/Argentina/Buenos_Aires', [
    ['Buenos Aires', 'Buenos Aires', -34.6037, -58.3816],
    ['Córdoba', 'Córdoba', -31.4201, -64.1888],
    ['Rosario', 'Santa Fe', -32.9442, -60.6505],
    ['Mendoza', 'Mendoza', -32.8895, -68.8458],
  ]],
  ['BS', 'Bahamas', 'الباهاما', 'America/Nassau', [
    ['Nassau', 'New Providence', 25.0443, -77.3504],
    ['Freeport', 'Grand Bahama', 26.5333, -78.7],
    ['George Town', 'Exuma', 23.5167, -75.7833],
  ]],
  ['BB', 'Barbados', 'بربادوس', 'America/Barbados', [
    ['Bridgetown', 'Saint Michael', 13.1132, -59.5988],
    ['Speightstown', 'Saint Peter', 13.25, -59.6433],
    ['Oistins', 'Christ Church', 13.0667, -59.5333],
  ]],
  ['BZ', 'Belize', 'بليز', 'America/Belize', [
    ['Belize City', 'Belize', 17.5046, -88.1962],
    ['Belmopan', 'Cayo', 17.251, -88.759],
    ['San Ignacio', 'Cayo', 17.156, -89.0696],
  ]],
  ['BO', 'Bolivia', 'بوليفيا', 'America/La_Paz', [
    ['La Paz', 'La Paz', -16.4897, -68.1193],
    ['Santa Cruz de la Sierra', 'Santa Cruz', -17.7833, -63.1821],
    ['Cochabamba', 'Cochabamba', -17.3895, -66.1568],
  ]],
  ['BR', 'Brazil', 'البرازيل', 'America/Sao_Paulo', [
    ['São Paulo', 'São Paulo', -23.5505, -46.6333],
    ['Rio de Janeiro', 'Rio de Janeiro', -22.9068, -43.1729],
    ['Brasília', 'Federal District', -15.7975, -47.8919],
    ['Manaus', 'Amazonas', -3.119, -60.0217, 'America/Manaus'],
  ]],
  ['CA', 'Canada', 'كندا', 'America/Toronto', [
    ['Toronto', 'Ontario', 43.6532, -79.3832],
    ['Montreal', 'Quebec', 45.5017, -73.5673],
    ['Vancouver', 'British Columbia', 49.2827, -123.1207, 'America/Vancouver'],
    ['Calgary', 'Alberta', 51.0447, -114.0719, 'America/Edmonton'],
  ]],
  ['CL', 'Chile', 'تشيلي', 'America/Santiago', [
    ['Santiago', 'Santiago Metropolitan', -33.4489, -70.6693],
    ['Valparaíso', 'Valparaíso', -33.0472, -71.6127],
    ['Antofagasta', 'Antofagasta', -23.6509, -70.3975],
  ]],
  ['CO', 'Colombia', 'كولومبيا', 'America/Bogota', [
    ['Bogotá', 'Bogotá', 4.711, -74.0721],
    ['Medellín', 'Antioquia', 6.2442, -75.5812],
    ['Cali', 'Valle del Cauca', 3.4516, -76.532],
  ]],
  ['CR', 'Costa Rica', 'كوستاريكا', 'America/Costa_Rica', [
    ['San José', 'San José', 9.9281, -84.0907],
    ['Alajuela', 'Alajuela', 10.0162, -84.214],
    ['Liberia', 'Guanacaste', 10.635, -85.4378],
  ]],
  ['CU', 'Cuba', 'كوبا', 'America/Havana', [
    ['Havana', 'La Habana', 23.1136, -82.3666],
    ['Santiago de Cuba', 'Santiago de Cuba', 20.0247, -75.8219],
    ['Camagüey', 'Camagüey', 21.3808, -77.9169],
  ]],
  ['DM', 'Dominica', 'دومينيكا', 'America/Dominica', [
    ['Roseau', 'Saint George', 15.3092, -61.3794],
    ['Portsmouth', 'Saint John', 15.5833, -61.4667],
    ['Marigot', 'Saint Andrew', 15.5333, -61.3],
  ]],
  ['DO', 'Dominican Republic', 'جمهورية الدومينيكان', 'America/Santo_Domingo', [
    ['Santo Domingo', 'Distrito Nacional', 18.4861, -69.9312],
    ['Santiago de los Caballeros', 'Santiago', 19.4517, -70.697],
    ['Puerto Plata', 'Puerto Plata', 19.7934, -70.6884],
  ]],
  ['EC', 'Ecuador', 'الإكوادور', 'America/Guayaquil', [
    ['Quito', 'Pichincha', -0.1807, -78.4678],
    ['Guayaquil', 'Guayas', -2.1894, -79.8891],
    ['Cuenca', 'Azuay', -2.9001, -79.0059],
  ]],
  ['SV', 'El Salvador', 'السلفادور', 'America/El_Salvador', [
    ['San Salvador', 'San Salvador', 13.6929, -89.2182],
    ['Santa Ana', 'Santa Ana', 13.9942, -89.5597],
    ['San Miguel', 'San Miguel', 13.4833, -88.1833],
  ]],
  ['GD', 'Grenada', 'غرينادا', 'America/Grenada', [
    ["St. George's", 'Saint George', 12.0561, -61.7488],
    ['Gouyave', 'Saint John', 12.1667, -61.7333],
    ['Grenville', 'Saint Andrew', 12.1167, -61.6167],
  ]],
  ['GT', 'Guatemala', 'غواتيمالا', 'America/Guatemala', [
    ['Guatemala City', 'Guatemala', 14.6349, -90.5069],
    ['Quetzaltenango', 'Quetzaltenango', 14.8347, -91.5181],
    ['Antigua Guatemala', 'Sacatepéquez', 14.5586, -90.7295],
  ]],
  ['GY', 'Guyana', 'غيانا', 'America/Guyana', [
    ['Georgetown', 'Demerara-Mahaica', 6.8013, -58.1551],
    ['Linden', 'Upper Demerara-Berbice', 5.9833, -58.3],
    ['New Amsterdam', 'East Berbice-Corentyne', 6.25, -57.5167],
  ]],
  ['HT', 'Haiti', 'هايتي', 'America/Port-au-Prince', [
    ['Port-au-Prince', 'Ouest', 18.5944, -72.3074],
    ['Cap-Haïtien', 'Nord', 19.7578, -72.2044],
    ['Gonaïves', 'Artibonite', 19.45, -72.6833],
  ]],
  ['HN', 'Honduras', 'هندوراس', 'America/Tegucigalpa', [
    ['Tegucigalpa', 'Francisco Morazán', 14.0723, -87.1921],
    ['San Pedro Sula', 'Cortés', 15.5, -88.0333],
    ['La Ceiba', 'Atlántida', 15.7667, -86.7833],
  ]],
  ['JM', 'Jamaica', 'جامايكا', 'America/Jamaica', [
    ['Kingston', 'Saint Andrew', 17.9714, -76.7936],
    ['Montego Bay', 'Saint James', 18.4762, -77.8939],
    ['Spanish Town', 'Saint Catherine', 18.0, -76.95],
  ]],
  ['MX', 'Mexico', 'المكسيك', 'America/Mexico_City', [
    ['Mexico City', 'Mexico City', 19.4326, -99.1332],
    ['Guadalajara', 'Jalisco', 20.6597, -103.3496],
    ['Monterrey', 'Nuevo León', 25.6866, -100.3161],
    ['Cancún', 'Quintana Roo', 21.1619, -86.8515, 'America/Cancun'],
  ]],
  ['NI', 'Nicaragua', 'نيكاراغوا', 'America/Managua', [
    ['Managua', 'Managua', 12.115, -86.2362],
    ['León', 'León', 12.4348, -86.878],
    ['Granada', 'Granada', 11.9299, -85.956],
  ]],
  ['PA', 'Panama', 'بنما', 'America/Panama', [
    ['Panama City', 'Panamá', 8.9824, -79.5199],
    ['Colón', 'Colón', 9.3592, -79.9014],
    ['David', 'Chiriquí', 8.4333, -82.4333],
  ]],
  ['PY', 'Paraguay', 'باراغواي', 'America/Asuncion', [
    ['Asunción', 'Asunción', -25.2637, -57.5759],
    ['Ciudad del Este', 'Alto Paraná', -25.5097, -54.6111],
    ['Encarnación', 'Itapúa', -27.3306, -55.8667],
  ]],
  ['PE', 'Peru', 'بيرو', 'America/Lima', [
    ['Lima', 'Lima', -12.0464, -77.0428],
    ['Arequipa', 'Arequipa', -16.409, -71.5375],
    ['Cusco', 'Cusco', -13.5319, -71.9675],
  ]],
  ['KN', 'Saint Kitts and Nevis', 'سانت كيتس ونيفيس', 'America/St_Kitts', [
    ['Basseterre', 'Saint George Basseterre', 17.3026, -62.7177],
    ['Charlestown', 'Saint Paul Charlestown', 17.1333, -62.6167],
    ['Sandy Point Town', 'Saint Anne Sandy Point', 17.35, -62.8333],
  ]],
  ['LC', 'Saint Lucia', 'سانت لوسيا', 'America/St_Lucia', [
    ['Castries', 'Castries', 14.0101, -60.9875],
    ['Soufrière', 'Soufrière', 13.85, -61.0667],
    ['Vieux Fort', 'Vieux Fort', 13.7167, -60.95],
  ]],
  ['VC', 'Saint Vincent and the Grenadines', 'سانت فينسنت والغرينادين', 'America/St_Vincent', [
    ['Kingstown', 'Saint George', 13.1587, -61.2244],
    ['Georgetown', 'Charlotte', 13.2833, -61.1167],
    ['Barrouallie', 'Saint Patrick', 13.25, -61.2667],
  ]],
  ['SR', 'Suriname', 'سورينام', 'America/Paramaribo', [
    ['Paramaribo', 'Paramaribo', 5.852, -55.2038],
    ['Lelydorp', 'Wanica', 5.7, -55.2333],
    ['Nieuw Nickerie', 'Nickerie', 5.95, -57.0],
  ]],
  ['TT', 'Trinidad and Tobago', 'ترينيداد وتوباغو', 'America/Port_of_Spain', [
    ['Port of Spain', 'Port of Spain', 10.6549, -61.5019],
    ['San Fernando', 'San Fernando', 10.2833, -61.4667],
    ['Scarborough', 'Tobago', 11.1833, -60.7333],
  ]],
  ['US', 'United States', 'الولايات المتحدة', 'America/New_York', [
    ['New York', 'New York', 40.7128, -74.006],
    ['Los Angeles', 'California', 34.0522, -118.2437, 'America/Los_Angeles'],
    ['Chicago', 'Illinois', 41.8781, -87.6298, 'America/Chicago'],
    ['Houston', 'Texas', 29.7604, -95.3698, 'America/Chicago'],
    ['Anchorage', 'Alaska', 61.2181, -149.9003, 'America/Anchorage'],
    ['Honolulu', 'Hawaii', 21.3069, -157.8583, 'Pacific/Honolulu'],
  ]],
  ['UY', 'Uruguay', 'أوروغواي', 'America/Montevideo', [
    ['Montevideo', 'Montevideo', -34.9011, -56.1645],
    ['Salto', 'Salto', -31.3833, -57.9667],
    ['Punta del Este', 'Maldonado', -34.95, -54.9333],
  ]],
  ['VE', 'Venezuela', 'فنزويلا', 'America/Caracas', [
    ['Caracas', 'Distrito Capital', 10.4806, -66.9036],
    ['Maracaibo', 'Zulia', 10.6427, -71.6125],
    ['Valencia', 'Carabobo', 10.162, -68.0077],
  ]],
];
