import { User } from "../components/user";
import { Cart, ProductInCart } from "../components/cart";
import db from "../db/db";
import { Category } from "../components/product";
import { CartNotFoundError, ProductNotInCartError } from "../errors/cartError";
import {
  EmptyProductStockError,
  ProductNotFoundError,
} from "../errors/productError";
/**
 * A class that implements the interaction with the database for all cart-related operations.
 * You are free to implement any method you need here, as long as the requirements are satisfied.
 */
class CartDAO {
  async getCurrentCart(user: User): Promise<Cart> {
    const sql1 =
      "SELECT CartId, Total FROM CART WHERE Username = ? AND Paid = 0";

    let products: ProductInCart[] = [];

    return new Promise((resolve, reject) => {
      db.get(sql1, [user.username], (err, row) => {
        if (err) {
          reject(err);
        } else if (!row) {
          reject(new CartNotFoundError());
        } else {
          let id = (row as { CartId: any; Total: number }).CartId;
          let total = (row as { CartId: any; Total: number }).Total;

          const sql2 =
            "SELECT PD.Model as model, PC.Quantity as quantity, PD.Category as category, PD.SellingPrice as price FROM PRODUCT_IN_CART PC,PRODUCT_DESCRIPTOR PD WHERE PC.Model = PD.Model AND PC.CartId = ?";
          db.all(sql2, [id], (err, rows) => {
            if (err) {
              reject(err);
            } else {
              products = rows.map(
                (row: any) =>
                  new ProductInCart(
                    row.model,
                    row.quantity,
                    row.category as Category,
                    row.price
                  )
              );
              resolve(new Cart(user.username, false, "", total, products));
            }
          });
        }
      });
    });
  }

  async getProduct(model: string): Promise<ProductInCart> {
    return new Promise((resolve, reject) => {
      const sql =
        "SELECT Category, SellingPrice, AvailableQuantity FROM PRODUCT_DESCRIPTOR WHERE Model = ?";

      db.get(sql, [model], (err, row: any) => {
        if (err) {
          reject(err);
        } else if (!row) {
          reject(new ProductNotFoundError());
        } else {
          let quantity = row.AvailableQuantity;
          if (quantity <= 0) {
            reject(new EmptyProductStockError());
          } else {
            resolve(
              new ProductInCart(
                model,
                1,
                row.Category as Category,
                row.SellingPrice
              )
            );
          }
        }
      });
    });
  }

  async createCart(user: User): Promise<number> {
    const sql1 =
      "INSERT INTO CART (Total, Paid, PaymentDate, Username) VALUES (?, ?, ?, ?)";
    return new Promise((resolve, reject) => {
      db.run(sql1, [0, false, "", user.username], function (err) {
        if (err) reject(err);
        let rowid = this.lastID;
        const sql2 = "SELECT CartId FROM CART WHERE rowid = ?";
        db.get(sql2, [rowid], (err, row: any) => {
          if (err) reject(err);
          else if (!row) reject(new CartNotFoundError());
          else resolve(row.CartId);
        });
      });
    });
  }

  async getCurrentCartId(user: User): Promise<number> {
    return new Promise((resolve, reject) => {
      const sql = "SELECT CartId FROM CART WHERE Username = ? AND Paid = 0";
      db.get(sql, [user.username], (err, row: any) => {
        if (err) reject(err);
        else if (!row) reject(new CartNotFoundError());
        else resolve(row.CartId);
      });
    });
  }

  async addProductToCart(
    cartid: number,
    product: ProductInCart
  ): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const sql1 =
        "SELECT Quantity FROM PRODUCT_IN_CART WHERE CartId = ? AND Model = ?";
      db.get(sql1, [cartid, product.model], (err, row: any) => {
        //console.log(err);
        if (err) reject(err);

        if (!row) {
          //console.log(`Cart id: ${cartid} ${product.model}`);
          const sql2 =
            "INSERT INTO PRODUCT_IN_CART (CartId, Model, Quantity) VALUES (?, ?, ?)";
          db.run(sql2, [cartid, product.model, 1], (err) => {
            console.log(err);
            if (err) reject(err);
          });
        } else {
          const sql3 =
            "UPDATE PRODUCT_IN_CART SET Quantity = ? WHERE CartId = ? AND Model = ?";
          db.run(sql3, [row.Quantity + 1, cartid, product.model], (err) => {
            //console.log(err);
            if (err) reject(err);
          });
        }
        //console.log("PIPPO", cartid);
        const sql4 = "UPDATE CART SET Total = Total + ? WHERE CartId = ?";
        db.run(sql4, [product.price, cartid], (err) => {
          //console.log(err.message);
          if (err) reject(err);
          else {/*console.log(err)*/ resolve(true)};
        });
      });
    });
  }

  async checkoutCart(username: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const sql1 =
        "UPDATE CART SET Paid = 1, PaymentDate = ? WHERE Username = ?";
      db.run(sql1, [new Date().toISOString(), username], (err) => {
        if (err) reject(err);
        else resolve(true);
      });
    });
  }

  async updateCart(cart: Cart): Promise<boolean> {
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
            function (err: Error | null) {
              if (err) {
                reject(err);
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
              if (err) reject(err);
            }
          );
        }

        const sql4 = "DELETE FROM PRODUCT_IN_CART WHERE CartId = ?";
        const sql5 =
          "INSERT INTO PRODUCT_IN_CART (CartId, Model, Quantity) VALUES (?, ?, ?)";

        db.run(sql4, [cartid], (err) => {
          if (err) reject(err);

          cart.products.forEach((product) => {
            db.run(sql5, [cartid, product.model, product.quantity], (err) => {
              if (err) reject(err);
            });
          });
        });
      });

      resolve(true);
    });
  }

  async getPaidCarts(user: User): Promise<Cart[]> {
    const sql1 = "SELECT * FROM CART WHERE Username = ? AND Paid = 1";
    const sql2 =
      "SELECT PD.Model, PD.Category, PC.Quantity, PD.SellingPrice FROM PRODUCT_IN_CART PC, PRODUCT_DESCRIPTOR PD WHERE PC.Model = PD.Model AND CartId = ?";

    return new Promise((resolve, reject) => {
      db.all(sql1, [user.username], (err, rows) => {
        if (err) reject(err);

        if (rows) {
          resolve(
            rows.map((cart_row: any) => {
              let cart: Cart = new Cart(
                user.username,
                cart_row.Paid,
                cart_row.PaymentDate,
                cart_row.Total,
                []
              );
              db.all(sql2, [cart_row.CartId], (err, prod_row) => {
                if (err) {
                  reject(err);
                }
                if (prod_row) {
                  cart.products = prod_row.map((row: any) => {
                    return new ProductInCart(
                      row.Model,
                      row.Quantity,
                      row.Category,
                      row.SellingPrice
                    );
                  });
                }
              });
              return cart;
            })
          );
        } else {
          resolve([]);
        }
      });
    });
  }

  async removeProductFromCart(user: User, product: string): Promise<boolean> {
    let cart = await this.getCurrentCart(user);
    let found = false;
    for (let cart_product of cart.products) {
      if (cart_product.model === product) {
        cart_product.quantity--;
        if (cart_product.quantity === 0) {
          cart.products = cart.products.filter(
            (product) => product.model !== cart_product.model
          );
        }
        found = true;
        break;
      }
    }

    if (!found) {
      throw new ProductNotInCartError();
    }

    return this.updateCart(cart);
  }

  async clearCart(user: User): Promise<boolean> {
    const clearCart = new Cart(user.username, false, "", 0, []);
    return this.updateCart(clearCart);
  }

  async deleteAllCarts(): Promise<boolean> {
    const sql1 = "DELETE FROM PRODUCT_IN_CART";
    const sql2 = "DELETE FROM CART";

    return new Promise((resolve, reject) => {
      db.run(sql1, (err) => {
        if (err) {
          reject(err);
        }
        db.run(sql2, (err) => {
          if (err) {
            reject(err);
          }
        });
      });
      resolve(true);
    });
  }

  async getAllCarts(): Promise<Cart[]> {
    const sql1 = "SELECT * FROM CART";
    const sql2 =
      "SELECT PD.Model, PD.Category, PC.Quantity, PD.SellingPrice FROM PRODUCT_IN_CART PC, PRODUCT_DESCRIPTOR PD WHERE PC.Model = PD.Model AND CartId = ?";

    let carts: Cart[] = [];
    return new Promise((resolve, reject) => {
      db.all(sql1, (err, rows) => {
        if (err) {
          reject(err);
        }
        if (rows) {
          rows.forEach((row: any) => {
            let cart: Cart = new Cart(
              row.Username,
              row.Paid,
              row.PaymentDate,
              row.Total,
              []
            );
            db.all(sql2, [row.CartId], (err, rows2) => {
              if (err) {
                reject(err);
              }
              if (rows2) {
                rows2.forEach((row: any) => {
                  cart.products.push(
                    new ProductInCart(
                      row.Model,
                      row.Quantity,
                      row.Category,
                      row.SellingPrice
                    )
                  );
                });
              }
              carts.push(cart);
            });
          });
        }
        resolve(carts);
      });
    });
  }
}

export default CartDAO;
