import { useCalculadora } from '@/hooks/useCalculadora';
import { PanelParametros } from '@/sections/PanelParametros';
import { PanelResultados } from '@/sections/PanelResultados';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calculator, FileText } from 'lucide-react';

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
