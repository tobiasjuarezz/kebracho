import Header from '../components/Header';
import Hero from '../components/Hero';
import Confianza from '../components/Confianza';
import Categorias from '../components/Categorias';
import ProductosDestacados from '../components/ProductosDestacados';
import ComoFunciona from '../components/ComoFunciona';
import Testimonios from '../components/Testimonios';
import Faq from '../components/Faq';
import Footer from '../components/Footer';

function Home() {
  return (
    <div>
      <Header />
      <Hero />
      <Confianza />
      <Categorias />
      <ProductosDestacados />
      <ComoFunciona />
      <Testimonios />
      <Faq />
      <Footer />
    </div>
  );
}

export default Home;