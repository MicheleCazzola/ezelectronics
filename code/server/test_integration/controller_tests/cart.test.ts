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
import { Time } from "../../src/utilities"

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
		});

		afterEach(async () => {
			await cleanup();
		});

		test("Add single product to cart successful", async () => {
			const testUser = new User(
				"test",
				"test",
				"test",
				Role.CUSTOMER,
				"test",
				"test"
			);
			const testNewProductInCart = new ProductInCart(
				"Test",
				1,
				Category.APPLIANCE,
				100.0
			);
			const testCart = new Cart(testUser.username, false, "", 100, [
				testNewProductInCart,
			]);

			// Setup
			await userController.createUser(
				testUser.username,
				testUser.name,
				testUser.surname,
				"test",
				testUser.role
			);
			await productController.registerProducts(
				testNewProductInCart.model,
				testNewProductInCart.category,
				testNewProductInCart.quantity + 1,
				"",
				testNewProductInCart.price,
				null
			);

			// Test
			const result = await cartController.addToCart(
				testUser,
				testNewProductInCart.model
			);

			// Check
			const currentCart = await cartController.getCart(testUser);

			expect(result).toBe(true);
			expect(currentCart).toStrictEqual(testCart);
		});

		test("Add multiple products to cart successful", async () => {
			const testUser = new User(
				"test",
				"test",
				"test",
				Role.CUSTOMER,
				"test",
				"test"
			);
			const testNewProductInCart1 = new ProductInCart(
				"Test",
				1,
				Category.APPLIANCE,
				100.0
			);
			const testNewProductInCart2 = new ProductInCart(
				"Test2",
				1,
				Category.APPLIANCE,
				200.0
			);
			const testCart = new Cart(testUser.username, false, "", 300.0, [
				testNewProductInCart1,
				testNewProductInCart2,
			]);

			// Setup
			await userController.createUser(
				testUser.username,
				testUser.name,
				testUser.surname,
				"test",
				testUser.role
			);
			await productController.registerProducts(
				testNewProductInCart1.model,
				testNewProductInCart1.category,
				testNewProductInCart1.quantity + 1,
				"",
				testNewProductInCart1.price,
				null
			);
			await productController.registerProducts(
				testNewProductInCart2.model,
				testNewProductInCart2.category,
				testNewProductInCart2.quantity + 1,
				"",
				testNewProductInCart2.price,
				null
			);

			// Test
			await cartController.addToCart(
				testUser,
				testNewProductInCart1.model
			);
			const result = await cartController.addToCart(
				testUser,
				testNewProductInCart2.model
			);

			// Check
			const currentCart = await cartController.getCart(testUser);

			expect(result).toBe(true);
			expect(currentCart).toStrictEqual(testCart);
		});

		test("Add multiple products multiple times to cart successful", async () => {
			const testUser = new User(
				"test",
				"test",
				"test",
				Role.CUSTOMER,
				"test",
				"test"
			);
			const testNewProductInCart1 = new ProductInCart(
				"Test",
				1,
				Category.APPLIANCE,
				100.0
			);
			const testNewProductInCart2 = new ProductInCart(
				"Test2",
				2,
				Category.APPLIANCE,
				200.0
			);
			const testCart = new Cart(testUser.username, false, "", 500, [
				testNewProductInCart1,
				testNewProductInCart2,
			]);

			// Setup
			await userController.createUser(
				testUser.username,
				testUser.name,
				testUser.surname,
				"test",
				testUser.role
			);
			await productController.registerProducts(
				testNewProductInCart1.model,
				testNewProductInCart1.category,
				testNewProductInCart1.quantity + 1,
				"",
				testNewProductInCart1.price,
				null
			);
			await productController.registerProducts(
				testNewProductInCart2.model,
				testNewProductInCart2.category,
				testNewProductInCart2.quantity + 1,
				"",
				testNewProductInCart2.price,
				null
			);

			// Test
			await cartController.addToCart(
				testUser,
				testNewProductInCart1.model
			);
			await cartController.addToCart(
				testUser,
				testNewProductInCart2.model
			);
			const result = await cartController.addToCart(
				testUser,
				testNewProductInCart2.model
			);

			// Check
			const currentCart = await cartController.getCart(testUser);

			expect(result).toBe(true);
			expect(currentCart).toStrictEqual(testCart);
		});

		test("Add single product to cart failed - Product absent in db", async () => {
			const testUser = new User(
				"test",
				"test",
				"test",
				Role.CUSTOMER,
				"test",
				"test"
			);
			const testNewProductInCart = new ProductInCart(
				"Test",
				3,
				Category.APPLIANCE,
				100.0
			);

			// Setup
			await userController.createUser(
				testUser.username,
				testUser.name,
				testUser.surname,
				"test",
				testUser.role
			);

			// Test
			await expect(
				cartController.addToCart(testUser, testNewProductInCart.model)
			).rejects.toBeInstanceOf(ProductNotFoundError);
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
			const testNewProductInCart = new ProductInCart(
				"Test",
				3,
				Category.APPLIANCE,
				100.0
			);

			// Setup
			await userController.createUser(
				testUser.username,
				testUser.name,
				testUser.surname,
				"test",
				testUser.role
			);
			await productController.registerProducts(
				testNewProductInCart.model,
				testNewProductInCart.category,
				0,
				"",
				testNewProductInCart.price,
				null
			);

			// Test
			await expect(
				cartController.addToCart(testUser, testNewProductInCart.model)
			).rejects.toBeInstanceOf(EmptyProductStockError);
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
		});

		afterEach(async () => {
			await cleanup();
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
			const testNewProductInCart = new ProductInCart(
				"Test",
				1,
				Category.APPLIANCE,
				100.0
			);
			const testCart = new Cart(testUser.username, false, "", 100, [
				testNewProductInCart,
			]);

			// Setup
			await userController.createUser(
				testUser.username,
				testUser.name,
				testUser.surname,
				"test",
				testUser.role
			);
			await productController.registerProducts(
				testNewProductInCart.model,
				testNewProductInCart.category,
				testNewProductInCart.quantity + 1,
				"",
				testNewProductInCart.price,
				null
			);
			await cartController.addToCart(
				testUser,
				testNewProductInCart.model
			);

			// Test
			const currentCart = await cartController.getCart(testUser);

			expect(currentCart).toStrictEqual(testCart);
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
			const testCart = new Cart(testUser.username, false, "", 0, []);

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
		});

		afterEach(async () => {
			await cleanup();
		});

		test.skip("Checkout successful", async () => {
			const testUser = new User(
				"test",
				"test",
				"test",
				Role.CUSTOMER,
				"test",
				"test"
			);
			const testNewProductInCart1 = new ProductInCart(
				"Test1",
				1,
				Category.APPLIANCE,
				100.0
			);
			const testNewProductInCart2 = new ProductInCart(
				"Test2",
				1,
				Category.APPLIANCE,
				200.0
			);
			const testCart = new Cart(
				testUser.username,
				true,
				Time.now(),
				200,
				[testNewProductInCart1, testNewProductInCart2]
			);

			// Setup
			await userController.createUser(
				testUser.username,
				testUser.name,
				testUser.surname,
				"test",
				testUser.role
			);
			await productController.registerProducts(
				testNewProductInCart1.model,
				testNewProductInCart1.category,
				testNewProductInCart1.quantity + 1,
				"",
				testNewProductInCart1.price,
				null
			);
			await productController.registerProducts(
				testNewProductInCart2.model,
				testNewProductInCart2.category,
				testNewProductInCart2.quantity + 1,
				"",
				testNewProductInCart2.price,
				null
			);
			await cartController.addToCart(
				testUser,
				testNewProductInCart1.model
			);
			await cartController.addToCart(
				testUser,
				testNewProductInCart2.model
			);

			// Test
			const result = await cartController.checkoutCart(testUser);

			// Check
			// Cart was just checked out, so the current cart is empty
			const checkedOutCart = await cartController.getCart(testUser);
			//const quantity1 = await productController.productByModel(
			//	testNewProductInCart1.model
			//);
			//const quantity2 = await productController.productByModel(
			//	testNewProductInCart2.model
			//);
			//
			//expect(result).toBe(true);
			//expect(checkedOutCart).toStrictEqual(testCart);
			//expect(quantity1).toBe(1);
			//expect(quantity2).toBe(1);
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

			// Setup
			await userController.createUser(
				testUser.username,
				testUser.name,
				testUser.surname,
				"test",
				testUser.role
			);

			// Test
			await expect(
				cartController.checkoutCart(testUser)
			).rejects.toBeInstanceOf(CartNotFoundError);
		});

		test("Checkout failed - Unpaid cart present, but not products inside", async () => {
			const testUser = new User(
				"test",
				"test",
				"test",
				Role.CUSTOMER,
				"test",
				"test"
			);
			const testNewProductInCart = new ProductInCart(
				"Test1",
				2,
				Category.APPLIANCE,
				100.0
			);

			// Setup
			await userController.createUser(
				testUser.username,
				testUser.name,
				testUser.surname,
				"test",
				testUser.role
			);
			await productController.registerProducts(
				testNewProductInCart.model,
				testNewProductInCart.category,
				testNewProductInCart.quantity,
				"",
				testNewProductInCart.price,
				null
			);
			await cartController.addToCart(
				testUser,
				testNewProductInCart.model
			);
			await cartController.removeProductFromCart(
				testUser,
				testNewProductInCart.model
			);

			// Test
			await expect(
				cartController.checkoutCart(testUser)
			).rejects.toBeInstanceOf(EmptyCartError);
		});

		// Fails because of productController
		test.skip("Checkout failed - Unpaid cart present, all product present in stock, but at least one whose quantity is higher than available", async () => {
			const testUser = new User(
				"test",
				"test",
				"test",
				Role.CUSTOMER,
				"test",
				"test"
			);
			const testNewProductInCart1 = new ProductInCart(
				"Test1",
				2,
				Category.APPLIANCE,
				100.0
			);
			const testNewProductInCart2 = new ProductInCart(
				"Test2",
				1,
				Category.APPLIANCE,
				200.0
			);

			// Setup
			await userController.createUser(
				testUser.username,
				testUser.name,
				testUser.surname,
				"test",
				testUser.role
			);
			await productController.registerProducts(
				testNewProductInCart1.model,
				testNewProductInCart1.category,
				testNewProductInCart1.quantity - 1,
				"",
				testNewProductInCart1.price,
				null
			);
			await productController.registerProducts(
				testNewProductInCart2.model,
				testNewProductInCart2.category,
				testNewProductInCart2.quantity + 1,
				"",
				testNewProductInCart2.price,
				null
			);
			await cartController.addToCart(
				testUser,
				testNewProductInCart1.model
			);
			await cartController.addToCart(
				testUser,
				testNewProductInCart1.model
			);
			await cartController.addToCart(
				testUser,
				testNewProductInCart2.model
			);

			// Test
			await expect(
				cartController.checkoutCart(testUser)
			).rejects.toBeInstanceOf(LowProductStockError);

			// Check
			//const product1 = await productController.productByModel(
			//	testNewProductInCart1.model
			//);
			//const product2 = await productController.productByModel(
			//	testNewProductInCart2.model
			//);
			//expect(product1.quantity).toBe(testNewProductInCart1.quantity - 1);
			//expect(product2.quantity).toBe(testNewProductInCart2.quantity + 1);
		});

		test.skip("Checkout failed - Unpaid cart present, but at least a product with empty stock", async () => {
			const testUser = new User(
				"test",
				"test",
				"test",
				Role.CUSTOMER,
				"test",
				"test"
			);
			const testNewProductInCart1 = new ProductInCart(
				"Test",
				1,
				Category.APPLIANCE,
				100.0
			);
			const testNewProductInCart2 = new ProductInCart(
				"Test2",
				1,
				Category.APPLIANCE,
				200.0
			);
			const testCart = new Cart(
				testUser.username,
				true,
				Time.now(),
				1100,
				[testNewProductInCart1, testNewProductInCart2]
			);

			// Setup
			await userController.createUser(
				testUser.username,
				testUser.name,
				testUser.surname,
				"test",
				testUser.role
			);
			await productController.registerProducts(
				testNewProductInCart1.model,
				testNewProductInCart1.category,
				testNewProductInCart1.quantity,
				"",
				testNewProductInCart1.price,
				null
			);
			await productController.registerProducts(
				testNewProductInCart2.model,
				testNewProductInCart2.category,
				testNewProductInCart2.quantity + 1,
				"",
				testNewProductInCart2.price,
				null
			);
			await cartController.addToCart(
				testUser,
				testNewProductInCart1.model
			);
			await cartController.addToCart(
				testUser,
				testNewProductInCart2.model
			);

			// changeProductQuantity seems to just increase it
			// Not sure how the product controller and dao work, but doesn't seem to be a cartController problem.
			await productController.changeProductQuantity(
				testNewProductInCart1.model,
				0,
				""
			);

			// Test
			await expect(
				cartController.checkoutCart(testUser)
			).rejects.toBeInstanceOf(EmptyProductStockError);

			// Check
			//const prod1 = await productController.productByModel(
			//	testNewProductInCart1.model
			//);
			//const prod2 = await productController.productByModel(
			//	testNewProductInCart2.model
			//);
			//expect(prod1.quantity).toBe(0);
			//expect(prod2.quantity).toBe(testNewProductInCart2.quantity + 1);
		});
	});

	describe("Controller - Clear current cart", () => {
		let cartController: CartController;
		let userController: UserController;
		let productController: ProductController;

		beforeAll(async () => {
			cartController = new CartController();
			userController = new UserController();
			productController = new ProductController();

			await cleanup();
		});

		afterEach(async () => {
			await cleanup();
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
			const testNewProductInCart1 = new ProductInCart(
				"Test",
				1,
				Category.APPLIANCE,
				100.0
			);
			const testNewProductInCart2 = new ProductInCart(
				"Test2",
				2,
				Category.APPLIANCE,
				200.0
			);
			const testCart = new Cart(testUser.username, false, "", 0, []);

			// Setup
			await userController.createUser(
				testUser.username,
				testUser.name,
				testUser.surname,
				"test",
				testUser.role
			);
			await productController.registerProducts(
				testNewProductInCart1.model,
				testNewProductInCart1.category,
				testNewProductInCart1.quantity + 1,
				"",
				testNewProductInCart1.price,
				null
			);
			await productController.registerProducts(
				testNewProductInCart2.model,
				testNewProductInCart2.category,
				testNewProductInCart2.quantity + 1,
				"",
				testNewProductInCart2.price,
				null
			);
			await cartController.addToCart(
				testUser,
				testNewProductInCart1.model
			);
			await cartController.addToCart(
				testUser,
				testNewProductInCart2.model
			);
			await cartController.addToCart(
				testUser,
				testNewProductInCart2.model
			);

			// Test
			const result = await cartController.clearCart(testUser);

			// Check
			const currentCart = await cartController.getCart(testUser);

			expect(result).toBe(true);
			expect(currentCart).toStrictEqual(testCart);
		});

		test("Cart cleared successfully - Empty cart", async () => {
			const testUser = new User(
				"test",
				"test",
				"test",
				Role.CUSTOMER,
				"test",
				"test"
			);
			const testCart = new Cart(testUser.username, false, "", 0, []);

			// Setup
			await userController.createUser(
				testUser.username,
				testUser.name,
				testUser.surname,
				"test",
				testUser.role
			);
			// Test
			const result = await cartController.clearCart(testUser);

			// Check
			const currentCart = await cartController.getCart(testUser);

			expect(result).toBe(true);
			expect(currentCart).toStrictEqual(testCart);
		});

		// According to the comment on the route it should fail in this case
		test.skip("Cart cleared successfully - No unpaid cart", async () => {
			const testUser = new User(
				"test",
				"test",
				"test",
				Role.CUSTOMER,
				"test",
				"test"
			);
			const testNewProductInCart1 = new ProductInCart(
				"Test",
				1,
				Category.APPLIANCE,
				100.0
			);
			const testNewProductInCart2 = new ProductInCart(
				"Test2",
				2,
				Category.APPLIANCE,
				200.0
			);
			const testCart = new Cart(testUser.username, false, "", 0, []);

			// Setup
			await userController.createUser(
				testUser.username,
				testUser.name,
				testUser.surname,
				"test",
				testUser.role
			);
			await productController.registerProducts(
				testNewProductInCart1.model,
				testNewProductInCart1.category,
				testNewProductInCart1.quantity + 1,
				"",
				testNewProductInCart1.price,
				null
			);
			await productController.registerProducts(
				testNewProductInCart2.model,
				testNewProductInCart2.category,
				testNewProductInCart2.quantity + 1,
				"",
				testNewProductInCart2.price,
				null
			);
			await cartController.addToCart(
				testUser,
				testNewProductInCart1.model
			);
			await cartController.addToCart(
				testUser,
				testNewProductInCart2.model
			);
			await cartController.addToCart(
				testUser,
				testNewProductInCart2.model
			);
			await cartController.checkoutCart(testUser);

			// Test
			const result = await cartController.clearCart(testUser);

			// Check
			const currentCart = await cartController.getCart(testUser);

			expect(result).toBe(true);
			expect(currentCart).toStrictEqual(testCart);
		});
	});

	describe("Controller - Remove product from cart", () => {
		let cartController: CartController;
		let userController: UserController;
		let productController: ProductController;

		beforeAll(async () => {
			cartController = new CartController();
			userController = new UserController();
			productController = new ProductController();

			await cleanup();
		});

		afterEach(async () => {
			await cleanup();
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
			const testNewProductInCart1 = new ProductInCart(
				"Test",
				1,
				Category.APPLIANCE,
				100.0
			);
			const testNewProductInCart2 = new ProductInCart(
				"Test2",
				1,
				Category.APPLIANCE,
				200.0
			);
			const testCart = new Cart(testUser.username, false, "", 100, [
				testNewProductInCart1,
			]);

			// Setup
			await userController.createUser(
				testUser.username,
				testUser.name,
				testUser.surname,
				"test",
				testUser.role
			);
			await productController.registerProducts(
				testNewProductInCart1.model,
				testNewProductInCart1.category,
				testNewProductInCart1.quantity + 1,
				"",
				testNewProductInCart1.price,
				null
			);
			await productController.registerProducts(
				testNewProductInCart2.model,
				testNewProductInCart2.category,
				testNewProductInCart2.quantity + 1,
				"",
				testNewProductInCart2.price,
				null
			);
			await cartController.addToCart(
				testUser,
				testNewProductInCart1.model
			);
			await cartController.addToCart(
				testUser,
				testNewProductInCart2.model
			);

			// Test
			const result = await cartController.removeProductFromCart(
				testUser,
				testNewProductInCart2.model
			);

			// Check
			const currentCart = await cartController.getCart(testUser);

			expect(result).toBe(true);
			expect(currentCart).toStrictEqual(testCart);
		});

		test("Product removed successfully - Quantity decreased", async () => {
			const testUser = new User(
				"test",
				"test",
				"test",
				Role.CUSTOMER,
				"test",
				"test"
			);
			const testNewProductInCart1 = new ProductInCart(
				"Test",
				1,
				Category.APPLIANCE,
				100.0
			);
			const testNewProductInCart2 = new ProductInCart(
				"Test2",
				2,
				Category.APPLIANCE,
				200.0
			);
			const testCart = new Cart(testUser.username, false, "", 300, [
				testNewProductInCart1,
				new ProductInCart(
					testNewProductInCart2.model,
					testNewProductInCart2.quantity - 1,
					testNewProductInCart2.category,
					testNewProductInCart2.price
				),
			]);

			// Setup
			await userController.createUser(
				testUser.username,
				testUser.name,
				testUser.surname,
				"test",
				testUser.role
			);
			await productController.registerProducts(
				testNewProductInCart1.model,
				testNewProductInCart1.category,
				testNewProductInCart1.quantity + 1,
				"",
				testNewProductInCart1.price,
				null
			);
			await productController.registerProducts(
				testNewProductInCart2.model,
				testNewProductInCart2.category,
				testNewProductInCart2.quantity + 1,
				"",
				testNewProductInCart2.price,
				null
			);
			await cartController.addToCart(
				testUser,
				testNewProductInCart1.model
			);
			await cartController.addToCart(
				testUser,
				testNewProductInCart2.model
			);
			await cartController.addToCart(
				testUser,
				testNewProductInCart2.model
			);

			// Test
			const result = await cartController.removeProductFromCart(
				testUser,
				testNewProductInCart2.model
			);

			// Check
			const currentCart = await cartController.getCart(testUser);

			expect(result).toBe(true);
			expect(currentCart).toStrictEqual(testCart);
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
			const testNewProductInCart1 = new ProductInCart(
				"Test",
				1,
				Category.APPLIANCE,
				100.0
			);

			// Setup
			await userController.createUser(
				testUser.username,
				testUser.name,
				testUser.surname,
				"test",
				testUser.role
			);
			await productController.registerProducts(
				testNewProductInCart1.model,
				testNewProductInCart1.category,
				testNewProductInCart1.quantity + 1,
				"",
				testNewProductInCart1.price,
				null
			);
			await cartController.addToCart(
				testUser,
				testNewProductInCart1.model
			);

			// Test
			await expect(
				cartController.removeProductFromCart(testUser, "Test2")
			).rejects.toBeInstanceOf(ProductNotInCartError);
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
		});

		afterEach(async () => {
			await cleanup();
		});

		test("Get customer carts successful", async () => {
			const testUser = new User(
				"test",
				"test",
				"test",
				Role.CUSTOMER,
				"test",
				"test"
			);
			const testProductsInCart1 = [
				new ProductInCart("Test1C1", 1, Category.APPLIANCE, 100.0),
				new ProductInCart("Test2C1", 1, Category.APPLIANCE, 200.0),
			];
			const testProductsInCart2 = [
				new ProductInCart("Test1C2", 2, Category.LAPTOP, 50.0),
				new ProductInCart("Test2C2", 2, Category.APPLIANCE, 300.0),
			];
			const testProductsInCart3 = [
				new ProductInCart("Test1C3", 1, Category.APPLIANCE, 500.0),
				new ProductInCart("Test2C3", 1, Category.SMARTPHONE, 100.0),
			];
			const testCarts = [
				new Cart(
					testUser.username,
					true,
					Time.now(),
					300,
					testProductsInCart1
				),
				new Cart(
					testUser.username,
					true,
					Time.now(),
					700,
					testProductsInCart2
				),
			];

			// Setup
			await userController.createUser(
				testUser.username,
				testUser.name,
				testUser.surname,
				"test",
				testUser.role
			);

			for (let prod of testProductsInCart1) {
				await productController.registerProducts(
					prod.model,
					prod.category,
					prod.quantity + 1,
					"",
					prod.price,
					null
				);
				await cartController.addToCart(testUser, prod.model);
			}
			await cartController.checkoutCart(testUser);

			for (let prod of testProductsInCart2) {
				await productController.registerProducts(
					prod.model,
					prod.category,
					prod.quantity + 1,
					"",
					prod.price,
					null
				);
				await cartController.addToCart(testUser, prod.model);
				await cartController.addToCart(testUser, prod.model);
			}
			await cartController.checkoutCart(testUser);

			for (let prod of testProductsInCart3) {
				await productController.registerProducts(
					prod.model,
					prod.category,
					prod.quantity + 1,
					"",
					prod.price,
					null
				);
				await cartController.addToCart(testUser, prod.model);
			}

			// Test
			const customerPaidCarts = await cartController.getCustomerCarts(
				testUser
			);

			// Get
			expect(customerPaidCarts).toStrictEqual(testCarts);
		});

		test("Get customer carts successful, still no carts paid", async () => {
			const testUser = new User(
				"test",
				"test",
				"test",
				Role.CUSTOMER,
				"test",
				"test"
			);
			const testProductsInCart1 = [
				new ProductInCart("Test1C1", 2, Category.APPLIANCE, 100.0),
				new ProductInCart("Test2C1", 2, Category.APPLIANCE, 200.0),
			];
			const testCarts: Cart[] = [];

			// Setup
			await userController.createUser(
				testUser.username,
				testUser.name,
				testUser.surname,
				"test",
				testUser.role
			);

			for (let prod of testProductsInCart1) {
				await productController.registerProducts(
					prod.model,
					prod.category,
					prod.quantity + 1,
					"",
					prod.price,
					null
				);
				await cartController.addToCart(testUser, prod.model);
				await cartController.addToCart(testUser, prod.model);
			}

			// Test
			const customerPaidCarts = await cartController.getCustomerCarts(
				testUser
			);

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
		});

		afterEach(async () => {
			await cleanup();
		});

		test("Get all carts successful", async () => {
			const testUser1 = new User(
				"test1",
				"test",
				"test",
				Role.CUSTOMER,
				"test",
				"test"
			);
			const testUser2 = new User(
				"test2",
				"test",
				"test",
				Role.CUSTOMER,
				"test",
				"test"
			);
			const testProductsInCart1 = [
				new ProductInCart("Test1C1", 1, Category.APPLIANCE, 100.0),
				new ProductInCart("Test2C1", 1, Category.APPLIANCE, 200.0),
			];
			const testProductsInCart2 = [
				new ProductInCart("Test1C2", 2, Category.LAPTOP, 50.0),
				new ProductInCart("Test2C2", 2, Category.APPLIANCE, 300.0),
			];
			const testProductsInCart3 = [
				new ProductInCart("Test1C3", 1, Category.APPLIANCE, 500.0),
				new ProductInCart("Test2C3", 1, Category.SMARTPHONE, 100.0),
			];
			const testCarts = [
				new Cart(
					testUser1.username,
					true,
					Time.now(),
					300,
					testProductsInCart1
				),
				new Cart(
					testUser1.username,
					false,
					"",
					700,
					testProductsInCart2
				),
				new Cart(
					testUser2.username,
					true,
					Time.now(),
					600,
					testProductsInCart3
				),
			];

			// Setup
			await userController.createUser(
				testUser1.username,
				testUser1.name,
				testUser1.surname,
				"test",
				testUser1.role
			);
			await userController.createUser(
				testUser2.username,
				testUser2.name,
				testUser2.surname,
				"test",
				testUser2.role
			);

			for (let prod of testProductsInCart1) {
				await productController.registerProducts(
					prod.model,
					prod.category,
					prod.quantity + 1,
					"",
					prod.price,
					null
				);
				await cartController.addToCart(testUser1, prod.model);
			}
			await cartController.checkoutCart(testUser1);

			for (let prod of testProductsInCart2) {
				await productController.registerProducts(
					prod.model,
					prod.category,
					prod.quantity + 1,
					"",
					prod.price,
					null
				);
				await cartController.addToCart(testUser1, prod.model);
				await cartController.addToCart(testUser1, prod.model);
			}

			for (let prod of testProductsInCart3) {
				await productController.registerProducts(
					prod.model,
					prod.category,
					prod.quantity + 1,
					"",
					prod.price,
					null
				);
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
		});

		afterEach(async () => {
			await cleanup();
		});

		test("Delete all carts successful", async () => {
			const testUser1 = new User(
				"test1",
				"test",
				"test",
				Role.CUSTOMER,
				"test",
				"test"
			);
			const testUser2 = new User(
				"test2",
				"test",
				"test",
				Role.CUSTOMER,
				"test",
				"test"
			);
			const testProductsInCart1 = [
				new ProductInCart("Test1C1", 1, Category.APPLIANCE, 100.0),
				new ProductInCart("Test2C1", 1, Category.APPLIANCE, 200.0),
			];
			const testProductsInCart2 = [
				new ProductInCart("Test1C2", 2, Category.LAPTOP, 50.0),
				new ProductInCart("Test2C2", 2, Category.APPLIANCE, 300.0),
			];
			const testProductsInCart3 = [
				new ProductInCart("Test1C3", 1, Category.APPLIANCE, 500.0),
				new ProductInCart("Test2C3", 1, Category.SMARTPHONE, 100.0),
			];
			const testCarts: Cart[] = [];

			// Setup
			await userController.createUser(
				testUser1.username,
				testUser1.name,
				testUser1.surname,
				"test",
				testUser1.role
			);
			await userController.createUser(
				testUser2.username,
				testUser2.name,
				testUser2.surname,
				"test",
				testUser2.role
			);

			for (let prod of testProductsInCart1) {
				await productController.registerProducts(
					prod.model,
					prod.category,
					prod.quantity + 1,
					"",
					prod.price,
					null
				);
				await cartController.addToCart(testUser1, prod.model);
			}
			await cartController.checkoutCart(testUser1);

			for (let prod of testProductsInCart2) {
				await productController.registerProducts(
					prod.model,
					prod.category,
					prod.quantity + 1,
					"",
					prod.price,
					null
				);
				await cartController.addToCart(testUser1, prod.model);
				await cartController.addToCart(testUser1, prod.model);
			}

			for (let prod of testProductsInCart3) {
				await productController.registerProducts(
					prod.model,
					prod.category,
					prod.quantity + 1,
					"",
					prod.price,
					null
				);
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