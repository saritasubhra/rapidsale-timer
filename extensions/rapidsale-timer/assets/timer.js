(async function () {
  // ONLY target .rapidsale-timer containers
  const containers = document.querySelectorAll(".rapidsale-timer");

  containers.forEach(async (el) => {
    // Only run on product pages
    if (!window.location.pathname.includes("/products/")) {
      el.remove();
      return;
    }

    const shop = window.location.hostname.replace("www.", "");

    try {
      const res = await fetch(
        `https://rapidsale-timer.vercel.app/api/timer/active?shop=${shop}&type=product-page`,
      );

      if (!res.ok) throw new Error("Timer fetch failed");
      const timer = await res.json();

      if (!timer) {
        el.remove();
        return;
      }

      renderProductTimer(el, timer);
    } catch (err) {
      console.error(err);
      el.remove();
    }
  });

  function renderProductTimer(container, timer) {
    // Find product form area
    const selectors = [
      'section[data-section-type="product-template"] .product-form',
      ".product-form",
      'form[action*="/cart/add"]',
      'button[name="add"]',
      ".price",
    ];

    let target = null;
    for (const sel of selectors) {
      target = document.querySelector(sel);
      if (target) break;
    }

    if (!target) {
      container.remove();
      return;
    }

    const bar = document.createElement("div");
    bar.style.cssText = `
        width: 100%;
        background: ${timer.bgColor};
        padding: ${timer.paddingTopBottom}px ${timer.paddingInside}px;
        margin: 16px 0;
        text-align: center;
        border-radius: ${timer.borderRadius || 0}px;
      `;

    bar.innerHTML = `
      <div style="font-size: ${timer.titleSize}px; color: ${timer.titleColor}; font-weight: 600; white-space: nowrap;">
        ${timer.title}
      </div>
      <div class="rapidsale-time" style="font-size: 28px; font-weight: 700; color: ${timer.titleColor}; white-space: nowrap;">
        00 : 00 : 00 : 00
      </div>
      ${timer.buttonText ? `<a href="${timer.link || "#"}" style="background: #000; color: #fff; padding: 8px 16px; border-radius: 6px; text-decoration: none; font-size: 14px;">${timer.buttonText}</a>` : ""}
    `;

    target.parentNode.insertBefore(bar, target.nextSibling);
    container.remove();
    startCountdown(bar.querySelector(".rapidsale-time"), timer);
  }

  // Same startCountdown function as above
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
