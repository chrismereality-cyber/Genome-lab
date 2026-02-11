from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from bio.engine import EvolutionEngine
from physics.dynamics import PhysicsLayer
from utils.oath import check_oath

app = FastAPI(title="GenomeLab Phase 2")
bio_engine = EvolutionEngine()
physics_engine = PhysicsLayer()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

class EvolveRequest(BaseModel):
    dna: str
    mutation_rate: float = 1.0

@app.post("/evolve")
async def evolve(req: EvolveRequest):
    if not check_oath("Executing Phase 2 Evolution"):
        raise HTTPException(status_code=403, detail="Oath Violation")

    # Mutate and Translate
    mutated_dna = bio_engine.mutate(req.dna)
    protein = bio_engine.translate(mutated_dna)

    # NEW: Phase 2 Real Analysis
    bio_analysis = bio_engine.analyze_protein(protein)
    
    # Physics Placeholder
    physics_data = physics_engine.calculate_energy(protein)

    return {
        "dna": mutated_dna,
        "analysis": {
            "protein": protein,
            "stability": bio_analysis["stability"],
            "helix": bio_analysis["helix"],
            "aromaticity": bio_analysis["aromaticity"],
            "weight": bio_analysis["molecular_weight"],
            "energy": physics_data
        }
    }
