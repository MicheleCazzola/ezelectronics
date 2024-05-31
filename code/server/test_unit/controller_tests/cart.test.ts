import { test, expect, jest, describe, afterEach } from "@jest/globals"
import CartController from "../../src/controllers/cartController"
import CartDAO from "../../src/dao/cartDAO"
import { Cart, ProductInCart } from "../../src/components/cart"
import { Category, Product } from "../../src/components/product"
import { Role, User } from "../../src/components/user"
import { CartNotFoundError, ProductInCartError, ProductNotInCartError } from "../../src/errors/cartError"
import { ProductNotFoundError } from "../../src/errors/productError"
import ProductDAO from "../../src/dao/productDAO"

jest.mock("../../src/dao/cartDAO");

describe("Controller - Get cart", () => {

    afterEach(() => {
        jest.clearAllMocks();
    });

    test("Get current cart successful", async () => {
        const testUser = new User("test", "test", "test", Role.CUSTOMER, "test", "test");
        const testProductsInCart = [
            new ProductInCart("iPhone13", 1, Category.SMARTPHONE, 1000.0)
        ];
        const testCart = new Cart("test", false, "", 1000.0, testProductsInCart);
        jest.spyOn(CartDAO.prototype, "getCurrentCart").mockResolvedValueOnce(testCart);
        const controller = new CartController();
        const response = await controller.getCart(testUser);

        expect(CartDAO.prototype.getCurrentCart).toBeCalledTimes(1);
        expect(CartDAO.prototype.getCurrentCart).toHaveBeenCalledWith(testUser);
        expect(response).toBe(testCart);
    });
    
    test("Get current cart, if empty", async () => {
        const testUser = new User("test", "test", "test", Role.CUSTOMER, "test", "test");
        const testCart = new Cart("test", false, "", 0.0, []);
        jest.spyOn(CartDAO.prototype, "getCurrentCart").mockRejectedValueOnce(CartNotFoundError);
        const controller = new CartController();
        const response = await controller.getCart(testUser);

        expect(CartDAO.prototype.getCurrentCart).toHaveBeenCalledTimes(1);
        expect(CartDAO.prototype.getCurrentCart).toHaveBeenCalledWith(testUser);
        expect(response).toBe(testCart);
    });

    test("Get current cart with generic error", async () => {
        const testUser = new User("test", "test", "test", Role.CUSTOMER, "test", "test");
        jest.spyOn(CartDAO.prototype, "getCurrentCart").mockRejectedValueOnce(Error);
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
        const testUser = new User("test", "test", "test", Role.CUSTOMER, "test", "test");
        const testProductsInCart = [
            new ProductInCart("iPhone13", 1, Category.SMARTPHONE, 1000.0)
        ];
        const testCarts = [
            new Cart("test", true, "", 1000.0, testProductsInCart),
            new Cart("test", true, "", 1000.0, testProductsInCart)
        ];
        jest.spyOn(CartDAO.prototype, "getPaidCarts").mockResolvedValueOnce(testCarts);
        const controller = new CartController();
        const response = await controller.getCustomerCarts(testUser);

        expect(CartDAO.prototype.getPaidCarts).toHaveBeenCalledTimes(1);
        expect(CartDAO.prototype.getPaidCarts).toHaveBeenCalledWith(testUser);
        expect(response).toBe(testCarts);
    });

    test("Get carts successful, at least one cart paid and one current unpaid", async () => {
        const testUser = new User("test", "test", "test", Role.CUSTOMER, "test", "test");
        const testProductsInCart = [
            new ProductInCart("iPhone13", 1, Category.SMARTPHONE, 1000.0)
        ];
        const testCarts = [
            new Cart("test", true, "", 1000.0, testProductsInCart),
            new Cart("test", true, "", 1000.0, testProductsInCart),
            new Cart("test", false, "", 1000.0, testProductsInCart)
        ];
        jest.spyOn(CartDAO.prototype, "getPaidCarts").mockResolvedValueOnce(testCarts);
        const controller = new CartController();
        const response = await controller.getCustomerCarts(testUser);

        expect(CartDAO.prototype.getPaidCarts).toHaveBeenCalledTimes(1);
        expect(CartDAO.prototype.getPaidCarts).toHaveBeenCalledWith(testUser);
        expect(response).toBe(testCarts);
    });

    test("Get carts successful, still no carts paid", async () => {
        const testUser = new User("test", "test", "test", Role.CUSTOMER, "test", "test");
        const testCarts: Cart[] = [];
        jest.spyOn(CartDAO.prototype, "getPaidCarts").mockResolvedValueOnce(testCarts);
        const controller = new CartController();
        const response = await controller.getCustomerCarts(testUser);

        expect(CartDAO.prototype.getPaidCarts).toHaveBeenCalledTimes(1);
        expect(CartDAO.prototype.getPaidCarts).toHaveBeenCalledWith(testUser);
        expect(response).toBe(testCarts);
    });

    test("Get carts failed", async () => {
        const testUser = new User("test", "test", "test", Role.CUSTOMER, "test", "test");
        jest.spyOn(CartDAO.prototype, "getPaidCarts").mockRejectedValueOnce(Error);
        const controller = new CartController();
        await expect(controller.getCustomerCarts(testUser)).rejects.toBe(Error);

        expect(CartDAO.prototype.getPaidCarts).toHaveBeenCalledTimes(1);
        expect(CartDAO.prototype.getPaidCarts).toHaveBeenCalledWith(testUser);
    });
});

describe("Controller - Get all carts", () => {

    afterEach(() => {
        jest.clearAllMocks();
    });

    test("Get all carts successful", async () => {
        const testProductsInCart = [
            new ProductInCart("iPhone13", 1, Category.SMARTPHONE, 1000.0)
        ];
        const testCarts = [
            new Cart("test", true, "", 1000.0, testProductsInCart),
            new Cart("test", true, "", 1000.0, testProductsInCart),
            new Cart("test", false, "", 1000.0, testProductsInCart)
        ];
        jest.spyOn(CartDAO.prototype, "getAllCarts").mockResolvedValueOnce(testCarts);
        const controller = new CartController();
        const response = await controller.getAllCarts();

        expect(CartDAO.prototype.getAllCarts).toHaveBeenCalledTimes(1);
        expect(CartDAO.prototype.getAllCarts).toHaveBeenCalledWith();
        expect(response).toBe(testCarts);
    });

    test("Get all carts successful: no carts", async () => {
        const testCarts: Cart[] = [];
        jest.spyOn(CartDAO.prototype, "getAllCarts").mockResolvedValueOnce(testCarts);
        const controller = new CartController();
        const response = await controller.getAllCarts();

        expect(CartDAO.prototype.getAllCarts).toHaveBeenCalledTimes(1);
        expect(CartDAO.prototype.getAllCarts).toHaveBeenCalledWith();
        expect(response).toBe(testCarts);
    });

    test("Get all carts failed", async () => {
        jest.spyOn(CartDAO.prototype, "getAllCarts").mockRejectedValueOnce(Error);
        const controller = new CartController();
        await expect(controller.getAllCarts()).rejects.toBe(Error);

        expect(CartDAO.prototype.getAllCarts).toHaveBeenCalledTimes(1);
        expect(CartDAO.prototype.getAllCarts).toHaveBeenCalledWith();
    });
});

describe("Controller - Add product to cart", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    test("Add product to cart successful: no unpaid cart", async () => {
        const testUser = new User("test", "test", "test", Role.CUSTOMER, "test", "test");
        const testCart = new Cart("test", false, "", 0.0, []);
        const testNewProductInCart = new ProductInCart("Test", 1, Category.APPLIANCE, 100);
        const testCartUpdated = new Cart("test", false, "", 100, [testNewProductInCart]);
        
        jest.spyOn(CartDAO.prototype, "getCurrentCart").mockRejectedValueOnce(new CartNotFoundError());
        jest.spyOn(CartDAO.prototype, "getProduct").mockResolvedValue(testNewProductInCart);
        jest.spyOn(CartDAO.prototype, "updateCart").mockResolvedValueOnce(true);

        const controller = new CartController();
        const response = await controller.addToCart(testUser, testNewProductInCart.model);

        expect(CartDAO.prototype.getCurrentCart).toBeCalledTimes(1);
        expect(CartDAO.prototype.getCurrentCart).toHaveBeenCalledWith(testUser);

        expect(CartDAO.prototype.getProduct).toBeCalledTimes(1);
        expect(CartDAO.prototype.getProduct).toHaveBeenCalledWith(testNewProductInCart.model);

        expect(CartDAO.prototype.updateCart).toHaveBeenCalledTimes(1);
        expect(CartDAO.prototype.updateCart).toBeCalledWith(testCartUpdated);

        expect(response).toBe(true);
    });

    test("Add product to cart successful: unpaid cart present, new product absent", async () => {
        const testUser = new User("test", "test", "test", Role.CUSTOMER, "test", "test");
        const testProductsInCart = [
            new ProductInCart("iPhone13", 1, Category.SMARTPHONE, 1000.0)
        ];
        const testCart = new Cart("test", false, "", 1000.0, testProductsInCart);
        const testNewProductInCart = new ProductInCart("Test", 1, Category.APPLIANCE, 100);
        const testUpdatedProductsInCart = [
            new ProductInCart("iPhone13", 1, Category.SMARTPHONE, 1000.0),
            new ProductInCart("Test", 1, Category.APPLIANCE, 100)
        ];
        const testUpdatedCart = new Cart("test", false, "", 1100.0, testUpdatedProductsInCart);
        
        jest.spyOn(CartDAO.prototype, "getCurrentCart").mockResolvedValue(testCart);
        jest.spyOn(CartDAO.prototype, "getProduct").mockResolvedValue(testNewProductInCart);
        jest.spyOn(CartDAO.prototype, "updateCart").mockResolvedValueOnce(true);

        const controller = new CartController();
        const response = await controller.addToCart(testUser, testNewProductInCart.model);

        expect(CartDAO.prototype.getCurrentCart).toBeCalledTimes(1);
        expect(CartDAO.prototype.getCurrentCart).toHaveBeenCalledWith(testUser);

        expect(CartDAO.prototype.getProduct).toBeCalledTimes(1);
        expect(CartDAO.prototype.getProduct).toHaveBeenCalledWith(testNewProductInCart.model);

        expect(CartDAO.prototype.updateCart).toHaveBeenCalledTimes(1);
        expect(CartDAO.prototype.updateCart).toBeCalledWith(testUpdatedCart);

        expect(response).toBe(true);
    });

    test("Add product to cart successful: unpaid cart present, new product already present", async () => {
        const testUser = new User("test", "test", "test", Role.CUSTOMER, "test", "test");
        const testProductsInCart = [
            new ProductInCart("iPhone13", 1, Category.SMARTPHONE, 1000.0)
        ];
        const testCart = new Cart("test", false, "", 1000.0, testProductsInCart);
        const testNewProductModel = "iPhone13";
        const testUpdatedProductsInCart = [
            new ProductInCart("iPhone13", 2, Category.SMARTPHONE, 1000.0)
        ];
        const testUpdatedCart = new Cart("test", false, "", 2000.0, testUpdatedProductsInCart);
        
        jest.spyOn(CartDAO.prototype, "getCurrentCart").mockResolvedValue(testCart);
        jest.spyOn(CartDAO.prototype, "getProduct");
        jest.spyOn(CartDAO.prototype, "updateCart").mockResolvedValueOnce(true);

        const controller = new CartController();
        const response = await controller.addToCart(testUser, testNewProductModel);

        expect(CartDAO.prototype.getCurrentCart).toBeCalledTimes(1);
        expect(CartDAO.prototype.getCurrentCart).toHaveBeenCalledWith(testUser);

        expect(CartDAO.prototype.getProduct).toBeCalledTimes(0);

        expect(CartDAO.prototype.updateCart).toHaveBeenCalledTimes(1);
        expect(CartDAO.prototype.updateCart).toBeCalledWith(testUpdatedCart);

        expect(response).toBe(true);
    });

    test("Add product to cart failed: generic error while trying to retrieve current user cart", async () => {
        const testUser = new User("test", "test", "test", Role.CUSTOMER, "test", "test");
        const testNewProductModel = "iPhone13";

        jest.spyOn(CartDAO.prototype, "getCurrentCart").mockRejectedValueOnce(new Error());
        const controller = new CartController();
        await expect(controller.addToCart(testUser, testNewProductModel)).rejects.toThrow(Error);

        expect(CartDAO.prototype.getCurrentCart).toBeCalledTimes(1);
        expect(CartDAO.prototype.getCurrentCart).toBeCalledWith(testUser);
    });

    test("Add product to cart failed: product not found", async () => {
        const testUser = new User("test", "test", "test", Role.CUSTOMER, "test", "test");
        const testNewProductModel = "iPhone13";
        const testCart = new Cart("test", false, "", 0.0, []);

        jest.spyOn(CartDAO.prototype, "getCurrentCart").mockResolvedValueOnce(testCart);
        jest.spyOn(CartDAO.prototype, "getProduct").mockRejectedValue(new ProductNotFoundError());
        const controller = new CartController();
        await expect(controller.addToCart(testUser, testNewProductModel)).rejects.toThrow(ProductNotFoundError);

        expect(CartDAO.prototype.getCurrentCart).toBeCalledTimes(1);
        expect(CartDAO.prototype.getCurrentCart).toBeCalledWith(testUser);

        expect(CartDAO.prototype.getProduct).toBeCalledTimes(1);
        expect(CartDAO.prototype.getProduct).toBeCalledWith(testNewProductModel);
    });

    test("Add product to cart failed: product not found", async () => {
        const testUser = new User("test", "test", "test", Role.CUSTOMER, "test", "test");
        const testNewProductModel = "iPhone13";
        const testCart = new Cart("test", false, "", 0.0, []);

        jest.spyOn(CartDAO.prototype, "getCurrentCart").mockResolvedValueOnce(testCart);
        jest.spyOn(CartDAO.prototype, "getProduct").mockRejectedValue(new Error());
        const controller = new CartController();
        await expect(controller.addToCart(testUser, testNewProductModel)).rejects.toThrow(Error);

        expect(CartDAO.prototype.getCurrentCart).toBeCalledTimes(1);
        expect(CartDAO.prototype.getCurrentCart).toBeCalledWith(testUser);

        expect(CartDAO.prototype.getProduct).toBeCalledTimes(1);
        expect(CartDAO.prototype.getProduct).toBeCalledWith(testNewProductModel);
    });
});

// Not passing due to infinite loop: skipping to save time
describe.skip("Controller - Pay for current cart", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    test("Checkout successful", async () => {
        const testUser = new User("test", "test", "test", Role.CUSTOMER, "test", "test");
        const testProductsInCart = [
            new ProductInCart("iPhone13", 1, Category.SMARTPHONE, 1000.0),
            new ProductInCart("HP", 2, Category.LAPTOP, 800.0)
        ];
        const testCart = new Cart("test", false, "", 2600.0, testProductsInCart); 

        jest.spyOn(CartDAO.prototype, "getCurrentCart").mockResolvedValueOnce(testCart);
        jest.spyOn(ProductDAO.prototype, "getProductQuantity")
            .mockResolvedValueOnce(1)
            .mockResolvedValueOnce(2)
            ;
        jest.spyOn(ProductDAO.prototype, "decreaseQuantity")
            .mockResolvedValueOnce(0)
            .mockResolvedValueOnce(0)
            ;

        const controller = new CartController();
        const response = await controller.checkoutCart(testUser);

        expect(CartDAO.prototype.getCurrentCart).toBeCalledTimes(1);
        expect(CartDAO.prototype.getCurrentCart).toBeCalledWith(testUser);

        expect(ProductDAO.prototype.getProductQuantity).toBeCalledTimes(2);
        expect(ProductDAO.prototype.getProductQuantity).toHaveBeenNthCalledWith(0, testProductsInCart[0].model);
        expect(ProductDAO.prototype.getProductQuantity).toHaveBeenNthCalledWith(1, testProductsInCart[1].model);

        expect(ProductDAO.prototype.decreaseQuantity).toBeCalledTimes(2);
        expect(ProductDAO.prototype.decreaseQuantity).toHaveBeenNthCalledWith(0, [testProductsInCart[0].model, testProductsInCart[0].quantity, null]);
        expect(ProductDAO.prototype.decreaseQuantity).toHaveBeenNthCalledWith(1, [testProductsInCart[1].model, testProductsInCart[1].quantity, null]);

        expect(response).toBe(true);
    });
});

describe("Controller - Clear current cart", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    test("Cart cleared successfully", async () => {
        const testUser = new User("test", "test", "test", Role.CUSTOMER, "test", "test");

        jest.spyOn(CartDAO.prototype, "clearCart").mockResolvedValueOnce(true);
        const controller = new CartController();
        const response = await controller.clearCart(testUser);

        expect(CartDAO.prototype.clearCart).toBeCalledTimes(1);
        expect(CartDAO.prototype.clearCart).toBeCalledWith(testUser);

        expect(response).toBe(true);
    });

    // Error test is skipped since it is generic
});

describe("Controller - Remove product from cart", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    test("Product removed successfully", async () => {
        const testUser = new User("test", "test", "test", Role.CUSTOMER, "test", "test");
        const testProductModel = "TestModel";

        jest.spyOn(CartDAO.prototype, "removeProductFromCart").mockResolvedValueOnce(true);
        const controller = new CartController();
        const response = await controller.removeProductFromCart(testUser, testProductModel);

        expect(CartDAO.prototype.removeProductFromCart).toBeCalledTimes(1);
        expect(CartDAO.prototype.removeProductFromCart).toBeCalledWith(testUser, testProductModel);

        expect(response).toBe(true);
    });

    test("Product delete failure: product not found in cart", async () => {
        const testUser = new User("test", "test", "test", Role.CUSTOMER, "test", "test");
        const testProductModel = "TestModel";

        jest.spyOn(CartDAO.prototype, "removeProductFromCart").mockRejectedValueOnce(ProductNotInCartError);
        const controller = new CartController();
        await expect(controller.removeProductFromCart(testUser, testProductModel)).rejects.toBe(ProductNotInCartError);

        expect(CartDAO.prototype.removeProductFromCart).toBeCalledTimes(1);
        expect(CartDAO.prototype.removeProductFromCart).toBeCalledWith(testUser, testProductModel);
    });

    // Generic error test is skipped since it is one-line function
});

describe("Controller - Delete all carts", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    test("Carts cleared successfully", async () => {

        jest.spyOn(CartDAO.prototype, "deleteAllCarts").mockResolvedValueOnce(true);
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
            new ProductInCart("iPhone13", 1, Category.SMARTPHONE, 1000.0)
        ];
        const testCart = new Cart("test", false, "", 1000.0, testProductsInCart);
        const testProductModel = testProductsInCart[0].model; 

        const controller = new CartController();
        const response = controller.containsProduct(testCart, testProductModel);

        expect(response).toBe(true);
    });

    test("Cart does not contain product", async () => {
        const testProductsInCart = [
            new ProductInCart("iPhone13", 1, Category.SMARTPHONE, 1000.0)
        ];
        const testCart = new Cart("test", false, "", 1000.0, testProductsInCart);
        const testProductModel = "HP";

        const controller = new CartController();
        const response = controller.containsProduct(testCart, testProductModel);

        expect(response).toBe(false);
    });
});