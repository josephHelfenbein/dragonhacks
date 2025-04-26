# agent/cup_detection.py

import os
import asyncio
from inference_sdk import InferenceHTTPClient
from posture_tools import safely_capture_frame


# API_KEY = "..........."

# hydration counter
hydration_count = 0

async def hydration_monitor(
    model_id: str = "nicolai-hoirup-nielsen/cup-detection-v2/3",
    threshold: float = 0.5,
    interval: float = 0.5,
):
    """
    Continuously captures frames and prints
    each time a cup appears in view.
    """
    client = InferenceHTTPClient(
        api_url="https://serverless.roboflow.com",
        api_key=API_KEY,
    )
    notified = False

    while True:
        # grab frame
        frame_res = await asyncio.to_thread(safely_capture_frame)
        if frame_res.get("status") == "success":
            img = frame_res["frame"]

            # run inference
            preds = await asyncio.to_thread(
                client.infer, img, model_id=model_id
            )

            # detect cup
            seen = any(
                p.get("confidence", 0) >= threshold
                for p in preds.get("predictions", [])
            )

            if seen and not notified:
                global hydration_count
                hydration_count += 1
                print(f" Hydration count = {hydration_count}")
                notified = True
            elif not seen:
                notified = False

        await asyncio.sleep(interval)
