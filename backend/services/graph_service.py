from __future__ import annotations

import math
from typing import Any, Dict

import networkx as nx
import pandas as pd
from networkx.algorithms.community import greedy_modularity_communities

try:
    from services.data_service import build_indian_network_data
    from utils.distance import haversine_km
except ImportError:  # pragma: no cover
    from backend.services.data_service import build_indian_network_data
    from backend.utils.distance import haversine_km


class NetworkGraphService:
    @staticmethod
    def _normalize_airport_code(value: Any) -> str:
        return str(value or "").strip().upper()

    @staticmethod
    def _safe_float(value: Any, default: float = 0.0) -> float:
        try:
            number = float(value)
        except (TypeError, ValueError):
            return default

        if math.isnan(number) or math.isinf(number):
            return default
        return number

    @staticmethod
    def _safe_value(value: Any, default: Any = None) -> Any:
        if isinstance(value, float) and (math.isnan(value) or math.isinf(value)):
            return default
        return value

    def __init__(self):
        data = build_indian_network_data()
        self.airports: pd.DataFrame = data["airports"]
        self.routes: pd.DataFrame = data["routes"]
        self.airport_info: Dict[str, Dict[str, Any]] = data["airport_info"]
        self.graph = self._build_graph()
        self.degree = dict(self.graph.degree())
        self.degree_centrality = {node: self._safe_float(score) for node, score in nx.degree_centrality(self.graph).items()}
        self.closeness = {node: self._safe_float(score) for node, score in nx.closeness_centrality(self.graph, distance="weight").items()}
        self.betweenness = {node: self._safe_float(score) for node, score in nx.betweenness_centrality(self.graph, weight="weight").items()}
        self.eigenvector = {node: self._safe_float(score) for node, score in nx.eigenvector_centrality(self.graph, max_iter=1000).items()}
        self.pagerank = {node: self._safe_float(score) for node, score in nx.pagerank(self.graph).items()}
        self.communities = [list(community) for community in greedy_modularity_communities(self.graph)]
        self.network_density = nx.density(self.graph)
        self.average_degree = sum(self.degree.values()) / len(self.degree)
        self.connected_components = nx.number_connected_components(self.graph)

    def _build_graph(self):
        G = nx.Graph()

        for _, row in self.airports.iterrows():
            G.add_node(
                row["IATA"],
                name=row["Name"],
                city=row["City"],
                country=row["Country"],
                latitude=float(row["Latitude"]),
                longitude=float(row["Longitude"]),
            )

        for _, row in self.routes.iterrows():
            source = row["Source_Airport"]
            destination = row["Destination_Airport"]
            distance = float(row["Distance_km"])
            G.add_edge(source, destination, weight=distance)

        return G

    def get_network_payload(self):
        nodes = []
        for node in self.graph.nodes():
            data = self.graph.nodes[node]
            nodes.append(
                {
                    "id": node,
                    "name": self._safe_value(data.get("name")),
                    "city": self._safe_value(data.get("city")),
                    "country": self._safe_value(data.get("country")),
                    "latitude": data.get("latitude"),
                    "longitude": data.get("longitude"),
                    "degree": self.degree.get(node, 0),
                    "degree_centrality": self._safe_float(self.degree_centrality.get(node, 0)),
                    "closeness_centrality": self._safe_float(self.closeness.get(node, 0)),
                    "betweenness_centrality": self._safe_float(self.betweenness.get(node, 0)),
                    "eigenvector_centrality": self._safe_float(self.eigenvector.get(node, 0)),
                    "pagerank": self._safe_float(self.pagerank.get(node, 0)),
                }
            )

        edges = []
        for source, destination, data in self.graph.edges(data=True):
            edges.append(
                {
                    "source": source,
                    "target": destination,
                    "weight": float(data.get("weight", 0.0)),
                }
            )

        return {"nodes": nodes, "edges": edges}

    def get_airports_table(self):
        rows = []
        for node in self.graph.nodes():
            metrics = {
                "IATA": node,
                "Airport Name": self._safe_value(self.graph.nodes[node].get("name")),
                "City": self._safe_value(self.graph.nodes[node].get("city")),
                "Latitude": float(self.graph.nodes[node].get("latitude", 0.0)),
                "Longitude": float(self.graph.nodes[node].get("longitude", 0.0)),
                "Degree": self.degree.get(node, 0),
                "Degree Centrality": self._safe_float(self.degree_centrality.get(node, 0)),
                "Closeness Centrality": self._safe_float(self.closeness.get(node, 0)),
                "Betweenness Centrality": self._safe_float(self.betweenness.get(node, 0)),
                "Eigenvector Centrality": self._safe_float(self.eigenvector.get(node, 0)),
                "PageRank": self._safe_float(self.pagerank.get(node, 0)),
            }
            rows.append(metrics)
        return rows

    def get_airport_detail(self, iata: str):
        node_data = self.graph.nodes.get(iata)
        if not node_data:
            return None
        direct_connections = sorted(self.graph.neighbors(iata))
        return {
            "iata": iata,
            "name": node_data.get("name"),
            "city": node_data.get("city"),
            "country": node_data.get("country"),
            "latitude": node_data.get("latitude"),
            "longitude": node_data.get("longitude"),
            "degree": self.degree.get(iata, 0),
            "degree_centrality": self._safe_float(self.degree_centrality.get(iata, 0)),
            "closeness_centrality": self._safe_float(self.closeness.get(iata, 0)),
            "betweenness_centrality": self._safe_float(self.betweenness.get(iata, 0)),
            "eigenvector_centrality": self._safe_float(self.eigenvector.get(iata, 0)),
            "pagerank": self._safe_float(self.pagerank.get(iata, 0)),
            "direct_connections": direct_connections,
        }

    def get_direct_route(self, source: str, destination: str):
        source = self._normalize_airport_code(source)
        destination = self._normalize_airport_code(destination)
        if source not in self.graph or destination not in self.graph:
            return None
        if self.graph.has_edge(source, destination):
            return {
                "source": source,
                "destination": destination,
                "direct_connection": True,
                "route_distance": float(self.graph[source][destination].get("weight", 0.0)),
            }
        return {
            "source": source,
            "destination": destination,
            "direct_connection": False,
            "route_distance": None,
        }

    def get_shortest_path(self, source: str, destination: str):
        source = self._normalize_airport_code(source)
        destination = self._normalize_airport_code(destination)
        if source not in self.graph or destination not in self.graph:
            invalid = [
                airport
                for airport in (source, destination)
                if airport not in self.graph
            ]
            return {
                "exists": False,
                "source": source,
                "destination": destination,
                "error_code": "invalid_airport",
                "message": f"Unknown airport code(s): {', '.join(invalid)}.",
            }

        weighted = all(
            self._is_valid_edge_weight(data.get("weight"))
            for _, _, data in self.graph.edges(data=True)
        )
        calculation_method = "weighted" if weighted else "unweighted"

        if source == destination:
            path = [source]
            return {
                **self._path_response(
                    source,
                    destination,
                    path,
                    calculation_method=calculation_method,
                    path_weight=0.0,
                ),
                "message": "Source and destination are the same airport.",
            }

        try:
            weight = "weight" if weighted else None
            path = nx.shortest_path(
                self.graph,
                source=source,
                target=destination,
                weight=weight,
            )
            path_weight = nx.shortest_path_length(
                self.graph,
                source=source,
                target=destination,
                weight=weight,
            )
            return self._path_response(
                source,
                destination,
                path,
                calculation_method=calculation_method,
                path_weight=float(path_weight),
            )
        except nx.NetworkXNoPath:
            return {
                "exists": False,
                "source": source,
                "destination": destination,
                "error_code": "no_path",
                "message": "No path exists between the selected airports.",
            }

    @staticmethod
    def _is_valid_edge_weight(value: Any) -> bool:
        try:
            weight = float(value)
        except (TypeError, ValueError):
            return False
        return math.isfinite(weight) and weight >= 0

    def _path_response(
        self,
        source: str,
        destination: str,
        path: list[str],
        calculation_method: str,
        path_weight: float,
    ):
        weighted = calculation_method == "weighted"
        airports = [
            {
                "iata": airport,
                "name": self._safe_value(self.graph.nodes[airport].get("name")),
                "city": self._safe_value(self.graph.nodes[airport].get("city")),
                "latitude": self._safe_coordinate(self.graph.nodes[airport].get("latitude")),
                "longitude": self._safe_coordinate(self.graph.nodes[airport].get("longitude")),
            }
            for airport in path
        ]
        geographic_distance = self._geographic_path_distance(path)
        has_geographic_distance = geographic_distance is not None
        if not weighted and has_geographic_distance:
            calculation_method = "geographic-distance-estimate"
        total_distance = path_weight if weighted else geographic_distance
        distance_message = (
            "Distance is an estimated geographic distance from airport coordinates; "
            "it is not a scheduled flight distance."
            if calculation_method == "geographic-distance-estimate"
            else None
        )
        return {
            "exists": True,
            "source": source,
            "destination": destination,
            "path": path,
            "airports": airports,
            "edges": max(len(path) - 1, 0),
            "intermediate_stops": max(len(path) - 2, 0),
            "total_distance_km": total_distance,
            "distance_km": total_distance,
            "path_weight": path_weight,
            "calculation_method": calculation_method,
            "route_type": "graph_route",
            "message": distance_message or (
                "Route calculated from the analyzed airport graph; "
                "this is not a guaranteed scheduled airline itinerary."
            ),
        }

    @staticmethod
    def _safe_coordinate(value: Any):
        try:
            coordinate = float(value)
        except (TypeError, ValueError):
            return None
        return coordinate if math.isfinite(coordinate) else None

    def _geographic_path_distance(self, path: list[str]):
        coordinates = [
            (
                self._safe_coordinate(self.graph.nodes[airport].get("latitude")),
                self._safe_coordinate(self.graph.nodes[airport].get("longitude")),
            )
            for airport in path
        ]
        if any(latitude is None or longitude is None for latitude, longitude in coordinates):
            return None
        if any(
            not -90 <= latitude <= 90 or not -180 <= longitude <= 180
            for latitude, longitude in coordinates
        ):
            return None
        distance = sum(
            haversine_km(
                source_latitude,
                source_longitude,
                destination_latitude,
                destination_longitude,
            )
            for (source_latitude, source_longitude), (destination_latitude, destination_longitude)
            in zip(coordinates, coordinates[1:])
        )
        return distance if math.isfinite(distance) else None

    def get_metric_series(self, metric_name: str, limit: int = 10):
        metric_map = {
            "degree": ("Degree", self.degree),
            "degree_centrality": ("Degree Centrality", self.degree_centrality),
            "closeness_centrality": ("Closeness Centrality", self.closeness),
            "betweenness_centrality": ("Betweenness Centrality", self.betweenness),
            "eigenvector_centrality": ("Eigenvector Centrality", self.eigenvector),
            "pagerank": ("PageRank", self.pagerank),
        }
        if metric_name not in metric_map:
            raise ValueError("Unsupported centrality metric")

        label, values = metric_map[metric_name]
        sorted_values = sorted(values.items(), key=lambda item: item[1], reverse=True)[:limit]
        return {
            "metric": label,
            "data": [
                {"airport": airport, "score": float(score)} for airport, score in sorted_values
            ],
        }

    def get_communities_payload(self):
        output = []
        for index, community in enumerate(self.communities, start=1):
            output.append({
                "community_id": index,
                "airport_count": len(community),
                "airports": sorted(community),
            })
        return {"total_communities": len(output), "communities": output}

    def get_statistics(self):
        return {
            "num_nodes": self.graph.number_of_nodes(),
            "num_edges": self.graph.number_of_edges(),
            "network_density": float(self.network_density),
            "average_degree": float(self.average_degree),
            "maximum_degree": max(self.degree.values()),
            "minimum_degree": min(self.degree.values()),
            "connected_components": self.connected_components,
            "communities": len(self.communities),
        }

    def get_summary(self):
        stats = self.get_statistics()
        return {
            "total_airports": stats["num_nodes"],
            "total_routes": stats["num_edges"],
            "network_density": stats["network_density"],
            "average_degree": stats["average_degree"],
            "connected_components": stats["connected_components"],
            "communities": stats["communities"],
            "max_degree": stats["maximum_degree"],
            "min_degree": stats["minimum_degree"],
        }

    def get_insights(self):
        metric_specs = {
            "Degree": self.degree,
            "Degree Centrality": self.degree_centrality,
            "Betweenness Centrality": self.betweenness,
            "Closeness Centrality": self.closeness,
            "Eigenvector Centrality": self.eigenvector,
            "PageRank": self.pagerank,
        }
        insights = {}
        for label, values in metric_specs.items():
            airport, score = max(values.items(), key=lambda item: item[1])
            insights[f"highest_{label.lower().replace(' ', '_').replace('-', '_')}_airport"] = {
                "airport": airport,
                "score": float(score),
                "metric": label,
            }

        stats = self.get_statistics()
        insights["community_count"] = {
            "value": stats["communities"],
            "label": "Number of network communities",
        }
        insights["network_density"] = {
            "value": stats["network_density"],
            "label": "Network density",
        }
        insights["connectivity_structure"] = {
            "value": "Undirected Indian airport graph with weighted distance-based connections",
            "label": "Connectivity structure",
        }
        return insights
