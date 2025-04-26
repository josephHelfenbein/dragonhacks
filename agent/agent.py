# agent.py
import asyncio
from typing import Dict, Any, Optional
from dataclasses import dataclass, field
from langgraph.graph import StateGraph, END
from posture_tools import calibrate_posture_tool, posture_check_tool

@dataclass
class PostureState:
    """State for posture monitoring workflow."""
    calibrated: bool = False
    bad_posture_count: int = 0
    notification_shown: bool = False
    last_check_result: Optional[Dict[str, Any]] = None
    monitor_task: Optional[asyncio.Task] = None

graph = StateGraph(PostureState)

async def calibrate(state: PostureState):
    try:
        result = await calibrate_posture_tool()
        if result["status"] == "success":
            state.calibrated = True
            print("✅ Posture calibrated successfully!")
        else:
            print(f"❌ Calibration failed: {result.get('error', 'Unknown error')}")
    except Exception as e:
        print(f"❌ Unexpected error during calibration: {str(e)}")
    return state

async def check_posture(state: PostureState):
    if not state.calibrated:
        print("❌ Error: Calibration must happen first.")
        return state

    try:
        result = await posture_check_tool()
        state.last_check_result = result
        
        if result["status"] == "success":
            if not result["posture_good"]:
                state.bad_posture_count += 1
                state.notification_shown = True
                print(f"⚠️ Bad posture detected! Deviation: {result['deviation']:.2f}")
            else:
                print(f"✅ Posture looks good! Deviation: {result['deviation']:.2f}")
        else:
            print(f"❌ Posture check error: {result.get('error', 'Unknown error')}")
            
        async def continuous_monitoring():
            while True:
                try:
                    result = await posture_check_tool()
                    if result["status"] == "success":
                        if not result["posture_good"]:
                            if not state.notification_shown:
                                print(f"⚠️ Bad posture detected! Deviation: {result['deviation']:.2f}")
                                state.notification_shown = True
                            state.bad_posture_count += 1
                        else:
                            if state.notification_shown:
                                print(f"✅ Posture corrected! Deviation: {result['deviation']:.2f}")
                                state.notification_shown = False
                    else:
                        print(f"❌ Check error: {result.get('error', 'Unknown error')}")
                except Exception as e:
                    print(f"❌ Monitoring error: {str(e)}")
                await asyncio.sleep(5)
        
        monitor_task = asyncio.create_task(continuous_monitoring())
        
        state.monitor_task = monitor_task
        
    except Exception as e:
        print(f"❌ Error setting up posture monitoring: {str(e)}")
    
    return state

graph.add_node("calibrate", calibrate)
graph.add_node("check_posture", check_posture)
graph.set_entry_point("calibrate")
graph.add_edge("calibrate", "check_posture")
graph.add_edge("check_posture", END)

workflow = graph.compile()

async def main():
    final_state = await workflow.ainvoke({})
    
    print("Posture monitoring is running in the background. Press Ctrl+C to exit.")
    try:
        while True:
            await asyncio.sleep(1)
    except KeyboardInterrupt:
        print("Monitoring stopped by user.")
    finally:
        if final_state.monitor_task:
            final_state.monitor_task.cancel()

if __name__ == "__main__":
    asyncio.run(main())