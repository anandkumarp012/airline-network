from __future__ import annotations

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

try:
    from services.analytics_service import get_service
except ImportError:  # pragma: no cover
    from backend.services.analytics_service import get_service

app = FastAPI(title="Airline Network Intelligence", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

service = get_service()


@app.get("/api/summary")
def get_summary():
    return service.get_summary()


@app.get("/api/network")
def get_network():
    return service.get_network_payload()


@app.get("/api/airports")
def get_airports():
    return service.get_airports_table()


@app.get("/api/airports/{iata}")
def get_airport(iata: str):
    airport = service.get_airport_detail(iata.upper())
    if not airport:
        raise HTTPException(status_code=404, detail="Airport not found")
    return airport


@app.get("/api/routes")
def get_routes():
    return service.routes.to_dict(orient="records")


@app.get("/api/routes/{source}/{destination}")
def get_route(source: str, destination: str):
    result = service.get_direct_route(source.upper(), destination.upper())
    if not result:
        raise HTTPException(status_code=404, detail="Airport pair not found")
    return result


@app.get("/api/centrality")
def get_centrality():
    return {
        "degree_centrality": service.degree_centrality,
        "closeness_centrality": service.closeness,
        "betweenness_centrality": service.betweenness,
        "eigenvector_centrality": service.eigenvector,
        "pagerank": service.pagerank,
    }


@app.get("/api/centrality/{metric}")
def get_centrality_metric(metric: str):
    metric_key = metric.lower()
    valid = {
        "degree": "degree",
        "degree_centrality": "degree_centrality",
        "closeness": "closeness_centrality",
        "closeness_centrality": "closeness_centrality",
        "betweenness": "betweenness_centrality",
        "betweenness_centrality": "betweenness_centrality",
        "eigenvector": "eigenvector_centrality",
        "eigenvector_centrality": "eigenvector_centrality",
        "pagerank": "pagerank",
    }
    if metric_key not in valid:
        raise HTTPException(status_code=400, detail="Unsupported centrality metric")

    key = valid[metric_key]
    mapping = {
        "degree": service.degree,
        "degree_centrality": service.degree_centrality,
        "closeness_centrality": service.closeness,
        "betweenness_centrality": service.betweenness,
        "eigenvector_centrality": service.eigenvector,
        "pagerank": service.pagerank,
    }
    series = sorted(mapping[key].items(), key=lambda item: item[1], reverse=True)
    return {
        "metric": key,
        "data": [
            {"airport": airport, "score": float(score)} for airport, score in series
        ],
    }


@app.get("/api/shortest-path")
def get_shortest_path(source: str, destination: str):
    result = service.get_shortest_path(source.upper(), destination.upper())
    return result


@app.get("/api/communities")
def get_communities():
    return service.get_communities_payload()


@app.get("/api/statistics")
def get_statistics():
    return service.get_statistics()


@app.get("/api/insights")
def get_insights():
    return service.get_insights()


@app.get("/")
def home():
    return {"message": "Airline Network Intelligence API"}
