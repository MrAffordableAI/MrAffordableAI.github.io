    item.shiny = q.get("shiny") === "1";
  }
  S.inbox.push(item);
  S.claimed.push(gid);
  save();
  history.replaceState({}, "", location.pathname);
  setTimeout(() => toast("A gift from " + from + " is waiting"), 400);
}

function boot() {
  S = load();
  dayReset();
  claimUrlGift();
  if (!S.started) showTitle();
  else enterMap();
  requestAnimationFrame(loop);
}
addEventListener("keydown", e => {
  keys[e.key.toLowerCase()] = true;
  if (e.key === " " && squeezeTap) { e.preventDefault(); squeezeTap(); }
  if (mode === "battle" && battle && !battle.lock) {
    const map = { "1": "squish", "2": "bounce", "3": "hug", "4": "pop", p: "power" };
    if (map[e.key.toLowerCase()]) playerMove(map[e.key.toLowerCase()]);
  }
  if (e.key === "Escape") closeSheet();
});
addEventListener("keyup", e => { keys[e.key.toLowerCase()] = false; });
document.addEventListener("visibilitychange", () => { if (S) save(); });
boot();
