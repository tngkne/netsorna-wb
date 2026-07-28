// POPIA Cookie Handling
function handleConsent(status) {
    gtag('consent', 'update', {
        'analytics_storage': status,
        'ad_storage': status,
        'ad_user_data': status,
        'ad_personalization': status
    });
    document.getElementById('cookie-banner').style.display = 'none';
}

function openQuoteModal(productName, price) {
    document.getElementById('quote-section').style.display = 'block';
    document.getElementById('modal-product-name').innerText = productName;
    document.getElementById('form-product-name').value = productName;
    document.getElementById('form-product-price').value = price;
    document.getElementById('quote-section').scrollIntoView({ behavior: 'smooth' });
}

function generateShortCode() {
    const randomHex = Math.floor(100000 + Math.random() * 900000);
    return `#fxxh${randomHex}`;
}

document.getElementById('quote-form').addEventListener('submit', function(e) {
    e.preventDefault();

    const productName = document.getElementById('form-product-name').value;
    const price = document.getElementById('form-product-price').value;
    const firstName = document.getElementById('first-name').value;
    const lastName = document.getElementById('last-name').value;
    const phone = document.getElementById('whatsapp-num').value;
    const shortCode = generateShortCode();

    const today = new Date();
    const dateStr = today.toISOString().split('T')[0].replace(/-/g, '/');
    const timeStr = today.toTimeString().split(' ')[0].substring(0, 5);

    // Format formatted WhatsApp receipt text
    const message = 
`NEW QUOTE 
--------------------
QUOTE No: ${shortCode}
Customer: ${firstName} ${lastName}
Phone: ${phone}
Date: ${dateStr}
Time: ${timeStr}
--------------------
SERVICES:
  * ${productName} x1  R${price}.00
--------------------
TOTAL: R${price}.00
--------------------
Hi there -- Netsorna Boutique
Please confirm my quotation. I'm interested in ${productName}.`;

    // Analytics event track
    gtag('event', 'form_submitted', {
        'event_category': 'Quote',
        'event_label': shortCode
    });

    // WhatsApp Redirect Link (Insert your target WhatsApp Number here)
    const targetPhone = "27123456789"; // Replace with your WhatsApp Business Number
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/${targetPhone}?text=${encodedMessage}`, '_blank');
});
