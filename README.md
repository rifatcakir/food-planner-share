# Food Planner share page

The page behind links shared from the Food Planner app
(`https://rifatcakir.github.io/food-planner-share/?t=…`). It shows the shared recipe or menu to
anyone and opens it in the app.

It reads the share through the app's public database function `get_share`; there is no server
and nothing else is stored here. Published with GitHub Pages from `main`.

Next to it, in Turkish, English and Dutch (`?lang=tr|en|nl`):

- `privacy.html`: the privacy policy.
- `terms.html`: the terms of use.
- `delete.html`: deleting a Food Planner account without the app.

The fonts are served from `fonts/` (SIL Open Font License), so a visit reaches nobody else.

The source lives in the app repository under `apps/share-page/`; this copy is what is served.
