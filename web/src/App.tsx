import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Catalogo from './pages/Catalogo';
import Producto from './pages/Producto';
import Login from './pages/Login';
import Registro from './pages/Registro';
import Carrito from './pages/Carrito';
import Checkout from './pages/Checkout';
import CategoriasPagina from './pages/CategoriasPagina';
import Info from './pages/Info';
import VerificacionEdad from './components/VerificacionEdad';

function App() {
  return (
    <VerificacionEdad>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/categorias" element={<CategoriasPagina />} />
          <Route path="/categorias/:id" element={<Catalogo />} />
          <Route path="/producto/:id" element={<Producto />} />
          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<Registro />} />
          <Route path="/carrito" element={<Carrito />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/nosotros" element={<Info seccion="nosotros" />} />
          <Route path="/contacto" element={<Info seccion="contacto" />} />
          <Route path="/terminos" element={<Info seccion="terminos" />} />
          <Route path="/privacidad" element={<Info seccion="privacidad" />} />
          <Route path="*" element={<Home />} />
        </Routes>
      </BrowserRouter>
    </VerificacionEdad>
  );
}

export default App;
