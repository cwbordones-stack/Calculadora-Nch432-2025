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
};

export function useCalculadora() {
  const [params, setParams] = useState<ParametrosCalculo>(defaultParams);

  const updateParam = useCallback(<K extends keyof ParametrosCalculo>(
    key: K,
    value: ParametrosCalculo[K]
  ) => {
    setParams(prev => ({ ...prev, [key]: value }));
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
