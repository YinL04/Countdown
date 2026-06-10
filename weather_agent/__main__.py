"""Allow running weather_agent as a module: python -m weather_agent <city>"""

import sys
from .cli import main

# Default to JSON output when run as module
if "--json" not in sys.argv:
    sys.argv.append("--json")

main()
