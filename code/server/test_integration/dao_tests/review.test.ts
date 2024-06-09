import { beforeEach, describe, expect, jest, test } from "@jest/globals";
import crypto from "crypto";

import ReviewDAO from "../../src/dao/reviewDAO";
import { cleanup } from "../../src/db/cleanup";
import db from "../../src/db/db";
import { ProductNotFoundError } from "../../src/errors/productError";
import { ExistingReviewError } from "../../src/errors/reviewError";
import ProductDAO from "../../src/dao/productDAO";
import UserDAO from "../../src/dao/userDAO";
import { Category } from "../../src/components/product";
import { ProductReview } from "../../src/components/review";
import dayjs from "dayjs";

const pdao = new ProductDAO();
const udao = new UserDAO();
const dao = new ReviewDAO();

beforeEach(async () => {
	//jest.clearAllMocks();
	await cleanup();
	await pdao.createProduct(
		"testmodel",
		Category.LAPTOP,
		100,
		"testdetails",
		10,
		"2021-01-01"
	);
	await udao.createUser("testuser", "a", "b", "password", "Customer");
	await udao.createUser("testuser2", "a", "b", "password", "Customer");
});

describe("DAO - Add a Review", () => {
	test("Product Not Found", async () => {
		const testCase = {
			input: {
				model: "notamodel",
				username: "testuser",
				score: 5,
				comment: "Lorem Ipsum",
			},
			expected: ProductNotFoundError,
		};
		jest.spyOn(db, "run");
		await expect(
			dao.addReview(
				testCase.input.model,
				testCase.input.username,
				testCase.input.score,
				testCase.input.comment
			)
		).rejects.toThrow(testCase.expected);

		expect(db.run).toBeCalledTimes(1);
		expect(db.run).toBeCalledWith(
			expect.any(String), // sql query
			expect.arrayContaining([
				testCase.input.username,
				testCase.input.model,
				expect.any(String), // date
				testCase.input.comment,
				testCase.input.score,
			]),
			expect.any(Function)
		);
	});

	test("Valid", async () => {
		const testCase = {
			input: {
				model: "testmodel",
				username: "testuser",
				score: 5,
				comment: "Lorem Ipsum",
			},
			expected: undefined as void,
		};
		jest.spyOn(db, "run").mockClear();
		const result = await dao.addReview(
			testCase.input.model,
			testCase.input.username,
			testCase.input.score,
			testCase.input.comment
		);

		expect(result).toBe(testCase.expected);
		expect(db.run).toBeCalledTimes(1);
		expect(db.run).toBeCalledWith(
			expect.any(String), // sql query
			expect.arrayContaining([
				testCase.input.username,
				testCase.input.model,
				expect.any(String), // date
				testCase.input.comment,
				testCase.input.score,
			]),
			expect.any(Function)
		);
	});

	test("Review Already Exist", async () => {
		const testCase = {
			input: {
				model: "testmodel",
				username: "testuser",
				score: 5,
				comment: "Lorem Ipsum",
			},
			expected: ExistingReviewError,
		};
		jest.spyOn(db, "run").mockClear();
		try {
			await dao.addReview(
				testCase.input.model,
				testCase.input.username,
				testCase.input.score,
				testCase.input.comment
			);
		} catch (err) {
			expect(err).toBeInstanceOf(testCase.expected);
		}

		expect(db.run).toBeCalledTimes(1);
		expect(db.run).toBeCalledWith(
			expect.any(String), // sql query
			expect.arrayContaining([
				testCase.input.username,
				testCase.input.model,
				expect.any(String), // date
				testCase.input.comment,
				testCase.input.score,
			]),
			expect.any(Function)
		);
	});
});

describe("DAO - Get Product's Reviews", () => {
	const reviews = [
		new ProductReview(
			"testmodel",
			"testuser",
			5,
			new Date().toISOString(),
			"lorem ipsum"
		),
		new ProductReview(
			"testmodel",
			"testuser2",
			5,
			new Date().toISOString(),
			"lorem ipsum dolor sit amet"
		),
	];
	test("Valid", async () => {
		// setup
		for (const review of reviews) {
			dao.addReview(
				review.model,
				review.user,
				review.score,
				review.comment
			);
		}

		// test
		jest.spyOn(db, "all");

		const result = await dao.getProductReviews("testmodel");
		expect(result).toStrictEqual(reviews);

		expect(db.all).toBeCalledTimes(1);
		expect(db.all).toBeCalledWith(
			expect.any(String), // sql query
			expect.arrayContaining(["testmodel"]),
			expect.any(Function)
		);
	});

	test("Product Not Found", async () => {
		// test
		jest.spyOn(db, "all").mockClear();

		await expect(dao.getProductReviews("notamodel")).rejects.toThrow(
			ProductNotFoundError
		);

		expect(db.all).toBeCalledTimes(1);
		expect(db.all).toBeCalledWith(
			expect.any(String), // sql query
			expect.arrayContaining(["notamodel"]),
			expect.any(Function)
		);
	});
});