// DOM references
const productDes = document.getElementById("product-description");
const productTitle = document.getElementById("product-title");
const productPrice = document.getElementById("product-price");
const warningMsg = document.getElementById("warning-message");
const productList = document.getElementById("products-list");
const productForm = document.getElementById("product-form");
const cancelEditBtn = document.getElementById("cancel-edit");
const editForm = document.getElementById("edit-form");
const syncBtn = document.getElementById("sync-btn");

// Tracks the product currently being edited
let editingProductId = null;

let products = [];

// Initial API load
async function init() {
    await getProducts();
}

init();

// Creates a visual card for a product
function createProductCard(product) {
    const li = document.createElement("li");
    li.className = "flex items-center justify-center p-4 text-gray-600";
    li.dataset.id = product.id;

    // Product card template
    li.innerHTML = `
        <div class="max-w-xs bg-white rounded-lg shadow-lg p-5 flex flex-col gap-4">
            <div>
                <h3 class="text-lg font-extrabold text-gray-900">
                    ${product.title}
                </h3>
                <p class="text-sm font-bold text-gray-700">
                    ${product.price}
                </p>
            </div>
            <p>${product.description}</p>
            <div class="flex justify-end gap-2">
                <button id="delete-btn" class="px-3 py-2 text-sm font-semibold border">
                    Delete
                </button>
                <button id="edit-btn" class="px-3 py-2 text-sm font-semibold border">
                    Edit
                </button>
            </div>
        </div>`;

    // Delete product handler
    li.querySelector("#delete-btn").addEventListener("click", () => {
        deleteProduct(product.id);
    });

    // Edit product handler
    li.querySelector("#edit-btn").addEventListener("click", () => {
        editingProductId = product.id;

        // Populate edit form
        document.getElementById("edit-title").value = product.title;
        document.getElementById("edit-des").value = product.description;
        document.getElementById("edit-price").value = product.price;

        // Show edit card
        document.getElementById("edit-card").className =
            "fixed inset-0 bg-black/50 flex items-center justify-center p-4";
    });

    return li;
}

// Renders all products to the DOM
function renderProducts(products) {
    productList.innerHTML = "";

    products.forEach(product => {
        const productCard = createProductCard(product);
        productList.appendChild(productCard);
    });
}

// Loads products from API
async function getProducts() {
    try {
        const response = await fetch("http://localhost:3000/products");
        products = await response.json();
        renderProducts(products);
    } catch (error) {
        warningMsg.textContent = "Error connecting to server";
        console.error("Error loading products:", error);
    }
}

// Sends a POST request to create a product
async function createProduct(product) {
    try {
        const response = await fetch("http://localhost:3000/products", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(product)
        });

        const newProduct = await response.json();
        products.push(newProduct);
        renderProducts(products);
    } catch (error) {
        warningMsg.textContent = "Error connecting to server";
        console.error("Error creating product:", error);
    }
}

// Sends a DELETE request
async function deleteProduct(productId) {
    try {
        await fetch(`http://localhost:3000/products/${productId}`, {
            method: "DELETE"
        });

        products = products.filter(product => product.id !== productId);
        renderProducts(products);
    } catch (error) {
        warningMsg.textContent = "Error connecting to server";
        console.error("Error deleting product:", error);
    }
}

// Sends a PATCH request to update a product
async function updateProduct(productId, updates) {
    try {
        const response = await fetch(`http://localhost:3000/products/${productId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updates)
        });

        const updatedProduct = await response.json();

        products = products.map(product => (product.id === productId ? updatedProduct : product));
        renderProducts(products);
    } catch (error) {
        warningMsg.textContent = "Error connecting to server";
        console.error("Error updating product:", error);
    }
}

// Handles edit form submission
editForm.addEventListener("submit", (e) => {
    e.preventDefault();

    if (!editingProductId) return;

    const title = document.getElementById("edit-title").value.trim();
    const description = document.getElementById("edit-des").value;
    const price = document.getElementById("edit-price").value;

    if (!title || !description || !price) {
        warningMsg.textContent = "All fields are required";
        return;
    }

    updateProduct(editingProductId, { title, description, price });
    editForm.reset();
    editingProductId = null;
    document.getElementById("edit-card").className = "hidden";
});

// Cancels edit mode
cancelEditBtn.addEventListener("click", () => {
    editForm.reset();
    editingProductId = null;
    document.getElementById("edit-card").className = "hidden";
});

// Handles product creation
productForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const product = {
        id: Date.now(),
        title: productTitle.value.trim(),
        description: productDes.value,
        price: productPrice.value,
        createdAt: new Date().toLocaleDateString()
    };

    // Basic validation
    if (!product.title || !product.description || !product.price) {
        warningMsg.textContent = "You need to fill all the blanks";
        return;
    }

    createProduct(product);
    productForm.reset();
});

// Sync button to reload from server
syncBtn.addEventListener("click", () => {
    getProducts();
});
