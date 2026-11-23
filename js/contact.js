/**
 * GHANEM FURNITURE
 * Contact Form Validation, Image Compression, Direct Signed Cloudinary Upload & Inquiries Integration
 */

function initContact() {
  console.log('[contact.js] Initializing contact form & photo upload logic. Document readyState:', document.readyState);
  const contactForm = document.getElementById('contactForm');
  const formStatus = document.getElementById('formStatus');
  const sendWhatsAppBtn = document.getElementById('sendWhatsAppBtn');
  const whatsappNumber = '201000363618';

  // Photo Upload Elements
  const referencePhotosInput = document.getElementById('referencePhotos');
  const selectPhotosBtn = document.getElementById('selectPhotosBtn');
  const photoPreviewGrid = document.getElementById('photoPreviewGrid');
  const compressionLoading = document.getElementById('compressionLoading');
  const photoLimitAlert = document.getElementById('photoLimitAlert');
  const fileUploadZone = document.getElementById('fileUploadZone');

  console.log('[contact.js] Elements found:', {
    hasForm: !!contactForm,
    hasInput: !!referencePhotosInput,
    hasBtn: !!selectPhotosBtn,
    hasZone: !!fileUploadZone
  });

  // State: array of { id, originalName, file, previewUrl, sizeKb }
  let attachedPhotos = [];
  const MAX_PHOTOS = 3;

  function isEnglish() {
    return document.documentElement.lang === 'en' || (window.i18n && window.i18n.getLanguage() === 'en');
  }

  function getI18nText(keyPath, fallback) {
    if (window.i18n && typeof window.i18n.translate === 'function') {
      const val = window.i18n.translate(keyPath);
      if (val && val !== keyPath) return val;
    }
    return fallback;
  }

  // --- Photo Upload & Compression Handling ---
  if (selectPhotosBtn && referencePhotosInput) {
    selectPhotosBtn.addEventListener('click', (e) => {
      console.log('[contact.js] selectPhotosBtn clicked!');
      // If element is not a label, or if label failed to open dialog, trigger input click
      if (selectPhotosBtn.tagName.toLowerCase() !== 'label') {
        referencePhotosInput.click();
      }
    });

    selectPhotosBtn.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        console.log('[contact.js] selectPhotosBtn activated via keyboard');
        referencePhotosInput.click();
      }
    });
  }

  // Drag & Drop support on upload zone
  if (fileUploadZone && referencePhotosInput) {
    ['dragenter', 'dragover'].forEach(eventName => {
      fileUploadZone.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        fileUploadZone.classList.add('dragover');
      });
    });

    ['dragleave', 'drop'].forEach(eventName => {
      fileUploadZone.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        fileUploadZone.classList.remove('dragover');
      });
    });

    fileUploadZone.addEventListener('drop', (e) => {
      if (e.dataTransfer && e.dataTransfer.files) {
        handleSelectedFiles(Array.from(e.dataTransfer.files));
      }
    });
  }

  if (referencePhotosInput) {
    referencePhotosInput.addEventListener('change', (e) => {
      console.log('[contact.js] referencePhotosInput change event fired! Files selected:', e.target.files?.length);
      if (e.target.files && e.target.files.length > 0) {
        handleSelectedFiles(Array.from(e.target.files));
        referencePhotosInput.value = ''; // Reset input to allow selecting same file again if removed
      }
    });
  }

  function showAlert(message) {
    if (!photoLimitAlert) return;
    photoLimitAlert.textContent = message;
    photoLimitAlert.style.display = 'block';
    setTimeout(() => {
      photoLimitAlert.style.display = 'none';
    }, 6000);
  }

  async function handleSelectedFiles(files) {
    if (!files || files.length === 0) return;

    // Filter image files
    const imageFiles = files.filter(f => {
      const ext = f.name.split('.').pop().toLowerCase();
      return f.type.startsWith('image/') || ext === 'heic' || ext === 'heif';
    });

    if (imageFiles.length === 0) return;

    // Check count limit
    const remainingSlots = MAX_PHOTOS - attachedPhotos.length;
    if (remainingSlots <= 0) {
      const msg = isEnglish()
        ? `You can only attach a maximum of ${MAX_PHOTOS} photos.`
        : `عذراً، الحد الأقصى المسموح به هو ${MAX_PHOTOS} صور فقط لكل رسالة.`;
      showAlert(msg);
      return;
    }

    let filesToProcess = imageFiles;
    if (imageFiles.length > remainingSlots) {
      const msg = isEnglish()
        ? `You can only add ${remainingSlots} more photo(s). Extra photos were ignored.`
        : `يمكنك إضافة ${remainingSlots} صور إضافية فقط. تم تجاهل الصور الزائدة.`;
      showAlert(msg);
      filesToProcess = imageFiles.slice(0, remainingSlots);
    }

    // Show loading indicator
    if (compressionLoading) {
      compressionLoading.style.display = 'flex';
    }

    for (const rawFile of filesToProcess) {
      try {
        let fileToCompress = rawFile;

        // HEIC detection & preparation
        const ext = rawFile.name.split('.').pop().toLowerCase();
        const isHeic = ext === 'heic' || ext === 'heif' || rawFile.type === 'image/heic' || rawFile.type === 'image/heif';

        // Check browser-image-compression availability
        if (typeof imageCompression !== 'function') {
          console.warn('imageCompression is not loaded yet, using original file');
          addPhotoToState(rawFile, rawFile);
          continue;
        }

        // Compression settings
        const options = {
          maxSizeMB: 0.25, // 250 KB
          maxWidthOrHeight: 1280,
          useWebWorker: true,
          fileType: 'image/jpeg',
          initialQuality: 0.75
        };

        const compressedFile = await imageCompression(fileToCompress, options);
        addPhotoToState(compressedFile, rawFile);
      } catch (err) {
        console.error('Error compressing file:', rawFile.name, err);
        const isHeic = rawFile.name.toLowerCase().endsWith('.heic') || rawFile.name.toLowerCase().endsWith('.heif');
        if (isHeic) {
          showAlert(isEnglish()
            ? `Could not convert HEIC photo "${rawFile.name}". Please save as JPG/PNG and try again.`
            : `تعذر تحويل صورة الآيفون HEIC "${rawFile.name}". يرجى حفظها كـ JPG أو PNG.`);
        } else {
          showAlert(isEnglish()
            ? `Could not process image "${rawFile.name}".`
            : `تعذر معالجة الصورة "${rawFile.name}".`);
        }
      }
    }

    // Hide loading
    if (compressionLoading) {
      compressionLoading.style.display = 'none';
    }

    renderPhotoPreviews();
  }

  function addPhotoToState(compressedFile, rawFile) {
    const id = 'photo_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
    const previewUrl = URL.createObjectURL(compressedFile);
    const sizeKb = Math.round(compressedFile.size / 1024);

    attachedPhotos.push({
      id,
      originalName: rawFile.name,
      file: compressedFile,
      previewUrl,
      sizeKb
    });
  }

  function renderPhotoPreviews() {
    if (!photoPreviewGrid) return;
    photoPreviewGrid.innerHTML = '';

    attachedPhotos.forEach((item, index) => {
      const card = document.createElement('div');
      card.className = 'preview-item';
      card.innerHTML = `
        <img src="${item.previewUrl}" alt="Preview ${index + 1}" class="preview-thumb">
        <button type="button" class="preview-remove-btn" title="${isEnglish() ? 'Remove photo' : 'حذف الصورة'}" aria-label="Remove photo">×</button>
        <div class="preview-size-badge">${item.sizeKb} KB</div>
      `;

      card.querySelector('.preview-remove-btn').addEventListener('click', () => {
        removePhoto(item.id);
      });

      photoPreviewGrid.appendChild(card);
    });
  }

  function removePhoto(photoId) {
    const idx = attachedPhotos.findIndex(p => p.id === photoId);
    if (idx !== -1) {
      URL.revokeObjectURL(attachedPhotos[idx].previewUrl);
      attachedPhotos.splice(idx, 1);
      renderPhotoPreviews();
    }
  }

  function clearAllPhotos() {
    attachedPhotos.forEach(p => URL.revokeObjectURL(p.previewUrl));
    attachedPhotos = [];
    if (photoPreviewGrid) photoPreviewGrid.innerHTML = '';
    if (referencePhotosInput) referencePhotosInput.value = '';
    if (photoLimitAlert) photoLimitAlert.style.display = 'none';
  }

  // Upload compressed photos directly to Cloudinary using signed upload parameters
  async function uploadPhotosToCloudinary(photos) {
    if (!photos || photos.length === 0) return [];

    // Step A: Request secure signed upload parameters from Vercel Serverless Function
    let signData;
    try {
      const signRes = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      if (!signRes.ok) {
        throw new Error(`Signature endpoint returned status ${signRes.status}`);
      }
      signData = await signRes.json();
      if (!signData || !signData.signature || !signData.apiKey || !signData.cloudName) {
        throw new Error('Invalid signature response from /api/upload');
      }
    } catch (signErr) {
      console.error('[contact.js] Failed to get signed upload params:', signErr);
      throw new Error(isEnglish()
        ? 'Could not connect to image upload service. Please check your internet connection or send without photos.'
        : 'تعذر الاتصال بخدمة رفع الصور. يرجى التحقق من اتصالك أو إرسال الرسالة بدون صور.');
    }

    // Step B: Upload each photo directly to Cloudinary via HTTPS
    const uploadedUrls = [];
    for (let i = 0; i < photos.length; i++) {
      const item = photos[i];
      const formData = new FormData();
      formData.append('file', item.file);
      formData.append('api_key', signData.apiKey);
      formData.append('timestamp', signData.timestamp);
      formData.append('signature', signData.signature);
      formData.append('folder', signData.folder);
      formData.append('tags', signData.tags);

      const response = await fetch(`https://api.cloudinary.com/v1_1/${signData.cloudName}/image/upload`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const errText = await response.text().catch(() => '');
        console.error('[contact.js] Cloudinary upload error:', response.status, errText);
        throw new Error(`Cloudinary upload failed with status ${response.status}`);
      }

      const resData = await response.json();
      if (resData && resData.secure_url) {
        uploadedUrls.push(resData.secure_url);
      } else {
        throw new Error('Invalid upload response from Cloudinary');
      }
    }
    return uploadedUrls;
  }

  // --- Form Submission Handling ---
  if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
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

      // Disable submit button and indicate loading state
      const originalBtnHtml = submitBtn ? submitBtn.innerHTML : '';
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = attachedPhotos.length > 0
          ? (isEnglish() ? '<span>Uploading photos & sending...</span>' : '<span>جاري رفع الصور وإرسال الرسالة...</span>')
          : (isEnglish() ? '<span>Sending message...</span>' : '<span>جاري إرسال الرسالة...</span>');
      }

      let uploadedPhotoUrls = [];

      try {
        // 1. Upload photos to Cloudinary directly if any
        if (attachedPhotos.length > 0) {
          uploadedPhotoUrls = await uploadPhotosToCloudinary(attachedPhotos);
        }

        // 2. Build complete message including reference photo links
        let finalMessage = message;
        let photosTextSummary = '';
        if (uploadedPhotoUrls.length > 0) {
          const photosTitle = isEnglish()
            ? '\n\n--- Attached Reference Photos ---'
            : '\n\n--- الصور المرجعية المرفقة ---';
          const photosList = uploadedPhotoUrls.map((url, idx) => {
            return isEnglish() ? `Photo ${idx + 1}: ${url}` : `صورة ${idx + 1}: ${url}`;
          }).join('\n');
          finalMessage += photosTitle + '\n' + photosList;
          photosTextSummary = uploadedPhotoUrls.join('\n');
        }

        // 3. Send email via EmailJS
        const response = await emailjs.send("service_ngeifoq", "template_v1mkb5i", {
          name: name,
          phone: phone,
          email: email,
          service: service,
          message: finalMessage,
          reference_photos: photosTextSummary
        });

        console.log('EmailJS Success:', response.status, response.text);

        // Format WhatsApp URL for direct chat button in success alert
        let formattedWhatsApp = '';
        if (isEnglish()) {
          formattedWhatsApp = `Hello Ghanem Furniture,\n\nI would like to inquire about: ${service}\nName: ${name}\nPhone: ${phone}\nEmail: ${email}\n\nMessage:\n${finalMessage}`;
        } else {
          formattedWhatsApp = `مرحباً Ghanem Furniture،\n\nأود الاستفسار بخصوص: ${service}\nالاسم: ${name}\nرقم الهاتف: ${phone}\nالبريد الإلكتروني: ${email}\n\nنص الرسالة:\n${finalMessage}`;
        }
        const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(formattedWhatsApp)}`;

        // Show luxury success feedback
        if (formStatus) {
          const successTitle = isEnglish()
            ? '✓ Your message has been sent successfully!'
            : '✓ تم إرسال رسالتك واستلامها بنجاح!';
          const photosNote = uploadedPhotoUrls.length > 0
            ? (isEnglish() ? ` (${uploadedPhotoUrls.length} reference photo(s) attached)` : ` (تم إرفاق ${uploadedPhotoUrls.length} صور مرجعية)`)
            : '';
          const successDesc = isEnglish()
            ? `Thank you for reaching out, <strong>${escapeHtml(name)}</strong>! An automatic email notification${photosNote} has been delivered to the Ghanem Furniture team, and we will get back to you shortly. You can also chat with us directly via WhatsApp below:`
            : `شكراً لتواصلك معنا يا <strong>${escapeHtml(name)}</strong>! تم إرسال رسالتك بنجاح${photosNote} ووصل إشعار تلقائي لفريق Ghanem Furniture وسنتواصل معك في أقرب وقت. كما يمكنك أيضاً بدء محادثة واتساب مباشرة معنا:`;
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

        // Reset form and clear uploaded photos
        contactForm.reset();
        clearAllPhotos();

        // Tracking: successful contact form submission
        if (typeof gtag === 'function') {
          gtag('event', 'form_submit', {
            'event_category': 'engagement',
            'event_label': 'contact_form',
            'service_type': service,
            'has_photos': uploadedPhotoUrls.length > 0
          });
        }
        if (typeof fbq === 'function') {
          fbq('track', 'Lead');
        }

      } catch (error) {
        console.error('Submission Error:', error);

        // Prepare WhatsApp message fallback
        let fallbackMsg = message;
        if (uploadedPhotoUrls.length > 0) {
          fallbackMsg += `\n\nالصور المرفقة:\n` + uploadedPhotoUrls.join('\n');
        }
        let formattedWhatsApp = '';
        if (isEnglish()) {
          formattedWhatsApp = `Hello Ghanem Furniture,\n\nI would like to inquire about: ${service}\nName: ${name}\nPhone: ${phone}\nEmail: ${email}\n\nMessage:\n${fallbackMsg}`;
        } else {
          formattedWhatsApp = `مرحباً Ghanem Furniture،\n\nأود الاستفسار بخصوص: ${service}\nالاسم: ${name}\nرقم الهاتف: ${phone}\nالبريد الإلكتروني: ${email}\n\nنص الرسالة:\n${fallbackMsg}`;
        }
        const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(formattedWhatsApp)}`;

        if (formStatus) {
          const errorTitle = isEnglish()
            ? '✕ Could not send your message at the moment'
            : '✕ تعذر إرسال رسالتك حالياً';
          const errorDesc = isEnglish()
            ? 'There was an issue sending your message via email. Don\'t worry, you can click below to send it directly to our team via WhatsApp:'
            : 'حدث تعذر مؤقت في إرسال الرسالة عبر الإيميل. لا تقلق، يمكنك الضغط على الزر أدناه لإرسال نفس الرسالة مباشرة لفريقنا عبر واتساب:';
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
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalBtnHtml;
        }
      }
    });
  }

  // WhatsApp quick button
  if (sendWhatsAppBtn) {
    sendWhatsAppBtn.addEventListener('click', () => {
      const isEn = isEnglish();
      const name = document.getElementById('contactName')?.value.trim() || (isEn ? 'Valued Client' : 'عميل كريم');
      const phone = document.getElementById('contactPhone')?.value.trim() || (isEn ? 'Not specified' : 'غير محدد');
      const serviceSelect = document.getElementById('contactService');
      const service = serviceSelect ? (serviceSelect.options[serviceSelect.selectedIndex]?.text || serviceSelect.value) : (isEn ? 'General Inquiry' : 'استفسار عام');
      const message = document.getElementById('contactMessage')?.value.trim() || (isEn ? 'I would like to inquire about Ghanem Furniture services and projects.' : 'أود الاستفسار عن خدمات وأعمال Ghanem Furniture');

      let photosNote = '';
      if (attachedPhotos.length > 0) {
        photosNote = isEn
          ? `\n(I have ${attachedPhotos.length} reference photo(s) to share)`
          : `\n(لدي ${attachedPhotos.length} صور مرجعية للمعاينة سأرفقها في الشات)`;
      }

      let formattedMessage = '';
      if (isEn) {
        formattedMessage = `Hello Ghanem Furniture,\n\nI would like to inquire about: ${service}\nName: ${name}\nPhone: ${phone}\n\nMessage:\n${message}${photosNote}`;
      } else {
        formattedMessage = `مرحباً Ghanem Furniture،\n\nأود الاستفسار بخصوص: ${service}\nالاسم: ${name}\nالهاتف: ${phone}\n\nالرسالة:\n${message}${photosNote}`;
      }

      const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(formattedMessage)}`;
      window.open(whatsappUrl, '_blank');

      if (typeof gtag === 'function') {
        gtag('event', 'whatsapp_click', {
          'event_category': 'engagement',
          'event_label': 'contact_form_whatsapp_button'
        });
      }
      if (typeof fbq === 'function') {
        fbq('track', 'Contact');
      }
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
}

// Ensure execution whether DOM is loading or already parsed
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initContact);
} else {
  initContact();
}

