let products = JSON.parse(localStorage.getItem('products')) || [];
let customers = JSON.parse(localStorage.getItem('customers')) || [];

function showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
    renderData();
}

function saveProduct() {
    const name = document.getElementById('productName').value;
    const price = document.getElementById('productPrice').value;

    products.push({ name, price });
    localStorage.setItem('products', JSON.stringify(products));

    renderData();
}

function saveCustomer() {
    const name = document.getElementById('customerName').value;

    customers.push({ name });
    localStorage.setItem('customers', JSON.stringify(customers));

    renderData();
}

function renderData() {
    document.getElementById('productData').innerHTML =
        products.map(p => `<li>${p.name} - $${p.price}</li>`).join('');

    document.getElementById('customerData').innerHTML =
        customers.map(c => `<li>${c.name}</li>`).join('');
}

function addRow() {
    const row = document.createElement('div');
    row.className = 'order-row';

    row.innerHTML = `
        <input placeholder="Type product name..." class="input product-input" oninput="showSuggestions(this)">
        <div class="suggestions"></div>

        <div class="row-2">
            <input placeholder="Qty" class="input qty-input" type="number" oninput="calcTotal()">
            <input placeholder="Price" class="input price-input" type="number" oninput="calcTotal()">
        </div>
    `;

    document.getElementById('productList').appendChild(row);
}
function showSuggestions(input) {
    const text = input.value.toLowerCase();
    const suggestionBox = input.nextElementSibling;

    if (!text) {
        suggestionBox.innerHTML = '';
        return;
    }

    const matches = products
        .filter(p => p.name.toLowerCase().includes(text))
        .slice(0, 5);

    suggestionBox.innerHTML = matches.map(p => `
        <div class="suggestion-item" onclick="selectProduct(this, '${p.name}', '${p.price}')">
            ${p.name} <span>$${p.price}</span>
        </div>
    `).join('');
}

function selectProduct(el, name, price) {
    const row = el.closest('.order-row');
    row.querySelector('.product-input').value = name;
    row.querySelector('.price-input').value = price;
    row.querySelector('.suggestions').innerHTML = '';
    row.querySelector('.qty-input').focus();
    calcTotal();
}

function calcTotal() {
    let total = 0;

    document.querySelectorAll('.order-row').forEach(row => {
        const qty = parseFloat(row.querySelector('.qty-input').value) || 0;
        const price = parseFloat(row.querySelector('.price-input').value) || 0;

        total += qty * price;
    });

    document.getElementById('total').innerText = "Total: $" + total.toFixed(2);
}

function printInvoice() {
    const customer = document.getElementById('customerInput').value || 'Customer';
    const rows = document.querySelectorAll('.order-row');

    let itemsHtml = '';
    let total = 0;

    rows.forEach((row, index) => {
        const product = row.querySelector('.product-input').value;
        const qty = parseFloat(row.querySelector('.qty-input').value) || 0;
        const price = parseFloat(row.querySelector('.price-input').value) || 0;
        const subtotal = qty * price;

        if (!product || qty <= 0) return;

        total += subtotal;

        itemsHtml += `
            <tr>
                <td>${index + 1}</td>
                <td>${product}</td>
                <td>${qty}</td>
                <td>$${price.toFixed(2)}</td>
                <td>$${subtotal.toFixed(2)}</td>
            </tr>
        `;
    });

    const invoiceHtml = `
        <div class="invoice-print">
            <h1>INVOICE</h1>

            <div class="invoice-info">
                <div>
                    <strong>Bill To:</strong><br>
                    ${customer}
                </div>
                <div>
                    <strong>Date:</strong><br>
                    ${new Date().toLocaleDateString()}
                </div>
            </div>

            <table>
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Product</th>
                        <th>Qty</th>
                        <th>Price</th>
                        <th>Subtotal</th>
                    </tr>
                </thead>
                <tbody>
                    ${itemsHtml}
                </tbody>
            </table>

            <div class="invoice-total">
                TOTAL: $${total.toFixed(2)}
            </div>
        </div>
    `;

    const original = document.body.innerHTML;
    document.body.innerHTML = invoiceHtml;
    window.print();
    document.body.innerHTML = original;
    location.reload();
}