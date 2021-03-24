import { createContext, ReactNode, useContext, useState } from 'react';
import { toast } from 'react-toastify';
import { CartError } from '../constants/cartError';
import { api } from '../services/api';
import { Product, ProductInCart, Stock } from '../types';

interface CartProviderProps {
  children: ReactNode;
}

interface UpdateProductAmount {
  productId: number;
  amount: number;
}

interface CartContextData {
  cart: ProductInCart[];
  addProduct: (productId: number) => Promise<void>;
  removeProduct: (productId: number) => void;
  updateProductAmount: ({ productId, amount }: UpdateProductAmount) => void;
}

const CartContext = createContext<CartContextData>({} as CartContextData);

export function CartProvider({ children }: CartProviderProps): JSX.Element {
  const [cart, setCart] = useState<ProductInCart[]>(() => {
    const storagedCart = localStorage.getItem('@RocketShoes:cart')

    if (storagedCart) {
      return JSON.parse(storagedCart);
    }

    return [];
  });

  const addProduct = async (productId: number) => {
    try {
      const cartProductIndex = cart.findIndex((product) => product.id === productId)

      const product: Product = await api.get(`/products/${productId}`)
        .then(response => response.data)
      const stockProduct: Stock = await api.get(`/stock/${product.id}`)
        .then(response => response.data);

      if (cartProductIndex === -1) {
        const productWithAmount = {
          ...product,
          amount: 1
        };

        if (productWithAmount.amount <= stockProduct.amount) {
          const updatedCart = [...cart, productWithAmount]
          setCart(updatedCart);

          localStorage.setItem(
            "@RocketShoes:cart",
            JSON.stringify(updatedCart)
          )
        } else {
          toast.error(CartError.ForaDeEstoque)
          return
        }
      } else {
        if (cart[cartProductIndex].amount < stockProduct.amount) {
          const updatedCart = cart.map(item => {
            if (item.id === product.id) {
              return {
                ...product,
                amount: item.amount + 1
              }
            }
            return item;
          })

          setCart(updatedCart)

          localStorage.setItem(
            "@RocketShoes:cart",
            JSON.stringify(updatedCart)
          )
        } else {
          toast.error(CartError.ForaDeEstoque)
        }
      }
    } catch {
      toast.error(CartError.AdicionarProduto)
    }
  };

  const removeProduct = (productId: number) => {
    try {
      const productIndex = cart.findIndex((product) => product.id === productId)

      if (productIndex !== -1) {
        const updatedCart = cart.filter(
          product => product.id !== cart[productIndex].id
        )

        setCart(updatedCart)

        localStorage.setItem(
          "@RocketShoes:cart",
          JSON.stringify(updatedCart)
        )
        return
      }
      throw new Error
    } catch {
      toast.error(CartError.RemocaoProduto);
    }
  };

  const updateProductAmount = async ({
    productId,
    amount,
  }: UpdateProductAmount) => {
    try {
      if (amount <= 0) {
        toast.error(CartError.AlteracaoProduto);
        return;
      }

      const stockProduct = await api.get(`/stock/${productId}`)
        .then(response => response.data)

      const cartProductIndex = cart.findIndex(item => item.id === productId)

      if (cartProductIndex === -1) {
        toast.error(CartError.AlteracaoProduto)
        return;
      } else {
        if (stockProduct.amount < amount) {
          toast.error(CartError.ForaDeEstoque)
          return;
        }

        cart[cartProductIndex].amount = amount;
        const updatedCart = [...cart];

        setCart(updatedCart);

        localStorage.setItem(
          "@RocketShoes:cart",
          JSON.stringify(updatedCart)
        );
        return;
        console.log(updatedCart)
        console.log('estou aqui')
      }

      console.log(cartProductIndex)

      throw new Error
    } catch {
      toast.error(CartError.AlteracaoProduto)
    }
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addProduct,
        removeProduct,
        updateProductAmount
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextData {
  const context = useContext(CartContext);

  return context;
}
