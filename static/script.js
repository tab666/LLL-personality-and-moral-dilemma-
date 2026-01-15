document.addEventListener("DOMContentLoaded", () => {
  // ===============================
  // MENU
  // ===============================
  const hamburgerMenu = document.getElementById("hamburgerMenu");
  const menuOverlay = document.getElementById("menuOverlay");
  const closeMenu = document.getElementById("closeMenu");
  const balanceIcon = document.getElementById("balanceIcon");

  const staticPath = balanceIcon.src.split("/static/")[0] + "/static/";
  let isAnimating = false;

  function openMenu() {
    if (isAnimating) return;
    isAnimating = true;

    balanceIcon.src = staticPath + "libra.gif?t=" + Date.now();
    menuOverlay.classList.add("active");
    document.body.style.overflow = "hidden";

    setTimeout(() => (isAnimating = false), 500);
  }

  function closeMenuFunc() {
    balanceIcon.src = staticPath + "libra-static.png";
    menuOverlay.classList.remove("active");
    document.body.style.overflow = "";
  }

  hamburgerMenu?.addEventListener("click", openMenu);
  closeMenu?.addEventListener("click", closeMenuFunc);

  menuOverlay?.addEventListener("click", (e) => {
    if (e.target === menuOverlay) closeMenuFunc();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && menuOverlay.classList.contains("active")) {
      closeMenuFunc();
    }
  });

  // ===============================
  // SCROLL EFFECTS
  // ===============================
  const sections = document.querySelectorAll(
    ".main_intro, .predictions, .visualization-section"
  );

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = "1";
          entry.target.style.transform = "translateY(0)";
        }
      });
    },
    { threshold: 0.1 }
  );

  sections.forEach((section) => {
    section.style.opacity = "0";
    section.style.transform = "translateY(30px)";
    section.style.transition = "opacity 0.6s ease, transform 0.6s ease";
    observer.observe(section);
  });

  window.addEventListener("scroll", () => {
    const header = document.querySelector("header");
    const scrolled = window.pageYOffset;
    if (header) {
      header.style.transform = `translateY(${scrolled * 0.5}px)`;
      header.style.opacity = 1 - scrolled / 500;
    }
  });

  createParticles();

  if (document.getElementById("bubbleChart")) {
    createBubbleChart();
  }
});

// ===============================
// PARTICLES
// ===============================
function createParticles() {
  const container = document.getElementById("particles");
  if (!container) return;

  for (let i = 0; i < 50; i++) {
    const p = document.createElement("div");
    p.className = "particle";
    p.style.left = Math.random() * 100 + "%";
    p.style.animationDelay = Math.random() * 20 + "s";
    p.style.animationDuration = 15 + Math.random() * 10 + "s";
    container.appendChild(p);
  }
}

// ===============================
// BUBBLE CHART (FIXED + TOOLTIP)
// ===============================
function createBubbleChart() {
  const container = document.getElementById("bubbleChart");
  container.innerHTML = "";

  const width = container.clientWidth;
  const height = 650;
  const padding = 25; // margin so bubbles never touch edges

  const svg = d3
    .select(container)
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  const data = [
    { name: "Big Five\nTraits", value: 50, category: "personality" },
    { name: "Human\nParticipants", value: 45, category: "data" },
    { name: "LLaMA-3", value: 45, category: "llm" },
    { name: "Moral\nDilemmas", value: 35, category: "task" },
    { name: "CNI Model", value: 38, category: "analysis" },
    { name: "Consequences\n(C)", value: 25, category: "cni" },
    { name: "Norms\n(N)", value: 25, category: "cni" },
    { name: "Inaction\n(I)", value: 25, category: "cni" },
    { name: "Comparison", value: 42, category: "results" },
  ];

  const colorScale = {
    personality: "#726ea4",
    data: "#f8d697",
    llm: "#1b6d80",
    task: "#086b69",
    analysis: "#408092",
    cni: "#183f4d",
    results: "#8c78c8",
  };

  const nodes = data.map((d) => ({
    ...d,
    radius: d.value * 2,
    x: width / 2,
    y: height / 2,
  }));

  // Tooltip (reuse if exists)
  let tooltip = d3.select("#tooltip");
  if (tooltip.empty()) {
    tooltip = d3
      .select("body")
      .append("div")
      .attr("id", "tooltip")
      .style("position", "absolute")
      .style("pointer-events", "none")
      .style("opacity", 0)
      .style("background", "rgba(0,0,0,0.85)")
      .style("color", "white")
      .style("padding", "10px 14px")
      .style("border-radius", "8px")
      .style("font-size", "13px")
      .style("border", "1px solid rgba(255,255,255,0.2)");
  }

  const simulation = d3
    .forceSimulation(nodes)
    .force("center", d3.forceCenter(width / 2, height / 2))
    .force("charge", d3.forceManyBody().strength(20)) // tighter cluster
    .force(
      "collision",
      d3.forceCollide((d) => d.radius + 6)
    )
    .alphaDecay(0.02)
    .on("tick", ticked);

  const bubbles = svg
    .selectAll("circle")
    .data(nodes)
    .enter()
    .append("circle")
    .attr("r", (d) => d.radius)
    .attr("fill", (d) => colorScale[d.category])
    .attr("stroke", "#fff")
    .attr("stroke-width", 2)
    .style("opacity", 0.9)
    .style("cursor", "pointer")
    .on("mouseover", function (e, d) {
      d3.select(this)
        .transition()
        .duration(200)
        .attr("r", d.radius * 1.08);

      tooltip.style("opacity", 1).html(
        `<strong>${d.name.replace("\n", " ")}</strong><br/>
           Category: ${d.category}`
      );
    })
    .on("mousemove", function (e) {
      tooltip
        .style("left", e.pageX + 12 + "px")
        .style("top", e.pageY - 20 + "px");
    })
    .on("mouseout", function (e, d) {
      d3.select(this).transition().duration(200).attr("r", d.radius);

      tooltip.style("opacity", 0);
    });

  const labels = svg
    .selectAll("text")
    .data(nodes)
    .enter()
    .append("text")
    .attr("text-anchor", "middle")
    .attr("fill", "white")
    .attr("font-size", "11px")
    .attr("font-weight", "bold")
    .style("pointer-events", "none")
    .each(function (d) {
      const words = d.name.split("\n");
      const text = d3.select(this);
      words.forEach((w, i) => {
        text
          .append("tspan")
          .attr("x", 0)
          .attr("dy", i === 0 ? "0em" : "1.1em")
          .text(w);
      });
    });

  function ticked() {
    nodes.forEach((d) => {
      d.x = Math.max(
        padding + d.radius,
        Math.min(width - padding - d.radius, d.x)
      );
      d.y = Math.max(
        padding + d.radius,
        Math.min(height - padding - d.radius, d.y)
      );
    });

    bubbles.attr("cx", (d) => d.x).attr("cy", (d) => d.y);
    labels.attr("transform", (d) => `translate(${d.x}, ${d.y})`);
  }
}

// ===============================
// PULSE ANIMATION
// ===============================
if (!document.getElementById("bubble-pulse-style")) {
  const style = document.createElement("style");
  style.id = "bubble-pulse-style";
  style.textContent = `
    @keyframes pulse {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.08); }
    }
  `;
  document.head.appendChild(style);
}
