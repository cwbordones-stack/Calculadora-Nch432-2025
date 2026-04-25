import { useState, useCallback, useMemo } from 'react';
import type { ParametrosCalculo, ResultadoCalculo } from '@/types/nch432';
import { calcularNCh432 } from '@/lib/nch432';

const defaultParams: ParametrosCalculo = {
  zona: 'III-A',
  categoria: 'II',
  exposicion: 'B',
  tipoEdificio: 'cerrado',
  tipoEstructura: 'rigido',
  tipoTecho: 'dos_aguas',
  alturaMediaTecho: 8.19,
  alturaAlero: 7.53,
  alturaCumbrera: 8.85,
  longitud: 85,
  ancho: 50,
  pendienteTecho: 3.022,
  tieneEfectoTopografico: false,
  tipoTopografia: 'cima2d',
  H: 10,
  Lh: 50,
  x: 0,
  z_terreno: 5,
  elevacionSobreNivelMar: 0,
  areaAberturas: 0.5,
  areaMuro: 60,
  areaAberturasResto: 2,
  areaResto: 250,
  volumenInterno: 1200,
  areaEfectiva: 10,
  convencionEjes: 'x_cara_corta',
};

export function useCalculadora() {
  const [params, setParams] = useState<ParametrosCalculo>(defaultParams);

  const updateParam = useCallback(<K extends keyof ParametrosCalculo>(
    key: K,
    value: ParametrosCalculo[K]
  ) => {
    setParams(prev => {
      const next = { ...prev, [key]: value };
      // Auto-calcular h y θ cuando cambian he, hc o B
      if (key === 'alturaAlero' || key === 'alturaCumbrera' || key === 'ancho') {
        const he = key === 'alturaAlero' ? (value as number) : next.alturaAlero;
        const hc = key === 'alturaCumbrera' ? (value as number) : next.alturaCumbrera;
        const B = key === 'ancho' ? (value as number) : next.ancho;
        next.alturaMediaTecho = (he + hc) / 2;
        next.pendienteTecho = Math.atan((hc - he) / (B / 2)) * (180 / Math.PI);
      }
      return next;
    });
  }, []);

  const resultado: ResultadoCalculo | null = useMemo(() => {
    try {
      return calcularNCh432(params);
    } catch (e) {
      console.error('Error en cálculo:', e);
      return null;
    }
  }, [params]);

  return {
    params,
    updateParam,
    resultado,
  };
}
