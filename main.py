from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from bio.engine import EvolutionEngine
from physics.dynamics import PhysicsLayer
from utils.oath import check_oath

# Initialize Core Modules
app = FastAPI(title="GenomeLab Modular API")
bio_engine = EvolutionEngine()
physics_engine = PhysicsLayer()

# Enable CORS for Vercel Frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

class EvolveRequest(BaseModel):
    dna: str
    mutation_rate: float = 1.0
    temp: float = 37.0
    ph: float = 7.0

@app.get("/health")
def health():
    return {"status": "online", "modules": ["bio", "physics", "oath"]}

@app.post("/evolve")
async def evolve(req: EvolveRequest):
    # 1. Ethical Check
    if not check_oath(f"Evolving sequence: {req.dna[:10]}..."):
        raise HTTPException(status_code=403, detail="Ethical Oath Violation")

    # 2. Bio Mutation & Translation
    bio_engine.mutation_rate = req.mutation_rate
    mutated_dna = bio_engine.mutate(req.dna)
    protein = bio_engine.translate(mutated_dna)

    # 3. Physics Analysis (Phase 3 Integration)
    physics_data = physics_engine.calculate_energy(protein)

    # 4. Return Integrated Results
    return {
        "dna": mutated_dna,
        "analysis": {
            "protein": protein,
            "stability": 40.0, # Placeholder for Phase 2 stability engine
            "helix": 15.5,
            "energy": physics_data
        }
    }
