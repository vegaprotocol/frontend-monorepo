import os
from dotenv import load_dotenv

load_dotenv()

console_image_name = os.getenv(
    "CONSOLE_IMAGE_NAME", default="vegaprotocol/trading:develop"
)
vega_version = os.getenv("VEGA_VERSION", default="latest")
