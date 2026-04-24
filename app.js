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

    document.querySelectorAll('#productList div').forEach(row => {
        const qty = row.children[1].value;
        const price = row.children[2].value;

        total += qty * price;
    });

    document.getElementById('total').innerText = "Total: $" + total;
}

function printInvoice() {
    window.print();
}