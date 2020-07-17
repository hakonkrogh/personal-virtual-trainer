import React, { useReducer, useEffect } from "react";
import produce from "immer";

const config = {
  runs: 8,
  run: [
    {
      activity: "get-ready",
      duration: 4,
    },
    {
      activity: "up",
      duration: 4,
    },
    {
      activity: "down",
      duration: 4,
    },
    {
      activity: "relax",
      duration: 60 * 2 - 5,
    },
  ],
};

const defaultState = {
  status: "idle",
  activity: "",
  time: 0,
  run: 0,
  progress: 0,
  lastTick: Date.now(),
};

function Progress({ progress }) {
  return (
    <div className="progress">
      <span style={{ width: progress * 100 + "%" }} />
    </div>
  );
}

const reducer = produce((draft, { type }) => {
  switch (type) {
    case "toggle": {
      switch (draft.status) {
        case "idle": {
          draft.status = "running";
          draft.activity = config.run[0].activity;
          draft.time = 0;
          draft.progress = 0;
          draft.lastTick = Date.now();
          break;
        }
        case "paused": {
          draft.status = "running";
          draft.lastTick = Date.now();
          break;
        }
        case "running": {
          draft.status = "paused";
          break;
        }
      }
      break;
    }
    case "reset": {
      draft.status = "idle";
      draft.time = 0;
      draft.progress = 0;
      break;
    }
    case "tick": {
      if (draft.status === "running") {
        draft.time += Date.now() - draft.lastTick;
        draft.lastTick = Date.now();

        const activityIndex = config.run.findIndex(
          (r) => r.activity === draft.activity
        );
        const activity = config.run[activityIndex];
        draft.progress = draft.time / 1000 / activity.duration;

        if (draft.progress > 1) {
          const next = config.run[activityIndex + 1] || config.run[0];
          draft.activity = next.activity;
          draft.time = 0;
          draft.progress = 0;

          if (config.run[0] === next) {
            draft.run++;
          }
        }
      }
    }
  }

  return draft;
});

export default function IndexPage() {
  const [{ status, activity, progress }, dispatch] = useReducer(
    reducer,
    defaultState
  );

  useEffect(() => {
    function tick() {
      dispatch({ type: "tick" });
    }

    const interval = setInterval(tick, 10);

    return () => clearInterval(interval);
  }, [dispatch]);

  return (
    <div>
      <div className="hero bg-blue-800 p-8">
        <h1 className="title text-white">Personlig Virtuell Trener</h1>
      </div>
      <div className="flex justify-center p-4 space-x-4">
        <button
          className="btn-blue w-32"
          onClick={() => dispatch({ type: "toggle" })}
        >
          {status === "idle" && "Start"}
          {status === "paused" && "Gjenoppta"}
          {status === "running" && "Pause"}
        </button>
        <button
          className="btn-gray"
          disabled={status === "idle"}
          onClick={() => dispatch({ type: "reset" })}
        >
          Start på nytt
        </button>
      </div>
      {status !== "idle" && (
        <div>
          <Progress progress={progress} />
          <div className="flex justify-center align-center py-10 text-4xl text-center">
            {activity === "get-ready" && "Gjør deg klar"}
            {activity === "up" && (
              <span>
                ↑<br />
                Tåhev
              </span>
            )}
            {activity === "down" && (
              <span>
                Tåsenk
                <br />↓
              </span>
            )}
            {activity === "relax" && "Slapp av"}
          </div>
        </div>
      )}
    </div>
  );
}
