'use client'; // Diretiva para indicar que este é um Componente de Cliente

import React, { useState, useMemo } from 'react';
import Plot from 'react-plotly.js';
import { Layout, PlotHoverEvent } from 'plotly.js';

// As interfaces TypeScript e a geração de dados permanecem as mesmas
interface TraceData {
  x: string[];
  y: number[];
  name: string;
  type: 'scatter';
  mode: 'lines+markers';
  yaxis: string;
  marker: { color: string };
}

interface TracesData {
  temperatura: TraceData;
  velocidadeVento: TraceData;
  direcaoVento: TraceData;
  [key: string]: TraceData;
}

const generateSampleData = (): TracesData => {
  const points = 15;
  const x_labels = Array.from({ length: points }, (_, i) => `12:${i * 5 < 10 ? '0' : ''}${i * 5}`);
  
  return {
    temperatura: {
      x: x_labels,
      y: Array.from({ length: points }, () => 15 + Math.random() * 20),
      name: 'Temperatura (°C)',
      type: 'scatter',
      mode: 'lines+markers',
      yaxis: 'y1',
      marker: { color: '#ff7f0e' }
    },
    velocidadeVento: {
      x: x_labels,
      y: Array.from({ length: points }, () => Math.random() * 20),
      name: 'Velocidade (m/s)',
      type: 'scatter',
      mode: 'lines+markers',
      yaxis: 'y2',
      marker: { color: '#1f77b4' }
    },
    direcaoVento: {
      x: x_labels,
      y: Array.from({ length: points }, () => Math.random() * 360),
      name: 'Direção (°)',
      type: 'scatter',
      mode: 'lines+markers',
      yaxis: 'y3',
      marker: { color: '#2ca02c' }
    },
  };
};

const allTracesData = generateSampleData();

const PlotlyMultiAxisChart = () => {
  // MUDANÇA 1: Usar um estado para a curva em hover, em vez de um array de visíveis
  const [hoveredTraceKey, setHoveredTraceKey] = useState<string | null>(null);

  // MUDANÇA 2: O layout agora depende de 'hoveredTraceKey'
  const layout = useMemo(() => {
    const baseLayout: Partial<Layout> = {
      title: {
        text: 'Monitoramento Meteorológico Interativo',
        font: { size: 24 }
      },
      autosize: true,
      hovermode: 'x unified', // Melhora a experiência de hover com múltiplas linhas
      xaxis: { title: { text: 'Hora' } },
      yaxis: {
        title: { text: 'Temperatura (°C)', font: { color: '#ff7f0e' } },
        visible: false,
        tickfont: { color: '#ff7f0e' },
      },
      yaxis2: {
        title: { text: 'Velocidade (m/s)', font: { color: '#1f77b4' } },
        visible: false,
        overlaying: 'y',
        side: 'right',
        anchor: 'x',
        tickfont: { color: '#1f77b4' },
      },
      yaxis3: {
        title: { text: 'Direção (°)', font: { color: '#2ca02c' } },
        visible: false,
        overlaying: 'y',
        side: 'right',
        anchor: 'free',
        position: 1.0,
        tickfont: { color: '#2ca02c' },
      },
      legend: { x: 0.1, y: 1.15, orientation: 'h' },
      margin: { r: 120, l: 80, t: 100 },
      paper_bgcolor: 'rgba(0,0,0,0)',
      plot_bgcolor: 'rgba(255,255,255,0.9)'
    };

    // MUDANÇA 3: A lógica agora verifica se existe uma curva em hover
    if (hoveredTraceKey) {
      const traceYAxis = allTracesData[hoveredTraceKey]?.yaxis; // 'y1', 'y2', ou 'y3'
      if (traceYAxis) {
        const axisKey = traceYAxis === 'y1' ? 'yaxis' : traceYAxis.replace('y', 'yaxis');
        
        if (axisKey === 'yaxis' && baseLayout.yaxis) baseLayout.yaxis.visible = true;
        else if (axisKey === 'yaxis2' && baseLayout.yaxis2) baseLayout.yaxis2.visible = true;
        else if (axisKey === 'yaxis3' && baseLayout.yaxis3) baseLayout.yaxis3.visible = true;
      }
    }

    return baseLayout;
  }, [hoveredTraceKey]);

  // MUDANÇA 4: Todas as curvas são sempre enviadas para o gráfico
  const dataToPlot = Object.values(allTracesData);

  return (
    <div style={{ width: '100%', fontFamily: 'Arial, sans-serif' }}>
      <div style={{ marginBottom: '20px', textAlign: 'center' }}>
        {/* MUDANÇA 5: Instruções atualizadas, botões removidos */}
        <h3>Passe o mouse sobre uma linha</h3>
        <p>O eixo Y correspondente aparecerá em evidência.</p>
      </div>
      
      <Plot
        data={dataToPlot}
        layout={layout}
        style={{ width: '100%', height: '500px' }}
        useResizeHandler={true}
        config={{ responsive: true, displayModeBar: false }}
        // MUDANÇA 6: Adicionados os eventos onHover e onUnhover
        onHover={(event: PlotHoverEvent) => {
          if (event.points.length > 0) {
            // Pega o nome da curva do ponto em hover
            const traceName = event.points[0].data.name;
            // Encontra a chave correspondente em nossos dados
            const key = Object.keys(allTracesData).find(k => allTracesData[k].name === traceName);
            setHoveredTraceKey(key || null);
          }
        }}
        onUnhover={() => {
          setHoveredTraceKey(null);
        }}
      />
    </div>
  );
};

export default PlotlyMultiAxisChart;