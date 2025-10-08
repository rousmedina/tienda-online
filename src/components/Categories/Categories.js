import React from 'react';
import './Categories.css';

function Categories() {
  const categories = [
    {
      id: 'ponchos',
      name: 'Ponchos',
      icon: 'fas fa-tshirt',
      description: '24 productos • Desde S/. 89'
    },
    {
      id: 'polleras',
      name: 'Polleras',
      icon: 'fas fa-female',
      description: '18 productos • Desde S/. 75'
    },
    {
      id: 'chalecos',
      name: 'Chalecos',
      icon: 'fas fa-vest',
      description: '15 productos • Desde S/. 95'
    },
    {
      id: 'chales',
      name: 'Chales',
      icon: 'fas fa-scarf',
      description: '12 productos • Desde S/. 45'
    }
  ];

  const handleCategoryClick = (category) => {
    alert(`Navegando a categoría: ${category}`);
  };

  return (
    <section className="categories" id="categorias">
      <div className="container">
        <h2 className="section-title">Nuestras Categorías</h2>
        <div className="category-grid">
          {categories.map((category) => (
            <div 
              key={category.id}
              className="category-card" 
              onClick={() => handleCategoryClick(category.id)}
            >
              <div className="category-image">
                <i className={category.icon}></i>
              </div>
              <div className="category-info">
                <h3>{category.name}</h3>
                <p>{category.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Categories;