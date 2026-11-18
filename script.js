/* EMAIL SETUP (only needed when you host this file on your own site).
 * Create a free EmailJS account (emailjs.com), connect your email, and make two templates:
 *  - owner: sends to you. - customer: "To email" set to {{email}}.
 * Variables: {{name}}, {{email}}, {{business}}, {{service}}, {{message}}.
 * Paste the IDs below. Until then, the form opens the visitor's email app instead. */
var CONFIG = {
  serviceId: 'YOUR_SERVICE_ID',
  ownerTemplateId: 'YOUR_OWNER_TEMPLATE_ID',
  customerTemplateId: 'YOUR_CUSTOMER_TEMPLATE_ID',
  publicKey: 'YOUR_PUBLIC_KEY',
  fallbackEmail: 'hello@stlwebsolutions.com'
};

(function () {
  var VIEWS = ['home', 'services', 'consult'];
  var links = document.querySelectorAll('[data-nav]');

  function route() {
    var name = location.hash.replace('#', '');
    if (VIEWS.indexOf(name) === -1) name = 'home';
    document.body.setAttribute('data-view', name);
    for (var i = 0; i < links.length; i++) {
      if (links[i].getAttribute('data-nav') === name) links[i].setAttribute('aria-current', 'page');
      else links[i].removeAttribute('aria-current');
    }
    window.scrollTo(0, 0);
  }
  window.addEventListener('hashchange', route);
  route();

  document.getElementById('year').textContent = new Date().getFullYear();

  var form = document.getElementById('consult-form');
  var status = document.getElementById('status');
  var btn = document.getElementById('submit-btn');

  function show(type, text) { status.className = 'status show ' + type; status.textContent = text; }

  function send(templateId, params) {
    return fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ service_id: CONFIG.serviceId, template_id: templateId, user_id: CONFIG.publicKey, template_params: params })
    }).then(function (res) { if (!res.ok) throw new Error('Email service returned ' + res.status); });
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (form.website_url.value) return;
    var data = {
      name: form.name.value.trim(), email: form.email.value.trim(),
      business: form.business.value.trim() || 'Not provided',
      service: form.service.value, message: form.message.value.trim()
    };
    if (!data.name || !data.email || !data.service || !data.message) { show('err', 'Please fill in your name, email, service, and message.'); return; }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(data.email)) { show('err', 'Please enter a valid email address.'); return; }

    if (CONFIG.serviceId.indexOf('YOUR_') === 0) {
      var body = 'Name: ' + data.name + '\nEmail: ' + data.email + '\nBusiness: ' + data.business + '\nService: ' + data.service + '\n\n' + data.message;
      window.location.href = 'mailto:' + CONFIG.fallbackEmail + '?subject=' + encodeURIComponent('Consult request: ' + data.service) + '&body=' + encodeURIComponent(body);
      show('ok', 'Opening your email app so you can send your inquiry.');
      return;
    }

    btn.disabled = true; btn.textContent = 'Sending…'; show('ok', 'Sending your inquiry…');
    Promise.all([send(CONFIG.ownerTemplateId, data), send(CONFIG.customerTemplateId, data)])
      .then(function () { form.reset(); show('ok', 'Thanks, ' + data.name + '! Your inquiry was sent and a confirmation is on its way to ' + data.email + '.'); })
      .catch(function () { show('err', 'Sorry, something went wrong. Please email us directly at ' + CONFIG.fallbackEmail + '.'); })
      .then(function () { btn.disabled = false; btn.textContent = 'Send inquiry'; });
  });
})();
