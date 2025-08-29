'use client';

import React from 'react';
import Plot from 'react-plotly.js';

// Dados de exemplo, separados por eixo para facilitar o uso no Plotly
const timeValues = ['10:00', '11:00', '12:00', '13:00', '14:00', '15:00'];
const airTempValues = [22, 24, 25, 26, 24, 23];
const windSpeedValues = [5, 7, 8, 6, 9, 7];
const windDirValues = [180, 195, 210, 205, 220, 215];

const PlotlyMultiAxisChart = () => {

  // 1. Definir os TRACES (as linhas)
  const traces = [
    // Trace 1: Temperatura (usará o eixo y padrão, à esquerda)
    {
      x: timeValues,
      y: airTempValues,
      name: 'Air Temp (°C)',
      type: 'scatter' as const,
      mode: 'lines+markers' as const,
      line: { color: '#8884d8' }
    },
    // Trace 2: Velocidade do Vento (associado ao eixo y2, à direita)
    {
      x: timeValues,
      y: windSpeedValues,
      name: 'Wind Speed (m/s)',
      type: 'scatter' as const,
      mode: 'lines+markers' as const,
      yaxis: 'y2', // <-- AQUI está a mágica!
      line: { color: '#82ca9d' }
    },
    // Trace 3: Direção do Vento (associado ao eixo y3, também à direita)
    {
      x: timeValues,
      y: windDirValues,
      name: 'Wind Dir (angle)',
      type: 'scatter' as const,
      mode: 'lines+markers' as const,
      yaxis: 'y3', // <-- Associando ao terceiro eixo
      line: { color: '#ffc658' }
    }
  ];

  // 2. Definir o LAYOUT (a aparência e os eixos)
  const layout = {
    title: { 
      text: 'Monitoramento do Tempo',
      font: { size: 24 }
    },
    // Configuração para o domínio do eixo X para dar espaço aos eixos Y
    xaxis: { 
      title: { text: 'Hora' },
      domain: [0.15, 0.85] // Dar espaço dos dois lados para os eixos Y
    },
    // Margens para dar espaço suficiente ao redor do gráfico
    margin: { r: 80, t: 80, b: 50, l: 80 },
    autosize: true,
    
    // Eixo Y 1 (temperatura, à esquerda - principal)
    yaxis: {
      title: {
        text: 'Air Temp (°C)',
        font: { color: '#8884d8', size: 14 }
      },
      tickfont: { color: '#8884d8' },
      gridcolor: 'rgba(136, 132, 216, 0.1)',
      zeroline: false
    },
    
    // Eixo Y 2 (velocidade do vento, à direita)
    yaxis2: {
      title: {
        text: 'Wind Speed (m/s)',
        font: { color: '#82ca9d', size: 14 }
      },
      tickfont: { color: '#82ca9d' },
      anchor: 'x' as const, // Ancorar ao eixo X
      overlaying: 'y' as const,
      side: 'right' as const,
      showgrid: false,
    },
    
    // Eixo Y 3 (direção do vento, lado esquerdo secundário)
    yaxis3: {
      title: {
        text: 'Wind Dir (angle)',
        font: { color: '#ffc658', size: 14 }
      },
      tickfont: { color: '#ffc658' },
      anchor: 'free' as const, // Não ancorado a outro eixo
      overlaying: 'y' as const,
      side: 'left' as const,
      position: 0, // Posicionado na posição 0 (bem à esquerda)
      showgrid: false,
      range: [175, 225] // Limita o range para melhorar a visualização
    },
    
    // Configuração da legenda
    legend: { 
      orientation: 'h' as const, // Horizontal
      y: 1.1, // Posição acima do gráfico
      x: 0.5, // Centralizada horizontalmente
      xanchor: 'center' as const,
      font: { size: 14 }
    },
    
    // Dimensões explícitas para melhor controle do layout
    height: 500,
    paper_bgcolor: 'rgba(0,0,0,0)', // Fundo transparente
    plot_bgcolor: 'rgba(255,255,255,0.9)' // Fundo do gráfico
  };

  return (
    <Plot
      data={traces}
      layout={layout}
      style={{ width: '100%', height: '100%' }}
      useResizeHandler={true} // Torna o gráfico responsivo
      config={{ 
        responsive: true,
        displayModeBar: false // Remove a barra de ferramentas do Plotly
      }}
    />
  );
};

export default PlotlyMultiAxisChart;