import logging
import time
from typing import Dict, Any, List
from fastapi import APIRouter
import httpx

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/currencies", tags=["Currencies & Exchange Rates"])

# Currencies required by user specifications
SUPPORTED_CURRENCIES: List[Dict[str, str]] = [
    {"code": "USD", "name": "US Dollar", "symbol": "$", "locale": "en-US", "flag": "🇺🇸"},
    {"code": "INR", "name": "Indian Rupee", "symbol": "₹", "locale": "en-IN", "flag": "🇮🇳"},
    {"code": "EUR", "name": "Euro", "symbol": "€", "locale": "de-DE", "flag": "🇪🇺"},
    {"code": "GBP", "name": "British Pound", "symbol": "£", "locale": "en-GB", "flag": "🇬🇧"},
    {"code": "JPY", "name": "Japanese Yen", "symbol": "¥", "locale": "ja-JP", "flag": "🇯🇵"},
    {"code": "AUD", "name": "Australian Dollar", "symbol": "A$", "locale": "en-AU", "flag": "🇦🇺"},
    {"code": "CAD", "name": "Canadian Dollar", "symbol": "C$", "locale": "en-CA", "flag": "🇨🇦"},
    {"code": "SGD", "name": "Singapore Dollar", "symbol": "S$", "locale": "en-SG", "flag": "🇸🇬"},
    {"code": "AED", "name": "UAE Dirham", "symbol": "د.إ", "locale": "ar-AE", "flag": "🇦🇪"},
]

# Baseline reliable fallback rates (1 USD = X target currency)
DEFAULT_RATES: Dict[str, float] = {
    "USD": 1.0,
    "INR": 84.50,
    "EUR": 0.93,
    "GBP": 0.79,
    "JPY": 154.20,
    "AUD": 1.53,
    "CAD": 1.39,
    "SGD": 1.34,
    "AED": 3.6725,
}

# Cache exchange rates in memory for 1 hour
_cached_rates: Dict[str, float] = DEFAULT_RATES.copy()
_last_fetch_timestamp: float = 0.0
_cache_ttl_seconds: float = 3600.0  # 1 hour cache
_rates_source: str = "cached"


def fetch_latest_rates() -> Dict[str, Any]:
    global _cached_rates, _last_fetch_timestamp, _rates_source
    now = time.time()

    # Return cached if within TTL
    if _last_fetch_timestamp > 0 and (now - _last_fetch_timestamp) < _cache_ttl_seconds:
        return {
            "base": "USD",
            "rates": _cached_rates,
            "source": _rates_source,
            "last_updated": int(_last_fetch_timestamp),
        }

    # Free, no-auth, public exchange rate API
    url = "https://open.er-api.com/v6/latest/USD"
    try:
        with httpx.Client(timeout=4.0) as client:
            resp = client.get(url)
            if resp.status_code == 200:
                data = resp.json()
                api_rates = data.get("rates", {})
                updated_rates = DEFAULT_RATES.copy()
                for cur in DEFAULT_RATES.keys():
                    if cur in api_rates and isinstance(api_rates[cur], (int, float)):
                        updated_rates[cur] = float(api_rates[cur])
                _cached_rates = updated_rates
                _last_fetch_timestamp = now
                _rates_source = "live"
                logger.info("Successfully fetched live exchange rates from open.er-api.com")
            else:
                _rates_source = "cached"
    except Exception as e:
        logger.info(f"Using cached exchange rates (offline / network notice: {e})")
        _rates_source = "cached"
        if _last_fetch_timestamp == 0.0:
            _last_fetch_timestamp = now

    return {
        "base": "USD",
        "rates": _cached_rates,
        "source": _rates_source,
        "last_updated": int(_last_fetch_timestamp),
    }


@router.get("")
def get_supported_currencies():
    """Returns list of supported currencies with symbols and metadata."""
    return {
        "base_currency": "USD",
        "currencies": SUPPORTED_CURRENCIES,
    }


@router.get("/rates")
def get_exchange_rates():
    """Returns current exchange rates against base USD with caching and fallback."""
    return fetch_latest_rates()
