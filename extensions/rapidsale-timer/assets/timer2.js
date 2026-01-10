(async function () {
  // ONLY target .rapidsale-topbar containers
  const containers = document.querySelectorAll(".rapidsale-topbar");

  containers.forEach(async (el) => {
    const shop = window.location.hostname.replace("www.", "");

    try {
      const res = await fetch(
        `https://rapidsale-timer.vercel.app/api/timer/active?shop=${shop}&type=top-bottom-bar`,
      );

      if (!res.ok) throw new Error("Timer fetch failed");
      const timer = await res.json();

      if (!timer) {
        el.innerHTML = "";
        return;
      }

      renderTopBar(el, timer);
    } catch (err) {
      console.error(err);
      el.innerHTML = "";
    }
  });

  function renderTopBar(container, timer) {
    container.innerHTML = `
      <div style="
        position: static;
        width: 100%;
        background: ${timer.bgColor};
        padding: ${timer.paddingTopBottom}px ${timer.paddingInside}px;
        font-family: ${timer.fontFamily === "theme" ? "inherit" : timer.fontFamily};
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 16px;
        margin-bottom: 16px;
        border-radius: ${timer.borderRadius || 0}px;
      ">
        <div style="font-size: ${timer.titleSize}px; color: ${timer.titleColor}; font-weight: 600; white-space: nowrap;">
          ${timer.title}
        </div>
        <div class="rapidsale-time" style="font-size: 28px; font-weight: 700; color: ${timer.titleColor}; white-space: nowrap;">
          00 : 00 : 00 : 00
        </div>
        ${timer.buttonText ? `<a href="${timer.link || "#"}" style="background: #000; color: #fff; padding: 8px 16px; border-radius: 6px; text-decoration: none; font-size: 14px; white-space: nowrap;">${timer.buttonText}</a>` : ""}
      </div>
    `;

    // Move to top of body
    document.body.insertBefore(container, document.body.firstChild);
    startCountdown(container.querySelector(".rapidsale-time"), timer);
  }

  // startCountdown function (same as before)
  function startCountdown(el, timer) {
    let endTime = timer.expiresAt
      ? new Date(timer.expiresAt).getTime()
      : timer.timerType === "date"
        ? new Date(`${timer.endDate}T${timer.endTime}`).getTime()
        : Date.now() + (parseInt(timer.fixedMinutes) || 0) * 60 * 1000;

    if (Number.isNaN(endTime)) {
      el.textContent = "00 : 00 : 00 : 00";
      return;
    }

    const updateClock = () => {
      const diff = endTime - Date.now();
      if (diff <= 0) {
        el.textContent = "00 : 00 : 00 : 00";
        return;
      }
      const d = Math.floor(diff / (1000 * 60 * 60 * 24));
      const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((diff % (1000 * 60)) / 1000);
      el.textContent = `${String(d).padStart(2, "0")} : ${String(h).padStart(2, "0")} : ${String(m).padStart(2, "0")} : ${String(s).padStart(2, "0")}`;
    };
    updateClock();
    setInterval(updateClock, 1000);
  }
})();
