//@ts-nocheck

import { test, expect, jest, describe, beforeEach } from "@jest/globals";
import ReviewController from "../../src/controllers/reviewController";
import { Role, User } from "../../src/components/user";
import ReviewDAO from "../../src/dao/reviewDAO";
import ProductDAO from "../../src/dao/productDAO";
import { ProductNotFoundError } from "../../src/errors/productError";

jest.mock("../../src/dao/reviewDAO");

beforeEach(() => {
  jest.clearAllMocks();
});

describe("Controller", () => {
  const testCases = [
    {
      description: "Add review",
      func: "addReview",
      expected: undefined as void,
      args: (): [string, User, number, string] => [
        "testmodel",
        new User("testuser", "testname", "testsurname", Role.CUSTOMER, "", ""),
        5,
        "lorem ipsum",
      ],
    },
    {
      description: "Get Product Reviews",
      func: "getProductReviews",
      expected: ["testmodel"],
      args: (): [string] => ["testmodel"],
    },
    {
      description: "Delete All Reviews",
      func: "deleteAllReviews",
      expected: undefined as void,
      args: (): [void] => [],
    },
  ];

  for (const testCase of testCases) {
    test(testCase.description, async () => {
      jest
        .spyOn(ReviewDAO.prototype, testCase.func as keyof ReviewDAO)
        .mockResolvedValueOnce(testCase.expected as any);
      const controller = new ReviewController();

      const result = await controller[testCase.func as keyof ReviewController](
        ...testCase.args()
      );
      expect(
        ReviewDAO.prototype[testCase.func as keyof ReviewDAO]
      ).toHaveBeenCalledTimes(1);
      expect(result).toBe(testCase.expected);
    });
  }

  const testCase2 = {
    expected: undefined as void,
    model: "testmodel",
    user: new User(
      "testuser",
      "testname",
      "testsurname",
      Role.CUSTOMER,
      "",
      ""
    ),
  };

  test("Delete Product Review by a User - Valid", async () => {
    jest
      .spyOn(ProductDAO.prototype, "existsProduct")
      .mockResolvedValueOnce(true);
    jest
      .spyOn(ReviewDAO.prototype, "deleteReview")
      .mockResolvedValueOnce(testCase2.expected);

    const controller = new ReviewController();
    const result = await controller.deleteReview(
      testCase2.model,
      testCase2.user
    );
    expect(ProductDAO.prototype.existsProduct).toHaveBeenCalledTimes(1);

    expect(ReviewDAO.prototype.deleteReview).toHaveBeenCalledTimes(1);
    expect(result).toBe(testCase2.expected);
  });

  test("Delete Product Review by a User - Product Not Found", async () => {
    jest
      .spyOn(ProductDAO.prototype, "existsProduct")
      .mockResolvedValueOnce(false);
    jest.spyOn(ReviewDAO.prototype, "deleteReview");

    const controller = new ReviewController();
    expect(
      controller.deleteReview(testCase2.model, testCase2.user)
    ).rejects.toThrowError(ProductNotFoundError);

    expect(ProductDAO.prototype.existsProduct).toHaveBeenCalledTimes(1);

    expect(ReviewDAO.prototype.deleteReview).toHaveBeenCalledTimes(0);
  });

  test("Delete All Reviews of a Product - Valid", async () => {
    jest
      .spyOn(ProductDAO.prototype, "existsProduct")
      .mockResolvedValueOnce(true);
    jest
      .spyOn(ReviewDAO.prototype, "deleteReviewsOfProduct")
      .mockResolvedValueOnce(testCase2.expected);

    const controller = new ReviewController();
    const result = await controller.deleteReviewsOfProduct(testCase2.model);
    expect(ProductDAO.prototype.existsProduct).toHaveBeenCalledTimes(1);

    expect(ReviewDAO.prototype.deleteReviewsOfProduct).toHaveBeenCalledTimes(1);
    expect(result).toBe(testCase2.expected);
  });

  test("Delete All Reviews of a Product - Product Not Found", async () => {
    jest
      .spyOn(ProductDAO.prototype, "existsProduct")
      .mockResolvedValueOnce(false);
    jest.spyOn(ReviewDAO.prototype, "deleteReviewsOfProduct");

    const controller = new ReviewController();
    expect(controller.deleteReview(testCase2.model)).rejects.toThrowError(
      ProductNotFoundError
    );

    expect(ProductDAO.prototype.existsProduct).toHaveBeenCalledTimes(1);

    expect(ReviewDAO.prototype.deleteReviewsOfProduct).toHaveBeenCalledTimes(0);
  });
});
