import CanvasChartWrapper from "../components/CanvasChartWrapper";

export default function CanvasPage() {
  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <main className="flex flex-col gap-[32px] row-start-2 items-center w-full">
        <h1 className="text-3xl font-bold">Gráfico Multi Eixo Y com Canvas</h1>
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