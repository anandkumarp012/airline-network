import { useEffect, useMemo } from 'react';
import L from 'leaflet';
import { MapContainer, Marker, Polyline, Popup, TileLayer, useMap } from 'react-leaflet';

const INDIA_CENTER = [22.5, 79];
const DEFAULT_ZOOM = 5;

const markerIcons = {
  default: L.divIcon({
    className: 'airport-marker-wrapper',
    html: '<span class="airport-marker airport-marker-default"></span>',
    iconSize: [18, 18],
    iconAnchor: [9, 9],
  }),
  source: L.divIcon({
    className: 'airport-marker-wrapper',
    html: '<span class="airport-marker airport-marker-source">S</span>',
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  }),
  destination: L.divIcon({
    className: 'airport-marker-wrapper',
    html: '<span class="airport-marker airport-marker-destination">D</span>',
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  }),
  intermediate: L.divIcon({
    className: 'airport-marker-wrapper',
    html: '<span class="airport-marker airport-marker-intermediate"></span>',
    iconSize: [22, 22],
    iconAnchor: [11, 11],
  }),
};

function hasCoordinates(node) {
  return Number.isFinite(Number(node?.latitude)) && Number.isFinite(Number(node?.longitude));
}

function MapViewportController({ pathCoordinates, fallbackCoordinates, fitSignal }) {
  const map = useMap();

  useEffect(() => {
    const coordinates = pathCoordinates.length > 1 ? pathCoordinates : fallbackCoordinates;
    if (coordinates.length > 1) {
      map.fitBounds(coordinates, { padding: [32, 32], maxZoom: 7 });
    } else if (coordinates.length === 1) {
      map.setView(coordinates[0], 7);
    }
  }, [fitSignal, fallbackCoordinates, map, pathCoordinates]);

  return null;
}

export default function RouteMap({
  nodes = [],
  edges = [],
  path = [],
  source,
  destination,
  fitSignal = 0,
  showNetwork = false,
  onMarkerClick,
}) {
  const validNodes = useMemo(
    () => nodes.filter(hasCoordinates),
    [nodes],
  );
  const nodesById = useMemo(
    () => new Map(validNodes.map((node) => [node.id || node.IATA, node])),
    [validNodes],
  );
  const pathCoordinates = useMemo(
    () => path.map((id) => nodesById.get(id)).filter(hasCoordinates).map((node) => [Number(node.latitude), Number(node.longitude)]),
    [nodesById, path],
  );
  const fallbackCoordinates = useMemo(
    () => validNodes.map((node) => [Number(node.latitude), Number(node.longitude)]),
    [validNodes],
  );
  const pathIds = useMemo(() => new Set(path), [path]);

  const edgeCoordinates = useMemo(() => edges
    .map((edge) => {
      const sourceNode = nodesById.get(edge.source);
      const destinationNode = nodesById.get(edge.target);
      if (!hasCoordinates(sourceNode) || !hasCoordinates(destinationNode)) return null;
      return [
        [Number(sourceNode.latitude), Number(sourceNode.longitude)],
        [Number(destinationNode.latitude), Number(destinationNode.longitude)],
      ];
    })
    .filter(Boolean), [edges, nodesById]);

  return (
    <div className="relative h-[420px] min-h-[320px] overflow-hidden rounded-2xl border border-sky-200 bg-sky-50 shadow-sm md:h-[540px]">
      <MapContainer
        center={INDIA_CENTER}
        zoom={DEFAULT_ZOOM}
        scrollWheelZoom
        zoomControl
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapViewportController
          pathCoordinates={pathCoordinates}
          fallbackCoordinates={fallbackCoordinates}
          fitSignal={fitSignal}
        />

        {showNetwork && edgeCoordinates.map((coordinates, index) => (
          <Polyline
            key={`network-edge-${index}`}
            positions={coordinates}
            pathOptions={{ color: '#bae6fd', weight: 1, opacity: 0.7 }}
          />
        ))}

        {pathCoordinates.length > 1 && (
          <Polyline
            positions={pathCoordinates}
            pathOptions={{ color: '#0284c7', weight: 5, opacity: 0.95 }}
          />
        )}

        {validNodes.map((node) => {
          const id = node.id || node.IATA;
          const markerType = id === source
            ? 'source'
            : id === destination
              ? 'destination'
              : pathIds.has(id)
                ? 'intermediate'
                : 'default';

          return (
            <Marker
              key={id}
              position={[Number(node.latitude), Number(node.longitude)]}
              icon={markerIcons[markerType]}
              eventHandlers={{ click: () => onMarkerClick?.(node) }}
            >
              <Popup>
                <div className="space-y-1 text-sm">
                  <div className="font-semibold text-slate-900">{node.name || id}</div>
                  <div className="text-slate-600">{id}{node.city ? ` · ${node.city}` : ''}</div>
                  {node.degree !== undefined && <div className="text-slate-600">Direct connections: {node.degree}</div>}
                  {pathIds.has(id) && <div className="font-medium text-sky-700">Selected path location</div>}
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
