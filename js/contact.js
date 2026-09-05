/**
 * GHANEM FURNITURE
 * Contact Form Validation, EmailJS Real Sending & WhatsApp Integration
 */

document.addEventListener('DOMContentLoaded', () => {
  const contactForm = document.getElementById('contactForm');
  const formStatus = document.getElementById('formStatus');
  const sendWhatsAppBtn = document.getElementById('sendWhatsAppBtn');
  const whatsappNumber = '201000363618';

  function isEnglish() {
    return document.documentElement.lang === 'en' || (window.i18n && window.i18n.getLanguage() === 'en');
  }

  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const nameInput = document.getElementById('contactName');
      const phoneInput = document.getElementById('contactPhone');
      const emailInput = document.getElementById('contactEmail');
      const serviceInput = document.getElementById('contactService');
      const messageInput = document.getElementById('contactMessage');
      const submitBtn = contactForm.querySelector('button[type="submit"]');

      const name = nameInput ? nameInput.value.trim() : '';
      const phone = phoneInput ? phoneInput.value.trim() : '';
      const email = emailInput && emailInput.value.trim() ? emailInput.value.trim() : (isEnglish() ? 'Not specified' : 'غير محدد');
      const service = serviceInput ? (serviceInput.options[serviceInput.selectedIndex]?.text || serviceInput.value) : (isEnglish() ? 'General Inquiry' : 'استفسار عام');
      const message = messageInput ? messageInput.value.trim() : '';

      if (!name || !phone || !message) {
        const errorMsg = isEnglish()
          ? 'Please fill in all required fields (Name, Phone Number, and Message).'
          : 'يرجى ملء جميع الحقول المطلوبة (الاسم، رقم الهاتف، والرسالة).';
        showStatus(errorMsg, 'error');
        return;
      }

      // Format WhatsApp message as an extra instant option
      let formattedMessage = '';
      if (isEnglish()) {
        formattedMessage = `Hello Ghanem Furniture,\n\nI would like to inquire about: ${service}\nName: ${name}\nPhone: ${phone}\nEmail: ${email}\n\nMessage:\n${message}`;
      } else {
        formattedMessage = `مرحباً Ghanem Furniture،\n\nأود الاستفسار بخصوص: ${service}\nالاسم: ${name}\nرقم الهاتف: ${phone}\nالبريد الإلكتروني: ${email}\n\nنص الرسالة:\n${message}`;
      }

      const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(formattedMessage)}`;

      // Disable submit button and indicate loading state
      const originalBtnHtml = submitBtn ? submitBtn.innerHTML : '';
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = isEnglish()
          ? '<span>Sending message...</span>'
          : '<span>جاري إرسال الرسالة...</span>';
      }

      // Send real email via EmailJS
      emailjs.send("service_ngeifoq", "template_v1mkb5i", {
        name: name,
        phone: phone,
        email: email,
        service: service,
        message: message
      })
      .then((response) => {
        console.log('EmailJS Success:', response.status, response.text);

        // Show luxury success feedback with direct one-click WhatsApp button as an extra option
        if (formStatus) {
          const successTitle = isEnglish()
            ? '✓ Your message has been sent successfully!'
            : '✓ تم إرسال رسالتك واستلامها بنجاح!';
          const successDesc = isEnglish()
            ? `Thank you for reaching out, <strong>${escapeHtml(name)}</strong>! An automatic email notification has been delivered to the Ghanem Furniture team, and we will get back to you shortly. You can also chat with us directly via WhatsApp below as an extra option:`
            : `شكراً لتواصلك معنا يا <strong>${escapeHtml(name)}</strong>! تم إرسال رسالتك بنجاح ووصل إشعار تلقائي لفريق Ghanem Furniture وسنتواصل معك في أقرب وقت. كما يمكنك أيضاً بدء محادثة واتساب مباشرة معنا كخيار إضافي:`;
          const sendBtnText = isEnglish() ? 'Optional: Chat via WhatsApp' : 'خيار إضافي: محادثة مباشرة عبر واتساب';

          formStatus.innerHTML = `
            <div style="display: flex; flex-direction: column; gap: 0.8rem;">
              <div>
                <strong style="font-size: 1.05rem;">${successTitle}</strong>
                <p style="margin: 0.4rem 0 0 0; font-size: 0.92rem; line-height: 1.7;">${successDesc}</p>
              </div>
              <div style="margin-top: 0.4rem;">
                <a href="${whatsappUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-whatsapp btn-sm" style="display: inline-flex; width: auto;">
                  <span>${sendBtnText}</span>
                  <svg viewBox="0 0 24 24" fill="currentColor" style="width: 16px; height: 16px;"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>
                </a>
              </div>
            </div>
          `;
          formStatus.className = 'form-status success';
          formStatus.style.display = 'block';

          setTimeout(() => {
            formStatus.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          }, 100);
        }

        // Reset form upon successful email transmission
        contactForm.reset();
      })
      .catch((error) => {
        console.error('EmailJS Error:', error);

        if (formStatus) {
          const errorTitle = isEnglish()
            ? '✕ Could not send email at the moment'
            : '✕ تعذر إرسال الإيميل حالياً';
          const errorDesc = isEnglish()
            ? 'There was an issue sending your message via email. Don\'t worry, you can click below to send it directly to our team via WhatsApp:'
            : 'حدث تعذر مؤقت في إرسال الإيميل. لا تقلق، يمكنك الضغط على الزر أدناه لإرسال نفس الرسالة مباشرة لفريقنا عبر واتساب:';
          const sendBtnText = isEnglish() ? 'Send Message via WhatsApp' : 'إرسال الرسالة عبر واتساب الآن';

          formStatus.innerHTML = `
            <div style="display: flex; flex-direction: column; gap: 0.8rem;">
              <div>
                <strong style="font-size: 1.05rem;">${errorTitle}</strong>
                <p style="margin: 0.4rem 0 0 0; font-size: 0.92rem; line-height: 1.7;">${errorDesc}</p>
              </div>
              <div style="margin-top: 0.4rem;">
                <a href="${whatsappUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-whatsapp btn-sm" style="display: inline-flex; width: auto;">
                  <span>${sendBtnText}</span>
                  <svg viewBox="0 0 24 24" fill="currentColor" style="width: 16px; height: 16px;"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>
                </a>
              </div>
            </div>
          `;
          formStatus.className = 'form-status error';
          formStatus.style.display = 'block';

          setTimeout(() => {
            formStatus.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          }, 100);
        }
      })
      .finally(() => {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalBtnHtml;
        }
      });
    });
  }

  if (sendWhatsAppBtn) {
    sendWhatsAppBtn.addEventListener('click', () => {
      const isEn = isEnglish();
      const name = document.getElementById('contactName')?.value.trim() || (isEn ? 'Valued Client' : 'عميل كريم');
      const phone = document.getElementById('contactPhone')?.value.trim() || (isEn ? 'Not specified' : 'غير محدد');
      const serviceSelect = document.getElementById('contactService');
      const service = serviceSelect ? (serviceSelect.options[serviceSelect.selectedIndex]?.text || serviceSelect.value) : (isEn ? 'General Inquiry' : 'استفسار عام');
      const message = document.getElementById('contactMessage')?.value.trim() || (isEn ? 'I would like to inquire about Ghanem Furniture services and projects.' : 'أود الاستفسار عن خدمات وأعمال Ghanem Furniture');

      let formattedMessage = '';
      if (isEn) {
        formattedMessage = `Hello Ghanem Furniture,\n\nI would like to inquire about: ${service}\nName: ${name}\nPhone: ${phone}\n\nMessage:\n${message}`;
      } else {
        formattedMessage = `مرحباً Ghanem Furniture،\n\nأود الاستفسار بخصوص: ${service}\nالاسم: ${name}\nالهاتف: ${phone}\n\nالرسالة:\n${message}`;
      }

      const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(formattedMessage)}`;
      window.open(whatsappUrl, '_blank');
    });
  }

  function showStatus(text, type) {
    if (!formStatus) return;
    formStatus.textContent = text;
    formStatus.className = `form-status ${type}`;
    formStatus.style.display = 'block';

    setTimeout(() => {
      formStatus.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 100);
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }
});
