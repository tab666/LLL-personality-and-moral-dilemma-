document.addEventListener("DOMContentLoaded", () => {
  // Dropdown menu functionality
  const hamburgerMenu = document.getElementById("hamburgerMenu");
  const menuOverlay = document.getElementById("menuOverlay");
  const closeMenu = document.getElementById("closeMenu");
  const balanceIcon = document.getElementById("balanceIcon");

  // Get the base path for static files
  const staticPath = balanceIcon.src.split("/static/")[0] + "/static/";

  let isAnimating = false;

  function openMenu() {
    if (isAnimating) return;

    isAnimating = true;

    // Switch to animated GIF (scale tips)
    const timestamp = new Date().getTime();
    balanceIcon.src = staticPath + "libra.gif?t=" + timestamp;

    // Open menu
    menuOverlay.classList.add("active");
    document.body.style.overflow = "hidden";

    // Allow closing after animation starts
    setTimeout(() => {
      isAnimating = false;
    }, 500);
  }

  function closeMenuFunc() {
    // Switch back to static (scale reverts to balanced)
    balanceIcon.src = staticPath + "libra-static.png";

    // Close menu
    menuOverlay.classList.remove("active");
    document.body.style.overflow = "";
  }

  if (hamburgerMenu) {
    hamburgerMenu.addEventListener("click", openMenu);
  }

  if (closeMenu) {
    closeMenu.addEventListener("click", closeMenuFunc);
  }

  if (menuOverlay) {
    // Close menu when clicking outside
    menuOverlay.addEventListener("click", (e) => {
      if (e.target === menuOverlay) {
        closeMenuFunc();
      }
    });
  }

  // Close menu when pressing Escape key
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && menuOverlay.classList.contains("active")) {
      closeMenuFunc();
    }
  });

  // Add smooth scroll effect for navigation links
  const navLinks = document.querySelectorAll("nav a");

  navLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      // Add a simple click effect
      link.style.transform = "scale(0.95)";
      setTimeout(() => {
        link.style.transform = "";
      }, 150);
    });
  });

  // Add fade-in animation for sections on scroll
  const sections = document.querySelectorAll(
    ".main_intro, .predictions, .visualization-section"
  );

  const observerOptions = {
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px",
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = "1";
        entry.target.style.transform = "translateY(0)";
      }
    });
  }, observerOptions);

  sections.forEach((section) => {
    section.style.opacity = "0";
    section.style.transform = "translateY(30px)";
    section.style.transition = "opacity 0.6s ease, transform 0.6s ease";
    observer.observe(section);
  });

  // Add interactive effect to prediction articles
  const predictionArticles = document.querySelectorAll(".predictions article");

  predictionArticles.forEach((article) => {
    article.addEventListener("click", () => {
      // Add a pulse effect on click
      article.style.animation = "pulse 0.5s";
      setTimeout(() => {
        article.style.animation = "";
      }, 500);
    });
  });

  // Add parallax effect to header on scroll
  window.addEventListener("scroll", () => {
    const header = document.querySelector("header");
    const scrolled = window.pageYOffset;
    if (header) {
      header.style.transform = `translateY(${scrolled * 0.5}px)`;
      header.style.opacity = 1 - scrolled / 500;
    }
  });

  // Create floating particles
  createParticles();

  // D3 Bubble Chart (only if on homepage)
  if (document.getElementById("bubbleChart")) {
    createBubbleChart();
  }
});

// Create floating particles
function createParticles() {
  const particlesContainer = document.getElementById("particles");
  if (!particlesContainer) return;

  for (let i = 0; i < 50; i++) {
    const particle = document.createElement("div");
    particle.className = "particle";
    particle.style.left = Math.random() * 100 + "%";
    particle.style.animationDelay = Math.random() * 20 + "s";
    particle.style.animationDuration = 15 + Math.random() * 10 + "s";
    particlesContainer.appendChild(particle);
  }
}

// Create D3 Bubble Chart
function createBubbleChart() {
  const width = 1200;
  const height = 800;

  const svg = d3
    .select("#bubbleChart")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  // Data for the research methodology
  const data = [
    { name: "Big Five Traits", value: 50, category: "personality" },
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
    x: width / 2 + (Math.random() - 0.5) * 200,
    y: height / 2 + (Math.random() - 0.5) * 200,
  }));

  const simulation = d3
    .forceSimulation(nodes)
    .force("x", d3.forceX(width / 2).strength(0.05))
    .force("y", d3.forceY(height / 2).strength(0.05))
    .force(
      "collide",
      d3.forceCollide((d) => d.radius + 5)
    )
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
    .style("cursor", "pointer")
    .style("opacity", 0.85)
    .on("mouseover", function (e, d) {
      d3.select(this)
        .transition()
        .duration(200)
        .attr("r", d.radius * 1.1)
        .style("opacity", 1);

      showTooltip(e, d);
    })
    .on("mousemove", (e) => {
      moveTooltip(e);
    })
    .on("mouseout", function (e, d) {
      d3.select(this)
        .transition()
        .duration(200)
        .attr("r", d.radius)
        .style("opacity", 0.85);

      hideTooltip();
    });

  const labels = svg
    .selectAll("text")
    .data(nodes)
    .enter()
    .append("text")
    .text((d) => d.name)
    .attr("font-size", "11px")
    .attr("font-weight", "bold")
    .attr("text-anchor", "middle")
    .attr("fill", "white")
    .attr("pointer-events", "none")
    .style("text-shadow", "1px 1px 2px rgba(0,0,0,0.8)")
    .each(function (d) {
      const text = d3.select(this);
      const words = d.name.split("\n");
      text.text("");
      words.forEach((word, i) => {
        text
          .append("tspan")
          .attr("x", 0)
          .attr("dy", i === 0 ? "0em" : "1.1em")
          .text(word);
      });
    });

  function ticked() {
    bubbles.attr("cx", (d) => d.x).attr("cy", (d) => d.y);

    labels.attr("transform", (d) => `translate(${d.x},${d.y})`);
  }

  // Tooltip functions
  let tooltip = d3.select("#tooltip");
  if (tooltip.empty()) {
    tooltip = d3
      .select("body")
      .append("div")
      .attr("id", "tooltip")
      .style("opacity", 0);
  }

  function showTooltip(e, d) {
    tooltip
      .style("opacity", 1)
      .html(
        `<strong>${d.name.replace("\n", " ")}</strong><br>Category: ${
          d.category
        }`
      );
  }

  function moveTooltip(e) {
    tooltip
      .style("left", e.pageX + 10 + "px")
      .style("top", e.pageY - 20 + "px");
  }

  function hideTooltip() {
    tooltip.style("opacity", 0);
  }
}

// Add CSS animation for pulse effect (only if not already added)
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
