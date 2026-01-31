// Gestion de l'administration
document.addEventListener('DOMContentLoaded', function() {
    // Éléments DOM
    const adminLogin = document.getElementById('admin-login');
    const adminPanel = document.getElementById('admin-panel');
    const adminPasswordInput = document.getElementById('admin-password');
    const loginBtn = document.getElementById('login-btn');
    const logoutBtn = document.getElementById('logout-btn');
    const addProductBtn = document.getElementById('add-product-btn');
    const productForm = document.getElementById('product-form');
    const saveProductBtn = document.getElementById('save-product-btn');
    const cancelProductBtn = document.getElementById('cancel-product-btn');
    const exportProductsBtn = document.getElementById('export-products-btn');
    const importProductsBtn = document.getElementById('import-products-btn');
    const imageUpload = document.getElementById('image-upload');
    const productsListAdmin = document.getElementById('products-list-admin');
    
    // Champs du formulaire
    const productIdField = document.getElementById('product-id');
    const productNameField = document.getElementById('product-name');
    const productPriceField = document.getElementById('product-price');
    const productCategoryField = document.getElementById('product-category');
    const productImageField = document.getElementById('product-image');
    const productDescriptionField = document.getElementById('product-description');
    const formTitle = document.getElementById('form-title');
    
    // Mot de passe admin (à changer après la première connexion)
    const ADMIN_PASSWORD = 'admin123';
    
    // Initialisation
    checkAdminLogin();
    loadAdminProducts();
    
    // Événements
    loginBtn.addEventListener('click', handleLogin);
    logoutBtn.addEventListener('click', handleLogout);
    addProductBtn.addEventListener('click', showAddProductForm);
    saveProductBtn.addEventListener('click', saveProduct);
    cancelProductBtn.addEventListener('click', cancelProductForm);
    exportProductsBtn.addEventListener('click', exportProducts);
    importProductsBtn.addEventListener('click', triggerImport);
    imageUpload.addEventListener('change', handleImageUpload);
    
    // Vérifier si l'admin est déjà connecté
    function checkAdminLogin() {
        const isLoggedIn = localStorage.getItem('sassouDecorAdminLoggedIn') === 'true';
        
        if (isLoggedIn) {
            adminLogin.style.display = 'none';
            adminPanel.style.display = 'block';
        } else {
            adminLogin.style.display = 'block';
            adminPanel.style.display = 'none';
        }
    }
    
    // Gestion de la connexion
    function handleLogin() {
        const password = adminPasswordInput.value.trim();
        
        if (password === ADMIN_PASSWORD) {
            // Connexion réussie
            localStorage.setItem('sassouDecorAdminLoggedIn', 'true');
            adminLogin.style.display = 'none';
            adminPanel.style.display = 'block';
            adminPasswordInput.value = '';
            
            // Recharger la liste des produits
            loadAdminProducts();
        } else {
            alert('Mot de passe incorrect. Essayez à nouveau.');
            adminPasswordInput.value = '';
            adminPasswordInput.focus();
        }
    }
    
    // Gestion de la déconnexion
    function handleLogout() {
        localStorage.removeItem('sassouDecorAdminLoggedIn');
        adminLogin.style.display = 'block';
        adminPanel.style.display = 'none';
    }
    
    // Afficher le formulaire d'ajout de produit
    function showAddProductForm() {
        resetProductForm();
        formTitle.textContent = 'Ajouter un nouveau produit';
        productForm.style.display = 'block';
        productNameField.focus();
        
        // Faire défiler jusqu'au formulaire
        setTimeout(() => {
            productForm.scrollIntoView({ behavior: 'smooth' });
        }, 100);
    }
    
    // Réinitialiser le formulaire
    function resetProductForm() {
        productIdField.value = '';
        productNameField.value = '';
        productPriceField.value = '';
        productCategoryField.value = 'mariage';
        productImageField.value = '';
        productDescriptionField.value = '';
        imageUpload.value = '';
    }
    
    // Sauvegarder un produit (ajout ou modification)
    function saveProduct() {
        // Valider les champs
        if (!productNameField.value.trim()) {
            alert('Veuillez saisir un nom pour le produit');
            productNameField.focus();
            return;
        }
        
        if (!productPriceField.value || parseFloat(productPriceField.value) <= 0) {
            alert('Veuillez saisir un prix valide');
            productPriceField.focus();
            return;
        }
        
        if (!productImageField.value.trim() && imageUpload.files.length === 0) {
            alert('Veuillez fournir une image (URL ou fichier)');
            return;
        }
        
        // Récupérer les produits actuels
        let products = JSON.parse(localStorage.getItem('sassouDecorProducts')) || [];
        
        let imageUrl = productImageField.value.trim();
        
        // Si un fichier a été téléversé, le convertir en URL de données
        if (imageUpload.files.length > 0) {
            const file = imageUpload.files[0];
            const reader = new FileReader();
            
            reader.onload = function(e) {
                imageUrl = e.target.result;
                finalizeProductSave(products, imageUrl);
            };
            
            reader.readAsDataURL(file);
            return;
        }
        
        finalizeProductSave(products, imageUrl);
    }
    
    function finalizeProductSave(products, imageUrl) {
        const productId = productIdField.value;
        const productData = {
            name: productNameField.value.trim(),
            price: parseFloat(productPriceField.value),
            category: productCategoryField.value,
            image: imageUrl,
            description: productDescriptionField.value.trim()
        };
        
        if (productId) {
            // Modification d'un produit existant
            const index = products.findIndex(p => p.id == productId);
            if (index !== -1) {
                // Conserver l'ID existant
                productData.id = parseInt(productId);
                products[index] = productData;
            }
        } else {
            // Ajout d'un nouveau produit
            // Générer un nouvel ID
            const maxId = products.length > 0 ? Math.max(...products.map(p => p.id)) : 0;
            productData.id = maxId + 1;
            products.push(productData);
        }
        
        // Sauvegarder les produits
        localStorage.setItem('sassouDecorProducts', JSON.stringify(products));
        
        // Mettre à jour l'affichage
        loadAdminProducts();
        
        // Masquer le formulaire
        productForm.style.display = 'none';
        
        // Réinitialiser le formulaire
        resetProductForm();
        
        // Mettre à jour la liste des produits sur la page principale
        if (window.updateProductsList) {
            window.updateProductsList(products);
        }
        
        // Afficher une confirmation
        alert(productId ? 'Produit modifié avec succès!' : 'Produit ajouté avec succès!');
    }
    
    // Annuler le formulaire
    function cancelProductForm() {
        productForm.style.display = 'none';
        resetProductForm();
    }
    
    // Charger les produits pour l'administration
    function loadAdminProducts() {
        const products = JSON.parse(localStorage.getItem('sassouDecorProducts')) || [];
        
        // Vider la liste
        productsListAdmin.innerHTML = '';
        
        if (products.length === 0) {
            productsListAdmin.innerHTML = '<p class="no-products">Aucun produit trouvé. Ajoutez votre premier produit!</p>';
            return;
        }
        
        // Trier les produits par ID (les plus récents d'abord)
        products.sort((a, b) => b.id - a.id);
        
        // Afficher chaque produit
        products.forEach(product => {
            const productElement = document.createElement('div');
            productElement.className = 'admin-product-item';
            productElement.innerHTML = `
                <img src="${product.image}" alt="${product.name}" class="admin-product-image">
                <div class="admin-product-details">
                    <h4 class="admin-product-name">${product.name}</h4>
                    <span class="admin-product-category">${getCategoryName(product.category)}</span>
                    <p class="admin-product-description">${product.description}</p>
                    <div class="admin-product-price">${formatPrice(product.price)} HTG</div>
                </div>
                <div class="admin-product-actions">
                    <button class="btn btn-outline btn-edit" data-id="${product.id}">
                        <i class="fas fa-edit"></i> Modifier
                    </button>
                    <button class="btn btn-outline btn-delete" data-id="${product.id}">
                        <i class="fas fa-trash"></i> Supprimer
                    </button>
                </div>
            `;
            
            productsListAdmin.appendChild(productElement);
        });
        
        // Ajouter les événements pour les boutons
        document.querySelectorAll('.btn-edit').forEach(button => {
            button.addEventListener('click', function() {
                const productId = this.dataset.id;
                editProduct(productId);
            });
        });
        
        document.querySelectorAll('.btn-delete').forEach(button => {
            button.addEventListener('click', function() {
                const productId = this.dataset.id;
                deleteProduct(productId);
            });
        });
    }
    
    // Éditer un produit
    function editProduct(productId) {
        const products = JSON.parse(localStorage.getItem('sassouDecorProducts')) || [];
        const product = products.find(p => p.id == productId);
        
        if (!product) return;
        
        // Remplir le formulaire avec les données du produit
        productIdField.value = product.id;
        productNameField.value = product.name;
        productPriceField.value = product.price;
        productCategoryField.value = product.category;
        productImageField.value = product.image;
        productDescriptionField.value = product.description;
        
        // Mettre à jour le titre du formulaire
        formTitle.textContent = 'Modifier le produit';
        
        // Afficher le formulaire
        productForm.style.display = 'block';
        
        // Faire défiler jusqu'au formulaire
        setTimeout(() => {
            productForm.scrollIntoView({ behavior: 'smooth' });
        }, 100);
    }
    
    // Supprimer un produit
    function deleteProduct(productId) {
        if (!confirm('Êtes-vous sûr de vouloir supprimer ce produit?')) {
            return;
        }
        
        let products = JSON.parse(localStorage.getItem('sassouDecorProducts')) || [];
        
        // Filtrer le produit à supprimer
        products = products.filter(p => p.id != productId);
        
        // Sauvegarder les produits mis à jour
        localStorage.setItem('sassouDecorProducts', JSON.stringify(products));
        
        // Recharger la liste
        loadAdminProducts();
        
        // Mettre à jour la liste des produits sur la page principale
        if (window.updateProductsList) {
            window.updateProductsList(products);
        }
        
        alert('Produit supprimé avec succès!');
    }
    
    // Exporter les produits en JSON
    function exportProducts() {
        const products = JSON.parse(localStorage.getItem('sassouDecorProducts')) || [];
        
        if (products.length === 0) {
            alert('Aucun produit à exporter');
            return;
        }
        
        // Créer un objet avec les données
        const exportData = {
            exportedAt: new Date().toISOString(),
            products: products
        };
        
        // Convertir en JSON
        const jsonData = JSON.stringify(exportData, null, 2);
        
        // Créer un blob et un lien de téléchargement
        const blob = new Blob([jsonData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `sassou-decor-products-${new Date().toISOString().slice(0, 10)}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        URL.revokeObjectURL(url);
        
        alert('Produits exportés avec succès!');
    }
    
    // Déclencher l'importation de produits
    function triggerImport() {
        // Créer un input de fichier caché
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = '.json';
        fileInput.style.display = 'none';
        
        fileInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (!file) return;
            
            const reader = new FileReader();
            
            reader.onload = function(e) {
                try {
                    const importData = JSON.parse(e.target.result);
                    
                    // Vérifier la structure des données
                    if (!importData.products || !Array.isArray(importData.products)) {
                        throw new Error('Format de fichier invalide');
                    }
                    
                    // Demander confirmation
                    if (!confirm(`Voulez-vous importer ${importData.products.length} produits? Cela remplacera vos produits actuels.`)) {
                        return;
                    }
                    
                    // Attribuer de nouveaux IDs aux produits importés
                    const products = importData.products.map((p, index) => ({
                        ...p,
                        id: index + 1
                    }));
                    
                    // Sauvegarder les produits
                    localStorage.setItem('sassouDecorProducts', JSON.stringify(products));
                    
                    // Recharger la liste
                    loadAdminProducts();
                    
                    // Mettre à jour la liste des produits sur la page principale
                    if (window.updateProductsList) {
                        window.updateProductsList(products);
                    }
                    
                    alert(`${products.length} produits importés avec succès!`);
                    
                } catch (error) {
                    alert('Erreur lors de l\'importation: ' + error.message);
                }
            };
            
            reader.readAsText(file);
        });
        
        document.body.appendChild(fileInput);
        fileInput.click();
        document.body.removeChild(fileInput);
    }
    
    // Gérer le téléversement d'image
    function handleImageUpload() {
        if (imageUpload.files.length > 0) {
            const file = imageUpload.files[0];
            
            // Vérifier la taille du fichier (max 2MB)
            if (file.size > 2 * 1024 * 1024) {
                alert('L\'image est trop grande. Taille maximale: 2MB');
                imageUpload.value = '';
                return;
            }
            
            // Afficher un aperçu du nom du fichier
            productImageField.value = `Fichier: ${file.name}`;
            productImageField.disabled = true;
        }
    }
    
    // Fonctions utilitaires
    function getCategoryName(categoryKey) {
        const categories = {
            'mariage': 'Mariage',
            'decor': 'Décoration',
            'accessoires': 'Accessoires'
        };
        
        return categories[categoryKey] || categoryKey;
    }
    
    function formatPrice(price) {
        return new Intl.NumberFormat('fr-HT').format(price);
    }
    
    // Raccourci clavier pour l'admin: Ctrl+Alt+A pour afficher/masquer l'admin
    document.addEventListener('keydown', function(e) {
        if (e.ctrlKey && e.altKey && e.key === 'a') {
            e.preventDefault();
            
            const isLoggedIn = localStorage.getItem('sassouDecorAdminLoggedIn') === 'true';
            const adminSection = document.getElementById('admin');
            
            if (adminSection) {
                adminSection.scrollIntoView({ behavior: 'smooth' });
                
                if (!isLoggedIn) {
                    setTimeout(() => {
                        adminPasswordInput.focus();
                    }, 500);
                }
            }
        }
    });
});