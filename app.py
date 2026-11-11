"""SIMUL-ANDE: a fictional six-decision clinical teaching journey."""
from __future__ import annotations

import json
import os
import pandas as pd
import plotly.graph_objects as go
import streamlit as st
from dotenv import load_dotenv

from engine import (ROOT, DOMAINS, RuleViolation, acknowledge_correction, confirm_decision,
                    confirm_inventory, export_attempt, get_option, load_case,
                    new_attempt, option_label, outcome)
from sources_api import PUBMED_URL, fetch_guideline_metadata
from tutor import Settings, complete_tutor, validate_selection, eligible_decisions

load_dotenv(ROOT / ".env")
st.set_page_config(page_title="SIMUL-ANDE · Práctica con contexto", page_icon="⛰️", layout="wide")
st.markdown("""<style>
.block-container {max-width:1180px;padding-top:4.5rem;padding-bottom:3rem}
h1 {letter-spacing:-1.5px} div[data-testid="stMetric"] {background:#e8efec;border-radius:12px;padding:12px}
div[data-testid="stRadio"] label {line-height:1.6} .stButton button {border-radius:9px}
</style>""", unsafe_allow_html=True)

try:
    case = load_case()
except Exception:
    st.error("El contenido del caso no superó la validación. Revisa los archivos de datos antes de continuar.")
    st.stop()


def start_attempt(facility_id):
    st.session_state.attempt = new_attempt(case, facility_id)
    st.session_state.action_error = None


def accept_inventory():
    st.session_state.attempt = confirm_inventory(st.session_state.attempt)


def submit_decision(decision_id, widget_key):
    selected = st.session_state.get(widget_key)
    st.session_state.action_error = None
    if selected is None:
        st.session_state.action_error = "Selecciona una alternativa antes de confirmar."
        return
    try:
        st.session_state.attempt = confirm_decision(st.session_state.attempt, case, decision_id, selected)
    except RuleViolation as error:
        st.session_state.action_error = str(error)


def correct_decision(decision_id):
    st.session_state.action_error = None
    try:
        st.session_state.attempt = acknowledge_correction(st.session_state.attempt, case, decision_id)
    except RuleViolation as error:
        st.session_state.action_error = str(error)


def reset_attempt():
    st.session_state.pop("attempt", None)
    st.session_state.pop("inventory_seen", None)
    st.session_state.action_error = None


def select_reflection():
    config = dict(os.environ)
    try:
        config.update(dict(st.secrets))
    except (FileNotFoundError, st.errors.StreamlitSecretNotFoundError):
        pass
    complete_tutor(st.session_state.attempt, case, Settings.from_mapping(config))


def source_links(decision):
    evidence = {e["id"]: e for e in case["evidence"]}
    sources = {s["id"]: s for s in case["sources"]}
    for evidence_id in decision["evidence_ids"]:
        item = evidence[evidence_id]
        st.caption(f"{evidence_id} · {item['locator']} · tipo: {item['type']}; certeza: {item['certainty'] or 'no asignada'}")
        for source_id in item["source_ids"]:
            source = sources[source_id]
            st.markdown(f"[{source_id} · {source['title']}]({source['url']})")
    for source_id in decision["source_ids"]:
        source = sources[source_id]
        st.markdown(f"[{source_id} · {source['title']}]({source['url']}) · {source['locator']}")
    st.caption("Adaptación docente pendiente: " + ", ".join(decision["medical_validation_ids"]))


RESOURCE_NAMES = {"basic_assessment": "Evaluación básica", "oxygen": "Fuente de oxígeno",
                  "iv_administration": "Administración EV", "ceftriaxone_1g": "Ceftriaxona · vial 1 g",
                  "azithromycin_500mg": "Azitromicina · tableta 500 mg", "amoxicillin_500mg": "Amoxicilina · tableta 500 mg",
                  "chest_xray": "Radiografía de tórax", "cbc_urea": "Hemograma / urea"}


def inventory(facility):
    st.markdown(f"**{facility['label']} · referencia {facility['category_reference']}**")
    st.caption(f"10:00 · 100 m s. n. m. · horario {facility['opening_hours']}. Todos los recursos y tiempos son ficticios.")
    rows = [{"Recurso": RESOURCE_NAMES[r["id"]], "Disponible": "Sí" if r["available"] else "No",
             "Autorizado en guion": "Sí" if r["authorized_in_scenario"] else "No",
             "Personal / insumos": "Sí" if r["staff_present"] and r["supplies_present"] else "No",
             "Cantidad": r["quantity"], "Detalle": r["notes"]} for r in facility["resources"]]
    st.dataframe(pd.DataFrame(rows), hide_index=True, width="stretch")
    t = facility["transport"]
    st.write(f"Traslado asistido: salida coordinable en {t['dispatch_min']} min; viaje {t['travel_min']} min. "
             f"Oxígeno independiente del transporte: autonomía ficticia {t['oxygen_autonomy_min']} min.")
    st.write(f"Camas: {facility['beds']['free']} libres de {facility['beds']['total']}. Capacidad insuficiente para este caso. "
             "Sin UCI, ventilación mecánica, vasopresores, tomografía, gasometría ni cultivos inmediatos.")
    oxygen = next(r for r in facility["resources"] if r["id"] == "oxygen")
    st.caption(f"Oxígeno en establecimiento: {oxygen['autonomy_min']} min de autonomía docente. No se calcula flujo ni consumo fisiológico.")
    staff_names = {"physician": "médicos", "nurse": "enfermeras", "nursing_technician": "técnicos",
                   "laboratory_staff": "laboratoristas", "radiology_technologist": "tecnólogos de radiología"}
    st.caption("Equipo presente: " + ", ".join(f"{staff_names[k]}: {v}" for k, v in facility["staff_on_duty"].items()))


def patient_panel(state):
    p = case["patient"]
    with st.container(border=True):
        st.markdown("### El paciente ficticio")
        st.write("Varón · 68 años · 70 kg · 100 m s. n. m.")
        st.write(p["chief_complaint"])
        st.write(p["exam"])
        st.markdown("**Signos iniciales · no representan evolución**")
        st.write("SpO₂ **88 %** al aire ambiente · FR **32/min**")
        st.write("PA **112/68** mmHg · FC **112/min** · T **38,5 °C**")
        st.caption("Señal oximétrica confirmada. No se simula respuesta fisiológica.")
    with st.expander("Recursos del turno", expanded=False):
        inventory(state["facility"])
    if state["history_ids"]:
        with st.expander("Historia revelada", expanded=state["step"] == 4):
            if state["history_revealed_by_correction"]:
                st.warning("Antecedentes completados por corrección docente; no recuperan puntos.")
            for h in p["history"]:
                if h["id"] in state["history_ids"]:
                    st.markdown(f"**{h['topic']}:** {h['answer']}")
    if state["tests"]:
        with st.expander("Exámenes del guion", expanded=True):
            for test_id, result in state["tests"].items():
                st.write(f"**{RESOURCE_NAMES[test_id]}:** {result['result'] or 'Pendiente al traslado; sin valor disponible.'}")
            if "chest_xray" in state["tests"]:
                st.caption("RX sintética: salto docente de 20 min mientras continúa coordinación. No añade demora evitable.")


def show_result(state):
    st.markdown("## Tu recorrido, explicado")
    (st.error if state["critical_flags"] else st.info)(outcome(state))
    cols = st.columns(3)
    cols[0].metric("Puntos formativos", f"{sum(state['scores'].values())} / 100")
    cols[1].metric("Decisiones críticas", len(state["critical_flags"]))
    cols[2].metric("Demora evitable ficticia", f"{state['avoidable_delay_min']} min")
    maxima = case["scoring"]["max_by_domain"]
    domains = list(DOMAINS)
    fig = go.Figure(go.Bar(x=[100 * state["scores"][k] / maxima[k] for k in domains],
                           y=[DOMAINS[k] for k in domains], orientation="h",
                           text=[f"{state['scores'][k]} / {maxima[k]}" for k in domains],
                           textposition="auto", marker_color=["#007c78", "#376e5c", "#c48535", "#628f85"],
                           hovertemplate="%{y}: %{text} puntos<extra></extra>"))
    fig.update_layout(height=270, margin=dict(l=0, r=20, t=10, b=0),
                      xaxis=dict(range=[0, 100], title="Porcentaje del máximo del dominio"),
                      yaxis=dict(autorange="reversed"), paper_bgcolor="rgba(0,0,0,0)", plot_bgcolor="rgba(0,0,0,0)")
    st.plotly_chart(fig, width="stretch")
    st.caption("Herramienta del curso: dashboard (sesión 05). Datos de este intento. No es certificación ni pronóstico.")
    st.write("CRB-65 de referencia: **2** (edad 1 + respiración 1 + presión 0 + confusión 0). "
             "CURB-65 y clasificación ATS/IDSA: **incompletos**; urea, PaO₂/FiO₂ y otros datos siguen desconocidos.")
    for choice in state["choices"]:
        decision, option = get_option(case, choice["decision_id"], choice["option_id"])
        with st.expander(f"{decision['id']} · {decision['title']} · {sum(choice['score'].values())} puntos"):
            st.write("Tu primera elección: " + option_label(option, state["facility_id"]))
            st.write(choice["consequence"])
            st.write("Plan esperado: " + option_label(decision["options"][0], state["facility_id"]))
            if decision["id"] == "D3":
                st.caption("D3-B también recibe el máximo: solicitar más exámenes no otorga más puntos.")
            source_links(decision)
    st.markdown("### Una pregunta para el siguiente intento")
    st.caption("La IA opcional elige IDs; el texto es local. El puntaje nunca depende del modelo.")
    if state["tutor"] is None:
        st.button("Seleccionar reflexión", type="primary", on_click=select_reflection, key="select_reflection")
    if state["tutor"]:
        result = state["tutor"]
        record = validate_selection(result["selection"], eligible_decisions(state, case), case)
        if result["mode"] == "provider":
            st.success(f"Selección recibida y validada desde Gemini · {result['model']}")
        else:
            st.info("Reflexión seleccionada por reglas locales; IA no disponible.")
        st.write(record["text"])
        st.markdown(f"**{record['question']}**")
        cost = result["estimated_cost_usd"]
        input_tokens = result['input_tokens'] if result['input_tokens'] is not None else 'no medidos'
        output_tokens = result['output_tokens'] if result['output_tokens'] is not None else 'no medidos'
        st.caption(f"Tokens entrada/salida: {input_tokens} / {output_tokens}. "
                   + (f"Costo estimado: USD {cost:.8f}." if cost is not None else "Costo no medido."))
    st.download_button("Descargar resultado anónimo · JSON",
                       json.dumps(export_attempt(state, case), ensure_ascii=False, indent=2),
                       file_name=f"simul-ande-{state['facility_id']}.json", mime="application/json")
    st.caption("Sin nombres, correos, justificaciones ni claves. El progreso vive en esta sesión; recargar puede perderlo.")
    st.button("Comenzar otro intento", on_click=reset_attempt, key="reset_attempt")


st.caption("SIMULACIÓN CLÍNICA CON CONTEXTO PERUANO")
st.title("SIMUL-ANDE")
st.markdown("Decide con lo que tienes. Coordina lo que falta.")
st.warning("Práctica educativa con un caso ficticio. El contenido clínico está en revisión médica (VM-01 a VM-05). "
           "No utilizar para atender pacientes reales.")
simulator, references, about = st.tabs(["Practicar el caso", "Fuentes y herramientas", "El proyecto"])

with simulator:
    if st.session_state.get("action_error"):
        st.error(st.session_state.action_error)
    if "attempt" not in st.session_state:
        st.markdown("## Un turno. Seis decisiones.")
        st.write("Acompaña la atención de un adulto con neumonía probable, desde la prioridad inicial hasta una transferencia preparada. "
                 "Practica razonamiento, seguridad, recursos y referencia. No necesitas una cuenta.")
        facility_id = st.selectbox("Elige el establecimiento ficticio", [f["id"] for f in case["facilities"]],
                                   format_func=lambda value: next(f"{f['category_reference']} · {f['label']}" for f in case["facilities"] if f["id"] == value))
        facility = next(f for f in case["facilities"] if f["id"] == facility_id)
        inventory(facility)
        st.caption("La categoría es una referencia; no acredita stock ni autorización de una IPRESS real. "
                   "Tiempo objetivo de práctica: 8–12 min. Sin datos de pacientes reales.")
        st.button("Iniciar práctica", type="primary", on_click=start_attempt, args=(facility_id,), key="start_attempt")
    else:
        state = st.session_state.attempt
        st.caption(f"{state['facility']['label']} · {state['facility']['category_reference']} · caso {state['case_id']} v{state['case_version']}")
        if state["critical_flags"]:
            st.error("Se identificó una decisión crítica. La corrección docente permite aprender y conserva el error original.")
        if not state["inventory_confirmed"]:
            st.markdown("## Confirma el turno antes de decidir")
            inventory(state["facility"])
            seen = st.checkbox("He revisado recursos, límites y logística del turno ficticio.", key="inventory_seen")
            st.button("Confirmar recursos y atender", type="primary", disabled=not seen,
                      on_click=accept_inventory, key="accept_inventory")
        elif state["completed_at"]:
            show_result(state)
        else:
            st.progress(state["step"] / 6, text=f"{state['step']} de 6 decisiones confirmadas")
            work, context = st.columns([1.65, 1], gap="large")
            with context:
                patient_panel(state)
            with work:
                if state["choices"]:
                    previous = state["choices"][-1]
                    st.info(f"{previous['decision_id']} · {previous['consequence']} Primera elección registrada.")
                if state["pending_correction"]:
                    decision_id = state["pending_correction"]
                    decision = next(d for d in case["decisions"] if d["id"] == decision_id)
                    st.markdown("## Pausa docente")
                    st.write(next(f["text"] for f in case["feedback_catalog"] if f["decision_id"] == decision_id))
                    st.write("Plan seguro del guion: " + option_label(decision["options"][0], state["facility_id"]))
                    source_links(decision)
                    st.button("He revisado la corrección; continuar con el plan seguro", type="primary",
                              on_click=correct_decision, args=(decision_id,), key=f"correct_{decision_id}")
                else:
                    decision = case["decisions"][state["step"]]
                    st.markdown(f"## {decision['id']} · {decision['title']}")
                    st.caption("Elige una alternativa. La primera confirmación se conserva.")
                    if decision["id"] == "D5":
                        st.info("TX01 · propuesta docente pendiente de VM-03: primera dosis simulada de ceftriaxona 2 g EV "
                                "+ azitromicina 500 mg VO. No es receta de un curso completo ni recomendación universal pretraslado.")
                        st.caption("Se verifican antecedentes, dos viales de 1 g, una tableta de 500 mg, autorización, personal e insumos.")
                    with st.form(f"decision_{state['attempt_id']}_{decision['id']}"):
                        widget_key = f"choice_{state['attempt_id']}_{decision['id']}"
                        selected = st.radio("¿Qué harías en este turno?", [o["id"] for o in decision["options"]], index=None,
                                            key=widget_key,
                                            format_func=lambda value: option_label(next(o for o in decision["options"] if o["id"] == value), state["facility_id"]))
                        st.form_submit_button("Confirmar decisión", type="primary", on_click=submit_decision,
                                              args=(decision["id"], widget_key))

with references:
    st.markdown("## Evidencia y procedencia")
    st.write("El caso usa la GPC IETSI–EsSalud 2025 como referencia. Los inventarios, tiempos y adaptaciones son docentes "
             "y requieren revisión. Abrir una fuente no equivale a validar clínicamente el producto.")
    for source in case["sources"]:
        st.markdown(f"[{source['id']} · {source['title']}]({source['url']})")
        st.caption(source["locator"])
    st.markdown("### Consultar bibliografía pública en vivo")
    st.write("Herramienta del curso: APIs (sesión 03). NCBI devuelve el título y fecha de la guía ATS/IDSA 2019, "
             "bibliografía complementaria de los criterios de severidad. No altera tratamientos, puntajes o fuentes del caso.")
    st.markdown(f"[Ficha de PubMed, PMID 31573350]({PUBMED_URL})")
    @st.cache_data(ttl=3600, show_spinner=False)
    def metadata_cached():
        return fetch_guideline_metadata()
    if st.button("Consultar API pública de PubMed"):
        with st.spinner("Consultando NCBI…"):
            st.session_state.source_metadata = metadata_cached()
    if "source_metadata" in st.session_state:
        metadata = st.session_state.source_metadata
        if metadata["status"] == "verified_online":
            st.success("Metadatos recibidos de NCBI; consulta verificable.")
            st.write(metadata["title"])
            st.caption(f"{metadata['journal']} · {metadata['publication_date']} · consulta UTC: {metadata['retrieved_at']}")
        else:
            st.warning(metadata["message"])
        st.json(metadata)

with about:
    st.markdown("## Practicar la decisión y su contexto")
    st.write("Prototipo de Victor Roman para Q-Lab PUCP. Un caso sintético, dos turnos ficticios, seis decisiones. "
             "Sin cuentas, pagos, ranking ni datos de pacientes. Revisión médica y tres entrevistas: pendientes.")
    st.markdown("**Herramientas incorporadas:** API pública bibliográfica (sesión 03), dashboard de intentos (05) "
                "y tutor opcional con JSON validado (08). La selección local de respaldo no se presenta como IA.")
    st.write("Hipótesis comercial: piloto docente de cuatro semanas para hasta 30 participantes a S/300. "
             "Sin ventas ni disposición de pago comprobadas.")
    st.caption("Caso v0.1.0 · aplicación v0.1.0 · revisión pendiente · los puntajes no certifican competencia clínica.")
