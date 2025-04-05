// Глобальные переменные
let products = [];
let isAdmin = false;
const ADMIN_PASSWORD = '56541597';
const API_URL = 'https://api.jsonbin.io/v3/b/67f0ff4b8a456b796682e089'; // ID бина
const API_KEY = '$2a$10$VLCZsh.BhvkViw6PJ0RJMujv1RyyIt4HkGSnd8M8ueWgwQLL7VTCG'; // API ключ
const DEFAULT_PRODUCTS = [
    {
        id: 1,
        name: "Кожаный кошелек",
        description: "Классический кошелек ручной работы из натуральной кожи. Отличный выбор для повседневного использования.",
        category: "wallets",
        price: 3500,
        image: "https://i.ibb.co/pBfZTC2L/photo-2024-09-06-01-15-09-prev-ui.png"
    },
    {
        id: 2,
        name: "Сумка через плечо",
        description: "Стильная сумка из натуральной кожи",
        category: "bags",
        price: 7500,
        image: "https://via.placeholder.com/300x200.png?text=Сумка"
    },
    {
        id: 3,
        name: "Кожаный ремень",
        description: "Прочный ремень с классической пряжкой",
        category: "accessories",
        price: 2500,
        image: "https://via.placeholder.com/300x200.png?text=Ремень"
    }
];
const STORAGE_KEY = 'tropov_products';
const PRODUCTS_PER_PAGE = 3;
let currentPage = 1;
let isShowingAll = false;

// Загрузка продуктов при запуске
document.addEventListener('DOMContentLoaded', () => {
    loadProducts();
    setupEventListeners();
    setupSmoothScroll();
    setupTheme();
});

// Настройка темы
function setupTheme() {
    const themeToggle = document.getElementById('themeToggle');
    const savedTheme = localStorage.getItem('theme');
    
    // Устанавливаем сохранённую тему или светлую по умолчанию
    if (savedTheme) {
        document.documentElement.setAttribute('data-theme', savedTheme);
        if (savedTheme === 'dark') {
            themeToggle.querySelector('i').classList.replace('fa-moon', 'fa-sun');
        }
    }

    themeToggle.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        const icon = themeToggle.querySelector('i');

        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);

        // Анимируем смену иконки
        icon.style.transform = 'scale(0)';
        setTimeout(() => {
            icon.classList.toggle('fa-moon');
            icon.classList.toggle('fa-sun');
            icon.style.transform = 'scale(1)';
        }, 150);
    });
}

// Плавная прокрутка
function setupSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Функция загрузки продуктов
async function loadProducts() {
    try {
        const response = await fetch(API_URL, {
            headers: {
                'X-Master-Key': API_KEY
            }
        });
        
        if (!response.ok) {
            throw new Error('Ошибка загрузки данных');
        }

        const data = await response.json();
        products = data.record.products;
        displayProducts(products);
    } catch (error) {
        console.error('Ошибка при загрузке продуктов:', error);
        showError('Не удалось загрузить продукты. Пожалуйста, попробуйте позже.');
    }
}

// Отображение продуктов
function displayProducts(productsToShow) {
    const container = document.getElementById('productsContainer');
    container.innerHTML = '';

    // Определяем, сколько товаров показывать
    const endIndex = isShowingAll ? productsToShow.length : Math.min(PRODUCTS_PER_PAGE * currentPage, productsToShow.length);
    const productsToDisplay = productsToShow.slice(0, endIndex);

    // Отображаем товары
    productsToDisplay.forEach(product => {
        const card = document.createElement('div');
        card.className = 'product-card';
        
        card.innerHTML = `
            <img src="${product.image}" alt="${product.name}" class="product-image" onerror="this.src='https://via.placeholder.com/300x200.png?text=Изображение+не+найдено'">
            <div class="product-info">
                <h3 class="product-name">${product.name}</h3>
                <p class="product-description">${product.description}</p>
                <p class="price">${product.price} ₽</p>
                ${isAdmin ? `
                    <button onclick="editProduct(${product.id})">Редактировать</button>
                    <button onclick="deleteProduct(${product.id})" style="background-color: #dc3545;">Удалить</button>
                ` : `
                    <button onclick="window.location.href='https://t.me/+79154879098'">Заказать</button>
                `}
            </div>
        `;
        
        container.appendChild(card);
    });

    // Обновляем кнопки загрузки
    updateLoadMoreButtons(productsToShow.length);
}

// Обновление кнопок загрузки
function updateLoadMoreButtons(totalProducts) {
    const loadMoreContainer = document.querySelector('.load-more-container') || document.createElement('div');
    loadMoreContainer.className = 'load-more-container';
    loadMoreContainer.innerHTML = '';

    const currentlyShowing = isShowingAll ? totalProducts : Math.min(PRODUCTS_PER_PAGE * currentPage, totalProducts);

    if (totalProducts > PRODUCTS_PER_PAGE) {
        if (!isShowingAll && currentlyShowing < totalProducts) {
            const loadMoreBtn = document.createElement('button');
            loadMoreBtn.className = 'load-more-btn';
            loadMoreBtn.innerHTML = `
                Показать ещё
                <i class="fas fa-chevron-down"></i>
            `;
            loadMoreBtn.onclick = () => {
                currentPage++;
                displayProducts(products);
            };
            loadMoreContainer.appendChild(loadMoreBtn);
        }

        if (currentlyShowing > PRODUCTS_PER_PAGE) {
            const showLessBtn = document.createElement('button');
            showLessBtn.className = 'show-less-btn';
            showLessBtn.innerHTML = `
                Показать меньше
                <i class="fas fa-chevron-up"></i>
            `;
            showLessBtn.onclick = () => {
                currentPage = 1;
                isShowingAll = false;
                displayProducts(products);
            };
            loadMoreContainer.appendChild(showLessBtn);
        }
    }

    const productsContainer = document.getElementById('productsContainer');
    if (productsContainer.nextElementSibling?.className !== 'load-more-container') {
        productsContainer.after(loadMoreContainer);
    }
}

// Настройка обработчиков событий
function setupEventListeners() {
    // Поиск и фильтрация
    const searchInput = document.getElementById('searchInput');
    const filterSelect = document.getElementById('filterSelect');
    
    if (searchInput) {
        searchInput.addEventListener('input', filterProducts);
    }
    if (filterSelect) {
        filterSelect.addEventListener('change', filterProducts);
    }

    // Админ панель
    const adminLoginBtn = document.getElementById('adminLoginBtn');
    const addProductBtn = document.getElementById('addProductBtn');
    const productForm = document.getElementById('productForm');
    const cancelProductBtn = document.getElementById('cancelProductBtn');
    const exportProductsBtn = document.getElementById('exportProductsBtn');

    if (adminLoginBtn) {
        adminLoginBtn.addEventListener('click', toggleAdminPanel);
    }
    if (addProductBtn) {
        addProductBtn.addEventListener('click', () => {
            productForm.style.display = 'grid';
            productForm.dataset.mode = 'add';
            productForm.reset();
        });
    }
    if (cancelProductBtn) {
        cancelProductBtn.addEventListener('click', () => {
            productForm.style.display = 'none';
        });
    }
    if (productForm) {
        productForm.addEventListener('submit', handleProductSubmit);
    }
    if (exportProductsBtn) {
        exportProductsBtn.addEventListener('click', exportProducts);
    }

    // Форма контактов
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', handleContactSubmit);
    }
}

// Обработка отправки формы контактов
function handleContactSubmit(event) {
    event.preventDefault();
    const form = event.target;
    showError('Спасибо за ваше сообщение! Мы свяжемся с вами в ближайшее время.', 'success');
    form.reset();
}

// Фильтрация продуктов
function filterProducts() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const category = document.getElementById('filterSelect').value;

    const filtered = products.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchTerm) ||
                            product.description.toLowerCase().includes(searchTerm);
        const matchesCategory = category === 'all' || product.category === category;
        return matchesSearch && matchesCategory;
    });

    displayProducts(filtered);
}

// Сохранение продуктов
async function saveProducts() {
    try {
        const response = await fetch(API_URL, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-Master-Key': API_KEY
            },
            body: JSON.stringify({ products })
        });

        if (!response.ok) {
            throw new Error('Ошибка сохранения данных');
        }

        return true;
    } catch (error) {
        console.error('Ошибка при сохранении продуктов:', error);
        showError('Не удалось сохранить изменения. Пожалуйста, попробуйте позже.');
        return false;
    }
}

// Экспорт продуктов
function exportProducts() {
    const dataStr = JSON.stringify(products, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = 'products.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
}

// Обработка отправки формы продукта
async function handleProductSubmit(event) {
    event.preventDefault();

    try {
        const form = event.target;
        const formData = new FormData(form);
        
        const name = formData.get('productName');
        const description = formData.get('productDescription');
        const category = formData.get('productCategory');
        const price = formData.get('productPrice');
        const imageUrl = formData.get('productImage');

        if (!name || !description || !category || !price) {
            throw new Error('Пожалуйста, заполните все обязательные поля');
        }

        const mode = form.dataset.mode;
        const productId = form.dataset.productId;

        const productData = {
            id: mode === 'add' ? Date.now() : parseInt(productId),
            name: name.trim(),
            description: description.trim(),
            category: category,
            price: parseInt(price),
            image: imageUrl || 'https://via.placeholder.com/300x200.png?text=Нет+изображения'
        };

        if (isNaN(productData.price) || productData.price <= 0) {
            throw new Error('Пожалуйста, укажите корректную цену');
        }

        if (imageUrl && !isValidUrl(imageUrl)) {
            throw new Error('Пожалуйста, укажите корректный URL изображения');
        }

        if (mode === 'add') {
            products.push(productData);
        } else {
            const index = products.findIndex(p => p.id === parseInt(productId));
            if (index !== -1) {
                products[index] = productData;
            } else {
                throw new Error('Продукт для редактирования не найден');
            }
        }

        if (await saveProducts()) {
            form.style.display = 'none';
            form.reset();
            await loadProducts(); // Перезагружаем продукты после сохранения
            showError('Продукт успешно сохранен', 'success');
        }
    } catch (error) {
        console.error('Ошибка при сохранении продукта:', error);
        showError(error.message);
    }
}

// Проверка валидности URL
function isValidUrl(string) {
    try {
        new URL(string);
        return true;
    } catch (_) {
        return false;
    }
}

// Функции для работы с продуктами
function editProduct(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const form = document.getElementById('productForm');
    form.dataset.mode = 'edit';
    form.dataset.productId = productId;

    document.getElementById('productName').value = product.name;
    document.getElementById('productDescription').value = product.description;
    document.getElementById('productCategory').value = product.category;
    document.getElementById('productPrice').value = product.price;

    form.style.display = 'grid';
}

function deleteProduct(productId) {
    if (confirm('Вы уверены, что хотите удалить этот товар?')) {
        products = products.filter(p => p.id !== productId);
        if (saveProducts()) {
            displayProducts(products);
            showError('Товар успешно удален', 'success');
        }
    }
}

// Управление админ-панелью
function toggleAdminPanel() {
    const adminPanel = document.getElementById('admin');
    const loginBtn = document.getElementById('adminLoginBtn');
    
    if (!isAdmin) {
        const password = prompt('Введите пароль администратора:');
        if (password === ADMIN_PASSWORD) {
            isAdmin = true;
            adminPanel.classList.add('active');
            loginBtn.textContent = 'Выйти';
            displayProducts(products);
        } else {
            alert('Неверный пароль');
        }
    } else {
        isAdmin = false;
        adminPanel.classList.remove('active');
        loginBtn.textContent = 'Войти в админ-панель';
        displayProducts(products);
    }
}

// Отображение ошибок и сообщений
function showError(message, type = 'error') {
    const alertClass = type === 'success' ? 'alert-success' : 'alert-danger';
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert ${alertClass}`;
    alertDiv.textContent = message;
    
    // Удаляем предыдущие алерты
    const existingAlerts = document.querySelectorAll('.alert');
    existingAlerts.forEach(alert => alert.remove());
    
    // Добавляем новый алерт в начало страницы
    document.body.insertBefore(alertDiv, document.body.firstChild);
    
    // Автоматически скрываем через 5 секунд
    setTimeout(() => {
        alertDiv.remove();
    }, 5000);
}