import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Info, Wind, Building2, TriangleAlert } from 'lucide-react';
import type { ResultadoCalculo } from '@/types/nch432';

interface PanelResultadosProps {
  resultado: ResultadoCalculo | null;
}

function ValorResultado({ label, value, unit, destacado = false }: { label: string; value: string | number; unit?: string; destacado?: boolean }) {
  return (
    <div className={`p-3 rounded-lg ${destacado ? 'bg-blue-50 border border-blue-200' : 'bg-slate-50'}`}>
      <p className="text-xs text-slate-500 mb-1">{label}</p>
      <p className={`text-lg font-semibold ${destacado ? 'text-blue-700' : 'text-slate-800'}`}>
        {typeof value === 'number' ? value.toFixed(3) : value}
        {unit && <span className="text-sm font-normal text-slate-500 ml-1">{unit}</span>}
      </p>
    </div>
  );
}

export function PanelResultados({ resultado }: PanelResultadosProps) {
  if (!resultado) {
    return (
      <Alert variant="destructive">
        <TriangleAlert className="h-4 w-4" />
        <AlertTitle>Error en el cálculo</AlertTitle>
        <AlertDescription>No se pudieron calcular los resultados. Verifique los parámetros de entrada.</AlertDescription>
      </Alert>
    );
  }

  const { presiones, presionesCR } = resultado;

  return (
    <div className="space-y-4">
      <Tabs defaultValue="basicos" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="basicos">Parámetros Básicos</TabsTrigger>
          <TabsTrigger value="sprfv">SPRFV</TabsTrigger>
          <TabsTrigger value="cr">C&R</TabsTrigger>
        </TabsList>

        {/* TAB: PARÁMETROS BÁSICOS */}
        <TabsContent value="basicos" className="space-y-4 mt-4">
          <Card className="border-blue-200">
            <CardHeader className="pb-3 flex flex-row items-center gap-2">
              <Wind className="h-5 w-5 text-blue-600" />
              <CardTitle className="text-base font-semibold text-slate-800">Presiones de Velocidad</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <ValorResultado label="V (Velocidad básica)" value={resultado.V} unit="m/s" destacado />
                <ValorResultado label="I (Importancia)" value={resultado.I} />
                <ValorResultado label="Kd (Direccionalidad)" value={resultado.Kd} />
                <ValorResultado label="Kzt (Topográfico)" value={resultado.Kzt} />
                <ValorResultado label="Ke (Elevación)" value={resultado.Ke} />
                <ValorResultado label="G (Ráfaga)" value={resultado.G} />
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <ValorResultado label="qz (paredes)" value={resultado.qz} unit="N/m²" destacado />
                <ValorResultado label="qh (techo)" value={resultado.qh} unit="N/m²" destacado />
                <ValorResultado label="qi (interna)" value={resultado.qi} unit="N/m²" destacado />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200">
                  <p className="text-xs text-emerald-600 mb-1">qz en kgf/m²</p>
                  <p className="text-2xl font-bold text-emerald-800">{(resultado.qz / 9.80665).toFixed(2)} kgf/m²</p>
                </div>
                <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200">
                  <p className="text-xs text-emerald-600 mb-1">qh en kgf/m²</p>
                  <p className="text-2xl font-bold text-emerald-800">{(resultado.qh / 9.80665).toFixed(2)} kgf/m²</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold text-slate-800">Coeficientes de Presión Interna</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <ValorResultado label="GCpi (+)" value={resultado.GCpi_pos} />
                <ValorResultado label="GCpi (-)" value={resultado.GCpi_neg} />
                {resultado.Ri !== 1 && (
                  <ValorResultado label="Ri (reducción)" value={resultado.Ri} />
                )}
              </div>
              {resultado.Ri !== 1 && (
                <Alert className="mt-3 bg-amber-50 border-amber-200">
                  <Info className="h-4 w-4 text-amber-600" />
                  <AlertDescription className="text-amber-700 text-sm">
                    Se aplicó factor de reducción Ri = {resultado.Ri.toFixed(3)} para edificio parcialmente cerrado de gran volumen.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB: SPRFV */}
        <TabsContent value="sprfv" className="space-y-4 mt-4">
          <Card className="border-emerald-200">
            <CardHeader className="pb-3 flex flex-row items-center gap-2">
              <Building2 className="h-5 w-5 text-emerald-600" />
              <CardTitle className="text-base font-semibold text-slate-800">Presiones de Diseño SPRFV</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-slate-500">
                Fórmula: p = q × Kd × G × Cp − qi × Kd × (GCpi) — Se muestra el valor más desfavorable combinando GCpi positivo y negativo.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                <div className="p-4 rounded-lg bg-red-50 border border-red-200">
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="destructive" className="text-xs">Muro Barlovento</Badge>
                  </div>
                  <p className="text-3xl font-bold text-red-700">{(presiones.barlovento / 9.80665).toFixed(2)}</p>
                  <p className="text-xs text-red-500 mt-1">kgf/m² (succión/presión)</p>
                </div>

                <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
                  <div className="flex items-center justify-between mb-2">
                    <Badge className="bg-blue-600 text-xs">Muro Sotavento</Badge>
                  </div>
                  <p className="text-3xl font-bold text-blue-700">{(Math.abs(presiones.sotavento) / 9.80665).toFixed(2)}</p>
                  <p className="text-xs text-blue-500 mt-1">kgf/m² (succión)</p>
                </div>

                <div className="p-4 rounded-lg bg-purple-50 border border-purple-200">
                  <div className="flex items-center justify-between mb-2">
                    <Badge className="bg-purple-600 text-xs">Muros Laterales</Badge>
                  </div>
                  <p className="text-3xl font-bold text-purple-700">{(Math.abs(presiones.laterales) / 9.80665).toFixed(2)}</p>
                  <p className="text-xs text-purple-500 mt-1">kgf/m² (succión)</p>
                </div>

                <div className="p-4 rounded-lg bg-amber-50 border border-amber-200">
                  <div className="flex items-center justify-between mb-2">
                    <Badge className="bg-amber-600 text-xs">Techo Barlovento</Badge>
                  </div>
                  <p className="text-3xl font-bold text-amber-700">{(Math.abs(presiones.techoBarlovento) / 9.80665).toFixed(2)}</p>
                  <p className="text-xs text-amber-500 mt-1">kgf/m²</p>
                </div>

                <div className="p-4 rounded-lg bg-orange-50 border border-orange-200">
                  <div className="flex items-center justify-between mb-2">
                    <Badge className="bg-orange-600 text-xs">Techo Sotavento</Badge>
                  </div>
                  <p className="text-3xl font-bold text-orange-700">{(Math.abs(presiones.techoSotavento) / 9.80665).toFixed(2)}</p>
                  <p className="text-xs text-orange-500 mt-1">kgf/m²</p>
                </div>

                <div className="p-4 rounded-lg bg-teal-50 border border-teal-200">
                  <div className="flex items-center justify-between mb-2">
                    <Badge className="bg-teal-600 text-xs">Techo Centro</Badge>
                  </div>
                  <p className="text-3xl font-bold text-teal-700">{(Math.abs(presiones.techoCentro) / 9.80665).toFixed(2)}</p>
                  <p className="text-xs text-teal-500 mt-1">kgf/m²</p>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-4 rounded-lg bg-slate-100 border border-slate-300">
                  <p className="text-sm text-slate-600 mb-1">Fuerza total aproximada</p>
                  <p className="text-2xl font-bold text-slate-800">{(resultado.fuerzaTotal / 1000).toFixed(2)} kN</p>
                </div>
                <div className="p-4 rounded-lg bg-slate-100 border border-slate-300">
                  <p className="text-sm text-slate-600 mb-1">Fuerza por metro de perímetro</p>
                  <p className="text-2xl font-bold text-slate-800">{(resultado.fuerzaPorMetro / 1000).toFixed(2)} kN/m</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Alert className="bg-blue-50 border-blue-200">
            <Info className="h-4 w-4 text-blue-600" />
            <AlertTitle className="text-blue-800 text-sm">Carga mínima de viento</AlertTitle>
            <AlertDescription className="text-blue-700 text-sm">
              Según NCh432:2025 §6.1.5, la presión del viento para SPRFV no debe ser inferior a 25.5 kgf/m² (0.25 kN/m²).
            </AlertDescription>
          </Alert>
        </TabsContent>

        {/* TAB: C&R */}
        <TabsContent value="cr" className="space-y-4 mt-4">
          <Card className="border-violet-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold text-slate-800">Presiones de Diseño Componentes y Revestimiento</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-slate-500">
                Valores de GCp típicos para Componentes y Revestimiento según Figuras 24-37 de NCh432:2025.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-4 rounded-lg bg-violet-50 border border-violet-200">
                  <div className="flex items-center justify-between mb-2">
                    <Badge className="bg-violet-600 text-xs">Muros - Borde/Zona 4</Badge>
                  </div>
                  <p className="text-3xl font-bold text-violet-700">{(presionesCR.muros / 9.80665).toFixed(2)}</p>
                  <p className="text-xs text-violet-500 mt-1">kgf/m²</p>
                </div>

                <div className="p-4 rounded-lg bg-pink-50 border border-pink-200">
                  <div className="flex items-center justify-between mb-2">
                    <Badge className="bg-pink-600 text-xs">Techo - Borde/Zona 2</Badge>
                  </div>
                  <p className="text-3xl font-bold text-pink-700">{(presionesCR.techoBorde / 9.80665).toFixed(2)}</p>
                  <p className="text-xs text-pink-500 mt-1">kgf/m²</p>
                </div>

                <div className="p-4 rounded-lg bg-cyan-50 border border-cyan-200">
                  <div className="flex items-center justify-between mb-2">
                    <Badge className="bg-cyan-600 text-xs">Techo - Interior/Zona 1</Badge>
                  </div>
                  <p className="text-3xl font-bold text-cyan-700">{(presionesCR.techoInterior / 9.80665).toFixed(2)}</p>
                  <p className="text-xs text-cyan-500 mt-1">kgf/m²</p>
                </div>

                <div className="p-4 rounded-lg bg-rose-50 border border-rose-200">
                  <div className="flex items-center justify-between mb-2">
                    <Badge className="bg-rose-600 text-xs">Esquinas/Zona 3</Badge>
                  </div>
                  <p className="text-3xl font-bold text-rose-700">{(presionesCR.esquinas / 9.80665).toFixed(2)}</p>
                  <p className="text-xs text-rose-500 mt-1">kgf/m²</p>
                </div>
              </div>

              <Alert className="bg-amber-50 border-amber-200">
                <Info className="h-4 w-4 text-amber-600" />
                <AlertDescription className="text-amber-700 text-sm">
                  Los valores de C&R son referenciales. Para valores exactos consulte las Figuras 24-44 de NCh432:2025 según la geometría y área efectiva específica.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
