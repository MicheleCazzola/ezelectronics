import { test, expect, jest, describe, beforeEach } from "@jest/globals";
import db from "../../src/db/db";
import { Database } from "sqlite3";
import ReviewDAO from "../../src/dao/reviewDAO";
import { ProductNotFoundError } from "../../src/errors/productError";
import {
	ExistingReviewError,
	NoReviewProductError,
} from "../../src/errors/reviewError";
import { ProductReview } from "../../src/components/review";
import ProductDAO from "../../src/dao/productDAO";

jest.mock("../../src/dao/productDAO");

beforeEach(() => {
	jest.clearAllMocks();
});

const dao = new ReviewDAO();

describe("ReviewDAO - Add a Review", () => {
	const testCase = {
		model: "testmodel",
		username: "testuser",
		score: 5,
		comment: "lorem ipsum",
	};
	test("Valid", async () => {
		jest.spyOn(db, "run").mockImplementationOnce((query, values, cb) => {
			cb(null);
			return {} as Database;
		});

		const result = await dao.addReview(
			testCase.model,
			testCase.username,
			testCase.score,
			testCase.comment
		);

		expect(result).toBe(undefined);

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

	const testCases = [
		{
			description: "Product Not Found",
			db_result: {
				message: "FOREIGN KEY constraint failed",
				name: "",
				stack: undefined,
			} as Error,
			expected: ProductNotFoundError,
			model: "notavalidmodel",
			username: "testuser",
			score: 5,
			comment: "lorem ipsum",
		},
		{
			description: "Review Already Exists",
			db_result: {
				message:
					"SQLITE_CONSTRAINT: UNIQUE constraint failed: review.Username, review.Model",
				name: "Error",
				stack: undefined,
			} as Error,
			expected: ExistingReviewError,
			model: "testmodel",
			username: "testuser",
			score: 5,
			comment: "lorem ipsum",
		},
	];

	for (const testCase of testCases) {
		test(testCase.description, async () => {
			jest.spyOn(db, "run").mockImplementationOnce(
				(query, values, cb) => {
					cb(testCase.db_result);
					return {} as Database;
				}
			);

			await expect(
				dao.addReview(
					testCase.model,
					testCase.username,
					testCase.score,
					testCase.comment
				)
			).rejects.toThrow(testCase.expected);

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
	}
});

describe("ReviewDAO - Get Product's Reviews", () => {
	const testCase = {
		db_result: {
			err: null as Error | null,
			rows: [
				{
					Model: "testmodel",
					Username: "testuser",
					Score: 5,
					Date: "2021-01-01",
					Comment: "lorem ipsum",
				},
				{
					Model: "testmodel",
					Username: "testuser2",
					Score: 5,
					Date: "2021-01-01",
					Comment: "lorem ipsum",
				},
			],
		},
		model: "testmodel",
		expected: [
			new ProductReview(
				"testmodel",
				"testuser",
				5,
				"2021-01-01",
				"lorem ipsum"
			),
			new ProductReview(
				"testmodel",
				"testuser2",
				5,
				"2021-01-01",
				"lorem ipsum"
			),
		],
	};

	test("Valid", async () => {
		jest.spyOn(db, "all").mockImplementationOnce((query, values, cb) => {
			cb(testCase.db_result.err, testCase.db_result.rows);
			return {} as Database;
		});

		const result = await dao.getProductReviews(testCase.model);
		expect(result).toStrictEqual(testCase.expected);

		expect(db.all).toBeCalledTimes(1);
		expect(db.all).toBeCalledWith(
			expect.any(String), // sql query
			expect.arrayContaining([testCase.model]),
			expect.any(Function)
		);
	});

	const testCase2 = {
		db_result: {
			err: null as Error | null,
			rows: [] as any[],
		},
		model: "notamodel",
		expected: ProductNotFoundError,
	};
	test("Product Not Found", async () => {
		jest.spyOn(db, "all").mockImplementationOnce((query, values, cb) => {
			cb(testCase2.db_result.err, testCase2.db_result.rows);
			return {} as Database;
		});

		try {
			await dao.getProductReviews(testCase2.model);
		} catch (err) {
			//console.log(err);
			expect(err).toBeInstanceOf(testCase2.expected);
		}
		expect(db.all).toBeCalledTimes(1);
		expect(db.all).toBeCalledWith(
			expect.any(String), // sql query
			expect.arrayContaining([testCase2.model]),
			expect.any(Function)
		);
	});
});

describe("ReviewDAO - Delete a Review", () => {
	const testCase = {
		model: "testmodel",
		user: "testuser",
		expected: undefined as void,
	};

	test("Valid", async () => {
		jest.spyOn(ProductDAO.prototype, "existsProduct").mockResolvedValueOnce(
			true
		);

		jest.spyOn(db, "run").mockImplementationOnce(function (
			query,
			values,
			cb
		) {
			cb.call({ changes: 1 }, null);
			return {} as Database;
		});

		const result = await dao.deleteReview(testCase.model, testCase.user);
		expect(result).toBe(testCase.expected);

		expect(db.run).toBeCalledTimes(1);
		expect(db.run).toBeCalledWith(
			expect.any(String), // sql query
			expect.arrayContaining([testCase.model, testCase.user]),
			expect.any(Function)
		);
	});

	test("Generic DB Error", async () => {
		jest.spyOn(db, "run").mockImplementationOnce((query, values, cb) => {
			cb.call({ changes: 0 }, new Error());
			return {} as Database;
		});

		await expect(
			dao.deleteReview(testCase.model, testCase.user)
		).rejects.toThrow();

		expect(db.run).toBeCalledTimes(1);
	});

	test("Review Not Found", async () => {
		jest.spyOn(db, "run").mockImplementationOnce((query, values, cb) => {
			cb.call({ changes: 0 }, null);
			return {} as Database;
		});

		await expect(
			dao.deleteReview(testCase.model, testCase.user)
		).rejects.toThrow(NoReviewProductError);

		expect(db.run).toBeCalledTimes(1);
		expect(db.run).toBeCalledWith(
			expect.any(String), // sql query
			expect.arrayContaining([testCase.model]),
			expect.any(Function)
		);
	});
});

describe("ReviewDAO - Delete All Reviews of a Product", () => {
	test("Valid", async () => {
		jest.spyOn(db, "run").mockImplementationOnce(function (
			query,
			values,
			cb
		) {
			cb(null);
			return {} as Database;
		});

		const result = await dao.deleteReviewsOfProduct("testmodel");
		expect(result).toBe(undefined);

		expect(db.run).toBeCalledTimes(1);
		expect(db.run).toBeCalledWith(
			expect.any(String), // sql query
			expect.arrayContaining(["testmodel"]),
			expect.any(Function)
		);
	});

	test("Generic DB Error", async () => {
		jest.spyOn(db, "run").mockImplementationOnce((query, values, cb) => {
			cb(new Error("generic error"));
			return {} as Database;
		});

		await expect(dao.deleteReviewsOfProduct("testmodel")).rejects.toThrow();

		expect(db.run).toBeCalledTimes(1);
	});

	test("Review Not Found", async () => {
		jest.spyOn(db, "run").mockImplementationOnce((query, values, cb) => {
			cb(new NoReviewProductError());
			return {} as Database;
		});

		await expect(
			dao.deleteReviewsOfProduct("testmodel")
		).rejects.toThrowError(NoReviewProductError);
		expect(db.run).toBeCalledTimes(1);
		expect(db.run).toBeCalledWith(
			expect.any(String), // sql query
			expect.arrayContaining(["testmodel"]),
			expect.any(Function)
		);
	});
});

describe("ReviewDAO - Delete All Reviews", () => {
	test("Valid", async () => {
		jest.spyOn(db, "run").mockImplementationOnce((query, cb) => {
			cb(null);
			return {} as Database;
		});

		const result = await dao.deleteAllReviews();
		expect(result).toBe(undefined);

		expect(db.run).toBeCalledTimes(1);
		expect(db.run).toBeCalledWith(
			expect.any(String), // sql query
			expect.any(Function) // callback
		);
	});

	test("Generic DB Error", async () => {
		jest.spyOn(db, "run").mockImplementationOnce((query, cb) => {
			cb(new Error("generic error"));
			return {} as Database;
		});

		await expect(dao.deleteAllReviews()).rejects.toThrow();

		expect(db.run).toBeCalledTimes(1);
	});
});
