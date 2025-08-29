'use client';

import React, { useState, useMemo } from 'react';
import Plot from 'react-plotly.js';
import { Layout, PlotHoverEvent, Data } from 'plotly.js';

// 1. Geração de dados de exemplo
interface TraceData {
  x: string[];
  y: number[];
  name: string;
  type: 'scatter';
  mode: 'lines+markers';
  yaxis: string;
  marker: { color: string };
  line?: { width: number };
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
      y: Array.from({ length: points }, () => 15 + Math.random() * 20), // 15 a 35
      name: 'Temperatura (°C)',
      type: 'scatter',
      mode: 'lines+markers',
      yaxis: 'y1', // Associado ao primeiro eixo Y
      marker: { color: '#ff7f0e' },
      line: { width: 2 }
    },
    velocidadeVento: {
      x: x_labels,
      y: Array.from({ length: points }, () => Math.random() * 20), // 0 a 20
      name: 'Velocidade (m/s)',
      type: 'scatter',
      mode: 'lines+markers',
      yaxis: 'y2', // Associado ao segundo eixo Y
      marker: { color: '#1f77b4' },
      line: { width: 2 }
    },
    direcaoVento: {
      x: x_labels,
      y: Array.from({ length: points }, () => Math.random() * 360), // 0 a 360
      name: 'Direção (°)',
      type: 'scatter',
      mode: 'lines+markers',
      yaxis: 'y3', // Associado ao terceiro eixo Y
      marker: { color: '#2ca02c' },
      line: { width: 2 }
    },
  };
};

const allTracesData = generateSampleData();

const PlotlyMultiAxisChart = () => {
  // 2. Estado para controlar quais "traces" (curvas) estão visíveis
  const [visibleTraces, setVisibleTraces] = useState<string[]>(['temperatura']);
  
  // Estado adicional para a funcionalidade de hover
  const [hoveredTraceKey, setHoveredTraceKey] = useState<string | null>(null);

  const handleTraceToggle = (traceKey: string) => {
    setVisibleTraces(prev => {
      const isVisible = prev.includes(traceKey);
      if (isVisible) {
        // Remove a curva se ela já estiver visível
        return prev.filter(t => t !== traceKey);
      } else {
        // Adiciona a curva se ela não estiver visível
        return [...prev, traceKey];
      }
    });
  };

  // 3. Lógica para construir o layout dinâmico
  const layout = useMemo(() => {
    const baseLayout: Partial<Layout> = {
      title: {
        text: 'Monitoramento Meteorológico Interativo',
        font: { size: 24 }
      },
      autosize: true,
      xaxis: { 
        title: {
          text: 'Hora'
        }
      },
      // Configurações iniciais para os 3 eixos Y possíveis
      yaxis: {
        title: {
          text: 'Temperatura (°C)',
          font: { color: '#ff7f0e' }
        },
        visible: false, // Começa invisível
        tickfont: { color: '#ff7f0e' },
      },
      yaxis2: {
        title: {
          text: 'Velocidade (m/s)',
          font: { color: '#1f77b4' }
        },
        visible: false, // Começa invisível
        overlaying: 'y',
        side: 'right',
        anchor: 'x',
        tickfont: { color: '#1f77b4' },
      },
      yaxis3: {
        title: {
          text: 'Direção (°)',
          font: { color: '#2ca02c' }
        },
        visible: false, // Começa invisível
        overlaying: 'y',
        side: 'right',
        anchor: 'free',
        position: 1.0, // Posiciona um pouco mais à direita
        tickfont: { color: '#2ca02c' },
      },
      legend: { 
        x: 0.1, 
        y: 1.15, 
        orientation: 'h'
      },
      margin: { r: 120 }, // Adiciona margem para acomodar múltiplos eixos
      hovermode: 'closest',
      paper_bgcolor: 'rgba(0,0,0,0)',
      plot_bgcolor: 'rgba(255,255,255,0.9)',
    };

    // A MÁGICA ACONTECE AQUI!
    // Prioriza o hover sobre a seleção por botão
    if (hoveredTraceKey) {
      // Se temos uma linha em hover, mostra seu eixo Y
      const traceYAxis = allTracesData[hoveredTraceKey].yaxis;
      const axisKey = traceYAxis === 'y1' ? 'yaxis' : traceYAxis.replace('y', 'yaxis');
      
      if (axisKey === 'yaxis' && baseLayout.yaxis) {
        baseLayout.yaxis.visible = true;
      } else if (axisKey === 'yaxis2' && baseLayout.yaxis2) {
        baseLayout.yaxis2.visible = true;
      } else if (axisKey === 'yaxis3' && baseLayout.yaxis3) {
        baseLayout.yaxis3.visible = true;
      }
    } else if (visibleTraces.length === 1) {
      // Se não temos hover, mas temos apenas uma curva selecionada, mostra seu eixo Y
      const singleTraceKey = visibleTraces[0];
      const traceYAxis = allTracesData[singleTraceKey].yaxis;
      const axisKey = traceYAxis === 'y1' ? 'yaxis' : traceYAxis.replace('y', 'yaxis');
      
      if (axisKey === 'yaxis' && baseLayout.yaxis) {
        baseLayout.yaxis.visible = true;
      } else if (axisKey === 'yaxis2' && baseLayout.yaxis2) {
        baseLayout.yaxis2.visible = true;
      } else if (axisKey === 'yaxis3' && baseLayout.yaxis3) {
        baseLayout.yaxis3.visible = true;
      }
    }
    
    // Se houver 0 ou mais de 1 curva visível e não houver hover, todos os eixos permanecem com `visible: false`
    
    return baseLayout;
  }, [visibleTraces, hoveredTraceKey]);

  // Combina a funcionalidade de hover com a seleção por botão
  const dataToPlot: Partial<Data>[] = useMemo(() => {
    let tracesToShow: string[];
    
    if (hoveredTraceKey) {
      // Se temos uma linha em hover, mostra apenas essa linha
      tracesToShow = [hoveredTraceKey];
    } else {
      // Caso contrário, mostra todas as linhas selecionadas pelos botões
      tracesToShow = visibleTraces;
    }
    
    return tracesToShow.map(key => {
      const trace = allTracesData[key];
      
      // Se temos hover, destaca a linha em hover com uma linha mais grossa
      if (hoveredTraceKey === key) {
        return {
          ...trace,
          line: {
            ...trace.line,
            width: 4 // Linha mais grossa para destaque
          }
        };
      }
      
      // Caso contrário, mostra a linha normalmente
      return trace;
    });
  }, [visibleTraces, hoveredTraceKey]);

  return (
    <div style={{ width: '100%', fontFamily: 'Arial, sans-serif' }}>
      <div style={{ marginBottom: '20px', textAlign: 'center' }}>
        <h3>Controles do Gráfico</h3>
        <p>Selecione uma única curva para ver seu eixo Y. Passe o mouse sobre uma linha para isolá-la.</p>
        {Object.keys(allTracesData).map(key => (
          <button
            key={key}
            onClick={() => handleTraceToggle(key)}
            style={{
              margin: '5px',
              padding: '10px 15px',
              cursor: 'pointer',
              border: '1px solid #ccc',
              backgroundColor: visibleTraces.includes(key) ? '#d4edda' : '#f8f9fa',
              fontWeight: visibleTraces.includes(key) ? 'bold' : 'normal',
              color: allTracesData[key].marker.color,
              borderColor: visibleTraces.includes(key) ? allTracesData[key].marker.color : '#ccc'
            }}
          >
            {allTracesData[key].name}
          </button>
        ))}
      </div>
      
      <Plot
        data={dataToPlot}
        layout={layout}
        style={{ width: '100%', height: '500px' }}
        useResizeHandler={true}
        config={{ responsive: true, displayModeBar: false }}
        onHover={(event: PlotHoverEvent) => {
          if (event.points && event.points.length > 0) {
            const traceName = event.points[0].data.name;
            const key = Object.keys(allTracesData).find(k => allTracesData[k].name === traceName);
            if (key) {
              setHoveredTraceKey(key);
            }
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