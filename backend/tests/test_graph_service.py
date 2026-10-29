import networkx as nx
import pytest

from backend.services.graph_service import NetworkGraphService


def service_with_graph(graph):
    service = NetworkGraphService.__new__(NetworkGraphService)
    service.graph = graph
    return service


def add_airport(graph, code):
    graph.add_node(
        code,
        name=f"Airport {code}",
        city=code,
        latitude=10.0,
        longitude=20.0,
    )


def add_airport_with_coordinates(graph, code, latitude, longitude):
    graph.add_node(
        code,
        name=f"Airport {code}",
        city=code,
        latitude=latitude,
        longitude=longitude,
    )


def test_shortest_path_uses_minimum_weight_route():
    graph = nx.Graph()
    for code in ("AAA", "BBB", "CCC"):
        add_airport(graph, code)
    graph.add_edge("AAA", "BBB", weight=10)
    graph.add_edge("AAA", "CCC", weight=2)
    graph.add_edge("CCC", "BBB", weight=2)

    result = service_with_graph(graph).get_shortest_path("AAA", "BBB")

    assert result["exists"] is True
    assert result["path"] == ["AAA", "CCC", "BBB"]
    assert result["total_distance_km"] == 4.0
    assert result["edges"] == 2
    assert result["intermediate_stops"] == 1
    assert result["calculation_method"] == "weighted"


def test_shortest_path_falls_back_to_unweighted_connections():
    graph = nx.Graph()
    for code in ("AAA", "BBB", "CCC"):
        add_airport(graph, code)
    graph.add_edge("AAA", "CCC")
    graph.add_edge("CCC", "BBB")

    result = service_with_graph(graph).get_shortest_path("AAA", "BBB")

    assert result["exists"] is True
    assert result["path"] == ["AAA", "CCC", "BBB"]
    assert result["total_distance_km"] == 0.0
    assert result["path_weight"] == 2.0
    assert result["calculation_method"] == "geographic-distance-estimate"


def test_shortest_path_reports_invalid_airports():
    graph = nx.Graph()
    add_airport(graph, "AAA")

    result = service_with_graph(graph).get_shortest_path("AAA", "ZZZ")

    assert result["exists"] is False
    assert result["error_code"] == "invalid_airport"
    assert "ZZZ" in result["message"]


def test_shortest_path_handles_same_airport():
    graph = nx.Graph()
    add_airport(graph, "AAA")

    result = service_with_graph(graph).get_shortest_path("AAA", "AAA")

    assert result["exists"] is True
    assert result["path"] == ["AAA"]
    assert result["edges"] == 0
    assert result["intermediate_stops"] == 0
    assert result["total_distance_km"] == 0.0


def test_shortest_path_reports_disconnected_airports():
    graph = nx.Graph()
    add_airport(graph, "AAA")
    add_airport(graph, "BBB")

    result = service_with_graph(graph).get_shortest_path("AAA", "BBB")

    assert result["exists"] is False
    assert result["error_code"] == "no_path"


def test_shortest_path_returns_direct_route_in_both_directions():
    graph = nx.Graph()
    add_airport(graph, "AAA")
    add_airport(graph, "BBB")
    graph.add_edge("AAA", "BBB", weight=10)

    service = service_with_graph(graph)

    assert service.get_shortest_path(" aaa ", "bbb")["path"] == ["AAA", "BBB"]
    assert service.get_shortest_path("BBB", "AAA")["path"] == ["BBB", "AAA"]


def test_unweighted_path_uses_geographic_distance_estimate():
    graph = nx.Graph()
    add_airport_with_coordinates(graph, "AAA", 0, 0)
    add_airport_with_coordinates(graph, "BBB", 0, 1)
    add_airport_with_coordinates(graph, "CCC", 1, 1)
    graph.add_edge("AAA", "BBB")
    graph.add_edge("BBB", "CCC")

    result = service_with_graph(graph).get_shortest_path("AAA", "CCC")

    assert result["exists"] is True
    assert result["path"] == ["AAA", "BBB", "CCC"]
    assert result["calculation_method"] == "geographic-distance-estimate"
    assert result["total_distance_km"] is not None
    assert result["total_distance_km"] == pytest.approx(222.39, abs=0.1)


def test_unweighted_path_without_coordinates_reports_unavailable_distance():
    graph = nx.Graph()
    add_airport_with_coordinates(graph, "AAA", 0, 0)
    add_airport_with_coordinates(graph, "BBB", float("nan"), 1)
    graph.add_edge("AAA", "BBB")

    result = service_with_graph(graph).get_shortest_path("AAA", "BBB")

    assert result["exists"] is True
    assert result["calculation_method"] == "unweighted"
    assert result["total_distance_km"] is None


def test_invalid_edge_weight_falls_back_without_nan_distance():
    graph = nx.Graph()
    add_airport_with_coordinates(graph, "AAA", 0, 0)
    add_airport_with_coordinates(graph, "BBB", 0, 1)
    graph.add_edge("AAA", "BBB", weight=float("nan"))

    result = service_with_graph(graph).get_shortest_path("AAA", "BBB")

    assert result["exists"] is True
    assert result["calculation_method"] == "geographic-distance-estimate"
    assert result["total_distance_km"] == pytest.approx(111.19, abs=0.1)
