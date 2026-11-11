"""Session 03: a real public API supplies bibliographic metadata, never treatment rules."""
from datetime import datetime, timezone
import requests

PMID = "31573350"
PUBMED_URL = f"https://pubmed.ncbi.nlm.nih.gov/{PMID}/"
API_URL = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi"


def fetch_guideline_metadata(get=None) -> dict:
    """Fetch ATS/IDSA 2019 metadata from NCBI; errors are explicit, no invented fallback."""
    get = get or requests.get
    try:
        response = get(API_URL, params={"db": "pubmed", "id": PMID, "retmode": "json"},
                       headers={"User-Agent": "SIMUL-ANDE-educational-demo/0.1"}, timeout=10)
        response.raise_for_status()
        data = response.json()["result"][PMID]
        title = data["title"]
        if not isinstance(title, str) or "community-acquired pneumonia" not in title.lower():
            raise ValueError("Unexpected bibliographic record")
        return {"status": "verified_online", "provider": "NCBI PubMed E-utilities",
                "pmid": PMID, "title": title[:500], "journal": data.get("fulljournalname"),
                "publication_date": data.get("pubdate"), "url": PUBMED_URL,
                "retrieved_at": datetime.now(timezone.utc).isoformat(),
                "role": "Bibliografía complementaria ATS/IDSA; no modifica el guion peruano."}
    except (requests.RequestException, ValueError, KeyError, TypeError):
        return {"status": "unavailable", "provider": "NCBI PubMed E-utilities", "pmid": PMID,
                "url": PUBMED_URL, "message": "Consulta no disponible. No se recibieron metadatos verificables."}

