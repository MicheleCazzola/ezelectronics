import { describe, test, expect, beforeAll, afterEach, jest } from "@jest/globals"

import CartDAO from "../../src/dao/cartDAO"
import db from "../../src/db/db"
import { cleanup } from "../../src/db/cleanup"
import { Database } from "sqlite3";
import { Category } from "../../src/components/product";
import { Cart, ProductInCart } from "../../src/components/cart";
import { Role, User } from "../../src/components/user";
import { CartNotFoundError, ProductNotInCartError } from "../../src/errors/cartError";
import { EmptyProductStockError, ProductNotFoundError } from "../../src/errors/productError";
import UserDAO from "../../src/dao/userDAO";
import ProductDAO from "../../src/dao/productDAO";

/* OLD FUNCTIONS USED TO TRY CLEANUP
function deleteTable(tableName: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
        db.run(`DELETE FROM ${tableName}`, function(err) {
            if (err) reject(err);
            else {
                console.log(`Delete from ${tableName} involved ${this.changes} rows`);
                resolve();
            }
        });
    });
}

function cleanup_custom() {
    const tables = ["PRODUCT_IN_CART", "REVIEW", "CART", "USERS", "PRODUCT_DESCRIPTOR", "SQLITE_SEQUENCE"];
    Promise
    console.log("CLEANUP DONE");
}

async function cleanup_cart_users() {
    const tables = ["PRODUCT_IN_CART", "REVIEW", "CART", "USERS", "PRODUCT_DESCRIPTOR", "SQLITE_SEQUENCE"];
    deleteTable(tables[0])
        .then(() => deleteTable(tables[1])
            .then(() => deleteTable(tables[2])
                .then(() => deleteTable(tables[3]))
                    .then(() => deleteTable(tables[4])
                        .then(() => deleteTable(tables[5])))))
        .catch(err => console.log(err))
}
*/


describe("DAO tests", () => {

    describe("DAO - Create cart", () => {
        let cartDAO: CartDAO;
        let userDAO: UserDAO;

        beforeAll(async () => {
            cartDAO = new CartDAO();
            userDAO = new UserDAO();

            const beforeCleanupResult = await cleanup();
            //console.log(`BEFORE\n${beforeCleanupResult}`);
        });

        afterEach(async () => {
            const afterCleanupResult = await cleanup();
            //console.log(`AFTER\n${afterCleanupResult}`);
        });

        test("Create cart successful - Empty cart", async () => {
            const testUser = new User("test", "test", "test", Role.CUSTOMER, "", "");
            const testCardId = 1;
            
            await userDAO.createUser(testUser.username, testUser.name, testUser.surname, "test", testUser.role);
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

        test("Add to cart successful - Product not yet in cart", async() => {
            const testUser = new User("test", "test", "test", Role.CUSTOMER, "", "");
            const testProductsInCart = [
                new ProductInCart("iPhone13", 2, Category.SMARTPHONE, 1000.0),
                new ProductInCart("iPhone15", 3, Category.SMARTPHONE, 1200.0)
            ];
            const testCart = new Cart("test", false, "", 5600.0, testProductsInCart);
            
            // Setup
            const product1 = await prodDAO.createProduct("iPhone13", Category.SMARTPHONE, 4, "", 1000.0, null);
            const product2 = await prodDAO.createProduct("iPhone15", Category.SMARTPHONE, 4, "", 1200.0, null);
            const user = await userDAO.createUser(testUser.username, testUser.name, testUser.surname, "test", testUser.role);
            const cartId = await cartDAO.createCart(testUser);

            // Test
            const added = await cartDAO.addProductToCart(cartId, testProductsInCart[0]);
            await cartDAO.addProductToCart(cartId, testProductsInCart[1]);

            // Check
            const result = await cartDAO.getCurrentCart(testUser);
            
            expect(result).toBe(testCart);
        });


        test("Add to cart successful - Product already in cart", async() => {
            const testUser = new User("test", "test", "test", Role.CUSTOMER, "", "");
            const testCardId = 1;
            const testProductInCart = new ProductInCart("iPhone13", 2, Category.SMARTPHONE, 1000.0);
            const testCart = new Cart("test", false, "", 4000.0, [testProductInCart]);
            
            // Setup
            const product = await prodDAO.createProduct("iPhone13", Category.SMARTPHONE, 4, "", 1000.0, null);
            const user = await userDAO.createUser(testUser.username, testUser.name, testUser.surname, "test", testUser.role);
            const cartId = await cartDAO.createCart(testUser);
            
            // Test
            const added = await cartDAO.addProductToCart(cartId, testProductInCart);
            await cartDAO.addProductToCart(cartId, testProductInCart);

            // Check
            const result = await cartDAO.getCurrentCart(testUser);
            
            expect(result).toBe(testCart);
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
            const testUser = new User("test", "test", "test", Role.CUSTOMER, "", "");
            const testProductsInCart = [
                new ProductInCart("iPhone13", 2, Category.SMARTPHONE, 1000.0),
                new ProductInCart("iPhone15", 4, Category.SMARTPHONE, 1200.0)
            ];
            const testCart = new Cart(testUser.username, false, "", 4800.0, testProductsInCart);
            const testCartId = 1;
            
            // Setup
            await userDAO.createUser(testUser.username, testUser.name, testUser.surname, "test", testUser.role);
            await cartDAO.createCart(testUser);

            for (let prod of testProductsInCart) {
                await prodDAO.createProduct(prod.model, prod.category, prod.quantity, null, prod.price, null);
                await cartDAO.addProductToCart(testCartId, prod);
            }
            
            // Test
            const result = await cartDAO.getCurrentCart(testUser);

            expect(result).toEqual(testCart);
        });

        test("Get current cart successful - Empty cart retrieved", async () => {
            const testUser = new User("test", "test", "test", Role.CUSTOMER, "", "");
            const testCart = new Cart(testUser.username, false, "", 0.0, []);
            const testCartId = 1;
            
            // Setup
            await userDAO.createUser(testUser.username, testUser.name, testUser.surname, "test", testUser.role);
            await cartDAO.createCart(testUser);
            
            // Test
            const result = await cartDAO.getCurrentCart(testUser);

            expect(result).toEqual(testCart);
        });

        test("Get current cart failed - No cart for specific user", async () => {
            const testUser = new User("test", "test", "test", Role.CUSTOMER, "", "");

            // Setup
            await userDAO.createUser(testUser.username, testUser.name, testUser.surname, "test", testUser.role);

            // Test
            await expect(cartDAO.getCurrentCart(testUser)).rejects.toBeInstanceOf(CartNotFoundError);
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
            const testProductInCart1 = new ProductInCart("iPhone13", 1, Category.SMARTPHONE, 1000.0);

            // Setup
            const product1 = await productDAO.createProduct("iPhone13", Category.SMARTPHONE, 4, "", 1000.0, null);
            const product2 = await productDAO.createProduct("iPhone11", Category.SMARTPHONE, 4, "", 400.0, null);

            // Test
            const result = await cartDAO.getProduct(testProductInCart1.model);

            expect(result).toStrictEqual(testProductInCart1);
        });

        test("Get product failed - Product found but empty stock", async () => {
            // Setup
            const product1 = await productDAO.createProduct("iPhone13", Category.SMARTPHONE, 0, "", 1000.0, null);
            const product2 = await productDAO.createProduct("iPhone11", Category.SMARTPHONE, 1, "", 400.0, null);

            // Test
            await expect(cartDAO.getProduct("iPhone13")).rejects.toBeInstanceOf(EmptyProductStockError);
        });

        test("Get product failed - Product not found", async () => {
            // Setup
            const product2 = await productDAO.createProduct("iPhone11", Category.SMARTPHONE, 1, "", 400.0, null);
    
            // Test
            await expect(cartDAO.getProduct("iPhone13")).rejects.toBeInstanceOf(ProductNotFoundError);
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
            const testUser = new User("test", "test", "test", Role.CUSTOMER, "", "");
            const testCardId = 1;

            // Setup
            const user = await userDAO.createUser(testUser.username, testUser.name, testUser.surname, "test", testUser.role);
            await cartDAO.createCart(testUser);

            // Test
            const result = await cartDAO.getCurrentCartId(testUser);

            expect(result).toBe(testCardId);
        });

        test("Get id failed - No cart", async () => {
            const testUser = new User("test", "test", "test", Role.CUSTOMER, "", "");
            const testCardId = 1;

            // Setup
            const user = await userDAO.createUser(testUser.username, testUser.name, testUser.surname, "test", testUser.role);

            // Test
            await expect(cartDAO.getCurrentCartId(testUser)).rejects.toBeInstanceOf(CartNotFoundError);
        });
    });

    describe.skip("DAO - Checkout cart", () => {
        let cartDAO: CartDAO;

        beforeAll(() => {
            cartDAO = new CartDAO();
        });

        afterEach(() => {
            jest.restoreAllMocks();
            jest.clearAllMocks();
        });

        test("Checkout cart successful", async() => {
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

    describe.skip("DAO - Update cart", () => {
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

    describe.skip("DAO - Get paid carts", () => {
        let cartDAO: CartDAO;

        beforeAll(() => {
            cartDAO = new CartDAO();
        });

        afterEach(() => {
            jest.restoreAllMocks();
            jest.clearAllMocks();
        });

        test("Get paid carts successful - Empty set", async () => {
            const testUser = new User("test", "test", "test", Role.CUSTOMER, "", "");
            const testCartsDB: Cart[] = [];

            const mockDBAllEmpty = jest.spyOn(db, "all");

            mockDBAllEmpty.mockImplementationOnce((sql, params, callback) => {
                callback(null, false);
                return {} as Database;
            });
            const result = await cartDAO.getPaidCarts(testUser);

            expect(mockDBAllEmpty).toBeCalledTimes(1);
            expect(result).toEqual(testCartsDB);
            //resetMock(mockDBAllEmpty);
        });


        test("Get paid carts successful - Not empty", async () => {
            const testUser = new User("test", "test", "test", Role.CUSTOMER, "", "");
            const testProductsInCart1 = [
                new ProductInCart("iPhone13", 1, Category.SMARTPHONE, 1000.0),
                new ProductInCart("iPhone15", 1, Category.SMARTPHONE, 1200.0)
            ];
            const testProductsInCart2 = [
                new ProductInCart("iPhoneX", 1, Category.SMARTPHONE, 800.0),
                new ProductInCart("iPhone8", 1, Category.SMARTPHONE, 1200.0)
            ];
            const testCarts = [
                new Cart(testUser.username, false, "", 2200.0, testProductsInCart1),
                new Cart(testUser.username, true, "2024-03-20", 2000.0, testProductsInCart2)
            ];
            const testCartsDB = [
                {
                    "CartId": 2,
                    "Paid": true,
                    "PaymentDate": "2024-03-20",
                    "Total": 2000.0
                },
            ];
            const testProductsInCart2DB = [
                {
                    "Model": "iPhoneX",
                    "Quantity": 1,
                    "Category": Category.SMARTPHONE,
                    "SellingPrice": 800.0
                },
                {
                    "Model": "iPhone8",
                    "Quantity": 1,
                    "Category": Category.SMARTPHONE,
                    "SellingPrice": 1200.0
                }
            ];

            const mockDBAll = jest.spyOn(db, "all");

            mockDBAll.mockImplementationOnce((sql, params, callback) => {
                callback(null, testCartsDB);
                return {} as Database;
            });

            testCartsDB.forEach(cartDB => {
                mockDBAll.mockImplementationOnce((sql, params, callback) => {
                    callback(null, testProductsInCart2DB);
                    return {} as Database;
                });
            });

            const result = await cartDAO.getPaidCarts(testUser);
            expect(mockDBAll).toBeCalledTimes(2);
            expect(result).toEqual([testCarts[1]]);
            //resetMock(mockDBAll);
        });

    });

    describe.skip("DAO - Remove product from cart", () => {
        let cartDAO: CartDAO;

        beforeAll(() => {
            cartDAO = new CartDAO();
        });

        afterEach(() => {
            jest.restoreAllMocks();
            jest.clearAllMocks();
        });

        test("Remove successful", async () => {
            const testUser = new User("test", "test", "test", Role.CUSTOMER, "", "");
            const testProductsInCart = [
                new ProductInCart("iPhone13", 1, Category.SMARTPHONE, 1000.0),
                new ProductInCart("iPhone15", 1, Category.SMARTPHONE, 1200.0)
            ];
            const testCart = new Cart(testUser.username, false, "", 2200.0, testProductsInCart);

            const mockDAOGet = jest.spyOn(CartDAO.prototype, "getCurrentCart").mockResolvedValueOnce(testCart);
            const mockDAOUpdate = jest.spyOn(CartDAO.prototype, "updateCart").mockResolvedValueOnce(true);

            const result = await cartDAO.removeProductFromCart(testUser, testProductsInCart[1].model);

            expect(mockDAOGet).toBeCalledTimes(1);
            expect(mockDAOUpdate).toBeCalledTimes(1);
            expect(result).toBe(true);
        });

        test("Remove failed - Product not found", async () => {
            const testUser = new User("test", "test", "test", Role.CUSTOMER, "", "");
            const testProductsInCart = [
                new ProductInCart("iPhone13", 1, Category.SMARTPHONE, 1000.0),
                new ProductInCart("iPhone15", 1, Category.SMARTPHONE, 1200.0)
            ];
            const testCart = new Cart(testUser.username, false, "", 2200.0, testProductsInCart);

            const mockDAOGet = jest.spyOn(CartDAO.prototype, "getCurrentCart").mockResolvedValueOnce(testCart);
            await expect(cartDAO.removeProductFromCart(testUser, "HP")).rejects.toBeInstanceOf(ProductNotInCartError);

            expect(mockDAOGet).toBeCalledTimes(1);
        });
    })

    describe.skip("DAO - Clear cart", () => {

        let cartDAO: CartDAO;

        beforeAll(() => {
            cartDAO = new CartDAO();
        });

        afterEach(() => {
            jest.restoreAllMocks();
            jest.clearAllMocks();
        });

        test("Clear cart successful", async() => {
            const testUser = new User("test", "test", "test", Role.CUSTOMER, "", "");
            const mockDAOUpdate = jest.spyOn(CartDAO.prototype, "updateCart").mockResolvedValueOnce(true);

            const result = await cartDAO.clearCart(testUser);

            expect(mockDAOUpdate).toBeCalledTimes(1);
            expect(result).toBe(true);
        });
    });

    describe.skip("DAO - Delete all carts", () => {

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

    describe.skip("DAO - Get all carts", () => {

        let cartDAO: CartDAO;

        beforeAll(() => {
            cartDAO = new CartDAO();
        });

        afterEach(() => {
            jest.restoreAllMocks();
            jest.clearAllMocks();
        });

        test("Get all carts successful", async () => {
            const testUser = new User("test", "test", "test", Role.CUSTOMER, "", "");
            const testProductsInCart1 = [
                new ProductInCart("iPhone13", 1, Category.SMARTPHONE, 1000.0),
                new ProductInCart("iPhone15", 1, Category.SMARTPHONE, 1200.0)
            ];
            const testProductsInCart2 = [
                new ProductInCart("iPhoneX", 1, Category.SMARTPHONE, 800.0),
                new ProductInCart("iPhone8", 1, Category.SMARTPHONE, 1200.0)
            ];
            const testCarts = [
                new Cart(testUser.username, false, "", 2200.0, testProductsInCart1),
                new Cart(testUser.username, true, "2024-03-20", 2000.0, testProductsInCart2)
            ];
            const testCartsDB = [
                {
                    "Username": "test",
                    "CartId": 1,
                    "Paid": false,
                    "PaymentDate": "",
                    "Total": 2200.0
                },
                {
                    "Username": "test",
                    "CartId": 2,
                    "Paid": true,
                    "PaymentDate": "2024-03-20",
                    "Total": 2000.0
                },
            ];
            const testProductsInCart1DB = [
                {
                    "Model": "iPhone13",
                    "Quantity": 1,
                    "Category": Category.SMARTPHONE,
                    "SellingPrice": 1000.0
                },
                {
                    "Model": "iPhone15",
                    "Quantity": 1,
                    "Category": Category.SMARTPHONE,
                    "SellingPrice": 1200.0
                }
            ];
            const testProductsInCart2DB = [
                {
                    "Model": "iPhoneX",
                    "Quantity": 1,
                    "Category": Category.SMARTPHONE,
                    "SellingPrice": 800.0
                },
                {
                    "Model": "iPhone8",
                    "Quantity": 1,
                    "Category": Category.SMARTPHONE,
                    "SellingPrice": 1200.0
                }
            ];

            const mockDBAll = jest.spyOn(db, "all");

            mockDBAll.mockImplementationOnce((sql, callback) => {
                callback(null, testCartsDB);
                return {} as Database;
            });

            const testCartDB1 = {...testCartsDB[0], "products": testProductsInCart1DB};
            const testCartDB2 = {...testCartsDB[1], "products": testProductsInCart2DB};

            [testCartDB1, testCartDB2].forEach(cartDB => {
                mockDBAll.mockImplementationOnce((sql, params, callback) => {
                    callback(null, cartDB.products);
                    return {} as Database;
                });
            });

            const result = await cartDAO.getAllCarts();

            expect(mockDBAll).toBeCalledTimes(3);
            expect(result).toEqual(testCarts);
        });
    })
});
