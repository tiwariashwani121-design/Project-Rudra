"""
Multi-Modal GIS Routing Engine using NetworkX
Solves least-hazard, shortest-delay routes across high-altitude Himalayan passes.
Dynamically pivots when mountain passes (e.g., Khardung La) are blocked by avalanches.
"""
from typing import List, Dict, Any, Tuple
import networkx as nx

WAYPOINTS_DATA: Dict[str, Dict[str, Any]] = {
    "BASE_LEH_DEPOT": {
        "name": "Leh Central Base Depot",
        "lat": 34.1526,
        "lon": 77.5771,
        "altitude_feet": 11500,
        "type": "BASE_DEPOT"
    },
    "CP_SOUTH_PULLU": {
        "name": "South Pullu Checkpoint",
        "lat": 34.2381,
        "lon": 77.6189,
        "altitude_feet": 15300,
        "type": "CHECKPOINT"
    },
    "PASS_KHARDUNG_LA": {
        "name": "Khardung La Pass (Highest Axis)",
        "lat": 34.2787,
        "lon": 77.6047,
        "altitude_feet": 17982,
        "type": "PASS"
    },
    "CP_NORTH_PULLU": {
        "name": "North Pullu Transit Post",
        "lat": 34.3321,
        "lon": 77.6321,
        "altitude_feet": 15100,
        "type": "CHECKPOINT"
    },
    "FLD_PARTAPUR": {
        "name": "Partapur Forward Logistics Depot",
        "lat": 34.6644,
        "lon": 77.6258,
        "altitude_feet": 10200,
        "type": "TRANSIT_DEPOT"
    },
    "WP_KARU": {
        "name": "Karu Junction Bypass Entry",
        "lat": 33.9210,
        "lon": 77.7420,
        "altitude_feet": 11400,
        "type": "WAYPOINT"
    },
    "PASS_CHANG_LA": {
        "name": "Chang La Pass (Eastern Bypass)",
        "lat": 34.0478,
        "lon": 77.9304,
        "altitude_feet": 17688,
        "type": "PASS"
    },
    "TP_AGHAM": {
        "name": "Agham Transit Junction",
        "lat": 34.4820,
        "lon": 77.8210,
        "altitude_feet": 11200,
        "type": "WAYPOINT"
    },
    "TP_SHYOK": {
        "name": "Shyok River Axis Post",
        "lat": 34.5800,
        "lon": 77.7800,
        "altitude_feet": 10500,
        "type": "WAYPOINT"
    },
    "FOP_SIACHEN_BASE": {
        "name": "Siachen Base Camp",
        "lat": 35.2008,
        "lon": 77.1264,
        "altitude_feet": 12000,
        "type": "FORWARD_POST"
    },
    "FOP_TURTUK": {
        "name": "Turtuk Border Post (LOC)",
        "lat": 34.8465,
        "lon": 76.8294,
        "altitude_feet": 9900,
        "type": "FORWARD_POST"
    },
    "FOP_DBO": {
        "name": "Daulat Beg Oldi (DBO) Strategic Post",
        "lat": 35.4012,
        "lon": 77.9254,
        "altitude_feet": 16600,
        "type": "FORWARD_POST"
    }
}

# Road segments: (from, to, distance_km, time_hours, hazard_base_score, pass_dependency)
ROAD_SEGMENTS = [
    # Primary Khardung La Axis
    ("BASE_LEH_DEPOT", "CP_SOUTH_PULLU", 24.0, 1.1, 15.0, None),
    ("CP_SOUTH_PULLU", "PASS_KHARDUNG_LA", 15.0, 1.2, 45.0, "PASS_KHARDUNG_LA"),
    ("PASS_KHARDUNG_LA", "CP_NORTH_PULLU", 14.0, 0.9, 40.0, "PASS_KHARDUNG_LA"),
    ("CP_NORTH_PULLU", "FLD_PARTAPUR", 75.0, 2.5, 20.0, None),

    # Bypass Chang La / Agham / Shyok Axis
    ("BASE_LEH_DEPOT", "WP_KARU", 35.0, 0.8, 10.0, None),
    ("WP_KARU", "PASS_CHANG_LA", 40.0, 2.2, 50.0, "PASS_CHANG_LA"),
    ("PASS_CHANG_LA", "TP_AGHAM", 65.0, 2.8, 35.0, "PASS_CHANG_LA"),
    ("TP_AGHAM", "TP_SHYOK", 38.0, 1.6, 30.0, None),
    ("TP_SHYOK", "FLD_PARTAPUR", 35.0, 1.2, 15.0, None),

    # Staging to Forward Posts
    ("FLD_PARTAPUR", "FOP_SIACHEN_BASE", 88.0, 3.2, 25.0, None),
    ("FLD_PARTAPUR", "FOP_TURTUK", 65.0, 2.4, 20.0, None),
    ("FLD_PARTAPUR", "FOP_DBO", 140.0, 6.5, 60.0, None),
]

def build_corridor_graph(blocked_passes: List[str] = None) -> nx.Graph:
    """Builds a NetworkX graph with dynamically adjusted edge weights."""
    blocked = set(blocked_passes or [])
    G = nx.Graph()

    for node_id, data in WAYPOINTS_DATA.items():
        G.add_node(node_id, **data)

    for u, v, dist, time_h, hazard, dep_pass in ROAD_SEGMENTS:
        # If segment depends on a blocked pass, mark weight as infinite (unusable)
        if dep_pass and dep_pass in blocked:
            continue
        
        # Combined cost: travel time + hazard penalty
        cost = time_h + (hazard / 100.0)
        G.add_edge(u, v, distance=dist, time=time_h, hazard=hazard, weight=cost)

    return G

def optimize_route(
    origin_id: str,
    dest_id: str,
    blocked_passes: List[str] = None
) -> Dict[str, Any]:
    """
    Computes optimal route between military nodes.
    Returns path coordinates, distance, travel time, elevation gain, and fuel metrics.
    """
    blocked = list(blocked_passes or [])
    G = build_corridor_graph(blocked)

    if not nx.has_path(G, origin_id, dest_id):
        # Even bypass blocked - helicopter airdrop mandatory
        return {
            "route_id": "AIR_ROUTE_ALH_HELO",
            "route_name": "Direct Tactical Air-Corridor (Rotary Wing ALH)",
            "is_diverted": True,
            "primary_pass_blocked": True,
            "distance_km": 110.0,
            "estimated_travel_time_hours": 0.8,
            "elevation_gain_m": 3500.0,
            "hazard_level": "EXTREME",
            "fuel_consumption_liters": 450.0,
            "recommended_convoy_type": "HEAVY_LIFT_ALH_DHRUV",
            "path_coordinates": [
                [WAYPOINTS_DATA[origin_id]["lat"], WAYPOINTS_DATA[origin_id]["lon"]],
                [WAYPOINTS_DATA[dest_id]["lat"], WAYPOINTS_DATA[dest_id]["lon"]]
            ],
            "waypoints": [
                {"lat": WAYPOINTS_DATA[origin_id]["lat"], "lon": WAYPOINTS_DATA[origin_id]["lon"], "name": WAYPOINTS_DATA[origin_id]["name"], "altitude_feet": WAYPOINTS_DATA[origin_id]["altitude_feet"]},
                {"lat": WAYPOINTS_DATA[dest_id]["lat"], "lon": WAYPOINTS_DATA[dest_id]["lon"], "name": WAYPOINTS_DATA[dest_id]["name"], "altitude_feet": WAYPOINTS_DATA[dest_id]["altitude_feet"]},
            ],
            "advisory_notes": "ROAD SURFACE BLOCKED. Emergency tactical rotary wing airdrop mandatory."
        }

    path_nodes = nx.shortest_path(G, origin_id, dest_id, weight="weight")

    total_dist = 0.0
    total_time = 0.0
    total_hazard = 0.0
    path_coords = []
    waypoints = []

    for i in range(len(path_nodes)):
        node_id = path_nodes[i]
        nd = WAYPOINTS_DATA[node_id]
        path_coords.append([nd["lat"], nd["lon"]])
        waypoints.append({
            "lat": nd["lat"],
            "lon": nd["lon"],
            "name": nd["name"],
            "altitude_feet": nd["altitude_feet"]
        })

        if i < len(path_nodes) - 1:
            next_node = path_nodes[i+1]
            edge = G[node_id][next_node]
            total_dist += edge["distance"]
            total_time += edge["time"]
            total_hazard += edge["hazard"]

    is_diverted = "PASS_KHARDUNG_LA" in blocked or "WP_KARU" in path_nodes
    route_name = (
        "Axis 2 Bypass: Leh - Karu - Chang La - Agham - Shyok - Partapur"
        if is_diverted
        else "Axis 1 Primary: Leh - South Pullu - Khardung La - North Pullu - Partapur"
    )

    # Calculate fuel: Stallion 4x4 uses ~38L/100km on steep gradient passes
    fuel_needed = round(total_dist * 0.45, 1)

    return {
        "route_id": "ROUTE_BYPASS_SHYOK" if is_diverted else "ROUTE_PRIMARY_KHL",
        "route_name": route_name,
        "is_diverted": is_diverted,
        "primary_pass_blocked": "PASS_KHARDUNG_LA" in blocked,
        "distance_km": round(total_dist, 1),
        "estimated_travel_time_hours": round(total_time, 1),
        "elevation_gain_m": 4200.0 if not is_diverted else 4850.0,
        "hazard_level": "HIGH" if is_diverted else "MODERATE",
        "fuel_consumption_liters": fuel_needed,
        "recommended_convoy_type": "4x4_ALS_WITH_SNOW_CHAINS" if is_diverted else "STALLION_4X4",
        "path_coordinates": path_coords,
        "waypoints": waypoints,
        "advisory_notes": (
            "AVALANCHE RE-ROUTE ACTIVE: Extra transit time +4.2 hrs. Deploy anti-skid chains."
            if is_diverted
            else "NORMAL HIGHWAY CLEARANCE: Primary axis open. Speed limit 40 km/h."
        )
    }
