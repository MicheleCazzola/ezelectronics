import { describe, test, expect, beforeAll, beforeEach, afterEach, jest } from "@jest/globals"

import CartDAO from "../../src/dao/cartDAO"
import db from "../../src/db/db"
import { Database } from "sqlite3";
import { Category } from "../../src/components/product";
import { Cart, ProductInCart } from "../../src/components/cart";
import { Role, User } from "../../src/components/user";
import { CartNotFoundError, EmptyCartError, ProductNotInCartError } from "../../src/errors/cartError";
import { EmptyProductStockError, ProductNotFoundError } from "../../src/errors/productError";
import ProductDAO from "../../src/dao/productDAO";

jest.mock("../../src/db/db.ts");

function resetMock(mock: any) {
    mock.mockClear();
    mock.mockRestore();
}

describe("DAO tests", () => {
	describe("DAO - Get current cart", () => {
		afterEach(() => {
			jest.restoreAllMocks();
			jest.clearAllMocks();
		});

		test("Get current cart successful", async () => {
			const cartDAO = new CartDAO();

			const testUser = new User(
				"test",
				"test",
				"test",
				Role.CUSTOMER,
				"",
				""
			);
			const testProductsInCart = [
				new ProductInCart("iPhone13", 1, Category.SMARTPHONE, 1000.0),
				new ProductInCart("iPhone15", 1, Category.SMARTPHONE, 1200.0),
			];
			const testCart = new Cart(
				testUser.username,
				false,
				"",
				2200.0,
				testProductsInCart
			);

			const mockDBGet = jest.spyOn(db, "get");
			const mockDBAll = jest.spyOn(db, "all");

			mockDBGet.mockImplementationOnce((sql, params, callback) => {
				callback(null, { Total: testCart.total });
				return {} as Database;
			});

			mockDBAll.mockImplementationOnce((sql, params, callback) => {
				callback(null, testProductsInCart);
				return {} as Database;
			});

			const result = await cartDAO.getCurrentCart(testUser);
			expect(mockDBGet).toBeCalledTimes(1);
			expect(mockDBAll).toBeCalledTimes(1);

			expect(result).toEqual(testCart);
			resetMock(mockDBAll);
			resetMock(mockDBGet);
		});

		test("Get current cart successful - Empty cart retrieved", async () => {
			const cartDAO = new CartDAO();

			const testUser = new User(
				"test",
				"test",
				"test",
				Role.CUSTOMER,
				"",
				""
			);
			const testProductsInCart: ProductInCart[] = [];
			const testCart = new Cart(
				testUser.username,
				false,
				"",
				0.0,
				testProductsInCart
			);

			const mockDBGet = jest.spyOn(db, "get");
			const mockDBAll = jest.spyOn(db, "all");

			mockDBGet.mockImplementation((sql, params, callback) => {
				callback(null, { Total: testCart.total });
				return {} as Database;
			});

			mockDBAll.mockImplementation((sql, params, callback) => {
				callback(null, testProductsInCart);
				return {} as Database;
			});

			const result = await cartDAO.getCurrentCart(testUser);
			expect(mockDBGet).toBeCalledTimes(1);
			expect(mockDBAll).toBeCalledTimes(1);
			expect(result).toEqual(testCart);
			/*resetMock(mockDBAll);
            resetMock(mockDBGet);*/
		});

		test("Get current cart failed - No cart for specific user", async () => {
			const cartDAO = new CartDAO();

			const testUser = new User(
				"test",
				"test",
				"test",
				Role.CUSTOMER,
				"",
				""
			);

			const mockDBGet = jest.spyOn(db, "get");

			mockDBGet.mockImplementation((sql, params, callback) => {
				callback(null, false);
				return {} as Database;
			});

			await expect(
				cartDAO.getCurrentCart(testUser)
			).rejects.toBeInstanceOf(CartNotFoundError);
			expect(mockDBGet).toBeCalledTimes(1);
			//resetMock(mockDBGet);
		});
	});

	describe("DAO - Get product", () => {
		let cartDAO: CartDAO;

		beforeAll(() => {
			cartDAO = new CartDAO();
		});

		afterEach(() => {
			jest.restoreAllMocks();
			jest.clearAllMocks();
		});

		test("Get product in cart successful", async () => {
			const testProductInCart = new ProductInCart(
				"iPhone13",
				1,
				Category.SMARTPHONE,
				1000.0
			);

			const mockDBGet = jest.spyOn(db, "get");
			mockDBGet.mockImplementationOnce((sql, params, callback) => {
				callback(null, {
					Category: testProductInCart.category,
					SellingPrice: testProductInCart.price,
				});
				return {} as Database;
			});

			const result = await cartDAO.getProduct(testProductInCart.model);
			expect(mockDBGet).toBeCalledTimes(1);
			expect(result).toEqual(testProductInCart);
			//resetMock(mockDBGet);
		});

		test("Get product in cart failed - Product found but empty stock", async () => {
			const testProductInCartModel = "iPhone10";

			const mockDBGet = jest.spyOn(db, "get");
			mockDBGet.mockImplementationOnce((sql, params, callback) => {
				callback(null, { AvailableQuantity: 0 });
				return {} as Database;
			});

			await expect(
				cartDAO.getProduct(testProductInCartModel)
			).rejects.toBeInstanceOf(EmptyProductStockError);
			expect(mockDBGet).toBeCalledTimes(1);
			//resetMock(mockDBGet);
		});

		test("Get product in cart failed - Product not found", async () => {
			const testProductInCart = new ProductInCart(
				"iPhone13",
				1,
				Category.SMARTPHONE,
				1000.0
			);

			const mockDBGet = jest.spyOn(db, "get");
			mockDBGet.mockImplementationOnce((sql, params, callback) => {
				callback(null, false);
				return {} as Database;
			});

			await expect(
				cartDAO.getProduct(testProductInCart.model)
			).rejects.toBeInstanceOf(ProductNotFoundError);
			expect(mockDBGet).toBeCalledTimes(1);
			//resetMock(mockDBGet);
		});
	});

	describe("DAO - Create cart", () => {
		let cartDAO: CartDAO;

		beforeAll(() => {
			cartDAO = new CartDAO();
		});

		afterEach(() => {
			jest.restoreAllMocks();
			jest.clearAllMocks();
		});

		test("Create cart successful", async () => {
			const testUser = new User(
				"test",
				"test",
				"test",
				Role.CUSTOMER,
				"",
				""
			);
			const testCardId = 1;

			const mockDBRun = jest.spyOn(db, "run");
			const mockDBGet = jest.spyOn(db, "get");
			mockDBRun.mockImplementationOnce((sql, params, callback) => {
				callback.call({ lastID: 1 }, null);
				return {} as Database;
			});

			mockDBGet.mockImplementationOnce((sql, params, callback) => {
				callback(null, { CartId: testCardId });
				return {} as Database;
			});

			const result = await cartDAO.createCart(testUser);

			expect(mockDBRun).toBeCalledTimes(1);
			expect(mockDBGet).toBeCalledTimes(1);
			expect(result).toBe(testCardId);
		});

		test("Create cart failed - No cart found", async () => {
			const testUser = new User(
				"test",
				"test",
				"test",
				Role.CUSTOMER,
				"",
				""
			);
			const testCardId = 1;

			const mockDBRun = jest.spyOn(db, "run");
			const mockDBGet = jest.spyOn(db, "get");
			mockDBRun.mockImplementationOnce((sql, params, callback) => {
				callback.call({ lastID: 1 }, null);
				return {} as Database;
			});

			mockDBGet.mockImplementationOnce((sql, params, callback) => {
				callback(null, false);
				return {} as Database;
			});

			await expect(cartDAO.createCart(testUser)).rejects.toBeInstanceOf(
				CartNotFoundError
			);

			expect(mockDBRun).toBeCalledTimes(1);
			expect(mockDBGet).toBeCalledTimes(1);
		});
	});

	describe("DAO - Checkout cart", () => {
		let cartDAO: CartDAO;

		beforeAll(() => {
			cartDAO = new CartDAO();
		});

		afterEach(() => {
			jest.restoreAllMocks();
			jest.clearAllMocks();
		});

		test("Checkout cart successful", async () => {
			const username = "test";
			const mockDBRun = jest.spyOn(db, "run");
			mockDBRun.mockImplementationOnce((sql, params, callback) => {
				callback(null);
				return {} as Database;
			});

			const result = await cartDAO.checkoutCart(username);

			expect(mockDBRun).toBeCalledTimes(1);
			expect(result).toBe(true);
		});
	});

	describe("DAO - Add product to cart", () => {
		let cartDAO: CartDAO;

		beforeAll(() => {
			cartDAO = new CartDAO();
		});

		afterEach(() => {
			jest.clearAllMocks();
			jest.restoreAllMocks();
		});

		test("Add to cart successful - Cart already existing", async () => {
			const testCartId = 1;
			const testQuantityInside = 3;
			const testProductInCart = new ProductInCart(
				"iPhone13",
				2,
				Category.SMARTPHONE,
				1000.0
			);

			const mockDBGet = jest.spyOn(db, "get");
			const mockDBRun = jest.spyOn(db, "run");

			mockDBGet.mockImplementationOnce((sql, params, callback) => {
				callback(null, { Quantity: testQuantityInside });
				return {} as Database;
			});

			mockDBRun.mockImplementation((sql, params, callback) => {
				callback(null, false);
				return {} as Database;
			});

			const result = await cartDAO.addProductToCart(
				testCartId,
				testProductInCart
			);

			expect(mockDBGet).toBeCalledTimes(1);
			expect(mockDBRun).toBeCalledTimes(2);
			expect(result).toBe(true);
		});

		test("Add to cart successful - Cart not existing yet", async () => {
			const testCartId = 1;
			const testProductInCart = new ProductInCart(
				"iPhone13",
				2,
				Category.SMARTPHONE,
				1000.0
			);

			const mockDBGet = jest.spyOn(db, "get");
			const mockDBRun = jest.spyOn(db, "run");

			mockDBGet.mockImplementationOnce((sql, params, callback) => {
				callback(null, false);
				return {} as Database;
			});

			mockDBRun.mockImplementation((sql, params, callback) => {
				callback(null, false);
				return {} as Database;
			});

			const result = await cartDAO.addProductToCart(
				testCartId,
				testProductInCart
			);

			expect(mockDBGet).toBeCalledTimes(1);
			expect(mockDBRun).toBeCalledTimes(2);
			expect(result).toBe(true);
		});
	});
	/*
    describe("DAO - Update cart", () => {
        let cartDAO: CartDAO;

        beforeAll(() => {
            cartDAO = new CartDAO();
        });

        afterEach(() => {
            jest.clearAllMocks();
            jest.restoreAllMocks();
        });

        test("Update cart successful - Cart already existing", async () => {
            const testUser = new User("test", "test", "test", Role.CUSTOMER, "", "");
            const testProductsInCart = [
                new ProductInCart("iPhone13", 1, Category.SMARTPHONE, 1000.0),
                new ProductInCart("iPhone15", 1, Category.SMARTPHONE, 1200.0)
            ];
            const testCart = new Cart(testUser.username, false, "", 2200.0, testProductsInCart);

            const mockDBGet = jest.spyOn(db, "get");
            const mockDBRun = jest.spyOn(db, "run");

            // Get cart id -> success
            mockDBGet.mockImplementationOnce((sql, params, callback) => {
                callback(null, {CartId: 1});
                return {} as Database;
            });

            // Update cart with new total
            mockDBRun.mockImplementationOnce((sql, params, callback) => {
                callback(null);
                return {} as Database;
            });

            // Delete products in cart of specified cart
            mockDBRun.mockImplementationOnce((sql, params, callback) => {
                callback(null);
                return {} as Database;
            });

            // Re-Insert each product of the cart into products in cart
            testCart.products.forEach( _ => {
                mockDBRun.mockImplementationOnce((sql, params, callback) => {
                    callback(null);
                    return {} as Database;
                });
            });

            const result = await cartDAO.updateCart(testCart);

            expect(mockDBGet).toBeCalledTimes(1);
            expect(mockDBRun).toBeCalledTimes(4);
            expect(result).toBe(true);
        });

        test("Update cart successful - Cart not existing yet", async () => {
            const testUser = new User("test", "test", "test", Role.CUSTOMER, "", "");
            const testProductsInCart = [
                new ProductInCart("iPhone13", 1, Category.SMARTPHONE, 1000.0),
                new ProductInCart("iPhone15", 1, Category.SMARTPHONE, 1200.0)
            ];
            const testCart = new Cart(testUser.username, false, "", 2200.0, testProductsInCart);

            const mockDBGet = jest.spyOn(db, "get");
            const mockDBRun = jest.spyOn(db, "run");

            // Get cart id -> fail
            mockDBGet.mockImplementationOnce((sql, params, callback) => {
                callback(null, false);
                return {} as Database;
            });

            // Insert into cart
            mockDBRun.mockImplementationOnce( function (sql, params, callback)  {
                const lastID = 1
                callback.call({lastID: 1}, null);
                return {} as Database;
            });

            // Delete products in cart of specified cart
            mockDBRun.mockImplementationOnce((sql, params, callback) => {
                callback(null);
                return {} as Database;
            });

            // Re-Insert each product of the cart into products in cart
            testCart.products.forEach( _ => {
                mockDBRun.mockImplementationOnce((sql, params, callback) => {
                    callback(null);
                    return {} as Database;
                });
            });

            const result = await cartDAO.updateCart(testCart);

            expect(mockDBGet).toBeCalledTimes(1);
            expect(mockDBRun).toBeCalledTimes(4);
            expect(result).toBe(true);
        });
    });
    */

	describe("DAO - Fetch paid carts", () => {
		let cartDAO: CartDAO;

		beforeAll(() => {
			cartDAO = new CartDAO();
		});

		afterEach(() => {
			jest.restoreAllMocks();
			jest.clearAllMocks();
		});

		test("Fetch paid carts successful - Empty set", async () => {
			const testUser = new User(
				"test",
				"test",
				"test",
				Role.CUSTOMER,
				"",
				""
			);
			const testCartsDB: Cart[] = [];

			const mockDBAllEmpty = jest.spyOn(db, "all");

			mockDBAllEmpty.mockImplementationOnce((sql, params, callback) => {
				callback(null, false);
				return {} as Database;
			});
			const result = await cartDAO.fetchPaidCarts(testUser.username);

			expect(mockDBAllEmpty).toBeCalledTimes(1);
			expect(result).toEqual(testCartsDB);
		});

		test("Fetch paid carts successful - Not empty", async () => {
			const testUser = new User(
				"test",
				"test",
				"test",
				Role.CUSTOMER,
				"",
				""
			);
			const testCarts = [{
				id: 2,
				cart: new Cart(
					testUser.username,
					true,
					"2024-03-20",
					2000.0,
					[]
					)
			}];
			const testCartsDB = [
				{
					CartId: 2,
					Paid: 1,
					PaymentDate: "2024-03-20",
					Total: 2000.0,
					Username: testUser.username
				}
			];

			const mockDBAll = jest.spyOn(db, "all");

			mockDBAll.mockImplementationOnce((sql, params, callback) => {
				callback(null, testCartsDB);
				return {} as Database;
			});

			const result = await cartDAO.fetchPaidCarts(testUser.username);
			expect(mockDBAll).toBeCalledTimes(1);
			expect(result).toStrictEqual(testCarts);
		});
	});

	describe("DAO - Get current cart id", () => {
		let cartDAO: CartDAO;

		beforeAll(() => {
			cartDAO = new CartDAO();
		});

		afterEach(() => {
			jest.restoreAllMocks();
			jest.clearAllMocks();
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

			const mockDBGet = jest.spyOn(db, "get");
			mockDBGet.mockImplementationOnce((sql, params, callback) => {
				callback(null, { CartId: testCardId });
				return {} as Database;
			});

			const result = await cartDAO.getCurrentCartId(testUser);
			expect(mockDBGet).toBeCalledTimes(1);
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

			const mockDBGet = jest.spyOn(db, "get");
			mockDBGet.mockImplementationOnce((sql, params, callback) => {
				callback(null, false);
				return {} as Database;
			});

			await expect(
				cartDAO.getCurrentCartId(testUser)
			).rejects.toBeInstanceOf(CartNotFoundError);
			expect(mockDBGet).toBeCalledTimes(1);
		});
	});

	describe("DAO - Remove product from cart", () => {
		let cartDAO: CartDAO;

		beforeAll(() => {
			cartDAO = new CartDAO();
		});

		afterEach(() => {
			jest.restoreAllMocks();
			jest.clearAllMocks();
		});

		test("Remove successful", async () => {
			const testUser = new User(
				"test",
				"test",
				"test",
				Role.CUSTOMER,
				"",
				""
			);
			const testProductsInCart = [
				new ProductInCart("iPhone13", 1, Category.SMARTPHONE, 1000.0),
				new ProductInCart("iPhone15", 1, Category.SMARTPHONE, 1200.0),
			];
			const testCart = new Cart(
				testUser.username,
				false,
				"",
				2200.0,
				testProductsInCart
			);
			const testCartId = 1;

			const mockDAOExistsProduct = jest
				.spyOn(ProductDAO.prototype, "existsProduct")
				.mockResolvedValueOnce(true);

			const mockDAOGetId = jest
			.spyOn(CartDAO.prototype, "getCurrentCartId")
			.mockResolvedValueOnce(testCartId);

			const mockDAOGet = jest
				.spyOn(CartDAO.prototype, "getCurrentCart")
				.mockResolvedValueOnce(testCart);

			const mockDBRun = jest.spyOn(db, "run");
			mockDBRun.mockImplementationOnce((sql, params, callback) => {
				callback(null);
				return {} as Database;
			});

			mockDBRun.mockImplementationOnce((sql, params, callback) => {
				callback(null);
				return {} as Database;
			});

			const result = await cartDAO.removeProductFromCart(
				testUser,
				testProductsInCart[1].model
			);

			expect(mockDAOExistsProduct).toBeCalledTimes(1);
			expect(mockDAOGetId).toBeCalledTimes(1);
			expect(mockDAOGet).toBeCalledTimes(1);
			expect(mockDBRun).toBeCalledTimes(2);
			expect(result).toBe(true);
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
				new ProductInCart("iPhone13", 1, Category.SMARTPHONE, 1000.0),
				new ProductInCart("iPhone15", 2, Category.SMARTPHONE, 1200.0),
			];
			const testProductsInCartAfter = [
				new ProductInCart("iPhone13", 1, Category.SMARTPHONE, 1000.0),
				new ProductInCart("iPhone15", 1, Category.SMARTPHONE, 1200.0),
			];
			const testCartBefore = new Cart(
				testUser.username,
				false,
				"",
				2200.0,
				testProductsInCartBefore
			);
			const testCartId = 1;

			const mockDAOExistsProduct = jest
				.spyOn(ProductDAO.prototype, "existsProduct")
				.mockResolvedValueOnce(true);

			const mockDAOGetId = jest
			.spyOn(CartDAO.prototype, "getCurrentCartId")
			.mockResolvedValueOnce(testCartId);

			const mockDAOGet = jest
				.spyOn(CartDAO.prototype, "getCurrentCart")
				.mockResolvedValueOnce(testCartBefore);

			const mockDBRun = jest.spyOn(db, "run");
			mockDBRun.mockImplementationOnce((sql, params, callback) => {
				callback(null);
				return {} as Database;
			});

			mockDBRun.mockImplementationOnce((sql, params, callback) => {
				callback(null);
				return {} as Database;
			});

			const result = await cartDAO.removeProductFromCart(
				testUser,
				testProductsInCartBefore[1].model
			);

			expect(mockDAOExistsProduct).toBeCalledTimes(1);
			expect(mockDAOGetId).toBeCalledTimes(1);
			expect(mockDAOGet).toBeCalledTimes(1);
			expect(mockDBRun).toBeCalledTimes(2);
			expect(result).toBe(true);
		});

		test("Remove failed - Product not found in db", async() => {
			const testUser = new User(
				"test",
				"test",
				"test",
				Role.CUSTOMER,
				"",
				""
			);
			const testProductsInCart = [
				new ProductInCart("iPhone13", 1, Category.SMARTPHONE, 1000.0),
				new ProductInCart("iPhone15", 1, Category.SMARTPHONE, 1200.0),
			];
			const testCart = new Cart(
				testUser.username,
				false,
				"",
				2200.0,
				testProductsInCart
			);
			const testCartId = 1;

			const mockDAOExistsProduct = jest
				.spyOn(ProductDAO.prototype, "existsProduct")
				.mockResolvedValueOnce(false);

			const mockDAOGetId = jest
			.spyOn(CartDAO.prototype, "getCurrentCartId")
			.mockResolvedValueOnce(testCartId);

			const mockDAOGet = jest
				.spyOn(CartDAO.prototype, "getCurrentCart")
				.mockResolvedValueOnce(testCart);

			await expect(
				cartDAO.removeProductFromCart(testUser, "HP")
			).rejects.toBeInstanceOf(ProductNotFoundError);

			expect(mockDAOExistsProduct).toBeCalledTimes(1);
			expect(mockDAOGetId).toBeCalledTimes(1);
			expect(mockDAOGet).toBeCalledTimes(1);
		})

		test("Remove failed - Product not found in cart", async () => {
			const testUser = new User(
				"test",
				"test",
				"test",
				Role.CUSTOMER,
				"",
				""
			);
			const testProductsInCart = [
				new ProductInCart("iPhone13", 1, Category.SMARTPHONE, 1000.0),
				new ProductInCart("iPhone15", 1, Category.SMARTPHONE, 1200.0),
			];
			const testCart = new Cart(
				testUser.username,
				false,
				"",
				2200.0,
				testProductsInCart
			);
			const testCartId = 1;

			const mockDAOExistsProduct = jest
				.spyOn(ProductDAO.prototype, "existsProduct")
				.mockResolvedValueOnce(true);

			const mockDAOGetId = jest
			.spyOn(CartDAO.prototype, "getCurrentCartId")
			.mockResolvedValueOnce(testCartId);

			const mockDAOGet = jest
				.spyOn(CartDAO.prototype, "getCurrentCart")
				.mockResolvedValueOnce(testCart);

			await expect(
				cartDAO.removeProductFromCart(testUser, "HP")
			).rejects.toBeInstanceOf(ProductNotInCartError);

			expect(mockDAOExistsProduct).toBeCalledTimes(1);
			expect(mockDAOGetId).toBeCalledTimes(1);
			expect(mockDAOGet).toBeCalledTimes(1);
		});

		test("Remove failed - Empty cart", async () => {
			const testUser = new User(
				"test",
				"test",
				"test",
				Role.CUSTOMER,
				"",
				""
			);
			const testCart = new Cart(
				testUser.username,
				false,
				"",
				0.0,
				[]
			);
			const testCartId = 1;

			const mockDAOExistsProduct = jest
				.spyOn(ProductDAO.prototype, "existsProduct")
				.mockResolvedValueOnce(true);

			const mockDAOGetId = jest
			.spyOn(CartDAO.prototype, "getCurrentCartId")
			.mockResolvedValueOnce(testCartId);

			const mockDAOGet = jest
				.spyOn(CartDAO.prototype, "getCurrentCart")
				.mockResolvedValueOnce(testCart);

			await expect(
				cartDAO.removeProductFromCart(testUser, "HP")
			).rejects.toBeInstanceOf(ProductNotInCartError);

			expect(mockDAOExistsProduct).toBeCalledTimes(1);
			expect(mockDAOGetId).toBeCalledTimes(1);
			expect(mockDAOGet).toBeCalledTimes(1);
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

			const mockDAOExistsProduct = jest
				.spyOn(ProductDAO.prototype, "existsProduct")
				.mockResolvedValueOnce(true);

			const mockDAOGetId = jest
			.spyOn(CartDAO.prototype, "getCurrentCartId")
			.mockRejectedValueOnce(new CartNotFoundError());

			await expect(
				cartDAO.removeProductFromCart(testUser, "HP")
			).rejects.toBeInstanceOf(CartNotFoundError);

			expect(mockDAOExistsProduct).toBeCalledTimes(1);
			expect(mockDAOGetId).toBeCalledTimes(1);
		});
	});

	describe("DAO - Clear cart", () => {
		let cartDAO: CartDAO;

		beforeAll(() => {
			cartDAO = new CartDAO();
		});

		afterEach(() => {
			jest.restoreAllMocks();
			jest.clearAllMocks();
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
			const testCardId = 1;
			const mockDAOUpdate = jest
				.spyOn(CartDAO.prototype, "getCurrentCartId")
				.mockResolvedValueOnce(testCardId);

			const mockDBRUn = jest.spyOn(db, "run");
			mockDBRUn.mockImplementationOnce((sql, params, callback) => {
				callback(null);
				return {} as Database;
			});

			mockDBRUn.mockImplementationOnce((sql, params, callback) => {
				callback(null);
				return {} as Database;
			});

			const result = await cartDAO.clearCart(testUser);

			expect(mockDAOUpdate).toBeCalledTimes(1);
			expect(mockDBRUn).toBeCalledTimes(2);
			expect(result).toBe(true);
		});

		test("Clear cart failed - No cart to clear", async () => {
			const testUser = new User(
				"test",
				"test",
				"test",
				Role.CUSTOMER,
				"",
				""
			);
			const mockDAOUpdate = jest
				.spyOn(CartDAO.prototype, "getCurrentCartId")
				.mockRejectedValueOnce(new CartNotFoundError());

			const mockDBRUn = jest.spyOn(db, "run");

			await expect(cartDAO.clearCart(testUser)).rejects.toBeInstanceOf(CartNotFoundError);

			expect(mockDAOUpdate).toBeCalledTimes(1);
			expect(mockDBRUn).toBeCalledTimes(0);
		});
	});

	describe("DAO - Delete all carts", () => {
		afterEach(() => {
			jest.restoreAllMocks();
			jest.clearAllMocks();
		});

		test("Delete successful", async () => {
			const cartDAO = new CartDAO();

			const mockDBRun = jest.spyOn(db, "run");
			mockDBRun.mockImplementationOnce((sql, callback) => {
				callback(null);
				return {} as Database;
			});
			mockDBRun.mockImplementationOnce((sql, callback) => {
				callback(null);
				return {} as Database;
			});

			const result = await cartDAO.deleteAllCarts();
			expect(mockDBRun).toBeCalledTimes(2);
			expect(result).toBe(true);

			//resetMock(mockDBRun);
		});
	});

	describe("DAO - Fetch all carts", () => {
		let cartDAO: CartDAO;

		beforeAll(() => {
			cartDAO = new CartDAO();
		});

		afterEach(() => {
			jest.restoreAllMocks();
			jest.clearAllMocks();
		});

		test("Fetch all carts successful", async () => {
			const testUser = new User(
				"test",
				"test",
				"test",
				Role.CUSTOMER,
				"",
				""
			);
			const testProductsInCart1 = [
				new ProductInCart("iPhone13", 1, Category.SMARTPHONE, 1000.0),
				new ProductInCart("iPhone15", 1, Category.SMARTPHONE, 1200.0),
			];
			const testProductsInCart2 = [
				new ProductInCart("iPhoneX", 1, Category.SMARTPHONE, 800.0),
				new ProductInCart("iPhone8", 1, Category.SMARTPHONE, 1200.0),
			];
			const testCarts = [
				{
					id: 1,
					cart: new Cart(testUser.username, false, "", 2200.0, []),
				},
				{
					id: 2,
					cart: new Cart(
						testUser.username,
						true,
						"2024-03-20",
						2000.0,
						[]
					),
				},
			];
			const testCartsDB = [
				{
					Username: "test",
					CartId: 1,
					Paid: 0,
					PaymentDate: "",
					Total: 2200.0,
				},
				{
					Username: "test",
					CartId: 2,
					Paid: 1,
					PaymentDate: "2024-03-20",
					Total: 2000.0,
				},
			];

			const mockDBAll = jest.spyOn(db, "all");

			mockDBAll.mockImplementationOnce((sql, callback) => {
				callback(null, testCartsDB);
				return {} as Database;
			});

			const result = await cartDAO.fetchAllCarts();

			expect(mockDBAll).toBeCalledTimes(1);
			expect(result).toEqual(testCarts);
		});
	});

	describe("DAO - Fetch product in cart", () => {
		let cartDAO: CartDAO;

		beforeAll(() => {
			cartDAO = new CartDAO();
		});

		afterEach(() => {
			jest.restoreAllMocks();
			jest.clearAllMocks();
		});

		test("Fetch product in cart successful", async () => {
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

			const mockDBAll = jest.spyOn(db, "all");

			mockDBAll.mockImplementationOnce((sql, params, callback) => {
				callback(null, testProductsInCartDB);
				return {} as Database;
			});

			const result = await cartDAO.fetchProducts(testCardId);
			expect(mockDBAll).toBeCalledTimes(1);
			expect(result).toStrictEqual(testProductsInCart);
		});

		test("Fetch products in cart successful - Empty set", async () => {
			const testCardId = 1;
			const testProductsInCartDB: any[] = [];

			const mockDBAll = jest.spyOn(db, "all");

			mockDBAll.mockImplementationOnce((sql, params, callback) => {
				callback(null, testProductsInCartDB);
				return {} as Database;
			});

			const result = await cartDAO.fetchProducts(testCardId);
			expect(mockDBAll).toBeCalledTimes(1);
			expect(result).toStrictEqual(testProductsInCartDB);
		});
	});
});
