(async function () {
  const containers = document.querySelectorAll(".rapidsale-timer");

  containers.forEach(async (el) => {
    const timerId = el.dataset.timerId;
    if (!timerId) return;

    try {
      const res = await fetch(
        `https://rapidsale-timer.vercel.app/api/timer/${timerId}`,
      );

      if (!res.ok) throw new Error("Timer fetch failed");

      const raw = await res.json();

      // 1) If the API might return an array, unwrap first element
      const rawTimer = Array.isArray(raw) ? raw[0] : raw;

      // 2) Deep-clone to strip prototype and weird descriptors
      const timer = JSON.parse(JSON.stringify(rawTimer));

      console.log("CLEAN timer:", timer);
      console.log("CLEAN bgColor:", timer.bgColor); // should now be "#FFFFFF"

      renderTimer(el, timer);
    } catch (err) {
      el.innerHTML = "<p>Failed to load timer.</p>";
      console.error(err);
    }
  });

  function renderTimer(container, timer) {
    // console.log("hasOwnProperty bgColor:", timer.hasOwnProperty("bgColor"));
    // console.log("own keys length:", Object.keys(timer).length);
    // console.log(
    //   "getOwnPropertyNames length:",
    //   Object.getOwnPropertyNames(timer).length,
    // );

    container.innerHTML = `
      <div style="
          background: ${timer.bgColor || "#852626ff"};
          border: ${timer.borderSize || 0}px solid ${timer.borderColor || "transparent"};
          border-radius: ${timer.borderRadius || 0}px;
          padding: ${timer.paddingTopBottom || 10}px ${timer.paddingInside || 10}px;
          text-align: center;
          font-family: ${timer.fontFamily === "theme" ? "inherit" : timer.fontFamily};
        ">
        <div style="
            font-size: ${timer.titleSize || 20}px;
            color: ${timer.titleColor || "#000"};
            margin-bottom: 8px;
          ">
          ${timer.title || ""}
        </div>
        <div class="rapidsale-time" style="font-size:32px; font-weight:600; color: ${timer.titleColor || "#000"};">
          00 : 00 : 00 : 00
        </div>
        ${
          timer.buttonText
            ? `
          <a href="${timer.link || "#"}" style="
              display: inline-block;
              margin-top: 10px;
              padding: 10px 18px;
              background: #000;
              color: #fff;
              text-decoration: none;
              border-radius: 6px;
            ">
            ${timer.buttonText}
          </a>`
            : ""
        }
      </div>
    `;

    // 2. Find the newly created time display element and start the clock
    const timeDisplay = container.querySelector(".rapidsale-time");
    if (timeDisplay) {
      startCountdown(timeDisplay, timer);
    }
  }

  function startCountdown(el, timer) {
    let endTime;

    if (timer.expiresAt) {
      endTime = new Date(timer.expiresAt).getTime();
    } else if (timer.timerType === "date") {
      endTime = new Date(`${timer.endDate}T${timer.endTime}`).getTime();
    } else {
      endTime = Date.now() + (parseInt(timer.fixedMinutes) || 0) * 60 * 1000;
    }

    if (Number.isNaN(endTime)) {
      console.error("Invalid endTime", { timer });
      el.textContent = "00 : 00 : 00 : 00";
      return;
    }

    const updateClock = () => {
      const now = Date.now();
      const diff = endTime - now;

      if (diff <= 0) {
        el.textContent = "00 : 00 : 00 : 00";
        return;
      }

      const d = Math.floor(diff / (1000 * 60 * 60 * 24));
      const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((diff % (1000 * 60)) / 1000);

      el.textContent =
        `${String(d).padStart(2, "0")} : ` +
        `${String(h).padStart(2, "0")} : ` +
        `${String(m).padStart(2, "0")} : ` +
        `${String(s).padStart(2, "0")}`;
    };

    updateClock();
    setInterval(updateClock, 1000);
  }
})();
