export interface Product {
  id: number;
  title: string;
  price: number;
  image: string;
}

export interface ProductInCart extends Product {
  amount: number;
}

export interface ProductFormatted extends Product {
  priceFormatted: string;
}

export interface Stock {
  id: number;
  amount: number;
}
