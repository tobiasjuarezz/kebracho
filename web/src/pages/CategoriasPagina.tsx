import Header from '../components/Header';
import Categorias from '../components/Categorias';
import ProductosDestacados from '../components/ProductosDestacados';
import Footer from '../components/Footer';

// Página "/categorias": antes el menú linkeaba acá pero la ruta no existía
function CategoriasPagina() {
  return (
    <div>
      <Header />
      <Categorias />
      <ProductosDestacados />
      <Footer />
    </div>
  );
}

export default CategoriasPagina;
