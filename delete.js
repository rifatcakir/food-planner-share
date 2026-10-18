// Deleting an account without the app (the stores ask for this). The person proves the address
// is theirs the way the app does: Supabase mails them a sign-in link (or a code) and the link
// brings them back here. Then the delete-account function deletes the account, as Settings →
// Delete my account does. The session is only kept in memory and the page loads nothing from
// anyone else. Text is only ever set as text, never as HTML.
(function () {
  const SUPABASE_URL = "https://xfwhpciavuzoxgktilwz.supabase.co";
  const SUPABASE_KEY = "sb_publishable_BpURnDwlO7xjbMz1E3Fcsg_7V5YXpfX";

  const STRINGS = {
    tr: {
      send: "E-postayı gönder",
      sending: "Gönderiliyor…",
      sent: (email) =>
        `${email} adresinin hesabı varsa bir e-posta yolda. İçindeki linki bu cihazda aç; seni buraya geri getirir. E-postanın başlığı “Food Planner” ya da “Magic Link” olabilir; gelmezse istenmeyen klasörüne bak.`,
      verify: "Devam et",
      checking: "Kontrol ediliyor…",
      invalidEmail: "Bu bir e-posta adresine benzemiyor.",
      tooMany: "Çok fazla deneme oldu. Birkaç dakika bekleyip tekrar dene.",
      failed: "Bağlanılamadı. Biraz sonra tekrar dene.",
      wrongCode: "Kod yanlış ya da süresi dolmuş.",
      expired:
        "Bu linkin süresi dolmuş ya da daha önce kullanılmış. Aşağıdan yeni bir e-posta iste.",
      signedInAs: (email) => `${email} olarak giriş yaptın.`,
      delete: "Hesabımı kalıcı olarak sil",
      deleting: "Siliniyor…",
      done: "Hesabın ve verilerin silindi. Food Planner'ı kullandığın için teşekkürler.",
      deleteFailed: "Hesap silinemedi. Tekrar dene ya da bize ulaş.",
    },
    en: {
      send: "Send the e-mail",
      sending: "Sending…",
      sent: (email) =>
        `If ${email} has an account, an e-mail is on its way. Open the link in it on this device; it brings you back here. The e-mail may be titled “Food Planner” or “Magic Link”; if it doesn't arrive, look in your spam folder.`,
      verify: "Continue",
      checking: "Checking…",
      invalidEmail: "That doesn't look like an e-mail address.",
      tooMany: "Too many tries. Wait a few minutes and try again.",
      failed: "Couldn't connect. Try again in a moment.",
      wrongCode: "That code is wrong or has expired.",
      expired: "This link has expired or was already used. Ask for a new e-mail below.",
      signedInAs: (email) => `You are signed in as ${email}.`,
      delete: "Delete my account for good",
      deleting: "Deleting…",
      done: "Your account and your data have been deleted. Thank you for using Food Planner.",
      deleteFailed: "The account couldn't be deleted. Try again, or contact us.",
    },
    nl: {
      send: "Mail versturen",
      sending: "Versturen…",
      sent: (email) =>
        `Als ${email} een account heeft, is er een mail onderweg. Open de link erin op dit apparaat; die brengt je hier terug. De mail heet misschien “Food Planner” of “Magic Link”; komt hij niet, kijk dan in je spammap.`,
      verify: "Verder",
      checking: "Controleren…",
      invalidEmail: "Dat lijkt geen e-mailadres.",
      tooMany: "Te vaak geprobeerd. Wacht een paar minuten en probeer het opnieuw.",
      failed: "Geen verbinding. Probeer het zo nog eens.",
      wrongCode: "Die code klopt niet of is verlopen.",
      expired: "Deze link is verlopen of al gebruikt. Vraag hieronder een nieuwe mail aan.",
      signedInAs: (email) => `Je bent ingelogd als ${email}.`,
      delete: "Mijn account definitief verwijderen",
      deleting: "Verwijderen…",
      done: "Je account en je gegevens zijn verwijderd. Bedankt dat je Food Planner gebruikte.",
      deleteFailed:
        "Het account kon niet worden verwijderd. Probeer het opnieuw of neem contact op.",
    },
  };
  const language = window.LEGAL_LANGUAGE || "en";
  const s = STRINGS[language] || STRINGS.en;

  const $ = (id) => document.getElementById(id);
  const request = $("request");
  const emailInput = $("email");
  const sendButton = $("send");
  const sentMessage = $("sent");
  const codeForm = $("code-form");
  const codeInput = $("code");
  const verifyButton = $("verify");
  const confirmPanel = $("confirm");
  const who = $("who");
  const understand = $("understand");
  const deleteButton = $("delete");
  const result = $("result");

  sendButton.textContent = s.send;
  verifyButton.textContent = s.verify;
  deleteButton.textContent = s.delete;

  let email = "";
  let accessToken = null;

  function show(node, text, kind) {
    node.textContent = text;
    node.className = kind ? `message ${kind}` : "message";
    node.hidden = false;
  }

  function hide(node) {
    node.hidden = true;
  }

  function headers(token) {
    const values = { apikey: SUPABASE_KEY, "Content-Type": "application/json" };
    if (token) values.Authorization = `Bearer ${token}`;
    return values;
  }

  // This page without the sign-in details the link adds, in the chosen language.
  function returnUrl() {
    return `${location.origin}${location.pathname}?lang=${language}`;
  }

  async function sendMail(event) {
    event.preventDefault();
    hide(result);
    email = emailInput.value.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      show(result, s.invalidEmail, "error");
      return;
    }
    sendButton.disabled = true;
    sendButton.textContent = s.sending;
    try {
      const response = await fetch(
        `${SUPABASE_URL}/auth/v1/otp?redirect_to=${encodeURIComponent(returnUrl())}`,
        {
          method: "POST",
          headers: headers(),
          // Only existing accounts: this page never creates one.
          body: JSON.stringify({ email, create_user: false }),
        },
      );
      if (response.status === 429) {
        show(result, s.tooMany, "error");
        return;
      }
      // An address without an account gets the same answer, so the page does not tell who
      // has one.
      if (!response.ok && response.status !== 400 && response.status !== 422) {
        throw new Error(String(response.status));
      }
      show(sentMessage, s.sent(email));
      codeForm.hidden = false;
    } catch {
      show(result, s.failed, "error");
    } finally {
      sendButton.disabled = false;
      sendButton.textContent = s.send;
    }
  }

  async function verifyCode(event) {
    event.preventDefault();
    hide(result);
    const token = codeInput.value.replace(/\D/g, "");
    if (token.length !== 6) {
      show(result, s.wrongCode, "error");
      return;
    }
    verifyButton.disabled = true;
    verifyButton.textContent = s.checking;
    try {
      const response = await fetch(`${SUPABASE_URL}/auth/v1/verify`, {
        method: "POST",
        headers: headers(),
        body: JSON.stringify({ type: "email", email, token }),
      });
      if (response.status === 429) {
        show(result, s.tooMany, "error");
        return;
      }
      if (!response.ok) {
        show(result, s.wrongCode, "error");
        return;
      }
      const session = await response.json();
      signedIn(session.access_token, session.user?.email ?? email);
    } catch {
      show(result, s.failed, "error");
    } finally {
      verifyButton.disabled = false;
      verifyButton.textContent = s.verify;
    }
  }

  function signedIn(token, address) {
    accessToken = token;
    request.hidden = true;
    sentMessage.hidden = true;
    codeForm.hidden = true;
    confirmPanel.hidden = false;
    who.textContent = s.signedInAs(address);
    understand.checked = false;
    deleteButton.disabled = true;
    understand.focus();
  }

  async function deleteAccount() {
    if (!accessToken || !understand.checked) return;
    hide(result);
    deleteButton.disabled = true;
    understand.disabled = true;
    deleteButton.textContent = s.deleting;
    try {
      const response = await fetch(`${SUPABASE_URL}/functions/v1/delete-account`, {
        method: "POST",
        headers: headers(accessToken),
        body: JSON.stringify({ confirm: "delete" }),
      });
      if (!response.ok) throw new Error(String(response.status));
      accessToken = null;
      confirmPanel.hidden = true;
      show(result, s.done, "done");
    } catch {
      show(result, s.deleteFailed, "error");
      deleteButton.disabled = false;
      understand.disabled = false;
      deleteButton.textContent = s.delete;
    }
  }

  // Back from the link in the e-mail: the sign-in comes after the #. It is read once and taken
  // out of the address bar straight away.
  async function fromLink() {
    if (!location.hash) return;
    const values = new URLSearchParams(location.hash.slice(1));
    history.replaceState(null, "", returnUrl());
    if (values.get("error") || values.get("error_code")) {
      show(result, s.expired, "error");
      return;
    }
    const token = values.get("access_token");
    if (!token) return;
    try {
      const response = await fetch(`${SUPABASE_URL}/auth/v1/user`, { headers: headers(token) });
      if (!response.ok) throw new Error(String(response.status));
      const user = await response.json();
      signedIn(token, user.email ?? "");
    } catch {
      show(result, s.expired, "error");
    }
  }

  request.addEventListener("submit", sendMail);
  codeForm.addEventListener("submit", verifyCode);
  understand.addEventListener("change", () => {
    deleteButton.disabled = !understand.checked;
  });
  deleteButton.addEventListener("click", deleteAccount);
  // The link may open in the tab where this page already is.
  window.addEventListener("hashchange", () => void fromLink());
  void fromLink();
})();
