import { test, expect, jest, describe, beforeEach } from "@jest/globals";
import ReviewController from "../../src/controllers/reviewController";
import UserController from "../../src/controllers/userController";
import ProductController from "../../src/controllers/productController";
import { Category } from "../../src/components/product";
import { Role, User } from "../../src/components/user";
import { ProductNotFoundError } from "../../src/errors/productError";
import { cleanup } from "../../src/db/cleanup";
import { Time } from "../../src/utilities";
import ProductDAO from "../../src/dao/productDAO";
import ReviewDAO from "../../src/dao/reviewDAO";
import {
	ExistingReviewError,
	NoReviewProductError,
} from "../../src/errors/reviewError";
import { ProductReview } from "../../src/components/review";

const controller = new ReviewController();
const testuser1 = new User("user1", "name", "surname", Role.CUSTOMER, "", "");
const testuser2 = new User("user2", "name", "surname", Role.CUSTOMER, "", "");

jest.spyOn(ProductDAO.prototype, "existsProduct");
jest.spyOn(ReviewDAO.prototype, "addReview");

beforeEach(async () => {
	await cleanup();
	jest.clearAllMocks();
	const ucontroller = new UserController();
	const pcontroller = new ProductController();
	await ucontroller.createUser(
		testuser1.username,
		testuser1.name,
		testuser1.surname,
		"password",
		testuser1.role
	);
	await ucontroller.createUser(
		testuser2.username,
		testuser2.name,
		testuser2.surname,
		"password",
		testuser2.role
	);
	await pcontroller.registerProducts(
		"model1",
		Category.LAPTOP,
		100,
		"details",
		1000,
		""
	);
	await pcontroller.registerProducts(
		"model2",
		Category.LAPTOP,
		100,
		"details",
		1000,
		""
	);
});

afterAll(async () => {
	await cleanup();
});

describe("Controller - Add Review", () => {
	test("Valid", async () => {
		const result = await controller.addReview(
			"model1",
			testuser1,
			5,
			"comment"
		);
		expect(result).toBeUndefined();

		expect(ProductDAO.prototype.existsProduct).toHaveBeenCalledTimes(1);
		expect(ProductDAO.prototype.existsProduct).toHaveBeenCalledWith(
			"model1"
		);

		expect(ReviewDAO.prototype.addReview).toHaveBeenCalledTimes(1);
		expect(ReviewDAO.prototype.addReview).toHaveBeenCalledWith(
			"model1",
			testuser1.username,
			5,
			"comment"
		);
	});

	test("Product Not Found", async () => {
		await expect(
			controller.addReview("notamodel", testuser1, 5, "comment")
		).rejects.toThrowError(ProductNotFoundError);

		expect(ProductDAO.prototype.existsProduct).toHaveBeenCalledTimes(1);
		expect(ProductDAO.prototype.existsProduct).toHaveBeenCalledWith(
			"notamodel"
		);

		expect(ReviewDAO.prototype.addReview).toHaveBeenCalledTimes(0);
	});

	test("Review Already Exists", async () => {
		await controller.addReview("model1", testuser1, 1, "lorem ipsum");
		await expect(
			controller.addReview("model1", testuser1, 5, "comment")
		).rejects.toThrowError(ExistingReviewError);

		expect(ProductDAO.prototype.existsProduct).toHaveBeenCalledTimes(2);
		expect(ReviewDAO.prototype.addReview).toHaveBeenCalledTimes(2);
	});
});

describe("Controller - Get All Reviews of a Product", () => {
	test("Valid", async () => {
		const reviews = [
			new ProductReview(
				"model1",
				testuser1.username,
				5,
				Time.today(),
				"comment"
			),
			new ProductReview(
				"model1",
				testuser2.username,
				4,
				Time.today(),
				"comment"
			),
		];
		await controller.addReview("model1", testuser1, 5, "comment");
		await controller.addReview("model1", testuser2, 4, "comment");

		// model2 should not have any review at this point, yet it fails here
		await controller.addReview("model2", testuser1, 1, "comment");

		const result = await controller.getProductReviews("model1");
		expect(result).toHaveLength(2);
		expect(result).toStrictEqual(reviews);
	});

	test("Product Not Found", async () => {
		await controller.addReview("model1", testuser1, 5, "comment");
		await controller.addReview("model1", testuser2, 4, "comment");

		// same here
		await controller.addReview("model2", testuser1, 1, "comment");

		await expect(
			controller.getProductReviews("notamodel")
		).rejects.toThrowError(ProductNotFoundError);
	});

	test("No Reviews", async () => {
		await controller.addReview("model2", testuser1, 1, "comment");

		const result = await controller.getProductReviews("model1");
		expect(result).toHaveLength(0);
		expect(result).toStrictEqual([]);
	});
});

describe("Controller - Delete Review of a Product by a User", () => {
	test("Valid", async () => {
		await controller.addReview("model1", testuser1, 5, "comment");
		await controller.addReview("model1", testuser2, 4, "comment");
		await controller.addReview("model2", testuser1, 5, "comment");

		await controller.deleteReview("model1", testuser1);
		expect(await controller.getProductReviews("model1")).toStrictEqual([
			new ProductReview(
				"model1",
				testuser2.username,
				4,
				Time.today(),
				"comment"
			),
		]);
		expect(await controller.getProductReviews("model2")).toStrictEqual([
			new ProductReview(
				"model2",
				testuser1.username,
				5,
				Time.today(),
				"comment"
			),
		]);
	});
});

describe("Controller - Delete All Reviews of a Product", () => {
	test("Valid", async () => {
		await controller.addReview("model1", testuser1, 5, "comment");
		await controller.addReview("model1", testuser2, 4, "comment");
		await controller.addReview("model2", testuser1, 5, "comment");

		await controller.deleteReviewsOfProduct("model1");
		expect(await controller.getProductReviews("model1")).toStrictEqual([]);

		const res = await controller.getProductReviews("model2");
		expect(res).toStrictEqual([
			new ProductReview(
				"model2",
				testuser1.username,
				5,
				Time.today(),
				"comment"
			),
		]);
	});

	test("Product Not Found", async () => {
		await controller.addReview("model1", testuser1, 5, "comment");
		await controller.addReview("model1", testuser2, 4, "comment");
		await controller.addReview("model2", testuser1, 5, "comment");

		await expect(
			controller.deleteReviewsOfProduct("notamodel")
		).rejects.toThrowError(ProductNotFoundError);
		const rew = await controller.getProductReviews("model1");
		expect(rew).toHaveLength(2);
		expect(rew).toContainEqual(
			new ProductReview(
				"model1",
				testuser1.username,
				5,
				Time.today(),
				"comment"
			)
		);
		expect(rew).toContainEqual(
			new ProductReview(
				"model1",
				testuser2.username,
				4,
				Time.today(),
				"comment"
			)
		);

		expect(await controller.getProductReviews("model2")).toStrictEqual([
			new ProductReview(
				"model2",
				testuser1.username,
				5,
				Time.today(),
				"comment"
			),
		]);
	});
});

describe("Controller - Delete All Reviews", () => {
	test("Valid", async () => {
		await controller.addReview("model1", testuser1, 5, "comment");
		await controller.addReview("model1", testuser2, 4, "comment");
		await controller.addReview("model2", testuser1, 5, "comment");

		await controller.deleteAllReviews();
		expect(await controller.getProductReviews("model1")).toStrictEqual([]);
		expect(await controller.getProductReviews("model2")).toStrictEqual([]);
	});
});
