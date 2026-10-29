from __future__ import annotations

from functools import lru_cache
import pandas as pd

try:
    from utils.distance import haversine_km
except ImportError:  # pragma: no cover
    from backend.utils.distance import haversine_km

AIRPORTS_URL = "https://raw.githubusercontent.com/jpatokal/openflights/master/data/airports.dat"
ROUTES_URL = "https://raw.githubusercontent.com/jpatokal/openflights/master/data/routes.dat"


@lru_cache(maxsize=1)
def load_airports() -> pd.DataFrame:
    airports = pd.read_csv(AIRPORTS_URL, header=None, na_values="\\N")
    airports.columns = [
        "Airport_ID",
        "Name",
        "City",
        "Country",
        "IATA",
        "ICAO",
        "Latitude",
        "Longitude",
        "Altitude",
        "Timezone",
        "DST",
        "Tz_Database",
        "Type",
        "Source",
    ]
    return airports


@lru_cache(maxsize=1)
def load_routes() -> pd.DataFrame:
    routes = pd.read_csv(ROUTES_URL, header=None, na_values="\\N")
    routes.columns = [
        "Airline",
        "Airline_ID",
        "Source_Airport",
        "Source_Airport_ID",
        "Destination_Airport",
        "Destination_Airport_ID",
        "Codeshare",
        "Stops",
        "Equipment",
    ]
    return routes


@lru_cache(maxsize=1)
def build_indian_network_data():
    airports = load_airports()
    routes = load_routes()

    airports_clean = airports[
        airports["IATA"].notna()
        & airports["Latitude"].notna()
        & airports["Longitude"].notna()
    ].copy()

    india_airports = airports_clean[
        airports_clean["Country"] == "India"
    ].copy()

    india_codes = set(india_airports["IATA"])
    india_routes = routes[
        routes["Source_Airport"].isin(india_codes)
        & routes["Destination_Airport"].isin(india_codes)
    ].copy()

    airport_info = india_airports.set_index("IATA")[
        ["Name", "City", "Latitude", "Longitude"]
    ].to_dict("index")

    def get_distance(source: str, destination: str) -> float:
        s = airport_info[source]
        d = airport_info[destination]
        return haversine_km(
            s["Latitude"],
            s["Longitude"],
            d["Latitude"],
            d["Longitude"],
        )

    india_routes["Distance_km"] = india_routes.apply(
        lambda row: get_distance(
            row["Source_Airport"],
            row["Destination_Airport"],
        ),
        axis=1,
    )
    india_routes = india_routes[
        india_routes["Source_Airport"] != india_routes["Destination_Airport"]
    ].copy()
    india_routes_unique = (
        india_routes.groupby(["Source_Airport", "Destination_Airport"], as_index=False)[
            "Distance_km"
        ]
        .min()
    )

    return {
        "airports": india_airports,
        "routes": india_routes_unique,
        "airport_info": airport_info,
        "num_airports": len(india_airports),
        "num_routes": len(india_routes_unique),
    }
