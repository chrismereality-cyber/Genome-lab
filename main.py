from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from Bio.Seq import Seq
from Bio.SeqUtils.ProtParam import ProteinAnalysis
import random

app = FastAPI(title="GenomeLab API")

# Enable CORS so your React App on Vercel can talk to it
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, replace with your Vercel URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class BioRequest(BaseModel):
    dna: str
    mutation_rate: float = 1.0
    temp: float = 37.0
    ph: float = 7.0

# Reuse your Phase 2 logic here
def analyze_protein(dna):
    prot = str(Seq(dna).translate(to_stop=True))
    if len(prot) < 5: return None
    analysis = ProteinAnalysis(prot)
    helix, _, sheet = analysis.secondary_structure_fraction()
    return {
        "protein": prot,
        "stability": analysis.instability_index(),
        "isoelectric_point": analysis.isoelectric_point(),
        "helix": helix * 100,
        "sheet": sheet * 100
    }

@app.post("/evolve")
async def evolve_dna(req: BioRequest):
    # Quick 1-generation evolution for the API response
    new_dna = ""
    for i in range(0, len(req.dna)-2, 3):
        codon = req.dna[i:i+3]
        if random.random() < req.mutation_rate/100:
            pos = random.randint(0, 2)
            codon = codon[:pos] + random.choice("ATCG") + codon[pos+1:]
        new_dna += codon
    
    stats = analyze_protein(new_dna)
    if not stats:
        raise HTTPException(status_code=400, detail="DNA too short for analysis")
    
    return {"dna": new_dna, "analysis": stats}

@app.get("/health")
def health():
    return {"status": "online", "engine": "Phase 2"}
