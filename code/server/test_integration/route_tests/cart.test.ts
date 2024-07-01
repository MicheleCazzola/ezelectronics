import {jest, describe, test, beforeAll, beforeEach, afterEach, expect} from "@jest/globals";
import request from "supertest"
import { app } from "../..";
import { Cart, ProductInCart } from "../../src/components/cart";
import { Category } from "../../src/components/product";
import CartController from "../../src/controllers/cartController";
import Authenticator from "../../src/routers/auth";
import { EmptyProductStockError, LowProductStockError, ProductNotFoundError } from "../../src/errors/productError";
import { CartNotFoundError, EmptyCartError, ProductNotInCartError } from "../../src/errors/cartError";
import { cleanup } from "../../src/db/cleanup";
import { Role, User } from "../../src/components/user";
import { Time } from "../../src/utilities";

const baseURL = "/ezelectronics/carts";
let agent: any = undefined;

const getError = (data: string): string => {
  const cleaned = data.replace(/\\"/g, '"').replace(/\\\\"/g, '\\"');
  return JSON.parse(cleaned).error;
}

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
		sellingPrice: 100.0,
		quantity: quantity,
		details: "details",
		arrivalDate: Time.today(),
	});
};

describe("Carts router tests", () => {
    let okStatus: number;
    let emptyCart: {status: number, text: string};
    let unauthenticated: {status: number, text: string};
    let notACustomer: {status: number, text: string};
    let neitherAdminNorManager: {status: number, text: string};
    let cartNotFound: {status: number, text: string};
    let productNotFound: {status: number, text: string};
    let productNotInCart: {status: number, text: string};
    let emptyProductStock: {status: number, text: string};
    let lowProductStock: {status: number, text: string};
    let invalidStatus: number;
    let generic: {status: number, text: string};

    beforeAll(() => {
      okStatus = 200;
      emptyCart = {status: 400, text: "Cart is empty"};
      unauthenticated = {status: 401, text: "Unauthenticated user"};
      notACustomer = {status: 401, text: "User is not a customer"};
      neitherAdminNorManager = {status: 401, text: "User is not an admin or manager"};
      cartNotFound = {status: 404, text: "Cart not found"};
      productNotFound = {status: 404, text: "Product not found"};
      productNotInCart = {status: 409, text: "Product not in cart"};
      emptyProductStock = {status: 409, text: "Product stock is empty"};
      lowProductStock = {status: 409, text: "Product stock cannot satisfy the requested quantity"};
      invalidStatus = 422;
      generic = {status: 503, text: "Internal Server Error"};
    });

    describe("Add product to cart", () => {
      let customURL: string;

      beforeAll(async () => {
        customURL = "/";
    
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
        await logout();
        await cleanup();
      });

      test("Add product to cart successful", async () => {
        await login("c1");
        const response = await agent
          .post(baseURL + customURL)
          .send({ model: "p1" });

        expect(response.status).toBe(okStatus);
      });

      test("Add product to cart failed - Model does not exist", async () => {
        await login("c1");
        const response = await agent
          .post(baseURL + customURL)
          .send({ model: "iPhone12" });

        expect(response.status).toBe(productNotFound.status);
        expect(response.text).toContain(productNotFound.text);
      });

      // Need checkout cart
      test("Add product to cart failed - Model exists but it has no stock available", async () => {
        await login("c1");
        await agent.post(baseURL + customURL).send({ model: "p4" });
        await agent.patch(baseURL + customURL).send({});

        const response = await agent
          .post(baseURL + customURL)
          .send({ model: "p4" });

        expect(response.status).toBe(emptyProductStock.status);
        expect(getError(response.text)).toContain(emptyProductStock.text);
      });

      test("Add product to cart failed - Model is an empty string", async () => {
        const testModel = "";

        await login("c1");
        const response = await agent
          .post(baseURL + customURL)
          .send({ model: testModel });

        expect(response.status).toBe(invalidStatus);
      });

      test("Add product to cart failed - Not authenticated", async () => {
        const testModel = "p1";
        const response = await agent
          .post(baseURL + customURL)
          .send({ model: testModel });

        expect(response.status).toBe(unauthenticated.status);
        expect(getError(response.text)).toStrictEqual(unauthenticated.text);
      });

      test("Add product to cart failed - Not a customer", async () => {
        const testModel = "p1";

        await login("m1");
        const response = await agent
          .post(baseURL + customURL)
          .send({ model: testModel });

        expect(response.status).toBe(notACustomer.status);
        expect(getError(response.text)).toBe(notACustomer.text);
      });
    });

    describe("Get current cart", () => {
      let customURL: string;

      beforeAll(async () => {
        customURL = "/";
    
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
        await logout();
        await cleanup();
      });

      test("Get current cart successful - Unpaid cart already present", async () => {
        const testProductsInCart = [
          new ProductInCart("p1", 1, Category.LAPTOP, 100),
          new ProductInCart("p2", 3, Category.LAPTOP, 100),
        ];
        const testCart = new Cart(
          "c1",
          false,
          "",
          400.0,
          testProductsInCart
        );

        // Setup
        await login("c1");
        await agent.post(baseURL + customURL).send({model: "p1"});
        await agent.post(baseURL + customURL).send({model: "p2"});
        await agent.post(baseURL + customURL).send({model: "p2"});
        await agent.post(baseURL + customURL).send({model: "p2"});

        const response = await
          agent.get(baseURL + customURL)
          .send({});
        
        expect(response.status).toBe(okStatus);
        expect(response.body).toEqual(testCart);
      });

      test("Get current cart successful - Unpaid cart not yet present", async () => {
        const testCart = new Cart("c1", false, "", 0.0, []);

        await login("c1");
        const response = await agent
          .get(baseURL + customURL)
          .send({});

        expect(response.status).toBe(okStatus);
        expect(response.body).toEqual(testCart);
      });

      test("Get current cart failed - Not authenticated", async () => {
        const response = await agent
          .get(baseURL + customURL)
          .send({});

        expect(response.status).toBe(unauthenticated.status);
        expect(getError(response.text)).toBe(unauthenticated.text);
      });

      test("Get current cart failed - Not a customer", async () => {
        await login("m1");
        const response = await agent
          .get(baseURL + customURL)
          .send({});

        expect(response.status).toBe(notACustomer.status);
        expect(getError(response.text)).toBe(notACustomer.text);
      });
    });

    describe("Checkout cart", () => {
      let customURL: string;

      beforeAll(async () => {
        customURL = "/";
    
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
        await logout();
        await cleanup();
      });

      test("Checkout cart successful", async () => {
        const testProductsInCart = [
          new ProductInCart("p1", 2, Category.LAPTOP, 100.0),
          new ProductInCart("p2", 1, Category.LAPTOP, 100.0),
          new ProductInCart("p3", 1, Category.LAPTOP, 100.0)
        ];
        const testCart = new Cart("c1", true, Time.today(), 400, testProductsInCart);

        // Setup
        await login("c1");
        await agent.post(baseURL + customURL).send({model: "p1"});
        await agent.post(baseURL + customURL).send({model: "p1"});
        await agent.post(baseURL + customURL).send({model: "p2"});
        await agent.post(baseURL + customURL).send({model: "p3"});

        // Test
        const response = await agent.patch(baseURL + customURL).send({});

        // Check
        expect(response.status).toBe(okStatus);

        const cartResponse = await agent.get(baseURL + customURL).send({});

        expect(cartResponse.status).toBe(okStatus);
      });

      test("Checkout cart failed - No unpaid cart", async () => {
        await login("c1");
        const response = await agent.patch(baseURL + customURL).send({});

        expect(response.status).toBe(cartNotFound.status);
        expect(getError(response.text)).toBe(cartNotFound.text);
      });

      // Requires delete product from cart tested
      test("Checkout cart failed - Unpaid cart empty", async () => {
        await login("c1");
        await agent.post(baseURL + customURL).send({model: "p1"});
        await agent.delete(baseURL + "/products/p1");
        const response = await agent.patch(baseURL + customURL).send({});

        expect(response.status).toBe(emptyCart.status);
        expect(getError(response.text)).toBe(emptyCart.text);
      });

      test("Checkout cart failed - Product in cart with no stock at all", async () => {
        // Setup
        await login("c1");
        await agent.post(baseURL + customURL).send({model: "p4"});
        await logout();
        await login("c2");
        await agent.post(baseURL + customURL).send({model: "p4"});
        await logout();
        await login("c1");
        await agent.patch(baseURL + customURL).send({});
        await logout();
        await login("c2");

        const response = await agent.patch(baseURL + customURL).send({});

        expect(response.status).toBe(emptyProductStock.status);
        expect(getError(response.text)).toBe(emptyProductStock.text);
      });

      test("Checkout cart failed - Product in cart with available quantity smaller than requested one", async () => {
        await login("c1");
        await agent.post(baseURL + customURL).send({model: "p4"});
        await agent.post(baseURL + customURL).send({model: "p4"});

        const response = await agent.patch(baseURL + customURL).send({});

        expect(response.status).toBe(lowProductStock.status);
        expect(getError(response.text)).toBe(lowProductStock.text);
      });

      test("Checkout cart failed - Not authenticated", async () => {
        const response = await agent
          .patch(baseURL + customURL)
          .send({});

        expect(response.status).toBe(unauthenticated.status);
        expect(getError(response.text)).toBe(unauthenticated.text);
      });

      test("Checkout cart failed - Not a customer", async () => {
        await login("m1");
        const response = await agent
          .patch(baseURL + customURL)
          .send({});

        expect(response.status).toBe(notACustomer.status);
        expect(getError(response.text)).toBe(notACustomer.text);
      });
    });

    describe("Get paid carts", () => {
      let customURL: string;

      beforeAll(async () => {
        customURL = "/history";
    
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
        await login("c1");
        await agent.post(baseURL + "/").send({model: "p1"});
        await agent.post(baseURL + "/").send({model: "p2"});
        await agent.patch(baseURL + "/").send({});
        await agent.post(baseURL + "/").send({model: "p1"});
        await agent.post(baseURL + "/").send({model: "p1"});
        await agent.post(baseURL + "/").send({model: "p2"});
        await agent.patch(baseURL + "/").send({});
        await logout();
        await login("c2");
        await agent.post(baseURL + "/").send({model: "p2"});
        await agent.post(baseURL + "/").send({model: "p3"});
        await agent.patch(baseURL + "/").send({});
        await logout();
      });

      afterEach(async () => {
        await logout();
        await cleanup();
      });

      test("Get paid carts successful - Unpaid cart present", async () => {
        const testProductsInCart1 = [
          new ProductInCart("p1", 1, Category.LAPTOP, 100.0),
          new ProductInCart("p2", 1, Category.LAPTOP, 100.0)
        ];
        const testProductsInCart2 = [
          new ProductInCart("p1", 2, Category.LAPTOP, 100.0),
          new ProductInCart("p2", 1, Category.LAPTOP, 100.0)
        ];
        const testProductsInCart3 = [
          new ProductInCart("p2", 1, Category.LAPTOP, 100.0),
          new ProductInCart("p3", 1, Category.LAPTOP, 100.0)
        ]
        const testCarts1 = [
          new Cart("c1", true, Time.today(), 200, testProductsInCart1),
          new Cart("c1", true, Time.today(), 300, testProductsInCart2),
        ];
        const testCarts2 = [
          new Cart("c2", true, Time.today(), 200, testProductsInCart3)
        ];

        // Setup 1
        await login("c1");
        await agent.post(baseURL + "/").send({model: "p1"});
        await agent.post(baseURL + "/").send({model: "p1"});
        await agent.post(baseURL + "/").send({model: "p2"});

        // Test 1
        let response = await agent.get(baseURL + customURL).send({});

        expect(response.status).toBe(okStatus);
        expect(response.body).toEqual(testCarts1);

        await logout();
        
        // Setup 2: different user
        await login("c2");
        await agent.post(baseURL + "/").send({model: "p1"});
        await agent.post(baseURL + "/").send({model: "p1"});
        await agent.post(baseURL + "/").send({model: "p2"});

        // Test 2
        response = await agent.get(baseURL + customURL).send({});

        expect(response.status).toBe(okStatus);
        expect(response.body).toEqual(testCarts2);
      });

      test("Get paid carts successful - No unpaid cart", async () => {
        const testProductsInCart1 = [
          new ProductInCart("p1", 1, Category.LAPTOP, 100.0),
          new ProductInCart("p2", 1, Category.LAPTOP, 100.0)
        ];
        const testProductsInCart2 = [
          new ProductInCart("p1", 2, Category.LAPTOP, 100.0),
          new ProductInCart("p2", 1, Category.LAPTOP, 100.0)
        ];
        const testProductsInCart3 = [
          new ProductInCart("p2", 1, Category.LAPTOP, 100.0),
          new ProductInCart("p3", 1, Category.LAPTOP, 100.0)
        ]
        const testCarts1 = [
          new Cart("c1", true, Time.today(), 200, testProductsInCart1),
          new Cart("c1", true, Time.today(), 300, testProductsInCart2),
        ];
        const testCarts2 = [
          new Cart("c2", true, Time.today(), 200, testProductsInCart3)
        ];

        // Setup 1
        await login("c1");

        // Test 1
        let response = await agent.get(baseURL + customURL).send({});

        expect(response.status).toBe(okStatus);
        expect(response.body).toEqual(testCarts1);

        await logout();
        
        // Setup 2: different user
        await login("c2");

        // Test 2
        response = await agent.get(baseURL + customURL).send({});

        expect(response.status).toBe(okStatus);
        expect(response.body).toEqual(testCarts2);
      });

      test("Get paid carts successful - No paid carts", async () => {
        // Setup: needed to delete all paid carts since there are some in beforeEach
        await login("a1");
        await agent.delete(baseURL + "/").send({});
        await logout();

        // Setup 1
        await login("c1");
        await agent.post(baseURL + "/").send({model: "p1"});
        await agent.post(baseURL + "/").send({model: "p1"});
        await agent.post(baseURL + "/").send({model: "p2"});

        // Test 1
        let response = await agent.get(baseURL + customURL).send({});

        expect(response.status).toBe(okStatus);
        expect(response.body).toEqual([]);

        await logout();
        
        // Setup 2: different user
        await login("c2");
        await agent.post(baseURL + "/").send({model: "p1"});
        await agent.post(baseURL + "/").send({model: "p1"});
        await agent.post(baseURL + "/").send({model: "p2"});

        // Test 2
        response = await agent.get(baseURL + customURL).send({});

        expect(response.status).toBe(okStatus);
        expect(response.body).toEqual([]);
      });

      test("Get paid carts failed - Not authenticated", async () => {
        const response = await agent
          .get(baseURL + customURL)
          .send({});

        expect(response.status).toBe(unauthenticated.status);
        expect(getError(response.text)).toBe(unauthenticated.text);
      });

      test("Get paid carts failed - Not a customer", async () => {
        await login("m1");
        const response = await agent
          .get(baseURL + customURL)
          .send({});

        expect(response.status).toBe(notACustomer.status);
        expect(getError(response.text)).toBe(notACustomer.text);
      });
    });

    describe("Remove product from cart", () => {
      let customURL: string;

      beforeAll(async () => {
        customURL = "/products";
    
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
        await logout();
        await cleanup();
      });

        test("Remove product from cart successful - Decrease", async () => {
            const testProductsInCart = [
              new ProductInCart("p1", 2, Category.LAPTOP, 100),
              new ProductInCart("p2", 1, Category.LAPTOP, 100),
              new ProductInCart("p3", 1, Category.LAPTOP, 100)
            ];
            const testCart = new Cart("c1", false, "", 400.0, testProductsInCart);

            await login("c1");
            await agent.post(baseURL + "/").send({model: "p1"});
            await agent.post(baseURL + "/").send({model: "p1"});
            await agent.post(baseURL + "/").send({model: "p1"});
            await agent.post(baseURL + "/").send({model: "p2"});
            await agent.post(baseURL + "/").send({model: "p3"});
            
            let response = await agent.delete(baseURL + customURL + "/p1").send({});

            expect(response.status).toBe(okStatus);

            response = await agent.get(baseURL + "/").send({});

            expect(response.status).toBe(okStatus);
            expect(response.body).toEqual(testCart);
        });

        test("Remove product from cart successful - Remove", async () => {
          const testProductsInCart = [
            new ProductInCart("p1", 3, Category.LAPTOP, 100),
            new ProductInCart("p2", 1, Category.LAPTOP, 100)
          ];
          const testCart = new Cart("c1", false, "", 400.0, testProductsInCart);

          await login("c1");
          await agent.post(baseURL + "/").send({model: "p1"});
          await agent.post(baseURL + "/").send({model: "p1"});
          await agent.post(baseURL + "/").send({model: "p1"});
          await agent.post(baseURL + "/").send({model: "p2"});
          await agent.post(baseURL + "/").send({model: "p3"});
          
          let response = await agent.delete(baseURL + customURL + "/p3").send({});

          expect(response.status).toBe(okStatus);

          response = await agent.get(baseURL + "/").send({});

          expect(response.status).toBe(okStatus);
          expect(response.body).toEqual(testCart);
      });

        test("Remove product from cart failed - Product not in cart", async () => {
            await login("c1");
            await agent.post(baseURL + "/").send({model: "p1"});
            await agent.post(baseURL + "/").send({model: "p1"});
            await agent.post(baseURL + "/").send({model: "p1"});
            await agent.post(baseURL + "/").send({model: "p2"});
            
            let response = await agent.delete(baseURL + customURL + "/p3").send({});

            //expect(response.status).toBe(productNotInCart.status);
            expect(getError(response.text)).toBe(productNotInCart.text);
        });

        test("Remove product from cart failed - No unpaid cart", async () => {
          await login("c1");
          
          let response = await agent.delete(baseURL + customURL + "/p1").send({});

          expect(response.status).toBe(cartNotFound.status);
          expect(getError(response.text)).toBe(cartNotFound.text);
        });

        // Different from APIs but more clear and allowed (issue closed on GitLab)
        test("Remove product from cart failed - Unpaid cart present but empty", async () => {
          await login("c1");
          await agent.post(baseURL + "/").send({model: "p1"});
          await agent.delete(baseURL + customURL + "/p1").send({});
          let response = await agent.delete(baseURL + customURL + "/p2").send({});

          expect(response.status).toBe(productNotInCart.status);
          expect(getError(response.text)).toBe(productNotInCart.text);
        });

        test("Remove product from cart failed - Product not found", async () => {
          await login("c1");
          await agent.post(baseURL + "/").send({model: "p1"});
          
          let response = await agent.delete(baseURL + customURL + "/pippo").send({});

          //expect(response.status).toBe(productNotFound.status);
          expect(getError(response.text)).toBe(productNotFound.text);
        });

        // Should not match this route
        test("Remove product from cart failed - Model string empty", async () => {
          jest.spyOn(CartController.prototype, "removeProductFromCart");

          await login("c1");
          await agent.post(baseURL + "/").send({model: "p1"});
          await agent.delete(baseURL + customURL + "/").send({});

          expect(CartController.prototype.removeProductFromCart).toBeCalledTimes(0);
        });

        test("Remove product from cart failed - Not authenticated", async () => {
          const response = await agent
            .delete(baseURL + customURL + "/pippo")
            .send({});
  
          expect(response.status).toBe(unauthenticated.status);
          expect(getError(response.text)).toBe(unauthenticated.text);
        });
  
        test("Remove product from cart failed - Not a customer", async () => {
          await login("m1");
          const response = await agent
            .delete(baseURL + customURL + "/pippo")
            .send({});
  
          expect(response.status).toBe(notACustomer.status);
          expect(getError(response.text)).toBe(notACustomer.text);
        });
    });

    describe("Empty current cart", () => {
      let customURL: string;

      beforeAll(async () => {
        customURL = "/current";
    
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
        await logout();
        await cleanup();
      });

        test("Empty cart successful", async () => {
            const testCart = new Cart("c1", false, "", 0.0, []);

            await login("c1");
            await agent.post(baseURL + "/").send({model: "p1"});
            await agent.post(baseURL + "/").send({model: "p1"});
            await agent.post(baseURL + "/").send({model: "p2"});

            let response = await agent.delete(baseURL + customURL).send({});

            expect(response.status).toBe(okStatus);

            response = await agent.get(baseURL + "/").send({});

            expect(response.status).toBe(okStatus);
            expect(response.body).toEqual(testCart);
        });

        test("Empty cart failed - No unpaid cart", async () => {
            await login("c1");

            let response = await agent.delete(baseURL + customURL).send({});

            expect(response.status).toBe(cartNotFound.status);
            expect(getError(response.text)).toBe(cartNotFound.text);
        });

        test("Empty cart failed - No unpaid cart, paid cart present", async () => {
          await login("c1");
          await agent.post(baseURL + "/").send({model: "m1"});
          await agent.post(baseURL + "/").send({model: "m1"});
          await agent.post(baseURL + "/").send({model: "m2"});
          await agent.patch(baseURL + "/").send({});

          let response = await agent.delete(baseURL + customURL).send({});

          expect(response.status).toBe(cartNotFound.status);
          expect(getError(response.text)).toBe(cartNotFound.text);
      });

      test("Empty cart failed - Not authenticated", async () => {
        const response = await agent
          .delete(baseURL + customURL)
          .send({});

        expect(response.status).toBe(unauthenticated.status);
        expect(getError(response.text)).toBe(unauthenticated.text);
      });

      test("Empty cart failed - Not a customer", async () => {
        await login("m1");
        const response = await agent
          .delete(baseURL + customURL)
          .send({});

        expect(response.status).toBe(notACustomer.status);
        expect(getError(response.text)).toBe(notACustomer.text);
      });
    });

    describe("Delete all carts", () => {
      let customURL: string;

      beforeAll(async () => {
        customURL = "/";
    
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
        await login("c1");
        await agent.post(baseURL + "/").send({model: "p1"});
        await agent.post(baseURL + "/").send({model: "p2"});
        await agent.patch(baseURL + "/").send({});
        await agent.post(baseURL + "/").send({model: "p1"});
        await agent.post(baseURL + "/").send({model: "p1"});
        await agent.post(baseURL + "/").send({model: "p2"});
        await agent.patch(baseURL + "/").send({});
        await logout();
      });

      afterEach(async () => {
        await logout();
        await cleanup();
      });


        test("Delete all carts successful - Manager", async () => {
            await login("m1");

            // Test
            let response = await agent.delete(baseURL + customURL).send({});
            
            expect(response.status).toBe(okStatus);

            // Check
            response = await agent.get(baseURL + "/all").send({});

            expect(response.status).toBe(okStatus);
            expect(response.body).toEqual([]);
        });

        test("Delete all carts successful - Admin", async () => {
          await login("a1");

          // Test
          let response = await agent.delete(baseURL + customURL).send({});
          
          expect(response.status).toBe(okStatus);

          // Check
          response = await agent.get(baseURL + "/all").send({});

          expect(response.status).toBe(okStatus);
          expect(response.body).toEqual([]);
      });

      test("Delete all carts successful - No carts to delete", async () => {
        await login("a1");

        // Setup
        await agent.delete(baseURL + customURL).send({});

        // Test
        let response = await agent.delete(baseURL + customURL).send({});
        
        expect(response.status).toBe(okStatus);

        // Check
        response = await agent.get(baseURL + "/all").send({});

        expect(response.status).toBe(okStatus);
        expect(response.body).toEqual([]);
      });

      test("Delete all carts failed - Not authenticated", async () => {
        const response = await agent
          .delete(baseURL + customURL)
          .send({});

        expect(response.status).toBe(unauthenticated.status);
        expect(getError(response.text)).toBe(unauthenticated.text);
      });

      test("Delete all carts failed - Neither an admin nor a manager", async () => {
        await login("c1");
        const response = await agent
          .delete(baseURL + customURL)
          .send({});

        expect(response.status).toBe(neitherAdminNorManager.status);
        expect(getError(response.text)).toBe(neitherAdminNorManager.text);
      });
    });

    describe("Get all carts", () => {
      let customURL: string;

      beforeAll(async () => {
        customURL = "/all";
    
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
        await login("c1");
        await agent.post(baseURL + "/").send({model: "p1"});
        await agent.post(baseURL + "/").send({model: "p2"});
        await agent.patch(baseURL + "/").send({});
        await agent.post(baseURL + "/").send({model: "p1"});
        await agent.post(baseURL + "/").send({model: "p1"});
        await agent.post(baseURL + "/").send({model: "p2"});
        await agent.patch(baseURL + "/").send({});
        await logout();
      });

      afterEach(async () => {
        await logout();
        await cleanup();
      });

      test("Get all carts successful - Manager", async () => {
          const testProductsInCart1 = [
              new ProductInCart("p1", 1, Category.LAPTOP, 100.0),
              new ProductInCart("p2", 1, Category.LAPTOP, 100.0)
          ];
          const testProductsInCart2 = [
              new ProductInCart("p1", 2, Category.LAPTOP, 100.0),
              new ProductInCart("p2", 1, Category.LAPTOP, 100.0)
          ];
          const testCarts = [
              new Cart("c1", true, Time.today(), 200.0, testProductsInCart1),
              new Cart("c1", true, Time.today(), 300.0, testProductsInCart2)
          ];
          
          await login("m1");
          const response = await agent.get(baseURL + customURL).send({});
          
          expect(response.status).toBe(okStatus);
          expect(response.body).toEqual(testCarts);
      });

      test("Get all carts successful - Admin", async () => {
        const testProductsInCart1 = [
            new ProductInCart("p1", 1, Category.LAPTOP, 100.0),
            new ProductInCart("p2", 1, Category.LAPTOP, 100.0)
        ];
        const testProductsInCart2 = [
            new ProductInCart("p1", 2, Category.LAPTOP, 100.0),
            new ProductInCart("p2", 1, Category.LAPTOP, 100.0)
        ];
        const testCarts = [
            new Cart("c1", true, Time.today(), 200.0, testProductsInCart1),
            new Cart("c1", true, Time.today(), 300.0, testProductsInCart2)
        ];
        
        await login("a1");
        const response = await agent.get(baseURL + customURL).send({});
        
        expect(response.status).toBe(okStatus);
        expect(response.body).toEqual(testCarts);
      });

      // Needs delete all carts
      test("Get all carts successful - Empty", async () => {
        // Setup
        await login("a1");
        await agent.delete(baseURL + "/").send({});

        // Test
        const response = await agent.get(baseURL + customURL).send({});
        
        expect(response.status).toBe(okStatus);
        expect(response.body).toEqual([]);
      });

      test("Get all carts failed - Not authenticated", async () => {
        const response = await agent
          .get(baseURL + customURL)
          .send({});

        expect(response.status).toBe(unauthenticated.status);
        expect(getError(response.text)).toBe(unauthenticated.text);
      });

      test("Get all carts failed - Neither an admin nor a manager", async () => {
        await login("c1");
        const response = await agent
          .get(baseURL + customURL)
          .send({});

        expect(response.status).toBe(neitherAdminNorManager.status);
        expect(getError(response.text)).toBe(neitherAdminNorManager.text);
      });
    });
})