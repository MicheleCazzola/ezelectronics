import { User } from "../components/user";
import { Cart, ProductInCart } from "../components/cart";
import db from "../db/db";
import { Category } from "../components/product";
import { CartNotFoundError } from "../errors/cartError";
import { ProductNotFoundError } from "../errors/productError";
/**
 * A class that implements the interaction with the database for all cart-related operations.
 * You are free to implement any method you need here, as long as the requirements are satisfied.
 */
class CartDAO {
  async getCurrentCart(user: User): Promise<Cart> {
    const sql1 =
      "SELECT CartId, Total FROM CART WHERE Username = ? AND Paid = 0";

    let id: number = null;
    let total: number = null;
    let products: ProductInCart[] = [];

    return new Promise((resolve, reject) => {
      db.get(sql1, [user.username], (err, row) => {
        if (err) {
          reject(err);
        } else if (!row) {
          reject(new CartNotFoundError());
        } else {
          id = (row as { CartId: any; Total: number }).CartId;
          total = (row as { CartId: any; Total: number }).Total;

          const sql2 =
            "SELECT PD.Model as model, PC.Quantity as quantity, PD.Category as category, PD.SellingPrice as price FROM PRODUCT_IN_CART PC,PRODUCT_DESCRIPTOR PD WHERE PC.Model = PD.Model AND PC.CartId = ?";
          db.all(sql2, [id], (err, rows) => {
            if (err) {
              reject(err);
            }
            products = rows.map(
              (row: any) =>
                new ProductInCart(
                  row.model,
                  row.quantity,
                  row.category as Category,
                  row.price
                )
            );
            resolve(new Cart(user.username, false, null, total, products));
          });
        }
      });
    });
  }

  async getProduct(model: string): Promise<ProductInCart> {
    return new Promise((resolve, reject) => {
      const sql =
        "SELECT Category as category, SellingPrice as price FROM PRODUCT_DESCRIPTOR WHERE Model = ?";

      let category: Category = null;
      let price: number = null;

      db.get(sql, [model], (err, row) => {
        if (err) {
          reject(err);
        }
        if (!row) {
          reject(new ProductNotFoundError());
        }
        category = (row as { category: string; price: number })
          .category as Category;
        price = (row as { category: string; price: number }).price;
      });

      resolve(new ProductInCart(model, 1, category, price));
    });
  }

  async updateCart(cart: Cart): Promise<Boolean> {
    return new Promise((resolve, reject) => {
      const sql1 = "SELECT CartId FROM CART WHERE Username = ? AND Paid = 0";
      let cartid: number = undefined;
      db.get(sql1, [cart.customer], (err: Error | null, row: any) => {
        if (err) {
          reject(err);
        }
        if (!row) {
          const sql2 =
            "INSERT INTO CART (Total, Paid, PaymentDate, Username) VALUES (?, ?, ?, ?)";
          db.run(
            sql2,
            [cart.total, cart.paid, cart.paymentDate, cart.customer],
            function (err: Error | null, row: any) {
              if (err) {
                reject(err);
              }
              if (!row) {
                reject(new CartNotFoundError());
              }

              cartid = this.lastID;
            }
          );
        } else {
          cartid = row.CartId;
          const sql3 =
            "UPDATE CART SET (Total, Paid, PaymentDate) = (?, ?, ?) WHERE Username = ? AND Paid = 0";
          db.run(
            sql3,
            [cart.total, cart.paid, cart.paymentDate, cart.customer],
            (err) => {
              if (err) {
                reject(err);
              }
            }
          );
        }

        const sql4 = "DELETE FROM PRODUCT_IN_CART WHERE CART_CartId = ?";
        const sql5 =
          "INSERT INTO PRODUCT_IN_CART (CartId, Model, Quantity) VALUES (?, ?, ?)";

        db.run(sql4, [cartid], (err) => {
          if (err) {
            reject(err);
          }
          cart.products.forEach((product) => {
            db.run(sql5, [cartid, product.model, product.quantity], (err) => {
              if (err) {
                reject(err);
              }
            });
          });
        });
      });

      resolve(true);
    });
  }
}

export default CartDAO;
