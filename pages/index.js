import React, { useReducer, useEffect } from "react";
import produce from "immer";

import RandomGiphy from "../components/random-giphy";

function save(state) {
  try {
    localStorage.setItem(
      "pvt.state",
      JSON.stringify({
        date: Date.now(),
        state,
      })
    );
  } catch (e) {}
}

function retrieve() {
  try {
    const state = localStorage.getItem("pvt.state");

    return JSON.parse(state);
  } catch (e) {}

  return null;
}

const config = {
  runs: 8,
  activities: [
    {
      message: () => <div>Gjør deg klar</div>,
      duration: 4,
    },
    {
      message: () => (
        <div>
          ↑<br />
          Tåhev
        </div>
      ),
      duration: 4,
    },
    {
      message: () => (
        <div>
          Tåsenk
          <br />↓
        </div>
      ),
      duration: 4,
    },
    {
      message: ({ dispatch }) => (
        <div style={{ lineHeight: 1 }}>
          Slapp av...
          <div style={{ marginTop: -10, marginBottom: 10 }}>
            <a
              className="link-button"
              onClick={() => dispatch({ type: "skip" })}
              style={{ fontSize: ".5em" }}
            >
              (hopp over)
            </a>
          </div>
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

const reducer = produce((draft, { type, ...rest }) => {
  switch (type) {
    case "setRun": {
      draft.run = rest.run;
      break;
    }
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
      draft.run = 0;
      break;
    }
    case "skip": {
      draft.activityIndex = 0;
      draft.run++;
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
              draft.status = "idle";
            }
          }

          save(draft);
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

    const oldRun = retrieve();
    if (oldRun) {
      const today = new Date();
      const oldDay = new Date(oldRun.date);

      if (
        today.getFullYear() === oldDay.getFullYear() &&
        today.getMonth() === oldDay.getMonth() &&
        today.getDate() === oldDay.getDate()
      ) {
        dispatch({ type: "setRun", run: oldRun.state.run });
      }
    }

    return () => clearInterval(interval);
  }, [dispatch]);

  const activity = config.activities[activityIndex];

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

      {run === config.runs - 1 ? (
        <div style={{ textAlign: "center" }}>
          <h2 className="text-xl pb-2">Du er ferdig for dagen!</h2>
          <div>
            <RandomGiphy tag="Great job" />
          </div>
        </div>
      ) : (
        <>
          {status !== "idle" && (
            <div>
              <Progress progress={progress} />
              <div className="flex justify-center align-center py-4 text-4xl text-center">
                <div>
                  {activity?.message({ dispatch })}
                  <div className="p-4">
                    {run + 1} / {config.runs}
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
