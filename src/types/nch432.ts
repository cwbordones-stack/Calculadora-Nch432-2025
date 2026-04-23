// Tipos para la calculadora NCh432:2025

export type ZonaViento = 'I-A' | 'I-B' | 'II-A' | 'II-B' | 'III-A' | 'III-B' | 'IV-A' | 'IV-B' | 'V' | 'VI' | 'NC1' | 'NC2' | 'NC3';

export type CategoriaOcupacion = 'I' | 'II' | 'III' | 'IV';

export type Exposicion = 'B' | 'C' | 'D';

export type TipoEdificio = 'cerrado' | 'parcialmente_cerrado' | 'parcialmente_abierto' | 'abierto';

export type TipoEstructuraSPRFV = 'rigido' | 'flexible';

export type TipoTecho = 'dos_aguas' | 'pendiente_unica' | 'plano';

export interface ZonaVientoData {
  zona: ZonaViento;
  nombre: string;
  latitud: string;
  altitud: string;
  V: number; // m/s
  p0: number; // N/m²
}

export interface ResultadoCalculo {
  // Parámetros básicos
  V: number;
  I: number;
  Kd: number;
  Kzt: number;
  Ke: number;
  
  // Presiones de velocidad
  qz: number; // N/m²
  qh: number; // N/m²
  qi: number; // N/m²
  
  // Factores de ráfaga
  G: number;
  
  // Presión interna
  GCpi_pos: number;
  GCpi_neg: number;
  
  // Presiones de diseño SPRFV (N/m²)
  presiones: {
    barlovento: number;
    sotavento: number;
    laterales: number;
    techoBarlovento: number;
    techoSotavento: number;
    techoCentro: number;
  };
  
  // Presiones de diseño C&R (N/m²)
  presionesCR: {
    muros: number;
    techoBorde: number;
    techoInterior: number;
    esquinas: number;
  };
  
  // Fuerzas
  fuerzaTotal: number; // N
  fuerzaPorMetro: number; // N/m
  
  // Valores intermedios
  Kz_pared: number;
  Kz_techo: number;
  Ri: number;
}

export interface ParametrosCalculo {
  zona: ZonaViento;
  categoria: CategoriaOcupacion;
  exposicion: Exposicion;
  tipoEdificio: TipoEdificio;
  tipoEstructura: TipoEstructuraSPRFV;
  tipoTecho: TipoTecho;
  
  // Dimensiones
  alturaMediaTecho: number; // h, m
  alturaAlero: number; // he, m
  longitud: number; // L (dirección viento), m
  ancho: number; // B (normal a viento), m
  pendienteTecho: number; // θ, grados
  
  // Topografía
  tieneEfectoTopografico: boolean;
  tipoTopografia: 'cima2d' | 'colina3d' | 'escarpamiento';
  H: number; // altura colina, m
  Lh: number; // distancia, m
  x: number; // distancia desde cresta, m
  z_terreno: number; // altura edificio sobre terreno local, m
  
  // Elevación
  elevacionSobreNivelMar: number; // ze, m
  
  // Aberturas (para clasificación)
  areaAberturas: number; // Ao, m²
  areaMuro: number; // Ag, m²
  areaAberturasResto: number; // Aoi, m²
  areaResto: number; // Agi, m²
  
  // Volumen interno
  volumenInterno: number; // Vi, m³
  
  // Componentes y revestimiento
  areaEfectiva: number; // A, m²
}
