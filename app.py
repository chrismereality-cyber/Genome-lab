import streamlit as st
import pandas as pd
import random
from Bio.Seq import Seq
from Bio.SeqUtils.ProtParam import ProteinAnalysis
import streamlit.components.v1 as components

# =========================
# Evolution Engine Module
# =========================
CODONS = [a+b+c for a in "ATCG" for b in "ATCG" for c in "ATCG"]

def mutate_codon(codon):
    pos = random.randint(0, 2)
    bases = ['A','T','C','G']
    current_base = codon[pos]
    if current_base in bases:
        bases.remove(current_base)
    return codon[:pos] + random.choice(bases) + codon[pos+1:]

def codon_mutation(sequence, mutation_rate):
    new_seq = ""
    for i in range(0, len(sequence)-2, 3):
        codon = sequence[i:i+3]
        if random.random() < mutation_rate/100:
            codon = mutate_codon(codon)
        new_seq += codon
    return new_seq

def calculate_stability(protein_seq):
    clean_seq = protein_seq.replace("*", "").replace("X", "")
    if len(clean_seq) < 5:
        return {"stability_score": 100, "status": "Too Short"}
    try:
        analysis = ProteinAnalysis(clean_seq)
        s_index = analysis.instability_index()
        return {"stability_score": s_index, "status": "Stable" if s_index < 40 else "Unstable"}
    except:
        return {"stability_score": 100, "status": "Error"}

# =========================
# Phase 2: Biophysics Module
# =========================
def get_physical_stats(protein_seq):
    clean_seq = protein_seq.replace("*", "").replace("X", "")
    if len(clean_seq) < 10: return None
    try:
        analysis = ProteinAnalysis(clean_seq)
        helix, turn, sheet = analysis.secondary_structure_fraction()
        return {
            "helix": helix * 100,
            "sheet": sheet * 100,
            "isoelectric_point": analysis.isoelectric_point(),
            "weight": analysis.molecular_weight() / 1000,
            "aromaticity": analysis.aromaticity()
        }
    except: return None

def environmental_stress_test(stats, temp, ph):
    if not stats: return 0
    survival_score = 100
    if temp > 40:
        survival_score -= (temp - 40) * (1 - stats['aromaticity']) * 5
    ph_diff = abs(ph - stats['isoelectric_point'])
    survival_score -= (ph_diff * 10)
    return max(survival_score, 0)

# =========================
# UI Components
# =========================
def mol_viewer(pdb_id="1A2W"):
    html_code = f"""
    <script src="https://3Dmol.org/build/3Dmol-min.js"></script>
    <div style="height: 400px; width: 100%; position: relative;" 
         class='viewer_3Dmoljs' data-pdb='{pdb_id}' 
         data-backgroundcolor='0x111111' data-style='cartoon:color=spectrum'></div>
    """
    components.html(html_code, height=400)

# =========================
# Main Interface
# =========================
st.set_page_config(page_title="GenomeLab Phase 2", layout="wide")
st.title("🧬 GenomeLab: Structural Evolution")

with st.sidebar:
    st.header("🧬 Genetic Controls")
    dna_input = st.text_area("Initial DNA", "ATGCGATCGATCGATCGATCGATCGATCGATCGATCGATC", height=100)
    gens = st.slider("Generations", 5, 100, 20)
    m_rate = st.slider("Mutation Rate (%)", 0.1, 5.0, 1.0)
    
    st.header("🌡️ Environmental Pressure")
    env_temp = st.slider("Temperature (°C)", 0, 100, 37)
    env_ph = st.slider("Acidity (pH)", 0.0, 14.0, 7.0)

if st.button("🚀 Run Phase 2 Simulation"):
    POP_SIZE = 12
    pop = [dna_input for _ in range(POP_SIZE)]
    stats_history = []
    
    for g in range(gens):
        scored_pop = []
        for dna in pop:
            dna = codon_mutation(dna, m_rate)
            prot = str(Seq(dna).translate(to_stop=True))
            phys = get_physical_stats(prot)
            stab = calculate_stability(prot)
            
            # Complex Fitness
            base_fit = 100 - stab['stability_score']
            survival_mult = environmental_stress_test(phys, env_temp, env_ph) if phys else 0
            final_score = (base_fit + (len(prot) * 0.5)) * (survival_mult / 100)
            
            scored_pop.append((dna, prot, final_score, phys))
        
        scored_pop.sort(key=lambda x: x[2], reverse=True)
        pop = [x[0] for x in scored_pop[:6]] * 2
        
        stats_history.append({
            "Gen": g, 
            "Avg Fitness": sum(s[2] for s in scored_pop)/POP_SIZE,
            "Helix %": scored_pop[0][3]['helix'] if scored_pop[0][3] else 0
        })

    c1, c2, c3 = st.columns(3)
    with c1:
        st.subheader("Fitness Trend")
        st.line_chart(pd.DataFrame(stats_history).set_index("Gen")[["Avg Fitness"]])
    with c2:
        st.subheader("Structural Trend")
        st.line_chart(pd.DataFrame(stats_history).set_index("Gen")[["Helix %"]])
    with c3:
        st.subheader("Champion Profile")
        best = scored_pop[0]
        if best[3]:
            st.metric("Molecular Weight", f"{best[3]['weight']:.1f} kDa")
            st.metric("Isoelectric Point", f"{best[3]['isoelectric_point']:.2f} pI")
            st.progress(best[3]['helix']/100, text="Alpha Helix Content")

    st.divider()
    st.subheader("Final Champion Protein")
    st.code(scored_pop[0][1])
    mol_viewer()
