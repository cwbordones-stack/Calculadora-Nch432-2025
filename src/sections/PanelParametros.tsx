import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { ParametrosCalculo, ZonaViento, CategoriaOcupacion, Exposicion, TipoEdificio, TipoEstructuraSPRFV, TipoTecho, ConvencionEjes } from '@/types/nch432';
import { ZONAS_VIENTO, FACTOR_IMPORTANCIA } from '@/lib/nch432';

interface PanelParametrosProps {
  params: ParametrosCalculo;
  updateParam: <K extends keyof ParametrosCalculo>(key: K, value: ParametrosCalculo[K]) => void;
}

export function PanelParametros({ params, updateParam }: PanelParametrosProps) {
  return (
    <div className="space-y-4">
      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="geometria">Geometría</TabsTrigger>
          <TabsTrigger value="topografia">Topografía</TabsTrigger>
          <TabsTrigger value="aberturas">Aberturas</TabsTrigger>
        </TabsList>

        {/* TAB: GENERAL */}
        <TabsContent value="general" className="space-y-4 mt-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold text-slate-800">Zona de Viento y Categoría</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="zona">Zona de Viento</Label>
                  <Select
                    value={params.zona}
                    onValueChange={(v) => updateParam('zona', v as ZonaViento)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(ZONAS_VIENTO).map(([key, val]) => (
                        <SelectItem key={key} value={key}>
                          {key} - {val.nombre} (V={val.V} m/s)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-slate-500">
                    V = {ZONAS_VIENTO[params.zona].V} m/s
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="categoria">Categoría de Ocupación</Label>
                  <Select
                    value={params.categoria}
                    onValueChange={(v) => updateParam('categoria', v as CategoriaOcupacion)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="I">I - Edificaciones de baja importancia</SelectItem>
                      <SelectItem value="II">II - Edificaciones comunes</SelectItem>
                      <SelectItem value="III">III - Edificaciones de alta importancia</SelectItem>
                      <SelectItem value="IV">IV - Edificaciones esenciales</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-slate-500">
                    I = {FACTOR_IMPORTANCIA[params.categoria].I}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold text-slate-800">Exposición y Tipo de Estructura</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="exposicion">Categoría de Exposición</Label>
                  <Select
                    value={params.exposicion}
                    onValueChange={(v) => updateParam('exposicion', v as Exposicion)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="B">B - Urbana/Suburbana/Boscosa</SelectItem>
                      <SelectItem value="C">C - Abierta (por defecto)</SelectItem>
                      <SelectItem value="D">D - Plana sin obstáculos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tipoEstructura">Tipo de Estructura SPRFV</Label>
                  <Select
                    value={params.tipoEstructura}
                    onValueChange={(v) => updateParam('tipoEstructura', v as TipoEstructuraSPRFV)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="rigido">Rígida (f ≥ 1 Hz)</SelectItem>
                      <SelectItem value="flexible">Flexible (f &lt; 1 Hz)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tipoEdificio">Tipo de Edificio</Label>
                  <Select
                    value={params.tipoEdificio}
                    onValueChange={(v) => updateParam('tipoEdificio', v as TipoEdificio)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cerrado">Cerrado</SelectItem>
                      <SelectItem value="parcialmente_cerrado">Parcialmente cerrado</SelectItem>
                      <SelectItem value="parcialmente_abierto">Parcialmente abierto</SelectItem>
                      <SelectItem value="abierto">Abierto</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold text-slate-800">Elevación</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-w-xs">
                <Label htmlFor="elevacionSobreNivelMar">Elevación sobre el nivel del mar (ze) [m]</Label>
                <Input
                  id="elevacionSobreNivelMar"
                  type="number"
                  min="0"
                  value={params.elevacionSobreNivelMar}
                  onChange={(e) => updateParam('elevacionSobreNivelMar', Number(e.target.value))}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB: GEOMETRÍA */}
        <TabsContent value="geometria" className="space-y-4 mt-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold text-slate-800">Dimensiones del Edificio</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="alturaAlero">Altura al alero (h_e) [m]</Label>
                  <Input
                    id="alturaAlero"
                    type="number"
                    min="0"
                    step="0.01"
                    value={params.alturaAlero}
                    onChange={(e) => updateParam('alturaAlero', Number(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="alturaCumbrera">Altura a la cumbrera (h_c) [m]</Label>
                  <Input
                    id="alturaCumbrera"
                    type="number"
                    min="0"
                    step="0.01"
                    value={params.alturaCumbrera}
                    onChange={(e) => updateParam('alturaCumbrera', Number(e.target.value))}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                    <p className="text-xs text-slate-500 mb-1">Altura media h = (h_e + h_c) / 2</p>
                    <p className="text-lg font-semibold text-slate-800">{params.alturaMediaTecho.toFixed(2)} m</p>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                    <p className="text-xs text-slate-500 mb-1">Pendiente θ = atan((h_c−h_e)/(B/2))</p>
                    <p className="text-lg font-semibold text-slate-800">{params.pendienteTecho.toFixed(2)}°</p>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="longitud">Longitud (L) - paralela al viento [m]</Label>
                  <Input
                    id="longitud"
                    type="number"
                    min="0"
                    step="0.1"
                    value={params.longitud}
                    onChange={(e) => updateParam('longitud', Number(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ancho">Ancho (B) - normal al viento [m]</Label>
                  <Input
                    id="ancho"
                    type="number"
                    min="0"
                    step="0.1"
                    value={params.ancho}
                    onChange={(e) => updateParam('ancho', Number(e.target.value))}
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-2 max-w-xs">
                <Label htmlFor="tipoTecho">Tipo de Techo</Label>
                <Select
                  value={params.tipoTecho}
                  onValueChange={(v) => updateParam('tipoTecho', v as TipoTecho)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dos_aguas">A dos aguas</SelectItem>
                    <SelectItem value="pendiente_unica">Pendiente única</SelectItem>
                    <SelectItem value="plano">Plano</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="convencionEjes">Convención de ejes para viento</Label>
                <Select
                  value={params.convencionEjes}
                  onValueChange={(v) => updateParam('convencionEjes', v as ConvencionEjes)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="x_cara_corta">X = ⊥ cara corta (B={params.ancho}m)</SelectItem>
                    <SelectItem value="x_cara_larga">X = ⊥ cara larga (L={params.longitud}m)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-slate-500">
                  Define qué eje (X o Y) corresponde al viento perpendicular a cada cara del edificio.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB: TOPOGRAFÍA */}
        <TabsContent value="topografia" className="space-y-4 mt-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold text-slate-800">Efectos Topográficos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="topografia"
                  checked={params.tieneEfectoTopografico}
                  onCheckedChange={(v) => updateParam('tieneEfectoTopografico', v)}
                />
                <Label htmlFor="topografia">Incluir efecto topográfico (Kzt)</Label>
              </div>

              {params.tieneEfectoTopografico && (
                <div className="space-y-4 pt-2 border-t border-slate-100">
                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="tipoTopografia">Tipo de topografía</Label>
                      <Select
                        value={params.tipoTopografia}
                        onValueChange={(v) => updateParam('tipoTopografia', v as 'cima2d' | 'colina3d' | 'escarpamiento')}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="cima2d">Cima 2D o colina</SelectItem>
                          <SelectItem value="colina3d">Colina axisimétrica 3D</SelectItem>
                          <SelectItem value="escarpamiento">Escarpamiento 2D</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="H">Altura H [m]</Label>
                      <Input
                        id="H"
                        type="number"
                        min="0"
                        step="0.1"
                        value={params.H}
                        onChange={(e) => updateParam('H', Number(e.target.value))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="Lh">Distancia Lh [m]</Label>
                      <Input
                        id="Lh"
                        type="number"
                        min="0.1"
                        step="0.1"
                        value={params.Lh}
                        onChange={(e) => updateParam('Lh', Number(e.target.value))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="x">Distancia x desde cresta [m]</Label>
                      <Input
                        id="x"
                        type="number"
                        step="0.1"
                        value={params.x}
                        onChange={(e) => updateParam('x', Number(e.target.value))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="z_terreno">Altura z sobre terreno local [m]</Label>
                      <Input
                        id="z_terreno"
                        type="number"
                        min="0"
                        step="0.1"
                        value={params.z_terreno}
                        onChange={(e) => updateParam('z_terreno', Number(e.target.value))}
                      />
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB: ABERTURAS */}
        <TabsContent value="aberturas" className="space-y-4 mt-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold text-slate-800">Datos para Clasificación del Cerramiento</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="areaAberturas">Área de aberturas en muro a barlovento (Ao) [m²]</Label>
                  <Input
                    id="areaAberturas"
                    type="number"
                    min="0"
                    step="0.1"
                    value={params.areaAberturas}
                    onChange={(e) => updateParam('areaAberturas', Number(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="areaMuro">Área bruta del muro (Ag) [m²]</Label>
                  <Input
                    id="areaMuro"
                    type="number"
                    min="0.1"
                    step="0.1"
                    value={params.areaMuro}
                    onChange={(e) => updateParam('areaMuro', Number(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="areaAberturasResto">Área aberturas resto envolvente (Aoi) [m²]</Label>
                  <Input
                    id="areaAberturasResto"
                    type="number"
                    min="0"
                    step="0.1"
                    value={params.areaAberturasResto}
                    onChange={(e) => updateParam('areaAberturasResto', Number(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="areaResto">Área bruta resto envolvente (Agi) [m²]</Label>
                  <Input
                    id="areaResto"
                    type="number"
                    min="0.1"
                    step="0.1"
                    value={params.areaResto}
                    onChange={(e) => updateParam('areaResto', Number(e.target.value))}
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-2 max-w-xs">
                <Label htmlFor="volumenInterno">Volumen interno no particionado (Vi) [m³]</Label>
                <Input
                  id="volumenInterno"
                  type="number"
                  min="0"
                  step="1"
                  value={params.volumenInterno}
                  onChange={(e) => updateParam('volumenInterno', Number(e.target.value))}
                />
                <p className="text-xs text-slate-500">Para cálculo del factor de reducción Ri</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
