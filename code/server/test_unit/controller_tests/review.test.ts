//@ts-nocheck

import { test, expect, jest, describe, beforeEach } from "@jest/globals";
import ReviewController from "../../src/controllers/reviewController";
import { Role, User } from "../../src/components/user";
import ReviewDAO from "../../src/dao/reviewDAO";

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
      description: "Delete Product Review by a User",
      func: "deleteReview",
      expected: undefined as void,
      args: (): [string, User] => [
        "testmodel",
        new User("testuser", "testname", "testsurname", Role.CUSTOMER, "", ""),
      ],
    },
    {
      description: "Delete All Reviews of a Product",
      func: "deleteReviewsOfProduct",
      expected: undefined as void,
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
});
