import { jest, beforeEach, describe, test, expect, afterEach } from "@jest/globals";
import { app } from "../../index";

import request from "supertest";
import { Role } from "../../src/components/user";
import { cleanup } from "../../src/db/cleanup_custom";
import { Time } from "../../src/utilities";
import { Category } from "../../src/components/product";
import { log } from "console";
import exp from "constants";
import { exitCode } from "process";

const baseURL = "/ezelectronics/reviews";
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

const create_product = async (model: string) => {
	return agent.post("/ezelectronics/products").send({
		model: model,
		category: Category.LAPTOP,
		sellingPrice: 100,
		quantity: 10,
		details: "details",
		arrivalDate: Time.today(),
	});
};

beforeEach(async () => {
	await cleanup();
	agent = request.agent(app);
	await register_user("user1", Role.CUSTOMER);
	await register_user("user2", Role.CUSTOMER);
	await register_user("manager", Role.MANAGER);
	await register_user("admin", Role.ADMIN);
	await login("manager");
	await create_product("model1");
	await create_product("model2");
	await logout(); // probably not necessary but good measure
});

afterEach(async () => {
	await logout(); // just making sure
});

afterAll(async () => {
	await cleanup();
});

describe("Route - Add Review", () => {
	test("Valid", async () => {
		await login("user1");
		const response = await agent.post(`${baseURL}/model1`).send({
			score: 5,
			comment: "comment",
		});

		expect(response.status).toBe(200);
	});

	test("Empty Comment", async () => {
		await login("user1");
		const response = await agent.post(`${baseURL}/model1`).send({
			score: 5,
			comment: "",
		});

		expect(response.status).toBe(422);
	});

	test("No Score", async () => {
		await login("user1");
		const response = await agent.post(`${baseURL}/model1`).send({
			comment: "comment",
		});

		expect(response.status).toBe(422);
	});

	test("No Comment", async () => {
		await login("user1");
		const response = await agent.post(`${baseURL}/model1`).send({
			score: 5,
		});

		expect(response.status).toBe(422);
	});

	test("Score Too High", async () => {
		await login("user1");
		const response = await agent.post(`${baseURL}/model1`).send({
			score: 6,
			comment: "comment",
		});

		expect(response.status).toBe(422);
	});

	test("Score Too Low", async () => {
		await login("user1");
		const response = await agent.post(`${baseURL}/model1`).send({
			score: 0,
			comment: "comment",
		});

		expect(response.status).toBe(422);

		const response2 = await agent.post(`${baseURL}/model1`).send({
			score: -1,
			comment: "comment",
		});

		expect(response2.status).toBe(422);
	});

	test("Product Not Found", async () => {
		await login("user1");
		const response = await agent.post(`${baseURL}/notamodel`).send({
			score: 5,
			comment: "comment",
		});

		expect(response.status).toBe(404);
		expect(response.body).toStrictEqual({
			error: "Product not found",
			status: 404,
		});
	});

	test("Review Already Exists", async () => {
		await login("user1");
		await agent.post(`${baseURL}/model1`).send({
			score: 5,
			comment: "comment",
		});

		const response = await agent.post(`${baseURL}/model1`).send({
			score: 2,
			comment: "comment",
		});

		expect(response.status).toBe(409);
		expect(response.body).toStrictEqual({
			error: "You have already reviewed this product",
			status: 409,
		});
	});

	test("User Not Logged In", async () => {
		const response = await agent.post(`${baseURL}/model1`).send({
			score: 5,
			comment: "comment",
		});

		expect(response.status).toBe(401);
		expect(response.body).toStrictEqual({
			error: "Unauthenticated user",
			status: 401,
		});
	});

	test("User Not a Customer", async () => {
		await login("manager");
		const response = await agent.post(`${baseURL}/model1`).send({
			score: 5,
			comment: "comment",
		});
		expect(response.status).toBe(401);
		expect(response.body).toStrictEqual({
			error: "User is not a customer",
			status: 401,
		});

		await login("admin");
		const response2 = await agent.post(`${baseURL}/model1`).send({
			score: 5,
			comment: "comment",
		});
		expect(response2.status).toBe(401);
		expect(response.body).toStrictEqual({
			error: "User is not a customer",
			status: 401,
		});
	});
});

describe("Route - Get Reviews", () => {
	test("Valid", async () => {
		const expectedReviews = [
			{
				user: "user1",
				model: "model1",
				score: 5,
				date: Time.today(),
				comment: "comment",
			},
			{
				user: "user2",
				model: "model1",
				score: 4,
				date: Time.today(),
				comment: "comment",
			},
			{
				user: "user1",
				model: "model2",
				score: 1,
				date: Time.today(),
				comment: "comment",
			},
		];

		await login("user1");
		await agent.post(`${baseURL}/model1`).send({
			score: 5,
			comment: "comment",
		});
		await agent.post(`${baseURL}/model2`).send({
			score: 1,
			comment: "comment",
		});
		await logout();

		await login("user2");
		await agent.post(`${baseURL}/model1`).send({
			score: 4,
			comment: "comment",
		});

		const response = await agent.get(`${baseURL}/model1`);
		expect(response.status).toBe(200);
		expect(response.body).toHaveLength(2);
		expect(response.body).toContainEqual(expectedReviews[0]);
		expect(response.body).toContainEqual(expectedReviews[1]);

		const response2 = await agent.get(`${baseURL}/model2`);
		expect(response2.status).toBe(200);
		expect(response2.body).toStrictEqual([expectedReviews[2]]);
	});

	test("Valid - No Reviews", async () => {
		await login("user1");
		await agent.post(`${baseURL}/model2`).send({
			score: 5,
			comment: "comment",
		});

		const response = await agent.get(`${baseURL}/model1`);
		expect(response.status).toBe(200);
		expect(response.body).toHaveLength(0);
		expect(response.body).toStrictEqual([]);
	});

	test("Product Not Found", async () => {
		await login("user1");
		const response = await agent.get(`${baseURL}/notamodel`);
		expect(response.status).toBe(404);
		expect(response.body).toStrictEqual({
			error: "Product not found",
			status: 404,
		});
	});

	test("User Not Logged In", async () => {
		const response = await agent.get(`${baseURL}/model1`);
		expect(response.status).toBe(401);
		expect(response.body).toStrictEqual({
			error: "Unauthenticated user",
			status: 401,
		});
	});
});

describe("Route - Delete Review", () => {
	test("Valid", async () => {
		// setup
		await login("user1");
		await agent.post(`${baseURL}/model1`).send({
			score: 5,
			comment: "comment",
		});
		await agent.post(`${baseURL}/model2`).send({
			score: 4,
			comment: "comment",
		});
		await logout();

		await login("user2");
		await agent.post(`${baseURL}/model1`).send({
			score: 5,
			comment: "comment",
		});

		// test
		const response = await agent.delete(`${baseURL}/model1`);
		expect(response.status).toBe(200);

		const reviews1 = await agent.get(`${baseURL}/model1`);
		expect(reviews1.body).toStrictEqual([
			{
				user: "user1",
				model: "model1",
				score: 5,
				date: Time.today(),
				comment: "comment",
			},
		]);

		const reviews2 = await agent.get(`${baseURL}/model2`);
		expect(reviews2.body).toStrictEqual([
			{
				user: "user1",
				model: "model2",
				score: 4,
				date: Time.today(),
				comment: "comment",
			},
		]);
	});

	test("Product Not Found", async () => {
		await login("user1");
		const response = await agent.delete(`${baseURL}/notamodel`);
		expect(response.status).toBe(404);
		expect(response.body).toStrictEqual({
			error: "Product not found",
			status: 404,
		});
	});

	test("Review Doesn't Exist", async () => {
		await login("user1");
		const response = await agent.delete(`${baseURL}/model1`);
		expect(response.status).toBe(404);
		expect(response.body).toStrictEqual({
			error: "You have not reviewed this product",
			status: 404,
		});
	});

	test("User Not Logged In", async () => {
		const response = await agent.delete(`${baseURL}/model1`);
		expect(response.status).toBe(401);
		expect(response.body).toStrictEqual({
			error: "Unauthenticated user",
			status: 401,
		});
	});

	test("User Not a Customer", async () => {
		await login("manager");
		const response = await agent.delete(`${baseURL}/model1`);
		expect(response.status).toBe(401);
		expect(response.body).toStrictEqual({
			error: "User is not a customer",
			status: 401,
		});

		await login("admin");
		const response2 = await agent.delete(`${baseURL}/model1`);
		expect(response2.status).toBe(401);
		expect(response2.body).toStrictEqual({
			error: "User is not a customer",
			status: 401,
		});
	});
});

describe("Route - Delete All Product Reviews", () => {
	test("Valid - Admin", async () => {
		// setup
		await login("user1");
		await agent.post(`${baseURL}/model1`).send({
			score: 5,
			comment: "comment",
		});
		await agent.post(`${baseURL}/model2`).send({
			score: 4,
			comment: "comment",
		});
		await logout();

		await login("user2");
		await agent.post(`${baseURL}/model1`).send({
			score: 5,
			comment: "comment",
		});

		// test
		await login("admin");
		const response = await agent.delete(`${baseURL}/model1/all`);
		expect(response.status).toBe(200);

		const reviews1 = await agent.get(`${baseURL}/model1`);
		expect(reviews1.body).toStrictEqual([]);

		const reviews2 = await agent.get(`${baseURL}/model2`);
		expect(reviews2.body).toStrictEqual([
			{
				user: "user1",
				model: "model2",
				score: 4,
				date: Time.today(),
				comment: "comment",
			},
		]);
	});

	test("Valid - Manager", async () => {
		// setup
		await login("user1");
		await agent.post(`${baseURL}/model1`).send({
			score: 5,
			comment: "comment",
		});
		await agent.post(`${baseURL}/model2`).send({
			score: 4,
			comment: "comment",
		});
		await logout();

		await login("user2");
		await agent.post(`${baseURL}/model1`).send({
			score: 5,
			comment: "comment",
		});

		// test
		await login("manager");
		const reviews2 = await agent.get(`${baseURL}/model2`);
		expect(reviews2.body).toStrictEqual([
			{
				user: "user1",
				model: "model2",
				score: 4,
				date: Time.today(),
				comment: "comment",
			},
		]);

		const response = await agent.delete(`${baseURL}/model1/all`);
		expect(response.status).toBe(200);

		const reviews1 = await agent.get(`${baseURL}/model1`);
		expect(reviews1.body).toStrictEqual([]);
	});

	test("Product Not Found", async () => {
		await login("admin");
		const response = await agent.delete(`${baseURL}/notamodel/all`);
		expect(response.status).toBe(404);
		expect(response.body).toStrictEqual({
			error: "Product not found",
			status: 404,
		});

		await login("manager");
		const response2 = await agent.delete(`${baseURL}/notamodel/all`);
		expect(response2.status).toBe(404);
		expect(response2.body).toStrictEqual({
			error: "Product not found",
			status: 404,
		});
	});

	test("User Not Logged In", async () => {
		const response = await agent.delete(`${baseURL}/model1/all`);
		expect(response.status).toBe(401);
		expect(response.body).toStrictEqual({
			error: "Unauthenticated user",
			status: 401,
		});
	});

	test("User Not Admin or Manager", async () => {
		await login("user1");
		const response = await agent.delete(`${baseURL}/model1/all`);
		expect(response.status).toBe(401);
		expect(response.body).toStrictEqual({
			error: "User is not an admin or manager",
			status: 401,
		});
	});
});

describe("Route - Delete All Reviews", () => {
	test("Valid - Admin", async () => {
		// setup
		await login("user1");
		await agent.post(`${baseURL}/model1`).send({
			score: 5,
			comment: "comment",
		});
		await agent.post(`${baseURL}/model2`).send({
			score: 4,
			comment: "comment",
		});
		await logout();

		await login("user2");
		await agent.post(`${baseURL}/model1`).send({
			score: 5,
			comment: "comment",
		});

		// test
		await login("admin");
		const response = await agent.delete(`${baseURL}/`);
		expect(response.status).toBe(200);

		const reviews1 = await agent.get(`${baseURL}/model1`);
		expect(reviews1.body).toStrictEqual([]);

		const reviews2 = await agent.get(`${baseURL}/model2`);
		expect(reviews2.body).toStrictEqual([]);
	});

	test("Valid - Manager", async () => {
		// setup
		await login("user1");
		await agent.post(`${baseURL}/model1`).send({
			score: 5,
			comment: "comment",
		});
		await agent.post(`${baseURL}/model2`).send({
			score: 4,
			comment: "comment",
		});
		await logout();

		await login("user2");
		await agent.post(`${baseURL}/model1`).send({
			score: 5,
			comment: "comment",
		});

		// test
		await login("manager");
		const response = await agent.delete(`${baseURL}/`);
		expect(response.status).toBe(200);

		const reviews1 = await agent.get(`${baseURL}/model1`);
		expect(reviews1.body).toStrictEqual([]);

		const reviews2 = await agent.get(`${baseURL}/model2`);
		expect(reviews2.body).toStrictEqual([]);
	});

	test("User Not Logged In", async () => {
		const response = await agent.delete(`${baseURL}/`);
		expect(response.status).toBe(401);
		expect(response.body).toStrictEqual({
			error: "Unauthenticated user",
			status: 401,
		});
	});

	test("User Not Admin or Manager", async () => {
		await login("user1");
		const response = await agent.delete(`${baseURL}/`);
		expect(response.status).toBe(401);
		expect(response.body).toStrictEqual({
			error: "User is not an admin or manager",
			status: 401,
		});
	});
});
