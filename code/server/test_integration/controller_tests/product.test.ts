import ProductDAO from "../../src/dao/productDAO";
import ProductController from "../../src/controllers/productController";
import {
  test,
  expect,
  jest,
  describe,
  afterEach,
  beforeAll,
} from "@jest/globals";
import { cleanup } from "../../src/db/cleanup";
import { Category, Product } from "../../src/components/product";
import { DateError, Time } from "../../src/utilities";
import {
  LowProductStockError,
  ProductAlreadyExistsError,
  ProductNotFoundError,
  ProductSoldError,
} from "../../src/errors/productError";
import { resourceLimits } from "worker_threads";

describe("ProductController test:", () => {
  describe("registerProduct test", () => {
    let productController: ProductController;

    beforeAll(async () => {
      productController = new ProductController();

      await cleanup();
    });

    afterEach(async () => {
      await cleanup();
    });

    test("Register a new product", async () => {
      const testProduct = new Product(
        12,
        "TestModel",
        Category.SMARTPHONE,
        "2024-04-02",
        "TestDetails",
        12
      );

      const result = await productController.registerProducts(
        testProduct.model,
        testProduct.category,
        testProduct.quantity,
        testProduct.details,
        testProduct.sellingPrice,
        testProduct.arrivalDate
      );

      expect(result).toBeUndefined();
    });

    test("Register a new product - with a future date", async () => {
      const testProduct = new Product(
        12,
        "TestModel",
        Category.SMARTPHONE,
        "2024-04-02",
        "TestDetails",
        12
      );

      const futureDate = "2030-02-02";
      const err = new DateError();

      await expect(
        productController.registerProducts(
          testProduct.model,
          testProduct.category,
          testProduct.quantity,
          testProduct.details,
          testProduct.sellingPrice,
          futureDate
        )
      ).rejects.toThrow(err);
    });

    test("Register the same product more time", async () => {
      const testProduct = new Product(
        12,
        "TestModel",
        Category.SMARTPHONE,
        "2024-04-02",
        "TestDetails",
        12
      );

      await productController.registerProducts(
        testProduct.model,
        testProduct.category,
        testProduct.quantity,
        testProduct.details,
        testProduct.sellingPrice,
        testProduct.arrivalDate
      );

      await expect(
        productController.registerProducts(
          testProduct.model,
          testProduct.category,
          testProduct.quantity,
          testProduct.details,
          testProduct.sellingPrice,
          testProduct.arrivalDate
        )
      ).rejects.toThrow(new ProductAlreadyExistsError());
    });

    test("Register a new product withouth an arrival date", async () => {
      const testProduct = new Product(
        12,
        "TestModel",
        Category.SMARTPHONE,
        "",
        "TestDetails",
        12
      );

      const result = await productController.registerProducts(
        testProduct.model,
        testProduct.category,
        testProduct.quantity,
        testProduct.details,
        testProduct.sellingPrice,
        testProduct.arrivalDate
      );

      const todayDate = Time.today();

      expect(result).toBeUndefined();

      const verify = await productController.productByModel(testProduct.model);
      expect(verify.arrivalDate).toStrictEqual(todayDate);
    });
  });

  describe("productExist test:", () => {
    let productController: ProductController;

    beforeAll(async () => {
      productController = new ProductController();

      await cleanup();
    });

    afterEach(async () => {
      await cleanup();
    });

    test("It should return true if the product exists", async () => {
      const testProduct = new Product(
        12,
        "TestModel",
        Category.SMARTPHONE,
        "",
        "TestDetails",
        12
      );

      await productController.registerProducts(
        testProduct.model,
        testProduct.category,
        testProduct.quantity,
        testProduct.details,
        testProduct.sellingPrice,
        testProduct.arrivalDate
      );

      const result = await productController.productExist(testProduct.model);

      expect(result).toBe(true);
    });

    test("It should return true if the product exists", async () => {
      const result = await productController.productExist("UnknownModel");

      expect(result).toBe(false);
    });
  });

  describe("productByModel test:", () => {
    let productController: ProductController;

    beforeAll(async () => {
      productController = new ProductController();

      await cleanup();
    });

    afterEach(async () => {
      await cleanup();
    });

    test("It should return a product if the product exists", async () => {
      const testProduct = new Product(
        12,
        "TestModel",
        Category.SMARTPHONE,
        "2023-02-03",
        "TestDetails",
        12
      );

      await productController.registerProducts(
        testProduct.model,
        testProduct.category,
        testProduct.quantity,
        testProduct.details,
        testProduct.sellingPrice,
        testProduct.arrivalDate
      );

      const result = await productController.productByModel(testProduct.model);

      expect(result).toStrictEqual(testProduct);
    });

    test("it should return an error if the product searched does not exists", async () => {
      await expect(
        productController.productByModel("UnkownModel")
      ).rejects.toThrow(new ProductNotFoundError());
    });
  });

  describe("changeProductQuantity test:", () => {
    let productController: ProductController;

    beforeAll(async () => {
      productController = new ProductController();

      await cleanup();
    });

    afterEach(async () => {
      await cleanup();
    });

    test("It should return the quantity changed", async () => {
      const testProduct = new Product(
        12,
        "TestModel",
        Category.SMARTPHONE,
        "2023-02-03",
        "TestDetails",
        12
      );

      await productController.registerProducts(
        testProduct.model,
        testProduct.category,
        testProduct.quantity,
        testProduct.details,
        testProduct.sellingPrice,
        testProduct.arrivalDate
      );

      const newQuantity = 10;
      const expectedQuantity = testProduct.quantity + newQuantity;

      const todayDate = Time.today();

      const result = await productController.changeProductQuantity(
        testProduct.model,
        newQuantity,
        todayDate
      );

      expect(result).toBe(expectedQuantity);
    });

    test("the arrival date must to be before or equal the today date", async () => {
      const testProduct = new Product(
        12,
        "TestModel",
        Category.SMARTPHONE,
        "2023-02-03",
        "TestDetails",
        12
      );

      await productController.registerProducts(
        testProduct.model,
        testProduct.category,
        testProduct.quantity,
        testProduct.details,
        testProduct.sellingPrice,
        testProduct.arrivalDate
      );

      const newQuantity = 10;

      const pastDate = "1940-02-02";

      await expect(
        productController.changeProductQuantity(
          testProduct.model,
          newQuantity,
          pastDate
        )
      ).rejects.toThrow(new DateError());
    });

    test("It should set the cahngeDate to today if not provided", async () => {
      const testProduct = new Product(
        12,
        "TestModel",
        Category.SMARTPHONE,
        "2023-02-03",
        "TestDetails",
        12
      );

      await productController.registerProducts(
        testProduct.model,
        testProduct.category,
        testProduct.quantity,
        testProduct.details,
        testProduct.sellingPrice,
        testProduct.arrivalDate
      );

      const newQuantity = 10;
      const expectedQuantity = testProduct.quantity + newQuantity;

      const todayDate = Time.today();

      const result = await productController.changeProductQuantity(
        testProduct.model,
        newQuantity,
        ""
      );

      expect(result).toBe(expectedQuantity);
    });

    test("It should reject error if the changeDate is in the future", async () => {
      const testProduct = new Product(
        12,
        "TestModel",
        Category.SMARTPHONE,
        "2023-02-03",
        "TestDetails",
        12
      );

      await productController.registerProducts(
        testProduct.model,
        testProduct.category,
        testProduct.quantity,
        testProduct.details,
        testProduct.sellingPrice,
        testProduct.arrivalDate
      );

      const err = new DateError();

      const newQuantity = 10;
      const expectedQuantity = testProduct.quantity + newQuantity;

      const futureDate = "2030-03-03";

      await expect(
        productController.changeProductQuantity(
          testProduct.model,
          newQuantity,
          futureDate
        )
      ).rejects.toThrow(err);
    });

    test("it should return an error if the product does not exists", async () => {
      await expect(
        productController.changeProductQuantity("UnkownModel", 10, Time.today())
      ).rejects.toThrow(new ProductNotFoundError());
    });
  });

  describe("sellProduct test:", () => {
    let productController: ProductController;

    beforeAll(async () => {
      productController = new ProductController();

      await cleanup();
    });

    afterEach(async () => {
      await cleanup();
    });

    test("It should return the quantity changed after the sell", async () => {
      const testProduct = new Product(
        12,
        "TestModel",
        Category.SMARTPHONE,
        "2023-02-03",
        "TestDetails",
        12
      );

      await productController.registerProducts(
        testProduct.model,
        testProduct.category,
        testProduct.quantity,
        testProduct.details,
        testProduct.sellingPrice,
        testProduct.arrivalDate
      );

      const soldQuantity = 10;
      const expectedQuantity = testProduct.quantity - soldQuantity;

      const todayDate = Time.today();

      const result = await productController.sellProduct(
        testProduct.model,
        soldQuantity,
        todayDate
      );

      expect(result).toBe(expectedQuantity);
    });

    test("It should set the selldate to today if not provided", async () => {
      const testProduct = new Product(
        12,
        "TestModel",
        Category.SMARTPHONE,
        "2023-02-03",
        "TestDetails",
        12
      );

      await productController.registerProducts(
        testProduct.model,
        testProduct.category,
        testProduct.quantity,
        testProduct.details,
        testProduct.sellingPrice,
        testProduct.arrivalDate
      );

      const soldQuantity = 10;
      const expectedQuantity = testProduct.quantity - soldQuantity;

      const todayDate = Time.today();

      const result = await productController.sellProduct(
        testProduct.model,
        soldQuantity,
        ""
      );

      expect(result).toBe(expectedQuantity);
    });

    test("It should reject error if the sellDate is in the future", async () => {
      const testProduct = new Product(
        12,
        "TestModel",
        Category.SMARTPHONE,
        "2023-02-03",
        "TestDetails",
        12
      );

      await productController.registerProducts(
        testProduct.model,
        testProduct.category,
        testProduct.quantity,
        testProduct.details,
        testProduct.sellingPrice,
        testProduct.arrivalDate
      );

      const err = new DateError();

      const soldQuantity = 10;
      const expectedQuantity = testProduct.quantity - soldQuantity;

      const futureDate = "2030-03-03";

      await expect(
        productController.sellProduct(
          testProduct.model,
          soldQuantity,
          futureDate
        )
      ).rejects.toThrow(err);
    });

    test("the selling date must to be before or equal the today date", async () => {
      const testProduct = new Product(
        12,
        "TestModel",
        Category.SMARTPHONE,
        "2023-02-03",
        "TestDetails",
        12
      );

      await productController.registerProducts(
        testProduct.model,
        testProduct.category,
        testProduct.quantity,
        testProduct.details,
        testProduct.sellingPrice,
        testProduct.arrivalDate
      );

      const soldQuantity = 10;

      const pastDate = "1940-02-02";

      await expect(
        productController.sellProduct(testProduct.model, soldQuantity, pastDate)
      ).rejects.toThrow(new DateError());
    });

    test("it should reject an error if the quantity is higher than the available quantity", async () => {
      const testProduct = new Product(
        12,
        "TestModel",
        Category.SMARTPHONE,
        "2023-02-03",
        "TestDetails",
        12
      );

      await productController.registerProducts(
        testProduct.model,
        testProduct.category,
        testProduct.quantity,
        testProduct.details,
        testProduct.sellingPrice,
        testProduct.arrivalDate
      );

      const soldQuantity = 20;

      const todayDate = Time.today();

      await expect(
        productController.sellProduct(
          testProduct.model,
          soldQuantity,
          todayDate
        )
      ).rejects.toThrow(new LowProductStockError());
    });

    test("it should reject an error if the quantity is higher than the available quantity - quantity = 0", async () => {
      const testProduct = new Product(
        12,
        "TestModel",
        Category.SMARTPHONE,
        "2023-02-03",
        "TestDetails",
        5
      );

      await productController.registerProducts(
        testProduct.model,
        testProduct.category,
        testProduct.quantity,
        testProduct.details,
        testProduct.sellingPrice,
        testProduct.arrivalDate
      );

      const date = "2024-02-01";

      await productController.sellProduct(testProduct.model, 5, date);

      const soldQuantity = 20;

      const todayDate = Time.today();

      await expect(
        productController.sellProduct(
          testProduct.model,
          soldQuantity,
          todayDate
        )
      ).rejects.toThrow(new ProductSoldError());
    });

    test("it should return an error if the product does not exists", async () => {
      await expect(
        productController.changeProductQuantity("UnkownModel", 10, Time.today())
      ).rejects.toThrow(new ProductNotFoundError());
    });
  });

  describe("getProducts test:", () => {
    let productController: ProductController;

    beforeAll(async () => {
      productController = new ProductController();

      await cleanup();
    });

    afterEach(async () => {
      await cleanup();
    });

    test("Return all products present on db", async () => {
      const testProduct1 = new Product(
        12,
        "TestModel1",
        Category.SMARTPHONE,
        "2024-04-02",
        "TestDetails",
        10
      );
      const testProduct2 = new Product(
        12,
        "TestModel2",
        Category.LAPTOP,
        "2024-04-02",
        "TestDetails",
        10
      );
      const testProduct3 = new Product(
        12,
        "TestModel3",
        Category.APPLIANCE,
        "2024-04-02",
        "TestDetails",
        10
      );

      const testProducts: Product[] = [
        testProduct1,
        testProduct2,
        testProduct3,
      ];

      await productController.registerProducts(
        testProduct1.model,
        testProduct1.category,
        testProduct1.quantity,
        testProduct1.details,
        testProduct1.sellingPrice,
        testProduct1.arrivalDate
      );

      await productController.registerProducts(
        testProduct2.model,
        testProduct2.category,
        testProduct2.quantity,
        testProduct2.details,
        testProduct2.sellingPrice,
        testProduct2.arrivalDate
      );

      await productController.registerProducts(
        testProduct3.model,
        testProduct3.category,
        testProduct3.quantity,
        testProduct3.details,
        testProduct3.sellingPrice,
        testProduct3.arrivalDate
      );

      const result = await productController.getProducts("", "", "");

      expect(result).toStrictEqual(testProducts);
    });

    test("Return all products filtered by model", async () => {
      const testProduct1 = new Product(
        12,
        "TestModel1",
        Category.SMARTPHONE,
        "2024-04-02",
        "TestDetails",
        10
      );
      const testProduct2 = new Product(
        12,
        "TestModel2",
        Category.LAPTOP,
        "2024-04-02",
        "TestDetails",
        10
      );
      const testProduct3 = new Product(
        12,
        "TestModel3",
        Category.APPLIANCE,
        "2024-04-02",
        "TestDetails",
        10
      );

      const filteredProduct: Product[] = [testProduct1];

      await productController.registerProducts(
        testProduct1.model,
        testProduct1.category,
        testProduct1.quantity,
        testProduct1.details,
        testProduct1.sellingPrice,
        testProduct1.arrivalDate
      );

      await productController.registerProducts(
        testProduct2.model,
        testProduct2.category,
        testProduct2.quantity,
        testProduct2.details,
        testProduct2.sellingPrice,
        testProduct2.arrivalDate
      );

      await productController.registerProducts(
        testProduct3.model,
        testProduct3.category,
        testProduct3.quantity,
        testProduct3.details,
        testProduct3.sellingPrice,
        testProduct3.arrivalDate
      );

      const result = await productController.getProducts(
        "model",
        "",
        "TestModel1"
      );

      expect(result).toStrictEqual(filteredProduct);
    });

    test("Return all products filtered by model - failure (product does not exist) ", async () => {
      const testProduct1 = new Product(
        12,
        "TestModel1",
        Category.SMARTPHONE,
        "2024-04-02",
        "TestDetails",
        10
      );

      await productController.registerProducts(
        testProduct1.model,
        testProduct1.category,
        testProduct1.quantity,
        testProduct1.details,
        testProduct1.sellingPrice,
        testProduct1.arrivalDate
      );

      await expect(
        productController.getProducts("model", "", "TestModel6")
      ).rejects.toThrow(new ProductNotFoundError());
    });

    test("Return all products filtered by category", async () => {
      const testProduct1 = new Product(
        12,
        "TestModel1",
        Category.SMARTPHONE,
        "2024-04-02",
        "TestDetails",
        10
      );
      const testProduct2 = new Product(
        12,
        "TestModel2",
        Category.LAPTOP,
        "2024-04-02",
        "TestDetails",
        10
      );

      const filteredProduct: Product[] = [testProduct1];

      await productController.registerProducts(
        testProduct1.model,
        testProduct1.category,
        testProduct1.quantity,
        testProduct1.details,
        testProduct1.sellingPrice,
        testProduct1.arrivalDate
      );

      await productController.registerProducts(
        testProduct2.model,
        testProduct2.category,
        testProduct2.quantity,
        testProduct2.details,
        testProduct2.sellingPrice,
        testProduct2.arrivalDate
      );

      const result = await productController.getProducts(
        "category",
        "Smartphone",
        ""
      );

      expect(result).toStrictEqual(filteredProduct);
    });
  });

  describe("getAvailableProducts test:", () => {
    let productController: ProductController;

    beforeAll(async () => {
      productController = new ProductController();

      await cleanup();
    });

    afterEach(async () => {
      await cleanup();
    });

    test("Return all available products ", async () => {
      const testProduct1 = new Product(
        12,
        "TestModel1",
        Category.SMARTPHONE,
        "2024-04-02",
        "TestDetails",
        10
      );
      const testProduct2 = new Product(
        12,
        "TestModel2",
        Category.LAPTOP,
        "2024-04-02",
        "TestDetails",
        10
      );
      const testProduct3 = new Product(
        12,
        "TestModel3",
        Category.APPLIANCE,
        "2024-04-02",
        "TestDetails",
        0
      );

      const testProducts: Product[] = [testProduct1, testProduct2];

      await productController.registerProducts(
        testProduct1.model,
        testProduct1.category,
        testProduct1.quantity,
        testProduct1.details,
        testProduct1.sellingPrice,
        testProduct1.arrivalDate
      );

      await productController.registerProducts(
        testProduct2.model,
        testProduct2.category,
        testProduct2.quantity,
        testProduct2.details,
        testProduct2.sellingPrice,
        testProduct2.arrivalDate
      );

      await productController.registerProducts(
        testProduct3.model,
        testProduct3.category,
        testProduct3.quantity,
        testProduct3.details,
        testProduct3.sellingPrice,
        testProduct3.arrivalDate
      );

      const result = await productController.getAvailableProducts("", "", "");

      expect(result).toStrictEqual(testProducts);
    });

    test("Return all available products filtered by model", async () => {
      const testProduct1 = new Product(
        12,
        "TestModel1",
        Category.SMARTPHONE,
        "2024-04-02",
        "TestDetails",
        10
      );
      const testProduct2 = new Product(
        12,
        "TestModel2",
        Category.LAPTOP,
        "2024-04-02",
        "TestDetails",
        10
      );
      const testProduct3 = new Product(
        12,
        "TestModel3",
        Category.SMARTPHONE,
        "2024-04-02",
        "TestDetails",
        0
      );

      const testProducts: Product[] = [testProduct1];

      await productController.registerProducts(
        testProduct1.model,
        testProduct1.category,
        testProduct1.quantity,
        testProduct1.details,
        testProduct1.sellingPrice,
        testProduct1.arrivalDate
      );

      await productController.registerProducts(
        testProduct2.model,
        testProduct2.category,
        testProduct2.quantity,
        testProduct2.details,
        testProduct2.sellingPrice,
        testProduct2.arrivalDate
      );

      await productController.registerProducts(
        testProduct3.model,
        testProduct3.category,
        testProduct3.quantity,
        testProduct3.details,
        testProduct3.sellingPrice,
        testProduct3.arrivalDate
      );

      const result = await productController.getAvailableProducts(
        "model",
        "",
        "TestModel1"
      );

      expect(result).toStrictEqual(testProducts);
    });

    test("Return all available products filtered by model - absent", async () => {
      const testProduct1 = new Product(
        12,
        "TestModel1",
        Category.SMARTPHONE,
        "2024-04-02",
        "TestDetails",
        0
      );
      const testProduct2 = new Product(
        12,
        "TestModel2",
        Category.LAPTOP,
        "2024-04-02",
        "TestDetails",
        10
      );
      const testProduct3 = new Product(
        12,
        "TestModel3",
        Category.APPLIANCE,
        "2024-04-02",
        "TestDetails",
        0
      );

      const testProducts: Product[] = [];

      await productController.registerProducts(
        testProduct1.model,
        testProduct1.category,
        testProduct1.quantity,
        testProduct1.details,
        testProduct1.sellingPrice,
        testProduct1.arrivalDate
      );

      await productController.registerProducts(
        testProduct2.model,
        testProduct2.category,
        testProduct2.quantity,
        testProduct2.details,
        testProduct2.sellingPrice,
        testProduct2.arrivalDate
      );

      await productController.registerProducts(
        testProduct3.model,
        testProduct3.category,
        testProduct3.quantity,
        testProduct3.details,
        testProduct3.sellingPrice,
        testProduct3.arrivalDate
      );

      const result = await productController.getAvailableProducts(
        "model",
        "",
        "TestModel1"
      );

      expect(result).toStrictEqual(testProducts);
    });

    test("Return all available products filtered by model - failure (product does not exist) ", async () => {
      const testProduct1 = new Product(
        12,
        "TestModel1",
        Category.SMARTPHONE,
        "2024-04-02",
        "TestDetails",
        10
      );

      await productController.registerProducts(
        testProduct1.model,
        testProduct1.category,
        testProduct1.quantity,
        testProduct1.details,
        testProduct1.sellingPrice,
        testProduct1.arrivalDate
      );

      await expect(
        productController.getAvailableProducts("model", "", "TestModel6")
      ).rejects.toThrow(new ProductNotFoundError());
    });

    test("Return all available products filtered by category", async () => {
      const testProduct1 = new Product(
        12,
        "TestModel1",
        Category.SMARTPHONE,
        "2024-04-02",
        "TestDetails",
        10
      );
      const testProduct2 = new Product(
        12,
        "TestModel2",
        Category.LAPTOP,
        "2024-04-02",
        "TestDetails",
        10
      );
      const testProduct3 = new Product(
        12,
        "TestModel3",
        Category.SMARTPHONE,
        "2024-04-02",
        "TestDetails",
        0
      );

      const testProducts: Product[] = [testProduct1];

      await productController.registerProducts(
        testProduct1.model,
        testProduct1.category,
        testProduct1.quantity,
        testProduct1.details,
        testProduct1.sellingPrice,
        testProduct1.arrivalDate
      );

      await productController.registerProducts(
        testProduct2.model,
        testProduct2.category,
        testProduct2.quantity,
        testProduct2.details,
        testProduct2.sellingPrice,
        testProduct2.arrivalDate
      );

      await productController.registerProducts(
        testProduct3.model,
        testProduct3.category,
        testProduct3.quantity,
        testProduct3.details,
        testProduct3.sellingPrice,
        testProduct3.arrivalDate
      );

      const result = await productController.getAvailableProducts(
        "category",
        "Smartphone",
        ""
      );

      expect(result).toStrictEqual(testProducts);
    });

    test("Return all available products filtered by model - absent", async () => {
      const testProduct1 = new Product(
        12,
        "TestModel1",
        Category.SMARTPHONE,
        "2024-04-02",
        "TestDetails",
        0
      );

      const testProducts: Product[] = [];

      await productController.registerProducts(
        testProduct1.model,
        testProduct1.category,
        testProduct1.quantity,
        testProduct1.details,
        testProduct1.sellingPrice,
        testProduct1.arrivalDate
      );

      const result = await productController.getAvailableProducts(
        "category",
        "Smartphone",
        ""
      );

      expect(result).toStrictEqual(testProducts);
    });
  });

  describe("deleteAllProducts test:", () => {
    let productController: ProductController;

    beforeAll(async () => {
      productController = new ProductController();

      await cleanup();
    });

    afterEach(async () => {
      await cleanup();
    });

    test("it should delete All Products in the db", async () => {
      const testProduct1 = new Product(
        12,
        "TestModel1",
        Category.SMARTPHONE,
        "2024-04-02",
        "TestDetails",
        0
      );
      const testProduct2 = new Product(
        12,
        "TestModel2",
        Category.LAPTOP,
        "2024-04-02",
        "TestDetails",
        10
      );
      const testProduct3 = new Product(
        12,
        "TestModel3",
        Category.SMARTPHONE,
        "2024-04-02",
        "TestDetails",
        0
      );

      const testResult: Product[] = [];

      await productController.registerProducts(
        testProduct1.model,
        testProduct1.category,
        testProduct1.quantity,
        testProduct1.details,
        testProduct1.sellingPrice,
        testProduct1.arrivalDate
      );

      await productController.registerProducts(
        testProduct2.model,
        testProduct2.category,
        testProduct2.quantity,
        testProduct2.details,
        testProduct2.sellingPrice,
        testProduct2.arrivalDate
      );

      await productController.registerProducts(
        testProduct3.model,
        testProduct3.category,
        testProduct3.quantity,
        testProduct3.details,
        testProduct3.sellingPrice,
        testProduct3.arrivalDate
      );

      const result = await productController.deleteAllProducts();

      const check = await productController.getProducts("", "", "");

      expect(result).toBe(true);

      expect(check).toStrictEqual(testResult);
    });
  });

  describe("deleteProduct test:", () => {
    let productController: ProductController;

    beforeAll(async () => {
      productController = new ProductController();

      await cleanup();
    });

    afterEach(async () => {
      await cleanup();
    });

    test("it should delete the specified Product ", async () => {
      const testProduct1 = new Product(
        12,
        "TestModel1",
        Category.SMARTPHONE,
        "2024-04-02",
        "TestDetails",
        0
      );
      const testProduct2 = new Product(
        12,
        "TestModel2",
        Category.LAPTOP,
        "2024-04-02",
        "TestDetails",
        10
      );
      const testProduct3 = new Product(
        12,
        "TestModel3",
        Category.SMARTPHONE,
        "2024-04-02",
        "TestDetails",
        0
      );

      const deletedModel = "TestModel1";

      await productController.registerProducts(
        testProduct1.model,
        testProduct1.category,
        testProduct1.quantity,
        testProduct1.details,
        testProduct1.sellingPrice,
        testProduct1.arrivalDate
      );

      await productController.registerProducts(
        testProduct2.model,
        testProduct2.category,
        testProduct2.quantity,
        testProduct2.details,
        testProduct2.sellingPrice,
        testProduct2.arrivalDate
      );

      await productController.registerProducts(
        testProduct3.model,
        testProduct3.category,
        testProduct3.quantity,
        testProduct3.details,
        testProduct3.sellingPrice,
        testProduct3.arrivalDate
      );

      const result = await productController.deleteProduct(deletedModel);

      expect(result).toBe(true);

      await expect(
        productController.productByModel(deletedModel)
      ).rejects.toThrow(new ProductNotFoundError());
    });
  });
});
