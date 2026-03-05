"""
Task-level classification for internal TimeEntry records.

Instead of grouping by Project.internal_category (project-level),
this classifies each TimeEntry by matching its description field
against known task patterns (Jira keys, prefixes, keywords).
"""
import re

# --------------- Exclusion rules ---------------

EXCLUDED_PROJECTS = {"Appix-RRHH", "APPIX PMO", "HR"}

_HR_NO_LABORAL_RE = re.compile(r"no laboral|no labor", re.IGNORECASE)
_PMO_TRACKING_RE = re.compile(r"\bAP-1[23]\b")  # AP-12 Tracker, AP-13 Seguimiento


def is_hr_no_laboral(description: str) -> bool:
    return bool(_HR_NO_LABORAL_RE.search(description))


def is_excluded(description: str, project_name: str) -> bool:
    if project_name in EXCLUDED_PROJECTS:
        return True
    if _PMO_TRACKING_RE.search(description):
        return True
    return False


# --------------- Classification rules ---------------
# Order matters: first match wins.

_DAILYS_RE = re.compile(
    r"\bAT-2\b|\bREU-DAILY\b|\bREU-WEEKLY\b|\bDA-175\b",
    re.IGNORECASE,
)

_VENTAS_RE = re.compile(
    r"\bAT-66\b|\bMKT-|\bVA-\d+\b",
    re.IGNORECASE,
)
_VENTAS_KW_RE = re.compile(
    r"cotizaci[oó]n|prospecci[oó]n|seguimiento\s*crm|scope\s*of\s*work",
    re.IGNORECASE,
)
VENTAS_PROJECTS = {"VENTAS", "Ventas - Appix", "Ventas-Appix"}

_REUNIONES_RE = re.compile(
    r"\bAT-56\b|\bAT-61\b|\bREU-PLANNING\b|\bREU-COORDINACION\b"
    r"|\bREU-1ON1\b|\bREU-RETRO\b|\bREU-AVANCE\b|\bREU-INTERNA\b",
    re.IGNORECASE,
)
_REUNIONES_KW_RE = re.compile(
    r"planeaci[oó]n\s*y\s*organizaci[oó]n|juntas\s*appix",
    re.IGNORECASE,
)

_INNOVACION_RE = re.compile(
    r"\bINV-RD\b|\bDes-Seccion\b|\bDIS-MOCKUP\b|\bDIS-CONFIGURACION\b",
    re.IGNORECASE,
)
_INNOVACION_KW_RE = re.compile(
    r"pricing\s*ai",
    re.IGNORECASE,
)
INNOVACION_PROJECTS = {"APPIX DATA", "APPIX_APP_ADMIN", "Appix_App_Admin"}

_CAPACITACION_RE = re.compile(
    r"\bCAP-CURSO\b|\bCAP-AUTOESTUDIO\b|\bCAP-WORKSHOP\b",
    re.IGNORECASE,
)
_CAPACITACION_KW_RE = re.compile(
    r"autoestudi|taller|\btraining\b|\bcurso\b",
    re.IGNORECASE,
)
CAPACITACION_PROJECTS = {"Training"}

APPIX_GENERAL_PROJECTS = {"Appix General", "General Appix", "APPIX GENERAL"}

# Suspicious entries that should be flagged
SUSPICIOUS_TASKS_RE = re.compile(r"\bAT-156\b")  # Guías de Embarque → La Moderna


def classify_time_entry(description: str, project_name: str) -> str | None:
    """
    Classify a single internal TimeEntry into a goal category.

    Returns category key (DAILYS, VENTAS, etc.) or None if excluded/unclassified.
    """
    # Exclusions
    if is_excluded(description, project_name):
        return None
    if is_hr_no_laboral(description):
        return None

    desc = description or ""

    # 1. DAILYS
    if _DAILYS_RE.search(desc) or "daily" in desc.lower():
        return "DAILYS"

    # 2. CAPACITACION (keywords first — catches "training" under VENTAS project)
    if project_name in CAPACITACION_PROJECTS:
        return "CAPACITACION"
    if _CAPACITACION_RE.search(desc) or _CAPACITACION_KW_RE.search(desc):
        return "CAPACITACION"

    # 3. VENTAS
    if project_name in VENTAS_PROJECTS:
        return "VENTAS"
    if _VENTAS_RE.search(desc) or _VENTAS_KW_RE.search(desc):
        return "VENTAS"

    # 4. REUNIONES
    if _REUNIONES_RE.search(desc) or _REUNIONES_KW_RE.search(desc):
        return "REUNIONES"

    # 5. INNOVACION
    if project_name in INNOVACION_PROJECTS:
        return "INNOVACION"
    if _INNOVACION_RE.search(desc) or _INNOVACION_KW_RE.search(desc):
        return "INNOVACION"

    # 6. APPIX_GENERAL (catch-all for Appix General project)
    if project_name in APPIX_GENERAL_PROJECTS:
        return "APPIX_GENERAL"

    # Unclassified internal → None (excluded from goals)
    return None


# --------------- Goal category metadata ---------------

ALL_GOAL_CATEGORIES = [
    "DAILYS",
    "VENTAS",
    "REUNIONES",
    "INNOVACION",
    "CAPACITACION",
    "TTM",
    "AI_AGENTS",
    "ESTANDARIZACION",
    "APPIX_GENERAL",
]

GOAL_CATEGORY_LABELS = {
    "DAILYS": "Dailys",
    "VENTAS": "Ventas",
    "REUNIONES": "Reuniones y Planeación",
    "INNOVACION": "Innovación y Desarrollo",
    "CAPACITACION": "Capacitación",
    "TTM": "Reducción Time to Market",
    "AI_AGENTS": "Uso de Agentes de IA",
    "ESTANDARIZACION": "Estandarización de Componentes",
    "APPIX_GENERAL": "Appix General",
}
