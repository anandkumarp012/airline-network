# Airline Network Intelligence

## Overview

Airline Network Intelligence is a professional dashboard for analyzing the Indian airline network as a weighted undirected graph. The project uses OpenFlights dataset information and NetworkX algorithms to derive route connectivity, centrality, shortest paths, and community structure.

## Problem Statement

The notebook-based analysis built a graph from Indian airports and route connections. The goal of this application is to present the underlying analytical work through a modern interactive dashboard that exposes the results to users via a FastAPI backend and React frontend.

## Objectives

- Recreate the notebook’s India-only airport and route filtering.
- Construct an undirected NetworkX graph with geographic distance as edge weight.
- Expose graph-derived metrics via JSON APIs.
- Build a professional dashboard with visual network analysis.
- Make the backend and frontend separate but coupled around the same dataset logic.

## Dataset

The project uses OpenFlights data:

- airports.dat
- routes.dat

The notebook filters the airport dataset to Country = India and then builds a graph of valid Indian airports and routes.

## Graph Model

- Airport = Node
- Route = Edge
- Distance = Edge Weight

The graph is created using NetworkX as `nx.Graph()` in an undirected form.

## Algorithms

The project uses the actual notebook methodology:

- Degree centrality: `nx.degree_centrality(G)`
- Closeness centrality: `nx.closeness_centrality(G, distance="weight")`
- Betweenness centrality: `nx.betweenness_centrality(G, weight="weight")`
- Eigenvector centrality: `nx.eigenvector_centrality(G, max_iter=1000)`
- PageRank: `nx.pagerank(G)`
- Shortest path: `nx.shortest_path(..., weight="weight")`
- Shortest path length: `nx.shortest_path_length(..., weight="weight")`
- Communities: `greedy_modularity_communities(G)`

## Architecture

- Data source: OpenFlights
- Data processing: Pandas and NumPy
- Graph computation: NetworkX
- API layer: FastAPI
- Frontend: React + Vite + Tailwind CSS
- Visualization: Cytoscape.js and Recharts

## Features

- Interactive network graph
- Searchable airport analytics table
- Top-N centrality charting
- Route explorer
- Shortest path calculator
- Community detection explorer
- Network statistics dashboard
- Global insights cards
- About project section

## Installation

### Backend setup

```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```

### Frontend setup

```bash
cd frontend
npm install
npm run dev
```

### Environment configuration

Create a `.env` file in the frontend directory:

```env
VITE_API_URL=http://localhost:8000/api
```

## API Documentation

The FastAPI app exposes:

- GET /api/summary
- GET /api/network
- GET /api/airports
- GET /api/airports/{iata}
- GET /api/routes
- GET /api/routes/{source}/{destination}
- GET /api/centrality
- GET /api/centrality/{metric}
- GET /api/shortest-path
- GET /api/communities
- GET /api/statistics
- GET /api/insights

`/api/shortest-path` accepts `source` and `destination` IATA codes as query
parameters. Successful responses include the ordered `path`, airport metadata,
`edges`, `intermediate_stops`, `total_distance_km`, `path_weight`, and
`calculation_method`. A weighted result uses the graph's distance attributes;
when weights are unavailable, the graph path is found unweighted and valid
coordinates are used for an explicitly labelled geographic-distance estimate.
If coordinates are unavailable, `total_distance_km` is `null`. Routes describe
connections in the analyzed graph and are not guaranteed scheduled airline
itineraries.

For production, set `VITE_API_URL` to the backend host with the `/api` prefix,
for example:

```env
VITE_API_URL=https://airline-network-api.onrender.com/api
```

## Screenshots

Add screenshots from the running app here.

## Future Enhancements

- Geographic map view with airport markers
- Additional route filters and multi-airport comparisons
- Downloadable network snapshots
- More advanced visual emphasis for shortest paths and communities
