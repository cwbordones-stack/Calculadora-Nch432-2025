// Constantes y funciones de cálculo NCh432:2025

import type {
  ZonaViento,
  CategoriaOcupacion,
  Exposicion,
  TipoEdificio,
  TipoEstructuraSPRFV,
  ParametrosCalculo,
  ResultadoCalculo,
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
 * Cálculo principal de la norma NCh432:2025
 */
export function calcularNCh432(params: ParametrosCalculo): ResultadoCalculo {
  const {
    zona,
    categoria,
    exposicion,
    tipoEdificio,
    tipoEstructura,
    alturaMediaTecho,
    alturaAlero,
    longitud,
    ancho,
    pendienteTecho,
    tieneEfectoTopografico,
    tipoTopografia,
    H,
    Lh,
    x,
    z_terreno,
    elevacionSobreNivelMar,
    volumenInterno,
    areaAberturas,
    areaAberturasResto,
  } = params;

  // 1. Velocidad básica
  const V = ZONAS_VIENTO[zona].V;

  // 2. Factor de importancia
  const I = FACTOR_IMPORTANCIA[categoria].I;

  // 3. Factor de direccionalidad (SPRFV)
  const Kd = Kd_SPRFV;

  // 4. Factor topográfico
  let Kzt = 1.0;
  if (tieneEfectoTopografico) {
    Kzt = calcularKzt(tipoTopografia, H, Lh, x, z_terreno, exposicion);
  }

  // 5. Factor de elevación
  const Ke = calcularKe(elevacionSobreNivelMar);

  // 6. Coeficientes de exposición
  const alturaEvaluar = pendienteTecho <= 10 ? alturaAlero : alturaMediaTecho;
  const Kz_pared = calcularKz(alturaEvaluar, exposicion);
  const Kz_techo = calcularKz(alturaMediaTecho, exposicion);

  // 7. Presiones de velocidad
  const qz = calcularPresionVelocidad(alturaEvaluar, V, I, exposicion, Kzt, Ke);
  const qh = calcularPresionVelocidad(alturaMediaTecho, V, I, exposicion, Kzt, Ke);
  const qi = qh; // Para evaluación de presión interna

  // 8. Factor de ráfaga
  const G = calcularRafaga(tipoEstructura);

  // 9. Coeficientes de presión interna
  const { pos: GCpi_pos, neg: GCpi_neg } = calcularGCpi(tipoEdificio);

  // 10. Factor de reducción Ri (para edificios parcialmente cerrados de gran volumen)
  const Aog = areaAberturas + areaAberturasResto;
  const Ri = tipoEdificio === 'parcialmente_cerrado' ? calcularRi(Aog, volumenInterno) : 1.0;
  const GCpi_eff_pos = GCpi_pos * Ri;
  const GCpi_eff_neg = GCpi_neg * Ri;

  // 11. Coeficientes de presión externa Cp
  // Para SPRFV - Edificios cerrados/parcialmente cerrados (Figura 4)
  // Simplificación: valores típicos para edificios rectangulares
  const L_B = longitud / ancho;
  const h_L = alturaMediaTecho / longitud;

  // Muro de barlovento
  const Cp_barlovento = 0.8;

  // Muro de sotavento
  let Cp_sotavento = -0.5;
  if (L_B <= 1) Cp_sotavento = -0.5;
  else if (L_B >= 2) Cp_sotavento = -0.3;
  else Cp_sotavento = -0.5 + (L_B - 1) * 0.2;

  // Muros laterales
  const Cp_laterales = -0.7;

  // Techo - valores según pendiente
  let Cp_techoBarlovento = -0.9;
  let Cp_techoSotavento = -0.5;
  let Cp_techoCentro = -0.7;

  if (pendienteTecho <= 10) {
    Cp_techoBarlovento = -1.0;
    Cp_techoSotavento = -0.8;
    Cp_techoCentro = -0.9;
  } else if (pendienteTecho <= 30) {
    // Techo a dos aguas con pendiente media
    Cp_techoBarlovento = 0.3;  // zona de barlovento puede tener presión positiva
    Cp_techoSotavento = -0.6;
    Cp_techoCentro = -0.3;
  }

  // Ajuste según h/L
  if (h_L > 0.25 && h_L <= 1.0) {
    // Valores ya considerados
  }

  // 12. Presiones de diseño SPRFV: p = q*Kd*G*Cp - qi*Kd*(GCpi)
  // Caso con presión interna positiva (+GCpi) y negativa (-GCpi)
  // Se toma el más desfavorable

  // Presiones externas (sin presión interna) - p = q*Kd*G*Cp - qi*Kd*(GCpi)
  const p_ext_barlovento = qz * Kd * G * Cp_barlovento;
  const p_ext_sotavento = qh * Kd * G * Cp_sotavento;
  const p_ext_laterales = qh * Kd * G * Cp_laterales;
  const p_ext_techoBarlovento = qh * Kd * G * Cp_techoBarlovento;
  const p_ext_techoSotavento = qh * Kd * G * Cp_techoSotavento;
  const p_ext_techoCentro = qh * Kd * G * Cp_techoCentro;

  // Presión interna
  const p_int_pos = qi * Kd * GCpi_eff_pos;
  const p_int_neg = qi * Kd * GCpi_eff_neg;

  // Presiones netas (combinando casos +GCpi y -GCpi)
  const presionBarlovento = Math.max(
    Math.abs(p_ext_barlovento - p_int_pos),
    Math.abs(p_ext_barlovento - p_int_neg)
  );

  const presionSotavento = Math.max(
    Math.abs(p_ext_sotavento - p_int_pos),
    Math.abs(p_ext_sotavento - p_int_neg)
  );

  const presionLaterales = Math.max(
    Math.abs(p_ext_laterales - p_int_pos),
    Math.abs(p_ext_laterales - p_int_neg)
  );

  const presionTechoBarlovento = Math.max(
    Math.abs(p_ext_techoBarlovento - p_int_pos),
    Math.abs(p_ext_techoBarlovento - p_int_neg)
  );

  const presionTechoSotavento = Math.max(
    Math.abs(p_ext_techoSotavento - p_int_pos),
    Math.abs(p_ext_techoSotavento - p_int_neg)
  );

  const presionTechoCentro = Math.max(
    Math.abs(p_ext_techoCentro - p_int_pos),
    Math.abs(p_ext_techoCentro - p_int_neg)
  );

  // 13. Presiones para Componentes y Revestimiento
  // GCp según Figura 24-37
  const GCp_muro = -1.0; // zona de borde
  const GCp_techo_borde = -1.5;
  const GCp_techo_interior = -0.9;
  const GCp_esquinas = -2.0;

  const p_cr_muros = Math.max(
    Math.abs(qh * Kd * GCp_muro - p_int_pos),
    Math.abs(qh * Kd * GCp_muro - p_int_neg)
  );

  const p_cr_techoBorde = Math.max(
    Math.abs(qh * Kd * GCp_techo_borde - p_int_pos),
    Math.abs(qh * Kd * GCp_techo_borde - p_int_neg)
  );

  const p_cr_techoInterior = Math.max(
    Math.abs(qh * Kd * GCp_techo_interior - p_int_pos),
    Math.abs(qh * Kd * GCp_techo_interior - p_int_neg)
  );

  const p_cr_esquinas = Math.max(
    Math.abs(qh * Kd * GCp_esquinas - p_int_pos),
    Math.abs(qh * Kd * GCp_esquinas - p_int_neg)
  );

  // 14. Fuerzas totales (aproximadas)
  // Áreas
  const areaMuroBarlovento = ancho * alturaEvaluar;
  const areaMuroSotavento = ancho * alturaMediaTecho;
  const areaMuroLateral1 = longitud * alturaMediaTecho;
  const areaMuroLateral2 = longitud * alturaMediaTecho;
  const areaTecho = longitud * ancho;

  const fuerzaBarlovento = presionBarlovento * areaMuroBarlovento;
  const fuerzaSotavento = presionSotavento * areaMuroSotavento;
  const fuerzaLaterales = presionLaterales * (areaMuroLateral1 + areaMuroLateral2);
  const fuerzaTecho = presionTechoCentro * areaTecho;

  const fuerzaTotal = fuerzaBarlovento + Math.abs(fuerzaSotavento) + Math.abs(fuerzaLaterales) + Math.abs(fuerzaTecho);
  const fuerzaPorMetro = fuerzaTotal / (2 * (longitud + ancho));

  return {
    V,
    I,
    Kd,
    Kzt,
    Ke,
    qz,
    qh,
    qi,
    G,
    GCpi_pos: GCpi_eff_pos,
    GCpi_neg: GCpi_eff_neg,
    presiones: {
      barlovento: presionBarlovento,
      sotavento: presionSotavento,
      laterales: presionLaterales,
      techoBarlovento: presionTechoBarlovento,
      techoSotavento: presionTechoSotavento,
      techoCentro: presionTechoCentro,
    },
    presionesCR: {
      muros: p_cr_muros,
      techoBorde: p_cr_techoBorde,
      techoInterior: p_cr_techoInterior,
      esquinas: p_cr_esquinas,
    },
    fuerzaTotal,
    fuerzaPorMetro,
    Kz_pared,
    Kz_techo,
    Ri,
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
