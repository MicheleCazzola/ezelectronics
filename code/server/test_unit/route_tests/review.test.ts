import { test, expect, jest } from "@jest/globals";
import request from "supertest";
import { app } from "../../index";
import ReviewController from "../../src/controllers/reviewController";
import Authenticator from "../../src/routers/auth";
import { ProductNotFoundError } from "../../src/errors/productError";
import { ProductReview } from "../../src/components/review";

const baseURL = "/ezelectronics/reviews";

// Skipped because the middleware mocks are not working
// Test passes if the authentication is manually commented-out from the route's code

beforeEach(() => {
  jest.resetAllMocks();
  //jest.clearAllMocks();
  //jest.resetModules();
  //jest.clearAllTimers();

  // Middleware mocks not working
  jest
    .spyOn(Authenticator.prototype, "isCustomer")
    .mockImplementation((req: any, res: any, next: any) => next());

  jest
    .spyOn(Authenticator.prototype, "isLoggedIn")
    .mockImplementation((req: any, res: any, next: any) => next());
});

describe.skip("Route - Add Review", () => {
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
      description: "Out-of-range score",
      expectedStatus: 422,
      expectedCalls: 0,
      model: "iPhone13",
      user: "test2",
      score: 0,
      comment: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
    },
  ];

  for (let testCase of testReviews) {
    test(testCase.description, async () => {
      jest
        .spyOn(ReviewController.prototype, "addReview")
        .mockResolvedValueOnce();

      const response = await request(app)
        .post(`${baseURL}/${testCase.model}`)
        .query({ user: testCase.user })
        .send({
          score: testCase.score,
          comment: testCase.comment,
        });

      //expect(Authenticator.prototype.isCustomer).toHaveBeenCalledTimes(1);
      //expect(Authenticator.prototype.isLoggedIn).toHaveBeenCalledTimes(1);

      expect(response.status).toBe(testCase.expectedStatus);
      expect(ReviewController.prototype.addReview).toHaveBeenCalledTimes(
        testCase.expectedCalls
      );
      if (testCase.expectedCalls > 0) {
        expect(ReviewController.prototype.addReview).toHaveBeenCalledWith(
          testCase.model,
          undefined, // not `testReview.user` because I'm mocking the authentication
          testCase.score,
          testCase.comment
        );
      }
    });
  }

  test("Product Not Found", async () => {
    jest
      .spyOn(ReviewController.prototype, "addReview")
      .mockRejectedValueOnce(new ProductNotFoundError());

    const response = await request(app)
      .post(`${baseURL}/notAProduct`)
      .query({ user: "test3" })
      .send({
        score: 1,
        comment: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
      });

    //expect(Authenticator.prototype.isCustomer).toHaveBeenCalledTimes(1);
    //expect(Authenticator.prototype.isLoggedIn).toHaveBeenCalledTimes(1);

    expect(response.status).toBe(404);
    expect(ReviewController.prototype.addReview).toHaveBeenCalledTimes(1);
    expect(ReviewController.prototype.addReview).toHaveBeenCalledWith(
      "notAProduct",
      undefined, // not `testReview.user` because I'm mocking the authentication
      1,
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit."
    );
  });

  // Authentication is not tested
});

describe.skip("Route - Fetch All Product Reviews", () => {
  test("Valid", async () => {
    const testCase = {
      expectedStatus: 200,
      model: "iPhone13",
    };
    jest
      .spyOn(ReviewController.prototype, "getProductReviews")
      .mockResolvedValueOnce([
        new ProductReview(
          testCase.model,
          "test",
          5,
          "2024-05-12",
          "Lorem Ipsum"
        ),
      ]);

    const response = await request(app)
      .get(`${baseURL}/${testCase.model}`)
      .send();

    //expect(Authenticator.prototype.isCustomer).toHaveBeenCalledTimes(1);
    //expect(Authenticator.prototype.isLoggedIn).toHaveBeenCalledTimes(1);

    expect(response.status).toBe(testCase.expectedStatus);
    console.log(response.body);

    expect(ReviewController.prototype.getProductReviews).toHaveBeenCalledTimes(
      1
    );
    expect(ReviewController.prototype.getProductReviews).toHaveBeenCalledWith(
      testCase.model
    );
  });

  test("Product Not Found", async () => {
    const testCase = {
      expectedStatus: 404,
      model: "test",
    };
    jest
      .spyOn(ReviewController.prototype, "getProductReviews")
      .mockRejectedValueOnce(new ProductNotFoundError());

    const response = await request(app)
      .get(`${baseURL}/${testCase.model}`)
      .send();

    //expect(Authenticator.prototype.isCustomer).toHaveBeenCalledTimes(1);
    //expect(Authenticator.prototype.isLoggedIn).toHaveBeenCalledTimes(1);

    expect(response.status).toBe(testCase.expectedStatus);
    console.log(response.body);

    expect(ReviewController.prototype.getProductReviews).toHaveBeenCalledTimes(
      1
    );
    expect(ReviewController.prototype.getProductReviews).toHaveBeenCalledWith(
      testCase.model
    );
  });

  // Authentication is not tested
});
