'use client';

import React, { useState, useMemo, useRef } from 'react';
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
     aVento: {
      x: x_labels,
      y: Array.from({ length: points }, () => Math.random() * 360), // 0 a 360
      name: 'aVento (°)',
      type: 'scatter',
      mode: 'lines+markers',
      yaxis: 'y4', // Associado ao quarto eixo Y
      marker: { color: '#fffaaa' },
      line: { width: 2 }
    },
    bVento: {
      x: x_labels,
      y: Array.from({ length: points }, () => Math.random() * 360), // 0 a 360
      name: 'bVento (°)',
      type: 'scatter',
      mode: 'lines+markers',
      yaxis: 'y5', // Associado ao quinto eixo Y
      marker: { color: '#8fcffc' },
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
  
  // Estados para controlar o tooltip
  const [tooltip, setTooltip] = useState({
    visible: false,
    x: 0,
    y: 0,
    text: '',
    xValue: '',
    yValues: {} as Record<string, number>
  });
  
  // Referência para o contêiner do gráfico
  const plotContainerRef = useRef<HTMLDivElement>(null);

  // Função para encontrar o ponto mais próximo ao mouse
  const findClosestPoint = (mouseX: number, mouseY: number) => {
    if (!plotContainerRef.current) return null;
    
    const plotRect = plotContainerRef.current.getBoundingClientRect();
    const plotWidth = plotRect.width;
    const plotHeight = plotRect.height;
    
    // Normalizar as coordenadas do mouse para percentuais do gráfico
    const percentX = (mouseX - plotRect.left) / plotWidth;
    
    // Encontrar o índice aproximado baseado na posição X do mouse
    const allTraces = Object.keys(allTracesData);
    if (allTraces.length === 0 || visibleTraces.length === 0) return null;
    
    const firstTrace = allTracesData[allTraces[0]];
    const pointCount = firstTrace.x.length;
    const approximateIndex = Math.floor(percentX * pointCount);
    
    // Limitar o índice ao intervalo válido
    const validIndex = Math.max(0, Math.min(approximateIndex, pointCount - 1));
    
    // Obter o valor X correspondente
    const xValue = firstTrace.x[validIndex];
    
    // Coletar os valores Y para cada trace neste ponto X
    const yValues: Record<string, number> = {};
    visibleTraces.forEach(traceKey => {
      const trace = allTracesData[traceKey];
      yValues[traceKey] = trace.y[validIndex];
    });
    
    return {
      xValue,
      yValues,
      index: validIndex
    };
  };
  
  // Função para lidar com o movimento do mouse no gráfico
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!plotContainerRef.current) return;
    
    const rect = plotContainerRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    // Ignorar movimentos fora da área de plotagem
    if (mouseX < 0 || mouseX > rect.width || mouseY < 0 || mouseY > rect.height) {
      setTooltip(prev => ({ ...prev, visible: false }));
      return;
    }
    
    // Encontrar o ponto mais próximo
    const closestPoint = findClosestPoint(e.clientX, e.clientY);
    if (!closestPoint) return;
    
    // Atualizar o tooltip
    setTooltip({
      visible: true,
      x: mouseX,
      y: mouseY,
      text: 'Ponto mais próximo',
      xValue: closestPoint.xValue,
      yValues: closestPoint.yValues
    });
  };
  
  // Função para controlar quais traces estão visíveis via botões
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

  // Layout
  const layout = useMemo(() => {
    const baseLayout: Partial<Layout> = {
      uirevision:'true',
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
      yaxis4: {
        title: {
          text: 'aVento (°)',
          font: { color: '#fffaaa' }
        },
        visible: false, // Começa invisível
        overlaying: 'y',
        side: 'right',
        anchor: 'free',
        position: 0.85, // Posiciona mais à esquerda que yaxis3
        tickfont: { color: '#fffaaa' },
      },
      yaxis5: {
        title: {
          text: 'bVento (°)',
          font: { color: '#8fcffc' }
        },
        visible: false, // Começa invisível
        overlaying: 'y',
        side: 'right',
        anchor: 'free',
        position: 0.90, // Posiciona entre yaxis4 e yaxis3
        tickfont: { color: '#8fcffc' },
      },
      legend: { 
        x: 0.1, 
        y: 1.15, 
        orientation: 'h'
      },
      margin: { r: 200 }, // Adiciona margem para acomodar múltiplos eixos
      hovermode: 'closest',
      paper_bgcolor: 'rgba(0,0,0,0)',
      plot_bgcolor: 'rgba(255,255,255,0.9)',
      hoverlabel: {
        bgcolor: 'rgba(255,255,255,0.9)',
        font: { size: 14 },
        bordercolor: '#ddd'
      }
    };

    // A MÁGICA ACONTECE AQUI! Bem simplificada agora
    // Trata hover e single selection da mesma forma
    const singleActiveTrace = hoveredTraceKey || (visibleTraces.length === 1 ? visibleTraces[0] : null);
    
    if (singleActiveTrace) {
      // Quando temos apenas um trace ativo (seja por hover ou seleção única), mostra o eixo Y correspondente
      const traceYAxis = allTracesData[singleActiveTrace].yaxis;
      const axisKey = traceYAxis === 'y1' ? 'yaxis' : traceYAxis.replace('y', 'yaxis');
      
      if (axisKey === 'yaxis' && baseLayout.yaxis) {
        baseLayout.yaxis.visible = true;
      } else if (axisKey === 'yaxis2' && baseLayout.yaxis2) {
        baseLayout.yaxis2.visible = true;
      } else if (axisKey === 'yaxis3' && baseLayout.yaxis3) {
        baseLayout.yaxis3.visible = true;
         } else if (axisKey === 'yaxis4' && baseLayout.yaxis4) {
        baseLayout.yaxis4.visible = true;
      } else if (axisKey === 'yaxis5' && baseLayout.yaxis5) {
        baseLayout.yaxis5.visible = true;
      }
    }
    
    return baseLayout;
  }, [visibleTraces, hoveredTraceKey]);

  // Combina a funcionalidade de hover com a seleção por botão
  const dataToPlot: Partial<Data>[] = useMemo(() => {
    // Se temos uma linha em hover, tratamos exatamente como se só ela estivesse selecionada
    const effectiveVisibleTraces = hoveredTraceKey ? [hoveredTraceKey] : visibleTraces;
    
    return effectiveVisibleTraces.map(key => {
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
        <p>Selecione as curvas que deseja visualizar. Passe o mouse sobre uma linha para vê-la isoladamente com seu eixo Y.</p>
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
      
      <div 
        ref={plotContainerRef} 
        style={{ position: 'relative', width: '100%' }}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setTooltip(prev => ({ ...prev, visible: false }))}
      >
        <Plot
          data={dataToPlot}
          layout={layout}
          style={{ width: '100%', height: '500px' }}
          useResizeHandler={true}
          config={{ responsive: true, displayModeBar: false }}
          onHover={(event: PlotHoverEvent) => {
            if (event.points && event.points.length > 0) {
              const point = event.points[0];
              const traceName = point.data.name;
              const xValue = point.x?.toString() || '';
              
              // Encontrar qual trace está sendo hover com base no nome
              const key = Object.keys(allTracesData).find(k => allTracesData[k].name === traceName);
              
              // Importante: só mostra o hover se a linha estiver visível conforme seleção dos botões
              if (key && visibleTraces.includes(key)) {
                setHoveredTraceKey(key);
              }
              
              // Configurar o tooltip com as informações do ponto
              const yValues: Record<string, number> = {};
              
              // Pegar valores de Y para todos os traces visíveis neste ponto X
              visibleTraces.forEach(traceKey => {
                const trace = allTracesData[traceKey];
                const pointIndex = trace.x.indexOf(xValue);
                if (pointIndex !== -1) {
                  yValues[traceKey] = trace.y[pointIndex];
                }
              });
              
              // Definir posição do tooltip baseado no evento do mouse
              const rect = plotContainerRef.current?.getBoundingClientRect();
              if (rect) {
                const x = event.event.clientX - rect.left;
                const y = event.event.clientY - rect.top;
                
                setTooltip({
                  visible: true,
                  x,
                  y,
                  text: traceName,
                  xValue,
                  yValues
                });
              }
            }
          }}
          onUnhover={() => {
            setHoveredTraceKey(null);
            setTooltip(prev => ({ ...prev, visible: false }));
          }}
          onClick={() => {
            setTooltip(prev => ({ ...prev, visible: false }));
          }}
        />
        
        {tooltip.visible && (
          <div 
            style={{
              position: 'absolute',
              left: `${tooltip.x + 10}px`,
              top: `${tooltip.y - 10}px`,
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              border: '1px solid #ccc',
              borderRadius: '6px',
              padding: '10px',
              boxShadow: '0 3px 12px rgba(0,0,0,0.15)',
              zIndex: 1000,
              maxWidth: '250px',
              fontSize: '14px',
              transition: 'all 0.15s ease-in-out'
            }}
          >
            <div style={{ 
              marginBottom: '8px', 
              fontWeight: 'bold', 
              borderBottom: '1px solid #eee',
              paddingBottom: '5px',
              fontSize: '15px'
            }}>
              {tooltip.xValue}
            </div>
            {Object.keys(tooltip.yValues).map(key => (
              <div key={key} style={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                color: allTracesData[key].marker.color,
                padding: '3px 0',
                alignItems: 'center'
              }}>
                <span style={{ display: 'flex', alignItems: 'center' }}>
                  <span style={{
                    display: 'inline-block',
                    width: '10px',
                    height: '10px',
                    backgroundColor: allTracesData[key].marker.color,
                    marginRight: '5px',
                    borderRadius: '50%'
                  }}></span>
                  {allTracesData[key].name}:
                </span>
                <span style={{ 
                  marginLeft: '10px', 
                  fontWeight: 'bold',
                  backgroundColor: 'rgba(0,0,0,0.05)',
                  padding: '2px 6px',
                  borderRadius: '3px'
                }}>
                  {tooltip.yValues[key].toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PlotlyMultiAxisChart;