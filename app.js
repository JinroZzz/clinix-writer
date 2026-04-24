let products = JSON.parse(localStorage.getItem('products')) || [];
let customers = JSON.parse(localStorage.getItem('customers')) || [];

function saveData() {
    localStorage.setItem('products', JSON.stringify(products));
    localStorage.setItem('customers', JSON.stringify(customers));
}

function showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
    renderData();
}

function saveProduct() {
    const name = document.getElementById('productName').value.trim();
    const price = parseFloat(document.getElementById('productPrice').value) || 0;

    if (!name) {
        alert('Please enter product name');
        return;
    }

    products.push({ name, price });
    saveData();

    document.getElementById('productName').value = '';
    document.getElementById('productPrice').value = '';

    renderData();
}

function saveCustomer() {
    const name = document.getElementById('customerName').value.trim();

    if (!name) {
        alert('Please enter customer name');
        return;
    }

    customers.push({ name });
    saveData();

    document.getElementById('customerName').value = '';
    renderData();
}

function deleteProduct(index) {
    if (!confirm('Delete this product?')) return;
    products.splice(index, 1);
    saveData();
    renderData();
}

function deleteCustomer(index) {
    if (!confirm('Delete this customer?')) return;
    customers.splice(index, 1);
    saveData();
    renderData();
}

function renderData() {
    const productData = document.getElementById('productData');
    const customerData = document.getElementById('customerData');

    if (productData) {
        productData.innerHTML = products.map((p, i) => `
            <li>
                <span>${p.name} - $${Number(p.price).toFixed(2)}</span>
                <button class="small-danger" onclick="deleteProduct(${i})">Delete</button>
            </li>
        `).join('');
    }

    if (customerData) {
        customerData.innerHTML = customers.map((c, i) => `
            <li>
                <span>${c.name}</span>
                <button class="small-danger" onclick="deleteCustomer(${i})">Delete</button>
            </li>
        `).join('');
    }
}

function addRow() {
    const row = document.createElement('div');
    row.className = 'order-row';

    row.innerHTML = `
        <input placeholder="Type product name..." class="input product-input" oninput="showProductSuggestions(this)">
        <div class="suggestions"></div>

        <div class="row-2">
            <input placeholder="Qty" class="input qty-input" type="number" min="1" oninput="calcTotal()">
            <input placeholder="Price" class="input price-input" type="number" min="0" step="0.01" oninput="calcTotal()">
        </div>

        <button class="remove-btn" onclick="removeRow(this)">Remove</button>
    `;

    document.getElementById('productList').appendChild(row);
    row.querySelector('.product-input').focus();
}

function removeRow(btn) {
    btn.closest('.order-row').remove();
    calcTotal();
}

function showProductSuggestions(input) {
    const text = input.value.toLowerCase();
    const suggestionBox = input.nextElementSibling;

    if (!text) {
        suggestionBox.innerHTML = '';
        return;
    }

    const matches = products
        .filter(p => p.name.toLowerCase().includes(text))
        .slice(0, 6);

    suggestionBox.innerHTML = matches.map(p => `
        <div class="suggestion-item" onclick="selectProduct(this, '${escapeText(p.name)}', '${p.price}')">
            ${p.name} <span>$${Number(p.price).toFixed(2)}</span>
        </div>
    `).join('');
}

function escapeText(text) {
    return String(text).replace(/'/g, "\\'");
}

function selectProduct(el, name, price) {
    const row = el.closest('.order-row');
    row.querySelector('.product-input').value = name;
    row.querySelector('.price-input').value = Number(price).toFixed(2);
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

function clearOrder() {
    if (!confirm('Clear this order?')) return;

    document.getElementById('customerInput').value = '';
    document.getElementById('productList').innerHTML = '';
    document.getElementById('total').innerText = 'Total: $0.00';
    addRow();
}

function printInvoice() {
    const customer = document.getElementById('customerInput').value.trim();

    if (!customer) {
        alert('Please enter customer name');
        return;
    }

    const rows = document.querySelectorAll('.order-row');
    let itemsHtml = '';
    let total = 0;
    let count = 0;

    rows.forEach(row => {
        const product = row.querySelector('.product-input').value.trim();
        const qty = parseFloat(row.querySelector('.qty-input').value) || 0;
        const price = parseFloat(row.querySelector('.price-input').value) || 0;
        const subtotal = qty * price;

        if (!product || qty <= 0) return;

        count++;
        total += subtotal;

        itemsHtml += `
            <tr>
                <td>${count}</td>
                <td>${product}</td>
                <td>${qty}</td>
                <td>$${price.toFixed(2)}</td>
                <td>$${subtotal.toFixed(2)}</td>
            </tr>
        `;
    });

    if (count === 0) {
        alert('Please add at least one product');
        return;
    }

    const invoiceHtml = `
        <div class="invoice-print">
            <h1>INVOICE</h1>

            <div class="invoice-info">
                <div>
                    <div class="label">Bill To</div>
                    <div class="value">${customer}</div>
                </div>
                <div style="text-align:right;">
                    <div class="label">Date</div>
                    <div class="value">${new Date().toLocaleDateString('en-GB')}</div>
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
                <tbody>${itemsHtml}</tbody>
            </table>

            <div class="invoice-total">
                TOTAL: $${total.toFixed(2)}
            </div>

            <div class="invoice-footer">
                Printed from Clinix Writer
            </div>
        </div>
    `;

    const original = document.body.innerHTML;
    document.body.innerHTML = invoiceHtml;
    window.print();
    document.body.innerHTML = original;
    location.reload();
}

window.onload = function () {
    renderData();
    addRow();
};