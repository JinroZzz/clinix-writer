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
    const unit = document.getElementById('productUnit').value;
    const price = parseFloat(document.getElementById('productPrice').value) || 0;

    if (!name) {
        alert('Please enter product name');
        return;
    }

    products.push({ name, unit, price });
    saveData();

    document.getElementById('productName').value = '';
    document.getElementById('productPrice').value = '';

    renderData();
    document.getElementById('productName').focus();
}

function saveCustomer() {
    const name = document.getElementById('customerName').value.trim();
    const debt = parseFloat(document.getElementById('customerDebt').value) || 0;

    if (!name) {
        alert('Please enter customer name');
        return;
    }

    customers.push({ name, debt });
    saveData();

    document.getElementById('customerName').value = '';
    document.getElementById('customerDebt').value = '';

    renderData();
    document.getElementById('customerName').focus();
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

function editProduct(index) {
    const product = products[index];

    const newName = prompt('Edit product name:', product.name);
    if (!newName) return;

    const newUnit = prompt('Edit unit:', product.unit || 'Box');
    if (!newUnit) return;

    const newPrice = prompt('Edit price:', product.price);
    if (newPrice === null) return;

    products[index] = {
        name: newName.trim(),
        unit: newUnit.trim(),
        price: parseFloat(newPrice) || 0
    };

    saveData();
    renderData();
}

function editCustomer(index) {
    const customer = customers[index];

    const newName = prompt('Edit customer name:', customer.name);
    if (!newName) return;

    const newDebt = prompt('Edit customer debt:', customer.debt || 0);
    if (newDebt === null) return;

    customers[index] = {
        ...customer,
        name: newName.trim(),
        debt: parseFloat(newDebt) || 0
    };

    saveData();
    renderData();
}

function renderData() {
    const productData = document.getElementById('productData');
    const customerData = document.getElementById('customerData');

    if (productData) {
        productData.innerHTML = products.map((p, i) => `
            <li>
                <span>
                    <strong>${p.name}</strong><br>
                    <small>${p.unit || '-'} • $${Number(p.price).toFixed(2)}</small>
                </span>
                <div class="list-actions">
                    <button class="small-edit" onclick="editProduct(${i})">Edit</button>
                    <button class="small-danger" onclick="deleteProduct(${i})">Delete</button>
                </div>
            </li>
        `).join('');
    }

    if (customerData) {
        customerData.innerHTML = customers.map((c, i) => `
            <li>
                <span>
                    <strong>${c.name}</strong><br>
                    <small>Debt: $${Number(c.debt || 0).toFixed(2)}</small>
                </span>
                <div class="list-actions">
                    <button class="small-edit" onclick="editCustomer(${i})">Edit</button>
                    <button class="small-danger" onclick="deleteCustomer(${i})">Delete</button>
                </div>
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
        .slice(0, 5);
    if (matches.length === 0 && text.length > 1) {
        suggestionBox.innerHTML = `
        <div class="suggestion-item create-new" onclick="createProductFromOrder('${escapeText(input.value)}', this)">
            + Create "${input.value}"
        </div>
    `;
        return;
    }

    suggestionBox.innerHTML = matches.map(p => `
        <div class="suggestion-item" onclick="selectProduct(this, '${escapeText(p.name)}', '${p.price}', '${escapeText(p.unit || '')}')">
            ${p.name} <span>${p.unit || '-'} • $${Number(p.price).toFixed(2)}</span>
        </div>
    `).join('');
}
function createProductFromOrder(name, el) {
    const price = prompt("Enter price for " + name, "0");
    if (price === null) return;

    const unit = prompt("Enter unit (Box, Lo, Kes...)", "Box");
    if (unit === null) return;

    const newProduct = {
        name: name.trim(),
        price: parseFloat(price) || 0,
        unit: unit.trim()
    };

    products.push(newProduct);
    saveData();

    // auto select it
    selectProduct(el, newProduct.name, newProduct.price, newProduct.unit);
}
function showCustomerSuggestions(input) {
    const text = input.value.toLowerCase();
    const suggestionBox = document.getElementById('customerSuggestions');

    if (!text) {
        suggestionBox.innerHTML = '';
        return;
    }

    const matches = customers
        .filter(c => c.name.toLowerCase().includes(text))
        .slice(0, 6);

    suggestionBox.innerHTML = matches.map(c => `
        <div class="suggestion-item" onclick="selectCustomer('${escapeText(c.name)}')">
            ${c.name} <span>$${Number(c.debt || 0).toFixed(2)}</span>
        </div>
    `).join('');
}

function selectCustomer(name) {
    const customer = customers.find(c => c.name === name);

    document.getElementById('customerInput').value = name;
    document.getElementById('customerSuggestions').innerHTML = '';

    if (customer) {
        document.getElementById('oldDebt').value = Number(customer.debt || 0).toFixed(2);
    }

    calcTotal();
}

function escapeText(text) {
    return String(text).replace(/'/g, "\\'");
}

function selectProduct(el, name, price, unit = '') {
    const row = el.closest('.order-row');
    const productInput = row.querySelector('.product-input');

    productInput.value = name;
    productInput.dataset.unit = unit;

    row.querySelector('.price-input').value = Number(price).toFixed(2);
    row.querySelector('.suggestions').innerHTML = '';
    row.querySelector('.qty-input').focus();
    calcTotal();
}

function calcTotal() {
    let orderTotal = 0;

    document.querySelectorAll('.order-row').forEach(row => {
        const qty = parseFloat(row.querySelector('.qty-input').value) || 0;
        const price = parseFloat(row.querySelector('.price-input').value) || 0;
        orderTotal += qty * price;
    });

    const oldDebt = parseFloat(document.getElementById('oldDebt')?.value) || 0;
    const paid = parseFloat(document.getElementById('paidAmount')?.value) || 0;
    const finalDebt = Math.max(orderTotal + oldDebt - paid, 0);

    document.getElementById('total').innerText = "$" + finalDebt.toFixed(2);
}

function clearOrder() {
    if (!confirm('Clear this order?')) return;

    document.getElementById('customerInput').value = '';
    document.getElementById('customerSuggestions').innerHTML = '';
    document.getElementById('oldDebt').value = '';
    document.getElementById('paidAmount').value = '';
    document.getElementById('productList').innerHTML = '';
    document.getElementById('total').innerText = '$0.00';
    addRow();
}

function printInvoice() {
    const customer = document.getElementById('customerInput').value.trim();

    if (!customer) {
        alert('Please enter customer name');
        return;
    }

    const oldDebt = parseFloat(document.getElementById('oldDebt').value) || 0;
    const paid = parseFloat(document.getElementById('paidAmount').value) || 0;

    const rows = document.querySelectorAll('.order-row');
    let itemsHtml = '';
    let orderTotal = 0;
    let count = 0;

    rows.forEach(row => {
        const productInput = row.querySelector('.product-input');
        const product = productInput.value.trim();
        const unit = productInput.dataset.unit || '';
        const qty = parseFloat(row.querySelector('.qty-input').value) || 0;
        const price = parseFloat(row.querySelector('.price-input').value) || 0;
        const subtotal = qty * price;

        if (!product || qty <= 0) return;

        count++;
        orderTotal += subtotal;

        itemsHtml += `
            <tr>
                <td>${count}</td>
                <td>${product}</td>
                <td>${qty} ${unit}</td>
                <td>$${price.toFixed(2)}</td>
                <td>$${subtotal.toFixed(2)}</td>
            </tr>
        `;
    });

    if (count === 0) {
        alert('Please add at least one product');
        return;
    }

    const totalBeforePaid = orderTotal + oldDebt;
    const remaining = Math.max(totalBeforePaid - paid, 0);

    // Update customer debt automatically after invoice
    const customerIndex = customers.findIndex(c => c.name === customer);

    if (customerIndex !== -1) {
        customers[customerIndex].debt = remaining;
        saveData();
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

            <div class="invoice-total-box">
                <div><span>ORDER TOTAL:</span><strong>$${orderTotal.toFixed(2)}</strong></div>
                <div><span>OLD DEBT:</span><strong>$${oldDebt.toFixed(2)}</strong></div>
                <div><span>TOTAL:</span><strong>$${totalBeforePaid.toFixed(2)}</strong></div>
                <div><span>PAID:</span><strong>$${paid.toFixed(2)}</strong></div>
                <div class="grand-total"><span>REMAINING:</span><strong>$${remaining.toFixed(2)}</strong></div>
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

function setupEnterFlow() {
    document.addEventListener('keydown', function (e) {
        if (e.key !== 'Enter') return;

        const active = document.activeElement;
        if (!active) return;

        if (active.id === 'productName') {
            e.preventDefault();
            document.getElementById('productUnit').focus();
        }

        if (active.id === 'productUnit') {
            e.preventDefault();
            document.getElementById('productPrice').focus();
        }

        if (active.id === 'productPrice') {
            e.preventDefault();
            saveProduct();
        }

        if (active.id === 'customerName') {
            e.preventDefault();
            document.getElementById('customerDebt').focus();
        }

        if (active.id === 'customerDebt') {
            e.preventDefault();
            saveCustomer();
        }

        if (active.classList.contains('qty-input')) {
            e.preventDefault();
            active.closest('.order-row').querySelector('.price-input').focus();
        }

        if (active.classList.contains('price-input')) {
            e.preventDefault();
            addRow();
        }
    });
}

window.onload = function () {
    renderData();
    addRow();
    setupEnterFlow();
};