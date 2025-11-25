from typing import Dict, Any


def get_default_filters() -> Dict[str, Any]:
    """Return default filters structure for new users."""
    return {
        "stack": [],
        "experience": [],
        "keywords": [],
        "location": [],
        "jobType": [],
        "excludeKeywords": []
    }