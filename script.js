document.addEventListener("DOMContentLoaded", function() {
    
    // 1. Cookie Consent Handling
    document.getElementById("accept-cookies").addEventListener("click", function() {
        gtag('consent', 'update', {
            'ad_storage': 'granted',
            'analytics_storage': 'granted',
            'ad_user_data': 'granted',
            'ad_personalization': 'granted'
        });
        gtag('event', 'cookie_consent_granted', { 'consent_type': 'all' });
        document.getElementById("cookie-banner").style.display = 'none';
    });

    document.getElementById("essential-cookies").addEventListener("click", function() {
        gtag('consent', 'update', {
            'ad_storage': 'denied',
            'analytics_storage': 'granted',
            'ad_user_data': 'denied',
            'ad_personalization': 'denied'
        });
        gtag('event', 'cookie_consent_granted', { 'consent_type': 'essential' });
        document.getElementById("cookie-banner").style.display = 'none';
    });

    // Capture UTM parameters from URL
    const urlParams = new URLSearchParams(window.location.search);
    const utmSource = urlParams.get('utm_source') || 'direct';
    const utmCampaign = urlParams.get('utm_campaign') || 'none';

    // 2. Quote Initiated Event
    const quoteBtn = document.getElementById("get-quote-btn");
    quoteBtn.addEventListener("click", function() {
        gtag('event', 'quote_initiated', {
            'event_category': 'Engagement',
            'utm_source': utmSource
        });
        document.getElementById("quote-section").scrollIntoView({ behavior: 'smooth' });
    });

    // 3. Form Started Event (fires on first input change)
    let formStartedFired = false;
    const form = document.getElementById("quote-form");
    const productSelect = document.getElementById("product-select");

    productSelect.addEventListener("change", function() {
        if (!formStartedFired) {
            gtag('event', 'form_started', {
                'product_name': productSelect.value
            });
            formStartedFired = true;
        }
    });

    // 4. Form Submitted & WhatsApp Handoff
    form.addEventListener("submit", function(e) {
        e.preventDefault();

        const productName = productSelect.value;
        const customerType = document.getElementById("customer-type").value;
        const province = document.getElementById("province-select").value;
        const urgency = document.getElementById("urgency-select").value;
        const quoteCode = 'NET-' + Math.floor(1000 + Math.random() * 9000);

        // Fire GA4 Form Submitted Event
        gtag('event', 'form_submitted', {
            'product_name': productName,
            'customer_type': customerType,
            'province': province,
            'urgency': urgency,
            'quote_code': quoteCode,
            'utm_source': utmSource,
            'utm_campaign': utmCampaign
        });

        // Fire GA4 WhatsApp Redirect Event
        gtag('event', 'whatsapp_redirect', {
            'quote_code': quoteCode,
            'utm_source': utmSource
        });

        // Redirect to WhatsApp Business with pre-filled message
        const phone = "27820000000"; // Replace with your WhatsApp business number
        const text = encodeURIComponent(`Hi Netsorna, I'd like to finalize my quote! Ref: ${quoteCode}\nProduct: ${productName}\nProvince: ${province}\nUrgency: ${urgency}`);
        
        setTimeout(function() {
            window.location.href = `https://wa.me/${phone}?text=${text}`;
        }, 500);
    });
});

