import CanvasChartWrapper from "../components/CanvasChartWrapper";

export default function CanvasPage() {
  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <main className="flex flex-col gap-[32px] row-start-2 items-center w-full">
        <h1 className="text-3xl font-bold">Gráfico Multi Eixo Y com Canvas</h1>
        <div className="flex flex-col items-center gap-2 mb-4">
          <p className="text-gray-600 text-lg">
            Funcionalidades implementadas:
          </p>
          <ul className="list-disc text-left pl-5 text-gray-600 mb-4">
            <li>Múltiplos eixos Y com cores correspondentes</li>
            <li>Highlight de uma série ao passar o mouse</li>
            <li>Zoom com roda do mouse</li>
            <li>Zoom por seleção de área (novo!)</li>
            <li>Navegação por arrastar (pan)</li>
          </ul>
        </div>
        <div className="flex gap-4 mb-8">
          <a 
            href="/" 
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Ver versão Plotly
          </a>
        </div>
        <CanvasChartWrapper />
      </main>
    </div>
  );
}