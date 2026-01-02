document.addEventListener("DOMContentLoaded", async () => {
  const nodes = document.querySelectorAll(".rapidsale-timer");

  nodes.forEach(async (node) => {
    const timerId = node.dataset.timerId;

    const res = await fetch(`/apps/rapidsale/api/timer/${timerId}`);
    const config = await res.json();

    renderTimer(node, config);
  });
});

function renderTimer(container, config) {
  container.innerHTML = `
    <div style="
      background:${config.bgColor};
      border-radius:${config.borderRadius}px;
      padding:${config.paddingTopBottom}px;
      text-align:center;
    ">
      <div style="
        font-size:${config.titleSize}px;
        color:${config.titleColor};
      ">
        ${config.title}
      </div>
      <div class="timer-digits"></div>
      <a href="${config.link}">
        <button>${config.buttonText}</button>
      </a>
    </div>
  `;

  startCountdown(container.querySelector(".timer-digits"), config);
}

function startCountdown(container, config) {
  let endTimestamp;

  if (config.timerType === "date") {
    endTimestamp = new Date(`${config.endDate}T${config.endTime}`).getTime();
  } else {
    endTimestamp = Date.now() + Number(config.fixedMinutes) * 60 * 1000;
  }

  function update() {
    const now = Date.now();
    const diff = endTimestamp - now;

    if (diff <= 0) {
      container.textContent = "00 : 00 : 00 : 00";
      return;
    }

    const totalSeconds = Math.floor(diff / 1000);
    const days = Math.floor(totalSeconds / 86400);
    const hrs = Math.floor((totalSeconds % 86400) / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;

    container.textContent = `${pad(days)} : ${pad(hrs)} : ${pad(mins)} : ${pad(secs)}`;
  }

  update();
  setInterval(update, 1000);
}

function pad(num) {
  return String(num).padStart(2, "0");
}
