const productDes = document.getElementById("product-description");
const productTitle = document.getElementById("product-title");
const productPrice = document.getElementById("product-price");
const warningMsg = document.getElementById("warning-message");
const productList = document.getElementById("products-list");
const productForm = document.getElementById("product-form");
const cancelEditBtn = document.getElementById("cancel-edit")
const editForm = document.getElementById("edit-form")
let editingProductId = null

let products = [];
saveProducts();

renderProducts(products);

function createProductCard(product) {
    const li = document.createElement("li");
    li.className = "flex items-center justify-center p-4 text-gray-600";
    li.dataset.id = product.id;
    li.innerHTML =
        `<div class="max-w-xs bg-white rounded-lg shadow-lg p-5 flex flex-col gap-4">
                <div>
                    <h3 class="text-lg font-extrabold text-gray-900">
                        ${product.title}
                    </h3>
                    <p class="text-sm font-bold text-gray-700">
                        ${product.price}
                    </p>
                </div>
                <p>
                ${product.description}
                </p>
                <div class="flex justify-end gap-2">
                    <button id="delete-btn" class="px-3 py-2 text-sm font-semibold border">
                        Delete
                    </button>
                    <button id="edit-btn" class="px-3 py-2 text-sm font-semibold border">
                        Edit
                    </button>
                </div>
            </div>`

    // delete product

    li.querySelector("#delete-btn").addEventListener("click", () => {
        deleteProduct(product.id);
        products = getProducts();
        renderProducts(products);
    });

    // Edit product

    li.querySelector("#edit-btn").addEventListener("click", () => {
        editingProductId = product.id;

        document.getElementById("edit-title").value = product.title;
        document.getElementById("edit-des").value = product.description;
        document.getElementById("edit-price").value = product.price;

        document.getElementById("edit-card").className = "fixed inset-0 bg-black/50 flex items-center justify-center p-4";
    });
    return li
}

function renderProducts(products) {
    productList.innerHTML = "";

    products.forEach(product => {
        const productCard = createProductCard(product)
        productList.appendChild(productCard);
    });
}

async function createProduct(product) {
    try {
        const response = await fetch("http://localhost:3000/products", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(product)
        });

        const newProduct = await response.json();
        products.push(newProduct);
        renderProducts(products);
    } catch (error) {
        console.error("Error creating product:", error);
    }
}


async function deleteProduct(productId) {
    try {
        await fetch(`http://localhost:3000/products/${productId}`, {
            method: "DELETE"
        });

        products = products.filter(product => product.id !== productId);
        renderProducts(products);
    } catch (error) {
        console.error("Error deleting product:", error);
    }
}


async function updateProduct(productId, updates) {
    try {
        const response = await fetch(`http://localhost:3000/products/${productId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                ...updates,
                id: productId
            })
        });

        const updatedProduct = await response.json();

        products = products.map(product =>
            product.id === productId ? updatedProduct : product
        );

        renderProducts(products);
    } catch (error) {
        console.error("Error updating product:", error);
    }
}


async function saveProducts() {
    try {
        const response = await fetch("http://localhost:3000/products");
        products = await response.json();
        renderProducts(products);
    } catch (error) {
        console.error("Error loading products:", error);
    }
}

function saveProducts(products) {
    localStorage.setItem("products", JSON.stringify(products));
}

editForm.addEventListener("submit", (e) => {
    e.preventDefault();

    if (!editingProductId) return;

    const title = document.getElementById("edit-title").value.trim();
    const description = document.getElementById("edit-des").value;
    const price = document.getElementById("edit-price").value;

    updateProduct(editingProductId, { title, description, price }, products);

    products = getProducts();
    renderProducts(products);

    editingProductId = null;
    document.getElementById("edit-card").className = "hidden";
});

cancelEditBtn.addEventListener("click", () => {
    editingProductId = null;
    document.getElementById("edit-card").className = "hidden";
});

productForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const product = {
        id: Date.now(),
        title: productTitle.value.trim(),
        description: productDes.value,
        price: productPrice.value,
        createdAt: new Date().toLocaleDateString()
    };

    if (!product.title || !product.description || !product.price) {
        warningMsg.textContent = "You need to fill all the blancks"
        return
    };



    createProduct(product);
    productForm.reset();
});


