import db from "../db/db"
import { Product } from "../components/product"
import { ProductAlreadyExistsError } from "../errors/productError"

/**
 * A class that implements the interaction with the database for all product-related operations.
 * You are free to implement any method you need here, as long as the requirements are satisfied.
 */
class ProductDAO {
  /**
   * Creates a new product and saves their information in the database.
   * @param model The unique model of the product.
   * @param category The category of the product.
   * @param quantity The number of units of the new product.
   * @param details The optional details of the product.
   * @param sellingPrice The price at which one unit of the product is sold.
   * @param arrivalDate The optional date in which the product arrived.
   * @returns A Promise that resolves to nothing.
   */
  createProduct(
    model: string,
    category: string,
    quantity: number,
    details: string | null,
    sellingPrice: number,
    arrivalDate: string | null
  ): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      try {
        const sql =
          "INSERT INTO product_descriptor(Model, SellingPrice, ArrivalDate, AvailableQuantity, Category, Details) VALUES (?,?,?,?,?,?)";
        db.run(
          sql,
          [model, sellingPrice, arrivalDate, quantity, category, details],
          (err: Error | null) => {
            if (err) {
              if (
                err.message.includes(
                  "UNIQUE constraint failed: product_descriptor.Model"
                )
              )
                reject(new ProductAlreadyExistsError());
              reject(err);
            }
            resolve();
          }
        );
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Says if a product exists.
   * @param model The unique model of the product.
   * @returns A Promise that resolves to true if the product identified by the model exists.
   */
  existsProduct(model: string): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      try {
        const sql = "SELECT * FROM product_descriptor WHERE Model = ?";
        db.get(sql, [model], (err: Error | null, row: any) => {
          if (err) reject(err);
          if (row) resolve(true);
          else resolve(false);
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Returns the product identified by the model.
   * @param model The unique model of the product.
   * @returns A promise that resolves to the found product.
   */
  getProductByModel(model: string): Promise<Product> {
    return new Promise<Product>((resolve, reject) => {
      try {
        const sql = "SELECT * FROM product_descriptor WHERE Model = ?";
        db.get(sql, [model], (err: Error | null, row: any) => {
          if (err) reject(err);
          resolve(row);
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Increases the available quantity of a product.
   * @param model The model of the product to increase.
   * @param newQuantity The number of product units to add. This number must be added to the existing quantity, it is not a new total.
   * @param changeDate The optional date in which the change occurred.
   * @returns A Promise that resolves to the new available quantity of the product.
   */
  increaseQuantity(
    model: string,
    newQuantity: number,
    changeDate: string | null
  ): Promise<number> {
    return new Promise<number>((resolve, reject) => {
      try {
        const sql =
          "SELECT AvailableQuantity FROM product_descriptor WHERE Model = ?";
        db.get(sql, [model], (err: Error | null, row: any) => {
          if (err) reject(err);
          let qt = row.AvailableQuantity;
          qt = qt + newQuantity;
          let sqlUpdate;
          let param;
          if (changeDate != null) {
            sqlUpdate =
              "UPDATE product_descriptor SET AvailableQuantity = ?, ArrivalDate = ? WHERE Model = ?";
            param = [qt, changeDate, model];
          } else {
            sqlUpdate =
              "UPDATE product_descriptor SET AvailableQuantity = ? WHERE Model = ?";
            param = [qt, model];
          }
          db.run(sqlUpdate, param, (err: Error | null) => {
            if (err) reject(err);
            resolve(qt);
          });
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Decreases the available quantity of a product.
   * @param model The model of the product to sell
   * @param quantity The number of product units that were sold.
   * @param sellingDate The optional date in which the sale occurred.
   * @returns A Promise that resolves to the new available quantity of the product.
   */
  decreaseQuantity(
    model: string,
    quantity: number,
    sellingDate: string | null
  ): Promise<number> {
    return new Promise<number>((resolve, reject) => {
      try {
        const sql =
          "SELECT AvailableQuantity FROM product_descriptor WHERE Model = ?";
        db.get(sql, [model], (err: Error | null, row: any) => {
          if (err) reject(err);
          let qt = row.AvailableQuantity;
          qt = qt - quantity;
          let sqlUpdate;
          let param;
          if (sellingDate != null) {
            sqlUpdate =
              "UPDATE product_descriptor SET AvailableQuantity = ?, ArrivalDate = ? WHERE Model = ?";
            param = [qt, sellingDate, model];
          } else {
            sqlUpdate =
              "UPDATE product_descriptor SET AvailableQuantity = ? WHERE Model = ?";
            param = [qt, model];
          }
          db.run(sqlUpdate, param, (err: Error | null) => {
            if (err) reject(err);
            resolve(qt);
          });
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Returns all products in the database, with the option to filter them by category or model.
   * @param grouping An optional parameter. If present, it can be either "category" or "model".
   * @param category An optional parameter. It can only be present if grouping is equal to "category" (in which case it must be present) and, when present, it must be one of "Smartphone", "Laptop", "Appliance".
   * @param model An optional parameter. It can only be present if grouping is equal to "model" (in which case it must be present and not empty).
   * @returns A Promise that resolves to an array of Product objects.
   */
  getAllProducts(
    grouping: string | null,
    category: string | null,
    model: string | null
  ): Promise<Product[]> {
    return new Promise<Product[]>((resolve, reject) => {
      try {
        let sql;
        let param;
        if (grouping == "category") {
          sql = "SELECT * FROM product_descriptor WHERE Category = ?";
          param = [category];
        } else if (grouping == "model") {
          sql = "SELECT * FROM product_descriptor WHERE Model = ?";
          param = [model];
        } else {
          sql = "SELECT * FROM product_descriptor";
          param = null;
        }
        db.all(
          sql,
          param == null ? [] : param,
          (err: Error | null, rows: any[]) => {
            if (err) reject(err);
            const prod: Product[] = rows.map(
              (p) =>
                new Product(
                  p.SellingPrice,
                  p.Model,
                  p.Category,
                  p.ArrivalDate,
                  p.Details,
                  p.AvailableQuantity
                )
            );
            resolve(prod);
          }
        );
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Returns all available products (with a quantity above 0) in the database, with the option to filter them by category or model.
   * @param grouping An optional parameter. If present, it can be either "category" or "model".
   * @param category An optional parameter. It can only be present if grouping is equal to "category" (in which case it must be present) and, when present, it must be one of "Smartphone", "Laptop", "Appliance".
   * @param model An optional parameter. It can only be present if grouping is equal to "model" (in which case it must be present and not empty).
   * @returns A Promise that resolves to an array of Product objects.
   */
  getAllAvailableProducts(
    grouping: string | null,
    category: string | null,
    model: string | null
  ): Promise<Product[]> {
    return new Promise<Product[]>((resolve, reject) => {
      try {
        let sql;
        let param;
        if (grouping == "category") {
          sql =
            "SELECT * FROM product_descriptor WHERE Category = ? AND AvailableQuantity > 0";
          param = [category];
        } else if (grouping == "model") {
          sql =
            "SELECT * FROM product_descriptor WHERE Model = ? AND AvailableQuantity > 0";
          param = [model];
        } else {
          sql = "SELECT * FROM product_descriptor WHERE AvailableQuantity > 0";
          param = null;
        }
        db.all(
          sql,
          param == null ? [] : param,
          (err: Error | null, rows: any[]) => {
            if (err) reject(err);
            const prod: Product[] = rows.map(
              (p) =>
                new Product(
                  p.SellingPrice,
                  p.Model,
                  p.Category,
                  p.ArrivalDate,
                  p.Details,
                  p.AvailableQuantity
                )
            );
            resolve(prod);
          }
        );
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Deletes all products.
   * @returns A Promise that resolves to `true` if all products have been successfully deleted.
   */
  deleteProducts(): Promise<Boolean> {
    return new Promise<boolean>((resolve, reject) => {
      try {
        const sql = "DELETE FROM product_descriptor";
        db.run(sql, [], (err: Error | null) => {
          try {
            if (err) reject(err);
            resolve(true);
          } catch (error) {
            reject(error);
          }
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Deletes one product, identified by its model
   * @param model The model of the product to delete
   * @returns A Promise that resolves to `true` if the product has been successfully deleted.
   */
  deleteProductByModel(model: string): Promise<Boolean> {
    return new Promise<boolean>((resolve, reject) => {
      try {
        const sql = "DELETE FROM product_descriptor WHERE Model = ?";
        db.run(sql, [model], (err: Error | null) => {
          try {
            if (err) reject(err);
            resolve(true);
          } catch (error) {
            reject(error);
          }
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  async getProductQuantity(model: string): Promise<number> {
    return new Promise<number>((resolve, reject) => {
      try {
        const sql =
          "SELECT AvailableQuantity FROM product_descriptor WHERE Model = ?";
        db.get(sql, [model], (err: Error | null, row: any) => {
          if (err) reject(err);
          resolve(row.AvailableQuantity);
        });
      } catch (error) {
        reject(error);
      }
    });
  }
}

export default ProductDAO