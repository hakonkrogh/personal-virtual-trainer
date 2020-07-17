import React, { useReducer, useEffect } from "react";
import produce from "immer";

import RandomGiphy from "../components/random-giphy";

const config = {
  runs: 8,
  activities: [
    {
      message: <div>Gjør deg klar</div>,
      duration: 4,
    },
    {
      message: (
        <div>
          ↑<br />
          Tåhev
        </div>
      ),
      duration: 4,
    },
    {
      message: (
        <div>
          Tåsenk
          <br />↓
        </div>
      ),
      duration: 4,
    },
    {
      message: (
        <div>
          Slapp av
          <div>
            <RandomGiphy />
          </div>
        </div>
      ),
      duration: 60 * 2 - 4,
    },
  ],
};

const defaultState = {
  status: "idle",
  activityIndex: 0,
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
          draft.activityIndex = 0;
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

        const activity = config.activities[draft.activityIndex];
        draft.progress = draft.time / 1000 / activity.duration;

        if (draft.progress > 1) {
          draft.activityIndex++;
          draft.time = 0;
          draft.progress = 0;

          if (draft.activityIndex > config.activities.length - 1) {
            draft.activityIndex = 0;
            draft.run++;

            if (draft.run >= config.runs) {
              alert("Du er ferdig for i dag!");
              draft.status = "idle";
            }
          }
        }
      }
    }
  }

  return draft;
});

export default function IndexPage() {
  const [{ status, progress, activityIndex, run }, dispatch] = useReducer(
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
            <div>
              {config.activities[activityIndex]?.message}
              <div className="p-4">
                {run + 1} / {config.runs}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
