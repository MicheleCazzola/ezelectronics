import { User } from "../components/user";
import { Cart, ProductInCart } from "../components/cart";
import db from "../db/db";
import { Category } from "../components/product";
/**
 * A class that implements the interaction with the database for all cart-related operations.
 * You are free to implement any method you need here, as long as the requirements are satisfied.
 */
class CartDAO {
  async getCurrentCart(user: User): Promise<Cart> {
    const sql1 =
      "SELECT CART.CartID as id, CART.Total as total FROM CART WHERE USER_Username = ? AND CART.Paid = false";

    let id: number = null;
    let total: number = null;
    let products: ProductInCart[] = [];

    db.get(sql1, [user.username], (err, row) => {
      if (err) {
        return new Promise((resolve, reject) => {
          reject(err);
        });
      }

      if (!row) {
        return new Promise((resolve, reject) => {
          reject("User has no active cart");
        });
      }

      id = (row as { id: any; total: number }).id;
      total = (row as { id: any; total: number }).total;
    });

    const sql2 =
      "SELECT PRODUCT_DESCRIPTOR_Model as model, QuantityInCart as quantity, Category as category, SellingPrice as price FROM PRODUCT_IN_CART AS PC AND PRODUCT_DESCRIPTOR AS PD WHERE PC.PRODUCT_DESCRIPTOR_Model = PD.Model AND CART_CartID = ?";
    db.all(sql2, [id], (err, rows) => {
      if (err) {
        return new Promise((resolve, reject) => {
          reject(err);
        });
      }

      products = (
        rows as {
          model: string;
          quantity: number;
          category: Category;
          price: number;
        }[]
      ).map(
        (row) =>
          new ProductInCart(
            row.model,
            row.quantity,
            row.category as Category,
            row.price
          )
      );
    });

    return new Promise((resolve, reject) => {
      resolve(new Cart(user.username, false, null, total, products));
    });
  }

  async getProduct(model: string): Promise<ProductInCart> {
    const sql =
      "SELECT Category as category, SellingPrice as price FROM PRODUCT_DESCRIPTOR WHERE Model = ?";

    let category: Category = null;
    let price: number = null;

    db.get(sql, [model], (err, row) => {
      if (err) {
        return new Promise((resolve, reject) => {
          reject(err);
        });
      }
      if (!row) {
        return new Promise((resolve, reject) => {
          reject("Product not found");
        });
      }
      category = (row as { category: string; price: number })
        .category as Category;
      price = (row as { category: string; price: number }).price;
    });

    return new Promise((resolve, reject) => {
      resolve(new ProductInCart(model, 1, category, price));
    });
  }
}

export default CartDAO;
