// Constantes y funciones de cálculo NCh432:2025

import type {
  ZonaViento,
  CategoriaOcupacion,
  Exposicion,
  TipoEdificio,
  TipoEstructuraSPRFV,
  ParametrosCalculo,
  ResultadoCalculo,
  CpDireccion,
  CpTechoPlano,
  CpTechoPendiente,
  CpMuros,
  PresionesNetas,
  AreasTributarias,
  FuerzasResultantes,
  CasoViento,
  ConvencionEjes,
} from '@/types/nch432';

// ============ DATOS DE ZONAS DE VIENTO ============
export const ZONAS_VIENTO: Record<ZonaViento, { nombre: string; V: number; p0: number }> = {
  'I-A': { nombre: 'Zona Norte (hasta Copiapó), altitud < 2000 m', V: 27, p0: 447 },
  'I-B': { nombre: 'Zona Norte (hasta Copiapó), altitud ≥ 2000 m', V: 30, p0: 552 },
  'II-A': { nombre: 'Zona Centro, altitud < 1500 m', V: 27, p0: 447 },
  'II-B': { nombre: 'Zona Centro, altitud ≥ 1500 m', V: 35, p0: 751 },
  'III-A': { nombre: 'Zona Sur, altitud < 1000 m', V: 34, p0: 709 },
  'III-B': { nombre: 'Zona Sur, altitud ≥ 1000 m', V: 35, p0: 751 },
  'IV-A': { nombre: 'Zona Sur hasta Chiloé, altitud < 600 m', V: 37, p0: 839 },
  'IV-B': { nombre: 'Zona Sur hasta Chiloé, altitud ≥ 600 m', V: 40, p0: 981 },
  'V': { nombre: 'Zona Austral (41°28\'S - 50°S)', V: 40, p0: 981 },
  'VI': { nombre: 'Zona Austral Extrema (50°S - 56°32\'S)', V: 44, p0: 1187 },
  'NC1': { nombre: 'Isla de Pascua', V: 32, p0: 628 },
  'NC2': { nombre: 'Juan Fernández', V: 50, p0: 1533 },
  'NC3': { nombre: 'Antártica Chilena', V: 60, p0: 2207 },
};

// ============ FACTORES DE IMPORTANCIA ============
export const FACTOR_IMPORTANCIA: Record<CategoriaOcupacion, { I: number; periodoRetorno: number }> = {
  'I': { I: 0.87, periodoRetorno: 25 },
  'II': { I: 1.00, periodoRetorno: 50 },
  'III': { I: 1.15, periodoRetorno: 100 },
  'IV': { I: 1.22, periodoRetorno: 150 },
};

// ============ CONSTANTES DE EXPOSICIÓN (Tabla 6) ============
export const CONSTANTES_EXPOSICION: Record<Exposicion, { alpha: number; zg: number; zmin: number }> = {
  'B': { alpha: 7.5, zg: 1000, zmin: 10 },
  'C': { alpha: 9.8, zg: 750, zmin: 5 },
  'D': { alpha: 11.5, zg: 590, zmin: 2 },
};

// ============ FACTORES DE DIRECCIONALIDAD ============
export const Kd_SPRFV = 0.85;
export const Kd_CR = 0.85;

// ============ FUNCIONES DE CÁLCULO ============

/**
 * Calcula el coeficiente de exposición Kz según Tabla 5 y Nota 1
 */
export function calcularKz(z: number, exposicion: Exposicion): number {
  const { alpha, zg, zmin } = CONSTANTES_EXPOSICION[exposicion];

  // Según NCh432:2025: Kz = 2.41 * (max(z, zmin) / zg)^(2/alpha)
  const zEff = Math.max(z, zmin);

  if (zEff >= zg) return 2.41;

  return 2.41 * Math.pow(zEff / zg, 2 / alpha);
}

/**
 * Factor de elevación del suelo Ke
 */
export function calcularKe(ze: number): number {
  return Math.exp(-0.000119 * ze);
}

/**
 * Factor topográfico Kzt = (1 + K1*K2*K3)^2
 */
export function calcularKzt(
  tipoTopografia: 'cima2d' | 'colina3d' | 'escarpamiento',
  H: number,
  Lh: number,
  x: number,
  z_terreno: number,
  exposicion: Exposicion
): number {
  if (H / Lh < 0.2) return 1.0;
  if (H < 4.5 && exposicion !== 'B') return 1.0;
  if (H < 18 && exposicion === 'B') return 1.0;

  // Factor H/Lh limitado a 0.5
  const H_Lh = Math.min(H / Lh, 0.5);

  // Lh efectivo
  const Lh_eff = H / Lh > 0.5 ? 2 * H : Lh;

  // K1 según forma y exposición (valores de Figura 3)
  const K1_table: Record<string, Record<Exposicion, number>> = {
    cima2d: { B: 1.30, C: 1.45, D: 1.55 },
    escarpamiento: { B: 0.75, C: 0.85, D: 0.95 },
    colina3d: { B: 0.95, C: 1.05, D: 1.15 },
  };

  const K1_factor = K1_table[tipoTopografia][exposicion];
  const K1 = K1_factor * H_Lh;

  // Mu según dirección
  const mu_table: Record<string, { contra: number; favor: number }> = {
    cima2d: { contra: 3, favor: 1.5 },
    escarpamiento: { contra: 2.5, favor: 1.5 },
    colina3d: { contra: 4, favor: 1.5 },
  };

  const mu = x < 0 ? mu_table[tipoTopografia].contra : mu_table[tipoTopografia].favor;

  // K2 = (1 - |x| / (mu * Lh))
  const K2 = Math.max(0, 1 - Math.abs(x) / (mu * Lh_eff));

  // Gamma según dirección
  const gamma_table: Record<string, { contra: number; favor: number }> = {
    cima2d: { contra: 1.5, favor: 1.5 },
    escarpamiento: { contra: 4, favor: 4 },
    colina3d: { contra: 1.5, favor: 1.5 },
  };

  const gamma = x < 0 ? gamma_table[tipoTopografia].contra : gamma_table[tipoTopografia].favor;

  // K3 = e^(-gamma * z / Lh)
  const K3 = Math.exp(-gamma * z_terreno / Lh_eff);

  return Math.pow(1 + K1 * K2 * K3, 2);
}

/**
 * Presión de velocidad qz = 0.613 * I * Kz * Kzt * Ke * V^2
 */
export function calcularPresionVelocidad(
  z: number,
  V: number,
  I: number,
  exposicion: Exposicion,
  Kzt: number,
  Ke: number
): number {
  const Kz = calcularKz(z, exposicion);
  return 0.613 * I * Kz * Kzt * Ke * V * V;
}

/**
 * Factor de efecto de ráfaga G
 */
export function calcularRafaga(tipoEstructura: TipoEstructuraSPRFV): number {
  if (tipoEstructura === 'rigido') {
    return 0.85; // Edificios rígidos (incluye baja altura)
  }
  // Para estructuras flexibles se requiere análisis dinámico
  // Valor por defecto conservador
  return 0.90;
}

/**
 * Coeficiente de presión interna GCpi según Tabla 7
 */
export function calcularGCpi(tipoEdificio: TipoEdificio): { pos: number; neg: number } {
  switch (tipoEdificio) {
    case 'cerrado':
      return { pos: 0.18, neg: -0.18 };
    case 'parcialmente_cerrado':
      return { pos: 0.55, neg: -0.55 };
    case 'parcialmente_abierto':
      return { pos: 0.18, neg: -0.18 };
    case 'abierto':
      return { pos: 0, neg: 0 };
    default:
      return { pos: 0.18, neg: -0.18 };
  }
}

/**
 * Factor de reducción Ri para edificios de gran volumen (Ecuación 3)
 */
export function calcularRi(Aog: number, Vi: number): number {
  if (Vi <= 0) return 1.0;
  const Ri = 1.0 / (1.0 + 0.0116 * Math.pow(Aog / Vi, -0.5));
  return Math.max(0.1, Math.min(1.0, Ri));
}

/**
 * Clasificación automática del tipo de edificio
 */
export function clasificarEdificio(
  Ao: number,
  Ag: number,
  Aoi: number,
  Agi: number
): TipoEdificio {
  // Edificio abierto: cada muro ≥ 80% abierto
  if (Ao >= 0.8 * Ag) return 'abierto';

  // Edificio cerrado: Ao < min(0.01*Ag, 0.37)
  const umbralCerrado = Math.min(0.01 * Ag, 0.37);
  if (Ao < umbralCerrado && Aoi / Agi <= 0.2) return 'cerrado';

  // Edificio parcialmente cerrado
  if (Ao > 1.1 * Aoi && Ao > umbralCerrado && Aoi / Agi <= 0.2) {
    return 'parcialmente_cerrado';
  }

  // Parcialmente abierto
  return 'parcialmente_abierto';
}

/**
 * Cp sotavento muro - Interpolación según Figura 4 NCh432
 */
export function calcularCpSotaventoMuro(LB: number): number {
  if (LB <= 1) return -0.5;
  if (LB <= 2) return -0.5 + (LB - 1) * 0.2;
  if (LB <= 4) return -0.3 + (LB - 2) * 0.05;
  return -0.2;
}

/**
 * Cp techo plano (θ < 10°) — 4 zonas según Figura 4
 */
export function calcularCpTechoPlanoZonas(): CpTechoPlano {
  return { zona1: -0.9, zona2: -0.9, zona3: -0.5, zona4: -0.3 };
}

/**
 * Cp techo con pendiente (θ ≥ 10°) — Interpolación bilineal Figura 4
 */
export function calcularCpTechoPendienteValores(hL: number, theta: number): CpTechoPendiente {
  const hLc = Math.max(0.25, Math.min(1.0, hL));
  const angles =  [10, 15, 20, 25, 30, 35, 45, 60];
  const hLvals = [0.25, 0.5, 1.0];

  // Tabla succión barlovento
  const sucTab = [
    [-0.7,-0.5,-0.3,-0.2,-0.2, 0.0, 0.0, 0.01],
    [-0.9,-0.7,-0.4,-0.3,-0.2,-0.2, 0.0, 0.01],
    [-1.3,-1.0,-0.7,-0.5,-0.3,-0.2, 0.0, 0.01],
  ];
  // Tabla presión barlovento
  const preTab = [
    [-0.18, 0.0, 0.2, 0.3, 0.3, 0.4, 0.4, 0.6],
    [-0.18,-0.18,0.0, 0.2, 0.2, 0.3, 0.4, 0.6],
    [-0.18,-0.18,-0.18,0.0,0.2, 0.2, 0.3, 0.6],
  ];
  // Tabla sotavento
  const sotAngles = [10, 15, 20];
  const sotTab = [
    [-0.3,-0.5,-0.6],
    [-0.5,-0.5,-0.6],
    [-0.7,-0.6,-0.6],
  ];

  function interp(vals: number[], keys: number[], key: number): number {
    if (key <= keys[0]) return vals[0];
    if (key >= keys[keys.length-1]) return vals[vals.length-1];
    for (let i = 0; i < keys.length - 1; i++) {
      if (key >= keys[i] && key <= keys[i+1]) {
        const t = (key - keys[i]) / (keys[i+1] - keys[i]);
        return vals[i] + t * (vals[i+1] - vals[i]);
      }
    }
    return vals[vals.length-1];
  }

  function bilinear(table: number[][], rowKeys: number[], colKeys: number[], row: number, col: number): number {
    const rowVals = rowKeys.map((_, ri) => interp(table[ri], colKeys, col));
    return interp(rowVals, rowKeys, row);
  }

  return {
    barloventoSuccion: bilinear(sucTab, hLvals, angles, hLc, theta),
    barloventoPresion: bilinear(preTab, hLvals, angles, hLc, theta),
    sotavento: bilinear(sotTab, hLvals, sotAngles, hLc, Math.min(theta, 20)),
  };
}

/**
 * Calcula Cp completo para una dirección de viento
 */
export function calcularCpDireccion(
  h: number, L_paralelo: number, B_frontal: number, theta: number
): CpDireccion {
  const ratioLB = L_paralelo / B_frontal;
  const ratioHL = h / L_paralelo;

  const muros: CpMuros = {
    barlovento: 0.8,
    sotavento: calcularCpSotaventoMuro(ratioLB),
    laterales: -0.7,
  };

  let techoPlano: CpTechoPlano | null = null;
  let techoPendiente: CpTechoPendiente | null = null;

  if (theta < 10) {
    techoPlano = calcularCpTechoPlanoZonas();
  } else {
    techoPendiente = calcularCpTechoPendienteValores(ratioHL, theta);
  }

  return { muros, techoPlano, techoPendiente, ratioLB, ratioHL };
}

/**
 * Calcula áreas tributarias para una dirección de viento
 */
export function calcularAreasTributarias(
  h: number, L_paralelo: number, B_frontal: number, theta: number
): AreasTributarias {
  const cosTheta = Math.cos(theta * Math.PI / 180);
  const dimPerp = B_frontal; // largo del faldón perpendicular al viento

  return {
    muroBarloSota: h * dimPerp,
    murosLaterales: h * L_paralelo,
    techoZona1: dimPerp * (h / 2) / cosTheta,
    techoZona2: dimPerp * (h / 2) / cosTheta,
    techoZona3: dimPerp * h / cosTheta,
    techoZona4: dimPerp * Math.max(L_paralelo - 2 * h, 0) / cosTheta,
  };
}

/**
 * Calcula presiones netas para un caso de viento
 */
export function calcularPresionesNetasCaso(
  qz: number, qh: number, Kd: number, G: number,
  GCpi: number, cp: CpDireccion
): PresionesNetas {
  const pIntKgf = (qh * Kd * GCpi) / 9.80665;

  const pExtBar = (qz * Kd * G * cp.muros.barlovento) / 9.80665;
  const pExtSot = (qh * Kd * G * cp.muros.sotavento) / 9.80665;
  const pExtLat = (qh * Kd * G * cp.muros.laterales) / 9.80665;

  let tZ1: number, tZ2: number, tZ3: number, tZ4: number;

  if (cp.techoPlano) {
    const tp = cp.techoPlano;
    tZ1 = (qh * Kd * G * tp.zona1) / 9.80665 - pIntKgf;
    tZ2 = (qh * Kd * G * tp.zona2) / 9.80665 - pIntKgf;
    tZ3 = (qh * Kd * G * tp.zona3) / 9.80665 - pIntKgf;
    tZ4 = (qh * Kd * G * tp.zona4) / 9.80665 - pIntKgf;
  } else {
    // Para techos con pendiente, usar succión máxima en las 4 zonas
    const cpT = cp.techoPendiente!.barloventoSuccion;
    const cpSot = cp.techoPendiente!.sotavento;
    tZ1 = (qh * Kd * G * cpT) / 9.80665 - pIntKgf;
    tZ2 = (qh * Kd * G * cpT) / 9.80665 - pIntKgf;
    tZ3 = (qh * Kd * G * cpSot) / 9.80665 - pIntKgf;
    tZ4 = (qh * Kd * G * cpSot) / 9.80665 - pIntKgf;
  }

  return {
    muroBarlovento: pExtBar - pIntKgf,
    muroSotavento: pExtSot - pIntKgf,
    murosLaterales: pExtLat - pIntKgf,
    techoZona1: tZ1,
    techoZona2: tZ2,
    techoZona3: tZ3,
    techoZona4: tZ4,
  };
}

/**
 * Calcula fuerzas resultantes F = p × A
 */
export function calcularFuerzasCaso(
  presiones: PresionesNetas, areas: AreasTributarias
): FuerzasResultantes {
  const fBar = presiones.muroBarlovento * areas.muroBarloSota;
  const fSot = presiones.muroSotavento * areas.muroBarloSota;
  const fLat = presiones.murosLaterales * areas.murosLaterales;

  const fZ1 = presiones.techoZona1 * areas.techoZona1;
  const fZ2 = presiones.techoZona2 * areas.techoZona2;
  const fZ3 = presiones.techoZona3 * areas.techoZona3;
  const fZ4 = presiones.techoZona4 * areas.techoZona4;

  return {
    horizontal: fBar + fSot,
    vertical: fZ1 + fZ2 + fZ3 + fZ4,
    detalleHorizontal: { barlovento: fBar, sotavento: fSot },
    detalleVertical: { zona1: fZ1, zona2: fZ2, zona3: fZ3, zona4: fZ4 },
    lateralTotal: fLat,
  };
}

/**
 * Construye un CasoViento completo
 */
export function construirCasoViento(
  nombre: string, descripcion: string,
  direccionViento: 'cara_corta' | 'cara_larga',
  signoGCpi: 'positivo' | 'negativo',
  GCpiVal: number,
  qz: number, qh: number, Kd: number, G: number,
  cp: CpDireccion,
  h: number, L_paralelo: number, B_frontal: number, theta: number
): CasoViento {
  const presiones = calcularPresionesNetasCaso(qz, qh, Kd, G, GCpiVal, cp);
  const areas = calcularAreasTributarias(h, L_paralelo, B_frontal, theta);
  const fuerzas = calcularFuerzasCaso(presiones, areas);

  return { nombre, descripcion, direccionViento, signoGCpi, GCpi: GCpiVal, presiones, areas, fuerzas };
}

/**
 * Cálculo principal de la norma NCh432:2025
 */
export function calcularNCh432(params: ParametrosCalculo): ResultadoCalculo {
  const {
    zona, categoria, exposicion, tipoEdificio, tipoEstructura,
    alturaMediaTecho, alturaAlero, longitud, ancho, pendienteTecho,
    tieneEfectoTopografico, tipoTopografia, H, Lh, x, z_terreno,
    elevacionSobreNivelMar, volumenInterno, areaAberturas, areaAberturasResto,
    convencionEjes,
  } = params;

  const V = ZONAS_VIENTO[zona].V;
  const I = FACTOR_IMPORTANCIA[categoria].I;
  const Kd = Kd_SPRFV;

  let Kzt = 1.0;
  if (tieneEfectoTopografico) {
    Kzt = calcularKzt(tipoTopografia, H, Lh, x, z_terreno, exposicion);
  }

  const Ke = calcularKe(elevacionSobreNivelMar);
  const alturaEvaluar = pendienteTecho <= 10 ? alturaAlero : alturaMediaTecho;
  const Kz_pared = calcularKz(alturaEvaluar, exposicion);
  const Kz_techo = calcularKz(alturaMediaTecho, exposicion);

  const qz = calcularPresionVelocidad(alturaEvaluar, V, I, exposicion, Kzt, Ke);
  const qh = calcularPresionVelocidad(alturaMediaTecho, V, I, exposicion, Kzt, Ke);
  const qi = qh;

  const G = calcularRafaga(tipoEstructura);
  const { pos: GCpi_pos, neg: GCpi_neg } = calcularGCpi(tipoEdificio);

  const Aog = areaAberturas + areaAberturasResto;
  const Ri = tipoEdificio === 'parcialmente_cerrado' ? calcularRi(Aog, volumenInterno) : 1.0;
  const GCpi_eff_pos = GCpi_pos * Ri;
  const GCpi_eff_neg = GCpi_neg * Ri;

  // ============ Cp para ambas direcciones ============
  // Cara corta: viento golpea B (ancho), L es paralelo al viento
  const cpCaraCorta = calcularCpDireccion(alturaMediaTecho, longitud, ancho, pendienteTecho);
  // Cara larga: viento golpea L (largo), B es paralelo al viento  
  const cpCaraLarga = calcularCpDireccion(alturaMediaTecho, ancho, longitud, pendienteTecho);

  // ============ 4 Casos de Viento ============
  const conv: ConvencionEjes = convencionEjes || 'x_cara_corta';

  const caraCorta_pos = construirCasoViento(
    conv === 'x_cara_corta' ? 'Wx+' : 'Wy+',
    `Viento ⊥ cara corta (B=${ancho}m) + GCpi positivo`,
    'cara_corta', 'positivo', GCpi_eff_pos,
    qz, qh, Kd, G, cpCaraCorta,
    alturaMediaTecho, longitud, ancho, pendienteTecho
  );

  const caraCorta_neg = construirCasoViento(
    conv === 'x_cara_corta' ? 'Wx-' : 'Wy-',
    `Viento ⊥ cara corta (B=${ancho}m) + GCpi negativo`,
    'cara_corta', 'negativo', GCpi_eff_neg,
    qz, qh, Kd, G, cpCaraCorta,
    alturaMediaTecho, longitud, ancho, pendienteTecho
  );

  const caraLarga_pos = construirCasoViento(
    conv === 'x_cara_corta' ? 'Wy+' : 'Wx+',
    `Viento ⊥ cara larga (L=${longitud}m) + GCpi positivo`,
    'cara_larga', 'positivo', GCpi_eff_pos,
    qz, qh, Kd, G, cpCaraLarga,
    alturaMediaTecho, ancho, longitud, pendienteTecho
  );

  const caraLarga_neg = construirCasoViento(
    conv === 'x_cara_corta' ? 'Wy-' : 'Wx-',
    `Viento ⊥ cara larga (L=${longitud}m) + GCpi negativo`,
    'cara_larga', 'negativo', GCpi_eff_neg,
    qz, qh, Kd, G, cpCaraLarga,
    alturaMediaTecho, ancho, longitud, pendienteTecho
  );

  // Asignar según convención
  let Wx_pos: CasoViento, Wx_neg: CasoViento, Wy_pos: CasoViento, Wy_neg: CasoViento;
  if (conv === 'x_cara_corta') {
    Wx_pos = caraCorta_pos; Wx_neg = caraCorta_neg;
    Wy_pos = caraLarga_pos; Wy_neg = caraLarga_neg;
  } else {
    Wx_pos = caraLarga_pos; Wx_neg = caraLarga_neg;
    Wy_pos = caraCorta_pos; Wy_neg = caraCorta_neg;
  }

  // ============ Legacy presiones (para compatibilidad) ============
  const L_B = longitud / ancho;
  const Cp_barlovento = 0.8;
  const Cp_sotavento = calcularCpSotaventoMuro(L_B);
  const Cp_laterales = -0.7;

  const p_ext_bar = qz * Kd * G * Cp_barlovento;
  const p_ext_sot = qh * Kd * G * Cp_sotavento;
  const p_ext_lat = qh * Kd * G * Cp_laterales;
  const p_int_pos = qi * Kd * GCpi_eff_pos;
  const p_int_neg = qi * Kd * GCpi_eff_neg;

  const presionBarlovento = Math.max(Math.abs(p_ext_bar - p_int_pos), Math.abs(p_ext_bar - p_int_neg));
  const presionSotavento = Math.max(Math.abs(p_ext_sot - p_int_pos), Math.abs(p_ext_sot - p_int_neg));
  const presionLaterales = Math.max(Math.abs(p_ext_lat - p_int_pos), Math.abs(p_ext_lat - p_int_neg));

  const Cp_techo = cpCaraCorta.techoPlano ? cpCaraCorta.techoPlano.zona1 : -0.9;
  const p_ext_techo = qh * Kd * G * Cp_techo;
  const presionTecho = Math.max(Math.abs(p_ext_techo - p_int_pos), Math.abs(p_ext_techo - p_int_neg));

  // C&R
  const GCp_muro = -1.0;
  const GCp_techo_borde = -1.5;
  const GCp_techo_interior = -0.9;
  const GCp_esquinas = -2.0;

  const p_cr_muros = Math.max(Math.abs(qh*Kd*GCp_muro - p_int_pos), Math.abs(qh*Kd*GCp_muro - p_int_neg));
  const p_cr_techoBorde = Math.max(Math.abs(qh*Kd*GCp_techo_borde - p_int_pos), Math.abs(qh*Kd*GCp_techo_borde - p_int_neg));
  const p_cr_techoInterior = Math.max(Math.abs(qh*Kd*GCp_techo_interior - p_int_pos), Math.abs(qh*Kd*GCp_techo_interior - p_int_neg));
  const p_cr_esquinas = Math.max(Math.abs(qh*Kd*GCp_esquinas - p_int_pos), Math.abs(qh*Kd*GCp_esquinas - p_int_neg));

  const areaMuroBar = ancho * alturaEvaluar;
  const fuerzaTotal = presionBarlovento * areaMuroBar + presionSotavento * areaMuroBar;
  const fuerzaPorMetro = fuerzaTotal / (2 * (longitud + ancho));

  return {
    V, I, Kd, Kzt, Ke, qz, qh, qi, G,
    GCpi_pos: GCpi_eff_pos, GCpi_neg: GCpi_eff_neg,
    presiones: {
      barlovento: presionBarlovento, sotavento: presionSotavento,
      laterales: presionLaterales, techoBarlovento: presionTecho,
      techoSotavento: presionTecho, techoCentro: presionTecho,
    },
    presionesCR: { muros: p_cr_muros, techoBorde: p_cr_techoBorde, techoInterior: p_cr_techoInterior, esquinas: p_cr_esquinas },
    fuerzaTotal, fuerzaPorMetro, Kz_pared, Kz_techo, Ri,
    convencion: conv,
    cpCaraCorta, cpCaraLarga,
    casos: { Wx_pos, Wx_neg, Wy_pos, Wy_neg },
  };
}

/**
 * Factor de conversión Newton a kgf (1 kgf = 9.80665 N)
 */
export const N_TO_KGF = 1 / 9.80665;

/**
 * Formatea un número en notación científica o decimal
 */
export function fmt(num: number, decimals: number = 2): string {
  if (Math.abs(num) >= 10000 || (Math.abs(num) < 0.01 && num !== 0)) {
    return num.toExponential(decimals);
  }
  return num.toFixed(decimals);
}

/**
 * Formatea presión convirtiendo de N/m² a kgf/m²
 */
export function fmtPresion(num: number): string {
  const kgf = num * N_TO_KGF;
  return kgf.toFixed(2) + ' kgf/m²';
}
