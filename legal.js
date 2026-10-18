// Shows the legal pages in one language: ?lang=tr|en|nl (the app passes its own), otherwise the
// browser's, otherwise English. Each page holds all three as <article data-lang="…">.
(function () {
  const LANGUAGES = ["tr", "en", "nl"];
  const asked = new URLSearchParams(location.search).get("lang");
  const browser = (navigator.language || "en").slice(0, 2);
  const language = LANGUAGES.includes(asked) ? asked : LANGUAGES.includes(browser) ? browser : "en";
  document.documentElement.lang = language;
  for (const node of document.querySelectorAll("[data-lang]")) {
    node.hidden = node.dataset.lang !== language;
  }
  const title = document.body.dataset[`title${language[0].toUpperCase()}${language[1]}`];
  if (title) document.title = `${title} · Food Planner`;
  for (const link of document.querySelectorAll(".langs a")) {
    link.setAttribute("aria-current", String(link.dataset.to === language));
  }
  // Links between the pages keep the language.
  for (const link of document.querySelectorAll("a[data-page]")) {
    link.href = `${link.dataset.page}.html?lang=${language}`;
  }
  window.LEGAL_LANGUAGE = language;
})();
