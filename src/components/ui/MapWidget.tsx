"use client";

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, CircleMarker, Tooltip } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

export default function MapWidget({ projectCoords, projectName, tests = [] }: { projectCoords?: string, projectName: string, tests?: any[] }) {
  const [filterType, setFilterType] = useState('Todas');
  const [filterStatus, setFilterStatus] = useState('Todos');

  useEffect(() => {
    // Fix para los iconos de Leaflet en Next.js
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    });
  }, []);

  let centerLat = 19.4326; // Default CDMX
  let centerLng = -99.1332;
  let hasCenter = false;

  if (projectCoords) {
    const [latStr, lngStr] = projectCoords.split(',');
    if (latStr && lngStr) {
      centerLat = parseFloat(latStr.trim());
      centerLng = parseFloat(lngStr.trim());
      hasCenter = !isNaN(centerLat) && !isNaN(centerLng);
    }
  }

  // Si no hay coords de proyecto, intenta centrar en la primera prueba
  if (!hasCenter && tests.length > 0) {
    const firstTestWithCoords = tests.find(t => t.data?.coordinates);
    if (firstTestWithCoords) {
      const [latStr, lngStr] = firstTestWithCoords.data.coordinates.split(',');
      centerLat = parseFloat(latStr.trim());
      centerLng = parseFloat(lngStr.trim());
      hasCenter = !isNaN(centerLat) && !isNaN(centerLng);
    }
  }

  // FILTER LOGIC
  const filteredTests = tests.filter(test => {
    if (filterType !== 'Todas' && test.test_type !== filterType.toLowerCase()) return false;
    if (filterStatus !== 'Todos' && test.status !== filterStatus) return false;
    return true;
  });

  // GROUP TESTS BY COORDINATES
  const groupedCoords: Record<string, any[]> = {};
  filteredTests.forEach(test => {
    const coords = test.data?.coordinates?.trim();
    if (coords) {
      if (!groupedCoords[coords]) groupedCoords[coords] = [];
      groupedCoords[coords].push(test);
    }
  });

  return (
    <div className="w-full h-[500px] rounded-3xl overflow-hidden relative z-0 border border-zinc-800 shadow-[0_0_30px_rgba(255,95,21,0.05)] mt-6">
      {/* OVERLAY DE FILTROS */}
      <div className="absolute top-4 right-4 z-[400] bg-[#141414]/90 backdrop-blur border border-zinc-800 p-3 rounded-2xl flex flex-col items-end gap-2 shadow-xl">
        <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mb-1">Filtros de Mapa</span>
        <div className="flex gap-2">
           <select value={filterType} onChange={e => setFilterType(e.target.value)} className="bg-[#0a0a0a] border border-zinc-700 rounded-lg p-1.5 text-xs text-white outline-none cursor-pointer">
             <option value="Todas">Materiales (Todos)</option>
             <option value="Asfalto">Asfalto</option>
             <option value="Concreto">Concreto</option>
             <option value="Suelos">Suelos</option>
           </select>
           <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="bg-[#0a0a0a] border border-zinc-700 rounded-lg p-1.5 text-xs text-white outline-none cursor-pointer">
             <option value="Todos">Estatus (Todos)</option>
             <option value="EN PROCESO">En Proceso</option>
             <option value="FINALIZADO">Finalizado</option>
           </select>
        </div>
      </div>

      <MapContainer center={[centerLat, centerLng]} zoom={16} scrollWheelZoom={false} className="w-full h-full bg-[#0a0a0a]" style={{ zIndex: 0 }}>
        {/* CARTO Dark Matter Base Map - Industrial/Dark Mode */}
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        
        {/* PIN DEL PROYECTO (Si existe) */}
        {projectCoords && (
          <Marker position={[centerLat, centerLng]}>
            <Tooltip direction="top" offset={[0, -20]} opacity={1} permanent={true} className="bg-white border-0 shadow-lg text-black font-bold p-1 rounded">
               ⭐ {projectName}
            </Tooltip>
          </Marker>
        )}

        {/* PINES DE LAS PRUEBAS AGRUPADOS */}
        {Object.entries(groupedCoords).map(([coords, groupTests], index) => {
          const [tLatStr, tLngStr] = coords.split(',');
          const tLat = parseFloat(tLatStr);
          const tLng = parseFloat(tLngStr);
          if (isNaN(tLat) || isNaN(tLng)) return null;

          // Si hay múltiples, el color es blanco/neutral, si es uno, usa su color
          const isMultiple = groupTests.length > 1;
          let color = '#ffffff'; 
          if (!isMultiple) {
             if (groupTests[0].test_type === 'asfalto') color = '#FF5F15';
             if (groupTests[0].test_type === 'concreto') color = '#a1a1aa';
             if (groupTests[0].test_type === 'suelos') color = '#b87333';
          }

          return (
            <CircleMarker 
              key={`group-${index}`} 
              center={[tLat, tLng]} 
              radius={isMultiple ? 8 : 6}
              pathOptions={{ fillColor: color, color: isMultiple ? '#FF5F15' : '#fff', weight: isMultiple ? 3 : 2, fillOpacity: 1 }}
            >
              <Tooltip direction="top" offset={[0, -10]} opacity={0.95}>
                <div className="font-sans flex flex-col gap-1.5 min-w-[120px] p-1">
                  {isMultiple && (
                    <div className="text-[10px] font-bold text-[#FF5F15] border-b border-zinc-200 pb-1 mb-1">
                      {groupTests.length} ENSAYES EN ESTE PUNTO
                    </div>
                  )}
                  {groupTests.map(test => {
                    let tColor = '#FF5F15';
                    if (test.test_type === 'concreto') tColor = '#a1a1aa';
                    if (test.test_type === 'suelos') tColor = '#b87333';

                    return (
                      <div key={test.id} className="flex flex-col gap-0.5">
                        <div className="font-bold text-[11px] text-zinc-900 leading-tight">
                          {test.name.replace(' - undefined', '').replace('undefined', '')}
                        </div>
                        <div className="flex gap-2 items-center">
                          <span className="text-[9px] uppercase font-bold" style={{ color: tColor }}>{test.test_type}</span>
                          <span className={`text-[8px] font-bold px-1.5 py-[1px] rounded-sm ${test.status === 'FINALIZADO' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                            {test.status || 'PROC'}
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </Tooltip>
            </CircleMarker>
          );
        })}
      </MapContainer>
      
      <div className="absolute bottom-4 right-4 z-[400] bg-black/80 backdrop-blur text-[#FF5F15] text-[10px] px-3 py-1.5 rounded-full font-mono border border-[#FF5F15]/30 flex items-center gap-2 shadow-lg">
         <span className="w-2 h-2 rounded-full bg-[#FF5F15] animate-pulse"></span>
         Georreferenciación Activa
      </div>
    </div>
  );
}
