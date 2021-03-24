import { useState, useEffect } from 'react';
import { MdAddShoppingCart } from 'react-icons/md';

import { Product, ProductFormatted } from '../../types'
import { ProductList } from './styles';
import { api } from '../../services/api';
import { formatPrice } from '../../util/format';
import { useCart } from '../../hooks/useCart';


interface CartItemsAmount {
  [key: number]: number;
}

const Home = (): JSX.Element => {
  const [products, setProducts] = useState<ProductFormatted[]>([]);
  const [cartItemsAmount, setCartItemsAmout] = useState<CartItemsAmount>({})
  const { addProduct, cart } = useCart();

  useEffect(() => {
    setCartItemsAmout(cart.reduce((sumAmount, product) => {
      const sumProduct = (sumAmount[product.id] || 0) + product.amount;
      return { ...sumAmount, [product.id]: sumProduct };
    }, {} as CartItemsAmount))
    // eslint-disable-next-line
  }, [cart])

  useEffect(() => {
    async function loadProducts() {
      api.get('/products')
        .then(response => {
          const data: Product[] = response.data
          const formatedData = data.map(product => {
            return {
              ...product,
              priceFormatted: formatPrice(product.price)
            }
          })

          setProducts(formatedData)
        })
    }

    loadProducts();
  }, []);

  function handleAddProduct(productId: number) {
    addProduct(productId)
  }

  return (
    <ProductList>
      {products.map(product => (
        <li key={product.id}>
          <img src={product.image} alt={product.title} />
          <strong>{product.title}</strong>
          <span>
            {product.priceFormatted}
          </span>
          <button
            type="button"
            data-testid="add-product-button"
            onClick={() => handleAddProduct(product.id)}
          >
            <div data-testid="cart-product-quantity">
              <MdAddShoppingCart size={16} color="#FFF" />
              {cartItemsAmount[product.id] || 0}
            </div>

            <span>ADICIONAR AO CARRINHO</span>
          </button>
        </li>
      ))}
    </ProductList>
  );
};

export default Home;
