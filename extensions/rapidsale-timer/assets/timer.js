(async function () {
  const containers = document.querySelectorAll(".rapidsale-timer");

  containers.forEach(async (el) => {
    const timerId = "cmjybf6x70001chrsrk1oy8qp";
    if (!timerId) return;

    try {
      const res = await fetch(
        `/apps/rapidsale/timer/cmjybf6x70001chrsrk1oy8qp`,
      );
      if (!res.ok) throw new Error("Timer fetch failed");

      const timer = await res.json();

      renderTimer(el, timer);
    } catch (err) {
      el.innerHTML = "<p>Failed to load timer.</p>";
      console.error(err);
    }
  });

  function renderTimer(container, timer) {
    container.innerHTML = `
      <div
        style="
          background:${timer.bgColor};
          border:${timer.borderSize}px solid ${timer.borderColor};
          border-radius:${timer.borderRadius}px;
          padding:${timer.paddingTopBottom}px ${timer.paddingInside}px;
          text-align:center;
          font-family:${timer.fontFamily === "theme" ? "inherit" : timer.fontFamily};
        "
      >
        <div
          style="
            font-size:${timer.titleSize}px;
            color:${timer.titleColor};
            margin-bottom:8px;
          "
        >
          ${timer.title}
        </div>

        <div class="rapidsale-time" style="font-size:32px;font-weight:600;">
          -- : -- : -- : --
        </div>

        ${
          timer.buttonText
            ? `<a
                href="${timer.link || "#"}"
                style="
                  display:inline-block;
                  margin-top:10px;
                  padding:10px 18px;
                  background:#000;
                  color:#fff;
                  text-decoration:none;
                  border-radius:6px;
                "
              >
                ${timer.buttonText}
              </a>`
            : ""
        }
      </div>
    `;

    startCountdown(container.querySelector(".rapidsale-time"), timer);
  }

  function startCountdown(el, timer) {
    let endTime;

    if (timer.timerType === "date") {
      endTime = new Date(`${timer.endDate}T${timer.endTime}`).getTime();
    } else {
      endTime = Date.now() + Number(timer.fixedMinutes) * 60 * 1000;
    }

    const tick = () => {
      const diff = endTime - Date.now();
      if (diff <= 0) {
        el.textContent = "00 : 00 : 00 : 00";
        return;
      }

      const total = Math.floor(diff / 1000);
      const days = Math.floor(total / 86400);
      const hrs = Math.floor((total % 86400) / 3600);
      const mins = Math.floor((total % 3600) / 60);
      const secs = total % 60;

      el.textContent =
        `${String(days).padStart(2, "0")} : ` +
        `${String(hrs).padStart(2, "0")} : ` +
        `${String(mins).padStart(2, "0")} : ` +
        `${String(secs).padStart(2, "0")}`;
    };

    tick();
    setInterval(tick, 1000);
  }
})();
