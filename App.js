import { useState, useEffect } from "react";
import "./App.css";

const EMOJIS = ['🐉','🦄','🤖','💀','🐱','🔥','🐲','👾','🦊','🐼'];
const MIN_DMG = 10, MAX_DMG = 30;
const HEAL_AMOUNT = 12;

export default function App() {
  const [mode, setMode] = useState("local");
  const [p1, setP1] = useState({ emoji: null, hp: 100, healed: false });
  const [p2, setP2] = useState({ emoji: null, hp: 100, healed: false });
  const [started, setStarted] = useState(false);
  const [turn, setTurn] = useState(null);
  const [log, setLog] = useState([]);

  const logMsg = (msg) =>
    setLog((l) => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...l]);

  const startGame = () => {
    if (!p1.emoji) return alert("Player 1: pick an emoji");
    if (!p2.emoji && mode === "local") return alert("Player 2: pick an emoji");

    let p2Emoji = p2.emoji;
    if (mode === "ai" && !p2Emoji) {
      p2Emoji = EMOJIS[Math.floor(Math.random() * EMOJIS.length)];
      setP2({ emoji: p2Emoji, hp: 100, healed: false });
      logMsg(`AI auto-picked ${p2Emoji}`);
    }

    setP1((p) => ({ ...p, hp: 100, healed: false }));
    setP2((p) => ({ ...p, hp: 100, healed: false }));
    setStarted(true);
    const first = Math.random() < 0.5 ? "p1" : "p2";
    setTurn(first);
    logMsg(`Battle starts! ${first === "p1" ? "Player 1" : mode === "ai" ? "AI" : "Player 2"} goes first.`);
  };

  const computeDamage = () =>
    Math.floor(Math.random() * (MAX_DMG - MIN_DMG + 1)) + MIN_DMG;

  const doAttack = (attacker) => {
    if (!started || turn !== attacker) return;
    const defender = attacker === "p1" ? "p2" : "p1";
    const dmg = computeDamage();
    if (defender === "p1") setP1((p) => ({ ...p, hp: Math.max(0, p.hp - dmg) }));
    else setP2((p) => ({ ...p, hp: Math.max(0, p.hp - dmg) }));

    logMsg(
      `${attacker === "p1" ? "Player 1" : mode === "ai" && attacker === "p2" ? "AI" : "Player 2"} hits ${
        defender === "p1" ? "Player 1" : "Player 2"
      } for ${dmg} damage`
    );

    setTimeout(() => {
      const newDef = defender === "p1" ? p1 : p2;
      if (newDef.hp - dmg <= 0) {
        setStarted(false);
        logMsg(`${attacker === "p1" ? "Player 1" : mode === "ai" ? "AI" : "Player 2"} wins the battle!`);
      } else {
        setTurn(defender);
      }
    }, 300);
  };

  const heal = () => {
    if (!started) return alert("Start the battle first");
    const current = turn;
    const setFunc = current === "p1" ? setP1 : setP2;
    const player = current === "p1" ? p1 : p2;

    if (player.healed) return alert("You already used heal this game");

    setFunc({ ...player, hp: Math.min(100, player.hp + HEAL_AMOUNT), healed: true });
    logMsg(`${current === "p1" ? "Player 1" : mode === "ai" ? "AI" : "Player 2"} heals +${HEAL_AMOUNT}`);
    setTurn(current === "p1" ? "p2" : "p1");
  };

  // Simple AI
  useEffect(() => {
    if (mode === "ai" && started && turn === "p2") {
      setTimeout(() => {
        const shouldHeal = p2.hp <= 45 && !p2.healed && Math.random() < 0.35;
        if (shouldHeal) heal();
        else doAttack("p2");
      }, 700);
    }
  }, [turn, started]);

  const reset = () => {
    setP1({ emoji: null, hp: 100, healed: false });
    setP2({ emoji: null, hp: 100, healed: false });
    setStarted(false);
    setTurn(null);
    setLog([]);
  };

  return (
    <div className="wrap">
      <header>
        <div>
          <h1>Emoji Battle Arena — React</h1>
          <div className="muted small">Play vs friend or AI (no server)</div>
        </div>
        <div style={{ marginLeft: "auto" }}>
          <label className="muted small">Mode:</label>{" "}
          <select
            value={mode}
            onChange={(e) => {
              setMode(e.target.value);
              reset();
            }}
            style={{
              padding: 6,
              borderRadius: 8,
              background: "rgba(255,255,255,0.02)",
              color: "#eaf6ff",
              border: "1px solid rgba(255,255,255,0.04)",
            }}
          >
            <option value="local">Two players (same device)</option>
            <option value="ai">Play vs AI</option>
          </select>
        </div>
      </header>

      <div className="card">
        <div className="board">
          {[{ id: "p1", title: "Player 1", data: p1, setter: setP1 },
            { id: "p2", title: mode === "ai" ? "AI" : "Player 2", data: p2, setter: setP2 }].map(
            (pl) => (
              <div key={pl.id} className="card center">
                <h3>{pl.title}</h3>
                <div className="center" style={{ gap: 10, marginTop: 10 }}>
                  <div className="big-emoji">{pl.data.emoji || "❓"}</div>
                  <div className="hp-bar">
                    <div className="hp-fill" style={{ width: `${pl.data.hp}%` }}></div>
                  </div>
                  <div className="hp-text">HP: {pl.data.hp}</div>
                </div>
                <div style={{ marginTop: 12 }}>
                  <div className="muted small">Pick emoji:</div>
                  <div style={{ marginTop: 8 }}>
                    {EMOJIS.map((e) => (
                      <button
                        key={e}
                        className={`emoji-btn ${pl.data.emoji === e ? "selected" : ""}`}
                        disabled={mode === "ai" && pl.id === "p2"}
                        onClick={() => {
                          pl.setter({ ...pl.data, emoji: e });
                          logMsg(`${pl.title} picked ${e}`);
                        }}
                      >
                        {e}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )
          )}
        </div>

        <div style={{ display: "flex", gap: 18, alignItems: "center", marginTop: 18 }}>
          <div>
            <button className="primary" onClick={startGame}>
              Start Battle
            </button>
            <button
              className="primary"
              style={{ background: "var(--danger)", marginLeft: 8 }}
              disabled={!started}
              onClick={() => doAttack(turn)}
            >
              Attack
            </button>
          </div>
          <div className="muted small">
            Turn: {started ? (turn === "p1" ? "Player 1" : mode === "ai" ? "AI" : "Player 2") : "—"}
          </div>
          <div style={{ marginLeft: "auto" }}>
            <button className="ghost" onClick={heal}>Heal (+12)</button>
            <button className="ghost" style={{ marginLeft: 8 }} onClick={reset}>
              Reset
            </button>
          </div>
        </div>

        <div className="log" style={{ marginTop: 12, maxHeight: 160, overflow: "auto" }}>
          {log.length === 0 ? (
            <div className="muted">Game log will appear here.</div>
          ) : (
            log.map((l, i) => <div key={i}>{l}</div>)
          )}
        </div>
      </div>

      <footer>
        Tip: open the page in two windows for local two-player, or choose “Play vs AI”.
      </footer>
    </div>
  );
}
