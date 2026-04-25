import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Info, Wind, TriangleAlert, BookOpen } from 'lucide-react';
import type { ResultadoCalculo, CasoViento } from '@/types/nch432';

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

function CasoVientoPanel({ caso }: { caso: CasoViento }) {
  const { presiones, areas, fuerzas } = caso;
  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-600">{caso.descripcion}</p>

      {/* Presiones netas */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">Presiones Netas (kgf/m²)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <div className={`p-3 rounded-lg border ${presiones.muroBarlovento >= 0 ? 'bg-red-50 border-red-200' : 'bg-blue-50 border-blue-200'}`}>
              <p className="text-xs text-slate-500">Muro Barlovento</p>
              <p className="text-xl font-bold">{presiones.muroBarlovento.toFixed(2)}</p>
            </div>
            <div className={`p-3 rounded-lg border ${presiones.muroSotavento >= 0 ? 'bg-red-50 border-red-200' : 'bg-blue-50 border-blue-200'}`}>
              <p className="text-xs text-slate-500">Muro Sotavento</p>
              <p className="text-xl font-bold">{presiones.muroSotavento.toFixed(2)}</p>
            </div>
            <div className={`p-3 rounded-lg border ${presiones.murosLaterales >= 0 ? 'bg-red-50 border-red-200' : 'bg-purple-50 border-purple-200'}`}>
              <p className="text-xs text-slate-500">Muros Laterales</p>
              <p className="text-xl font-bold">{presiones.murosLaterales.toFixed(2)}</p>
            </div>
          </div>
          <Separator className="my-3" />
          <p className="text-xs font-semibold text-slate-600 mb-2">Techo — 4 Zonas</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {[
              { label: 'Zona 1 (0 a h/2)', val: presiones.techoZona1 },
              { label: 'Zona 2 (h/2 a h)', val: presiones.techoZona2 },
              { label: 'Zona 3 (h a 2h)', val: presiones.techoZona3 },
              { label: 'Zona 4 (> 2h)', val: presiones.techoZona4 },
            ].map((z, i) => (
              <div key={i} className={`p-3 rounded-lg border ${z.val >= 0 ? 'bg-amber-50 border-amber-200' : 'bg-teal-50 border-teal-200'}`}>
                <p className="text-xs text-slate-500">{z.label}</p>
                <p className="text-xl font-bold">{z.val.toFixed(2)}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Áreas y Fuerzas */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">Fuerzas Resultantes F = p × A</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-1 text-slate-500">Superficie</th>
                  <th className="text-right py-1 text-slate-500">Área (m²)</th>
                  <th className="text-right py-1 text-slate-500">p (kgf/m²)</th>
                  <th className="text-right py-1 text-slate-500">F (kgf)</th>
                  <th className="text-right py-1 text-slate-500">F (ton)</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="py-1">Muro barlovento</td>
                  <td className="text-right">{areas.muroBarloSota.toFixed(1)}</td>
                  <td className="text-right">{presiones.muroBarlovento.toFixed(2)}</td>
                  <td className="text-right">{fuerzas.detalleHorizontal.barlovento.toFixed(1)}</td>
                  <td className="text-right">{(fuerzas.detalleHorizontal.barlovento / 1000).toFixed(3)}</td>
                </tr>
                <tr className="border-b">
                  <td className="py-1">Muro sotavento</td>
                  <td className="text-right">{areas.muroBarloSota.toFixed(1)}</td>
                  <td className="text-right">{presiones.muroSotavento.toFixed(2)}</td>
                  <td className="text-right">{fuerzas.detalleHorizontal.sotavento.toFixed(1)}</td>
                  <td className="text-right">{(fuerzas.detalleHorizontal.sotavento / 1000).toFixed(3)}</td>
                </tr>
                <tr className="border-b">
                  <td className="py-1">Muros laterales</td>
                  <td className="text-right">{areas.murosLaterales.toFixed(1)}</td>
                  <td className="text-right">{presiones.murosLaterales.toFixed(2)}</td>
                  <td className="text-right">{fuerzas.lateralTotal.toFixed(1)}</td>
                  <td className="text-right">{(fuerzas.lateralTotal / 1000).toFixed(3)}</td>
                </tr>
                {[
                  { label: 'Techo Zona 1 (0 a h/2)', area: areas.techoZona1, p: presiones.techoZona1, f: fuerzas.detalleVertical.zona1 },
                  { label: 'Techo Zona 2 (h/2 a h)', area: areas.techoZona2, p: presiones.techoZona2, f: fuerzas.detalleVertical.zona2 },
                  { label: 'Techo Zona 3 (h a 2h)', area: areas.techoZona3, p: presiones.techoZona3, f: fuerzas.detalleVertical.zona3 },
                  { label: 'Techo Zona 4 (> 2h)', area: areas.techoZona4, p: presiones.techoZona4, f: fuerzas.detalleVertical.zona4 },
                ].map((row, i) => (
                  <tr key={i} className="border-b">
                    <td className="py-1">{row.label}</td>
                    <td className="text-right">{row.area.toFixed(1)}</td>
                    <td className="text-right">{row.p.toFixed(2)}</td>
                    <td className="text-right">{row.f.toFixed(1)}</td>
                    <td className="text-right">{(row.f / 1000).toFixed(3)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Separator className="my-3" />

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200">
              <p className="text-xs text-emerald-600 mb-1">∑ Resultante Horizontal</p>
              <p className="text-xl font-bold text-emerald-800">{fuerzas.horizontal.toFixed(1)} kgf</p>
              <p className="text-xs text-emerald-600">{(fuerzas.horizontal / 1000).toFixed(3)} ton</p>
            </div>
            <div className="p-3 rounded-lg bg-violet-50 border border-violet-200">
              <p className="text-xs text-violet-600 mb-1">∑ Uplift Vertical (Techo)</p>
              <p className="text-xl font-bold text-violet-800">{fuerzas.vertical.toFixed(1)} kgf</p>
              <p className="text-xs text-violet-600">{(fuerzas.vertical / 1000).toFixed(3)} ton</p>
            </div>
          </div>
        </CardContent>
      </Card>
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

  const { casos, cpCaraCorta, cpCaraLarga } = resultado;

  return (
    <div className="space-y-4">
      <Tabs defaultValue="basicos" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="basicos">Parámetros</TabsTrigger>
          <TabsTrigger value="cp">Cp</TabsTrigger>
          <TabsTrigger value="sprfv">SPRFV (4 Casos)</TabsTrigger>
          <TabsTrigger value="cr">C&R</TabsTrigger>
        </TabsList>

        {/* TAB: PARÁMETROS BÁSICOS */}
        <TabsContent value="basicos" className="space-y-4 mt-4">
          <Card className="border-blue-200">
            <CardHeader className="pb-3 flex flex-row items-center gap-2">
              <Wind className="h-5 w-5 text-blue-600" />
              <CardTitle className="text-base text-blue-800">Parámetros de Cálculo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <ValorResultado label="V (velocidad)" value={resultado.V} unit="m/s" />
                <ValorResultado label="I (importancia)" value={resultado.I} />
                <ValorResultado label="Kd (direccionalidad)" value={resultado.Kd} />
                <ValorResultado label="Kzt (topográfico)" value={resultado.Kzt} />
                <ValorResultado label="Ke (elevación)" value={resultado.Ke} />
                <ValorResultado label="G (ráfaga)" value={resultado.G} />
                <ValorResultado label="Kz (pared)" value={resultado.Kz_pared} />
                <ValorResultado label="GCpi" value={`±${Math.abs(resultado.GCpi_pos).toFixed(2)}`} />
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

          <Card className="border-slate-200 mt-4">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-slate-500" />
                <CardTitle className="text-base font-semibold text-slate-800">
                  Fórmulas Aplicadas: Parámetros Básicos
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="p-3 bg-slate-50 rounded-lg font-mono text-xs md:text-sm overflow-x-auto">
                <p className="text-slate-700 mb-1">
                  <strong>Presión de velocidad:</strong> qz = 0,613 × I × Kz × Kzt × Ke × V²
                </p>
                <p className="text-slate-600 mb-1">
                  qz = 0,613 × {resultado.I.toFixed(2)} × {resultado.Kz_pared.toFixed(3)} × {resultado.Kzt.toFixed(3)} × {resultado.Ke.toFixed(3)} × {resultado.V}²
                </p>
                <p className="text-blue-700 font-semibold">
                  qz = {resultado.qz.toFixed(2)} N/m² = {(resultado.qz / 9.80665).toFixed(2)} kgf/m²
                </p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg font-mono text-xs md:text-sm overflow-x-auto">
                <p className="text-slate-700 mb-1">
                  <strong>Factor topográfico:</strong> Kzt = (1 + K1 × K2 × K3)²
                </p>
                <p className="text-blue-700 font-semibold">
                  Kzt = {resultado.Kzt.toFixed(3)}
                </p>
              </div>
              {resultado.Ri < 1 && (
                <div className="p-3 bg-slate-50 rounded-lg font-mono text-xs md:text-sm overflow-x-auto">
                  <p className="text-slate-700 mb-1">
                    <strong>Factor de reducción:</strong> Ri = 1 / (1 + 0,0116 × (Aog/Vi)^(-0,5))
                  </p>
                  <p className="text-amber-700 font-semibold">
                    Ri = {resultado.Ri.toFixed(3)} (aplicado a GCpi)
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB: Cp */}
        <TabsContent value="cp" className="space-y-4 mt-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Coeficientes de Presión Cp — Resumen</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 text-slate-500">Superficie</th>
                      <th className="text-left py-2 text-slate-500">Usar con</th>
                      <th className="text-center py-2 text-slate-500">⊥ Cara Corta<br/><span className="text-xs">(L/B={cpCaraCorta.ratioLB.toFixed(2)})</span></th>
                      <th className="text-center py-2 text-slate-500">⊥ Cara Larga<br/><span className="text-xs">(L/B={cpCaraLarga.ratioLB.toFixed(2)})</span></th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b font-medium bg-slate-50"><td colSpan={4} className="py-1 text-xs text-slate-500">MUROS</td></tr>
                    <tr className="border-b">
                      <td className="py-1">Barlovento</td>
                      <td className="py-1"><Badge variant="outline" className="text-xs">qz</Badge></td>
                      <td className="text-center font-semibold">{cpCaraCorta.muros.barlovento.toFixed(2)}</td>
                      <td className="text-center font-semibold">{cpCaraLarga.muros.barlovento.toFixed(2)}</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-1">Sotavento</td>
                      <td className="py-1"><Badge variant="outline" className="text-xs">qh</Badge></td>
                      <td className="text-center font-semibold">{cpCaraCorta.muros.sotavento.toFixed(2)}</td>
                      <td className="text-center font-semibold">{cpCaraLarga.muros.sotavento.toFixed(2)}</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-1">Muro Lateral</td>
                      <td className="py-1"><Badge variant="outline" className="text-xs">qh</Badge></td>
                      <td className="text-center font-semibold">{cpCaraCorta.muros.laterales.toFixed(2)}</td>
                      <td className="text-center font-semibold">{cpCaraLarga.muros.laterales.toFixed(2)}</td>
                    </tr>

                    {cpCaraCorta.techoPlano && (
                      <>
                        <tr className="border-b font-medium bg-slate-50"><td colSpan={4} className="py-1 text-xs text-slate-500">TECHO PLANO (θ &lt; 10°) — Caso 1 Máx Succión</td></tr>
                        {[
                          { key: 'zona1', label: 'Zona 1 (0 a h/2)' },
                          { key: 'zona2', label: 'Zona 2 (h/2 a h)' },
                          { key: 'zona3', label: 'Zona 3 (h a 2h)' },
                          { key: 'zona4', label: 'Zona 4 (> 2h)' },
                        ].map((z) => (
                          <tr key={z.key} className="border-b">
                            <td className="py-1">{z.label}</td>
                            <td className="py-1"><Badge variant="outline" className="text-xs">qh</Badge></td>
                            <td className="text-center font-semibold">{cpCaraCorta.techoPlano![z.key as keyof typeof cpCaraCorta.techoPlano].toFixed(2)}</td>
                            <td className="text-center font-semibold">{cpCaraLarga.techoPlano?.[z.key as keyof typeof cpCaraLarga.techoPlano]?.toFixed(2) ?? '—'}</td>
                          </tr>
                        ))}
                      </>
                    )}

                    {cpCaraCorta.techoPendiente && (
                      <>
                        <tr className="border-b font-medium bg-slate-50"><td colSpan={4} className="py-1 text-xs text-slate-500">TECHO CON PENDIENTE (θ ≥ 10°)</td></tr>
                        <tr className="border-b">
                          <td className="py-1">Barlovento (Succión)</td>
                          <td className="py-1"><Badge variant="outline" className="text-xs">qh</Badge></td>
                          <td className="text-center font-semibold">{cpCaraCorta.techoPendiente.barloventoSuccion.toFixed(2)}</td>
                          <td className="text-center font-semibold">{cpCaraLarga.techoPendiente?.barloventoSuccion.toFixed(2) ?? '—'}</td>
                        </tr>
                        <tr className="border-b">
                          <td className="py-1">Barlovento (Presión)</td>
                          <td className="py-1"><Badge variant="outline" className="text-xs">qh</Badge></td>
                          <td className="text-center font-semibold">{cpCaraCorta.techoPendiente.barloventoPresion.toFixed(2)}</td>
                          <td className="text-center font-semibold">{cpCaraLarga.techoPendiente?.barloventoPresion.toFixed(2) ?? '—'}</td>
                        </tr>
                        <tr className="border-b">
                          <td className="py-1">Sotavento</td>
                          <td className="py-1"><Badge variant="outline" className="text-xs">qh</Badge></td>
                          <td className="text-center font-semibold">{cpCaraCorta.techoPendiente.sotavento.toFixed(2)}</td>
                          <td className="text-center font-semibold">{cpCaraLarga.techoPendiente?.sotavento.toFixed(2) ?? '—'}</td>
                        </tr>
                      </>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 mt-4">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-slate-500" />
                <CardTitle className="text-base font-semibold text-slate-800">
                  Fórmulas Aplicadas: Coeficientes Cp
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="p-3 bg-slate-50 rounded-lg font-mono text-xs md:text-sm overflow-x-auto">
                <p className="text-slate-700 mb-1">
                  <strong>Relaciones dimensionales:</strong> L/B y h/L
                </p>
                <p className="text-slate-600 mb-1">
                  Cara corta (⊥ B): L/B = {cpCaraCorta.ratioLB.toFixed(2)} | h/L = {cpCaraCorta.ratioHL.toFixed(2)}
                </p>
                <p className="text-slate-600 mb-1">
                  Cara larga (⊥ L): L/B = {cpCaraLarga.ratioLB.toFixed(2)} | h/L = {cpCaraLarga.ratioHL.toFixed(2)}
                </p>
                <p className="text-slate-700 mt-2">
                  * El Cp de Sotavento y del Techo se determinan interpolando en la Figura 4 de la NCh432 según las relaciones L/B y h/L respectivas.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB: SPRFV — 4 CASOS */}
        <TabsContent value="sprfv" className="space-y-4 mt-4">
          <Tabs defaultValue="wx_pos" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="wx_pos">{casos.Wx_pos.nombre}</TabsTrigger>
              <TabsTrigger value="wx_neg">{casos.Wx_neg.nombre}</TabsTrigger>
              <TabsTrigger value="wy_pos">{casos.Wy_pos.nombre}</TabsTrigger>
              <TabsTrigger value="wy_neg">{casos.Wy_neg.nombre}</TabsTrigger>
            </TabsList>
            <TabsContent value="wx_pos" className="mt-3"><CasoVientoPanel caso={casos.Wx_pos} /></TabsContent>
            <TabsContent value="wx_neg" className="mt-3"><CasoVientoPanel caso={casos.Wx_neg} /></TabsContent>
            <TabsContent value="wy_pos" className="mt-3"><CasoVientoPanel caso={casos.Wy_pos} /></TabsContent>
            <TabsContent value="wy_neg" className="mt-3"><CasoVientoPanel caso={casos.Wy_neg} /></TabsContent>
          </Tabs>

          <Alert className="bg-blue-50 border-blue-200 mt-4">
            <Info className="h-4 w-4 text-blue-600" />
            <AlertTitle className="text-blue-800 text-sm">Convención de signos</AlertTitle>
            <AlertDescription className="text-blue-700 text-sm">
              (+) = presión hacia la superficie (empuje). (−) = succión (alejándose de la superficie).
            </AlertDescription>
          </Alert>

          <Card className="border-slate-200 mt-4">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-slate-500" />
                <CardTitle className="text-base font-semibold text-slate-800">
                  Fórmulas Aplicadas: Presión de Diseño SPRFV
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="p-3 bg-slate-50 rounded-lg font-mono text-xs md:text-sm overflow-x-auto">
                <p className="text-slate-700 mb-1">
                  <strong>Presión de diseño neta:</strong> p = q × Kd × G × Cp − qi × Kd × (GCpi)
                </p>
                <p className="text-slate-600 mb-1">
                  Kd = {resultado.Kd} | G = {resultado.G} | qi = {(resultado.qi / 9.80665).toFixed(2)} kgf/m²
                </p>
                <p className="text-slate-700 mt-2">
                  <strong>Fuerzas:</strong> F = p × A
                </p>
                <p className="text-slate-600">
                  Donde A es el área tributaria de la superficie en metros cuadrados (m²). Las cargas resultantes se calculan combinando la presión externa con la presión interna correspondiente.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB: C&R */}
        <TabsContent value="cr" className="space-y-4 mt-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Componentes y Revestimiento</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  { label: 'Muros - Borde/Zona 4', val: resultado.presionesCR.muros, color: 'violet' },
                  { label: 'Techo - Borde/Zona 2', val: resultado.presionesCR.techoBorde, color: 'pink' },
                  { label: 'Techo - Interior/Zona 1', val: resultado.presionesCR.techoInterior, color: 'cyan' },
                  { label: 'Esquinas/Zona 3', val: resultado.presionesCR.esquinas, color: 'rose' },
                ].map((item, i) => (
                  <div key={i} className={`p-4 rounded-lg bg-${item.color}-50 border border-${item.color}-200`}>
                    <Badge className={`bg-${item.color}-600 text-xs`}>{item.label}</Badge>
                    <p className="text-3xl font-bold mt-2">{(item.val / 9.80665).toFixed(2)}</p>
                    <p className="text-xs text-slate-500 mt-1">kgf/m²</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 mt-4">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-slate-500" />
                <CardTitle className="text-base font-semibold text-slate-800">
                  Fórmulas Aplicadas: Componentes y Revestimiento
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="p-3 bg-slate-50 rounded-lg font-mono text-xs md:text-sm overflow-x-auto">
                <p className="text-slate-700 mb-1">
                  <strong>Módulo en desarrollo</strong>
                </p>
                <p className="text-slate-600">
                  Las presiones mostradas para Componentes y Revestimiento utilizan GCp simplificados representativos. Próximamente se implementarán las curvas detalladas según las zonas de techo y muros para C&R.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
