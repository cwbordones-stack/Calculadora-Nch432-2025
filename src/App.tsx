import { useCalculadora } from '@/hooks/useCalculadora';
import { PanelParametros } from '@/sections/PanelParametros';
import { PanelResultados } from '@/sections/PanelResultados';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calculator, BookOpen, FileText } from 'lucide-react';

function App() {
  const { params, updateParam, resultado } = useCalculadora();

  return (
    <div className="min-h-screen bg-slate-100">
      {/* HEADER */}
      <header className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 md:px-6 md:py-5">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-600 rounded-lg">
                <Calculator className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-slate-900">
                  Calculadora NCh432:2025
                </h1>
                <p className="text-sm text-slate-500">Diseño estructural — Cargas de viento</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                Procedimiento Direccional
              </Badge>
              <Badge variant="outline" className="text-xs bg-slate-50 text-slate-600 border-slate-200">
                SPRFV + C&R
              </Badge>
            </div>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="max-w-7xl mx-auto px-4 py-6 md:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* PANEL IZQUIERDO: PARÁMETROS */}
          <div className="lg:col-span-5">
            <div className="sticky top-6">
              <Card className="border-slate-200">
                <CardHeader className="pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-slate-500" />
                    <CardTitle className="text-base font-semibold text-slate-800">
                      Parámetros de Entrada
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="pt-4">
                  <PanelParametros params={params} updateParam={updateParam} />
                </CardContent>
              </Card>
            </div>
          </div>

          {/* PANEL DERECHO: RESULTADOS */}
          <div className="lg:col-span-7">
            <PanelResultados resultado={resultado} />

            {/* RESUMEN NUMÉRICO */}
            {resultado && (
              <Card className="mt-4 border-slate-200">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-slate-500" />
                    <CardTitle className="text-base font-semibold text-slate-800">
                      Resumen de Fórmulas Aplicadas
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
                      <strong>Presión de diseño SPRFV:</strong> p = q × Kd × G × Cp − qi × Kd × (GCpi)
                    </p>
                    <p className="text-slate-600 mb-1">
                      Kd = {resultado.Kd} | G = {resultado.G} | GCpi = ±{Math.abs(resultado.GCpi_pos).toFixed(2)}
                    </p>
                    <p className="text-emerald-700 font-semibold">
                      Barlovento: p = {(resultado.presiones.barlovento / 9.80665).toFixed(2)} kgf/m²
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
            )}

            {/* DISCLAIMER */}
            <Card className="mt-4 border-amber-200 bg-amber-50">
              <CardContent className="pt-4">
                <p className="text-xs text-amber-800">
                  <strong>Nota importante:</strong> Esta calculadora es una herramienta de ayuda basada en la NCh432:2025. 
                  Los resultados deben ser verificados por un profesional competente. Los coeficientes Cp y GCp aplicados 
                  son valores representativos; para estructuras específicas consulte las tablas y figuras detalladas de la norma. 
                  Esta herramienta no reemplaza el juicio profesional ni el análisis estructural detallado.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="bg-white border-t border-slate-200 mt-8">
        <div className="max-w-7xl mx-auto px-4 py-4 md:px-6">
          <p className="text-xs text-center text-slate-400">
            Calculadora NCh432:2025 — Basada en la Norma Chilena NCh432:2025 "Diseño estructural — Cargas de viento" 
            | © INN 2025
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
