import { beforeEach, afterAll, describe, expect, jest, test } from "@jest/globals";
import crypto from "crypto";

import ReviewDAO from "../../src/dao/reviewDAO";
import { cleanup } from "../../src/db/cleanup";
import db from "../../src/db/db";
import { ProductNotFoundError } from "../../src/errors/productError";
import {
	ExistingReviewError,
	NoReviewProductError,
} from "../../src/errors/reviewError";
import ProductDAO from "../../src/dao/productDAO";
import UserDAO from "../../src/dao/userDAO";
import { Category } from "../../src/components/product";
import { ProductReview } from "../../src/components/review";
import dayjs from "dayjs";
import { UserNotFoundError } from "../../src/errors/userError";
import { Time } from "../../src/utilities";

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
		jest.spyOn(db, "run");
		await expect(
			dao.addReview(
				testCase.model,
				testCase.username,
				testCase.score,
				testCase.comment
			)
		).rejects.toThrow(ProductNotFoundError);

		expect(db.run).toBeCalledTimes(1);
		expect(db.run).toBeCalledWith(
			expect.any(String), // sql query
			expect.arrayContaining([
				testCase.username,
				testCase.model,
				expect.any(String), // date
				testCase.comment,
				testCase.score,
			]),
			expect.any(Function)
		);
	});

	test("Valid", async () => {
		const testCase = {
			model: "testmodel",
			username: "testuser",
			score: 5,
			comment: "Lorem Ipsum",
		};
		jest.spyOn(db, "run").mockClear();
		const result = await dao.addReview(
			testCase.model,
			testCase.username,
			testCase.score,
			testCase.comment
		);

		expect(result).resolves.toBeUndefined;
		expect(db.run).toBeCalledTimes(1);
		expect(db.run).toBeCalledWith(
			expect.any(String), // sql query
			expect.arrayContaining([
				testCase.username,
				testCase.model,
				expect.any(String), // date
				testCase.comment,
				testCase.score,
			]),
			expect.any(Function)
		);
		await expect(
			dao.getProductReviews(testCase.model)
		).resolves.toStrictEqual([
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
		jest.spyOn(db, "run").mockClear();
		for (const testCase of testCases) {
			const result = await dao.addReview(
				testCase.model,
				testCase.user,
				testCase.score,
				testCase.comment
			);
			expect(result).resolves.toBeUndefined;
			expect(db.run).toBeCalledWith(
				expect.any(String), // sql query
				expect.arrayContaining([
					testCase.user,
					testCase.model,
					Time.today(),
					testCase.comment,
					testCase.score,
				]),
				expect.any(Function)
			);
		}
		await expect(dao.getProductReviews("testmodel")).resolves.toStrictEqual(
			testCases
		);
		expect(db.run).toBeCalledTimes(2);
	});

	test("Multiple Valid - Same User", async () => {
		const testCases = [
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
		jest.spyOn(db, "run").mockClear();
		for (const testCase of testCases) {
			const result = await dao.addReview(
				testCase.model,
				testCase.user,
				testCase.score,
				testCase.comment
			);
			expect(result).resolves.toBeUndefined;
			expect(db.run).toBeCalledWith(
				expect.any(String), // sql query
				expect.arrayContaining([
					testCase.user,
					testCase.model,
					Time.today(),
					testCase.comment,
					testCase.score,
				]),
				expect.any(Function)
			);
		}
		await expect(
			dao.getProductReviews(testCases[0].model)
		).resolves.toStrictEqual([testCases[0]]);
		await expect(
			dao.getProductReviews(testCases[1].model)
		).resolves.toStrictEqual([testCases[1]]);
		expect(db.run).toBeCalledTimes(2);
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
		jest.spyOn(db, "run").mockClear();
		await expect(
			dao.addReview(
				testCase.model,
				testCase.username,
				testCase.score,
				testCase.comment
			)
		).rejects.toThrow(ExistingReviewError);

		expect(db.run).toBeCalledTimes(1);
		expect(db.run).toBeCalledWith(
			expect.any(String), // sql query
			expect.arrayContaining([
				testCase.username,
				testCase.model,
				expect.any(String), // date
				testCase.comment,
				testCase.score,
			]),
			expect.any(Function)
		);

		await expect(
			dao.getProductReviews(testCase.model)
		).resolves.toStrictEqual([
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
		jest.spyOn(db, "all").mockClear();

		const result = await dao.getProductReviews("testmodel");
		expect(result).toHaveLength(2);
		expect(result).toContainEqual(reviews[0]);
		expect(result).toContainEqual(reviews[1]);

		expect(db.all).toBeCalledTimes(1);
		expect(db.all).toBeCalledWith(
			expect.any(String), // sql query
			expect.arrayContaining(["testmodel"]),
			expect.any(Function)
		);
	});
});

describe("DAO - Delete a Review", () => {
	test("Valid", async () => {
		// setup
		await dao.addReview("testmodel", "testuser", 5, "lorem ipsum");

		// test
		jest.spyOn(db, "run").mockClear();

		const result = await dao.deleteReview("testmodel", "testuser");
		expect(result).toBeUndefined();

		expect(db.run).toBeCalledTimes(1);
		expect(db.run).toBeCalledWith(
			expect.any(String), // sql query
			expect.arrayContaining(["testmodel", "testuser"]),
			expect.any(Function)
		);
	});

	test("Review Not Found", async () => {
		// test
		jest.spyOn(db, "run").mockClear();

		await expect(dao.deleteReview("testmodel", "testuser")).rejects.toThrow(
			NoReviewProductError
		);

		expect(db.run).toBeCalledTimes(1);
		expect(db.run).toBeCalledWith(
			expect.any(String), // sql query
			expect.arrayContaining(["testmodel", "testuser"]),
			expect.any(Function)
		);
	});
});

describe("DAO - Delete All Reviews of a Product", () => {
	test("Valid", async () => {
		// setup
		await dao.addReview("testmodel", "testuser", 5, "lorem ipsum");
		await dao.addReview("testmodel", "testuser2", 5, "lorem ipsum");

		// test
		jest.spyOn(db, "run").mockClear();

		const result = await dao.deleteReviewsOfProduct("testmodel");
		expect(result).toBeUndefined();

		expect(db.run).toBeCalledTimes(1);
		expect(db.run).toBeCalledWith(
			expect.any(String), // sql query
			expect.arrayContaining(["testmodel"]),
			expect.any(Function)
		);

		await expect(dao.getProductReviews("testmodel")).resolves.toStrictEqual(
			[]
		);
	});
});

describe("DAO - Delete All Reviews", () => {
	test("Valid", async () => {
		// setup
		await dao.addReview("testmodel", "testuser", 5, "lorem ipsum");
		await dao.addReview("testmodel", "testuser2", 5, "lorem ipsum");
		//await dao.addReview("testmodel2", "testuser", 1, "lorem ipsum");
		//await dao.addReview("testmodel2", "testuser2", 5, "lorem ipsum");

		// test
		jest.spyOn(db, "run").mockClear();

		const result = await dao.deleteAllReviews();
		expect(result).toBeUndefined();

		expect(db.run).toBeCalledTimes(1);
		expect(db.run).toBeCalledWith(
			expect.any(String), // sql query
			expect.any(Function)
		);

		await expect(dao.getProductReviews("testmodel")).resolves.toStrictEqual(
			[]
		);
		await expect(
			dao.getProductReviews("testmodel2")
		).resolves.toStrictEqual([]);
	});
});
