// Tipos para la calculadora NCh432:2025

export type ZonaViento = 'I-A' | 'I-B' | 'II-A' | 'II-B' | 'III-A' | 'III-B' | 'IV-A' | 'IV-B' | 'V' | 'VI' | 'NC1' | 'NC2' | 'NC3';

export type CategoriaOcupacion = 'I' | 'II' | 'III' | 'IV';

export type Exposicion = 'B' | 'C' | 'D';

export type TipoEdificio = 'cerrado' | 'parcialmente_cerrado' | 'parcialmente_abierto' | 'abierto';

export type TipoEstructuraSPRFV = 'rigido' | 'flexible';

export type TipoTecho = 'dos_aguas' | 'pendiente_unica' | 'plano';

/** Convención de ejes del usuario */
export type ConvencionEjes = 'x_cara_corta' | 'x_cara_larga';

export interface ZonaVientoData {
  zona: ZonaViento;
  nombre: string;
  latitud: string;
  altitud: string;
  V: number; // m/s
  p0: number; // N/m²
}

// ============ Cp e interfaces de dirección ============

/** Cp de muros para una dirección de viento */
export interface CpMuros {
  barlovento: number;   // siempre 0.8, usa qz
  sotavento: number;    // depende de L/B, usa qh
  laterales: number;    // siempre -0.7, usa qh
}

/** Cp de techo plano (θ < 10°) — 4 zonas NCh432 Figura 4 */
export interface CpTechoPlano {
  zona1: number; // 0 a h/2
  zona2: number; // h/2 a h
  zona3: number; // h a 2h
  zona4: number; // > 2h
}

/** Cp de techo con pendiente (θ ≥ 10°) */
export interface CpTechoPendiente {
  barloventoSuccion: number;
  barloventoPresion: number;
  sotavento: number;
}

/** Resultado de Cp para una dirección de viento */
export interface CpDireccion {
  muros: CpMuros;
  techoPlano: CpTechoPlano | null;        // si θ < 10°
  techoPendiente: CpTechoPendiente | null; // si θ ≥ 10°
  ratioLB: number;  // L/B usado para esta dirección
  ratioHL: number;  // h/L usado para esta dirección
}

/** Presiones netas por superficie para UN caso de viento (kgf/m² con signo) */
export interface PresionesNetas {
  muroBarlovento: number;
  muroSotavento: number;
  murosLaterales: number;
  techoZona1: number;
  techoZona2: number;
  techoZona3: number;
  techoZona4: number;
}

/** Áreas tributarias por superficie (m²) */
export interface AreasTributarias {
  muroBarloSota: number;
  murosLaterales: number;
  techoZona1: number;
  techoZona2: number;
  techoZona3: number;
  techoZona4: number;
}

/** Fuerzas resultantes para UN caso de viento (kgf) */
export interface FuerzasResultantes {
  horizontal: number;       // resultante en dirección del viento
  vertical: number;         // resultante en eje Z (uplift)
  detalleHorizontal: {
    barlovento: number;
    sotavento: number;
  };
  detalleVertical: {
    zona1: number;
    zona2: number;
    zona3: number;
    zona4: number;
  };
  lateralTotal: number;     // fuerza lateral (ambas caras)
}

/** Un caso de viento completo */
export interface CasoViento {
  nombre: string;            // "Wx+", "Wx-", "Wy+", "Wy-"
  descripcion: string;       // descripción legible
  direccionViento: 'cara_corta' | 'cara_larga';
  signoGCpi: 'positivo' | 'negativo';
  GCpi: number;              // valor usado (+0.18 o -0.18)
  presiones: PresionesNetas;
  areas: AreasTributarias;
  fuerzas: FuerzasResultantes;
}

// ============ Resultado principal ============

export interface ResultadoCalculo {
  // Parámetros básicos
  V: number;
  I: number;
  Kd: number;
  Kzt: number;
  Ke: number;
  
  // Presiones de velocidad (N/m²)
  qz: number;
  qh: number;
  qi: number;
  
  // Factores de ráfaga
  G: number;
  
  // Presión interna
  GCpi_pos: number;
  GCpi_neg: number;
  
  // Presiones de diseño SPRFV (N/m²) — legacy, para compatibilidad
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
  
  // Fuerzas legacy
  fuerzaTotal: number;
  fuerzaPorMetro: number;
  
  // Valores intermedios
  Kz_pared: number;
  Kz_techo: number;
  Ri: number;

  // ============ NUEVOS CAMPOS V2 ============
  convencion: ConvencionEjes;
  cpCaraCorta: CpDireccion;
  cpCaraLarga: CpDireccion;
  casos: {
    Wx_pos: CasoViento;
    Wx_neg: CasoViento;
    Wy_pos: CasoViento;
    Wy_neg: CasoViento;
  };
}

export interface ParametrosCalculo {
  zona: ZonaViento;
  categoria: CategoriaOcupacion;
  exposicion: Exposicion;
  tipoEdificio: TipoEdificio;
  tipoEstructura: TipoEstructuraSPRFV;
  tipoTecho: TipoTecho;
  
  // Dimensiones
  alturaMediaTecho: number; // h, m (calculado automáticamente)
  alturaAlero: number; // he, m
  alturaCumbrera: number; // hc, m
  longitud: number; // L (paralelo a cumbrera), m
  ancho: number; // B (perpendicular a cumbrera), m
  pendienteTecho: number; // θ, grados (calculado automáticamente)
  
  // Topografía
  tieneEfectoTopografico: boolean;
  tipoTopografia: 'cima2d' | 'colina3d' | 'escarpamiento';
  H: number;
  Lh: number;
  x: number;
  z_terreno: number;
  
  // Elevación
  elevacionSobreNivelMar: number;
  
  // Aberturas (para clasificación)
  areaAberturas: number;
  areaMuro: number;
  areaAberturasResto: number;
  areaResto: number;
  
  // Volumen interno
  volumenInterno: number;
  
  // Componentes y revestimiento
  areaEfectiva: number;

  // Convención de ejes
  convencionEjes: ConvencionEjes;
}
