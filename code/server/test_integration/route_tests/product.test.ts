import {
  jest,
  describe,
  test,
  beforeAll,
  beforeEach,
  afterEach,
  expect,
} from "@jest/globals";
import request from "supertest";
import { app } from "../..";
import { Time } from "../../src/utilities";
import { Role } from "../../src/components/user";
import { cleanup } from "../../src/db/cleanup";
import { Category, Product } from "../../src/components/product";
import { Console, group, log } from "console";
import { ProductAlreadyExistsError } from "../../src/errors/productError";
import { ok } from "assert";

const baseURL = "/ezelectronics/products";

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

describe("ProductRouter tests:", () => {
  let okStatus: number;

  beforeAll(() => {
    okStatus = 200;
  });

  describe("POST -  Route for registering the arrival of a set of products", () => {
    let customURL: string;

    beforeAll(async () => {
      customURL = "/";

      await cleanup();
    });

    beforeEach(async () => {
      agent = request.agent(app);
      await register_user("c1", Role.CUSTOMER);
      await register_user("c2", Role.CUSTOMER);
      await register_user("m1", Role.MANAGER);
      await register_user("a1", Role.ADMIN);
      await login("m1");
      await logout();
    });

    afterEach(async () => {
      await logout();
      await cleanup();
    });

    test("Create a new product - success", async () => {
      await login("a1");

      const response = await agent.post(baseURL).send({
        model: "TestModel",
        category: "Smartphone",
        quantity: 10,
        details: "TestDetails",
        sellingPrice: 123,
        arrivalDate: "2024-02-03",
      });

      const check = await agent.get(baseURL).query({
        grouping: "model",
        category: "",
        model: "TestModel",
      });

      expect(response.status).toBe(okStatus);

      expect(check.status).toBe(okStatus);
      expect(check.body).toStrictEqual([
        {
          model: "TestModel",
          category: "Smartphone",
          quantity: 10,
          details: "TestDetails",
          sellingPrice: 123,
          arrivalDate: "2024-02-03",
        },
      ]);

      // expect(response.status).toBe(okStatus);
    });

    test("Create a new product - without arrivalData", async () => {
      await login("a1");

      const response = await agent.post(baseURL).send({
        model: "TestModel",
        category: "Smartphone",
        quantity: 10,
        details: "TestDetails",
        sellingPrice: 123,
        arrivalDate: "",
      });
      console.log(response.body.error);

      expect(response.status).toBe(okStatus);
    });

    test("Create a new product that represent an already existing model", async () => {
      await login("a1");
      const statusCode = 409;

      await agent.post(baseURL + customURL).send({
        model: "TestModel",
        category: "Smartphone",
        quantity: 10,
        details: "TestDetails",
        sellingPrice: 123,
        arrivalDate: "2024-02-03",
      });

      const response = await agent.post(baseURL + customURL).send({
        model: "TestModel",
        category: "Smartphone",
        quantity: 10,
        details: "TestDetails",
        sellingPrice: 123,
        arrivalDate: "2024-02-03",
      });

      expect(response.status).toBe(statusCode);
      expect(response.body).toStrictEqual({
        error: "The product already exists",
        status: 409,
      });
    });

    test("Date validation control - after the current date", async () => {
      await login("a1");
      const statusCode = 400;

      const response = await agent.post(baseURL + customURL).send({
        model: "TestModel",
        category: "Smartphone",
        quantity: 10,
        details: "TestDetails",
        sellingPrice: 123,
        arrivalDate: "2030-02-02",
      });

      expect(response.status).toBe(statusCode);
    });

    test("Date validation control - format", async () => {
      await login("a1");
      const statusCode = 422;

      const response = await agent.post(baseURL + customURL).send({
        model: "TestModel",
        category: "Smartphone",
        quantity: 10,
        details: "TestDetails",
        sellingPrice: 123,
        arrivalDate: "30-02-2030",
      });

      expect(response.status).toBe(statusCode);
    });

    test("Create a new product - access failure", async () => {
      await login("c1");

      const response = await agent.post(baseURL).send({
        model: "TestModel",
        category: "Smartphone",
        quantity: 10,
        details: "TestDetails",
        sellingPrice: 123,
        arrivalDate: "2024-02-03",
      });
      console.log(response.body.error);

      expect(response.status).toBe(401);
    });

    test("Quantity validation control - lower than 0", async () => {
      await login("a1");
      const statusCode = 422;

      const response = await agent.post(baseURL + customURL).send({
        model: "TestModel",
        category: "Smartphone",
        quantity: -10,
        details: "TestDetails",
        sellingPrice: 123,
        arrivalDate: "2010-02-02",
      });

      expect(response.status).toBe(statusCode);
    });

    test("SellinPrice validation control - lower than 0", async () => {
      await login("a1");
      const statusCode = 422;

      const response = await agent.post(baseURL + customURL).send({
        model: "TestModel",
        category: "Smartphone",
        quantity: 10,
        details: "TestDetails",
        sellingPrice: -123,
        arrivalDate: "2010-02-02",
      });

      expect(response.status).toBe(statusCode);
    });

    test("Model validation control - absent", async () => {
      await login("a1");
      const statusCode = 422;

      const response = await agent.post(baseURL + customURL).send({
        model: "",
        category: "Smartphone",
        quantity: 10,
        details: "TestDetails",
        sellingPrice: 123,
        arrivalDate: "2010-02-02",
      });

      expect(response.status).toBe(statusCode);
    });
  });

  describe("PATCH - Route for registering the increase in quantity of a product:", () => {
    let customURL: string;

    beforeAll(async () => {
      customURL = "/TestModel";

      await cleanup();
    });

    beforeEach(async () => {
      agent = request.agent(app);
      await register_user("c1", Role.CUSTOMER);
      await register_user("c2", Role.CUSTOMER);
      await register_user("m1", Role.MANAGER);
      await register_user("a1", Role.ADMIN);
      await login("m1");
      await logout();
    });

    afterEach(async () => {
      await logout();
      await cleanup();
    });

    test("it should update succesfully the AvailalbeQuantity", async () => {
      await login("a1");

      await agent.post(baseURL + "/").send({
        model: "TestModel",
        category: "Smartphone",
        quantity: 10,
        details: "TestDetails",
        sellingPrice: 123,
        arrivalDate: "2024-02-03",
      });

      const response = await agent.patch(baseURL + customURL).send({
        model: "TestModel",
        quantity: 10,
        changeDate: "2024-02-14",
      });

      expect(response.status).toBe(okStatus);
      expect(response.body.quantity).toStrictEqual(20);
    });

    test("it should return 404 if the product does not exists", async () => {
      await login("a1");

      const response = await agent.patch(baseURL + customURL).send({
        model: "TestModel",
        quantity: 10,
        changeDate: "2024-02-14",
      });

      expect(response.status).toBe(404);
    });

    test("changeDate validation - invalid format", async () => {
      await login("a1");

      await agent.post(baseURL + "/").send({
        model: "TestModel",
        category: "Smartphone",
        quantity: 10,
        details: "TestDetails",
        sellingPrice: 123,
        arrivalDate: "2024-02-03",
      });

      const response = await agent.patch(baseURL + customURL).send({
        model: "TestModel",
        quantity: 10,
        changeDate: "20-02-2024",
      });

      expect(response.status).toBe(422);
    });

    test("changeDate validation - futureDate", async () => {
      await login("a1");

      await agent.post(baseURL + "/").send({
        model: "TestModel",
        category: "Smartphone",
        quantity: 10,
        details: "TestDetails",
        sellingPrice: 123,
        arrivalDate: "2024-02-03",
      });

      const response = await agent.patch(baseURL + customURL).send({
        model: "TestModel",
        quantity: 10,
        changeDate: "2025-03-02",
      });

      expect(response.status).toBe(400);
    });

    test("changeDate validation - before of arrivalDate", async () => {
      await login("a1");

      await agent.post(baseURL + "/").send({
        model: "TestModel",
        category: "Smartphone",
        quantity: 10,
        details: "TestDetails",
        sellingPrice: 123,
        arrivalDate: "2024-02-03",
      });

      const response = await agent.patch(baseURL + customURL).send({
        model: "TestModel",
        quantity: 10,
        changeDate: "2024-02-01",
      });

      expect(response.status).toBe(400);
    });
  });

  describe("PATCH -  Route for selling a product:", () => {
    let customURL: string;

    beforeAll(async () => {
      customURL = "/TestModel/sell";

      await cleanup();
    });

    beforeEach(async () => {
      agent = request.agent(app);
      await register_user("c1", Role.CUSTOMER);
      await register_user("c2", Role.CUSTOMER);
      await register_user("m1", Role.MANAGER);
      await register_user("a1", Role.ADMIN);
      await login("m1");
      await logout();
    });

    afterEach(async () => {
      await logout();
      await cleanup();
    });

    test("sell quantity of a product - success", async () => {
      await login("a1");

      await agent.post(baseURL + "/").send({
        model: "TestModel",
        category: "Smartphone",
        quantity: 10,
        details: "TestDetails",
        sellingPrice: 123,
        arrivalDate: "2024-02-03",
      });

      const response = await agent.patch(baseURL + customURL).send({
        model: "TestModel",
        quantity: 5,
        sellingDate: "2024-02-14",
      });

      expect(response.status).toBe(okStatus);
      expect(response.body.quantity).toStrictEqual(5);
    });

    test("it should return 404 if the product does not exists", async () => {
      await login("a1");

      const response = await agent.patch(baseURL + customURL).send({
        model: "TestModel",
        quantity: 10,
        sellingDate: "2024-02-14",
      });

      expect(response.status).toBe(404);
    });

    test("sellingDate validation - invalid format", async () => {
      await login("a1");

      await agent.post(baseURL + "/").send({
        model: "TestModel",
        category: "Smartphone",
        quantity: 10,
        details: "TestDetails",
        sellingPrice: 123,
        sellDate: "2024-02-03",
      });

      const response = await agent.patch(baseURL + customURL).send({
        model: "TestModel",
        quantity: 5,
        sellingDate: "20-02-2024",
      });

      expect(response.status).toBe(422);
    });

    test("sellingDate validation - futureDate", async () => {
      await login("a1");

      await agent.post(baseURL + "/").send({
        model: "TestModel",
        category: "Smartphone",
        quantity: 10,
        details: "TestDetails",
        sellingPrice: 123,
        arrivalDate: "2024-02-03",
      });

      const response = await agent.patch(baseURL + customURL).send({
        model: "TestModel",
        quantity: 5,
        sellingDate: "2025-03-02",
      });

      expect(response.status).toBe(400);
    });

    test("sellingDate validation - before of arrivalDate", async () => {
      await login("a1");

      await agent.post(baseURL + "/").send({
        model: "TestModel",
        category: "Smartphone",
        quantity: 10,
        details: "TestDetails",
        sellingPrice: 123,
        sellingDate: "2024-02-03",
      });

      const response = await agent.patch(baseURL + customURL).send({
        model: "TestModel",
        quantity: 10,
        sellingDate: "2024-01-01",
      });

      expect(response.status).toBe(400);
    });

    test("It should return a 409 error if the available quantity of `model` is lower than the requested `quantity`", async () => {
      await login("a1");

      await agent.post(baseURL + "/").send({
        model: "TestModel",
        category: "Smartphone",
        quantity: 10,
        details: "TestDetails",
        sellingPrice: 123,
        arrivalDate: "2024-02-03",
      });

      const response = await agent.patch(baseURL + customURL).send({
        model: "TestModel",
        quantity: 15,
        sellingDate: "2024-03-03",
      });

      expect(response.status).toBe(409);
    });

    test("It should return a 409 error if `model` represents a product whose available quantity is 0", async () => {
      await login("a1");

      await agent.post(baseURL + "/").send({
        model: "TestModel",
        category: "Smartphone",
        quantity: 10,
        details: "TestDetails",
        sellingPrice: 123,
        arrivalDate: "2024-02-03",
      });

      await agent.patch(baseURL + customURL).send({
        model: "TestModel",
        quantity: 10,
        sellingDate: "2024-03-03",
      });

      const response = await agent.patch(baseURL + customURL).send({
        model: "TestModel",
        quantity: 5,
        sellingDate: "2024-03-03",
      });

      expect(response.status).toBe(409);
    });
  });

  describe("GET - Route for retrieving all products", () => {
    let customURL: string;

    beforeAll(async () => {
      customURL = "/";

      await cleanup();
    });

    beforeEach(async () => {
      agent = request.agent(app);
      await register_user("c1", Role.CUSTOMER);
      await register_user("c2", Role.CUSTOMER);
      await register_user("m1", Role.MANAGER);
      await register_user("a1", Role.ADMIN);
      await login("m1");
      await logout();
    });

    afterEach(async () => {
      await logout();
      await cleanup();
    });

    test("Get all products - success", async () => {
      await login("a1");

      await agent.post(baseURL + "/").send({
        model: "TestModel1",
        category: "Smartphone",
        quantity: 10,
        details: "TestDetails",
        sellingPrice: 123,
        arrivalDate: "2024-02-03",
      });

      await agent.post(baseURL + "/").send({
        model: "TestModel2",
        category: "Laptop",
        quantity: 10,
        details: "TestDetails",
        sellingPrice: 123,
        arrivalDate: "2024-02-03",
      });

      await agent.post(baseURL + "/").send({
        model: "TestModel3",
        category: "Smartphone",
        quantity: 10,
        details: "TestDetails",
        sellingPrice: 123,
        arrivalDate: "2024-02-03",
      });

      const response = await agent.get(baseURL + customURL).query({
        grouping: "",
        category: "",
        model: "",
      });

      expect(response.status).toBe(okStatus);

      expect(response.body).toStrictEqual([
        {
          arrivalDate: "2024-02-03",
          category: "Smartphone",
          details: "TestDetails",
          model: "TestModel1",
          quantity: 10,
          sellingPrice: 123,
        },
        {
          arrivalDate: "2024-02-03",
          category: "Laptop",
          details: "TestDetails",
          model: "TestModel2",
          quantity: 10,
          sellingPrice: 123,
        },
        {
          arrivalDate: "2024-02-03",
          category: "Smartphone",
          details: "TestDetails",
          model: "TestModel3",
          quantity: 10,
          sellingPrice: 123,
        },
      ]);
    });

    test("get products by model", async () => {
      await login("a1");

      await agent.post(baseURL + "/").send({
        model: "TestModel1",
        category: "Smartphone",
        quantity: 10,
        details: "TestDetails",
        sellingPrice: 123,
        arrivalDate: "2024-02-03",
      });

      await agent.post(baseURL + "/").send({
        model: "TestModel2",
        category: "Laptop",
        quantity: 10,
        details: "TestDetails",
        sellingPrice: 123,
        arrivalDate: "2024-02-03",
      });

      const response = await agent.get(baseURL + "/").query({
        grouping: "model",
        category: "",
        model: "TestModel1",
      });

      expect(response.status).toBe(okStatus);

      expect(response.body).toStrictEqual([
        {
          model: "TestModel1",
          category: "Smartphone",
          quantity: 10,
          details: "TestDetails",
          sellingPrice: 123,
          arrivalDate: "2024-02-03",
        },
      ]);
    });

    test("get products by category", async () => {
      await login("a1");

      await agent.post(baseURL + "/").send({
        model: "TestModel1",
        category: "Smartphone",
        quantity: 10,
        details: "TestDetails",
        sellingPrice: 123,
        arrivalDate: "2024-02-03",
      });

      await agent.post(baseURL + "/").send({
        model: "TestModel2",
        category: "Laptop",
        quantity: 10,
        details: "TestDetails",
        sellingPrice: 123,
        arrivalDate: "2024-02-03",
      });

      const response = await agent.get(baseURL + customURL).query({
        grouping: "category",
        category: "Smartphone",
        model: "",
      });

      expect(response.status).toBe(okStatus);

      expect(response.body).toStrictEqual([
        {
          arrivalDate: "2024-02-03",
          category: "Smartphone",
          details: "TestDetails",
          model: "TestModel1",
          quantity: 10,
          sellingPrice: 123,
        },
      ]);
    });

    test("get product by category - no result", async () => {
      await login("a1");

      await agent.post(baseURL + "/").send({
        model: "TestModel1",
        category: "Smartphone",
        quantity: 10,
        details: "TestDetails",
        sellingPrice: 123,
        arrivalDate: "2024-02-03",
      });

      const response = await agent.get(baseURL + customURL).query({
        grouping: "category",
        category: "Laptop",
        model: "",
      });

      expect(response.status).toBe(okStatus);

      expect(response.body).toStrictEqual([]);
    });

    test("It should return a 422 error if `grouping` is null and `category` is not null", async () => {
      await login("a1");

      await agent.post(baseURL + "/").send({
        model: "TestModel1",
        category: "Smartphone",
        quantity: 10,
        details: "TestDetails",
        sellingPrice: 123,
        arrivalDate: "2024-02-03",
      });

      const response = await agent.get(baseURL + customURL).query({
        grouping: "",
        category: "Smartphone",
        model: "",
      });

      expect(response.status).toBe(422);
    });

    test("It should return a 422 error if `grouping` is null and `model` is not null", async () => {
      await login("a1");

      await agent.post(baseURL + "/").send({
        model: "TestModel1",
        category: "Smartphone",
        quantity: 10,
        details: "TestDetails",
        sellingPrice: 123,
        arrivalDate: "2024-02-03",
      });

      const response = await agent.get(baseURL + customURL).query({
        grouping: "",
        category: "",
        model: "TestModel",
      });

      expect(response.status).toBe(422);
    });

    test("It should return a 422 error if `grouping` is null and `model` is not null and category is not null", async () => {
      await login("a1");

      await agent.post(baseURL + "/").send({
        model: "TestModel1",
        category: "Smartphone",
        quantity: 10,
        details: "TestDetails",
        sellingPrice: 123,
        arrivalDate: "2024-02-03",
      });

      const response = await agent.get(baseURL + customURL).query({
        grouping: "",
        category: "Smartphone",
        model: "TestModel1",
      });

      expect(response.status).toBe(422);
    });

    test("It should return a 422 error if `grouping` is `category` and `category` is null", async () => {
      await login("a1");

      await agent.post(baseURL + "/").send({
        model: "TestModel1",
        category: "Smartphone",
        quantity: 10,
        details: "TestDetails",
        sellingPrice: 123,
        arrivalDate: "2024-02-03",
      });

      const response = await agent.get(baseURL + customURL).query({
        grouping: "category",
        category: "",
        model: "",
      });

      expect(response.status).toBe(422);
    });

    test("It should return a 422 error if `grouping` is `category` and `model` is not null", async () => {
      await login("a1");

      await agent.post(baseURL + "/").send({
        model: "TestModel1",
        category: "Smartphone",
        quantity: 10,
        details: "TestDetails",
        sellingPrice: 123,
        arrivalDate: "2024-02-03",
      });

      const response = await agent.get(baseURL + customURL).query({
        grouping: "category",
        category: "",
        model: "TestModel",
      });

      expect(response.status).toBe(422);
    });

    test("It should return a 422 error if `grouping` is `category` and `model` is not null while category is not null", async () => {
      await login("a1");

      await agent.post(baseURL + "/").send({
        model: "TestModel1",
        category: "Smartphone",
        quantity: 10,
        details: "TestDetails",
        sellingPrice: 123,
        arrivalDate: "2024-02-03",
      });

      const response = await agent.get(baseURL + customURL).query({
        grouping: "category",
        category: "Smartphone",
        model: "TestModel",
      });

      expect(response.status).toBe(422);
    });

    test("It should return a 422 error if `grouping` is `model` and `model` is null", async () => {
      await login("a1");

      await agent.post(baseURL + "/").send({
        model: "TestModel1",
        category: "Smartphone",
        quantity: 10,
        details: "TestDetails",
        sellingPrice: 123,
        arrivalDate: "2024-02-03",
      });

      const response = await agent.get(baseURL + customURL).query({
        grouping: "model",
        category: "",
        model: "",
      });

      expect(response.status).toBe(422);
    });

    test("It should return a 422 error if `grouping` is `model` and `category` is not null", async () => {
      await login("a1");

      await agent.post(baseURL + "/").send({
        model: "TestModel1",
        category: "Smartphone",
        quantity: 10,
        details: "TestDetails",
        sellingPrice: 123,
        arrivalDate: "2024-02-03",
      });

      const response = await agent.get(baseURL + customURL).query({
        grouping: "model",
        category: "Smartphone",
        model: "",
      });

      expect(response.status).toBe(422);
    });

    test("It should return a 422 error if `grouping` is `model` and `model` is not null while category is not null", async () => {
      await login("a1");

      await agent.post(baseURL + "/").send({
        model: "TestModel1",
        category: "Smartphone",
        quantity: 10,
        details: "TestDetails",
        sellingPrice: 123,
        arrivalDate: "2024-02-03",
      });

      const response = await agent.get(baseURL + customURL).query({
        grouping: "model",
        category: "Smartphone",
        model: "TestModel",
      });

      expect(response.status).toBe(422);
    });

    test("It should return a 422 error if `grouping` is `model` and category is undefined", async () => {
        await login("a1");
  
        await agent.post(baseURL + "/").send({
          model: "TestModel1",
          category: "Smartphone",
          quantity: 10,
          details: "TestDetails",
          sellingPrice: 123,
          arrivalDate: "2024-02-03",
        });
  
        const response = await agent.get(baseURL + customURL).query({
          grouping: "model",
          category: "Smartphone",
        
        });
  
        expect(response.status).toBe(422);
      });


      test("It should return a 422 error if `grouping` is `category` and category is undefined", async () => {
        await login("a1");
  
        await agent.post(baseURL + "/").send({
          model: "TestModel1",
          category: "Smartphone",
          quantity: 10,
          details: "TestDetails",
          sellingPrice: 123,
          arrivalDate: "2024-02-03",
        });
  
        const response = await agent.get(baseURL + customURL).query({
          grouping: "category",
          model: "TestMOdel"
        });
  
        expect(response.status).toBe(422);
      });

    test("It should return a 404 error if `model` does not represent a product in the database (only when `grouping` is `model`)", async () => {
      await login("a1");

      const response = await agent.get(baseURL + customURL).query({
        grouping: "model",
        category: "",
        model: "TestModel",
      });

      expect(response.status).toBe(404);
    });

    test("grouping invalid", async () => {
      await login("a1");

      const response = await agent.get(baseURL + customURL).query({
        grouping: "pippo",
        category: "",
        model: "",
      });

      expect(response.status).toBe(422);
    });

    test("get Products - access by non Admin or Manager", async () => {
      await login("c1");

      await agent.post(baseURL + "/").send({
        model: "TestModel1",
        category: "Smartphone",
        quantity: 10,
        details: "TestDetails",
        sellingPrice: 123,
        arrivalDate: "2024-02-03",
      });

      const response = await agent.get(baseURL + customURL).query({
        grouping: "model",
        category: "",
        model: "TestModel",
      });

      expect(response.status).toBe(401);
    });

    test("get Products - access by user not logged in", async () => {
      await agent.post(baseURL + "/").send({
        model: "TestModel1",
        category: "Smartphone",
        quantity: 10,
        details: "TestDetails",
        sellingPrice: 123,
        arrivalDate: "2024-02-03",
      });

      const response = await agent.get(baseURL + customURL).query({
        grouping: "model",
        category: "",
        model: "TestModel",
      });

      expect(response.status).toBe(401);
    });
  });

  describe("GET - Route for retrieving all Available products", () => {
    let customURL: string;

    beforeAll(async () => {
      customURL = "/available";

      await cleanup();
    });

    beforeEach(async () => {
      agent = request.agent(app);
      await register_user("c1", Role.CUSTOMER);
      await register_user("c2", Role.CUSTOMER);
      await register_user("m1", Role.MANAGER);
      await register_user("a1", Role.ADMIN);
      await login("m1");
      await logout();
    });

    afterEach(async () => {
      await logout();
      await cleanup();
    });

    test("Get all available products - success", async () => {
      await login("a1");

      await agent.post(baseURL + "/").send({
        model: "TestModel1",
        category: "Smartphone",
        quantity: 10,
        details: "TestDetails",
        sellingPrice: 123,
        arrivalDate: "2024-02-03",
      });

      await agent.post(baseURL + "/").send({
        model: "TestModel2",
        category: "Laptop",
        quantity: 10,
        details: "TestDetails",
        sellingPrice: 123,
        arrivalDate: "2024-02-03",
      });

      await agent.post(baseURL + "/").send({
        model: "TestModel3",
        category: "Smartphone",
        quantity: 10,
        details: "TestDetails",
        sellingPrice: 123,
        arrivalDate: "2024-02-03",
      });

      await agent.patch(baseURL + "/TestModel3/sell").send({
        model: "TestModel3",
        quantity: 10,
        sellingDate: "2024-02-14",
      });

      await logout();

      await login("c1");
      const response = await agent.get(baseURL + customURL).query({
        grouping: "",
        category: "",
        model: "",
      });

      expect(response.status).toBe(okStatus);

      expect(response.body).toStrictEqual([
        {
          arrivalDate: "2024-02-03",
          category: "Smartphone",
          details: "TestDetails",
          model: "TestModel1",
          quantity: 10,
          sellingPrice: 123,
        },
        {
          arrivalDate: "2024-02-03",
          category: "Laptop",
          details: "TestDetails",
          model: "TestModel2",
          quantity: 10,
          sellingPrice: 123,
        },
      ]);
    });

    test("grouping invalid", async () => {
      await login("a1");

      const response = await agent.get(baseURL + customURL).query({
        grouping: "pippo",
        category: "",
        model: "",
      });

      expect(response.status).toBe(422);
    });

    test("get products by model", async () => {
      await login("a1");

      await agent.post(baseURL + "/").send({
        model: "TestModel1",
        category: "Smartphone",
        quantity: 10,
        details: "TestDetails",
        sellingPrice: 123,
        arrivalDate: "2024-02-03",
      });

      await agent.post(baseURL + "/").send({
        model: "TestModel2",
        category: "Laptop",
        quantity: 10,
        details: "TestDetails",
        sellingPrice: 123,
        arrivalDate: "2024-02-03",
      });

      await agent.patch(baseURL + "/TestModel2/sell").send({
        model: "TestModel2",
        quantity: 10,
        sellingDate: "2024-02-14",
      });

      const response = await agent.get(baseURL + customURL).query({
        grouping: "model",
        category: "",
        model: "TestModel1",
      });

      expect(response.status).toBe(okStatus);

      expect(response.body).toStrictEqual([
        {
          model: "TestModel1",
          category: "Smartphone",
          quantity: 10,
          details: "TestDetails",
          sellingPrice: 123,
          arrivalDate: "2024-02-03",
        },
      ]);
    });

    test("get products by model - no available", async () => {
      await login("a1");

      await agent.post(baseURL + "/").send({
        model: "TestModel1",
        category: "Smartphone",
        quantity: 10,
        details: "TestDetails",
        sellingPrice: 123,
        arrivalDate: "2024-02-03",
      });

      await agent.post(baseURL + "/").send({
        model: "TestModel2",
        category: "Laptop",
        quantity: 10,
        details: "TestDetails",
        sellingPrice: 123,
        arrivalDate: "2024-02-03",
      });

      await agent.patch(baseURL + "/TestModel1/sell").send({
        model: "TestModel1",
        quantity: 10,
        sellingDate: "2024-02-14",
      });

      await logout();

      await login("c1");

      const response = await agent.get(baseURL + customURL).query({
        grouping: "model",
        category: "",
        model: "TestModel1",
      });

      expect(response.status).toBe(okStatus);

      expect(response.body).toStrictEqual([]);
    });

    test("get products by category", async () => {
      await login("a1");

      await agent.post(baseURL + "/").send({
        model: "TestModel1",
        category: "Smartphone",
        quantity: 10,
        details: "TestDetails",
        sellingPrice: 123,
        arrivalDate: "2024-02-03",
      });

      await agent.post(baseURL + "/").send({
        model: "TestModel2",
        category: "Smartphone",
        quantity: 10,
        details: "TestDetails",
        sellingPrice: 123,
        arrivalDate: "2024-02-03",
      });

      await agent.patch(baseURL + "/TestModel2/sell").send({
        model: "TestModel2",
        quantity: 10,
        sellingDate: "2024-02-14",
      });
      await logout();

      await login("c1");

      const response = await agent.get(baseURL + customURL).query({
        grouping: "category",
        category: "Smartphone",
        model: "",
      });

      expect(response.status).toBe(okStatus);

      expect(response.body).toStrictEqual([
        {
          arrivalDate: "2024-02-03",
          category: "Smartphone",
          details: "TestDetails",
          model: "TestModel1",
          quantity: 10,
          sellingPrice: 123,
        },
      ]);
    });

    test("get product by category - no result", async () => {
      await login("a1");

      await agent.post(baseURL + "/").send({
        model: "TestModel1",
        category: "Smartphone",
        quantity: 10,
        details: "TestDetails",
        sellingPrice: 123,
        arrivalDate: "2024-02-03",
      });

      await agent.patch(baseURL + "/TestModel1/sell").send({
        model: "TestModel1",
        quantity: 10,
        sellingDate: "2024-02-14",
      });

      await logout();

      await login("c1");

      const response = await agent.get(baseURL + customURL).query({
        grouping: "category",
        category: "Laptop",
        model: "",
      });

      expect(response.status).toBe(okStatus);

      expect(response.body).toStrictEqual([]);
    });

    test("It should return a 422 error if `grouping` is null and `category` is not null", async () => {
      await login("a1");

      await agent.post(baseURL + "/").send({
        model: "TestModel1",
        category: "Smartphone",
        quantity: 10,
        details: "TestDetails",
        sellingPrice: 123,
        arrivalDate: "2024-02-03",
      });

      await agent.post(baseURL + "/").send({
        model: "TestModel2",
        category: "Smartphone",
        quantity: 10,
        details: "TestDetails",
        sellingPrice: 123,
        arrivalDate: "2024-02-03",
      });

      await agent.patch(baseURL + "/TestModel1/sell").send({
        model: "TestModel1",
        quantity: 10,
        sellingDate: "2024-02-14",
      });

      await logout();

      await login("c1");

      const response = await agent.get(baseURL + customURL).query({
        grouping: "",
        category: "Smartphone",
        model: "",
      });

      expect(response.status).toBe(422);
    });

    test("It should return a 422 error if `grouping` is null and `model` is not null", async () => {
      await login("a1");

      await agent.post(baseURL + "/").send({
        model: "TestModel1",
        category: "Smartphone",
        quantity: 10,
        details: "TestDetails",
        sellingPrice: 123,
        arrivalDate: "2024-02-03",
      });

      await agent.post(baseURL + "/").send({
        model: "TestModel2",
        category: "Smartphone",
        quantity: 10,
        details: "TestDetails",
        sellingPrice: 123,
        arrivalDate: "2024-02-03",
      });

      await agent.patch(baseURL + "/TestModel1/sell").send({
        model: "TestModel1",
        quantity: 10,
        sellingDate: "2024-02-14",
      });

      await logout();

      await login("c1");

      const response = await agent.get(baseURL + customURL).query({
        grouping: "",
        category: "",
        model: "TestModel",
      });

      expect(response.status).toBe(422);
    });

    test("It should return a 422 error if `grouping` is null and `model` is not null and category is not null", async () => {
      await login("a1");

      await agent.post(baseURL + "/").send({
        model: "TestModel1",
        category: "Smartphone",
        quantity: 10,
        details: "TestDetails",
        sellingPrice: 123,
        arrivalDate: "2024-02-03",
      });

      await agent.post(baseURL + "/").send({
        model: "TestModel2",
        category: "Smartphone",
        quantity: 10,
        details: "TestDetails",
        sellingPrice: 123,
        arrivalDate: "2024-02-03",
      });

      await agent.patch(baseURL + "/TestModel1/sell").send({
        model: "TestModel1",
        quantity: 10,
        sellingDate: "2024-02-14",
      });

      await logout();

      await login("c1");

      const response = await agent.get(baseURL + customURL).query({
        grouping: "",
        category: "Smartphone",
        model: "TestModel1",
      });

      expect(response.status).toBe(422);
    });

    test("It should return a 422 error if `grouping` = `model` and model undefined", async () => {
        await login("a1");
  
        await agent.post(baseURL + "/").send({
          model: "TestModel1",
          category: "Smartphone",
          quantity: 10,
          details: "TestDetails",
          sellingPrice: 123,
          arrivalDate: "2024-02-03",
        });
  
        await agent.post(baseURL + "/").send({
          model: "TestModel2",
          category: "Smartphone",
          quantity: 10,
          details: "TestDetails",
          sellingPrice: 123,
          arrivalDate: "2024-02-03",
        });
  
        await agent.patch(baseURL + "/TestModel1/sell").send({
          model: "TestModel1",
          quantity: 10,
          sellingDate: "2024-02-14",
        });
  
        await logout();
  
        await login("c1");
  
        const response = await agent.get(baseURL + customURL).query({
          grouping: "model",
          category: "Smartphone",
          
        });
  
        expect(response.status).toBe(422);
      });

      test("It should return a 422 error if `grouping` = `category` and category undefined", async () => {
        await login("a1");
  
        await agent.post(baseURL + "/").send({
          model: "TestModel1",
          category: "Smartphone",
          quantity: 10,
          details: "TestDetails",
          sellingPrice: 123,
          arrivalDate: "2024-02-03",
        });
  
        await agent.post(baseURL + "/").send({
          model: "TestModel2",
          category: "Smartphone",
          quantity: 10,
          details: "TestDetails",
          sellingPrice: 123,
          arrivalDate: "2024-02-03",
        });
  
        await agent.patch(baseURL + "/TestModel1/sell").send({
          model: "TestModel1",
          quantity: 10,
          sellingDate: "2024-02-14",
        });
  
        await logout();
  
        await login("c1");
  
        const response = await agent.get(baseURL + customURL).query({
          grouping: "category",
          model: "TestMOdel",
          
        });
  
        expect(response.status).toBe(422);
      });

    test("It should return a 422 error if `grouping` is `category` and `category` is null", async () => {
      await login("a1");

      await agent.post(baseURL + "/").send({
        model: "TestModel1",
        category: "Smartphone",
        quantity: 10,
        details: "TestDetails",
        sellingPrice: 123,
        arrivalDate: "2024-02-03",
      });

      await agent.post(baseURL + "/").send({
        model: "TestModel2",
        category: "Smartphone",
        quantity: 10,
        details: "TestDetails",
        sellingPrice: 123,
        arrivalDate: "2024-02-03",
      });

      await agent.patch(baseURL + "/TestModel1/sell").send({
        model: "TestModel1",
        quantity: 10,
        sellingDate: "2024-02-14",
      });

      await logout();

      await login("c1");

      const response = await agent.get(baseURL + customURL).query({
        grouping: "category",
        category: "",
        model: "",
      });

      expect(response.status).toBe(422);
    });

    test("It should return a 422 error if `grouping` is `category` and `model` is not null", async () => {
      await login("a1");

      await agent.post(baseURL + "/").send({
        model: "TestModel1",
        category: "Smartphone",
        quantity: 10,
        details: "TestDetails",
        sellingPrice: 123,
        arrivalDate: "2024-02-03",
      });

      await agent.post(baseURL + "/").send({
        model: "TestModel2",
        category: "Smartphone",
        quantity: 10,
        details: "TestDetails",
        sellingPrice: 123,
        arrivalDate: "2024-02-03",
      });

      await agent.patch(baseURL + "/TestModel1/sell").send({
        model: "TestModel1",
        quantity: 10,
        sellingDate: "2024-02-14",
      });

      await logout();

      await login("c1");

      const response = await agent.get(baseURL + customURL).query({
        grouping: "category",
        category: "",
        model: "TestModel",
      });

      expect(response.status).toBe(422);
    });

    test("It should return a 422 error if `grouping` is `category` and `model` is not null while category is not null", async () => {
      await login("a1");

      await agent.post(baseURL + "/").send({
        model: "TestModel1",
        category: "Smartphone",
        quantity: 10,
        details: "TestDetails",
        sellingPrice: 123,
        arrivalDate: "2024-02-03",
      });

      await agent.post(baseURL + "/").send({
        model: "TestModel2",
        category: "Smartphone",
        quantity: 10,
        details: "TestDetails",
        sellingPrice: 123,
        arrivalDate: "2024-02-03",
      });

      await agent.patch(baseURL + "/TestModel1/sell").send({
        model: "TestModel1",
        quantity: 10,
        sellingDate: "2024-02-14",
      });

      await logout();

      await login("c1");

      const response = await agent.get(baseURL + customURL).query({
        grouping: "category",
        category: "Smartphone",
        model: "TestModel",
      });

      expect(response.status).toBe(422);
    });

    test("It should return a 422 error if `grouping` is `model` and `model` is null", async () => {
      await login("a1");

      await agent.post(baseURL + "/").send({
        model: "TestModel1",
        category: "Smartphone",
        quantity: 10,
        details: "TestDetails",
        sellingPrice: 123,
        arrivalDate: "2024-02-03",
      });

      await agent.post(baseURL + "/").send({
        model: "TestModel2",
        category: "Smartphone",
        quantity: 10,
        details: "TestDetails",
        sellingPrice: 123,
        arrivalDate: "2024-02-03",
      });

      await agent.patch(baseURL + "/TestModel1/sell").send({
        model: "TestModel1",
        quantity: 10,
        sellingDate: "2024-02-14",
      });

      await logout();

      await login("c1");

      const response = await agent.get(baseURL + customURL).query({
        grouping: "model",
        category: "",
        model: "",
      });

      expect(response.status).toBe(422);
    });

    test("It should return a 422 error if `grouping` is `model` and `category` is not null", async () => {
      await login("a1");

      await agent.post(baseURL + "/").send({
        model: "TestModel1",
        category: "Smartphone",
        quantity: 10,
        details: "TestDetails",
        sellingPrice: 123,
        arrivalDate: "2024-02-03",
      });

      await agent.post(baseURL + "/").send({
        model: "TestModel2",
        category: "Smartphone",
        quantity: 10,
        details: "TestDetails",
        sellingPrice: 123,
        arrivalDate: "2024-02-03",
      });

      await agent.patch(baseURL + "/TestModel1/sell").send({
        model: "TestModel1",
        quantity: 10,
        sellingDate: "2024-02-14",
      });

      await logout();

      await login("c1");

      const response = await agent.get(baseURL + customURL).query({
        grouping: "model",
        category: "Smartphone",
        model: "",
      });

      expect(response.status).toBe(422);
    });

    test("It should return a 422 error if `grouping` is `model` and `model` is not null while category is not null", async () => {
      await login("a1");

      await agent.post(baseURL + "/").send({
        model: "TestModel2",
        category: "Smartphone",
        quantity: 10,
        details: "TestDetails",
        sellingPrice: 123,
        arrivalDate: "2024-02-03",
      });

      await agent.patch(baseURL + "/TestModel1/sell").send({
        model: "TestModel1",
        quantity: 10,
        sellingDate: "2024-02-14",
      });

      await agent.post(baseURL + "/").send({
        model: "TestModel1",
        category: "Smartphone",
        quantity: 10,
        details: "TestDetails",
        sellingPrice: 123,
        arrivalDate: "2024-02-03",
      });

      await logout();

      await login("c1");

      const response = await agent.get(baseURL + customURL).query({
        grouping: "model",
        category: "Smartphone",
        model: "TestModel",
      });

      expect(response.status).toBe(422);
    });

    test("It should return a 404 error if `model` does not represent a product in the database (only when `grouping` is `model`)", async () => {
      await login("c1");

      const response = await agent.get(baseURL + customURL).query({
        grouping: "model",
        category: "",
        model: "TestModel",
      });

      expect(response.status).toBe(404);
    });

    test("get Products - access by user not logged in", async () => {
      await agent.post(baseURL + "/").send({
        model: "TestModel1",
        category: "Smartphone",
        quantity: 10,
        details: "TestDetails",
        sellingPrice: 123,
        arrivalDate: "2024-02-03",
      });

      const response = await agent.get(baseURL + customURL).query({
        grouping: "model",
        category: "",
        model: "TestModel1",
      });

      expect(response.status).toBe(401);
    });
  });

  describe("DELETE - Deletes one product from the database", () => {
    let customURL: string;

    beforeAll(async () => {
      customURL = "/TestModel";

      await cleanup();
    });

    beforeEach(async () => {
      agent = request.agent(app);
      await register_user("c1", Role.CUSTOMER);
      await register_user("c2", Role.CUSTOMER);
      await register_user("m1", Role.MANAGER);
      await register_user("a1", Role.ADMIN);
      await login("m1");
      await logout();
    });

    afterEach(async () => {
      await logout();
      await cleanup();
    });

    test("deleting a product - success", async () => {
      await login("a1");

      await agent.post(baseURL + "/").send({
        model: "TestModel",
        category: "Smartphone",
        quantity: 10,
        details: "TestDetails",
        sellingPrice: 123,
        arrivalDate: "2024-02-03",
      });

      const response = await agent.delete(baseURL + customURL).send({});

      const check = await agent.get(baseURL).query({
        grouping: "model",
        category: "",
        model: "TestModel",
      });

      expect(response.status).toBe(okStatus);

      expect(check.status).toBe(404);
    });

    test("deleting a product - access non authorized user", async () => {
      await login("c1");

      await agent.post(baseURL + "/").send({
        model: "TestModel",
        category: "Smartphone",
        quantity: 10,
        details: "TestDetails",
        sellingPrice: 123,
        arrivalDate: "2024-02-03",
      });

      const response = await agent.delete(baseURL + customURL).send({});

      expect(response.status).toBe(401);
    });

    test("deleting a product - model  not found", async () => {
      await login("a1");

      const response = await agent.delete(baseURL + customURL).send({});

      expect(response.status).toBe(404);
    });
  });

  describe("DELETE - Deletes all products from the database", () => {
    let customURL: string;

    beforeAll(async () => {
      customURL = "/";

      await cleanup();
    });

    beforeEach(async () => {
      agent = request.agent(app);
      await register_user("c1", Role.CUSTOMER);
      await register_user("c2", Role.CUSTOMER);
      await register_user("m1", Role.MANAGER);
      await register_user("a1", Role.ADMIN);
      await login("m1");
      await logout();
    });

    afterEach(async () => {
      await logout();
      await cleanup();
    });

    test("deleting a product - success", async () => {
      await login("a1");

      await agent.post(baseURL + "/").send({
        model: "TestModel",
        category: "Smartphone",
        quantity: 10,
        details: "TestDetails",
        sellingPrice: 123,
        arrivalDate: "2024-02-03",
      });

      const response = await agent.delete(baseURL + "/").send({});

      const check = await agent.get(baseURL + "/").query({
        grouping: "",
        category: "",
        model: "",
      });

      expect(response.status).toBe(okStatus);

      expect(check.status).toBe(200);
      expect(check.body).toStrictEqual([]);
    });

    test("deleting product - access non authorized user", async () => {
      await login("c1");

      await agent.post(baseURL + "/").send({
        model: "TestModel",
        category: "Smartphone",
        quantity: 10,
        details: "TestDetails",
        sellingPrice: 123,
        arrivalDate: "2024-02-03",
      });

      const response = await agent.delete(baseURL + customURL).send({});

      expect(response.status).toBe(401);
    });
  });
});
