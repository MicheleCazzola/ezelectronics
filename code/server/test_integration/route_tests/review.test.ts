import { jest, beforeEach, describe, test, expect } from "@jest/globals";
import { app } from "../../index";

import request from "supertest";
import { Role } from "../../src/components/user";
import { cleanup } from "../../src/db/cleanup";
import { Time } from "../../src/utilities";
import { Category } from "../../src/components/product";

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
		model: "model1",
		category: Category.LAPTOP,
		sellingPrice: 100,
		quantity: 10,
		details: "details",
		arrivalDate: Time.now(),
	});
};

beforeEach(async () => {
	await cleanup();
	agent = request.agent(app);
	await register_user("user1", Role.CUSTOMER);
	await register_user("user2", Role.CUSTOMER);
	await register_user("manager", Role.MANAGER);
	await login("manager");
	await create_product("model1");
	await create_product("model2");
	await logout(); // probably not necessary but good measure
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
});

describe("Route - Get Reviews", () => {});
describe("Route - Delete Review", () => {});
describe("Route - Delete All Product Reviews", () => {});
describe("Route - Delete All Reviews", () => {});
