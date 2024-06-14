import { beforeEach, afterAll, describe, expect, test } from "@jest/globals";

import ReviewDAO from "../../src/dao/reviewDAO";
import { cleanup } from "../../src/db/cleanup";
import { ProductNotFoundError } from "../../src/errors/productError";
import {
	ExistingReviewError,
	NoReviewProductError,
} from "../../src/errors/reviewError";
import ProductDAO from "../../src/dao/productDAO";
import UserDAO from "../../src/dao/userDAO";
import { Category } from "../../src/components/product";
import { ProductReview } from "../../src/components/review";
import { Time } from "../../src/utilities";

const pdao = new ProductDAO();
const udao = new UserDAO();
const dao = new ReviewDAO();

beforeEach(async () => {
	await cleanup();
	await pdao.createProduct(
		"testmodel",
		Category.LAPTOP,
		100,
		"testdetails",
		10,
		"2021-01-01"
	);
	await pdao.createProduct(
		"testmodel2",
		Category.SMARTPHONE,
		101,
		"testdetails2",
		10,
		"2021-01-02"
	);
	await udao.createUser("testuser", "a", "b", "password", "Customer");
	await udao.createUser("testuser2", "a", "b", "password", "Customer");
});

afterAll(async () => {
	await cleanup();
});

describe("DAO - Add a Review", () => {
	test("Product Not Found", async () => {
		const testCase = {
			model: "notamodel",
			username: "testuser",
			score: 5,
			comment: "Lorem Ipsum",
		};
		await expect(
			dao.addReview(
				testCase.model,
				testCase.username,
				testCase.score,
				testCase.comment
			)
		).rejects.toThrow(ProductNotFoundError);
	});

	test("Valid", async () => {
		const testCase = {
			model: "testmodel",
			username: "testuser",
			score: 5,
			comment: "Lorem Ipsum",
		};

		const result = await dao.addReview(
			testCase.model,
			testCase.username,
			testCase.score,
			testCase.comment
		);

		expect(result).toBeUndefined();

		expect(await dao.getProductReviews(testCase.model)).toStrictEqual([
			new ProductReview(
				testCase.model,
				testCase.username,
				testCase.score,
				Time.today(),
				testCase.comment
			),
		]);
	});

	test("Multiple Valid - Same Model", async () => {
		const testCases = [
			new ProductReview(
				"testmodel",
				"testuser",
				5,
				Time.today(),
				"Lorem Ipsum"
			),
			new ProductReview(
				"testmodel",
				"testuser2",
				4,
				Time.today(),
				"Lorem Ipsum"
			),
		];
		for (const testCase of testCases) {
			const result = await dao.addReview(
				testCase.model,
				testCase.user,
				testCase.score,
				testCase.comment
			);
			expect(result).toBeUndefined();
		}
		expect(await dao.getProductReviews("testmodel")).toStrictEqual(
			testCases
		);
	});

	test("Multiple Valid - Same User", async () => {
		const reviews = [
			new ProductReview(
				"testmodel",
				"testuser",
				5,
				Time.today(),
				"Lorem Ipsum"
			),
			new ProductReview(
				"testmodel2",
				"testuser",
				4,
				Time.today(),
				"Lorem Ipsum"
			),
		];

		for (const review of reviews) {
			const result = await dao.addReview(
				review.model,
				review.user,
				review.score,
				review.comment
			);
			expect(result).toBeUndefined();
		}
		expect(await dao.getProductReviews(reviews[0].model)).toStrictEqual([
			reviews[0],
		]);
		expect(await dao.getProductReviews(reviews[1].model)).toStrictEqual([
			reviews[1],
		]);
	});

	test("Review Already Exist", async () => {
		const testCase = {
			model: "testmodel",
			username: "testuser",
			score: 5,
			comment: "Lorem Ipsum",
		};
		// setup
		await dao.addReview(
			testCase.model,
			testCase.username,
			testCase.score,
			testCase.comment
		);

		// test
		await expect(
			dao.addReview(
				testCase.model,
				testCase.username,
				testCase.score,
				testCase.comment
			)
		).rejects.toThrow(ExistingReviewError);

		expect(await dao.getProductReviews(testCase.model)).toStrictEqual([
			new ProductReview(
				testCase.model,
				testCase.username,
				testCase.score,
				Time.today(),
				testCase.comment
			),
		]);
	});
});

describe("DAO - Get Product's Reviews", () => {
	const reviews = [
		new ProductReview(
			"testmodel",
			"testuser",
			5,
			Time.today(),
			"lorem ipsum"
		),
		new ProductReview(
			"testmodel",
			"testuser2",
			5,
			Time.today(),
			"lorem ipsum dolor sit amet"
		),
	];

	test("Valid", async () => {
		// setup
		for (const review of reviews) {
			await dao.addReview(
				review.model,
				review.user,
				review.score,
				review.comment
			);
		}

		// test
		const result = await dao.getProductReviews("testmodel");
		expect(result).toHaveLength(2);
		expect(result).toContainEqual(reviews[0]);
		expect(result).toContainEqual(reviews[1]);
	});
});

describe("DAO - Delete a Review", () => {
	test("Valid", async () => {
		// setup
		await dao.addReview("testmodel", "testuser", 5, "lorem ipsum");

		// test
		const result = await dao.deleteReview("testmodel", "testuser");
		expect(result).toBeUndefined();
	});

	test("Review Not Found", async () => {
		// test
		await expect(dao.deleteReview("testmodel", "testuser")).rejects.toThrow(
			NoReviewProductError
		);
	});
});

describe("DAO - Delete All Reviews of a Product", () => {
	test("Valid", async () => {
		// setup
		await dao.addReview("testmodel", "testuser", 5, "lorem ipsum");
		await dao.addReview("testmodel", "testuser2", 5, "lorem ipsum");

		// test
		const result = await dao.deleteReviewsOfProduct("testmodel");
		expect(result).toBeUndefined();

		expect(await dao.getProductReviews("testmodel")).toStrictEqual([]);
	});
});

describe("DAO - Delete All Reviews", () => {
	test("Valid", async () => {
		// setup
		await dao.addReview("testmodel", "testuser", 5, "lorem ipsum");
		await dao.addReview("testmodel", "testuser2", 5, "lorem ipsum");
		await dao.addReview("testmodel2", "testuser", 1, "lorem ipsum");
		await dao.addReview("testmodel2", "testuser2", 5, "lorem ipsum");

		// test
		const result = await dao.deleteAllReviews();
		expect(result).toBeUndefined();

		expect(await dao.getProductReviews("testmodel")).toStrictEqual([]);
		expect(await dao.getProductReviews("testmodel2")).toStrictEqual([]);
	});
});
