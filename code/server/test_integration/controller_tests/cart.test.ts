import { test, expect, jest, describe, afterEach, beforeAll } from "@jest/globals"
import CartController from "../../src/controllers/cartController"
import UserController from "../../src/controllers/userController"
import ProductController from "../../src/controllers/productController"
import CartDAO from "../../src/dao/cartDAO"
import { Cart, ProductInCart } from "../../src/components/cart"
import { Category, Product } from "../../src/components/product"
import { Role, User } from "../../src/components/user"
import { CartNotFoundError, EmptyCartError, ProductNotInCartError } from "../../src/errors/cartError"
import { EmptyProductStockError, LowProductStockError, ProductNotFoundError } from "../../src/errors/productError"
import ProductDAO from "../../src/dao/productDAO"
import {cleanup} from "../../src/db/cleanup"
import dayjs from "dayjs"

describe("Controller tests", () => {
  	describe("Controller - Add product to cart", () => {
		let cartController: CartController;
		let userController: UserController;
		let productController: ProductController;

		beforeAll(async () => {
			cartController = new CartController();
			userController = new UserController();
			productController = new ProductController();

			await cleanup();
		})

		afterEach(async() => {
			await cleanup();
		});

		test("Add single product to cart successful", async () => {
			const testUser = new User("test", "test", "test", Role.CUSTOMER, "test", "test");
			const testNewProductInCart = new ProductInCart("Test",3,Category.APPLIANCE,100.0);
			const testCart = new Cart(testUser.username, false, "", 300, [testNewProductInCart]);

			// Setup
			await userController.createUser(testUser.username, testUser.name, testUser.surname, "test", testUser.role);
			await productController.registerProducts(testNewProductInCart.model, testNewProductInCart.category,testNewProductInCart.quantity + 1, "", testNewProductInCart.price, null);
			
			// Test
			const result = await cartController.addToCart(testUser, testNewProductInCart.model);

			// Check
			const currentCart = await cartController.getCart(testUser);

			expect(result).toBe(true);
			expect(currentCart).toStrictEqual(testCart);
		});

		test("Add multiple products to cart successful", async () => {
			const testUser = new User("test", "test", "test", Role.CUSTOMER, "test", "test");
			const testNewProductInCart1 = new ProductInCart("Test",3,Category.APPLIANCE,100.0);
			const testNewProductInCart2 = new ProductInCart("Test2",4,Category.APPLIANCE,200.0);
			const testCart = new Cart(testUser.username, false, "", 1100, [testNewProductInCart1, testNewProductInCart2]);
			
			// Setup
			await userController.createUser(testUser.username, testUser.name, testUser.surname, "test", testUser.role);
			await productController.registerProducts(testNewProductInCart1.model, testNewProductInCart1.category,testNewProductInCart1.quantity + 1, "", testNewProductInCart1.price, null);
			await productController.registerProducts(testNewProductInCart2.model, testNewProductInCart2.category,testNewProductInCart2.quantity + 1, "", testNewProductInCart2.price, null);

			// Test
			await cartController.addToCart(testUser, testNewProductInCart1.model);
			const result = await cartController.addToCart(testUser, testNewProductInCart2.model);

			// Check
			const currentCart = await cartController.getCart(testUser);

			expect(result).toBe(true);
			expect(currentCart).toStrictEqual(testCart);
		});

		test("Add multiple products multiple times to cart successful", async () => {
			const testUser = new User("test", "test", "test", Role.CUSTOMER, "test", "test");
			const testNewProductInCart1 = new ProductInCart("Test",3,Category.APPLIANCE,100.0);
			const testNewProductInCart2 = new ProductInCart("Test2",4,Category.APPLIANCE,200.0);
			const testCart = new Cart(testUser.username, false, "", 1100, [testNewProductInCart1, {...testNewProductInCart2, quantity: testNewProductInCart2.quantity * 2}]);

			// Setup
			await userController.createUser(testUser.username, testUser.name, testUser.surname, "test", testUser.role);
			await productController.registerProducts(testNewProductInCart1.model, testNewProductInCart1.category,testNewProductInCart1.quantity + 1, "", testNewProductInCart1.price, null);
			await productController.registerProducts(testNewProductInCart2.model, testNewProductInCart2.category,testNewProductInCart2.quantity + 1, "", testNewProductInCart2.price, null);

			// Test
			await cartController.addToCart(testUser, testNewProductInCart1.model);
			await cartController.addToCart(testUser, testNewProductInCart2.model);
			const result = await cartController.addToCart(testUser, testNewProductInCart2.model);

			// Check
			const currentCart = await cartController.getCart(testUser);

			expect(result).toBe(true);
			expect(currentCart).toStrictEqual(testCart);
		});

		test("Add single product to cart failed - Product absent in db", async () => {
			const testUser = new User("test", "test", "test", Role.CUSTOMER, "test", "test");
			const testNewProductInCart = new ProductInCart("Test",3,Category.APPLIANCE,100.0);

			// Setup
			await userController.createUser(testUser.username, testUser.name, testUser.surname, "test", testUser.role);
			
			// Test
			await expect(cartController.addToCart(testUser, testNewProductInCart.model)).rejects.toBeInstanceOf(ProductNotFoundError);
		});

		test("Add product to cart failed: new product present but not available", async () => {
			const testUser = new User("test", "test", "test", Role.CUSTOMER, "test", "test");
			const testNewProductInCart = new ProductInCart("Test",3,Category.APPLIANCE,100.0);

			// Setup
			await userController.createUser(testUser.username, testUser.name, testUser.surname, "test", testUser.role);
			await productController.registerProducts(testNewProductInCart.model, testNewProductInCart.category,0, "", testNewProductInCart.price, null);
			
			// Test
			await expect(cartController.addToCart(testUser, testNewProductInCart.model)).rejects.toBeInstanceOf(EmptyProductStockError);
		});
  	});

    describe("Controller - Get cart", () => {
		let cartController: CartController;
		let userController: UserController;
		let productController: ProductController;

		beforeAll(async () => {
			cartController = new CartController();
			userController = new UserController();
			productController = new ProductController();

			await cleanup();
		})

		afterEach(async() => {
			await cleanup();
		});

		test("Get current cart successful", async () => {
			const testUser = new User("test", "test", "test", Role.CUSTOMER, "test", "test");
			const testNewProductInCart = new ProductInCart("Test",3,Category.APPLIANCE,100.0);
			const testCart = new Cart(testUser.username, false, "", 300, [testNewProductInCart]);

			// Setup
			await userController.createUser(testUser.username, testUser.name, testUser.surname, "test", testUser.role);
			await productController.registerProducts(testNewProductInCart.model, testNewProductInCart.category,testNewProductInCart.quantity + 1, "", testNewProductInCart.price, null);
			await cartController.addToCart(testUser, testNewProductInCart.model);

			// Test
			const currentCart = await cartController.getCart(testUser);

			expect(currentCart).toStrictEqual(testCart);
		});

		test("Get current cart, if empty", async () => {
			const testUser = new User("test", "test", "test", Role.CUSTOMER, "test", "test");
			const testNewProductInCart = new ProductInCart("Test",3,Category.APPLIANCE,100.0);
			const testCart = new Cart(testUser.username, false, "", 0, []);

			// Setup
			await userController.createUser(testUser.username, testUser.name, testUser.surname, "test", testUser.role);
			await productController.registerProducts(testNewProductInCart.model, testNewProductInCart.category,testNewProductInCart.quantity + 1, "", testNewProductInCart.price, null);

			// Test
			const currentCart = await cartController.getCart(testUser);

			// Check
			expect(currentCart).toStrictEqual(testCart);
		});
    });

    describe("Controller - Checkout cart", () => {
		let cartController: CartController;
		let userController: UserController;
		let productController: ProductController;

		beforeAll(async () => {
			cartController = new CartController();
			userController = new UserController();
			productController = new ProductController();

			await cleanup();
		})

		afterEach(async() => {
			await cleanup();
		});

		test("Checkout successful", async () => {
			const testUser = new User("test", "test", "test", Role.CUSTOMER, "test", "test");
			const testNewProductInCart1 = new ProductInCart("Test1",3,Category.APPLIANCE,100.0);
			const testNewProductInCart2 = new ProductInCart("Test2",4,Category.APPLIANCE,200.0);
			const testCart = new Cart(testUser.username, true, dayjs().format("YYYY-MM-DD"), 1100, [
				testNewProductInCart1,
				testNewProductInCart2
			]);

			// Setup
			await userController.createUser(testUser.username, testUser.name, testUser.surname, "test", testUser.role);
			await productController.registerProducts(testNewProductInCart1.model, testNewProductInCart1.category,testNewProductInCart1.quantity + 1, "", testNewProductInCart1.price, null);
			await productController.registerProducts(testNewProductInCart2.model, testNewProductInCart2.category,testNewProductInCart2.quantity + 1, "", testNewProductInCart2.price, null);
			await cartController.addToCart(testUser, testNewProductInCart1.model);
			await cartController.addToCart(testUser, testNewProductInCart2.model);

			// Test
			const result = await cartController.checkoutCart(testUser);

			// Check
			const checkedOutCart = await cartController.getCart(testUser);
			const quantity1 = await productController.productByModel(testNewProductInCart1.model);
			const quantity2 = await productController.productByModel(testNewProductInCart2.model);

			expect(result).toBe(true);
			expect(checkedOutCart).toStrictEqual(testCart);
			expect(quantity1).toBe(1);
			expect(quantity2).toBe(1);
		});

		test("Checkout failed - No unpaid cart in database", async () => {
			const testUser = new User("test", "test", "test", Role.CUSTOMER, "test", "test");

			// Setup
			await userController.createUser(testUser.username, testUser.name, testUser.surname, "test", testUser.role);

			// Test
			await expect(cartController.checkoutCart(testUser)).rejects.toBeInstanceOf(EmptyCartError);
		});

		test("Checkout failed - Unpaid cart present, all product present in stock, but at least one whose quantity is higher than available", async () => {
			const testUser = new User("test", "test", "test", Role.CUSTOMER, "test", "test");
			const testNewProductInCart1 = new ProductInCart("Test1",3,Category.APPLIANCE,100.0);
			const testNewProductInCart2 = new ProductInCart("Test2",4,Category.APPLIANCE,200.0);

			// Setup
			await userController.createUser(testUser.username, testUser.name, testUser.surname, "test", testUser.role);
			await productController.registerProducts(testNewProductInCart1.model, testNewProductInCart1.category,testNewProductInCart1.quantity - 1, "", testNewProductInCart1.price, null);
			await productController.registerProducts(testNewProductInCart2.model, testNewProductInCart2.category,testNewProductInCart2.quantity + 1, "", testNewProductInCart2.price, null);
			await cartController.addToCart(testUser, testNewProductInCart1.model);
			await cartController.addToCart(testUser, testNewProductInCart2.model);

			// Test
			await expect(cartController.checkoutCart(testUser)).rejects.toBeInstanceOf(LowProductStockError);

			// Check
			const quantity1 = await productController.productByModel(testNewProductInCart1.model);
			const quantity2 = await productController.productByModel(testNewProductInCart2.model);
			expect(quantity1).toBe(testNewProductInCart1.quantity-1);
			expect(quantity2).toBe(testNewProductInCart2.quantity+1);
		});

		test("Checkout failed - Unpaid cart present, but at least a product with empty stock", async () => {
			const testUser = new User("test", "test", "test", Role.CUSTOMER, "test", "test");
			const testNewProductInCart1 = new ProductInCart("Test",3,Category.APPLIANCE,100.0);
			const testNewProductInCart2 = new ProductInCart("Test2",4,Category.APPLIANCE,200.0);
			const testCart = new Cart(testUser.username, true, dayjs().format("YYYY-MM-DD"), 1100, [
				testNewProductInCart1,
				testNewProductInCart2
			]);

			// Setup
			await userController.createUser(testUser.username, testUser.name, testUser.surname, "test", testUser.role);
			await productController.registerProducts(testNewProductInCart1.model, testNewProductInCart1.category,0, "", testNewProductInCart1.price, null);
			await productController.registerProducts(testNewProductInCart2.model, testNewProductInCart2.category,testNewProductInCart2.quantity + 1, "", testNewProductInCart2.price, null);
			await cartController.addToCart(testUser, testNewProductInCart1.model);
			await cartController.addToCart(testUser, testNewProductInCart2.model);

			// Test
			await expect(cartController.checkoutCart(testUser)).rejects.toBeInstanceOf(EmptyProductStockError);

			// Check
			const quantity1 = await productController.productByModel(testNewProductInCart1.model);
			const quantity2 = await productController.productByModel(testNewProductInCart2.model);
			expect(quantity1).toBe(0);
			expect(quantity2).toBe(testNewProductInCart2.quantity+1);
		});
    });

    describe("Controller - Clear current cart", () => {
		let cartController: CartController;
		let userController: UserController;
		let productController: ProductController;

		beforeAll(async() => {
			cartController = new CartController();
			userController = new UserController();
			productController = new ProductController();

			await cleanup();
		});

		afterEach(async () => {
			await cleanup();
		});

		test("Cart cleared successfully", async () => {
			const testUser = new User("test", "test", "test", Role.CUSTOMER, "test", "test");
			const testNewProductInCart1 = new ProductInCart("Test",3,Category.APPLIANCE,100.0);
			const testNewProductInCart2 = new ProductInCart("Test2",4,Category.APPLIANCE,200.0);
			const testCart = new Cart(testUser.username, false, "", 0, []);

			// Setup
			await userController.createUser(testUser.username, testUser.name, testUser.surname, "test", testUser.role);
			await productController.registerProducts(testNewProductInCart1.model, testNewProductInCart1.category,testNewProductInCart1.quantity + 1, "", testNewProductInCart1.price, null);
			await productController.registerProducts(testNewProductInCart2.model, testNewProductInCart2.category,testNewProductInCart2.quantity + 1, "", testNewProductInCart2.price, null);
			await cartController.addToCart(testUser, testNewProductInCart1.model);
			await cartController.addToCart(testUser, testNewProductInCart2.model);
			await cartController.addToCart(testUser, testNewProductInCart2.model);

			// Test
			const result = await cartController.clearCart(testUser);

			// Check
			const currentCart = await cartController.getCart(testUser);

			expect(result).toBe(true);
			expect(currentCart).toBe(testCart);
		});

		test("Cart cleared successfully - Empty cart", async () => {
			const testUser = new User("test", "test", "test", Role.CUSTOMER, "test", "test");
			const testCart = new Cart(testUser.username, false, "", 0, []);

			// Setup
			await userController.createUser(testUser.username, testUser.name, testUser.surname, "test", testUser.role);
			// Test
			const result = await cartController.clearCart(testUser);

			// Check
			const currentCart = await cartController.getCart(testUser);

			expect(result).toBe(true);
			expect(currentCart).toBe(testCart);
		});

		test("Cart cleared successfully - No unpaid cart", async () => {
			const testUser = new User("test", "test", "test", Role.CUSTOMER, "test", "test");
			const testNewProductInCart1 = new ProductInCart("Test",3,Category.APPLIANCE,100.0);
			const testNewProductInCart2 = new ProductInCart("Test2",4,Category.APPLIANCE,200.0);
			const testCart = new Cart(testUser.username, false, "", 0, []);

			// Setup
			await userController.createUser(testUser.username, testUser.name, testUser.surname, "test", testUser.role);
			await productController.registerProducts(testNewProductInCart1.model, testNewProductInCart1.category,testNewProductInCart1.quantity + 1, "", testNewProductInCart1.price, null);
			await productController.registerProducts(testNewProductInCart2.model, testNewProductInCart2.category,testNewProductInCart2.quantity + 1, "", testNewProductInCart2.price, null);
			await cartController.addToCart(testUser, testNewProductInCart1.model);
			await cartController.addToCart(testUser, testNewProductInCart2.model);
			await cartController.addToCart(testUser, testNewProductInCart2.model);
			await cartController.checkoutCart(testUser);

			// Test
			const result = await cartController.clearCart(testUser);

			// Check
			const currentCart = await cartController.getCart(testUser);

			expect(result).toBe(true);
			expect(currentCart).toBe(testCart);
		});
    });

    describe("Controller - Remove product from cart", () => {
		let cartController: CartController;
		let userController: UserController;
		let productController: ProductController;

		beforeAll(async() => {
			cartController = new CartController();
			userController = new UserController();
			productController = new ProductController();

			await cleanup();
		});

		afterEach(async () => {
			await cleanup();
		});

		test("Product removed successfully", async () => {
			const testUser = new User("test", "test", "test", Role.CUSTOMER, "test", "test");
			const testNewProductInCart1 = new ProductInCart("Test",3,Category.APPLIANCE,100.0);
			const testNewProductInCart2 = new ProductInCart("Test2",4,Category.APPLIANCE,200.0);
			const testCart = new Cart(testUser.username, true, dayjs().format("YYYY-MM-DD"), 1100, [
				testNewProductInCart1,
				{...testNewProductInCart2, quantity: testNewProductInCart2.quantity-1}
			]);

			// Setup
			await userController.createUser(testUser.username, testUser.name, testUser.surname, "test", testUser.role);
			await productController.registerProducts(testNewProductInCart1.model, testNewProductInCart1.category,testNewProductInCart1.quantity + 1, "", testNewProductInCart1.price, null);
			await productController.registerProducts(testNewProductInCart2.model, testNewProductInCart2.category,testNewProductInCart2.quantity + 1, "", testNewProductInCart2.price, null);
			await cartController.addToCart(testUser, testNewProductInCart1.model);
			await cartController.addToCart(testUser, testNewProductInCart2.model);

			// Test
			const result = await cartController.removeProductFromCart(testUser, testNewProductInCart2.model);

			// Check
			const currentCart = await cartController.getCart(testUser);

			expect(result).toBe(true);
			expect(currentCart).toStrictEqual(testCart);
		});

		test("Product delete failure: product not found in cart", async () => {
			const testUser = new User("test", "test", "test", Role.CUSTOMER, "test", "test");
			const testNewProductInCart1 = new ProductInCart("Test",3,Category.APPLIANCE,100.0);
			const testNewProductInCart2 = new ProductInCart("Test2",4,Category.APPLIANCE,200.0);
			const testCart = new Cart(testUser.username, true, dayjs().format("YYYY-MM-DD"), 1100, [
				testNewProductInCart1,
				{...testNewProductInCart2, quantity: testNewProductInCart2.quantity-1}
			]);

			// Setup
			await userController.createUser(testUser.username, testUser.name, testUser.surname, "test", testUser.role);
			await productController.registerProducts(testNewProductInCart1.model, testNewProductInCart1.category,testNewProductInCart1.quantity + 1, "", testNewProductInCart1.price, null);
			await productController.registerProducts(testNewProductInCart2.model, testNewProductInCart2.category,testNewProductInCart2.quantity + 1, "", testNewProductInCart2.price, null);
			await cartController.addToCart(testUser, testNewProductInCart1.model);

			// Test
			await expect(cartController.removeProductFromCart(testUser, testNewProductInCart2.model)).rejects.toBeInstanceOf(ProductNotInCartError);
		});
    });

	describe("Controller - Get all customer carts", () => {
        let cartController: CartController;
		let userController: UserController;
		let productController: ProductController;

		beforeAll(async () => {
			cartController = new CartController();
			userController = new UserController();
			productController = new ProductController();

			await cleanup();
		})

		afterEach(async() => {
			await cleanup();
		});

		test("Get customer carts successful", async () => {
			const testUser = new User("test", "test", "test", Role.CUSTOMER, "test", "test");
			const testProductsInCart1 = [
				new ProductInCart("Test1C1",3,Category.APPLIANCE,100.0),
				new ProductInCart("Test2C1",4,Category.APPLIANCE,200.0)
			];
			const testProductsInCart2 = [
				new ProductInCart("Test1C2",2,Category.LAPTOP,50.0),
				new ProductInCart("Test2C2",5,Category.APPLIANCE,300.0)
			];
			const testProductsInCart3 = [
				new ProductInCart("Test1C3",3,Category.APPLIANCE,500.0),
				new ProductInCart("Test2C3",7,Category.SMARTPHONE,100.0)
			];
			const testCarts = [
				new Cart(testUser.username, true, dayjs().format("YYYY-MM-DD"), 1100, testProductsInCart1),
				new Cart(testUser.username, true, dayjs().format("YYYY-MM-DD"), 1600, testProductsInCart2)
			];

			// Setup
			await userController.createUser(testUser.username, testUser.name, testUser.surname, "test", testUser.role);

			for (let prod of testProductsInCart1) {
				await productController.registerProducts(prod.model, prod.category,prod.quantity + 1, "", prod.price, null);
				await cartController.addToCart(testUser, prod.model);
				await cartController.addToCart(testUser, prod.model);
			}
			await cartController.checkoutCart(testUser);

			for (let prod of testProductsInCart2) {
				await productController.registerProducts(prod.model, prod.category,prod.quantity + 1, "", prod.price, null);
				await cartController.addToCart(testUser, prod.model);
				await cartController.addToCart(testUser, prod.model);
			}
			await cartController.checkoutCart(testUser);

			for (let prod of testProductsInCart3) {
				await productController.registerProducts(prod.model, prod.category,prod.quantity + 1, "", prod.price, null);
				await cartController.addToCart(testUser, prod.model);
				await cartController.addToCart(testUser, prod.model);
			}

			// Test
			const customerPaidCarts = await cartController.getCustomerCarts(testUser);

			// Get
			expect(customerPaidCarts).toStrictEqual(testCarts);
		});

        test("Get customer carts successful, still no carts paid", async () => {
			const testUser = new User("test", "test", "test", Role.CUSTOMER, "test", "test");
			const testProductsInCart1 = [
				new ProductInCart("Test1C1",3,Category.APPLIANCE,100.0),
				new ProductInCart("Test2C1",4,Category.APPLIANCE,200.0)
			];
			const testCarts: Cart[] = [];

			// Setup
			await userController.createUser(testUser.username, testUser.name, testUser.surname, "test", testUser.role);

			for (let prod of testProductsInCart1) {
				await productController.registerProducts(prod.model, prod.category,prod.quantity + 1, "", prod.price, null);
				await cartController.addToCart(testUser, prod.model);
				await cartController.addToCart(testUser, prod.model);
			}

			// Test
			const customerPaidCarts = await cartController.getCustomerCarts(testUser);

			// Get
			expect(customerPaidCarts).toStrictEqual(testCarts);
        });
    });

    describe("Controller - Get all carts", () => {
		let cartController: CartController;
		let userController: UserController;
		let productController: ProductController;

		beforeAll(async () => {
			cartController = new CartController();
			userController = new UserController();
			productController = new ProductController();

			await cleanup();
		})

		afterEach(async() => {
			await cleanup();
		});

		test("Get all carts successful", async () => {
			const testUser1 = new User("test1", "test", "test", Role.CUSTOMER, "test", "test");
			const testUser2 = new User("test2", "test", "test", Role.CUSTOMER, "test", "test")
			const testProductsInCart1 = [
				new ProductInCart("Test1C1",3,Category.APPLIANCE,100.0),
				new ProductInCart("Test2C1",4,Category.APPLIANCE,200.0)
			];
			const testProductsInCart2 = [
				new ProductInCart("Test1C2",2,Category.LAPTOP,50.0),
				new ProductInCart("Test2C2",5,Category.APPLIANCE,300.0)
			];
			const testProductsInCart3 = [
				new ProductInCart("Test1C3",3,Category.APPLIANCE,500.0),
				new ProductInCart("Test2C3",7,Category.SMARTPHONE,100.0)
			];
			const testCarts = [
				new Cart(testUser1.username, true, dayjs().format("YYYY-MM-DD"), 1100, testProductsInCart1),
				new Cart(testUser1.username, false, "", 1600, testProductsInCart2),
				new Cart(testUser2.username, true, dayjs().format("YYYY-MM-DD"), 2200, testProductsInCart3)
			];

			// Setup
			await userController.createUser(testUser1.username, testUser1.name, testUser1.surname, "test", testUser1.role);
			await userController.createUser(testUser2.username, testUser2.name, testUser2.surname, "test", testUser2.role);

			for (let prod of testProductsInCart1) {
				await productController.registerProducts(prod.model, prod.category,prod.quantity + 1, "", prod.price, null);
				await cartController.addToCart(testUser1, prod.model);
				await cartController.addToCart(testUser1, prod.model);
			}
			await cartController.checkoutCart(testUser1);

			for (let prod of testProductsInCart2) {
				await productController.registerProducts(prod.model, prod.category,prod.quantity + 1, "", prod.price, null);
				await cartController.addToCart(testUser1, prod.model);
				await cartController.addToCart(testUser1, prod.model);
			}

			for (let prod of testProductsInCart3) {
				await productController.registerProducts(prod.model, prod.category,prod.quantity + 1, "", prod.price, null);
				await cartController.addToCart(testUser2, prod.model);
				await cartController.addToCart(testUser2, prod.model);
			}
			await cartController.checkoutCart(testUser2);

			// Test
			const customerPaidCarts = await cartController.getAllCarts();

			// Check
			expect(customerPaidCarts).toStrictEqual(testCarts);
		});

		test("Get all carts successful: no carts", async () => {
			const testCarts: Cart[] = [];

			// Test
			const customerPaidCarts = await cartController.getAllCarts();

			// Check
			expect(customerPaidCarts).toStrictEqual(testCarts);
		});
    });

    describe("Controller - Delete all carts", () => {
		let cartController: CartController;
		let userController: UserController;
		let productController: ProductController;

		beforeAll(async () => {
			cartController = new CartController();
			userController = new UserController();
			productController = new ProductController();

			await cleanup();
		})

		afterEach(async() => {
			await cleanup();
		});

		test("Delete all carts successful", async () => {
			const testUser1 = new User("test1", "test", "test", Role.CUSTOMER, "test", "test");
			const testUser2 = new User("test2", "test", "test", Role.CUSTOMER, "test", "test")
			const testProductsInCart1 = [
				new ProductInCart("Test1C1",3,Category.APPLIANCE,100.0),
				new ProductInCart("Test2C1",4,Category.APPLIANCE,200.0)
			];
			const testProductsInCart2 = [
				new ProductInCart("Test1C2",2,Category.LAPTOP,50.0),
				new ProductInCart("Test2C2",5,Category.APPLIANCE,300.0)
			];
			const testProductsInCart3 = [
				new ProductInCart("Test1C3",3,Category.APPLIANCE,500.0),
				new ProductInCart("Test2C3",7,Category.SMARTPHONE,100.0)
			];
			const testCarts: Cart[] = [];

			// Setup
			await userController.createUser(testUser1.username, testUser1.name, testUser1.surname, "test", testUser1.role);
			await userController.createUser(testUser2.username, testUser2.name, testUser2.surname, "test", testUser2.role);

			for (let prod of testProductsInCart1) {
				await productController.registerProducts(prod.model, prod.category,prod.quantity + 1, "", prod.price, null);
				await cartController.addToCart(testUser1, prod.model);
				await cartController.addToCart(testUser1, prod.model);
			}
			await cartController.checkoutCart(testUser1);

			for (let prod of testProductsInCart2) {
				await productController.registerProducts(prod.model, prod.category,prod.quantity + 1, "", prod.price, null);
				await cartController.addToCart(testUser1, prod.model);
				await cartController.addToCart(testUser1, prod.model);
			}

			for (let prod of testProductsInCart3) {
				await productController.registerProducts(prod.model, prod.category,prod.quantity + 1, "", prod.price, null);
				await cartController.addToCart(testUser2, prod.model);
				await cartController.addToCart(testUser2, prod.model);
			}
			await cartController.checkoutCart(testUser2);

			// Test
			const result = await cartController.deleteAllCarts();

			// Check
			const customerPaidCarts = await cartController.getAllCarts();

			expect(result).toBe(true);
			expect(customerPaidCarts).toStrictEqual(customerPaidCarts);
		});

		test("Delete all carts successful: no carts", async () => {
			const testCarts: Cart[] = [];

			// Test
			const result = await cartController.deleteAllCarts();

			// Check
			const customerPaidCarts = await cartController.getAllCarts();

			expect(result).toBe(true);
			expect(customerPaidCarts).toStrictEqual(testCarts);
		});
    });
});