"""
Server runner for Project Rudra-Logistics Backend
"""
import uvicorn

if __name__ == "__main__":
    print("=" * 60)
    print(" PROJECT RUDRA-LOGISTICS | TACTICAL COMMAND & CONTROL API ")
    print(" Target: Northern Command (14 Corps, Leh - Siachen Corridor) ")
    print(" Port: 8000 | Zero-Trust Air-Gapped Local Server ")
    print("=" * 60)
    uvicorn.run("Backend.main:app", host="0.0.0.0", port=8000, reload=True)
