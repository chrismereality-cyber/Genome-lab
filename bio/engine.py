from Bio.Seq import Seq
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
