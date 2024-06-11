import {jest, describe, test, beforeAll, beforeEach, afterEach, expect} from "@jest/globals";
import request from "supertest"
import { app } from "../..";
import { Cart, ProductInCart } from "../../src/components/cart";
import { Category } from "../../src/components/product";
import CartController from "../../src/controllers/cartController";
import Authenticator from "../../src/routers/auth";
import { EmptyProductStockError, LowProductStockError, ProductNotFoundError } from "../../src/errors/productError";
import { CartNotFoundError, EmptyCartError, ProductNotInCartError } from "../../src/errors/cartError";
import { cleanup } from "../../src/db/cleanup_custom";
import { Role, User } from "../../src/components/user";
import { Time } from "../../src/utilities";
import { assert } from "console";

const baseURL = "/ezelectronics/carts";
const mockMiddleware: any = undefined;
let agent: any = undefined;

const register_user = async (username: string, role: Role) => {
	return agent.post("/ezelectronics/users").send({
		username: username,
		surname: "surname",
		name: "name",
		password: "password",
		role: role,
	});
};

const login = async (username: string) => {
	return agent
		.post("/ezelectronics/sessions")
		.send({ username: username, password: "password" });
};

const logout = async () => {
	return agent.delete("/ezelectronics/sessions/current");
};

const create_product = async (model: string, quantity: number) => {
	return agent.post("/ezelectronics/products").send({
		model: model,
		category: Category.LAPTOP,
		sellingPrice: 100,
		quantity: quantity,
		details: "details",
		arrivalDate: Time.today(),
	});
};

describe.skip("Carts router tests", () => {

    describe("Add product to cart", () => {
      let customURL: string;
      let ok: number;
      let invalid: number;

      beforeAll(async () => {
        customURL = "/";
        ok = 200;
        invalid = 422;
    
        await cleanup();
      });

      beforeEach(async() => {
        agent = request.agent(app);
        await register_user("c1", Role.CUSTOMER);
        await register_user("c2", Role.CUSTOMER);
        await register_user("m1", Role.MANAGER);
        await register_user("a1", Role.ADMIN);
        await login("m1");
        await create_product("p1", 10)
        await create_product("p2", 10);
        await create_product("p3", 10);
        await create_product("p4", 1);
        await logout();
      });

      afterEach(async () => {
        //await logout();
        //await cleanup();
      });

      test("Add product to cart successful", async () => {
        await login("c1");
        const response = await agent
          .post(baseURL + customURL)
          .send({ model: "p1" });
        console.log(response.body.error);

        expect(response.status).toBe(ok);
      });

      test("Add product to cart failed - Model does not exist", async () => {
        const testErr = new ProductNotFoundError();

        await login("c1");
        const response = await agent
          .post(baseURL + customURL)
          .send({ model: "iPhone12" });

        expect(response.status).toBe(testErr.customCode);
        expect(response.text).toContain(testErr.customMessage);
      });

      // Need checkout cart
      test.skip("Add product to cart failed - Model exists but it has no stock available", async () => {
        const testErr = new EmptyProductStockError();

        await login("c1");
        let response = await agent
          .post(baseURL + customURL)
          .send({ model: "p4" });

        expect(response.status).toBe(ok);

        response = await agent
          .post(baseURL + customURL)
          .send({ model: "p4" });

        //console.log(response.status, response.text);
        expect(response.status).toBe(testErr.customCode);
        expect(response.text).toContain(testErr.customMessage);
      });

      test("Add product to cart failed - Model is an empty string", async () => {
        const testModel = "";

        await login("c1");
        const response = await agent
          .post(baseURL + customURL)
          .send({ model: testModel });

        expect(response.status).toBe(invalid);
      });
    });

    describe("Get current cart", () => {
      let customURL: string;
      let ok: number;

      beforeAll(async () => {
        customURL = "/";
        ok = 200;

        await cleanup();
      });

      afterEach(async () => {
        await cleanup();
      });

      test("Get current cart successful - Unpaid cart already present", async () => {
        const testUser = new User("test", "test", "test", Role.CUSTOMER, "", "");
        const testProductsInCart = [
          new ProductInCart("testModel1", 1, Category.APPLIANCE, 1000.0),
          new ProductInCart("testModel2", 1, Category.APPLIANCE, 500.0),
        ];
        const testCart = new Cart(
          "test",
          true,
          "2024-03-30",
          1500.0,
          testProductsInCart
        );

        // Setup
        agent = request.agent(app);
        await register_user(testUser.username, testUser.role);
        await login(testUser.username);
        const response = await
          agent.get(baseURL + customURL)
          .send({});
        
        expect(response.status).toBe(ok);
        expect(response.body).toEqual(testCart);
      });

      test("Get current cart successful - Unpaid cart not yet present", async () => {
        const testCart = new Cart("test", false, "", 0.0, []);
        const mockControllerGetCart = jest.spyOn(
          CartController.prototype,
          "getCart"
        );

        mockControllerGetCart.mockResolvedValueOnce(testCart);
        const response = await request(app)
          .get(baseURL + customURL)
          .send({});

        expect(Authenticator.prototype.isCustomer).toBeCalledTimes(1);

        expect(mockControllerGetCart).toBeCalledTimes(1);

        expect(response.status).toBe(ok);
        expect(response.body).toEqual(testCart);
      });
    });

    describe("Checkout cart", () => {
      let customURL: string;
      let ok: number;

      beforeAll(() => {
        customURL = "/";
        ok = 200;
      });

      beforeEach(() => {
        jest
          .spyOn(Authenticator.prototype, "isLoggedIn")
          .mockImplementation(mockMiddleware);
        jest
          .spyOn(Authenticator.prototype, "isCustomer")
          .mockImplementation(mockMiddleware);
        jest
          .spyOn(Authenticator.prototype, "isAdminOrManager")
          .mockImplementation(mockMiddleware);
      });

      afterEach(() => {
        jest.clearAllMocks();
        jest.restoreAllMocks();
      });

      test("Checkout cart successful", async () => {
        const mockControllerCheckoutCart = jest.spyOn(
          CartController.prototype,
          "checkoutCart"
        );

        mockControllerCheckoutCart.mockResolvedValueOnce(true);
        const response = await request(app).patch(baseURL + customURL);

        expect(Authenticator.prototype.isCustomer).toBeCalledTimes(1);

        expect(mockControllerCheckoutCart).toBeCalledTimes(1);

        expect(response.status).toBe(ok);
      });

      test("Checkout cart failed - No unpaid cart", async () => {
        const testError = new CartNotFoundError();
        const mockControllerCheckoutCart = jest.spyOn(
          CartController.prototype,
          "checkoutCart"
        );

        mockControllerCheckoutCart.mockRejectedValueOnce(testError);
        const response = await request(app).patch(baseURL + customURL);

        expect(Authenticator.prototype.isCustomer).toBeCalledTimes(1);

        expect(mockControllerCheckoutCart).toBeCalledTimes(1);

        expect(response.status).toBe(testError.customCode);
        expect(response.text).toContain(testError.customMessage);
      });

      test("Checkout cart failed - Unpaid cart empty", async () => {
        const testError = new EmptyCartError();
        const mockControllerCheckoutCart = jest.spyOn(
          CartController.prototype,
          "checkoutCart"
        );

        mockControllerCheckoutCart.mockRejectedValueOnce(testError);
        const response = await request(app).patch(baseURL + customURL);

        expect(Authenticator.prototype.isCustomer).toBeCalledTimes(1);

        expect(mockControllerCheckoutCart).toBeCalledTimes(1);

        expect(response.status).toBe(testError.customCode);
        expect(response.text).toContain(testError.customMessage);
      });

      test("Checkout cart failed - Product in cart with no stock at all", async () => {
        const testError = new EmptyProductStockError();
        const mockControllerCheckoutCart = jest.spyOn(
          CartController.prototype,
          "checkoutCart"
        );

        mockControllerCheckoutCart.mockRejectedValueOnce(testError);
        const response = await request(app).patch(baseURL + customURL);

        expect(Authenticator.prototype.isCustomer).toBeCalledTimes(1);

        expect(mockControllerCheckoutCart).toBeCalledTimes(1);

        expect(response.status).toBe(testError.customCode);
        expect(response.text).toContain(testError.customMessage);
      });

      test("Checkout cart failed - Product in cart with available quantity smaller than requested one", async () => {
        const testError = new LowProductStockError();
        const mockControllerCheckoutCart = jest.spyOn(
          CartController.prototype,
          "checkoutCart"
        );

        mockControllerCheckoutCart.mockRejectedValueOnce(testError);
        const response = await request(app).patch(baseURL + customURL);

        expect(Authenticator.prototype.isCustomer).toBeCalledTimes(1);

        expect(mockControllerCheckoutCart).toBeCalledTimes(1);

        expect(response.status).toBe(testError.customCode);
        expect(response.text).toContain(testError.customMessage);
      });
    });

    describe("Get paid carts", () => {
      let customURL: string;
      let ok: number;

      beforeAll(() => {
        customURL = "/history";
        ok = 200;
      });

      beforeEach(() => {
        jest
          .spyOn(Authenticator.prototype, "isLoggedIn")
          .mockImplementation(mockMiddleware);
        jest
          .spyOn(Authenticator.prototype, "isCustomer")
          .mockImplementation(mockMiddleware);
      });

      afterEach(() => {
        jest.clearAllMocks();
        jest.restoreAllMocks();
      });

      test("Get paid carts successful", async () => {
        const testProductsInCart1 = [
          new ProductInCart("iPhone13", 1, Category.SMARTPHONE, 1000.0),
        ];
        const testProductsInCart2 = [
          new ProductInCart("HP", 1, Category.LAPTOP, 500.0),
        ];
        const testCarts = [
          new Cart("test", true, "2024-02-12", 1000.0, testProductsInCart1),
          new Cart("test", true, "2024-03-12", 500.0, testProductsInCart2),
        ];
        const mockControllerGetPaidCarts = jest.spyOn(
          CartController.prototype,
          "getCustomerCarts"
        );

        mockControllerGetPaidCarts.mockResolvedValueOnce(testCarts);
        const response = await request(app).get(baseURL + customURL);

        expect(Authenticator.prototype.isCustomer).toBeCalledTimes(1);

        expect(mockControllerGetPaidCarts).toBeCalledTimes(1);

        expect(response.status).toBe(ok);
        expect(response.body).toEqual(testCarts);
      });
    });

    describe("Remove product from cart", () => {
        let customURL: string;
        let ok: number;
        let invalid: number;
        let notFound: number;

        beforeAll(() => {
            customURL = "/products";
            ok = 200;
            invalid = 422;
            notFound = 404;
        });

        beforeEach(() => {
            jest
                .spyOn(Authenticator.prototype, "isLoggedIn")
                .mockImplementation(mockMiddleware);
            jest
                .spyOn(Authenticator.prototype, "isCustomer")
                .mockImplementation(mockMiddleware);
        });

        afterEach(() => {
            jest.clearAllMocks();
            jest.restoreAllMocks();
        });

        test("Remove product from cart successful", async () => {
            const testModel = "iPhone13";
            const mockControllerRemoveProductFromCart = jest.spyOn(
            CartController.prototype,
            "removeProductFromCart"
            );

            mockControllerRemoveProductFromCart.mockResolvedValueOnce(true);
            const response = await request(app).delete(
            baseURL + customURL + `/${testModel}`
            );

            expect(Authenticator.prototype.isCustomer).toBeCalledTimes(1);

            expect(mockControllerRemoveProductFromCart).toBeCalledTimes(1);
            expect(mockControllerRemoveProductFromCart).toBeCalledWith(
                undefined,
                testModel
            );

            expect(response.status).toBe(ok);
        });

        test("Remove product from cart failed - Product not in cart", async () => {
            const testModel = "iPhone13";
            const testErr = new ProductNotInCartError();
            const mockControllerRemoveProductFromCart = jest.spyOn(
                CartController.prototype,
                "removeProductFromCart"
            );

            mockControllerRemoveProductFromCart.mockRejectedValueOnce(testErr);
            const response = await request(app).delete(
                baseURL + customURL + `/${testModel}`
            );

            expect(Authenticator.prototype.isCustomer).toBeCalledTimes(1);

            expect(mockControllerRemoveProductFromCart).toBeCalledTimes(1);
            expect(mockControllerRemoveProductFromCart).toBeCalledWith(
                undefined,
                testModel
            );

            expect(response.status).toBe(testErr.customCode);
            expect(response.text).toContain(testErr.customMessage);
        });

        test("Remove product from cart failed - No unpaid cart", async () => {
          const testModel = "iPhone13";
          const testErr = new CartNotFoundError();
          const mockControllerRemoveProductFromCart = jest.spyOn(
            CartController.prototype,
            "removeProductFromCart"
          );

          mockControllerRemoveProductFromCart.mockRejectedValueOnce(testErr);
          const response = await request(app).delete(
            baseURL + customURL + `/${testModel}`
          );

          expect(Authenticator.prototype.isCustomer).toBeCalledTimes(1);

          expect(mockControllerRemoveProductFromCart).toBeCalledTimes(1);
          expect(mockControllerRemoveProductFromCart).toBeCalledWith(
            undefined,
            testModel
          );

          expect(response.status).toBe(testErr.customCode);
          expect(response.text).toContain(testErr.customMessage);
        });

        // Different from APIs but more clear and allowed (issue closed on GitLab)
        test("Remove product from cart failed - Unpaid cart present but empty", async () => {
          const testModel = "iPhone13";
          const testErr = new EmptyCartError();
          const mockControllerRemoveProductFromCart = jest.spyOn(
            CartController.prototype,
            "removeProductFromCart"
          );

          mockControllerRemoveProductFromCart.mockRejectedValueOnce(testErr);
          const response = await request(app).delete(
            baseURL + customURL + `/${testModel}`
          );

          expect(Authenticator.prototype.isCustomer).toBeCalledTimes(1);

          expect(mockControllerRemoveProductFromCart).toBeCalledTimes(1);
          expect(mockControllerRemoveProductFromCart).toBeCalledWith(
            undefined,
            testModel
          );

          expect(response.status).toBe(testErr.customCode);
          expect(response.text).toContain(testErr.customMessage);
        });

        test("Remove product from cart failed - Product not found", async () => {
          const testModel = "iPhone13";
          const testErr = new ProductNotFoundError();
          const mockControllerRemoveProductFromCart = jest.spyOn(
            CartController.prototype,
            "removeProductFromCart"
          );

          mockControllerRemoveProductFromCart.mockRejectedValueOnce(testErr);
          const response = await request(app).delete(
            baseURL + customURL + `/${testModel}`
          );

          expect(Authenticator.prototype.isCustomer).toBeCalledTimes(1);

          expect(mockControllerRemoveProductFromCart).toBeCalledTimes(1);
          expect(mockControllerRemoveProductFromCart).toBeCalledWith(
            undefined,
            testModel
          );

          expect(response.status).toBe(testErr.customCode);
          expect(response.text).toContain(testErr.customMessage);
        });

        test("Remove product from cart failed - Model string empty", async () => {
          const testModel = "";
          const mockControllerRemoveProductFromCart = jest.spyOn(
            CartController.prototype,
            "removeProductFromCart"
          ); 

          mockControllerRemoveProductFromCart.mockRejectedValueOnce(ProductNotFoundError);
          const response = await request(app).delete(
            baseURL + customURL + `/${testModel}`
          );

          expect(mockControllerRemoveProductFromCart).toBeCalledTimes(0);

          expect(response.status).toBe(notFound);
        });
    });

    describe("Empty current cart", () => {
        let customURL: string;
        let ok: number;

        beforeAll(() => {
            customURL = "/current";
            ok = 200;
        });

        beforeEach(() => {
            jest
                .spyOn(Authenticator.prototype, "isLoggedIn")
                .mockImplementation(mockMiddleware);
            jest
                .spyOn(Authenticator.prototype, "isCustomer")
                .mockImplementation(mockMiddleware);
        });

        afterEach(() => {
            jest.clearAllMocks();
            jest.restoreAllMocks();
        });

        test("Empty cart successful", async () => {
            const mockControllerEmptyCart = jest.spyOn(CartController.prototype, "clearCart");

            mockControllerEmptyCart.mockResolvedValueOnce(true);
            const response = await request(app).delete(baseURL + customURL);

            expect(Authenticator.prototype.isCustomer).toBeCalledTimes(1);

            expect(mockControllerEmptyCart).toBeCalledTimes(1);

            expect(response.status).toBe(ok);
        });

        test("Empty cart failed - No unpaid cart", async () => {
            const testErr = new CartNotFoundError();
            const mockControllerEmptyCart = jest.spyOn(CartController.prototype, "clearCart");

            mockControllerEmptyCart.mockRejectedValueOnce(testErr);
            const response = await request(app).delete(baseURL + customURL);

            expect(Authenticator.prototype.isCustomer).toBeCalledTimes(1);

            expect(mockControllerEmptyCart).toBeCalledTimes(1);

            expect(response.status).toBe(testErr.customCode);
            expect(response.text).toContain(testErr.customMessage);
        });
    });

    describe("Delete all carts", () => {
        let customURL: string;
        let ok: number;

        beforeAll(() => {
            customURL = "";
            ok = 200;
        });

        beforeEach(() => {
            jest
                .spyOn(Authenticator.prototype, "isLoggedIn")
                .mockImplementation(mockMiddleware);
            jest
                .spyOn(Authenticator.prototype, "isAdminOrManager")
                .mockImplementation(mockMiddleware);

        });

        afterEach(() => {
            jest.clearAllMocks();
            jest.restoreAllMocks();
        });

        test("Delete all carts successful", async () => {
            const mockControllerDeleteAllCarts = jest.spyOn(CartController.prototype, "deleteAllCarts");

            mockControllerDeleteAllCarts.mockResolvedValue(true);
            const response = await request(app).delete(baseURL + customURL);

            expect(Authenticator.prototype.isAdminOrManager).toBeCalledTimes(1);

            expect(mockControllerDeleteAllCarts).toBeCalledTimes(1);

            expect(response.status).toBe(ok);
        });
    });

    describe("Get all carts", () => {
        let customURL: string;
        let ok: number;

        beforeAll(() => {
            customURL = "/all";
            ok = 200;
        });

        beforeEach(() => {
            jest
                .spyOn(Authenticator.prototype, "isLoggedIn")
                .mockImplementation(mockMiddleware);
            jest
                .spyOn(Authenticator.prototype, "isAdminOrManager")
                .mockImplementation(mockMiddleware);
        });

        afterEach(() => {
            jest.clearAllMocks();
            jest.restoreAllMocks();
        });

        test("Get all carts successful", async () => {
            const testProductsInCart1 = [
                new ProductInCart("iPhone13", 1, Category.SMARTPHONE, 1000.0)
            ];
            const testProductsInCart2 = [
                new ProductInCart("HP", 1, Category.LAPTOP, 500.0)
            ];
            const testCarts = [
                new Cart("test1", true, "2024-02-12", 1000.0, testProductsInCart1),
                new Cart("test2", true, "2024-03-12", 500.0, testProductsInCart2)
            ];
            const mockControllerGetAllCarts = jest.spyOn(CartController.prototype, "getAllCarts");

            mockControllerGetAllCarts.mockResolvedValue(testCarts);
            const response = await request(app).get(baseURL + customURL);

            expect(Authenticator.prototype.isAdminOrManager).toBeCalledTimes(1);

            expect(mockControllerGetAllCarts).toBeCalledTimes(1);

            expect(response.status).toBe(ok);
            expect(response.body).toEqual(testCarts);
        });
    });
})