from Bio.Seq import Seq
from Bio.SeqUtils.ProtParam import ProteinAnalysis
import random

class EvolutionEngine:
    def __init__(self, mutation_rate=1.0):
        self.mutation_rate = mutation_rate
        self.codons = [a+b+c for a in "ATCG" for b in "ATCG" for c in "ATCG"]

    def mutate(self, sequence):
        new_seq = ""
        for i in range(0, len(sequence)-2, 3):
            codon = sequence[i:i+3]
            if random.random() < self.mutation_rate/100:
                pos = random.randint(0, 2)
                bases = list("ATCG")
                if codon[pos] in bases: bases.remove(codon[pos])
                codon = codon[:pos] + random.choice(bases) + codon[pos+1:]
            new_seq += codon
        return new_seq

    def translate(self, dna):
        return str(Seq(dna).translate(to_stop=True))

    def analyze_protein(self, protein_seq):
        """
        Phase 2: Structural & Stability Scoring
        Calculates stability based on Instability Index, Aromaticity, and Helix content.
        """
        if not protein_seq or len(protein_seq) < 3:
            return {"stability": 0, "helix": 0, "aromaticity": 0}
        
        analysis = ProteinAnalysis(protein_seq)
        
        # Stability: Biopython Instability Index (lower than 40 is usually stable)
        # We invert it for the UI so "higher is better"
        raw_stability = analysis.instability_index()
        normalized_stability = max(0, 100 - raw_stability)
        
        # Secondary Structure prediction (Helix fraction)
        helix_fraction = analysis.secondary_structure_fraction()[0] * 100
        
        return {
            "stability": normalized_stability,
            "helix": helix_fraction,
            "aromaticity": analysis.aromaticity() * 100,
            "molecular_weight": analysis.molecular_weight()
        }
