// Gestion du panier et des produits
document.addEventListener('DOMContentLoaded', function() {
    // Données initiales des produits (seront remplacées par celles du fichier JSON ou de l'admin)
    const initialProducts = [
        {
            id: 1,
            name: "Bouquet de fleurs",
            price: 2500,
            category: "mariage",
            image: "https://images.unsplash.com/photo-1464207687429-7505649dae38?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
            description: "Magnifique bouquet de fleurs fraîches pour votre mariage"
        },
        {
            id: 2,
            name: "Robe de mariée",
            price: 15000,
            category: "mariage",
            image: "https://images.unsplash.com/photo-1519657337289-077653f724ed?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
            description: "Robe de mariée élégante et raffinée"
        },
        {
            id: 3,
            name: "Décoration de table",
            price: 3500,
            category: "decor",
            image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
            description: "Set complet pour décoration de table d'événement"
        },
        {
            id: 4,
            name: "Chapeau d'été",
            price: 1200,
            category: "accessoires",
            image: "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
            description: "Chapeau élégant pour vos événements en plein air"
        },
        {
            id: 5,
            name: "Valise vintage",
            price: 4500,
            category: "accessoires",
            image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
            description: "Valise vintage parfaite pour la décoration ou l'utilisation"
        },
        {
            id: 6,
            name: "Robe de soirée",
            price: 8500,
            category: "mariage",
            image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
            description: "Robe de soirée élégante pour vos événements spéciaux"
        }
    ];

    // Éléments DOM
    const productsContainer = document.getElementById('products-container');
    const cartItemsContainer = document.getElementById('cart-items');
    const cartCountElements = document.querySelectorAll('#cart-count, #floating-cart-count');
    const subtotalElement = document.getElementById('subtotal');
    const totalElement = document.getElementById('total');
    const checkoutBtn = document.getElementById('checkout-btn');
    const filterButtons = document.querySelectorAll('.filter-btn');
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navList = document.querySelector('.nav-list');
    const floatingCart = document.getElementById('floating-cart');
    const currentYearElement = document.getElementById('current-year');
    const imageModal = document.getElementById('image-modal');
    const modalImage = document.getElementById('modal-image');
    const closeModalButtons = document.querySelectorAll('.close-modal');
    const orderModal = document.getElementById('order-modal');
    const orderSummaryElement = document.getElementById('order-summary');
    const confirmOrderBtn = document.getElementById('confirm-order-btn');
    const cancelOrderBtn = document.getElementById('cancel-order-btn');

    // Panier (récupéré depuis localStorage ou initialisé vide)
    let cart = JSON.parse(localStorage.getItem('sassouDecorCart')) || [];
    let products = JSON.parse(localStorage.getItem('sassouDecorProducts')) || initialProducts;

    // Initialisation
    init();

    function init() {
        // Mettre à jour l'année en cours
        if (currentYearElement) {
            currentYearElement.textContent = new Date().getFullYear();
        }

        // Charger les produits
        loadProducts();

        // Charger le panier
        updateCartDisplay();

        // Événements
        setupEventListeners();

        // Sauvegarder les produits initiaux si ce n'est pas déjà fait
        if (!localStorage.getItem('sassouDecorProducts')) {
            localStorage.setItem('sassouDecorProducts', JSON.stringify(products));
        }
    }

    function setupEventListeners() {
        // Filtres de produits
        filterButtons.forEach(button => {
            button.addEventListener('click', function() {
                // Retirer la classe active de tous les boutons
                filterButtons.forEach(btn => btn.classList.remove('active'));
                // Ajouter la classe active au bouton cliqué
                this.classList.add('active');
                // Filtrer les produits
                filterProducts(this.dataset.category);
            });
        });

        // Menu mobile
        if (mobileMenuBtn) {
            mobileMenuBtn.addEventListener('click', function() {
                navList.classList.toggle('active');
            });
        }

        // Panier flottant
        if (floatingCart) {
            floatingCart.addEventListener('click', function() {
                document.getElementById('panier').scrollIntoView({ behavior: 'smooth' });
            });
        }

        // Fermer les modals
        closeModalButtons.forEach(button => {
            button.addEventListener('click', function() {
                imageModal.style.display = 'none';
                orderModal.style.display = 'none';
            });
        });

        // Fermer les modals en cliquant à l'extérieur
        window.addEventListener('click', function(event) {
            if (event.target === imageModal) {
                imageModal.style.display = 'none';
            }
            if (event.target === orderModal) {
                orderModal.style.display = 'none';
            }
        });

        // Confirmation de commande
        if (checkoutBtn) {
            checkoutBtn.addEventListener('click', function() {
                if (cart.length === 0) return;
                showOrderModal();
            });
        }

        if (confirmOrderBtn) {
            confirmOrderBtn.addEventListener('click', function() {
                confirmOrder();
            });
        }

        if (cancelOrderBtn) {
            cancelOrderBtn.addEventListener('click', function() {
                orderModal.style.display = 'none';
            });
        }
    }

    function loadProducts() {
        // Vider le conteneur
        productsContainer.innerHTML = '';

        // Pour chaque produit, créer une carte
        products.forEach(product => {
            const productCard = document.createElement('div');
            productCard.className = 'product-card';
            productCard.dataset.category = product.category;

            productCard.innerHTML = `
                <div class="product-image-container">
                    <img src="${product.image}" alt="${product.name}" class="product-image" loading="lazy">
                    <div class="product-overlay">
                        <button class="btn-view-image" data-image="${product.image}">
                            <i class="fas fa-search"></i>
                        </button>
                    </div>
                </div>
                <div class="product-info">
                    <span class="product-category">${getCategoryName(product.category)}</span>
                    <h3 class="product-name">${product.name}</h3>
                    <p class="product-description">${product.description}</p>
                    <div class="product-price">${formatPrice(product.price)} HTG</div>
                    <div class="product-actions">
                        <button class="btn btn-primary btn-add-to-cart" data-id="${product.id}">
                            <i class="fas fa-cart-plus"></i> Ajouter au panier
                        </button>
                    </div>
                </div>
            `;

            productsContainer.appendChild(productCard);
        });

        // Ajouter les événements pour les boutons "Ajouter au panier"
        document.querySelectorAll('.btn-add-to-cart').forEach(button => {
            button.addEventListener('click', function() {
                const productId = parseInt(this.dataset.id);
                addToCart(productId);
            });
        });

        // Ajouter les événements pour les boutons de visualisation d'image
        document.querySelectorAll('.btn-view-image').forEach(button => {
            button.addEventListener('click', function() {
                const imageUrl = this.dataset.image;
                showImageModal(imageUrl);
            });
        });
    }

    function filterProducts(category) {
        const productCards = document.querySelectorAll('.product-card');
        
        productCards.forEach(card => {
            if (category === 'all' || card.dataset.category === category) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    }

    function getCategoryName(categoryKey) {
        const categories = {
            'mariage': 'Mariage',
            'decor': 'Décoration',
            'accessoires': 'Accessoires'
        };
        
        return categories[categoryKey] || categoryKey;
    }

    function addToCart(productId) {
        // Trouver le produit
        const product = products.find(p => p.id === productId);
        if (!product) return;

        // Vérifier si le produit est déjà dans le panier
        const existingItem = cart.find(item => item.id === productId);
        
        if (existingItem) {
            // Augmenter la quantité
            existingItem.quantity += 1;
        } else {
            // Ajouter un nouvel article
            cart.push({
                id: product.id,
                name: product.name,
                price: product.price,
                image: product.image,
                quantity: 1
            });
        }

        // Mettre à jour le panier dans le localStorage
        saveCartToStorage();
        
        // Mettre à jour l'affichage du panier
        updateCartDisplay();

        // Afficher une notification
        showNotification(`${product.name} ajouté au panier`);
    }

    function updateCartDisplay() {
        // Mettre à jour le nombre d'articles
        const itemCount = cart.reduce((total, item) => total + item.quantity, 0);
        cartCountElements.forEach(element => {
            element.textContent = itemCount;
        });

        // Mettre à jour l'affichage des articles du panier
        renderCartItems();

        // Mettre à jour le résumé
        updateCartSummary();

        // Activer/désactiver le bouton de commande
        checkoutBtn.disabled = cart.length === 0;
    }

    function renderCartItems() {
        // Vider le conteneur
        cartItemsContainer.innerHTML = '';

        if (cart.length === 0) {
            cartItemsContainer.innerHTML = `
                <div class="empty-cart-message">
                    <i class="fas fa-shopping-cart"></i>
                    <p>Votre panier est vide</p>
                    <a href="#produits" class="btn btn-outline">Continuer vos achats</a>
                </div>
            `;
            return;
        }

        // Pour chaque article du panier
        cart.forEach(item => {
            const cartItem = document.createElement('div');
            cartItem.className = 'cart-item';
            
            cartItem.innerHTML = `
                <img src="${item.image}" alt="${item.name}" class="cart-item-image">
                <div class="cart-item-details">
                    <h4 class="cart-item-name">${item.name}</h4>
                    <div class="cart-item-price">${formatPrice(item.price)} HTG</div>
                    <div class="cart-item-quantity">
                        <button class="quantity-btn minus" data-id="${item.id}">-</button>
                        <span class="quantity-value">${item.quantity}</span>
                        <button class="quantity-btn plus" data-id="${item.id}">+</button>
                    </div>
                </div>
                <button class="cart-item-remove" data-id="${item.id}">
                    <i class="fas fa-trash"></i>
                </button>
            `;
            
            cartItemsContainer.appendChild(cartItem);
        });

        // Ajouter les événements pour les boutons de quantité et de suppression
        document.querySelectorAll('.quantity-btn.minus').forEach(button => {
            button.addEventListener('click', function() {
                const productId = parseInt(this.dataset.id);
                updateCartItemQuantity(productId, -1);
            });
        });

        document.querySelectorAll('.quantity-btn.plus').forEach(button => {
            button.addEventListener('click', function() {
                const productId = parseInt(this.dataset.id);
                updateCartItemQuantity(productId, 1);
            });
        });

        document.querySelectorAll('.cart-item-remove').forEach(button => {
            button.addEventListener('click', function() {
                const productId = parseInt(this.dataset.id);
                removeFromCart(productId);
            });
        });
    }

    function updateCartItemQuantity(productId, change) {
        const item = cart.find(item => item.id === productId);
        if (!item) return;

        item.quantity += change;

        // Si la quantité est inférieure à 1, supprimer l'article
        if (item.quantity < 1) {
            removeFromCart(productId);
            return;
        }

        // Mettre à jour le panier dans le localStorage
        saveCartToStorage();
        
        // Mettre à jour l'affichage du panier
        updateCartDisplay();
    }

    function removeFromCart(productId) {
        // Filtrer l'article à supprimer
        const item = cart.find(item => item.id === productId);
        cart = cart.filter(item => item.id !== productId);

        // Mettre à jour le panier dans le localStorage
        saveCartToStorage();
        
        // Mettre à jour l'affichage du panier
        updateCartDisplay();

        // Afficher une notification
        if (item) {
            showNotification(`${item.name} retiré du panier`);
        }
    }

    function updateCartSummary() {
        const subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
        const shipping = subtotal > 0 ? 500 : 0; // Frais de livraison fixes
        const total = subtotal + shipping;

        if (subtotalElement) {
            subtotalElement.textContent = `${formatPrice(subtotal)} HTG`;
        }
        
        if (totalElement) {
            totalElement.textContent = `${formatPrice(total)} HTG`;
        }

        // Mettre à jour les frais de livraison
        const shippingElement = document.getElementById('shipping');
        if (shippingElement) {
            shippingElement.textContent = subtotal > 0 ? `${formatPrice(shipping)} HTG` : 'À calculer';
        }
    }

    function saveCartToStorage() {
        localStorage.setItem('sassouDecorCart', JSON.stringify(cart));
    }

    function formatPrice(price) {
        return new Intl.NumberFormat('fr-HT').format(price);
    }

    function showNotification(message) {
        // Créer l'élément de notification
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background-color: var(--primary-color);
            color: white;
            padding: 15px 25px;
            border-radius: 6px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.2);
            z-index: 2000;
            font-weight: 500;
            transform: translateX(100%);
            opacity: 0;
            transition: transform 0.3s ease, opacity 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        
        // Animer l'entrée
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
            notification.style.opacity = '1';
        }, 10);
        
        // Animer la sortie après 3 secondes
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            notification.style.opacity = '0';
            
            // Supprimer l'élément après l'animation
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    function showImageModal(imageUrl) {
        modalImage.src = imageUrl;
        imageModal.style.display = 'flex';
    }

    function showOrderModal() {
        // Construire le résumé de la commande
        let summaryHTML = '<div class="order-details">';
        
        cart.forEach(item => {
            const itemTotal = item.price * item.quantity;
            summaryHTML += `
                <div class="order-item">
                    <div class="order-item-name">${item.name} x ${item.quantity}</div>
                    <div class="order-item-price">${formatPrice(itemTotal)} HTG</div>
                </div>
            `;
        });
        
        const subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
        const shipping = 500;
        const total = subtotal + shipping;
        
        summaryHTML += `
            <div class="order-totals">
                <div class="order-summary-row">
                    <span>Sous-total:</span>
                    <span>${formatPrice(subtotal)} HTG</span>
                </div>
                <div class="order-summary-row">
                    <span>Livraison:</span>
                    <span>${formatPrice(shipping)} HTG</span>
                </div>
                <div class="order-summary-row total">
                    <span>Total:</span>
                    <span>${formatPrice(total)} HTG</span>
                </div>
            </div>
            <div class="order-instructions">
                <p><strong>Instructions pour le paiement:</strong></p>
                <p>1. Envoyez le paiement de <strong>${formatPrice(total)} HTG</strong> via MonCash au numéro <strong>+509 3490 2252</strong></p>
                <p>2. Indiquez votre nom et "Commande Sassou Décor" dans la description</p>
                <p>3. Nous vous contacterons pour confirmer la commande et organiser la livraison</p>
            </div>
        `;
        
        summaryHTML += '</div>';
        
        orderSummaryElement.innerHTML = summaryHTML;
        orderModal.style.display = 'flex';
    }

    function confirmOrder() {
        // Générer un numéro de commande
        const orderNumber = 'CMD-' + Date.now().toString().slice(-6);
        
        // Créer l'objet commande
        const order = {
            id: orderNumber,
            date: new Date().toISOString(),
            items: [...cart],
            subtotal: cart.reduce((total, item) => total + (item.price * item.quantity), 0),
            shipping: 500,
            total: cart.reduce((total, item) => total + (item.price * item.quantity), 0) + 500,
            status: 'En attente de paiement'
        };
        
        // Sauvegarder la commande dans le localStorage
        const orders = JSON.parse(localStorage.getItem('sassouDecorOrders')) || [];
        orders.push(order);
        localStorage.setItem('sassouDecorOrders', JSON.stringify(orders));
        
        // Vider le panier
        cart = [];
        saveCartToStorage();
        updateCartDisplay();
        
        // Fermer le modal
        orderModal.style.display = 'none';
        
        // Afficher une notification de confirmation
        showNotification(`Commande ${orderNumber} confirmée! Vérifiez vos instructions de paiement.`);
        
        // Rediriger vers la section contact
        setTimeout(() => {
            document.getElementById('contact').scrollIntoView({ behavior: 'smooth' });
        }, 500);
    }

    // Exposer certaines fonctions pour l'administration
    window.updateProductsList = function(updatedProducts) {
        products = updatedProducts;
        localStorage.setItem('sassouDecorProducts', JSON.stringify(products));
        loadProducts();
    };
});