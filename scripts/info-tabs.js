(() => {
  const TRANSITION_EASE = "cubic-bezier(0.22, 1, 0.36, 1)";

  const INFO_CONTENT = [
    {
      title: "Origin and development of the term",
      subtitle: "Early Context and Language Shift",
      paragraph:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer posuere justo in est volutpat, in bibendum sem ultricies. The phrase winter arc started as an informal way to describe a private season of discipline, then evolved into a broader label used in productivity and self-growth communities. Sed non magna et lacus cursus faucibus, vitae dictum libero. Over time, people began using it not as a strict program, but as a flexible mindset for intentional progress during colder months.",
    },
    {
      title: "Popularity and social media context",
      subtitle: "Viral Trends in Self-Discipline",
      paragraph:
        'The spread of the term "winter arc" is primarily linked to short-form content platforms, including TikTok, Instagram Reels, and Twitter (X). Its popularity was reinforced by trends associated with productivity, seasonal routines, and personal improvement narratives. The concept gained traction among students, young professionals, and individuals aged approximately 18-35 who engaged with content related to self-discipline, minimalism, and structured lifestyle adjustments. The term became widely referenced in discussions about seasonal motivation, study routines, physical training schedules, and mental resets. The rise in usage also correlates with the timing of academic semesters, reduced outdoor activity during colder months, and increased consumption of digitally shared routines. As a result, "winter arc" became a shorthand descriptor for a focused, introspective, and intentionally quieter period, often framed as preparation for the upcoming year.',
    },
    {
      title: "Definition and general characteristics",
      subtitle: "Structure, Habits, and Focus",
      paragraph:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus facilisis, mi et pretium eleifend, justo nibh luctus velit, nec placerat ipsum ipsum nec lectus. In practice, a winter arc is usually defined by fewer distractions, repeatable routines, measurable goals, and consistency over intensity. Cras dignissim elit et sapien accumsan, sit amet mattis arcu fermentum. People often combine physical training, deep work blocks, better sleep, and reflective journaling to build momentum before the new year.",
    },
  ];

  const section = document.querySelector(".info-section");

  if (!section) {
    return;
  }

  const items = Array.from(section.querySelectorAll(".info__item"));
  const wrapper = section.querySelector(".info__text-wrapper");
  const titleEl = section.querySelector(".info__title");
  const subtitleEl = section.querySelector(".info__subtitle");
  const paragraphEl = section.querySelector(".info__paragraph");

  if (!items.length || !wrapper || !titleEl || !subtitleEl || !paragraphEl) {
    return;
  }

  if (!wrapper.id) {
    wrapper.id = "info-content-panel";
  }

  const clampIndex = (index) => {
    const maxIndex = INFO_CONTENT.length - 1;
    return Math.max(0, Math.min(index, maxIndex));
  };

  const getItemIndex = (item, fallbackIndex) => {
    const rawIndex = item.dataset.infoIndex;
    const parsedIndex = Number.parseInt(rawIndex || "", 10);

    if (Number.isNaN(parsedIndex)) {
      return clampIndex(fallbackIndex);
    }

    return clampIndex(parsedIndex);
  };

  const getDefaultIndex = () => {
    const indexFromActiveClass = items.findIndex((item) => {
      const title = item.querySelector(".info__item-title");
      const icon = item.querySelector(".info__item-icon");

      return (
        title?.classList.contains("info__item-title--active") ||
        icon?.classList.contains("info__item-icon--active")
      );
    });

    if (indexFromActiveClass >= 0) {
      return getItemIndex(items[indexFromActiveClass], indexFromActiveClass);
    }

    return INFO_CONTENT[1] ? 1 : 0;
  };

  const animateOut = (element, duration, delay = 0) =>
    element
      .animate(
        [
          { opacity: 1, transform: "translateY(0)", filter: "blur(0px)" },
          { opacity: 0, transform: "translateY(12px)", filter: "blur(4px)" },
        ],
        {
          duration,
          delay,
          easing: TRANSITION_EASE,
          fill: "forwards",
        },
      )
      .finished.catch(() => {});

  const animateIn = (element, duration, delay = 0) =>
    element
      .animate(
        [
          { opacity: 0, transform: "translateY(-8px)", filter: "blur(4px)" },
          { opacity: 1, transform: "translateY(0)", filter: "blur(0px)" },
        ],
        {
          duration,
          delay,
          easing: TRANSITION_EASE,
          fill: "forwards",
        },
      )
      .finished.catch(() => {});

  const setContent = (content) => {
    titleEl.textContent = content.title;
    subtitleEl.textContent = content.subtitle;
    paragraphEl.textContent = content.paragraph;
  };

  const setActiveState = (nextIndex) => {
    items.forEach((item, itemPosition) => {
      const itemIndex = getItemIndex(item, itemPosition);
      const isActive = itemIndex === nextIndex;
      const title = item.querySelector(".info__item-title");
      const icon = item.querySelector(".info__item-icon");

      title?.classList.toggle("info__item-title--active", isActive);
      icon?.classList.toggle("info__item-icon--active", isActive);
      item.setAttribute("aria-expanded", String(isActive));
    });
  };

  let activeIndex = getDefaultIndex();
  let isAnimating = false;
  let queuedIndex = null;

  const switchTo = async (nextIndex) => {
    const safeNextIndex = clampIndex(nextIndex);

    if (safeNextIndex === activeIndex) {
      return;
    }

    if (isAnimating) {
      queuedIndex = safeNextIndex;
      return;
    }

    isAnimating = true;
    setActiveState(safeNextIndex);

    await Promise.all([
      animateOut(titleEl, 180),
      animateOut(subtitleEl, 200, 20),
      animateOut(paragraphEl, 230, 40),
    ]);

    setContent(INFO_CONTENT[safeNextIndex]);

    await Promise.all([
      animateIn(titleEl, 320),
      animateIn(subtitleEl, 340, 50),
      animateIn(paragraphEl, 420, 110),
    ]);

    activeIndex = safeNextIndex;
    isAnimating = false;

    if (queuedIndex !== null && queuedIndex !== activeIndex) {
      const pendingIndex = queuedIndex;
      queuedIndex = null;
      switchTo(pendingIndex);
      return;
    }

    queuedIndex = null;
  };

  items.forEach((item, itemPosition) => {
    const itemIndex = getItemIndex(item, itemPosition);

    item.setAttribute("role", "button");
    item.setAttribute("tabindex", "0");
    item.setAttribute("aria-controls", wrapper.id);

    item.addEventListener("click", () => {
      switchTo(itemIndex);
    });

    item.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" && event.key !== " ") {
        return;
      }

      event.preventDefault();
      switchTo(itemIndex);
    });
  });

  setContent(INFO_CONTENT[activeIndex]);
  setActiveState(activeIndex);

  Promise.all([
    animateIn(titleEl, 360),
    animateIn(subtitleEl, 380, 60),
    animateIn(paragraphEl, 460, 130),
  ]);
})();
