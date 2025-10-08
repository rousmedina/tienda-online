import React from 'react';
import Hero from '../components/Hero/Hero';
import Categories from '../components/Categories/Categories';
import Products from '../components/Products/Products';
import About from '../components/About/About';

function Home() {
  return (
    <>
      <Hero />
      <Categories />
      <Products />
      <About />
    </>
  );
}

export default Home;
