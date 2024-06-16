import {
	describe,
	test,
	expect,
	beforeAll,
	afterEach,
	jest,
} from "@jest/globals";

import CartDAO from "../../src/dao/cartDAO";
import db from "../../src/db/db";
import { cleanup } from "../../src/db/cleanup";
import { Database } from "sqlite3";
import { Category } from "../../src/components/product";
import { Cart, ProductInCart } from "../../src/components/cart";
import { Role, User } from "../../src/components/user";
import {
	CartNotFoundError,
	EmptyCartError,
	ProductNotInCartError,
} from "../../src/errors/cartError";
import {
	EmptyProductStockError,
	ProductNotFoundError,
} from "../../src/errors/productError";
import UserDAO from "../../src/dao/userDAO";
import ProductDAO from "../../src/dao/productDAO";
import {Time} from "../../src/utilities"

describe("DAO tests", () => {
	describe("DAO - Create cart", () => {
		let cartDAO: CartDAO;
		let userDAO: UserDAO;

		beforeAll(async () => {
			cartDAO = new CartDAO();
			userDAO = new UserDAO();

			await cleanup();
		});

		afterEach(async () => {
			await cleanup();
		});

		test("Create cart successful - Empty cart", async () => {
			const testUser = new User(
				"test",
				"test",
				"test",
				Role.CUSTOMER,
				"",
				""
			);
			const testCardId = 1;

			await userDAO.createUser(
				testUser.username,
				testUser.name,
				testUser.surname,
				"test",
				testUser.role
			);
			const result = await cartDAO.createCart(testUser);
			expect(result).toBe(testCardId);
		});
	});

	describe("DAO - Add product to cart", () => {
		let cartDAO: CartDAO;
		let userDAO: UserDAO;
		let prodDAO: ProductDAO;

		beforeAll(async () => {
			cartDAO = new CartDAO();
			userDAO = new UserDAO();
			prodDAO = new ProductDAO();

			await cleanup();
		});

		afterEach(async () => {
			await cleanup();
		});

		test("Add to cart successful - Product not yet in cart", async () => {
			const testUser = new User(
				"test",
				"test",
				"test",
				Role.CUSTOMER,
				"",
				""
			);
			const testProductsInCart = [
				new ProductInCart("iPhone13", 2, Category.SMARTPHONE, 1000.0),
				new ProductInCart("iPhone15", 3, Category.SMARTPHONE, 1200.0),
			];
			const testCart = new Cart(
				"test",
				false,
				"",
				5600.0,
				testProductsInCart
			);

			// Setup
			const product1 = await prodDAO.createProduct(
				"iPhone13",
				Category.SMARTPHONE,
				4,
				"",
				1000.0,
				null
			);
			const product2 = await prodDAO.createProduct(
				"iPhone15",
				Category.SMARTPHONE,
				4,
				"",
				1200.0,
				null
			);
			const user = await userDAO.createUser(
				testUser.username,
				testUser.name,
				testUser.surname,
				"test",
				testUser.role
			);
			const cartId = await cartDAO.createCart(testUser);

			// Test
			const added = await cartDAO.addProductToCart(
				cartId,
				testProductsInCart[0]
			);
			await cartDAO.addProductToCart(cartId, testProductsInCart[1]);

			// Check
			const result = await cartDAO.getCurrentCart(testUser);

			expect(result).toStrictEqual(testCart);
		});

		test("Add to cart successful - Product already in cart", async () => {
			const testUser = new User(
				"test",
				"test",
				"test",
				Role.CUSTOMER,
				"",
				""
			);
			const testCardId = 1;
			const testProductInCart = new ProductInCart(
				"iPhone13",
				2,
				Category.SMARTPHONE,
				1000.0
			);
			const testCart = new Cart("test", false, "", 4000.0, [
				new ProductInCart("iPhone13", 4, Category.SMARTPHONE, 1000.0), // quantity is 4 because the product is added twice
			]);

			// Setup
			const product = await prodDAO.createProduct(
				"iPhone13",
				Category.SMARTPHONE,
				4,
				"",
				1000.0,
				null
			);
			const user = await userDAO.createUser(
				testUser.username,
				testUser.name,
				testUser.surname,
				"test",
				testUser.role
			);
			const cartId = await cartDAO.createCart(testUser);

			// Test
			const added = await cartDAO.addProductToCart(
				cartId,
				testProductInCart
			);
			await cartDAO.addProductToCart(cartId, testProductInCart);

			// Check
			const result = await cartDAO.getCurrentCart(testUser);
			expect(result).toStrictEqual(testCart);
		});
	});

	describe("DAO - Get current cart", () => {
		let cartDAO: CartDAO;
		let userDAO: UserDAO;
		let prodDAO: ProductDAO;

		beforeAll(async () => {
			cartDAO = new CartDAO();
			userDAO = new UserDAO();
			prodDAO = new ProductDAO();

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
				"",
				""
			);
			const testProductsInCart = [
				new ProductInCart("iPhone13", 2, Category.SMARTPHONE, 1000.0),
				new ProductInCart("iPhone15", 4, Category.SMARTPHONE, 1200.0),
			];
			const testCart = new Cart(
				testUser.username,
				false,
				"",
				6800.0,
				testProductsInCart
			);
			const testCartId = 1;

			// Setup
			await userDAO.createUser(
				testUser.username,
				testUser.name,
				testUser.surname,
				"test",
				testUser.role
			);
			await cartDAO.createCart(testUser);

			for (let prod of testProductsInCart) {
				await prodDAO.createProduct(
					prod.model,
					prod.category,
					prod.quantity,
					null,
					prod.price,
					null
				);
				await cartDAO.addProductToCart(testCartId, prod);
			}

			// Test
			const result = await cartDAO.getCurrentCart(testUser);
			expect(result).toEqual(testCart);
		});

		test("Get current cart successful - Empty cart retrieved", async () => {
			const testUser = new User(
				"test",
				"test",
				"test",
				Role.CUSTOMER,
				"",
				""
			);
			const testCart = new Cart(testUser.username, false, "", 0.0, []);
			const testCartId = 1;

			// Setup
			await userDAO.createUser(
				testUser.username,
				testUser.name,
				testUser.surname,
				"test",
				testUser.role
			);
			await cartDAO.createCart(testUser);

			// Test
			const result = await cartDAO.getCurrentCart(testUser);

			expect(result).toEqual(testCart);
		});

		test("Get current cart failed - No cart for specific user", async () => {
			const testUser = new User(
				"test",
				"test",
				"test",
				Role.CUSTOMER,
				"",
				""
			);

			// Setup
			await userDAO.createUser(
				testUser.username,
				testUser.name,
				testUser.surname,
				"test",
				testUser.role
			);

			// Test
			await expect(
				cartDAO.getCurrentCart(testUser)
			).rejects.toBeInstanceOf(CartNotFoundError);
		});
	});

	describe("DAO - Get product", () => {
		let cartDAO: CartDAO;
		let productDAO: ProductDAO;

		beforeAll(async () => {
			cartDAO = new CartDAO();
			productDAO = new ProductDAO();

			await cleanup();
		});

		afterEach(async () => {
			await cleanup();
		});

		test("Get product successful", async () => {
			const testProductInCart1 = new ProductInCart(
				"iPhone13",
				1,
				Category.SMARTPHONE,
				1000.0
			);

			// Setup
			const product1 = await productDAO.createProduct(
				"iPhone13",
				Category.SMARTPHONE,
				4,
				"",
				1000.0,
				null
			);
			const product2 = await productDAO.createProduct(
				"iPhone11",
				Category.SMARTPHONE,
				4,
				"",
				400.0,
				null
			);

			// Test
			const result = await cartDAO.getProduct(testProductInCart1.model);

			expect(result).toStrictEqual(testProductInCart1);
		});

		test("Get product failed - Product found but empty stock", async () => {
			// Setup
			const product1 = await productDAO.createProduct(
				"iPhone13",
				Category.SMARTPHONE,
				0,
				"",
				1000.0,
				null
			);
			const product2 = await productDAO.createProduct(
				"iPhone11",
				Category.SMARTPHONE,
				1,
				"",
				400.0,
				null
			);

			// Test
			await expect(cartDAO.getProduct("iPhone13")).rejects.toBeInstanceOf(
				EmptyProductStockError
			);
		});

		test("Get product failed - Product not found", async () => {
			// Setup
			const product2 = await productDAO.createProduct(
				"iPhone11",
				Category.SMARTPHONE,
				1,
				"",
				400.0,
				null
			);

			// Test
			await expect(cartDAO.getProduct("iPhone13")).rejects.toBeInstanceOf(
				ProductNotFoundError
			);
		});
	});

	describe("DAO - Get current cart id", () => {
		let cartDAO: CartDAO;
		let userDAO: UserDAO;

		beforeAll(async () => {
			cartDAO = new CartDAO();
			userDAO = new UserDAO();

			await cleanup();
		});

		afterEach(async () => {
			await cleanup();
		});

		test("Get id successful", async () => {
			const testUser = new User(
				"test",
				"test",
				"test",
				Role.CUSTOMER,
				"",
				""
			);
			const testCardId = 1;

			// Setup
			const user = await userDAO.createUser(
				testUser.username,
				testUser.name,
				testUser.surname,
				"test",
				testUser.role
			);
			await cartDAO.createCart(testUser);

			// Test
			const result = await cartDAO.getCurrentCartId(testUser);

			expect(result).toBe(testCardId);
		});

		test("Get id failed - No cart", async () => {
			const testUser = new User(
				"test",
				"test",
				"test",
				Role.CUSTOMER,
				"",
				""
			);
			const testCardId = 1;

			// Setup
			const user = await userDAO.createUser(
				testUser.username,
				testUser.name,
				testUser.surname,
				"test",
				testUser.role
			);

			// Test
			await expect(
				cartDAO.getCurrentCartId(testUser)
			).rejects.toBeInstanceOf(CartNotFoundError);
		});
	});

	describe("DAO - Checkout cart", () => {
		let cartDAO: CartDAO;
		let userDAO: UserDAO;
		let productDAO: ProductDAO;

		beforeAll(async () => {
			cartDAO = new CartDAO();
			userDAO = new UserDAO();
			productDAO = new ProductDAO();

			await cleanup();
		});

		afterEach(async () => {
			await cleanup();
		});

		test("Checkout cart successful", async () => {
			const testUser = new User(
				"test",
				"test",
				"test",
				Role.CUSTOMER,
				"",
				""
			);
			const testProductsInCart = [
				new ProductInCart("iPhone13", 2, Category.SMARTPHONE, 1000.0),
				new ProductInCart("iPhone15", 4, Category.SMARTPHONE, 1200.0),
			];
			const testCart = new Cart(
				testUser.username,
				true,
				Time.today(),
				6800.0,
				[]
			);
			const testCartId = 1;

			// Setup
			await userDAO.createUser(
				testUser.username,
				testUser.name,
				testUser.surname,
				"test",
				testUser.role
			);
			await productDAO.createProduct(
				"iPhone13",
				Category.SMARTPHONE,
				10,
				"",
				1000.0,
				""
			);
			await productDAO.createProduct(
				"iPhone15",
				Category.SMARTPHONE,
				10,
				"",
				1200.0,
				""
			);

			const cartId = await cartDAO.createCart(testUser);
			for (let prod of testProductsInCart) {
				await cartDAO.addProductToCart(cartId, prod);
			}

			// Test
			const result = await cartDAO.checkoutCart(testUser.username);

			// Check: getAllCarts needed
			const checkedOutCartObj = await cartDAO.fetchAllCarts();
			const checkedOutCart = checkedOutCartObj
				.filter(
					({ id, cart }) =>
						id == 1 &&
						cart.paymentDate === testCart.paymentDate &&
						cart.customer === testCart.customer &&
						cart.paid === testCart.paid &&
						cart.paid === true &&
						cart.total === testCart.total
				)
				.map((cartObj) => cartObj.cart);
			expect(checkedOutCart.length).toBe(1);
			expect(checkedOutCart[0]).toStrictEqual(
				testCart
			);
			expect(result).toBe(true);
		});
	});
	
	describe("DAO - Get paid carts", () => {
		let cartDAO: CartDAO;
		let userDAO: UserDAO;
		let productDAO: ProductDAO;

		beforeAll(async () => {
			cartDAO = new CartDAO();
			userDAO = new UserDAO();
			productDAO = new ProductDAO();

			await cleanup();
		});

		afterEach(async () => {
			await cleanup();
		});

		test("Get paid carts successful", async () => {
			const testUser1 = new User(
				"test1",
				"test",
				"test",
				Role.CUSTOMER,
				"",
				""
			);
			const testUser2 = new User(
				"test2",
				"test",
				"test",
				Role.CUSTOMER,
				"",
				""
			);
			const testProductsInCart1 = [
				new ProductInCart("iPhone13", 2, Category.SMARTPHONE, 1000.0),
				new ProductInCart("iPhone15", 3, Category.SMARTPHONE, 1200.0),
			];
			const testProductsInCart2 = [
				new ProductInCart("iPhoneX", 2, Category.SMARTPHONE, 800.0),
				new ProductInCart("iPhone8", 3, Category.SMARTPHONE, 1200.0),
			];
			const testProductsInCart3 = [
				new ProductInCart("iPhone7", 2, Category.SMARTPHONE, 100.0),
				new ProductInCart("iPhone6", 3, Category.SMARTPHONE, 200.0),
			];
			const testCarts = [
				new Cart(
					testUser1.username,
					false,
					"",
					4600.0,
					[]
				),
				new Cart(
					testUser1.username,
					true,
					Time.today(),
					5200.0,
					[]
				),
				new Cart(
					testUser2.username,
					true,
					Time.today(),
					800.0,
					[]
				),
			];

			// Setup
			await userDAO.createUser(
				testUser1.username,
				testUser1.name,
				testUser1.surname,
				"test",
				testUser1.role
			);
			await userDAO.createUser(
				testUser2.username,
				testUser2.name,
				testUser2.surname,
				"test",
				testUser2.role
			);

			await productDAO.createProduct(
				"iPhone13",
				Category.SMARTPHONE,
				10,
				"",
				1000.0,
				""
			);
			await productDAO.createProduct(
				"iPhone15",
				Category.SMARTPHONE,
				10,
				"",
				1200.0,
				""
			);
			await productDAO.createProduct(
				"iPhoneX",
				Category.SMARTPHONE,
				10,
				"",
				800.0,
				""
			);
			await productDAO.createProduct(
				"iPhone8",
				Category.SMARTPHONE,
				10,
				"",
				1200.0,
				""
			);
			await productDAO.createProduct(
				"iPhone7",
				Category.SMARTPHONE,
				10,
				"",
				100.0,
				""
			);
			await productDAO.createProduct(
				"iPhone6",
				Category.SMARTPHONE,
				10,
				"",
				200.0,
				""
			);

			// Setup
			const cartId2 = await cartDAO.createCart(testUser1);
			for (let prod of testProductsInCart2) {
				await cartDAO.addProductToCart(cartId2, prod);
			}
			await cartDAO.checkoutCart(testUser1.username);

			const cartId1 = await cartDAO.createCart(testUser1);
			for (let prod of testProductsInCart1) {
				await cartDAO.addProductToCart(cartId1, prod);
			}

			const cartId3 = await cartDAO.createCart(testUser2);
			for (let prod of testProductsInCart3) {
				await cartDAO.addProductToCart(cartId3, prod);
			}
			await cartDAO.checkoutCart(testUser2.username);

			// Test
			const result1 = await cartDAO.fetchPaidCarts(testUser1.username);
			const result2 = await cartDAO.fetchPaidCarts(testUser2.username);

			// Check
			expect(result1).toStrictEqual([{ id: 1, cart: testCarts[1] }]);
			expect(result2).toStrictEqual([{ id: 3, cart: testCarts[2] }]);
		});

		test("Get paid carts successful - No carts to retrieve", async () => {
			const testCarts: { id: number; cart: Cart }[] = [];

			// Test
			const result = await cartDAO.fetchAllCarts();

			expect(result).toEqual(testCarts);
		});
	});

	describe("DAO - Remove product from cart", () => {
		let cartDAO: CartDAO;
		let userDAO: UserDAO;
		let productDAO: ProductDAO;

		beforeAll(async () => {
			cartDAO = new CartDAO();
			userDAO = new UserDAO();
			productDAO = new ProductDAO();

			await cleanup();
		});

		afterEach(async () => {
			await cleanup();
		});

		test("Remove successful - Decrease quantity", async () => {
			const testUser = new User(
				"test",
				"test",
				"test",
				Role.CUSTOMER,
				"",
				""
			);
			const testProductsInCartBefore = [
				new ProductInCart("iPhone13", 2, Category.SMARTPHONE, 200.0),
				new ProductInCart("iPhone15", 3, Category.SMARTPHONE, 300.0),
			];
			const testProductsInCartAfter = [
				new ProductInCart("iPhone13", 1, Category.SMARTPHONE, 200.0),
				new ProductInCart("iPhone15", 3, Category.SMARTPHONE, 300.0),
			];
			const testCart = new Cart(
				testUser.username,
				false,
				"",
				1100.0,
				testProductsInCartAfter
			);

			// Setup
			await userDAO.createUser(
				testUser.username,
				testUser.name,
				testUser.surname,
				"test",
				testUser.role
			);
			const cartId = await cartDAO.createCart(testUser);
			for (let prod of testProductsInCartBefore) {
				await productDAO.createProduct(
					prod.model,
					prod.category,
					prod.quantity,
					null,
					prod.price,
					null
				);
				await cartDAO.addProductToCart(cartId, prod);
			}

			// Test
			const result = await cartDAO.removeProductFromCart(
				testUser,
				testProductsInCartBefore[0].model
			);

			// Check
			const currentCart = await cartDAO.getCurrentCart(testUser);

			expect(result).toBe(true);
			expect(currentCart).toStrictEqual(testCart);
		});

		test("Remove successful - Product removed", async () => {
			const testUser = new User(
				"test",
				"test",
				"test",
				Role.CUSTOMER,
				"",
				""
			);
			const testProductsInCartBefore = [
				new ProductInCart("iPhone13", 1, Category.SMARTPHONE, 200.0),
				new ProductInCart("iPhone15", 3, Category.SMARTPHONE, 300.0),
			];
			const testProductsInCartAfter = [
				new ProductInCart("iPhone15", 3, Category.SMARTPHONE, 300.0),
			];
			const testCart = new Cart(
				testUser.username,
				false,
				"",
				900.0,
				testProductsInCartAfter
			);

			// Setup
			await userDAO.createUser(
				testUser.username,
				testUser.name,
				testUser.surname,
				"test",
				testUser.role
			);
			const cartId = await cartDAO.createCart(testUser);
			for (let prod of testProductsInCartBefore) {
				await productDAO.createProduct(
					prod.model,
					prod.category,
					prod.quantity,
					null,
					prod.price,
					null
				);
				await cartDAO.addProductToCart(cartId, prod);
			}

			// Test
			const result = await cartDAO.removeProductFromCart(
				testUser,
				testProductsInCartBefore[0].model
			);

			// Check
			const currentCart = await cartDAO.getCurrentCart(testUser);

			expect(result).toBe(true);
			expect(currentCart).toStrictEqual(testCart);
		});

		test("Remove failed - Product not in cart", async () => {
			const testUser = new User(
				"test",
				"test",
				"test",
				Role.CUSTOMER,
				"",
				""
			);
			const testProductInCart = new ProductInCart(
				"iPhone13",
				1,
				Category.SMARTPHONE,
				200.0
			);

			// Setup
			await userDAO.createUser(
				testUser.username,
				testUser.name,
				testUser.surname,
				"test",
				testUser.role
			);
			const cartId = await cartDAO.createCart(testUser);
			await productDAO.createProduct(
				testProductInCart.model,
				testProductInCart.category,
				testProductInCart.quantity,
				null,
				testProductInCart.price,
				null
			);
			await productDAO.createProduct("iPhone15", Category.SMARTPHONE, 2, "", 100, "");
			await cartDAO.addProductToCart(cartId, testProductInCart);

			// Test
			await expect(
				cartDAO.removeProductFromCart(testUser, "iPhone15")
			).rejects.toBeInstanceOf(ProductNotInCartError);
		});

		test("Remove failed - No unpaid cart", async () => {
			const testUser = new User(
				"test",
				"test",
				"test",
				Role.CUSTOMER,
				"",
				""
			);
			const testProductInCart = new ProductInCart(
				"iPhone13",
				1,
				Category.SMARTPHONE,
				200.0
			);

			// Setup
			await userDAO.createUser(
				testUser.username,
				testUser.name,
				testUser.surname,
				"test",
				testUser.role
			);
			const cartId = await cartDAO.createCart(testUser);
			await productDAO.createProduct(
				testProductInCart.model,
				testProductInCart.category,
				testProductInCart.quantity,
				null,
				testProductInCart.price,
				null
			);
			await cartDAO.addProductToCart(cartId, testProductInCart);
			await cartDAO.checkoutCart(testUser.username);

			// Test
			await expect(
				cartDAO.removeProductFromCart(testUser, "iPhone13")
			).rejects.toBeInstanceOf(CartNotFoundError);
		});

		test("Remove failed - Unpaid cart present but empty", async () => {
			const testUser = new User(
				"test",
				"test",
				"test",
				Role.CUSTOMER,
				"",
				""
			);
			const testProductInCart = new ProductInCart(
				"iPhone13",
				1,
				Category.SMARTPHONE,
				200.0
			);

			// Setup
			await userDAO.createUser(
				testUser.username,
				testUser.name,
				testUser.surname,
				"test",
				testUser.role
			);
			const cartId = await cartDAO.createCart(testUser);
			await productDAO.createProduct(
				testProductInCart.model,
				testProductInCart.category,
				testProductInCart.quantity,
				null,
				testProductInCart.price,
				null
			);
			await cartDAO.addProductToCart(cartId, testProductInCart);
			await cartDAO.removeProductFromCart(testUser, "iPhone13");

			// Test
			await expect(
				cartDAO.removeProductFromCart(testUser, "iPhone13")
			).rejects.toBeInstanceOf(EmptyCartError);
		});

		test("Remove failed - Product not found", async () => {
			const testUser = new User(
				"test",
				"test",
				"test",
				Role.CUSTOMER,
				"",
				""
			);
			const testProductInCart = new ProductInCart(
				"iPhone13",
				1,
				Category.SMARTPHONE,
				200.0
			);

			// Setup
			await userDAO.createUser(
				testUser.username,
				testUser.name,
				testUser.surname,
				"test",
				testUser.role
			);
			const cartId = await cartDAO.createCart(testUser);
			await productDAO.createProduct(
				testProductInCart.model,
				testProductInCart.category,
				testProductInCart.quantity,
				null,
				testProductInCart.price,
				null
			);
			await cartDAO.addProductToCart(cartId, testProductInCart);

			// Test
			await expect(
				cartDAO.removeProductFromCart(testUser, "iPhone15")
			).rejects.toBeInstanceOf(ProductNotFoundError);
		});
	});

	describe("DAO - Clear cart", () => {
		let cartDAO: CartDAO;
		let userDAO: UserDAO;
		let productDAO: ProductDAO;

		beforeAll(async () => {
			cartDAO = new CartDAO();
			userDAO = new UserDAO();
			productDAO = new ProductDAO();

			await cleanup();
		});

		afterEach(async () => {
			await cleanup();
		});

		test("Clear cart successful", async () => {
			const testUser = new User(
				"test",
				"test",
				"test",
				Role.CUSTOMER,
				"",
				""
			);
			const testProductsInCart = [
				new ProductInCart("iPhone13", 2, Category.SMARTPHONE, 200.0),
				new ProductInCart("iPhone15", 3, Category.SMARTPHONE, 300.0),
			];
			const defaultCart = new Cart(testUser.username, false, "", 0.0, []);

			// Setup
			await userDAO.createUser(
				testUser.username,
				testUser.name,
				testUser.surname,
				"test",
				testUser.role
			);
			const cartId = await cartDAO.createCart(testUser);
			for (let prod of testProductsInCart) {
				await productDAO.createProduct(
					prod.model,
					prod.category,
					prod.quantity,
					null,
					prod.price,
					null
				);
				await cartDAO.addProductToCart(cartId, prod);
			}

			// Test
			const result = await cartDAO.clearCart(testUser);

			// Check
			const emptyCart = await cartDAO.getCurrentCart(testUser);

			expect(result).toBe(true);
			expect(emptyCart).toStrictEqual(defaultCart);
		});

		test("Clear cart failed - No unpaid cart", async () => {
			const testUser = new User(
				"test",
				"test",
				"test",
				Role.CUSTOMER,
				"",
				""
			);

			// Setup
			await userDAO.createUser(
				testUser.username,
				testUser.name,
				testUser.surname,
				"test",
				testUser.role
			);
			
			// Test
			const result = await expect(cartDAO.clearCart(testUser)).rejects.toBeInstanceOf(CartNotFoundError);
		});
	});

	describe("DAO - Delete all carts", () => {
		let cartDAO: CartDAO;
		let userDAO: UserDAO;
		let productDAO: ProductDAO;

		beforeAll(async () => {
			cartDAO = new CartDAO();
			userDAO = new UserDAO();
			productDAO = new ProductDAO();

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
				"",
				""
			);
			const testUser2 = new User(
				"test2",
				"test",
				"test",
				Role.CUSTOMER,
				"",
				""
			);
			const testProductsInCart1 = [
				new ProductInCart("iPhone13", 2, Category.SMARTPHONE, 1000.0),
				new ProductInCart("iPhone15", 3, Category.SMARTPHONE, 1200.0),
			];
			const testProductsInCart2 = [
				new ProductInCart("iPhoneX", 2, Category.SMARTPHONE, 800.0),
				new ProductInCart("iPhone8", 3, Category.SMARTPHONE, 1200.0),
			];
			const testCarts = [
				new Cart(
					testUser1.username,
					false,
					"",
					4600.0,
					testProductsInCart1
				),
				new Cart(
					testUser2.username,
					true,
					"2024-03-20",
					5200.0,
					testProductsInCart2
				),
			];
			const noCarts: { id: number; cart: Cart }[] = [];

			// Setup
			await userDAO.createUser(
				testUser1.username,
				testUser1.name,
				testUser1.surname,
				"test",
				testUser1.role
			);
			await userDAO.createUser(
				testUser2.username,
				testUser2.name,
				testUser2.surname,
				"test",
				testUser2.role
			);

			await productDAO.createProduct(
				"iPhone13",
				Category.SMARTPHONE,
				10,
				"",
				1000.0,
				""
			);
			await productDAO.createProduct(
				"iPhone15",
				Category.SMARTPHONE,
				10,
				"",
				1200.0,
				""
			);
			await productDAO.createProduct(
				"iPhoneX",
				Category.SMARTPHONE,
				10,
				"",
				800.0,
				""
			);
			await productDAO.createProduct(
				"iPhone8",
				Category.SMARTPHONE,
				10,
				"",
				1200.0,
				""
			);

			const cartId2 = await cartDAO.createCart(testUser2);
			for (let prod of testProductsInCart2) {
				await cartDAO.addProductToCart(cartId2, prod);
			}
			await cartDAO.checkoutCart(testUser2.username);

			const cartId1 = await cartDAO.createCart(testUser1);
			for (let prod of testProductsInCart1) {
				await cartDAO.addProductToCart(cartId1, prod);
			}

			// Test
			const result = await cartDAO.deleteAllCarts();

			// Check
			const noCartsRetrieved = await cartDAO.fetchAllCarts();

			expect(result).toBe(true);
			expect(noCartsRetrieved).toStrictEqual(noCarts);
		});

		test("Delete all carts successful - No carts to delete", async () => {
			const noCarts: { id: number; cart: Cart }[] = [];

			// Test
			const result = await cartDAO.deleteAllCarts();

			// Check
			const noCartsRetrieved = await cartDAO.fetchAllCarts();

			expect(result).toBe(true);
			expect(noCartsRetrieved).toStrictEqual(noCarts);
		});
	});

	describe("DAO - Get all carts", () => {
		let cartDAO: CartDAO;
		let userDAO: UserDAO;
		let productDAO: ProductDAO;

		beforeAll(async () => {
			cartDAO = new CartDAO();
			userDAO = new UserDAO();
			productDAO = new ProductDAO();

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
				"",
				""
			);
			const testUser2 = new User(
				"test2",
				"test",
				"test",
				Role.CUSTOMER,
				"",
				""
			);
			const testProductsInCart1 = [
				new ProductInCart("iPhone13", 2, Category.SMARTPHONE, 1000.0),
				new ProductInCart("iPhone15", 3, Category.SMARTPHONE, 1200.0),
			];
			const testProductsInCart2 = [
				new ProductInCart("iPhoneX", 2, Category.SMARTPHONE, 800.0),
				new ProductInCart("iPhone8", 3, Category.SMARTPHONE, 1200.0),
			];
			const testCarts = [
				{
					id: 1,
					cart: new Cart(
						testUser1.username,
						false,
						"",
						5600.0,
						[]
					),
				},
				{
					id: 2,
					cart: new Cart(
						testUser2.username,
						true,
						Time.today(),
						5200.0,
						[]
					),
				},
			];

			// Setup
			await userDAO.createUser(
				testUser1.username,
				testUser1.name,
				testUser1.surname,
				"test",
				testUser1.role
			);
			await userDAO.createUser(
				testUser2.username,
				testUser2.name,
				testUser2.surname,
				"test",
				testUser2.role
			);

			await productDAO.createProduct(
				"iPhone13",
				Category.SMARTPHONE,
				10,
				"",
				1000.0,
				""
			);
			await productDAO.createProduct(
				"iPhone15",
				Category.SMARTPHONE,
				10,
				"",
				1200.0,
				""
			);
			await productDAO.createProduct(
				"iPhoneX",
				Category.SMARTPHONE,
				10,
				"",
				800.0,
				""
			);
			await productDAO.createProduct(
				"iPhone8",
				Category.SMARTPHONE,
				10,
				"",
				1200.0,
				""
			);

			const cartId1 = await cartDAO.createCart(testUser1);
			for (let prod of testProductsInCart1) {
				await cartDAO.addProductToCart(cartId1, prod);
			}

			const cartId2 = await cartDAO.createCart(testUser2);
			for (let prod of testProductsInCart2) {
				await cartDAO.addProductToCart(cartId2, prod);
			}
			await cartDAO.checkoutCart(testUser2.username);
			

			// Test
			const result = await cartDAO.fetchAllCarts();

			expect(result).toStrictEqual(testCarts);
		});

		test("Get all carts successful - No carts to retrieve", async () => {
			const testCarts: { id: number; cart: Cart }[] = [];

			// Test
			const result = await cartDAO.fetchAllCarts();

			expect(result).toStrictEqual(testCarts);
		});
	});

	describe("DAO - Fetch product in cart", () => {
		let cartDAO: CartDAO;
		let productDAO: ProductDAO;
		let userDAO: UserDAO;

		beforeAll(async () => {
			cartDAO = new CartDAO();
			productDAO = new ProductDAO();
			userDAO = new UserDAO();

			await cleanup();
		});

		afterEach(async() => {
			await cleanup();
		});

		test("Fetch products in cart successful", async () => {
			const testUser = new User("test", "test", "test", Role.CUSTOMER, "test", "test");
			const testCardId = 1;
			const testProductsInCartDB = [
				{
					Model: "Test1",
					Quantity: 2,
					Category: Category.APPLIANCE,
					SellingPrice: 100.0,
				},
				{
					Model: "Test2",
					Quantity: 3,
					Category: Category.LAPTOP,
					SellingPrice: 200.0,
				},
			];
			const testProductsInCart = testProductsInCartDB.map(
				(prod) =>
					new ProductInCart(
						prod.Model,
						prod.Quantity,
						prod.Category,
						prod.SellingPrice
					)
			);

			// Setup
			await userDAO.createUser(testUser.username, testUser.name, testUser.surname, "test", testUser.role);
			const cartId = await cartDAO.createCart(testUser);
			for (let prod of testProductsInCart) {
				await productDAO.createProduct(prod.model, prod.category, prod.quantity, "", prod.price, "");
				await cartDAO.addProductToCart(cartId, prod);
			}

			const result = await cartDAO.fetchProducts(cartId);
			expect(result).toStrictEqual(testProductsInCart);
		});

		test("Fetch products in cart successful - Empty set", async () => {
			const testUser = new User("test", "test", "test", Role.CUSTOMER, "test", "test");
			const testCardId = 1;
			const testProductsInCartDB = [
				{
					Model: "Test1",
					Quantity: 2,
					Category: Category.APPLIANCE,
					SellingPrice: 100.0,
				},
				{
					Model: "Test2",
					Quantity: 3,
					Category: Category.LAPTOP,
					SellingPrice: 200.0,
				},
			];
			const testProductsInCart: ProductInCart[] = [];

			// Setup
			await userDAO.createUser(testUser.username, testUser.name, testUser.surname, "test", testUser.role);
			const cartId = await cartDAO.createCart(testUser);

			const result = await cartDAO.fetchProducts(cartId);
			expect(result).toStrictEqual(testProductsInCart);
		});
	});
});
