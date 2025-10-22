'use client';

import React, { useRef, useEffect, useState, useMemo } from 'react';

// Define os tipos para dados do gráfico
interface DataPoint {
  x: number;
  y: number;
}

interface DataSeries {
  data: DataPoint[];
  name: string;
  color: string;
  axisId: number;
}

// Interface para configuração do eixo Y
interface YAxis {
  id: number;
  title: string;
  color: string;
  min: number;
  max: number;
  position: 'left' | 'right';
  offset: number; // Posição do eixo no layout
}

const CanvasMultiAxisChart: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredSeries, setHoveredSeries] = useState<number | null>(null);
  const [zoom, setZoom] = useState({ scale: 1, offsetX: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [dimensions, setDimensions] = useState({ width: 800, height: 500 });
  
  // Estados para controlar a seleção de área para zoom
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectionStart, setSelectionStart] = useState({ x: 0, y: 0 });
  const [selectionEnd, setSelectionEnd] = useState({ x: 0, y: 0 });
  const [isSelecting, setIsSelecting] = useState(false);

  // Dados de exemplo fixos para evitar atualizações a cada renderização
  const fixedSampleData: DataSeries[] = [
    {
      data: [
        { x: 0, y: 18.5 }, { x: 1, y: 22.3 }, { x: 2, y: 25.8 }, { x: 3, y: 29.1 }, { x: 4, y: 27.6 },
        { x: 5, y: 24.2 }, { x: 6, y: 20.5 }, { x: 7, y: 19.8 }, { x: 8, y: 23.4 }, { x: 9, y: 28.7 },
        { x: 10, y: 33.2 }, { x: 11, y: 30.9 }, { x: 12, y: 26.3 }, { x: 13, y: 21.7 }, { x: 14, y: 19.3 }
      ],
      name: 'Temperatura (°C)',
      color: '#ff7f0e',
      axisId: 1
    },
    {
      data: [
        { x: 0, y: 5.2 }, { x: 1, y: 7.8 }, { x: 2, y: 10.3 }, { x: 3, y: 12.7 }, { x: 4, y: 15.4 },
        { x: 5, y: 13.9 }, { x: 6, y: 11.5 }, { x: 7, y: 8.6 }, { x: 8, y: 6.1 }, { x: 9, y: 9.8 },
        { x: 10, y: 14.2 }, { x: 11, y: 17.5 }, { x: 12, y: 16.1 }, { x: 13, y: 12.8 }, { x: 14, y: 8.9 }
      ],
      name: 'Velocidade (m/s)',
      color: '#1f77b4',
      axisId: 2
    },
    {
      data: [
        { x: 0, y: 45 }, { x: 1, y: 90 }, { x: 2, y: 135 }, { x: 3, y: 180 }, { x: 4, y: 225 },
        { x: 5, y: 270 }, { x: 6, y: 315 }, { x: 7, y: 360 }, { x: 8, y: 315 }, { x: 9, y: 270 },
        { x: 10, y: 225 }, { x: 11, y: 180 }, { x: 12, y: 135 }, { x: 13, y: 90 }, { x: 14, y: 45 }
      ],
      name: 'Direção (°)',
      color: '#2ca02c',
      axisId: 3
    },
    {
      data: [
        { x: 0, y: 320 }, { x: 1, y: 280 }, { x: 2, y: 240 }, { x: 3, y: 200 }, { x: 4, y: 160 },
        { x: 5, y: 120 }, { x: 6, y: 80 }, { x: 7, y: 40 }, { x: 8, y: 80 }, { x: 9, y: 120 },
        { x: 10, y: 160 }, { x: 11, y: 200 }, { x: 12, y: 240 }, { x: 13, y: 280 }, { x: 14, y: 320 }
      ],
      name: 'aVento (°)',
      color: '#fffaaa',
      axisId: 4
    },
    {
      data: [
        { x: 0, y: 180 }, { x: 1, y: 220 }, { x: 2, y: 260 }, { x: 3, y: 300 }, { x: 4, y: 340 },
        { x: 5, y: 300 }, { x: 6, y: 260 }, { x: 7, y: 220 }, { x: 8, y: 180 }, { x: 9, y: 140 },
        { x: 10, y: 100 }, { x: 11, y: 60 }, { x: 12, y: 100 }, { x: 13, y: 140 }, { x: 14, y: 180 }
      ],
      name: 'bVento (°)',
      color: '#8fcffc',
      axisId: 5
    }
  ];

  // Configuração dos eixos Y
  const yAxes: YAxis[] = [
    { id: 1, title: 'Temperatura (°C)', color: '#ff7f0e', min: 0, max: 40, position: 'left', offset: 0 },
    { id: 2, title: 'Velocidade (m/s)', color: '#1f77b4', min: 0, max: 25, position: 'right', offset: 0 },
    { id: 3, title: 'Direção (°)', color: '#2ca02c', min: 0, max: 360, position: 'right', offset: 50 },
    { id: 4, title: 'aVento (°)', color: '#fffaaa', min: 0, max: 360, position: 'right', offset: 100 },
    { id: 5, title: 'bVento (°)', color: '#8fcffc', min: 0, max: 360, position: 'right', offset: 150 }
  ];

  // Utilizando os dados fixos de amostra
  const seriesData = fixedSampleData;

  // Função para desenhar o gráfico
  const drawChart = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Limpar canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Definir margens e área do gráfico
    const margin = { top: 50, right: 180, bottom: 40, left: 60 };
    const chartWidth = canvas.width - margin.left - margin.right;
    const chartHeight = canvas.height - margin.top - margin.bottom;

    // Desenhar fundo do gráfico
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.fillRect(margin.left, margin.top, chartWidth, chartHeight);

    // Desenhar título
    ctx.font = 'bold 18px Arial';
    ctx.textAlign = 'center';
    ctx.fillStyle = 'black';
    ctx.fillText('Monitoramento Meteorológico Interativo', canvas.width / 2, 25);

    // Desenhar eixo X
    ctx.beginPath();
    ctx.moveTo(margin.left, margin.top + chartHeight);
    ctx.lineTo(margin.left + chartWidth, margin.top + chartHeight);
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Aplicar zoom na escala X
    const xScale = (x: number) => {
      const normalizedX = x / (seriesData[0].data.length - 1);
      const zoomedX = normalizedX * zoom.scale + zoom.offsetX;
      return margin.left + zoomedX * chartWidth;
    };

    // Desenhar marcas do eixo X
    const xTicks = 5;
    ctx.textAlign = 'center';
    ctx.font = '12px Arial';
    for (let i = 0; i <= xTicks; i++) {
      const x = i * (seriesData[0].data.length - 1) / xTicks;
      const xPos = xScale(x);
      
      // Verificar se está visível após o zoom
      if (xPos >= margin.left && xPos <= margin.left + chartWidth) {
        ctx.beginPath();
        ctx.moveTo(xPos, margin.top + chartHeight);
        ctx.lineTo(xPos, margin.top + chartHeight + 5);
        ctx.stroke();
        
        // Formatar hora para 12:XX
        const hour = `12:${String(i * 15).padStart(2, '0')}`;
        ctx.fillText(hour, xPos, margin.top + chartHeight + 20);
      }
    }

    // Título do eixo X
    ctx.fillText('Hora', margin.left + chartWidth / 2, margin.top + chartHeight + 35);

    // Desenhar eixos Y e linhas do gráfico
    yAxes.forEach(axis => {
      // Determinar se este eixo está destacado ou não
      const isHighlighted = hoveredSeries === null || 
                         seriesData.findIndex(s => s.axisId === axis.id) === hoveredSeries;
      
      // Opacidade baseada no estado de hover
      const axisOpacity = isHighlighted ? 1.0 : 0.3;
      
      // Posição do eixo Y
      const axisX = axis.position === 'left' 
          ? margin.left 
          : margin.left + chartWidth + axis.offset;

      // Desenhar eixo Y
      ctx.beginPath();
      ctx.moveTo(axisX, margin.top);
      ctx.lineTo(axisX, margin.top + chartHeight);
      ctx.strokeStyle = hexToRgba(axis.color, axisOpacity);
      ctx.lineWidth = isHighlighted ? 2 : 1;
      ctx.stroke();

      // Desenhar título do eixo Y
      ctx.save();
      ctx.translate(axisX, margin.top + chartHeight / 2);
      ctx.rotate(-Math.PI / 2);
      ctx.textAlign = 'center';
      ctx.font = isHighlighted ? 'bold 14px Arial' : '14px Arial';
      ctx.fillStyle = hexToRgba(axis.color, axisOpacity);
      ctx.fillText(axis.title, 0, axis.position === 'left' ? -25 : 15);
      ctx.restore();

      // Desenhar marcas do eixo Y
      const yTicks = 5;
      ctx.textAlign = axis.position === 'left' ? 'right' : 'left';
      ctx.font = '12px Arial';
      
      for (let i = 0; i <= yTicks; i++) {
        const value = axis.min + (i / yTicks) * (axis.max - axis.min);
        const yPos = margin.top + chartHeight - (i / yTicks) * chartHeight;
        
        ctx.beginPath();
        ctx.moveTo(axisX, yPos);
        ctx.lineTo(axis.position === 'left' ? axisX - 5 : axisX + 5, yPos);
        ctx.strokeStyle = hexToRgba(axis.color, axisOpacity);
        ctx.stroke();
        
        ctx.fillStyle = hexToRgba(axis.color, axisOpacity);
        ctx.fillText(
          value.toFixed(1), 
          axis.position === 'left' ? axisX - 10 : axisX + 10, 
          yPos + 4
        );
      }

      // Encontrar a série correspondente a este eixo
      const series = seriesData.find(s => s.axisId === axis.id);
      if (!series) return;

      // Mapear valores da série para coordenadas do canvas
      const seriesIndex = seriesData.findIndex(s => s.axisId === axis.id);
      const isSeriesHighlighted = hoveredSeries === null || hoveredSeries === seriesIndex;
      const lineOpacity = isSeriesHighlighted ? 1.0 : 0.3;
      const lineWidth = isSeriesHighlighted ? 3 : 1.5;
      
      // Função de escala para o eixo Y
      const yScale = (y: number) => {
        const normalizedY = (y - axis.min) / (axis.max - axis.min);
        return margin.top + chartHeight - normalizedY * chartHeight;
      };

      // Desenhar linha
      ctx.beginPath();
      series.data.forEach((point, i) => {
        const x = xScale(point.x);
        const y = yScale(point.y);
        
        if (x >= margin.left && x <= margin.left + chartWidth) {
          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
      });
      ctx.strokeStyle = hexToRgba(series.color, lineOpacity);
      ctx.lineWidth = lineWidth;
      ctx.stroke();
      
      // Desenhar pontos
      series.data.forEach((point, i) => {
        const x = xScale(point.x);
        const y = yScale(point.y);
        
        if (x >= margin.left && x <= margin.left + chartWidth) {
          ctx.beginPath();
          ctx.arc(x, y, isSeriesHighlighted ? 4 : 3, 0, 2 * Math.PI);
          ctx.fillStyle = hexToRgba(series.color, lineOpacity);
          ctx.fill();
        }
      });
    });

    // Desenhar legenda
    const legendX = margin.left;
    const legendY = margin.top - 20;
    
    seriesData.forEach((series, index) => {
      const isHighlighted = hoveredSeries === null || hoveredSeries === index;
      const textOpacity = isHighlighted ? 1.0 : 0.3;
      
      // Posição do item na legenda
      const itemX = legendX + index * 120;
      
      // Desenhar linha da legenda
      ctx.beginPath();
      ctx.moveTo(itemX, legendY);
      ctx.lineTo(itemX + 20, legendY);
      ctx.strokeStyle = hexToRgba(series.color, textOpacity);
      ctx.lineWidth = isHighlighted ? 2 : 1;
      ctx.stroke();
      
      // Desenhar círculo na legenda
      ctx.beginPath();
      ctx.arc(itemX + 10, legendY, 3, 0, 2 * Math.PI);
      ctx.fillStyle = hexToRgba(series.color, textOpacity);
      ctx.fill();
      
      // Desenhar texto da legenda
      ctx.font = isHighlighted ? 'bold 12px Arial' : '12px Arial';
      ctx.textAlign = 'left';
      ctx.fillStyle = hexToRgba(series.color, textOpacity);
      ctx.fillText(series.name, itemX + 25, legendY + 4);
    });
    
    // Desenhar retângulo de seleção se estiver em modo de seleção e estiver selecionando
    if (selectionMode && isSelecting) {
      const x = Math.min(selectionStart.x, selectionEnd.x);
      const y = Math.min(selectionStart.y, selectionEnd.y);
      const width = Math.abs(selectionEnd.x - selectionStart.x);
      const height = Math.abs(selectionEnd.y - selectionStart.y);
      
      // Retângulo semi-transparente com cor mais visível
      ctx.fillStyle = 'rgba(66, 133, 244, 0.25)';
      ctx.fillRect(x, y, width, height);
      
      // Borda do retângulo mais grossa e mais visível
      ctx.strokeStyle = 'rgba(25, 118, 210, 0.9)';
      ctx.lineWidth = 3;
      ctx.strokeRect(x, y, width, height);
      
      // Indicadores de tamanho nos cantos para melhor visibilidade
      ctx.fillStyle = 'rgba(25, 118, 210, 1)';
      const cornerSize = 6;
      ctx.fillRect(x - cornerSize/2, y - cornerSize/2, cornerSize, cornerSize);
      ctx.fillRect(x + width - cornerSize/2, y - cornerSize/2, cornerSize, cornerSize);
      ctx.fillRect(x - cornerSize/2, y + height - cornerSize/2, cornerSize, cornerSize);
      ctx.fillRect(x + width - cornerSize/2, y + height - cornerSize/2, cornerSize, cornerSize);
    }
  };

  // Converter cor hex para rgba
  const hexToRgba = (hex: string, opacity: number): string => {
    // Remover o # se presente
    hex = hex.replace('#', '');
    
    // Converter para RGB
    const r = parseInt(hex.length === 3 ? hex.slice(0, 1).repeat(2) : hex.slice(0, 2), 16);
    const g = parseInt(hex.length === 3 ? hex.slice(1, 2).repeat(2) : hex.slice(2, 4), 16);
    const b = parseInt(hex.length === 3 ? hex.slice(2, 3).repeat(2) : hex.slice(4, 6), 16);
    
    // Retornar como rgba
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  };

  // Encontrar série mais próxima do ponto do mouse
  const findNearestSeries = (x: number, y: number): number | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const rect = canvas.getBoundingClientRect();
    const margin = { top: 40, right: 180, bottom: 40, left: 60 };
    const chartWidth = canvas.width - margin.left - margin.right;
    const chartHeight = canvas.height - margin.top - margin.bottom;
    
    // Converter coordenadas do canvas para valores do gráfico
    const canvasX = x - rect.left;
    const canvasY = y - rect.top;
    
    // Verificar se o mouse está dentro da área do gráfico
    if (canvasX < margin.left || canvasX > margin.left + chartWidth ||
        canvasY < margin.top || canvasY > margin.top + chartHeight) {
      return null;
    }
    
    // Converter coordenada X do canvas para valor X do gráfico (considerando zoom)
    const xRatio = (canvasX - margin.left) / chartWidth;
    const dataX = ((xRatio - zoom.offsetX) / zoom.scale) * (seriesData[0].data.length - 1);
    
    // Encontrar o ponto de dados mais próximo para cada série
    let closestDistance = Infinity;
    let closestSeriesIndex = null;
    
    seriesData.forEach((series, seriesIndex) => {
      // Encontrar o ponto mais próximo ao X do mouse
      const xIndex = Math.round(dataX);
      if (xIndex >= 0 && xIndex < series.data.length) {
        const point = series.data[xIndex];
        
        // Obter a configuração do eixo Y para esta série
        const axis = yAxes.find(a => a.id === series.axisId);
        if (!axis) return;
        
        // Converter valor Y para coordenada do canvas
        const normalizedY = (point.y - axis.min) / (axis.max - axis.min);
        const pointCanvasY = margin.top + chartHeight - normalizedY * chartHeight;
        
        // Calcular distância ao mouse
        const distance = Math.abs(pointCanvasY - canvasY);
        
        if (distance < closestDistance && distance < 30) { // Limite de 30px para detecção
          closestDistance = distance;
          closestSeriesIndex = seriesIndex;
        }
      }
    });
    
    return closestSeriesIndex;
  };

  // Função para converter as coordenadas do mouse em coordenadas do canvas
  const getCanvasCoordinates = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY
    };
  };
  
  // Função para aplicar zoom em uma área selecionada
  const zoomToSelection = () => {
    const canvas = canvasRef.current;
    if (!canvas || !isSelecting) return;
    
    const margin = { top: 50, right: 180, bottom: 40, left: 60 };
    const chartWidth = canvas.width - margin.left - margin.right;
    
    // Converter coordenadas de seleção para valores normalizados (0 a 1) no eixo X
    const minX = Math.min(selectionStart.x, selectionEnd.x);
    const maxX = Math.max(selectionStart.x, selectionEnd.x);
    
    // Ignorar seleções muito pequenas (podem ser cliques acidentais)
    if (maxX - minX < 20) {
      setIsSelecting(false);
      return;
    }
    
    // Normalizar para a área do gráfico
    const normalizedMinX = (minX - margin.left) / chartWidth;
    const normalizedMaxX = (maxX - margin.left) / chartWidth;
    
    // Calcular novo zoom e offset
    // Quanto menor o intervalo selecionado, maior o zoom
    const selectionWidth = normalizedMaxX - normalizedMinX;
    const newScale = Math.max(1, zoom.scale / selectionWidth);
    
    // Centralizar no ponto médio da seleção
    const selectionCenter = (normalizedMinX + normalizedMaxX) / 2;
    const newOffsetX = -selectionCenter * newScale + 0.5;
    
    setZoom({
      scale: newScale,
      offsetX: newOffsetX
    });
    
    // Limpar seleção
    setIsSelecting(false);
  };

  // Manipuladores de eventos
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const coords = getCanvasCoordinates(e.clientX, e.clientY);
    
    if (selectionMode && isSelecting) {
      // Atualizar o ponto final da seleção durante o arrasto
      setSelectionEnd(coords);
      // Forçar redesenho IMEDIATO do canvas para mostrar o retângulo de seleção em tempo real
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          // Primeiro redesenhamos todo o gráfico
          drawChart();
        }
      }
    } else if (isDragging) {
      // Calcular movimento para pan
      const deltaX = (e.clientX - dragStart.x) / canvas.width;
      setZoom(prev => ({
        ...prev,
        offsetX: prev.offsetX + deltaX
      }));
      setDragStart({ x: e.clientX, y: e.clientY });
    } else {
      // Detectar hover em séries
      const nearestSeries = findNearestSeries(e.clientX, e.clientY);
      setHoveredSeries(nearestSeries);
    }
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const coords = getCanvasCoordinates(e.clientX, e.clientY);
    
    if (selectionMode) {
      setIsSelecting(true);
      setSelectionStart(coords);
      setSelectionEnd(coords);
      // Forçar desenho imediato ao iniciar a seleção
      requestAnimationFrame(() => drawChart());
    } else {
      setIsDragging(true);
      setDragStart({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseUp = () => {
    if (selectionMode && isSelecting) {
      zoomToSelection();
    }
    
    setIsDragging(false);
    setIsSelecting(false);
  };

  const handleMouseOut = () => {
    setIsDragging(false);
    setIsSelecting(false);
    setHoveredSeries(null);
  };

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const mouseX = (e.clientX - rect.left) / canvas.width;
    
    // Calcular novo zoom
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    const newScale = Math.max(1, zoom.scale + delta);
    
    // Ajustar offset para manter a posição do mouse no mesmo lugar
    const newOffsetX = zoom.offsetX - delta * (mouseX - 0.5);
    
    setZoom({
      scale: newScale,
      offsetX: newOffsetX
    });
  };

  // Resetar zoom
  const handleResetZoom = () => {
    setZoom({ scale: 1, offsetX: 0 });
  };
  
  // Alternar modo de seleção
  const toggleSelectionMode = () => {
    setSelectionMode(!selectionMode);
    // Se estiver desativando o modo de seleção, limpe qualquer seleção ativa
    if (selectionMode) {
      setIsSelecting(false);
    }
  };

  // Redimensionar canvas quando o tamanho da janela mudar
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const { width } = containerRef.current.getBoundingClientRect();
        // Verificar se as dimensões realmente mudaram antes de atualizar o estado
        if (Math.abs(width - dimensions.width) > 5) { // Tolerância de 5px
          setDimensions({
            width: width,
            height: Math.max(400, width * 0.5) // Aspect ratio 2:1 com altura mínima de 400px
          });
        }
      }
    };
    
    window.addEventListener('resize', updateDimensions);
    updateDimensions();
    
    return () => {
      window.removeEventListener('resize', updateDimensions);
    };
  }, [dimensions.width]); // Adiciona dimensions.width como dependência

  // Memorizar a função de desenho para evitar redesenhos desnecessários
  const memoDrawChart = useMemo(() => drawChart, [dimensions, hoveredSeries, zoom, selectionMode, isSelecting, selectionStart, selectionEnd]);
  
  // Desenhar o gráfico sempre que as dependências mudarem
  useEffect(() => {
    // Usando requestAnimationFrame para desenho mais eficiente
    const frameId = requestAnimationFrame(() => drawChart());
    return () => cancelAnimationFrame(frameId);
  }, [dimensions, hoveredSeries, zoom, selectionMode, isSelecting, selectionStart, selectionEnd]);

  return (
    <div style={{ width: '100%', fontFamily: 'Arial, sans-serif' }}>
      <div style={{ marginBottom: '10px', textAlign: 'center' }}>
        <h3>Canvas Multi-Axis Chart</h3>
        <p>Passe o mouse sobre uma linha para destacá-la. Use a roda do mouse para zoom, arraste para mover.</p>
        <div style={{ marginBottom: '10px', display: 'flex', justifyContent: 'center', gap: '10px' }}>
          <button 
            onClick={handleResetZoom}
            className=''
            style={{
              padding: '6px 12px',
              backgroundColor: '#f8f9fa',
              border: '1px solid #dee2e6',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Resetar Zoom
          </button>
          <button 
            onClick={toggleSelectionMode}
            style={{
              padding: '6px 12px',
              backgroundColor: selectionMode ? '#4285f4' : '#f8f9fa',
              color: selectionMode ? 'white' : 'black',
              border: `1px solid ${selectionMode ? '#2a66cc' : '#dee2e6'}`,
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            {selectionMode ? 'Desativar Seleção de Área' : 'Ativar Seleção de Área'}
          </button>
        </div>
        {selectionMode && (
          <div style={{ marginBottom: '10px' }}>
            <p style={{ fontSize: '14px', color: '#4285f4' }}>
              Modo de seleção ativo: Clique e arraste para selecionar uma área para zoom.
            </p>
          </div>
        )}
      </div>
      
      <div 
        ref={containerRef} 
        style={{ width: '100%', position: 'relative' }}
      >
        <canvas
          ref={canvasRef}
          width={dimensions.width}
          height={dimensions.height}
          onMouseMove={handleMouseMove}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseOut={handleMouseOut}
          onWheel={handleWheel}
          style={{ 
            width: '100%', 
            height: 'auto',
            cursor: selectionMode ? (isSelecting ? 'crosshair' : 'cell') : isDragging ? 'grabbing' : 'grab'
          }}
        />
      </div>
    </div>
  );
};

export default CanvasMultiAxisChart;