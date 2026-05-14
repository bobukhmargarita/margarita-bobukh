(() => {
  const SPEED_PX_PER_SEC = 86.67;
  const ARROW_WIDTH = 22;
  const EDGE_OFFSET = 22;

  const getArrowDirections = (line) => {
    if (line.classList.contains("animated-line--arrows-left")) {
      return ["down-left", "up-left"];
    }

    return ["down-right", "up-right"];
  };

  const createArrowSvg = (direction) => {
    const svgNs = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(svgNs, "svg");
    svg.setAttribute(
      "class",
      `animated-line__arrow-icon animated-line__arrow-icon--${direction}`,
    );
    svg.setAttribute("viewBox", "0 0 22 22");
    svg.setAttribute("fill", "none");
    svg.setAttribute("aria-hidden", "true");

    const path = document.createElementNS(svgNs, "path");
    path.setAttribute(
      "d",
      "M0.397659 0V4.36209H14.532L0 18.9015L3.04099 22L17.6795 7.35357V21.7513H22V0H0.397659Z",
    );
    path.setAttribute("fill", "white");

    svg.appendChild(path);
    return svg;
  };

  const createArrowWrap = (direction) => {
    const wrap = document.createElement("div");
    wrap.className = "animated-line__arrow-wrap";
    wrap.appendChild(createArrowSvg(direction));

    return wrap;
  };

  const createLabel = (text) => {
    const label = document.createElement("div");
    label.className = "animated-line__label";

    const textEl = document.createElement("span");
    textEl.className = "animated-line__text";
    textEl.textContent = text;

    label.appendChild(textEl);

    return label;
  };

  const getLabelPosition = (line) => {
    if (line.classList.contains("animated-line--label-left")) {
      return "left";
    }

    if (line.classList.contains("animated-line--label-right")) {
      return "right";
    }

    return "center";
  };

  const getGapConfig = (line) => {
    const styles = window.getComputedStyle(line);
    const base =
      Number.parseFloat(styles.getPropertyValue("--arrow-gap")) || 30;
    const min =
      Number.parseFloat(styles.getPropertyValue("--arrow-gap-min")) || base - 2;
    const max =
      Number.parseFloat(styles.getPropertyValue("--arrow-gap-max")) || base + 2;

    return {
      base,
      min: Math.min(min, max),
      max: Math.max(min, max),
    };
  };

  const getSideTargets = (lineWidth, labelWidth, position) => {
    const available = Math.max(
      lineWidth - labelWidth - EDGE_OFFSET * 2,
      ARROW_WIDTH * 2,
    );

    if (position === "left") {
      return {
        left: EDGE_OFFSET,
        right: available - EDGE_OFFSET,
      };
    }

    if (position === "right") {
      return {
        left: available - EDGE_OFFSET,
        right: EDGE_OFFSET,
      };
    }

    return {
      left: available / 2,
      right: available / 2,
    };
  };

  const calculateSideLayout = (targetWidth, gapConfig) => {
    const { base, min, max } = gapConfig;

    if (targetWidth <= ARROW_WIDTH) {
      return {
        count: 1,
        gap: base,
        width: ARROW_WIDTH,
      };
    }

    const maxCount = Math.max(
      2,
      Math.floor((targetWidth + min) / (ARROW_WIDTH + min)) + 2,
    );

    let best = null;

    for (let count = 2; count <= maxCount; count += 1) {
      const gap = (targetWidth - count * ARROW_WIDTH) / (count - 1);

      if (gap < min || gap > max) {
        continue;
      }

      const score = Math.abs(gap - base);
      if (!best || score < best.score) {
        best = {
          score,
          count,
          gap,
          width: targetWidth,
        };
      }
    }

    if (!best) {
      return {
        count: 1,
        gap: base,
        width: ARROW_WIDTH,
      };
    }

    return {
      count: best.count,
      gap: best.gap,
      width: best.width,
    };
  };

  const appendAlternatingArrows = (
    container,
    directions,
    count,
    startIndex,
  ) => {
    for (let i = 0; i < count; i += 1) {
      container.appendChild(createArrowWrap(directions[(startIndex + i) % 2]));
    }

    return startIndex + count;
  };

  const buildLine = (line) => {
    const track = line.querySelector(".animated-line__track");
    const text = line.dataset.text?.trim();

    if (!track || !text) {
      return;
    }

    track.innerHTML = "";

    const directions = getArrowDirections(line);
    const segment = document.createElement("div");
    segment.className = "animated-line__segment";

    const leftSide = document.createElement("div");
    leftSide.className = "animated-line__side animated-line__side--left";

    const rightSide = document.createElement("div");
    rightSide.className = "animated-line__side animated-line__side--right";

    const label = createLabel(text);

    segment.appendChild(leftSide);
    segment.appendChild(label);
    segment.appendChild(rightSide);

    track.appendChild(segment);

    const lineWidth = Math.max(line.clientWidth, 320);
    const position = getLabelPosition(line);
    const gapConfig = getGapConfig(line);
    line.style.setProperty("--arrow-edge-gap", `${gapConfig.base / 2}px`);

    const labelWidth = label.getBoundingClientRect().width;
    const innerWidth = Math.max(lineWidth - gapConfig.base, ARROW_WIDTH * 2);
    const targets = getSideTargets(innerWidth, labelWidth, position);

    const leftLayout = calculateSideLayout(
      Math.max(targets.left, ARROW_WIDTH),
      gapConfig,
    );
    const rightLayout = calculateSideLayout(
      Math.max(targets.right, ARROW_WIDTH),
      gapConfig,
    );

    appendAlternatingArrows(leftSide, directions, leftLayout.count, 0);
    appendAlternatingArrows(
      rightSide,
      directions,
      rightLayout.count,
      leftLayout.count % 2,
    );

    leftSide.style.gap = `${leftLayout.gap}px`;
    rightSide.style.gap = `${rightLayout.gap}px`;
    leftSide.style.width = `${leftLayout.width}px`;
    rightSide.style.width = `${rightLayout.width}px`;

    const clone = segment.cloneNode(true);
    track.appendChild(clone);

    const segmentWidth = lineWidth;
    const duration = segmentWidth / SPEED_PX_PER_SEC;

    line.style.setProperty("--line-segment-width", `${segmentWidth}px`);
    line.style.setProperty("--line-duration", `${duration}s`);
    segment.style.width = `${segmentWidth}px`;
    clone.style.width = `${segmentWidth}px`;
  };

  const initAnimatedLines = () => {
    const lines = document.querySelectorAll(".animated-line");
    lines.forEach(buildLine);
  };

  let resizeTimer = 0;

  window.addEventListener("resize", () => {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(initAnimatedLines, 150);
  });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initAnimatedLines);
  } else {
    initAnimatedLines();
  }
})();
