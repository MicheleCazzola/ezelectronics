import { test, expect, jest, beforeEach, describe } from "@jest/globals";
import request from "supertest";
import { app } from "../../index";
import ReviewController from "../../src/controllers/reviewController";
import { ProductNotFoundError } from "../../src/errors/productError";
import { ProductReview } from "../../src/components/review";
import Authenticator from "../../src/routers/auth";
import {
  ExistingReviewError,
  NoReviewProductError,
} from "../../src/errors/reviewError";

const baseURL = "/ezelectronics/reviews";
const mockMiddleware = jest.fn((req: any, res, next: any) => {
  req.user = "testuser";
  return next();
});

jest.mock("../../src/routers/auth");

beforeEach(() => {
  jest.clearAllMocks();

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

describe("ReviewRoute - Add Review", () => {
  beforeEach(() => {
    jest.spyOn(ReviewController.prototype, "addReview").mockReset();
  });

  const testReviews = [
		{
			description: "Valid",
			expectedStatus: 200,
			expectedCalls: 1,
			model: "iPhone13",
			user: "test1",
			score: 4,
			comment: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
		},
		{
			description: "Too low score",
			expectedStatus: 422,
			expectedCalls: 0,
			model: "iPhone13",
			user: "test2",
			score: 0,
			comment: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
		},
		{
			description: "Too high score",
			expectedStatus: 422,
			expectedCalls: 0,
			model: "iPhone13",
			user: "test2",
			score: 6,
			comment: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
		},
		//{
		//  description: "Empty model string",
		//  expectedStatus: 422, // returns 404 instead
		//  expectedCalls: 0,
		//  model: "",
		//  user: "test2",
		//  score: 2,
		//  comment: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
		//},
		{
			description: "Empty comment",
			expectedStatus: 422,
			expectedCalls: 0,
			model: "testmodel",
			user: "test2",
			score: 2,
			comment: "",
		},
		{
			description: "Null comment",
			expectedStatus: 422,
			expectedCalls: 0,
			model: "testmodel",
			user: "test2",
			score: 2,
			comment: null,
		},
  ];

  for (const testCase of testReviews) {
    test(testCase.description, async () => {
      jest
        .spyOn(ReviewController.prototype, "addReview")
        .mockResolvedValueOnce();

      const response = await request(app)
			.post(`${baseURL}/${testCase.model}`)
			.send({
				score: testCase.score,
				comment: testCase.comment,
			});

      expect(Authenticator.prototype.isLoggedIn).toHaveBeenCalledTimes(1);
      expect(Authenticator.prototype.isCustomer).toHaveBeenCalledTimes(1);

      expect(response.status).toBe(testCase.expectedStatus);
      expect(ReviewController.prototype.addReview).toHaveBeenCalledTimes(
        testCase.expectedCalls
      );
      if (testCase.expectedCalls > 0) {
        expect(ReviewController.prototype.addReview).toHaveBeenCalledWith(
          testCase.model,
          "testuser", // set in the middleware mock
          testCase.score,
          testCase.comment
        );
      }
    });
  }

  const testCases = [
    {
      description: "Product not found",
      expectedStatus: 404,
      err: new ProductNotFoundError(),
    },
    {
      description: "Review already exists",
      expectedStatus: 409,
      err: new ExistingReviewError(),
    },
  ];

  for (const testCase of testCases) {
    test(testCase.description, async () => {
      jest
        .spyOn(ReviewController.prototype, "addReview")
        .mockRejectedValueOnce(testCase.err);

      const response = await request(app).post(`${baseURL}/testmodel`).send({
        score: 1,
        comment: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
      });

      expect(Authenticator.prototype.isCustomer).toHaveBeenCalledTimes(1);
      expect(Authenticator.prototype.isLoggedIn).toHaveBeenCalledTimes(1);

      expect(response.status).toBe(testCase.expectedStatus);

      expect(ReviewController.prototype.addReview).toHaveBeenCalledTimes(1);
      expect(ReviewController.prototype.addReview).toHaveBeenCalledWith(
        "testmodel",
        "testuser", // set in the middleware mock
        1,
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit."
      );
    });
  }

  // Authentication is not tested
});

describe("ReviewRoute - Get a Product's Reviews", () => {
	test("Valid", async () => {
		const testCase = {
			expectedStatus: 200,
			model: "iPhone13",
		};
		const reviews = [
			new ProductReview(
				testCase.model,
				"test",
				5,
				"2024-05-12",
				"Lorem Ipsum"
			),
		];
		jest.spyOn(
			ReviewController.prototype,
			"getProductReviews"
		).mockResolvedValueOnce(reviews);

		const response = await request(app)
			.get(`${baseURL}/${testCase.model}`)
			.send();

		expect(Authenticator.prototype.isLoggedIn).toHaveBeenCalledTimes(1);

		expect(response.status).toBe(testCase.expectedStatus);

		expect(
			ReviewController.prototype.getProductReviews
		).toHaveBeenCalledTimes(1);
		expect(
			ReviewController.prototype.getProductReviews
		).toHaveBeenCalledWith(testCase.model);
		expect(response.body).toEqual(reviews);
	});

	test("Product Not Found", async () => {
		const testCase = {
			expectedStatus: 404,
			model: "test",
		};
		//jest.spyOn(ReviewController.prototype, "getProductReviews").mockReset();
		jest.spyOn(
			ReviewController.prototype,
			"getProductReviews"
		).mockRejectedValueOnce(new ProductNotFoundError());

		const response = await request(app)
			.get(`${baseURL}/${testCase.model}`)
			.send();

		expect(Authenticator.prototype.isLoggedIn).toHaveBeenCalledTimes(1);

		expect(response.status).toBe(testCase.expectedStatus);

		expect(
			ReviewController.prototype.getProductReviews
		).toHaveBeenCalledTimes(1);
		expect(
			ReviewController.prototype.getProductReviews
		).toHaveBeenCalledWith(testCase.model);
	});

	test("Review Already Exists", async () => {
		const testCase = {
			expectedStatus: 409,
			model: "testmodel",
		};

		jest.spyOn(
			ReviewController.prototype,
			"getProductReviews"
		).mockRejectedValueOnce(new ExistingReviewError());

		const response = await request(app)
			.get(`${baseURL}/${testCase.model}`)
			.send();

		expect(Authenticator.prototype.isLoggedIn).toHaveBeenCalledTimes(1);

		expect(response.status).toBe(testCase.expectedStatus);

		expect(
			ReviewController.prototype.getProductReviews
		).toHaveBeenCalledTimes(1);
		expect(
			ReviewController.prototype.getProductReviews
		).toHaveBeenCalledWith(testCase.model);
	});
	// Authentication is not tested
});

describe("ReviewRoute - Delete a Review", () => {
	const testCases = [
		{
			description: "Valid",
			expectedStatus: 200,
			model: "iPhone13",
			user: "testcustomer",
			err: null,
			called: 1,
		},
		{
			description: "Product Not Found",
			expectedStatus: 404,
			model: "notavalidproduct",
			user: "testcustomer",
			err: new ProductNotFoundError(),
			called: 1,
		},
		{
			description: "Product Not Reviewed",
			expectedStatus: 404,
			model: "notavalidproduct",
			user: "testcustomer",
			err: new NoReviewProductError(),
			called: 1,
		},
	];

	for (const testCase of testCases) {
		test(testCase.description, async () => {
			const delete_func = jest.spyOn(
				ReviewController.prototype,
				"deleteReview"
			);

			if (!testCase.err) delete_func.mockResolvedValueOnce();
			else delete_func.mockRejectedValueOnce(testCase.err);

			const response = await request(app)
				.delete(`${baseURL}/${testCase.model}`)
				.send();

			expect(Authenticator.prototype.isCustomer).toHaveBeenCalledTimes(1);
			expect(Authenticator.prototype.isLoggedIn).toHaveBeenCalledTimes(1);

			expect(response.status).toBe(testCase.expectedStatus);

			expect(
				ReviewController.prototype.deleteReview
			).toHaveBeenCalledTimes(testCase.called);
			if (testCase.called > 0) {
				expect(
					ReviewController.prototype.deleteReview
				).toHaveBeenCalledWith(
					testCase.model,
					"testuser" // set in the middleware mock
				);
			}
		});
	}
});

describe("ReviewRoute - Delete All Reviews of a Product", () => {
	const testCases = [
		{
			description: "Valid",
			expectedStatus: 200,
			model: "iPhone13",
			err: null,
			called: 1,
		},
		{
			description: "Product Not Found",
			expectedStatus: 404,
			model: "notavalidproduct",
			err: new ProductNotFoundError(),
			called: 1,
		},
	];

	for (const testCase of testCases) {
		test(testCase.description, async () => {
			const delete_func = jest.spyOn(
				ReviewController.prototype,
				"deleteReviewsOfProduct"
			);

			if (!testCase.err) delete_func.mockResolvedValueOnce();
			else delete_func.mockRejectedValueOnce(testCase.err);

			const response = await request(app)
				.delete(`${baseURL}/${testCase.model}/all`)
				.send();

			expect(Authenticator.prototype.isLoggedIn).toHaveBeenCalledTimes(1);
			expect(
				Authenticator.prototype.isAdminOrManager
			).toHaveBeenCalledTimes(1);

			expect(response.status).toBe(testCase.expectedStatus);

			expect(
				ReviewController.prototype.deleteReviewsOfProduct
			).toHaveBeenCalledTimes(testCase.called);
			if (testCase.called > 0) {
				expect(
					ReviewController.prototype.deleteReviewsOfProduct
				).toHaveBeenCalledWith(testCase.model);
			}
		});
	}
});

describe("ReviewRoute - Delete All Reviews", () => {
	test("Valid", async () => {
		jest.spyOn(
			ReviewController.prototype,
			"deleteAllReviews"
		).mockResolvedValueOnce();

		const response = await request(app).delete(`${baseURL}/`).send();

		expect(Authenticator.prototype.isLoggedIn).toHaveBeenCalledTimes(1);
		expect(Authenticator.prototype.isAdminOrManager).toHaveBeenCalledTimes(
			1
		);

		expect(response.status).toBe(200);

		expect(
			ReviewController.prototype.deleteAllReviews
		).toHaveBeenCalledTimes(1);
		expect(
			ReviewController.prototype.deleteAllReviews
		).toHaveBeenCalledWith();
	});
});
