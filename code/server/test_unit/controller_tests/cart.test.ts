import { test, expect, jest, describe, afterEach, beforeAll } from "@jest/globals"
import CartController from "../../src/controllers/cartController"
import CartDAO from "../../src/dao/cartDAO"
import { Cart, ProductInCart } from "../../src/components/cart"
import { Category, Product } from "../../src/components/product"
import { Role, User } from "../../src/components/user"
import { CartNotFoundError, EmptyCartError, ProductNotInCartError } from "../../src/errors/cartError"
import { EmptyProductStockError, LowProductStockError, ProductNotFoundError } from "../../src/errors/productError"
import ProductDAO from "../../src/dao/productDAO"

jest.mock("../../src/dao/cartDAO");

describe("Controller tests", () => {
    describe("Controller - Get cart", () => {
      afterEach(() => {
        jest.clearAllMocks();
      });

      test("Get current cart successful", async () => {
        const testUser = new User(
          "test",
          "test",
          "test",
          Role.CUSTOMER,
          "test",
          "test"
        );
        const testProductsInCart = [
          new ProductInCart("iPhone13", 1, Category.SMARTPHONE, 1000.0),
        ];
        const testCart = new Cart(
          "test",
          false,
          "",
          1000.0,
          testProductsInCart
        );
        jest
          .spyOn(CartDAO.prototype, "getCurrentCart")
          .mockResolvedValueOnce(testCart);
        const controller = new CartController();
        const response = await controller.getCart(testUser);

        expect(CartDAO.prototype.getCurrentCart).toBeCalledTimes(1);
        expect(CartDAO.prototype.getCurrentCart).toHaveBeenCalledWith(testUser);
        expect(response).toBe(testCart);
      });

      test("Get current cart, if empty", async () => {
        const testUser = new User(
          "test",
          "test",
          "test",
          Role.CUSTOMER,
          "test",
          "test"
        );
        const testCart = new Cart("test", false, "", 0.0, []);
        jest
          .spyOn(CartDAO.prototype, "getCurrentCart")
          .mockRejectedValueOnce(CartNotFoundError);
        const controller = new CartController();
        const response = await controller.getCart(testUser);

        expect(CartDAO.prototype.getCurrentCart).toHaveBeenCalledTimes(1);
        expect(CartDAO.prototype.getCurrentCart).toHaveBeenCalledWith(testUser);
        expect(response).toEqual(testCart);
      });

      test("Get current cart with generic error", async () => {
        const testUser = new User(
          "test",
          "test",
          "test",
          Role.CUSTOMER,
          "test",
          "test"
        );
        jest
          .spyOn(CartDAO.prototype, "getCurrentCart")
          .mockRejectedValueOnce(Error);
        const controller = new CartController();
        await expect(controller.getCart(testUser)).rejects.toBe(Error);
        expect(CartDAO.prototype.getCurrentCart).toHaveBeenCalledTimes(1);
        expect(CartDAO.prototype.getCurrentCart).toHaveBeenCalledWith(testUser);
      });
    });
    
    describe("Controller - Get all customer carts", () => {
        afterEach(() => {
            jest.clearAllMocks();
        });

        test("Get carts successful, at least one cart paid", async () => {
          const testUser = new User(
            "test",
            "test",
            "test",
            Role.CUSTOMER,
            "test",
            "test"
          );
          const testProductsInCart = [
            new ProductInCart("iPhone13", 1, Category.SMARTPHONE, 1000.0),
          ];
          const testCarts = [
            {id: 1, cart: new Cart("test", true, "", 1000.0, testProductsInCart)},
            {id: 2, cart: new Cart("test", true, "", 1000.0, testProductsInCart)}
          ];
          jest
            .spyOn(CartDAO.prototype, "fetchPaidCarts")
            .mockResolvedValueOnce(testCarts);

          const mockDAOFetchProducts = jest.spyOn(CartDAO.prototype, "fetchProducts");
          testCarts.forEach(testCart => {
            mockDAOFetchProducts.mockResolvedValueOnce(testCart.cart.products);
          });

          const controller = new CartController();
          const response = await controller.getCustomerCarts(testUser);

          expect(CartDAO.prototype.fetchPaidCarts).toHaveBeenCalledTimes(1);
          expect(CartDAO.prototype.fetchPaidCarts).toHaveBeenCalledWith(testUser.username);

          expect(CartDAO.prototype.fetchProducts).toHaveBeenCalledTimes(testCarts.length);
          expect(CartDAO.prototype.fetchProducts).toHaveBeenNthCalledWith(1, testCarts[0].id);
          expect(CartDAO.prototype.fetchProducts).toHaveBeenNthCalledWith(2, testCarts[1].id);

          expect(response).toStrictEqual(testCarts.map(testCart => testCart.cart));
        });
        
        
        test("Get carts successful, still no carts paid", async () => {
          const testUser = new User(
            "test",
            "test",
            "test",
            Role.CUSTOMER,
            "test",
            "test"
          );
          const testCarts: {id: number, cart: Cart}[] = [];
          jest
            .spyOn(CartDAO.prototype, "fetchPaidCarts")
            .mockResolvedValueOnce(testCarts);

          const controller = new CartController();
          const response = await controller.getCustomerCarts(testUser);

          expect(CartDAO.prototype.fetchPaidCarts).toHaveBeenCalledTimes(1);
          expect(CartDAO.prototype.fetchPaidCarts).toHaveBeenCalledWith(testUser.username);

          expect(CartDAO.prototype.fetchProducts).toHaveBeenCalledTimes(testCarts.length);

          expect(response).toStrictEqual(testCarts);
        });

        test("Get carts failed", async () => {
          const testUser = new User(
            "test",
            "test",
            "test",
            Role.CUSTOMER,
            "test",
            "test"
          );
          jest
            .spyOn(CartDAO.prototype, "fetchPaidCarts")
            .mockRejectedValueOnce(Error);
          const controller = new CartController();
          await expect(controller.getCustomerCarts(testUser)).rejects.toBe(
            Error
          );

          expect(CartDAO.prototype.fetchPaidCarts).toHaveBeenCalledTimes(1);
          expect(CartDAO.prototype.fetchPaidCarts).toHaveBeenCalledWith(testUser.username);
        });
    });
    
    describe("Controller - Get all carts", () => {
      afterEach(() => {
        jest.clearAllMocks();
      });

      test("Get all carts successful", async () => {
        const testProductsInCart = [
          new ProductInCart("iPhone13", 1, Category.SMARTPHONE, 1000.0),
        ];
        const testCarts = [
          {id: 1, cart: new Cart("test", true, "", 1000.0, testProductsInCart)},
          {id: 2, cart: new Cart("test2", true, "", 1000.0, testProductsInCart)},
          {id: 3, cart: new Cart("test2", false, "", 1000.0, testProductsInCart)}
        ];
        jest
          .spyOn(CartDAO.prototype, "fetchAllCarts")
          .mockResolvedValueOnce(testCarts);

        const mockDAOFetchProducts = jest.spyOn(CartDAO.prototype, "fetchProducts");
        testCarts.forEach(testCart => {
          mockDAOFetchProducts.mockResolvedValueOnce(testCart.cart.products);
        });

        const controller = new CartController();
        const response = await controller.getAllCarts();

        expect(CartDAO.prototype.fetchAllCarts).toHaveBeenCalledTimes(1);
        expect(CartDAO.prototype.fetchAllCarts).toHaveBeenCalledWith();

        expect(mockDAOFetchProducts).toHaveBeenCalledTimes(testCarts.length);
        testCarts.forEach((testCart, index) => {
          expect(mockDAOFetchProducts).toHaveBeenNthCalledWith(index+1, testCart.id);
        });

        expect(response).toStrictEqual(testCarts.map(testCart => testCart.cart));
      });

      test("Get all carts successful: no carts", async () => {
        const testCarts: {id: number, cart: Cart}[] = [];
        jest
          .spyOn(CartDAO.prototype, "fetchAllCarts")
          .mockResolvedValueOnce(testCarts);

        const controller = new CartController();
        const response = await controller.getAllCarts();

        expect(CartDAO.prototype.fetchAllCarts).toHaveBeenCalledTimes(1);
        expect(CartDAO.prototype.fetchAllCarts).toHaveBeenCalledWith();

        expect(response).toStrictEqual([]);
      });

      test("Get all carts failed", async () => {
        jest
          .spyOn(CartDAO.prototype, "fetchAllCarts")
          .mockRejectedValueOnce(Error);
        const controller = new CartController();
        await expect(controller.getAllCarts()).rejects.toBe(Error);

        expect(CartDAO.prototype.fetchAllCarts).toHaveBeenCalledTimes(1);
        expect(CartDAO.prototype.fetchAllCarts).toHaveBeenCalledWith();
      });
    });
    
    describe("Controller - Add product to cart", () => {
      afterEach(() => {
        jest.clearAllMocks();
      });

      test("Add product to cart successful: unpaid cart already present", async () => {
        const testUser = new User(
          "test",
          "test",
          "test",
          Role.CUSTOMER,
          "test",
          "test"
        );
        const testCartId = 1;
        const testNewProductInCart = new ProductInCart(
          "Test",
          1,
          Category.APPLIANCE,
          100
        );

        jest
          .spyOn(CartDAO.prototype, "getProduct")
          .mockResolvedValueOnce(testNewProductInCart);
        jest
          .spyOn(CartDAO.prototype, "getCurrentCartId")
          .mockResolvedValue(testCartId);
        jest
          .spyOn(CartDAO.prototype, "addProductToCart")
          .mockResolvedValueOnce(true);

        const controller = new CartController();
        const response = await controller.addToCart(
          testUser,
          testNewProductInCart.model
        );

        expect(CartDAO.prototype.getProduct).toBeCalledTimes(1);
        expect(CartDAO.prototype.getProduct).toHaveBeenCalledWith(
          testNewProductInCart.model
        );

        expect(CartDAO.prototype.getCurrentCartId).toBeCalledTimes(1);
        expect(CartDAO.prototype.getCurrentCartId).toHaveBeenCalledWith(
          testUser
        );

        expect(CartDAO.prototype.addProductToCart).toHaveBeenCalledTimes(1);
        expect(CartDAO.prototype.addProductToCart).toBeCalledWith(
          testCartId,
          testNewProductInCart
        );

        expect(response).toBe(true);
      });

      test("Add product to cart failed: new product absent", async () => {
        const testUser = new User(
          "test",
          "test",
          "test",
          Role.CUSTOMER,
          "test",
          "test"
        );
        const testProductModel = "Test";

        jest
          .spyOn(CartDAO.prototype, "getProduct")
          .mockRejectedValueOnce(new ProductNotFoundError());

        const controller = new CartController();
        await expect(
          controller.addToCart(testUser, testProductModel)
        ).rejects.toBeInstanceOf(ProductNotFoundError);

        expect(CartDAO.prototype.getProduct).toBeCalledTimes(1);
      });

      test("Add product to cart failed: new product present but not available", async () => {
        const testUser = new User(
          "test",
          "test",
          "test",
          Role.CUSTOMER,
          "test",
          "test"
        );
        const testProductModel = "Test";

        jest
          .spyOn(CartDAO.prototype, "getProduct")
          .mockRejectedValueOnce(new EmptyProductStockError());

        const controller = new CartController();
        await expect(
          controller.addToCart(testUser, testProductModel)
        ).rejects.toBeInstanceOf(EmptyProductStockError);

        expect(CartDAO.prototype.getProduct).toBeCalledTimes(1);
      });

      test("Add product to cart successful: new product present and available, cart created on the fly", async () => {
        const testUser = new User(
          "test",
          "test",
          "test",
          Role.CUSTOMER,
          "test",
          "test"
        );
        const testProductModel = "Test";
        const testCartId = 1;
        const testNewProductInCart = new ProductInCart(
          "Test",
          1,
          Category.APPLIANCE,
          100
        );

        jest
          .spyOn(CartDAO.prototype, "getProduct")
          .mockResolvedValueOnce(testNewProductInCart);
        jest
          .spyOn(CartDAO.prototype, "getCurrentCartId")
          .mockRejectedValueOnce(new CartNotFoundError());
        jest
          .spyOn(CartDAO.prototype, "createCart")
          .mockResolvedValueOnce(testCartId);
        jest
          .spyOn(CartDAO.prototype, "addProductToCart")
          .mockResolvedValueOnce(true);

        const controller = new CartController();
        const result = await controller.addToCart(testUser, testProductModel);

        expect(CartDAO.prototype.getProduct).toBeCalledTimes(1);
        expect(CartDAO.prototype.getCurrentCartId).toBeCalledTimes(1);
        expect(CartDAO.prototype.createCart).toBeCalledTimes(1);
        expect(CartDAO.prototype.addProductToCart).toBeCalledTimes(1);

        expect(result).toBe(true);
      });
    });

    describe("Controller - Checkout cart", () => {
      let controller: CartController;

      beforeAll(() => {
        controller = new CartController();
      });

      afterEach(() => {
        jest.clearAllMocks();
      });

      test("Checkout successful", async () => {
        const testUser = new User(
          "test",
          "test",
          "test",
          Role.CUSTOMER,
          "test",
          "test"
        );
        const testProductsInCart = [
          new ProductInCart("iPhone13", 1, Category.SMARTPHONE, 1000.0),
          new ProductInCart("HP", 2, Category.LAPTOP, 800.0),
        ];
        const testCart = new Cart(
          "test",
          false,
          "",
          1800.0,
          testProductsInCart
        );

        jest
          .spyOn(CartDAO.prototype, "getCurrentCart")
          .mockResolvedValueOnce(testCart);
        const mockProdDAOGetProdQuantity = jest.spyOn(
          ProductDAO.prototype,
          "getProductQuantity"
        );
        const mockProdDAODecreaseQuantity = jest.spyOn(
          ProductDAO.prototype,
          "decreaseQuantity"
        );
        jest
          .spyOn(CartDAO.prototype, "checkoutCart")
          .mockResolvedValueOnce(true);

        mockProdDAOGetProdQuantity.mockResolvedValueOnce(1);
        mockProdDAOGetProdQuantity.mockResolvedValueOnce(2);

        mockProdDAODecreaseQuantity.mockResolvedValueOnce(0);
        mockProdDAODecreaseQuantity.mockResolvedValueOnce(0);

        const response = await controller.checkoutCart(testUser);

        expect(CartDAO.prototype.getCurrentCart).toBeCalledTimes(1);
        expect(CartDAO.prototype.getCurrentCart).toBeCalledWith(testUser);

        expect(ProductDAO.prototype.getProductQuantity).toBeCalledTimes(2);

        expect(ProductDAO.prototype.decreaseQuantity).toBeCalledTimes(2);

        expect(response).toBe(true);
      });

      test("Checkout failed - No unpaid cart in database", async () => {
        const testUser = new User(
          "test",
          "test",
          "test",
          Role.CUSTOMER,
          "test",
          "test"
        );
        jest
          .spyOn(CartDAO.prototype, "getCurrentCart")
          .mockRejectedValueOnce(new CartNotFoundError());

        await expect(controller.checkoutCart(testUser)).rejects.toBeInstanceOf(
          CartNotFoundError
        );

        expect(CartDAO.prototype.getCurrentCart).toBeCalledTimes(1);
        expect(CartDAO.prototype.getCurrentCart).toBeCalledWith(testUser);
      });

      test("Checkout failed - Unpaid cart present, but no products inside", async () => {
        const testUser = new User(
          "test",
          "test",
          "test",
          Role.CUSTOMER,
          "test",
          "test"
        );
        const testProductsInCart: ProductInCart[] = [];
        const testCart = new Cart("test", false, "", 0.0, testProductsInCart);

        jest
          .spyOn(CartDAO.prototype, "getCurrentCart")
          .mockResolvedValueOnce(testCart);

        await expect(controller.checkoutCart(testUser)).rejects.toBeInstanceOf(
          EmptyCartError
        );

        expect(CartDAO.prototype.getCurrentCart).toBeCalledTimes(1);
        expect(CartDAO.prototype.getCurrentCart).toBeCalledWith(testUser);
      });

      test("Checkout failed - Unpaid cart present, all product present in stock, but at least one whose quantity is higher than available", async () => {
        const testUser = new User(
          "test",
          "test",
          "test",
          Role.CUSTOMER,
          "test",
          "test"
        );
        const testProductsInCart = [
          new ProductInCart("iPhone13", 4, Category.SMARTPHONE, 1000.0),
          new ProductInCart("HP", 5, Category.LAPTOP, 800.0),
        ];
        const testCart = new Cart(
          "test",
          false,
          "",
          8000.0,
          testProductsInCart
        );

        jest
          .spyOn(CartDAO.prototype, "getCurrentCart")
          .mockResolvedValueOnce(testCart);
        const mockProdDAOGetProdQuantity = jest.spyOn(
          ProductDAO.prototype,
          "getProductQuantity"
        );

        mockProdDAOGetProdQuantity.mockResolvedValueOnce(1);

        await expect(controller.checkoutCart(testUser)).rejects.toBeInstanceOf(
          LowProductStockError
        );

        expect(CartDAO.prototype.getCurrentCart).toBeCalledTimes(1);
        expect(CartDAO.prototype.getCurrentCart).toBeCalledWith(testUser);

        expect(ProductDAO.prototype.getProductQuantity).toBeCalledTimes(1);
        expect(ProductDAO.prototype.getProductQuantity).toHaveBeenNthCalledWith(
          1,
          "iPhone13"
        );
        //expect(ProductDAO.prototype.getProductQuantity).toHaveBeenNthCalledWith(2, "HP");

        mockProdDAOGetProdQuantity.mockClear();
      });

      test("Checkout failed - Unpaid cart present, but at least a product with empty stock", async () => {
        const testUser = new User(
          "test",
          "test",
          "test",
          Role.CUSTOMER,
          "test",
          "test"
        );
        const testProductsInCart = [
          new ProductInCart("iPhone13", 1, Category.SMARTPHONE, 1000.0),
          new ProductInCart("HP", 2, Category.LAPTOP, 800.0),
        ];
        const testCart = new Cart(
          "test",
          false,
          "",
          1800.0,
          testProductsInCart
        );

        jest
          .spyOn(CartDAO.prototype, "getCurrentCart")
          .mockResolvedValueOnce(testCart);
        const mockProdDAOGetProdQuantity = jest.spyOn(
          ProductDAO.prototype,
          "getProductQuantity"
        );

        mockProdDAOGetProdQuantity.mockResolvedValueOnce(0);

        await expect(controller.checkoutCart(testUser)).rejects.toBeInstanceOf(
          EmptyProductStockError
        );

        expect(CartDAO.prototype.getCurrentCart).toBeCalledTimes(1);
        expect(CartDAO.prototype.getCurrentCart).toBeCalledWith(testUser);

        expect(ProductDAO.prototype.getProductQuantity).toBeCalledTimes(1);
      });
    });

    describe("Controller - Clear current cart", () => {
      afterEach(() => {
        jest.clearAllMocks();
      });

      test("Cart cleared successfully", async () => {
        const testUser = new User(
          "test",
          "test",
          "test",
          Role.CUSTOMER,
          "test",
          "test"
        );

        jest.spyOn(CartDAO.prototype, "clearCart").mockResolvedValueOnce(true);
        const controller = new CartController();
        const response = await controller.clearCart(testUser);

        expect(CartDAO.prototype.clearCart).toBeCalledTimes(1);
        expect(CartDAO.prototype.clearCart).toBeCalledWith(testUser);

        expect(response).toBe(true);
      });

      test("Cart clear failed - No unpaid cart", async () => {
        const testUser = new User(
          "test",
          "test",
          "test",
          Role.CUSTOMER,
          "test",
          "test"
        );

        jest
          .spyOn(CartDAO.prototype, "clearCart")
          .mockRejectedValueOnce(new CartNotFoundError());
        const controller = new CartController();
        await expect(controller.clearCart(testUser)).rejects.toBeInstanceOf(
          CartNotFoundError
        );

        expect(CartDAO.prototype.clearCart).toBeCalledTimes(1);
        expect(CartDAO.prototype.clearCart).toBeCalledWith(testUser);
      });

      // Error test is skipped since it is generic
    });

    describe("Controller - Remove product from cart", () => {
      afterEach(() => {
        jest.clearAllMocks();
      });

      test("Product removed successfully", async () => {
        const testUser = new User(
          "test",
          "test",
          "test",
          Role.CUSTOMER,
          "test",
          "test"
        );
        const testProductModel = "TestModel";

        jest
          .spyOn(CartDAO.prototype, "removeProductFromCart")
          .mockResolvedValueOnce(true);
        const controller = new CartController();
        const response = await controller.removeProductFromCart(
          testUser,
          testProductModel
        );

        expect(CartDAO.prototype.removeProductFromCart).toBeCalledTimes(1);
        expect(CartDAO.prototype.removeProductFromCart).toBeCalledWith(
          testUser,
          testProductModel
        );

        expect(response).toBe(true);
      });

      test("Product delete failure: product not found in cart", async () => {
        const testUser = new User(
          "test",
          "test",
          "test",
          Role.CUSTOMER,
          "test",
          "test"
        );
        const testProductModel = "TestModel";

        jest
          .spyOn(CartDAO.prototype, "removeProductFromCart")
          .mockRejectedValueOnce(ProductNotInCartError);
        const controller = new CartController();
        await expect(
          controller.removeProductFromCart(testUser, testProductModel)
        ).rejects.toBe(ProductNotInCartError);

        expect(CartDAO.prototype.removeProductFromCart).toBeCalledTimes(1);
        expect(CartDAO.prototype.removeProductFromCart).toBeCalledWith(
          testUser,
          testProductModel
        );
      });

      // Generic error test is skipped since it is one-line function
    });

    describe("Controller - Delete all carts", () => {
      afterEach(() => {
        jest.clearAllMocks();
      });

      test("Carts cleared successfully", async () => {
        jest
          .spyOn(CartDAO.prototype, "deleteAllCarts")
          .mockResolvedValueOnce(true);
        const controller = new CartController();
        const response = await controller.deleteAllCarts();

        expect(CartDAO.prototype.deleteAllCarts).toBeCalledTimes(1);
        expect(CartDAO.prototype.deleteAllCarts).toBeCalledWith();

        expect(response).toBe(true);
      });

      // Error test is skipped since it is generic
    });

    describe("Controller - Contains product utility function", () => {
        afterEach(() => {
            jest.clearAllMocks();
        });

        test("Cart contains product", async () => {
          const testProductsInCart = [
            new ProductInCart("iPhone13", 1, Category.SMARTPHONE, 1000.0),
          ];
          const testCart = new Cart(
            "test",
            false,
            "",
            1000.0,
            testProductsInCart
          );
          const testProductModel = testProductsInCart[0].model;

          const controller = new CartController();
          const response = controller.containsProduct(
            testCart,
            testProductModel
          );

          expect(response).toBe(true);
        });

        test("Cart does not contain product", async () => {
            const testProductsInCart = [
                new ProductInCart("iPhone13", 1, Category.SMARTPHONE, 1000.0)
            ];
            const testCart = new Cart("test", false, "", 1000.0, testProductsInCart);
            const testProductModel = "HP";

            const controller = new CartController();
            const response = controller.containsProduct(
              testCart,
              testProductModel
            );

            expect(response).toBe(false);
        });
    });
});